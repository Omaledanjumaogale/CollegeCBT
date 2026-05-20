<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { currentUser, showToast } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';

	const reference = $page.url.searchParams.get('reference') || '';
	const gateway = $page.url.searchParams.get('gateway') || 'gateway';

	// Svelte-Convex query for real-time plan status tracking
	const syncedProfile = useQuery(api.users.getUserByUid, () => ({ 
		uid: $currentUser?.uid || '' 
	}));

	let timeElapsed = $state(0);
	let interval: any;

	// Watcher for reactive plan verification
	$effect(() => {
		if (syncedProfile.data && syncedProfile.data.plan === 'pro') {
			showToast('🎉 Account Upgraded', 'Your Student Pro plan has been activated successfully!', 'success');
			// Wait 3 seconds to let the beautiful success card show, then redirect
			const timer = setTimeout(() => {
				goto('/dashboard');
			}, 3500);
			return () => clearTimeout(timer);
		}
	});

	onMount(() => {
		interval = setInterval(() => {
			timeElapsed += 1;
			if (timeElapsed >= 30 && (!syncedProfile.data || syncedProfile.data.plan !== 'pro')) {
				showToast('⏳ Taking a bit longer', 'The bank is still processing the webhook. We are continuing to verify.', 'info');
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Payment Successful — CollegeCBT</title>
</svelte:head>

<div class="pt-[120px] pb-24 min-h-screen flex items-center bg-[var(--bg)] transition-colors duration-300">
	<div class="page-container max-w-xl mx-auto px-4 w-full">
		<div class="glass-card p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-[var(--glass-border)] bg-[var(--card)] rounded-[24px] text-center">
			
			<!-- Decorative Background Blobs -->
			<div class="absolute top-0 right-0 w-64 h-64 bg-lime-600/10 blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
			<div class="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

			{#if !syncedProfile.data || syncedProfile.data.plan !== 'pro'}
				<!-- Polling Webhook verification state -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="relative mb-8">
						<!-- Pulse Ring Loader -->
						<div class="absolute inset-0 rounded-full bg-[var(--violet)]/10 animate-ping scale-150"></div>
						<div class="relative w-20 h-20 rounded-full bg-[var(--bg-alt)] border-2 border-[var(--violet)]/30 border-t-[var(--violet)] flex items-center justify-center animate-spin">
						</div>
						<!-- Centered Lock Icon inside rotating circle -->
						<div class="absolute inset-0 flex items-center justify-center">
							<span class="text-xl">🔒</span>
						</div>
					</div>

					<h1 class="text-2xl font-bold font-display text-[var(--text)] mb-3">Verifying Payment</h1>
					<p class="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed mb-6">
						We are confirming transaction <code class="bg-[var(--bg-alt)] px-2 py-0.5 rounded text-[var(--violet-light)] font-mono text-xs">{reference || 'N/A'}</code> with {gateway}.
					</p>

					<div class="w-full bg-[var(--bg-alt)] border border-[var(--glass-border)] rounded-2xl p-4 text-xs text-[var(--text-muted)] leading-relaxed space-y-2">
						<div class="flex justify-between">
							<span>Status:</span>
							<span class="font-bold text-[var(--violet-light)] animate-pulse">Checking credentials...</span>
						</div>
						<div class="flex justify-between">
							<span>Seconds elapsed:</span>
							<span class="font-mono">{timeElapsed}s</span>
						</div>
					</div>
					
					<p class="text-[10px] text-[var(--text-muted)]/60 mt-6 max-w-[280px]">
						Please do not refresh this page or click back. Your account will automatically refresh once the gateway process completes.
					</p>
				</div>
			{:else}
				<!-- Completed Upgrade Success state -->
				<div class="relative z-10 flex flex-col items-center animate-fade-in">
					<!-- Success animated circle -->
					<div class="w-24 h-24 rounded-full bg-[var(--lime)]/10 border-4 border-[var(--lime)] flex items-center justify-center mb-8 shadow-lg shadow-[var(--lime)]/20 scale-up">
						<!-- Animated Checkmark -->
						<svg class="w-12 h-12 text-[var(--lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>

					<h1 class="text-3xl font-extrabold font-display text-[var(--text)] mb-3 tracking-tight">Upgrade Complete!</h1>
					<p class="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed mb-8">
						Thank you! Transaction <span class="font-mono text-xs bg-[var(--bg-alt)] px-2 py-1 rounded border border-[var(--glass-border)] text-[var(--text)]">{reference}</span> has been confirmed. Your Student Pro benefits are now active.
					</p>

					<div class="w-full bg-[var(--bg-alt)] border border-[var(--glass-border)] rounded-2xl p-6 mb-8 text-left space-y-3">
						<div class="flex justify-between text-xs border-b border-[var(--glass-border)] pb-2">
							<span class="text-[var(--text-muted)]">Subscription Status:</span>
							<span class="font-bold text-[var(--lime)]">Active (Student Pro)</span>
						</div>
						<div class="flex justify-between text-xs border-b border-[var(--glass-border)] pb-2">
							<span class="text-[var(--text-muted)]">Membership Term:</span>
							<span>1 Year (365 days)</span>
						</div>
						<div class="flex justify-between text-xs">
							<span class="text-[var(--text-muted)]">Billed Via:</span>
							<span class="capitalize">{gateway} Secured Checkout</span>
						</div>
					</div>

					<div class="flex items-center gap-3 text-xs text-[var(--text-muted)] animate-pulse">
						<span>Redirecting to your dashboard in a moment</span>
						<div class="flex gap-1">
							<div class="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-bounce" style="animation-delay: 0s;"></div>
							<div class="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-bounce" style="animation-delay: 0.2s;"></div>
							<div class="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-bounce" style="animation-delay: 0.4s;"></div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Subtle animations for premium touch-and-feel */
	@keyframes scale-up {
		0% { transform: scale(0.6); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}
	.scale-up {
		animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
</style>
