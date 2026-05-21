<script lang="ts">
	import { createTooltipStore, getTooltipStore } from '$lib/stores/tooltip';

	const { subscribe, set, update } = createTooltipStore();

	let activeTooltip = $state<{ text: string; x: number; y: number; visible: boolean }>({ text: '', x: 0, y: 0, visible: false });

	$effect(() => {
		const unsub = subscribe((val) => {
			activeTooltip = val;
		});
		return unsub;
	});
</script>

{#if activeTooltip.visible}
	<div
		class="fixed z-[9999] px-3 py-1.5 rounded-lg text-xs font-medium pointer-events-none shadow-xl transition-opacity"
		style="left:{activeTooltip.x}px;top:{activeTooltip.y - 36}px;background:var(--bg-alt);border:1px solid var(--glass-border);color:var(--text);"
	>
		{activeTooltip.text}
	</div>
{/if}

{@render children?.()}
