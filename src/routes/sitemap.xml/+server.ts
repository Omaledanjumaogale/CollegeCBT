import type { RequestHandler } from './$types';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

const siteUrl = 'https://collegecbt.ewinproject.org';

// Static routes to index — only routes that actually exist in the app
const staticRoutes = [
	{ path: '', changefreq: 'daily', priority: '1.0' },
	{ path: '/pricing', changefreq: 'weekly', priority: '0.8' },
	{ path: '/about', changefreq: 'monthly', priority: '0.7' },
	{ path: '/exam-lab', changefreq: 'daily', priority: '0.9' },
	{ path: '/resources', changefreq: 'weekly', priority: '0.7' },
];

export const GET: RequestHandler = async () => {
	const lastmod = new Date().toISOString().split('T')[0];

	let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
	xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

	// 1. Static Pages (only routes that exist)
	for (const route of staticRoutes) {
		xml += `
		<url>
			<loc>${siteUrl}${route.path}</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>${route.changefreq}</changefreq>
			<priority>${route.priority}</priority>
		</url>`;
	}

	// 2. Exam Lab with course params (highly dynamic — daily crawl)
	xml += `
		<url>
			<loc>${siteUrl}/exam-lab?mode=mock</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>daily</changefreq>
			<priority>0.7</priority>
		</url>`;

	// 3. Glossary terms — static content pages that exist in courseData.ts
	const glossaryTerms = ['nuc', 'nbte', 'ncce', 'cbt', 'utme', 'post-utme', 'waec', 'neco', 'jamb', 'hnd', 'nd', 'nce', 'gce'];
	for (const term of glossaryTerms) {
		xml += `
		<url>
			<loc>${siteUrl}/glossary/${term}</loc>
			<lastmod>${lastmod}</lastmod>
			<changefreq>monthly</changefreq>
			<priority>0.4</priority>
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
