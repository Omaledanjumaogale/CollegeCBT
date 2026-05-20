import type { RequestHandler } from './$types';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

const siteUrl = 'https://collegecbt.ewinproject.org';

const feedItems = [
	{
		title: 'E-WIN Launches CollegeCBT Platform',
		description: 'Elite Workforce Impact Nigeria Project (E-WIN) officially unveils CollegeCBT to modernize and scale academic test prep across Nigeria.',
		link: '/blog/ewin-launches-collegecbt',
		pubDate: 'Wed, 20 May 2026 08:00:00 GMT'
	},
	{
		title: 'Practical Strategies for CBT Examination Preparation',
		description: 'Discover how timed practice simulations and cognitive reinforcement help students optimize their score potential.',
		link: '/blog/boosting-cbt-scores-nigeria',
		pubDate: 'Mon, 18 May 2026 12:00:00 GMT'
	},
	{
		title: 'AI Grading Models in Higher Education Assessments',
		description: 'A study on model grading accuracy, feedback loop speeds, and curriculum alignment metrics within CollegeCBT systems.',
		link: '/blog/ai-grading-in-education',
		pubDate: 'Sat, 16 May 2026 10:30:00 GMT'
	}
];

export const GET: RequestHandler = async () => {
	let rss = `<?xml version="1.0" encoding="UTF-8" ?>`;
	rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`;
	rss += `<channel>`;
	rss += `<title>CollegeCBT — AI Exam Prep & E-WIN Ecosystem Updates</title>`;
	rss += `<link>${siteUrl}</link>`;
	rss += `<description>Official updates and academic analysis guides from the CollegeCBT learning engine.</description>`;
	rss += `<language>en-ng</language>`;
	rss += `<atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`;

	for (const item of feedItems) {
		rss += `
		<item>
			<title>${item.title}</title>
			<link>${siteUrl}${item.link}</link>
			<guid>${siteUrl}${item.link}</guid>
			<pubDate>${item.pubDate}</pubDate>
			<description>${item.description}</description>
		</item>`;
	}

	rss += `</channel>`;
	rss += `</rss>`;

	return new Response(rss.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
