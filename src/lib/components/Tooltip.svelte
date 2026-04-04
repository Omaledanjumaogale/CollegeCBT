<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { MouseEventHandler, FocusEventHandler } from 'svelte/elements';

	let { text = '', children }: {
		text: string;
		children?: import('svelte').Snippet;
	} = $props();

	const activeTooltip = getContext<Writable<{id: string, text: string, x: number, y: number} | null>>('tooltip');
	const id = Math.random().toString(36).substring(2, 9);

	let element: HTMLDivElement;

	const showTooltip: MouseEventHandler<HTMLDivElement> & FocusEventHandler<HTMLDivElement> = (e) => {
		if (!element) return;
		const rect = element.getBoundingClientRect();
		activeTooltip.set({
			id,
			text,
			x: rect.left + rect.width / 2,
			y: rect.top
		});
	};

	const hideTooltip = () => {
		activeTooltip.update(curr => curr?.id === id ? null : curr);
	};
</script>

<div 
	bind:this={element}
	class="inline-block relative cursor-help"
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocus={showTooltip}
	onblur={hideTooltip}
    role="tooltip"
    aria-label={text}
>
	{#if children}
		{@render children()}
	{/if}
    
    <!-- Knowledge Icon Overlay -->
    <div class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-500/50 animate-pulse border border-white/20"></div>
</div>

