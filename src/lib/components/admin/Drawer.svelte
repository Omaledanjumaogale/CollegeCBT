<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	// ── Props & State ──
	let { 
		isOpen, 
		title, 
		subtitle, 
		onClose,
		children,
		footer
	}: {
		isOpen: boolean;
		title: string;
		subtitle?: string;
		onClose: () => void;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div class="fixed inset-0 z-[200] flex justify-end" transition:fade>
		<!-- Backdrop -->
		<div 
			class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
			onclick={onClose}
			role="button"
			tabindex="-1"
			aria-label="Close panel"
			onkeydown={(e) => e.key === 'Escape' && onClose()}
		></div>
		
		<!-- Drawer Body -->
		<aside 
			class="relative w-full max-w-md h-full bg-[#0D0820]/95 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col"
			transition:slide={{ axis: 'x' }}
		>
			<!-- Header -->
			<div class="h-20 flex items-center px-8 border-b border-white/5 justify-between">
				<div>
					<h2 class="font-display text-lg text-white leading-tight">{title}</h2>
					{#if subtitle}
						<p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">{subtitle}</p>
					{/if}
				</div>
				<button 
					onclick={onClose}
					class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors"
					aria-label="Close configuration panel"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
				{#if children}
					{@render children()}
				{/if}
			</div>

			<!-- Footer -->
			{#if footer}
				<div class="p-8 border-t border-white/5 bg-black/40">
					{@render footer()}
				</div>
			{/if}
		</aside>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
</style>
