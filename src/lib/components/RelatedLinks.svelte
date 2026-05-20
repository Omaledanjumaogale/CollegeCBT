<!-- src/lib/components/RelatedLinks.svelte -->
<script lang="ts">
	interface LinkItem {
		title: string;
		href: string;
		description: string;
	}

	interface Props {
		links: LinkItem[];
		title?: string;
	}

	let { links, title = 'Learn More & Related Resources' }: Props = $props();
</script>

<div class="related-links-section my-12 p-6 rounded-2xl border border-white/10 bg-white/5">
	<h3 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
		</svg>
		{title}
	</h3>
	
	<div class="grid sm:grid-cols-2 gap-4">
		{#each links as link}
			<a 
				href={link.href} 
				class="link-card p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-950/20 transition-all group"
			>
				<h4 class="text-sm font-bold text-white group-hover:text-violet-400 transition-colors flex items-center gap-1.5 mb-1">
					{link.title}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<line x1="5" y1="12" x2="19" y2="12"/>
						<polyline points="12 5 19 12 12 19"/>
					</svg>
				</h4>
				<p class="text-xs text-white/50 leading-relaxed">
					{link.description}
				</p>
			</a>
		{/each}
	</div>
</div>

<style>
	.related-links-section {
		backdrop-filter: blur(10px);
	}
</style>
