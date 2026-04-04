<script lang="ts">
	import { notifications } from '$lib/toast.svelte';
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
</script>

<div class="notification-stack fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-3 w-[90%] max-w-sm pointer-events-none">
	{#each notifications.list as t (t.id)}
		<div
			animate:flip={{ duration: 300 }}
			class="pointer-events-auto cursor-pointer"
			role="alert"
			aria-live="polite"
			transition:fade={{ duration: 200 }}
			onclick={() => notifications.dismiss(t.id)}
		>

			<div class="glass-card p-4 shadow-2xl relative overflow-hidden group"
				class:border-lime-500={t.type === 'success'}
				class:border-rose-500={t.type === 'error'}
				class:border-amber-400={t.type === 'warning'}
				class:border-violet-DEFAULT={t.type === 'info' || !t.type}
			>
				<div class="flex items-start gap-3">
					<div class="text-lg">
						{#if t.type === 'success'}✅{:else if t.type === 'error'}❌{:else if t.type === 'warning'}⚠️{:else}ℹ️{/if}
					</div>
					<div class="flex-1 min-w-0">
						<div class="font-bold text-sm mb-0.5 text-white">{t.title}</div>
						<div class="text-xs text-white/60 leading-relaxed">{t.message}</div>
					</div>
					<button class="text-white/20 hover:text-white/40 transition-colors">
						✕
					</button>
				</div>
				
				<!-- Progress bar for auto-dismiss -->
				{#if t.duration !== 0}
					<div class="absolute bottom-0 left-0 h-0.5 bg-white/10 w-full">
						<div class="h-full bg-white/20 transition-all duration-linear" 
							 style="animation: progress-shrink {(t.duration ?? 5000)/1000}s linear forwards;"></div>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes progress-shrink {
		from { width: 100%; }
		to { width: 0%; }
	}
	.notification-stack {
		perspective: 1000px;
	}
</style>

