import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { StudySession } from '$lib/stores';

// Edge-compatible Convex client using $env/static/public (baked in at build time).
// No process.env usage — fully safe for Cloudflare Workers edge runtime.
const convexUrl = PUBLIC_CONVEX_URL || 'https://different-warthog-453.eu-west-1.convex.cloud';

export const convex = new ConvexHttpClient(convexUrl);

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
