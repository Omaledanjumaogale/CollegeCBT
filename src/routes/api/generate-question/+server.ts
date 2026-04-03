import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Note: adapter-cloudflare runs all routes on the edge automatically — no runtime export needed.

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json() as {
			course?: string;
			level?: string;
			institutionType?: string;
			topic?: string;
			difficulty?: string;
			type?: string;
		};

		const { course, level, institutionType, topic, difficulty, type } = body;

		if (!course || !institutionType) {
			return json({ error: 'Course and institution type are required' }, { status: 400 });
		}

		// Get API key from Cloudflare env or process.env
		const env = platform?.env as Record<string, string> | undefined;
		const apiKey = env?.ANTHROPIC_API_KEY || '';

		if (!apiKey || apiKey.includes('placeholder') || !apiKey.startsWith('sk-ant-')) {
			// Return demo data without calling external API
			return json(type === 'Theory' ? getDemoTheory(course) : getDemoMCQ(course));
		}

		const prompt = type === 'Theory'
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
				max_tokens: type === 'Theory' ? 1500 : 1200,
				messages: [{ role: 'user', content: prompt }]
			})
		});

		if (!response.ok) {
			console.error('[CollegeCBT] Anthropic API error:', response.status);
			return json(type === 'Theory' ? getDemoTheory(course) : getDemoMCQ(course));
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
			return json(parsed);
		} catch {
			console.warn('[CollegeCBT] JSON parse failed, returning demo question');
			return json(type === 'Theory' ? getDemoTheory(course) : getDemoMCQ(course));
		}

	} catch (err) {
		console.error('[CollegeCBT] Question generation error:', err);
		return json(getDemoMCQ('General'));
	}
};

function buildMCQPrompt(course: string, level: string, instType: string, topic?: string, difficulty?: string): string {
	const topicLine = topic ? ` Specific topic: ${topic}.` : '';
	const diffLine = difficulty && difficulty !== 'mixed' ? ` Difficulty: ${difficulty}.` : '';
	return `You are a Nigerian ${instType} exam expert. Generate ONE exam-standard multiple-choice question for: "${course}" at ${level} level.${topicLine}${diffLine}

Requirements:
- Contextual to Nigerian academic curriculum
- One unambiguously correct answer
- Three plausible but incorrect distractors based on real student misconceptions
- Full explanations for each option

Return ONLY valid JSON (no markdown, no backticks, no extra text):
{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanations":{"correct":"Why this is correct.","A":"Why A is right/wrong.","B":"Misconception about B.","C":"Misconception about C.","D":"Misconception about D."},"examiner_note":"What this question tests and a common student error.","topic":"${topic || 'General'}"}`;
}

function buildTheoryPrompt(course: string, level: string, instType: string, topic?: string, difficulty?: string): string {
	const topicLine = topic ? ` Specific topic: ${topic}.` : '';
	const diffLine = difficulty && difficulty !== 'mixed' ? ` Difficulty: ${difficulty}.` : '';
	return `You are a Nigerian ${instType} exam expert. Generate ONE essay/theory question for: "${course}" at ${level} level.${topicLine}${diffLine}

Requirements:
- Contextual to Nigerian academic curriculum and examination standards
- Clear marking scheme with point allocation
- Comprehensive model answer

Return ONLY valid JSON (no markdown, no backticks):
{"question":"...","key_points":[{"point":"...","marks":4}],"model_answer":"150-200 word model answer contextual to Nigeria...","examiner_notes":"What examiners specifically look for.","mark_scheme":"Total marks with allocation breakdown.","topic":"${topic || 'General'}"}`;
}

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
			correct: 'Encapsulation is a core OOP principle where data (attributes) and methods are bundled inside a class, and internal state is hidden from outside access — exposing only what is necessary through a public interface.',
			A: 'Correct — Encapsulation hides internal data and exposes only a controlled public interface.',
			B: 'This describes recursion or the divide-and-conquer algorithm design paradigm, not encapsulation.',
			C: 'This describes database normalization, which eliminates data redundancy — a database design concept, not OOP.',
			D: 'This describes QuickSort or MergeSort performance characteristics — algorithm analysis, not OOP principles.'
		},
		examiner_note: 'Candidates commonly confuse encapsulation with abstraction. Abstraction hides complexity conceptually; encapsulation hides it through access modifiers (private, protected, public) in code. Both are distinct OOP pillars.',
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
		model_answer: `The field of ${course} encompasses foundational principles that inform both theoretical understanding and practical application within the Nigerian academic and professional landscape. These principles — rooted in globally recognised frameworks but adapted to local contexts — guide practitioners across Nigeria's key sectors including telecommunications, financial services, healthcare, and public administration.

In Nigeria, these concepts are applied daily within institutions such as the Central Bank of Nigeria, NNPC, NCC, and leading universities. For instance, practitioners in Lagos and Abuja leverage these frameworks to improve service delivery, enhance organisational efficiency, and drive innovation.

However, practical challenges persist — including inadequate infrastructure, skills gaps in rural areas, and policy inconsistencies — which limit optimal application. Addressing these through targeted education, institutional reform, and private-sector partnerships remains critical. Students who understand both the theory and its Nigerian context will demonstrate the sophisticated academic competence examiners reward.`,
		examiner_notes: 'Award marks for academic structure, clarity of definition, relevance to Nigerian context, and use of specific local examples. Penalise vague generalities. Reward students who identify real institutional examples.',
		mark_scheme: 'Total: 20 marks. Definition & scholarly citation: 4m. Practical applications (3 minimum): 6m. Specific Nigerian examples: 6m. Critical evaluation of limitations: 4m.',
		topic: 'Applied Concepts & Nigerian Context'
	};
}
