import { redirect, type Handle } from '@sveltejs/kit';

const ADMIN_SESSION_SECRET = "tRx$uPerAdm!n$ecr3t2026#Ewin@project";

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;

	// ─── Admin Route Protection ──────────────────────────────────────────────
	if (url.pathname.startsWith('/admin')) {
		// Allow the login page itself
		if (url.pathname === '/admin/login') {
			return await resolve(event);
		}

		// Check for admin session cookie
		const session = cookies.get('admin_session');
		if (session !== ADMIN_SESSION_SECRET) {
			console.warn(`[CollegeCBT] Unauthorized admin access attempt to ${url.pathname}`);
			throw redirect(303, '/admin/login');
		}
	}

	// ─── Dashboard Route Protection (Optional Server-side check) ──────────────
	if (url.pathname.startsWith('/dashboard')) {
		// Currently the app uses client-side Firebase auth.
		// For enterprise hardening, we would check for a 'session' cookie here.
		// If we don't find it, we could redirect to '/', but since the app 
		// handles it in Svelte (dashboard/+page.svelte), we'll let it be for now
		// to avoid breaking the existing Firebase flow.
	}

	// ─── Security Headers ───────────────────────────────────────────────────
	const response = await resolve(event);
	
	// Add enterprise security headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	
	// Ensure no caching for authenticated routes
	if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin')) {
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	}

	return response;
};
