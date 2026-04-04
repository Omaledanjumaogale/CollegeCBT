<script lang="ts">
	import { fade } from 'svelte/transition';

	let { text, children }: { text: string; children?: import('svelte').Snippet } = $props();
	let isHovered = $state(false);
</script>

<div 
	role="group"
	class="relative inline-flex items-center gap-1 group"
	onmouseenter={() => isHovered = true}
	onmouseleave={() => isHovered = false}
>
	{#if children}
		{@render children()}
	{/if}
	
	<button class="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 hover:bg-violet-600/20 hover:text-violet-400 transition-all cursor-help border border-white/5">
		?
	</button>

	{#if isHovered}
		<div 
			class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#1a1c2e] border border-white/10 shadow-2xl z-[300] text-[10px] leading-relaxed text-white/70 backdrop-blur-xl"
			transition:fade={{ duration: 150 }}
		>
			<div class="font-bold text-violet-400 uppercase tracking-widest mb-1">Knowledge Node</div>
			{text}
			<div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1a1c2e]"></div>
		</div>
	{/if}
</div>
