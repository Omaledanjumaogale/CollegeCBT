// src/lib/seo.ts
import type { PageSEO } from './types/seo';

export const defaultSEO: PageSEO = {
	title: 'CollegeCBT — AI Exam Practice for Nigerian Higher Institutions',
	description: 'Unlimited AI-generated exam questions, WAEC/NUC graded mock exams, and score predictions for Nigerian Universities, Polytechnics, and Colleges of Education.',
	keywords: 'CollegeCBT, JAMB CBT practice, WAEC mock exam, Nigerian university exams, NUC curriculum, E-WIN Nigeria, post-UTME prep, computer based testing',
	canonical: 'https://collegecbt.ewinproject.org',
	noindex: false,
	og: {
		title: 'CollegeCBT — AI Exam Practice & Mock Simulations',
		description: 'Boost your academic performance with context-aware practice exams mapped to your school\'s curriculum. Powered by E-WIN.',
		url: 'https://collegecbt.ewinproject.org',
		type: 'website',
		image: 'https://collegecbt.ewinproject.org/og-image.png',
		site_name: 'CollegeCBT',
		locale: 'en_NG'
	},
	twitter: {
		card: 'summary_large_image',
		site: '@EWinProject',
		creator: '@EWinProject',
		title: 'CollegeCBT — AI Exam Practice & Mock Simulations',
		description: 'Boost your academic performance with context-aware practice exams mapped to your school\'s curriculum.',
		image: 'https://collegecbt.ewinproject.org/og-image.png'
	}
};

/**
 * Builds a complete PageSEO object merging default parameters with overrides.
 */
export function buildMeta(overrides?: Partial<PageSEO>): PageSEO {
	if (!overrides) return defaultSEO;

	const title = overrides.title || defaultSEO.title;
	const description = overrides.description || defaultSEO.description;
	const keywords = overrides.keywords || defaultSEO.keywords;
	const canonical = overrides.canonical || defaultSEO.canonical;
	const noindex = overrides.noindex !== undefined ? overrides.noindex : defaultSEO.noindex;

	return {
		title,
		description,
		keywords,
		canonical,
		noindex,
		og: {
			title: overrides.og?.title || title,
			description: overrides.og?.description || description,
			url: overrides.og?.url || canonical || defaultSEO.og?.url,
			type: overrides.og?.type || defaultSEO.og?.type,
			image: overrides.og?.image || defaultSEO.og?.image,
			site_name: defaultSEO.og?.site_name,
			locale: defaultSEO.og?.locale
		},
		twitter: {
			card: overrides.twitter?.card || defaultSEO.twitter?.card,
			site: defaultSEO.twitter?.site,
			creator: defaultSEO.twitter?.creator,
			title: overrides.twitter?.title || title,
			description: overrides.twitter?.description || description,
			image: overrides.twitter?.image || defaultSEO.twitter?.image
		},
		schemaJsonLd: overrides.schemaJsonLd || []
	};
}
