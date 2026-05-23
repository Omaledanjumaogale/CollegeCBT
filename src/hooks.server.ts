import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const ADMIN_SESSION_SECRET = env.ADMIN_SESSION_SECRET || "eWin$uPerAdm!n$ecr3t2026#EWIN@project";

export const handle: Handle = async ({ event, resolve }) => {
	try {
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

		// ─── Security & SEO/AEO Crawl Headers ───────────────────────────────────
		const userAgent = event.request.headers.get('user-agent') || '';
		const aiBots = [
			'gptbot', 'claudebot', 'perplexitybot', 'oai-searchbot',
			'google-extended', 'anthropic-ai', 'youbot', 'duckassistbot',
			'cohere-ai', 'applebot-extended'
		];
		const isAiBot = aiBots.some(bot => userAgent.toLowerCase().includes(bot));

		if (isAiBot) {
			console.info(`[CollegeCBT][AEO] AI crawler detected: ${userAgent} accessing ${url.pathname}`);
		}

		const response = await resolve(event);

		// Add enterprise security headers
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

		// Set X-Robots-Tag to prevent indexers from storing private pages
		if (
			url.pathname.startsWith('/admin') ||
			url.pathname.startsWith('/dashboard') ||
			url.pathname.startsWith('/api/private') ||
			url.pathname.startsWith('/auth')
		) {
			response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
			response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		} else if (
			url.pathname.endsWith('sitemap.xml') ||
			url.pathname.endsWith('llms.txt') ||
			url.pathname.endsWith('llms-full.txt')
		) {
			// Allow public search engines to cache indexing structures for faster performance
			response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
		} else {
			// Public content pages
			response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=3600');
		}

		return response;
	} catch (err) {
		console.error('[CollegeCBT] SSR ERROR:', err);
		return new Response(`<!DOCTYPE html>
<html><head><title>Error</title></head><body>
<h1>SSR Error</h1>
<pre>${err instanceof Error ? err.stack : String(err)}</pre>
</body></html>`, {
			status: 500,
			headers: { 'Content-Type': 'text/html; charset=utf-8' }
		});
	}
};
