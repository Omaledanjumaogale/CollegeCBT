<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const activeTooltip = getContext<Writable<{id: string, text: string, x: number, y: number} | null>>('tooltip');

	const { text, position = 'top', children } = $props<{ 
		text: string; 
		position?: 'top' | 'bottom' | 'left' | 'right';
		children?: any;
	}>();

	let el: HTMLElement;

	function show() {
		if (!el) return;
		const rect = el.getBoundingClientRect();
		activeTooltip?.set({
			id: Math.random().toString(),
			text,
			x: rect.left + rect.width / 2,
			y: position === 'top' ? rect.top : rect.bottom
		});
	}

	function hide() {
		activeTooltip?.set(null);
	}
</script>

<div 
	bind:this={el}
	class="inline-block relative cursor-help"
	onmouseenter={show}
	onmouseleave={hide}
	onfocus={show}
	onblur={hide}
	role="button"
	aria-label={text}
	tabindex="0"
>
	<div class="inline-flex items-center gap-1.5 group">
		{@render children?.()}
		
		<!-- Small knowledge icon indicator -->
		<div class="w-3.5 h-3.5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[8px] text-violet-300 group-hover:bg-violet-500/20 transition-all opacity-40 group-hover:opacity-100">
			?
		</div>
	</div>
</div>
