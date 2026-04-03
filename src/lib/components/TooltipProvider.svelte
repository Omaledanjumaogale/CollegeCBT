<script lang="ts">
	// TooltipProvider: Manages global tooltip visibility and positioning
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const activeTooltip = writable<{id: string, text: string, x: number, y: number} | null>(null);
	setContext('tooltip', activeTooltip);
</script>

<slot />

{#if $activeTooltip}
	<div 
		class="fixed z-[9999] px-2 py-1 rounded bg-black/90 border border-white/10 text-[10px] text-white/80 pointer-events-none transition-all duration-200 shadow-xl"
		style="left: {$activeTooltip.x}px; top: {$activeTooltip.y}px; transform: translate(-50%, -120%);"
	>
		{$activeTooltip.text}
	</div>
{/if}
