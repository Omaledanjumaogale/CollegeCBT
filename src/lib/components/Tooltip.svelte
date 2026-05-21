<script lang="ts">
	import { getTooltipStore } from '$lib/stores/tooltip';
	let { text = '' }: { text?: string } = $props();

	const store = getTooltipStore();

	function handleMouseEnter(e: MouseEvent) {
		if (!text) return;
		store.set({
			text,
			x: e.clientX,
			y: e.clientY,
			visible: true,
		});
	}

	function handleMouseMove(e: MouseEvent) {
		if (!text) return;
		store.update((s) => ({ ...s, x: e.clientX, y: e.clientY }));
	}

	function handleMouseLeave() {
		store.update((s) => ({ ...s, visible: false }));
	}
</script>

{#if text}
	<button
		class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold cursor-help flex-shrink-0 ml-1"
		style="background:rgba(124,58,237,0.15); color:var(--violet-light); border:1px solid rgba(124,58,237,0.25);"
		onmouseenter={handleMouseEnter}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		onfocus={() => {}}
		onblur={() => {}}
		type="button"
		aria-label={text}
	>
		?
	</button>
{/if}
