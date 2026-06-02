import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { verifyFirebaseIdToken } from '$lib/server/auth';

const sessionSchema = z.object({
	idToken: z.string().min(1)
});

export const POST: RequestHandler = async ({ request, cookies, platform, url }) => {
	const body = await request.json().catch(() => null);
	const parsed = sessionSchema.safeParse(body);

	if (!parsed.success) {
		return json({ error: 'Invalid session payload' }, { status: 400 });
	}

	const platformEnv = (platform?.env || {}) as Record<string, string | undefined>;
	const user = await verifyFirebaseIdToken(parsed.data.idToken, platformEnv);
	if (!user?.localId) {
		return json({ error: 'Invalid authentication token' }, { status: 401 });
	}

	cookies.set('collegecbt_session', parsed.data.idToken, {
		path: '/',
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		maxAge: 60 * 60
	});

	return json({ ok: true, uid: user.localId, email: user.email });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete('collegecbt_session', { path: '/' });
	return json({ ok: true });
};
