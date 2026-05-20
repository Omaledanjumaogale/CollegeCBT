<!-- src/lib/components/TLDRBlock.svelte -->
<script lang="ts">
	interface Props {
		title?: string;
		children?: import('svelte').Snippet;
	}

	let { title = 'Quick Answer / TL;DR', children }: Props = $props();
</script>

<div class="tldr-block p-6 rounded-2xl border border-lime-500/20 bg-lime-500/5 my-8 relative overflow-hidden">
	<div class="absolute top-0 left-0 w-1.5 h-full bg-lime-500"></div>
	<div class="flex items-center gap-2 mb-3">
		<!-- Light Bulb Icon -->
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
			<path d="M9 18h6"/>
			<path d="M10 22h4"/>
		</svg>
		<h4 class="text-sm font-bold text-lime-400 uppercase tracking-widest leading-none">{title}</h4>
	</div>
	<div class="text-white/80 text-base sm:text-lg leading-relaxed font-medium">
		{@render children?.()}
	</div>
</div>

<style>
	.tldr-block {
		backdrop-filter: blur(10px);
	}
</style>
