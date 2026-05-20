<!-- src/lib/components/PageTemplate.svelte -->
<script lang="ts">
	import type { Crumb } from '$lib/types/seo';
	import AuthorCard from './AuthorCard.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		category?: string;
		datePublished?: string;
		dateModified?: string;
		crumbs?: Crumb[];
		showAuthor?: boolean;
		children?: import('svelte').Snippet;
		sidebar?: import('svelte').Snippet;
	}

	let {
		title,
		subtitle,
		category,
		datePublished,
		dateModified,
		crumbs = [],
		showAuthor = true,
		children,
		sidebar
	}: Props = $props();
</script>

<div class="py-12 bg-transparent text-white relative">
	<div class="page-container max-w-7xl mx-auto px-4">
		
		<!-- Breadcrumbs Navigation -->
		{#if crumbs.length > 0}
			<nav class="breadcrumb-nav mb-6 flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest" aria-label="Breadcrumb">
				<a href="/" class="hover:text-white transition-colors">Home</a>
				{#each crumbs as crumb}
					<span class="text-white/20">/</span>
					<a href={crumb.item} class="hover:text-white transition-colors last:text-violet-400 last:pointer-events-none">
						{crumb.name}
					</a>
				{/each}
			</nav>
		{/if}

		<!-- Hero Headers -->
		<header class="mb-10 text-center sm:text-left">
			{#if category}
				<span class="text-xs font-black uppercase tracking-widest text-violet-400 bg-violet-950/40 px-3.5 py-1.5 rounded-full border border-violet-500/25 mb-4 inline-block">
					{category}
				</span>
			{/if}
			<h1 class="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white leading-tight">
				{title}
			</h1>
			{#if subtitle}
				<p class="text-lg sm:text-xl text-white/60 font-medium leading-relaxed max-w-3xl">
					{subtitle}
				</p>
			{/if}

			<!-- Article Timestamps -->
			{#if datePublished || dateModified}
				<div class="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-white/45 font-semibold uppercase tracking-widest border-t border-white/5 pt-4">
					{#if datePublished}
						<div class="flex items-center gap-1.5">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
								<line x1="16" y1="2" x2="16" y2="6"/>
								<line x1="8" y1="2" x2="8" y2="6"/>
								<line x1="3" y1="10" x2="21" y2="10"/>
							</svg>
							Published: <time datetime={datePublished}>{new Date(datePublished).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
						</div>
					{/if}
					{#if dateModified}
						<div class="flex items-center gap-1.5">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-lime-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
							</svg>
							Last Updated: <time datetime={dateModified}>{new Date(dateModified).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
						</div>
					{/if}
				</div>
			{/if}
		</header>

		<!-- Main Layout Shell -->
		<div class="grid lg:grid-cols-12 gap-10">
			<!-- Semantic Content Body -->
			<article class="lg:col-span-8 space-y-6">
				{@render children?.()}

				<!-- Author bio overlay -->
				{#if showAuthor}
					<div class="border-t border-white/10 pt-8 mt-12">
						<AuthorCard />
					</div>
				{/if}
			</article>

			<!-- Sticky Semantic Sidebar -->
			{#if sidebar}
				<aside class="lg:col-span-4 space-y-6 lg:sticky lg:top-[100px] h-fit">
					{@render sidebar()}
				</aside>
			{/if}
		</div>
	</div>
</div>
