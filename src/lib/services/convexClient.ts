import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { api } from '$convex/_generated/api';
import { env } from '$env/dynamic/public';
import type { StudySession } from '$lib/stores';

export { api };

// Edge-compatible Convex client using $env/dynamic/public (resolved safely at runtime).
// No process.env usage — fully safe for Cloudflare Workers edge runtime.
const convexUrl = env?.PUBLIC_CONVEX_URL || 'https://different-warthog-453.eu-west-1.convex.cloud';

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
		await convex.mutation(anyApi.sessions.saveSession, {
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

export async function getUserSessions(userId: string): Promise<StudySession[]> {
	try {
		if (!userId) return [];
		const sessions = await convex.query(anyApi.sessions.getUserSessions, { userId });
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
		return await convex.query(anyApi.sessions.getDashboardAnalytics, { userId });
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
		return await convex.mutation(anyApi.crawler.requestCrawl, {
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
		const job = await convex.query(anyApi.crawler.getInternalJob, { jobId: jobId as any });
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
export async function syncPlatformUser(plan: 'free' | 'pro' | 'institutional' = 'free') {
	try {
		// storeUser uses ctx.auth to verify the identity server-side
		return await convex.mutation(anyApi.users.storeUser, { plan });
	} catch (err) {
		console.error('[CollegeCBT Convex] User sync error:', err);
		return null;
	}
}
