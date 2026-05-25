import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

function getAdminSessionSecret() {
	const secret = env.ADMIN_SESSION_SECRET;
	if (!secret) {
		throw new Error('ADMIN_SESSION_SECRET is not configured.');
	}
	return secret;
}

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	// ── Bypass Gate for Login Page ──
	if (url.pathname === '/admin/login') {
		return {};
	}

	// ── Enforce Super Admin Session ──
	const session = cookies.get('admin_session');
	if (session !== getAdminSessionSecret()) {
		throw redirect(303, '/admin/login');
	}

	return {
		isAdmin: true
	};
};
