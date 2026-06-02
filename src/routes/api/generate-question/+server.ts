import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateQuestionSchema } from '$lib/data/schemas';
import { api, convex } from '$lib/services/convexClient';

type OptionKey = 'A' | 'B' | 'C' | 'D';
type GeneratedMCQ = {
	question: string;
	options: Record<OptionKey, string>;
	correct?: OptionKey;
	answer?: OptionKey;
	explanations?: Record<string, string>;
	explanation?: string;
	examiner_note?: string;
	topic?: string;
	course?: string;
	questionHash?: string;
	selectionKey?: string;
};

// ─── Edge-compatible in-memory rate limiter ───────────────────────────────────
// Uses a Map keyed by IP or UID, pruned every 10 minutes to prevent memory leaks.
const rateLimitFallback = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1 minute window
const FREE_LIMIT = 60;    // Enough headroom for a full timed mock exam.
const PRO_LIMIT  = 180;   // Higher burst allowance for pro users and instructors.

// Prune stale entries periodically (edge-safe, no node:timers needed)
function checkAndPrune(key: string, limit: number): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const entry = rateLimitFallback.get(key);

	if (!entry || now - entry.windowStart > WINDOW_MS) {
		// Fresh window
		rateLimitFallback.set(key, { count: 1, windowStart: now });
		return { allowed: true, remaining: limit - 1 };
	}

	if (entry.count >= limit) {
		return { allowed: false, remaining: 0 };
	}

	entry.count++;
	return { allowed: true, remaining: limit - entry.count };
}

function hashString(input: string) {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
	}
	return Math.abs(hash).toString(36);
}

function buildSelectionKey(input: {
	institutionType: string;
	faculty?: string;
	department?: string;
	level: string;
	course: string;
	topic?: string;
	examType?: string;
	difficulty?: string;
}) {
	return [
		input.institutionType,
		input.faculty || 'any-faculty',
		input.department || 'any-department',
		input.level,
		input.course,
		input.topic || 'general',
		input.examType || 'practice',
		input.difficulty || 'mixed'
	].map((part) => part.trim().toLowerCase()).join('|');
}

function shuffleItems<T>(items: T[]) {
	const next = [...items];
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[next[i], next[j]] = [next[j], next[i]];
	}
	return next;
}

function normalizeMCQ(raw: GeneratedMCQ): GeneratedMCQ {
	const canonicalKeys: OptionKey[] = ['A', 'B', 'C', 'D'];
	const originalCorrect = raw.correct || raw.answer || 'A';
	const entries = canonicalKeys.map((key) => ({
		originalKey: key,
		value: raw.options[key],
		explanation: raw.explanations?.[key]
	}));
	const shuffled = shuffleItems(entries);
	const remappedOptions = Object.fromEntries(
		shuffled.map((entry, index) => [canonicalKeys[index], entry.value])
	) as Record<OptionKey, string>;
	const correctIndex = shuffled.findIndex((entry) => entry.originalKey === originalCorrect);
	const remappedCorrect = canonicalKeys[Math.max(0, correctIndex)];
	const remappedExplanations: Record<string, string> = {};

	if (raw.explanations?.correct) remappedExplanations.correct = raw.explanations.correct;
	shuffled.forEach((entry, index) => {
		if (entry.explanation) remappedExplanations[canonicalKeys[index]] = entry.explanation;
	});

	return {
		...raw,
		options: remappedOptions,
		correct: remappedCorrect,
		answer: remappedCorrect,
		explanations: Object.keys(remappedExplanations).length > 0 ? remappedExplanations : raw.explanations
	};
}

function prepareQuestionForDelivery<T extends Record<string, unknown>>(
	raw: T,
	selectionKey: string,
	questionType: 'MCQ' | 'Theory'
) {
	const questionText = String(raw.question || '');
	const topic = String(raw.topic || 'General');
	const questionHash = hashString(`${selectionKey}:${topic}:${questionText}`);
	const enriched = {
		...raw,
		topic,
		questionHash,
		selectionKey,
		generatedAt: Date.now()
	};

	if (questionType === 'MCQ' && raw.options && typeof raw.options === 'object') {
		return normalizeMCQ(enriched as unknown as GeneratedMCQ);
	}

	return enriched;
}

// ─── Plan verification against Firestore ─────────────────────────────────────
// This runs server-side on the Cloudflare Edge. We call the Firebase REST API
// directly (no SDK — keeps the bundle edge-compatible and small).
async function getUserPlanFromFirestore(
	uid: string,
	projectId: string,
	apiKey: string
): Promise<'free' | 'pro'> {
	try {
		const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?key=${apiKey}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
		if (!res.ok) return 'free';
		const doc = await res.json() as { fields?: { plan?: { stringValue?: string } } };
		const plan = doc.fields?.plan?.stringValue;
		if (plan === 'pro') return 'pro';
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

		const {
			course,
			level,
			institutionType,
			faculty,
			department,
			topic,
			examType,
			difficulty,
			type,
			sessionId,
			excludeHashes,
			uid
		} = validation.data;
		const safeLevel = level || '100 Level';
		const selectionKey = buildSelectionKey({
			institutionType,
			faculty,
			department,
			level: safeLevel,
			course,
			topic,
			examType,
			difficulty
		});

		// Get Cloudflare env bindings
		const env = platform?.env as Record<string, string> | undefined;
		const apiKey        = env?.ANTHROPIC_API_KEY || '';
		const fbApiKey      = env?.PUBLIC_FIREBASE_API_KEY || (await importPublicEnv('PUBLIC_FIREBASE_API_KEY'));
		const fbProjectId   = env?.PUBLIC_FIREBASE_PROJECT_ID || (await importPublicEnv('PUBLIC_FIREBASE_PROJECT_ID'));

		// ── Plan verification ───────────────────────────────────────────────
		let userPlan: 'free' | 'pro' = 'free';
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
						? 'Question generation is busy. Please wait a minute or upgrade for higher throughput.'
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

		// ── AI generation or Bank lookup with Orchestration ────────────────
		
		// 1. Attempt to find matching questions in the bank for randomization
		let existingQuestion = null;
		try {
			// Only try to fetch if not a custom "Other" request (those should usually be generated fresh to grow the bank for new topics)
			if (course !== 'Other' && topic !== 'Other') {
				existingQuestion = await convex.query(api.academic.getRandomQuestion, {
					course,
					level: safeLevel,
					institutionType,
					faculty,
					department,
					topic: (topic && topic !== 'all') ? topic : undefined,
					examType,
					difficulty,
					excludeHashes,
					type: questionType as 'MCQ' | 'Theory'
				});
			}
		} catch (err) {
			console.error('[CollegeCBT] Bank lookup failed:', err);
		}

		// 2. Decide: serve existing or generate new?
		// We serve existing with a 70% probability if it's a standard request and we HAVE questions.
		// We ALWAYS generate if it's an "Other" request or we have no bank matches.
		// User specifically wants to grow the bank, so we still generate 30% of the time even if found.
		const shouldGenerate = !existingQuestion || Math.random() < 0.3 || course === 'Other' || topic === 'Other';

		if (!shouldGenerate && existingQuestion) {
			await convex.mutation(api.academic.incrementQuestionHit, { id: existingQuestion._id });
			return json(
				prepareQuestionForDelivery(JSON.parse(existingQuestion.content), selectionKey, questionType as 'MCQ' | 'Theory'),
				{ headers: responseHeaders }
			);
		}

		// 3. AI Generation (hitting token limits to grow the bank)
		if (!apiKey || apiKey.includes('placeholder') || !apiKey.startsWith('sk-ant-')) {
			return json(
				prepareQuestionForDelivery(
					questionType === 'Theory'
						? getDemoTheory(course, topic, examType)
						: getDemoMCQ(course, topic, examType),
					selectionKey,
					questionType as 'MCQ' | 'Theory'
				),
				{ headers: responseHeaders }
			);
		}

		const prompt = questionType === 'Theory'
			? buildTheoryPrompt(course, safeLevel, institutionType, faculty, department, topic, examType, difficulty, sessionId)
			: buildMCQPrompt(course, safeLevel, institutionType, faculty, department, topic, examType, difficulty, sessionId, excludeHashes);

		const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
			signal: AbortSignal.timeout(8_000)
		});

		if (!aiResponse.ok) {
			console.error('[CollegeCBT] Anthropic API error:', aiResponse.status);
			// Fallback to bank if possible before demo
			if (existingQuestion) {
				return json(
					prepareQuestionForDelivery(JSON.parse(existingQuestion.content), selectionKey, questionType as 'MCQ' | 'Theory'),
					{ headers: responseHeaders }
				);
			}
			return json(
				prepareQuestionForDelivery(
					questionType === 'Theory'
						? getDemoTheory(course, topic, examType)
						: getDemoMCQ(course, topic, examType),
					selectionKey,
					questionType as 'MCQ' | 'Theory'
				),
				{ headers: responseHeaders }
			);
		}

		const data = await aiResponse.json() as { content: { type: string; text?: string }[] };
		const rawText = data.content.filter((b) => b.type === 'text').map((b) => b.text || '').join('');

		try {
			const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
			const parsed = prepareQuestionForDelivery(JSON.parse(cleaned), selectionKey, questionType as 'MCQ' | 'Theory');

			// 4. Archive into the Question Bank for future randomization
			// We do this in a fire-and-forget or awaited mutation to grow the bank.
			await convex.mutation(api.academic.saveGeneratedQuestion, {
				course: parsed.course || course,
				level: safeLevel,
				institutionType,
				faculty,
				department,
				topic: parsed.topic || topic || 'General',
				examType,
				difficulty: difficulty || 'mixed',
				type: questionType as 'MCQ' | 'Theory',
				content: JSON.stringify(parsed),
				provider: 'claude-3-5-haiku',
				questionHash: String(parsed.questionHash || ''),
				selectionKey,
				isOther: course === 'Other' || topic === 'Other',
				userId: uid
			});

			return json(parsed, { headers: responseHeaders });
		} catch {
			if (existingQuestion) {
				return json(
					prepareQuestionForDelivery(JSON.parse(existingQuestion.content), selectionKey, questionType as 'MCQ' | 'Theory'),
					{ headers: responseHeaders }
				);
			}
			return json(
				prepareQuestionForDelivery(
					questionType === 'Theory'
						? getDemoTheory(course, topic, examType)
						: getDemoMCQ(course, topic, examType),
					selectionKey,
					questionType as 'MCQ' | 'Theory'
				),
				{ headers: responseHeaders }
			);
		}

	} catch (err) {
		console.error('[CollegeCBT] Question generation fatal error:', err);
		return json(
			{
				...prepareQuestionForDelivery(getDemoMCQ('General'), 'fallback|general', 'MCQ'),
				fallback: true
			},
			{ status: 200 }
		);
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
	course: string,
	level: string,
	instType: string,
	faculty?: string,
	department?: string,
	topic?: string,
	examType?: string,
	difficulty?: string,
	sessionId?: string,
	excludeHashes: string[] = []
): string {
	const topicLine = topic ? ` Specific topic: ${topic}.` : '';
	const diffLine  = difficulty && difficulty !== 'mixed' ? ` Difficulty: ${difficulty}.` : '';
	const deptLine = department ? ` Department: ${department}.` : '';
	const facultyLine = faculty ? ` Faculty/School: ${faculty}.` : '';
	const examLine = examType ? ` Exam type: ${examType}.` : ' Exam type: adaptive practice.';
	const antiRepeat = excludeHashes.length > 0
		? ` Avoid repeating concepts from these recent hashes: ${excludeHashes.slice(0, 12).join(', ')}.`
		: '';
	return `You are the CollegeCBT AI Exam Agent for a Nigerian ${instType}. Generate ONE exam-standard multiple-choice question for: "${course}" at ${level} level.${facultyLine}${deptLine}${topicLine}${examLine}${diffLine} Session: ${sessionId || 'practice'}.${antiRepeat}

Requirements:
- Contextual to Nigerian academic curriculum
- Strictly specific to the selected institution type, faculty, department, level, course, topic, and exam type
- Use a fresh scenario, number, case, definition angle, or application pattern every time
- One unambiguously correct answer
- Three plausible but incorrect options based on common student mistakes
- Full explanations for each option

Return ONLY valid JSON (no markdown, no backticks, no extra text):
{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanations":{"correct":"Why this is correct.","A":"Why A is right/wrong.","B":"Common mistake about B.","C":"Common mistake about C.","D":"Common mistake about D."},"examiner_note":"What this question tests and a common student error.","topic":"${topic || 'General'}"}`;
}

function buildTheoryPrompt(
	course: string,
	level: string,
	instType: string,
	faculty?: string,
	department?: string,
	topic?: string,
	examType?: string,
	difficulty?: string,
	sessionId?: string
): string {
	const topicLine = topic ? ` Specific topic: ${topic}.` : '';
	const diffLine  = difficulty && difficulty !== 'mixed' ? ` Difficulty: ${difficulty}.` : '';
	const deptLine = department ? ` Department: ${department}.` : '';
	const facultyLine = faculty ? ` Faculty/School: ${faculty}.` : '';
	const examLine = examType ? ` Exam type: ${examType}.` : ' Exam type: adaptive practice.';
	return `You are the CollegeCBT AI Theory Tutor for a Nigerian ${instType}. Generate ONE essay/theory question for: "${course}" at ${level} level.${facultyLine}${deptLine}${topicLine}${examLine}${diffLine} Session: ${sessionId || 'practice'}.

Requirements:
- Contextual to Nigerian academic curriculum and examination standards
- Strictly specific to the selected faculty, department, level, course, topic, and exam type
- Clear marking scheme with point allocation
- Comprehensive model answer

Return ONLY valid JSON (no markdown, no backticks):
{"question":"...","key_points":[{"point":"...","marks":4}],"model_answer":"150-200 word model answer contextual to Nigeria...","examiner_notes":"What examiners specifically look for.","mark_scheme":"Total marks with allocation breakdown.","topic":"${topic || 'General'}"}`;
}

// ─── Demo Fallbacks ───────────────────────────────────────────────────────────
function getDemoMCQ(course: string, topic = 'Core Concepts', examType = 'Practice') {
	const scenarios = [
		'a student project team',
		'a Nigerian campus records office',
		'a small fintech training task',
		'a departmental practical class',
		'a CBT revision session'
	];
	const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
	const caseId = Math.floor(Math.random() * 900) + 100;
	return {
		question: `For a ${examType} question in ${course}, case ${caseId}: which statement best applies "${topic}" to ${scenario}?`,
		options: {
			A: `It connects the core principle in ${topic} to a real use case, explains the mechanism, and states the expected outcome.`,
			B: `It lists unrelated definitions from ${course} without applying them to the selected topic.`,
			C: `It focuses only on memorising terminology and ignores the level-specific application required by the examiner.`,
			D: `It replaces the selected topic with a broad general discussion that cannot be scored precisely.`
		},
		correct: 'A',
		explanations: {
			correct: 'A strong exam answer must apply the selected topic to a concrete context and explain the result.',
			A: 'Correct — it is topic-specific, applied, and measurable.',
			B: 'This is too broad and does not prove understanding of the selected topic.',
			C: 'This misses the examiner focus on application and level-appropriate reasoning.',
			D: 'This drifts away from the selected course/topic combination.'
		},
		examiner_note: `This fallback is generated only when the live AI provider is unavailable. It still preserves the selected course, topic, and exam type for scoring practice.`,
		topic
	};
}

function getDemoTheory(course: string, topic = 'Applied Concepts', examType = 'Practice') {
	const contexts = ['a Nigerian higher institution', 'a departmental case study', 'a professional training setting', 'a final-year project review'];
	const context = contexts[Math.floor(Math.random() * contexts.length)];
	return {
		question: `With reference to ${course}, discuss how "${topic}" should be applied in ${context} for a ${examType}. Support your answer with relevant examples. (20 marks)`,
		key_points: [
			{ point: 'Define the core concept with academic precision, citing at least one scholarly definition.', marks: 4 },
			{ point: 'Explain at least 3 practical applications within the Nigerian professional context.', marks: 6 },
			{ point: 'Provide specific, verifiable examples from Nigeria (institutions, industries, or case studies).', marks: 6 },
			{ point: 'Critically evaluate limitations or challenges faced in the Nigerian operating environment.', marks: 4 }
		],
		model_answer: `The field of ${course} encompasses foundational principles that inform both theoretical understanding and practical application within the Nigerian academic and professional landscape. These principles guide practitioners across Nigeria's key sectors including telecommunications, financial services, healthcare, and public administration.\n\nIn Nigeria, these concepts are applied daily within organizations such as the Central Bank of Nigeria, NNPC, NCC, and leading universities. However, practical challenges persist — including inadequate infrastructure, skills gaps in rural areas, and policy inconsistencies. Addressing these through targeted education, organizational reform, and private-sector partnerships remains critical.`,
		examiner_notes: 'Award marks for academic structure, clarity of definition, relevance to Nigerian context, and use of specific local examples. Penalise vague generalities.',
		mark_scheme: 'Total: 20 marks. Definition & scholarly citation: 4m. Practical applications (3 minimum): 6m. Specific Nigerian examples: 6m. Critical evaluation of limitations: 4m.',
		topic
	};
}
