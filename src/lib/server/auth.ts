import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export type RuntimeEnv = Record<string, string | undefined>;

export type FirebaseLookupUser = {
	localId?: string;
	email?: string;
	displayName?: string;
};

export function getRuntimeEnv(platformEnv?: RuntimeEnv): RuntimeEnv {
	return {
		...privateEnv,
		...publicEnv,
		...(platformEnv ?? {})
	};
}

export function getFirebaseApiKey(platformEnv?: RuntimeEnv) {
	return getRuntimeEnv(platformEnv).PUBLIC_FIREBASE_API_KEY ?? '';
}

export async function verifyFirebaseIdToken(
	idToken: string,
	platformEnv?: RuntimeEnv
): Promise<FirebaseLookupUser | null> {
	const apiKey = getFirebaseApiKey(platformEnv);
	if (!apiKey || !idToken) return null;

	const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idToken }),
		signal: AbortSignal.timeout(5000)
	});

	if (!response.ok) return null;
	const data = (await response.json()) as { users?: FirebaseLookupUser[] };
	return data.users?.[0] ?? null;
}

export async function verifyFirebaseIdentity(
	idToken: string,
	expected: { uid?: string; email?: string },
	platformEnv?: RuntimeEnv
) {
	const user = await verifyFirebaseIdToken(idToken, platformEnv);
	if (!user) return { ok: false as const, status: 401, error: 'Invalid authentication token' };

	if (expected.uid && user.localId !== expected.uid) {
		return { ok: false as const, status: 403, error: 'Session identity mismatch' };
	}

	if (expected.email && user.email !== expected.email) {
		return { ok: false as const, status: 403, error: 'Session identity mismatch' };
	}

	return { ok: true as const, user };
}
