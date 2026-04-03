import { ConvexHttpClient } from 'convex/browser';
import type { StudySession } from '$lib/stores';

// The URL should come from import.meta.env.PUBLIC_CONVEX_URL
// For edge compatibility, we will assume it is passed or use a fallback.
const convexUrl = typeof process !== 'undefined' && process.env.PUBLIC_CONVEX_URL 
    ? process.env.PUBLIC_CONVEX_URL 
    : (import.meta.env.PUBLIC_CONVEX_URL || 'https://example-fallback.convex.cloud');

export const convex = new ConvexHttpClient(convexUrl);

export async function saveStudySession(userId: string, session: StudySession): Promise<boolean> {
	try {
        if (!userId) return false;
		await convex.mutation('sessions:saveSession', {
            userId: userId,
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
		const sessions = await convex.query('sessions:getUserSessions', { userId });
		return sessions.map((s: any) => ({
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
