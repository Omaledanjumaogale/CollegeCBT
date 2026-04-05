// ── AI Question Generation Service ──
// Calls the High-Resilience Convex AI Orchestrator Cascade
import type { Question, TheoryQuestion } from '$lib/stores';
import { triggerAgentTask } from '$lib/services/convexClient';

interface GenerateOptions {
	course: string;
	level: string;
	institutionType: string;
	topic?: string;
	difficulty?: string;
	uid?: string; // pass UID for server-side plan verification
}

// Demo fallbacks when AI is unavailable
export function getDemoMCQ(course: string): Question {
	return {
		id: `demo-${Date.now()}`,
		question: `In the context of ${course}, which of the following best describes encapsulation in software design?`,
		options: {
			A: 'Hiding internal implementation details and exposing only a public interface.',
			B: 'A technique for sorting data arrays in O(n log n) time.',
			C: 'The recursive decomposition of a problem into smaller subproblems.',
			D: 'A database schema design pattern for reducing redundancy.'
		},
		correct: 'A',
		explanations: {
			correct: 'Encapsulation wraps data and methods together, hiding internal complexity and exposing only necessary interfaces — a core OOP principle.',
			A: 'Correct — Encapsulation hides implementation details.',
			B: 'This describes merge sort or quicksort time complexity, not encapsulation.',
			C: 'This describes recursion or divide-and-conquer algorithms.',
			D: 'This describes database normalization, not encapsulation.'
		},
		examiner_note: 'Often confused with abstraction. Abstraction hides complexity conceptually; encapsulation hides it through access control in code.',
		topic: 'Core Concepts'
	};
}

export function getDemoTheory(course: string): TheoryQuestion {
	return {
		question: `Discuss the fundamental principles of ${course} and their practical applications in the Nigerian context. Provide relevant examples. (20 marks)`,
		key_points: [
			{ point: 'Define the core concept with academic precision.', marks: 4 },
			{ point: 'Explain at least 3 practical applications in the Nigerian context.', marks: 6 },
			{ point: 'Provide relevant examples with justification.', marks: 6 },
			{ point: 'Demonstrate understanding of limitations and implications.', marks: 4 }
		],
		model_answer: `The subject of ${course} encompasses foundational principles that drive modern practice in Nigeria and globally. At its core, the discipline involves systematic approaches to understanding, analyzing, and applying academic principles within professional contexts. Nigerian practitioners across telecommunications, finance, healthcare, and the public sector leverage these principles to enhance service delivery and organizational performance.`,
		examiner_notes: 'Award marks for structure, clarity, specific examples, and Nigerian context. Deduct for vague or unsupported assertions.',
		mark_scheme: 'Total: 20 marks. Definition: 4m. Applications: 6m. Examples: 6m. Implications: 4m.',
		topic: 'Applied Concepts'
	};
}

export async function generateMCQ(options: GenerateOptions): Promise<Question> {
	try {
		// Use Enterprise Convex AI Orchestrator instead of basic API
		const res = await triggerAgentTask('board_grade_generator', JSON.stringify({ ...options, type: 'MCQ' }));
		
		if (!res.ok || !res.data) {
			throw { message: res.message || 'Orchestrator failed to return data', status: 500 };
		}
		
		const data = JSON.parse(res.data);
		return {
			id: `q-${Date.now()}`,
			...data
		};
	} catch (e: any) {
		if (e.status === 403 || e.status === 429) throw e; // Repropagate identified errors
		console.warn('AI generation failed, using demo question');
		return getDemoMCQ(options.course);
	}
}

export async function generateTheory(options: GenerateOptions): Promise<TheoryQuestion> {
	try {
		// Use Enterprise Convex AI Orchestrator
		const res = await triggerAgentTask('theory_grader', JSON.stringify({ ...options, type: 'Theory' }));
		
		if (!res.ok || !res.data) {
			throw { message: res.message || 'Orchestrator failed to return data', status: 500 };
		}
		
		return JSON.parse(res.data);
	} catch (e: any) {
		if (e.status === 403 || e.status === 429) throw e;
		console.warn('AI generation failed, using demo theory question');
		return getDemoTheory(options.course);
	}
}

// WAEC Grade Calculator
export function getWaecGrade(percentage: number): string {
	if (percentage >= 75) return 'A1';
	if (percentage >= 70) return 'B2';
	if (percentage >= 65) return 'B3';
	if (percentage >= 60) return 'C4';
	if (percentage >= 55) return 'C5';
	if (percentage >= 50) return 'C6';
	if (percentage >= 45) return 'D7';
	if (percentage >= 40) return 'E8';
	return 'F9';
}

export function getGradeClass(grade: string): string {
	const map: Record<string, string> = {
		'A1': 'grade-a1', 'B2': 'grade-b2', 'B3': 'grade-b3',
		'C4': 'grade-c4', 'C5': 'grade-c5', 'C6': 'grade-c6',
		'D7': 'grade-d7', 'E8': 'grade-e8', 'F9': 'grade-f9'
	};
	return map[grade] || 'grade-f9';
}

export function getAIRecommendation(percentage: number): string {
	if (percentage >= 75) return 'Outstanding! You are exam-ready. Maintain this by tackling harder questions and advanced topics.';
	if (percentage >= 60) return 'Good effort! You are close to the 75% target. Focus on weak topics and retake the mock.';
	if (percentage >= 45) return 'Progress noted, but more practice needed. Review full explanations for wrong answers before retrying.';
	return 'Intensive revision required. Use the Exam Lab topic-by-topic before attempting another mock.';
}

// ── Agent Research & Browsing (Crawl4AI Integration) ─────────────────────

/**
 * Intelligent researching agent:
 * Decides whether to crawl new data or use cache.
 */
export async function browseUrl(url: string, apiKey: string): Promise<any> {
	const { triggerCrawl, getCrawlJobStatus } = await import('./convexClient');
	
	try {
		const result = await triggerCrawl(apiKey, url);
		
		if (result.status === 'cached') {
			return result.data;
		}

		if (result.status === 'queued') {
			// Poll for results (Basic polling strategy)
			let attempts = 0;
			const maxAttempts = 30; // 30s max
			while (attempts < maxAttempts) {
				const job = await getCrawlJobStatus(result.jobId);
				if (job?.status === 'completed' && job.result) {
					return JSON.parse(job.result);
				}
				if (job?.status === 'failed') {
					throw new Error(job.error || 'Job failed');
				}
				await new Promise((r) => setTimeout(r, 1000));
				attempts++;
			}
			throw new Error('Crawl job timed out');
		}
	} catch (err) {
		console.error('[AI Agent] Research error:', err);
		throw err;
	}
}

/**
 * Perform a web search using Crawl4AI pipeline.
 * Use the orchestrated infrastructure to maintain rate limits.
 */
export async function performWebSearch(query: string, apiKey: string) {
	// Simple query-to-crawl logic for demo
	// In production, this would call a search endpoint in Crawl4AI service
	const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
	return browseUrl(searchUrl, apiKey);
}
