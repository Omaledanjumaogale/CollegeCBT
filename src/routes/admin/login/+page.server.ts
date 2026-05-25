import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

function getAdminConfig() {
	const email = env.ADMIN_EMAIL;
	const password = env.ADMIN_PASSWORD;
	const sessionSecret = env.ADMIN_SESSION_SECRET;
	return email && password && sessionSecret
		? { email, password, sessionSecret }
		: null;
}

export const load: PageServerLoad = async ({ cookies }) => {
	const config = getAdminConfig();
	if (!config) return { adminConfigured: false };

	const session = cookies.get('admin_session');
	if (session === config.sessionSecret) {
		throw redirect(303, '/admin/dashboard');
	}
	return { adminConfigured: true };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');
		const config = getAdminConfig();

		if (!config) {
			return fail(503, { error: 'Administrator login is not configured.' });
		}

		if (email === config.email && password === config.password) {
			cookies.set('admin_session', config.sessionSecret, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: true,
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			throw redirect(303, '/admin/dashboard');
		}

		return fail(401, { error: 'Invalid administrator credentials.' });
	},
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		throw redirect(303, '/admin/login');
	}
};
