import { redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { verifyFirebaseIdToken } from '$lib/server/auth';

function getAdminSessionSecret() {
	const secret = env.ADMIN_SESSION_SECRET;
	if (!secret) {
		throw new Error('ADMIN_SESSION_SECRET is not configured.');
	}
	return secret;
}

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;
	const platformEnv = (event.platform?.env || {}) as Record<string, string | undefined>;
	const firebaseSession = cookies.get('collegecbt_session');

	if (firebaseSession) {
		const verified = await verifyFirebaseIdToken(firebaseSession, platformEnv);
		if (verified?.localId) {
			event.locals.user = {
				id: verified.localId,
				email: verified.email
			};
		} else {
			cookies.delete('collegecbt_session', { path: '/' });
		}
	}

	// ─── Admin Route Protection ──────────────────────────────────────────────
	if (url.pathname.startsWith('/admin')) {
		// Allow the login page itself
		if (url.pathname === '/admin/login') {
			return await resolve(event);
		}

		// Check for admin session cookie
		const session = cookies.get('admin_session');
		if (session !== getAdminSessionSecret()) {
			console.warn(`[CollegeCBT] Unauthorized admin access attempt to ${url.pathname}`);
			throw redirect(303, '/admin/login');
		}
	}

	// ─── Dashboard Route Protection (Optional Server-side check) ──────────────
	if (url.pathname.startsWith('/dashboard')) {
		if (!event.locals.user) {
			throw redirect(303, `/auth/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
		}
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
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.flutterwave.com https://js.paystack.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site https://*.firebaseio.com https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://api.anthropic.com https://api.flutterwave.com https://api.paystack.co https://api.korapay.com https://api.seerbitapi.com https://api.seerbitapigateway.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
	);

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
};
