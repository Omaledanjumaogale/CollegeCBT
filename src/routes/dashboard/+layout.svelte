<script lang="ts">
	import { goto } from '$app/navigation';
	import { activeModal, authLoading, currentUser } from '$lib/stores';

	let { children }: { children?: import('svelte').Snippet } = $props();

	$effect(() => {
		if (!$authLoading && !$currentUser) {
			activeModal.set('login');
			void goto('/auth/login?redirect=/dashboard');
		}
	});
</script>

{#if $authLoading}
	<section class="page-container py-20 min-h-[70vh] flex items-center justify-center">
		<div class="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
			<div class="mx-auto mb-5 h-12 w-12 rounded-2xl bg-violet-500/20 animate-pulse"></div>
			<h1 class="text-xl font-black text-white">Restoring your session</h1>
			<p class="mt-2 text-sm text-white/50">Your dashboard will open as soon as authentication is ready.</p>
		</div>
	</section>
{:else if $currentUser}
	{@render children?.()}
{/if}
