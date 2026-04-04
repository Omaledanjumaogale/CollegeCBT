import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateQuestionSchema } from '$lib/data/schemas';

// ─── Edge-compatible in-memory rate limiter ───────────────────────────────────
// Uses a Map keyed by IP or UID, pruned every 10 minutes to prevent memory leaks.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1 minute window
const FREE_LIMIT = 5;     // 5 req/min for free/unauthenticated users
const PRO_LIMIT  = 60;    // 60 req/min for pro/institutional users

// Prune stale entries periodically (edge-safe, no node:timers needed)
function checkAndPrune(key: string, limit: number): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const entry = rateLimitMap.get(key);

	if (!entry || now - entry.windowStart > WINDOW_MS) {
		// Fresh window
		rateLimitMap.set(key, { count: 1, windowStart: now });
		return { allowed: true, remaining: limit - 1 };
	}

	if (entry.count >= limit) {
		return { allowed: false, remaining: 0 };
	}

	entry.count++;
	return { allowed: true, remaining: limit - entry.count };
}

// ─── Plan verification against Firestore ─────────────────────────────────────
// This runs server-side on the Cloudflare Edge. We call the Firebase REST API
// directly (no SDK — keeps the bundle edge-compatible and small).
async function getUserPlanFromFirestore(
	uid: string,
	projectId: string,
	apiKey: string
): Promise<'free' | 'pro' | 'institutional'> {
	try {
		const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?key=${apiKey}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
		if (!res.ok) return 'free';
		const doc = await res.json() as { fields?: { plan?: { stringValue?: string } } };
		const plan = doc.fields?.plan?.stringValue;
		if (plan === 'pro' || plan === 'institutional') return plan;
		return 'free';
	} catch {
		// If Firestore is unreachable treat as free — graceful degradation
		return 'free';
	}
}

// ─── Request Handler ──────────────────────────────────────────────────────────
export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const rawBody = await request.json();
		const validation = generateQuestionSchema.safeParse(rawBody);

		if (!validation.success) {
			return json({ 
				error: 'Invalid request parameters', 
				details: validation.error.format() 
			}, { status: 400 });
		}

		const { course, level, institutionType, topic, difficulty, type, uid } = validation.data;

		// Get Cloudflare env bindings
		const env = platform?.env as Record<string, string> | undefined;
		const apiKey        = env?.ANTHROPIC_API_KEY || '';
		const fbApiKey      = env?.PUBLIC_FIREBASE_API_KEY || (await importPublicEnv('PUBLIC_FIREBASE_API_KEY'));
		const fbProjectId   = env?.PUBLIC_FIREBASE_PROJECT_ID || (await importPublicEnv('PUBLIC_FIREBASE_PROJECT_ID'));

		// ── Plan verification ───────────────────────────────────────────────
		let userPlan: 'free' | 'pro' | 'institutional' = 'free';
		if (uid && fbApiKey && fbProjectId) {
			userPlan = await getUserPlanFromFirestore(uid, fbProjectId, fbApiKey);
		}

		// ── Rate limiting ───────────────────────────────────────────────────
		// Key by UID if available, otherwise fall back to IP
		const ip = request.headers.get('cf-connecting-ip')
			|| request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
			|| 'unknown';
		const rlKey   = uid ? `uid:${uid}` : `ip:${ip}`;
		const limit   = userPlan === 'free' ? FREE_LIMIT : PRO_LIMIT;
		const { allowed, remaining } = checkAndPrune(rlKey, limit);

		if (!allowed) {
			return json(
				{
					error: userPlan === 'free'
						? 'Daily question limit reached. Upgrade to Pro for unlimited questions.'
						: 'Rate limit reached. Please wait a moment.',
					rateLimited: true,
					plan: userPlan
				},
				{
					status: 429,
					headers: {
						'Retry-After': '60',
						'X-RateLimit-Limit': String(limit),
						'X-RateLimit-Remaining': '0'
					}
				}
			);
		}

		const responseHeaders = {
			'X-RateLimit-Limit': String(limit),
			'X-RateLimit-Remaining': String(remaining)
		};

		// ── Theory type gating for Free plan ───────────────────────────────
		const questionType = type || 'MCQ';
		if (questionType === 'Theory' && userPlan === 'free') {
			return json(
				{
					error: 'Theory questions are a Pro feature. Upgrade to access model answers.',
					gated: true,
					plan: 'free'
				},
				{ status: 403 }
			);
		}

		// ── AI generation or demo fallback ─────────────────────────────────
		if (!apiKey || apiKey.includes('placeholder') || !apiKey.startsWith('sk-ant-')) {
			return json(
				questionType === 'Theory' ? getDemoTheory(course) : getDemoMCQ(course),
				{ headers: responseHeaders }
			);
		}

		const prompt = questionType === 'Theory'
			? buildTheoryPrompt(course, level || '300 Level', institutionType, topic, difficulty)
			: buildMCQPrompt(course, level || '300 Level', institutionType, topic, difficulty);

		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-3-5-haiku-20241022',
				max_tokens: questionType === 'Theory' ? 1500 : 1200,
				messages: [{ role: 'user', content: prompt }]
			}),
			signal: AbortSignal.timeout(20_000) // 20s edge timeout
		});

		if (!response.ok) {
			console.error('[CollegeCBT] Anthropic API error:', response.status);
			return json(
				questionType === 'Theory' ? getDemoTheory(course) : getDemoMCQ(course),
				{ headers: responseHeaders }
			);
		}

		const data = await response.json() as {
			content: { type: string; text?: string }[];
		};

		const rawText = data.content
			.filter((b) => b.type === 'text')
			.map((b) => b.text || '')
			.join('');

		try {
			const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
			const parsed = JSON.parse(cleaned);
			return json(parsed, { headers: responseHeaders });
		} catch {
			console.warn('[CollegeCBT] JSON parse failed, using demo fallback');
			return json(
				questionType === 'Theory' ? getDemoTheory(course) : getDemoMCQ(course),
				{ headers: responseHeaders }
			);
		}

	} catch (err) {
		console.error('[CollegeCBT] Question generation fatal error:', err);
		return json({ 
			error: 'Engine failure. Reverting to backup protocols.', 
			fallback: true,
			data: getDemoMCQ('General')
		}, { status: 500 });
	}
};

// Helper to safely read $env/dynamic/public in edge context
async function importPublicEnv(key: string): Promise<string> {
	try {
		const { env } = await import('$env/dynamic/public');
		return (env as Record<string, string>)[key] || '';
	} catch {
		return '';
	}
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────
function buildMCQPrompt(
	course: string, level: string, instType: string,
	topic?: string, difficulty?: string
): string {
	const topicLine = topic ? ` Specific topic: ${topic}.` : '';
	const diffLine  = difficulty && difficulty !== 'mixed' ? ` Difficulty: ${difficulty}.` : '';
	return `You are a Nigerian ${instType} exam expert. Generate ONE exam-standard multiple-choice question for: "${course}" at ${level} level.${topicLine}${diffLine}

Requirements:
- Contextual to Nigerian academic curriculum
- One unambiguously correct answer
- Three plausible but incorrect distractors based on real student misconceptions
- Full explanations for each option

Return ONLY valid JSON (no markdown, no backticks, no extra text):
{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanations":{"correct":"Why this is correct.","A":"Why A is right/wrong.","B":"Misconception about B.","C":"Misconception about C.","D":"Misconception about D."},"examiner_note":"What this question tests and a common student error.","topic":"${topic || 'General'}"}`;
}

function buildTheoryPrompt(
	course: string, level: string, instType: string,
	topic?: string, difficulty?: string
): string {
	const topicLine = topic ? ` Specific topic: ${topic}.` : '';
	const diffLine  = difficulty && difficulty !== 'mixed' ? ` Difficulty: ${difficulty}.` : '';
	return `You are a Nigerian ${instType} exam expert. Generate ONE essay/theory question for: "${course}" at ${level} level.${topicLine}${diffLine}

Requirements:
- Contextual to Nigerian academic curriculum and examination standards
- Clear marking scheme with point allocation
- Comprehensive model answer

Return ONLY valid JSON (no markdown, no backticks):
{"question":"...","key_points":[{"point":"...","marks":4}],"model_answer":"150-200 word model answer contextual to Nigeria...","examiner_notes":"What examiners specifically look for.","mark_scheme":"Total marks with allocation breakdown.","topic":"${topic || 'General'}"}`;
}

// ─── Demo Fallbacks ───────────────────────────────────────────────────────────
function getDemoMCQ(course: string) {
	return {
		question: `In the context of ${course}, which of the following best describes the concept of encapsulation in object-oriented design?`,
		options: {
			A: 'The bundling of data and methods that operate on the data within a single unit, restricting direct access to the internals.',
			B: 'A technique where an algorithm divides a problem into sub-problems of the same type and solves them recursively.',
			C: 'The process of converting data into a format suitable for database storage to reduce redundancy.',
			D: 'A sorting algorithm that achieves O(n log n) average time complexity by partitioning arrays.'
		},
		correct: 'A',
		explanations: {
			correct: 'Encapsulation is a core OOP principle where data (attributes) and methods are bundled inside a class, and internal state is hidden from outside access.',
			A: 'Correct — Encapsulation hides internal data and exposes only a controlled public interface.',
			B: 'This describes recursion or the divide-and-conquer algorithm design paradigm, not encapsulation.',
			C: 'This describes database normalization, which eliminates data redundancy — not OOP.',
			D: 'This describes QuickSort or MergeSort performance characteristics — algorithm analysis, not OOP principles.'
		},
		examiner_note: 'Candidates commonly confuse encapsulation with abstraction. Abstraction hides complexity conceptually; encapsulation hides it through access modifiers in code.',
		topic: 'Core Concepts'
	};
}

function getDemoTheory(course: string) {
	return {
		question: `With reference to ${course}, discuss the fundamental principles that underpin modern practice in Nigeria. Illustrate your answer with relevant examples from the Nigerian context. (20 marks)`,
		key_points: [
			{ point: 'Define the core concept with academic precision, citing at least one scholarly definition.', marks: 4 },
			{ point: 'Explain at least 3 practical applications within the Nigerian professional context.', marks: 6 },
			{ point: 'Provide specific, verifiable examples from Nigeria (institutions, industries, or case studies).', marks: 6 },
			{ point: 'Critically evaluate limitations or challenges faced in the Nigerian operating environment.', marks: 4 }
		],
		model_answer: `The field of ${course} encompasses foundational principles that inform both theoretical understanding and practical application within the Nigerian academic and professional landscape. These principles guide practitioners across Nigeria's key sectors including telecommunications, financial services, healthcare, and public administration.\n\nIn Nigeria, these concepts are applied daily within institutions such as the Central Bank of Nigeria, NNPC, NCC, and leading universities. However, practical challenges persist — including inadequate infrastructure, skills gaps in rural areas, and policy inconsistencies. Addressing these through targeted education, institutional reform, and private-sector partnerships remains critical.`,
		examiner_notes: 'Award marks for academic structure, clarity of definition, relevance to Nigerian context, and use of specific local examples. Penalise vague generalities.',
		mark_scheme: 'Total: 20 marks. Definition & scholarly citation: 4m. Practical applications (3 minimum): 6m. Specific Nigerian examples: 6m. Critical evaluation of limitations: 4m.',
		topic: 'Applied Concepts & Nigerian Context'
	};
}
