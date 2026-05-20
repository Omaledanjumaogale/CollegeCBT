// src/lib/schema/builders.ts
import type {
	OrganizationSchema,
	WebSiteSchema,
	BreadcrumbListSchema,
	PersonSchema,
	ArticleSchema,
	FAQPageSchema,
	HowToSchema,
	HowToStepItem,
	QuestionAnswerItem
} from './types';
import type { Crumb, FAQItem, HowToStep } from '../types/seo';

export function buildPersonSchema(person: {
	name: string;
	title?: string;
	url?: string;
	sameAs?: string[];
	image?: string;
}): PersonSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': person.url ? `${person.url}#person` : undefined,
		name: person.name,
		jobTitle: person.title,
		url: person.url,
		sameAs: person.sameAs,
		image: person.image
	};
}

export function buildOrganizationSchema(org: {
	name: string;
	url: string;
	logo?: string;
	sameAs?: string[];
	description?: string;
}): OrganizationSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': `${org.url}#organization`,
		name: org.name,
		url: org.url,
		logo: org.logo,
		sameAs: org.sameAs,
		description: org.description
	};
}

export function buildWebSiteSchema(site: {
	name: string;
	url: string;
	searchQueryParam?: string;
}): WebSiteSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${site.url}#website`,
		name: site.name,
		url: site.url,
		potentialAction: site.searchQueryParam ? {
			'@type': 'SearchAction',
			target: `${site.url}${site.searchQueryParam}={search_term_string}`,
			'query-input': 'required name=search_term_string'
		} : undefined
	};
}

export function buildBreadcrumbSchema(crumbs: Crumb[], siteUrl: string): BreadcrumbListSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((crumb, idx) => ({
			'@type': 'ListItem',
			position: idx + 1,
			name: crumb.name,
			item: crumb.item.startsWith('http') ? crumb.item : `${siteUrl}${crumb.item}`
		}))
	};
}

export function buildArticleSchema(article: {
	title: string;
	description: string;
	image?: string;
	datePublished: string;
	dateModified: string;
	author: Parameters<typeof buildPersonSchema>[0];
	publisher: Parameters<typeof buildOrganizationSchema>[0];
	pageUrl: string;
}): ArticleSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': `${article.pageUrl}#article`,
		headline: article.title,
		description: article.description,
		image: article.image ? [article.image] : [],
		datePublished: article.datePublished,
		dateModified: article.dateModified,
		author: buildPersonSchema(article.author),
		publisher: buildOrganizationSchema(article.publisher),
		mainEntityOfPage: article.pageUrl
	};
}

export function buildFAQSchema(faqs: FAQItem[]): FAQPageSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	};
}

export function buildHowToSchema(howto: {
	name: string;
	description: string;
	steps: HowToStep[];
}): HowToSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name: howto.name,
		description: howto.description,
		step: howto.steps.map((step, idx) => ({
			'@type': 'HowToStep',
			name: step.name,
			text: step.text,
			url: step.url,
			image: step.image
		}))
	};
}
