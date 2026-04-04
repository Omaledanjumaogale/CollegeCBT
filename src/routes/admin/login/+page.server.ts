import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// ── HARDCODED SUPER ADMIN CREDENTIALS (PER USER INSTRUCTIONS) ──
const SUPER_ADMIN_EMAIL = "Omaledanjumaogale@gmail.com";
const SUPER_ADMIN_PASSWORD = "Omale51566122%%%";
const ADMIN_SESSION_SECRET = "tRx$uPerAdm!n$ecr3t2026#Ewin@project";

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('admin_session');
	if (session === ADMIN_SESSION_SECRET) {
		throw redirect(303, '/admin/dashboard');
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
			cookies.set('admin_session', ADMIN_SESSION_SECRET, {
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
