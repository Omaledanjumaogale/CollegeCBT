// src/lib/types/seo.ts

export interface OpenGraphMeta {
	title?: string;
	description?: string;
	url?: string;
	type?: string;
	image?: string;
	site_name?: string;
	locale?: string;
}

export interface TwitterMeta {
	card?: 'summary' | 'summary_large_image' | 'app' | 'player';
	site?: string;
	creator?: string;
	title?: string;
	description?: string;
	image?: string;
}

export interface PageSEO {
	title: string;
	description: string;
	keywords?: string;
	canonical?: string;
	noindex?: boolean;
	og?: OpenGraphMeta;
	twitter?: TwitterMeta;
	schemaJsonLd?: string[]; // Serialized Schema.org graphs to stack in head
}

export interface Crumb {
	name: string;
	item: string;
}

export interface FAQItem {
	question: string;
	answer: string;
}

export interface HowToStep {
	name: string;
	text: string;
	url?: string;
	image?: string;
}
