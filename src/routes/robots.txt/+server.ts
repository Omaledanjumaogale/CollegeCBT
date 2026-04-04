export const prerender = true;

export const GET = () => {
    const robots = `
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://collegecbt.dev/sitemap.xml
`.trim();

    return new Response(robots, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600'
        }
    });
};
