export const prerender = true;

const URL_BASE = 'https://collegecbt.dev';

const pages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/pricing', priority: '0.8', changefreq: 'weekly' },
  { path: '/resources', priority: '0.7', changefreq: 'weekly' },
  { path: '/auth/login', priority: '0.5', changefreq: 'monthly' },
  { path: '/auth/signup', priority: '0.5', changefreq: 'monthly' },
];

export const GET = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map(page => `
    <url>
        <loc>${URL_BASE}${page.path}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('')}
</urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        }
    });
};
