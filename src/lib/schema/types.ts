// src/lib/schema/types.ts

export interface SchemaBase {
	'@context': 'https://schema.org';
	'@type': string;
	'@id'?: string;
}

export interface OrganizationSchema extends SchemaBase {
	'@type': 'Organization';
	name: string;
	url: string;
	logo?: string;
	sameAs?: string[];
	description?: string;
}

export interface WebSiteSchema extends SchemaBase {
	'@type': 'WebSite';
	name: string;
	url: string;
	potentialAction?: {
		'@type': 'SearchAction';
		target: string;
		'query-input': string;
	};
}

export interface CrumbItem {
	'@type': 'ListItem';
	position: number;
	name: string;
	item: string;
}

export interface BreadcrumbListSchema extends SchemaBase {
	'@type': 'BreadcrumbList';
	itemListElement: CrumbItem[];
}

export interface PersonSchema extends SchemaBase {
	'@type': 'Person';
	name: string;
	jobTitle?: string;
	url?: string;
	sameAs?: string[];
	image?: string;
}

export interface ArticleSchema extends SchemaBase {
	'@type': 'Article';
	headline: string;
	description: string;
	image?: string[];
	datePublished: string;
	dateModified: string;
	author: PersonSchema | PersonSchema[];
	publisher: OrganizationSchema;
	mainEntityOfPage?: string;
}

export interface QuestionAnswerItem {
	'@type': 'Question';
	name: string;
	acceptedAnswer: {
		'@type': 'Answer';
		text: string;
	};
}

export interface FAQPageSchema extends SchemaBase {
	'@type': 'FAQPage';
	mainEntity: QuestionAnswerItem[];
}

export interface HowToStepItem {
	'@type': 'HowToStep';
	name: string;
	text: string;
	url?: string;
	image?: string;
}

export interface HowToSchema extends SchemaBase {
	'@type': 'HowTo';
	name: string;
	description: string;
	step: HowToStepItem[];
	totalTime?: string;
}
