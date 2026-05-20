import type { RequestHandler } from './$types';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

const siteUrl = 'https://collegecbt.ewinproject.org';

// Static routes to index
const staticRoutes = [
	{ path: '', changefreq: 'daily', priority: '1.0' },
	{ path: '/pricing', changefreq: 'weekly', priority: '0.8' },
	{ path: '/about', changefreq: 'monthly', priority: '0.7' },
	{ path: '/faq', changefreq: 'weekly', priority: '0.7' },
	{ path: '/docs', changefreq: 'weekly', priority: '0.8' },
	{ path: '/glossary', changefreq: 'monthly', priority: '0.6' }
];

// Dynamic topics/terms for sitemap generation
const mockDocsTopics = ['timed-testing', 'grading-rubric', 'jamb-setup', 'institution-billing'];
const mockBlogSlugs = ['boosting-cbt-scores-nigeria', 'ewin-launches-collegecbt', 'ai-grading-in-education'];
const mockGlossaryTerms = ['nuc', 'nbte', 'ncce', 'cbt', 'utme', 'post-utme'];

export const GET: RequestHandler = async () => {
	const lastmod = new Date().toISOString().split('T')[0];

	let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
	xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

	// 1. Append Static Pages
	for (const route of staticRoutes) {
		xml += `
		<url>
			<loc>${siteUrl}${route.path}</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>${route.changefreq}</changefreq>
			<priority>${route.priority}</priority>
		</url>`;
	}

	// 2. Append Dynamic Doc Topics
	for (const topic of mockDocsTopics) {
		xml += `
		<url>
			<loc>${siteUrl}/docs/${topic}</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>weekly</changefreq>
			<priority>0.7</priority>
		</url>`;
	}

	// 3. Append Dynamic Blog Posts
	for (const slug of mockBlogSlugs) {
		xml += `
		<url>
			<loc>${siteUrl}/blog/${slug}</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>monthly</changefreq>
			<priority>0.6</priority>
		</url>`;
	}

	// 4. Append Dynamic Glossary terms
	for (const term of mockGlossaryTerms) {
		xml += `
		<url>
			<loc>${siteUrl}/glossary/${term}</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>monthly</changefreq>
			<priority>0.5</priority>
		</url>`;
	}

	xml += `</urlset>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
