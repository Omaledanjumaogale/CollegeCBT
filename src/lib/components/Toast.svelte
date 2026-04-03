<script lang="ts">
	import { toastMessage } from '$lib/stores';
	import { fly } from 'svelte/transition';
</script>

{#if $toastMessage}
	<div
		class="toast-container"
		role="alert"
		aria-live="polite"
		transition:fly={{ y: 80, duration: 350 }}
	>
		<div class="glass-card p-4 shadow-2xl"
			class:border-lime-500={$toastMessage.type === 'success'}
			class:border-rose-500={$toastMessage.type === 'error'}
			class:border-violet-DEFAULT={$toastMessage.type === 'info' || !$toastMessage.type}
		>
			<div class="font-bold text-sm mb-0.5 text-white">{$toastMessage.title}</div>
			<div class="text-xs text-white/60">{$toastMessage.message}</div>
		</div>
	</div>
{/if}
