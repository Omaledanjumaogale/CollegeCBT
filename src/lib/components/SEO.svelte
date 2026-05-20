<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
	import type { PageSEO } from '$lib/types/seo';

	interface Props {
		seo: PageSEO;
	}

	let { seo }: Props = $props();
</script>

<svelte:head>
	<!-- Standard Title and Description -->
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	{#if seo.keywords}
		<meta name="keywords" content={seo.keywords} />
	{/if}

	<!-- Robots Crawling Controls -->
	{#if seo.noindex}
		<meta name="robots" content="noindex, nofollow, noarchive" />
	{:else}
		<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
	{/if}

	<!-- Canonical Routing -->
	{#if seo.canonical}
		<link rel="canonical" href={seo.canonical} />
	{/if}

	<!-- OpenGraph Social Metadata -->
	{#if seo.og}
		<meta property="og:title" content={seo.og.title || seo.title} />
		<meta property="og:description" content={seo.og.description || seo.description} />
		{#if seo.og.url}
			<meta property="og:url" content={seo.og.url} />
		{/if}
		{#if seo.og.type}
			<meta property="og:type" content={seo.og.type} />
		{/if}
		{#if seo.og.image}
			<meta property="og:image" content={seo.og.image} />
		{/if}
		{#if seo.og.site_name}
			<meta property="og:site_name" content={seo.og.site_name} />
		{/if}
		{#if seo.og.locale}
			<meta property="og:locale" content={seo.og.locale} />
		{/if}
	{/if}

	<!-- Twitter Social Card Metadata -->
	{#if seo.twitter}
		<meta name="twitter:card" content={seo.twitter.card || 'summary_large_image'} />
		{#if seo.twitter.site}
			<meta name="twitter:site" content={seo.twitter.site} />
		{/if}
		{#if seo.twitter.creator}
			<meta name="twitter:creator" content={seo.twitter.creator} />
		{/if}
		<meta name="twitter:title" content={seo.twitter.title || seo.title} />
		<meta name="twitter:description" content={seo.twitter.description || seo.description} />
		{#if seo.twitter.image}
			<meta name="twitter:image" content={seo.twitter.image} />
		{/if}
	{/if}

	<!-- Structural Structured Data (JSON-LD) Stack -->
	{#if seo.schemaJsonLd && seo.schemaJsonLd.length > 0}
		{#each seo.schemaJsonLd as schema}
			{@html `<script type="application/ld+json">${schema}</script>`}
		{/each}
	{/if}
</svelte:head>
