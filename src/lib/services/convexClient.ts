import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import type { QuestionAttempt, StudySession } from '$lib/stores';
import type { Id } from '$convex/_generated/dataModel';

export { api };

// Edge-compatible Convex client using $env/dynamic/public (resolved safely at runtime).
// No process.env usage — fully safe for Cloudflare Workers edge runtime.
const convexUrl = env?.PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';

export const convex = new ConvexHttpClient(convexUrl);

/**
 * Enterprise client selector. Returns the active Convex client instance.
 * @returns {ConvexHttpClient}
 */
export function getConvexClient() {
	return convex;
}

export async function saveStudySession(userId: string, session: StudySession): Promise<boolean> {
	try {
		if (!userId) return false;
		await convex.mutation(api.sessions.saveSession, {
			userId,
			sessionId: session.id,
			course: session.course,
			level: session.level,
			institutionType: session.institutionType,
			questionsAnswered: session.questionsAnswered,
			correct: session.correct,
			wrong: session.wrong,
			score: session.score,
			mode: session.mode,
			grade: session.grade,
			timestamp: session.timestamp,
		});
		return true;
	} catch (err) {
		console.error('[CollegeCBT Convex] Save session error:', err);
		return false;
	}
}

export async function saveQuestionAttempt(attempt: QuestionAttempt): Promise<boolean> {
	try {
		if (!attempt.userId) return false;
		await convex.mutation(api.sessions.saveQuestionAttempt, attempt);
		return true;
	} catch (err) {
		console.error('[CollegeCBT Convex] Save question attempt error:', err);
		return false;
	}
}

export async function getRecentQuestionAttempts(userId: string, limit = 100) {
	try {
		if (!userId) return [];
		return await convex.query(api.sessions.getRecentQuestionAttempts, { userId, limit });
	} catch (err) {
		console.error('[CollegeCBT Convex] Get question attempts error:', err);
		return [];
	}
}

export async function getUserSessions(userId: string): Promise<StudySession[]> {
	try {
		if (!userId) return [];
		const sessions = await convex.query(api.sessions.getUserSessions, { userId });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (sessions as any[]).map((s) => ({
			id: s.sessionId,
			course: s.course,
			level: s.level,
			institutionType: s.institutionType,
			questionsAnswered: s.questionsAnswered,
			correct: s.correct,
			wrong: s.wrong,
			score: s.score,
			mode: s.mode,
			grade: s.grade,
			timestamp: s.timestamp
		})) as StudySession[];
	} catch (err) {
		console.error('[CollegeCBT Convex] Get sessions error:', err);
		return [];
	}
}

export async function getDashboardAnalytics(userId: string) {
	try {
		return await convex.query(api.sessions.getDashboardAnalytics, { userId });
	} catch (err) {
		console.error('[CollegeCBT Convex] Error fetching analytics:', err);
		return null;
	}
}

// ── Crawler Multi-Tenant Interface ────────────────────────────────────────

/**
 * Triggers a crawl request via Convex Orchestrator.
 * Handles duplicate detection and cache lookup.
 */
export async function triggerCrawl(apiKey: string, url: string, priority = 1) {
	try {
		return await convex.mutation(api.crawler.requestCrawl, {
			apiKey,
			url,
			priority
		});
	} catch (err) {
		console.error('[CollegeCBT Convex] Trigger crawl error:', err);
		throw err;
	}
}

/**
 * Polls or checks for a specific crawl job status.
 */
export async function getCrawlJobStatus(jobId: string) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const job = await convex.query(api.crawler.getCrawlJob, { jobId: jobId as Id<'crawlJobs'> });
		return job;
	} catch (err) {
		console.error('[CollegeCBT Convex] Get job status error:', err);
		return null;
	}
}

/**
 * Enterprise sync of the global Firebase identity with this platform's database.
 * This mutation MUST be called with a valid Firebase ID Token active in the Convex client.
 */
export async function syncPlatformUser(plan: 'free' | 'pro' = 'free') {
	try {
		// storeUser uses ctx.auth to verify the identity server-side
		return await convex.mutation(api.users.storeUser, { plan });
	} catch (err) {
		console.error('[CollegeCBT Convex] User sync error:', err);
		return null;
	}
}

// ── Enterprise AI Agent Interface ─────────────────────────────────────────

/**
 * Triggers a designated AI Agent Task through the Fallback Orchestrator.
 * Handles performance analysts, grading, and board-level generation.
 */
export async function triggerAgentTask(agentName: string, userContext: string) {
	try {
        // Run action instead of mutation/query for long-form AI endpoints
		return await convex.action(api.agentWorkflow.runAgentTask, {
			agentName,
			userContext
		});
	} catch (err) {
		console.error(`[CollegeCBT Convex] AI Task Error (${agentName}):`, err);
		throw err;
	}
}
