import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const ADMIN_SESSION_SECRET = "tRx$uPerAdm!n$ecr3t2026#Ewin@project";

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	// ── Bypass Gate for Login Page ──
	if (url.pathname === '/admin/login') {
		return {};
	}

	// ── Enforce Super Admin Session ──
	const session = cookies.get('admin_session');
	if (session !== ADMIN_SESSION_SECRET) {
		throw redirect(303, '/admin/login');
	}

	return {
		isAdmin: true
	};
};
