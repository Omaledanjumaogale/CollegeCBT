<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser, showToast } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { getFirebaseIdToken } from '$lib/services/firebase';

	const gateway = $page.url.searchParams.get('gateway') || 'flutterwave';
	const reference = $page.url.searchParams.get('reference') || '';
	const amount = parseInt($page.url.searchParams.get('amount') || '10000', 10);
	const email = $page.url.searchParams.get('email') || '';

	let loading = $state(false);
	let errorText = $state('');

	async function simulateSuccess() {
		loading = true;
		errorText = '';

		try {
			const idToken = await getFirebaseIdToken();
			if (!idToken) {
				showToast('❌ Session Required', 'Please log in to authorize this simulation.', 'error');
				loading = false;
				return;
			}

			// Post to our server-side mock webhook simulator
			const response = await fetch('/api/payment/mock-trigger', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					gateway,
					amount,
					reference,
					email,
					idToken
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to simulate payment webhook.');
			}

			showToast('✅ Webhook Simulated', 'Simulation processed successfully! Redirecting...', 'success');
			
			// Navigate to the success page to test the polling experience
			setTimeout(() => {
				goto(`/checkout/success?reference=${reference}&gateway=${gateway}`);
			}, 1000);

		} catch (err: any) {
			console.error('[MockGateway] Simulation error:', err);
			errorText = err.message || 'Verification call failed. Make sure your local server is online.';
			showToast('❌ Simulation Failed', errorText, 'error');
			loading = false;
		}
	}

	function simulateFailure() {
		showToast('ℹ️ Simulation Cancelled', 'Payment simulation was marked as failed.', 'info');
		goto(`/checkout?plan=pro&amount=${amount}`);
	}
</script>

<svelte:head>
	<title>Billing Sandbox — CollegeCBT</title>
</svelte:head>

<div class="pt-[120px] pb-24 min-h-screen flex items-center bg-[var(--bg)] transition-colors duration-300">
	<div class="page-container max-w-xl mx-auto px-4 w-full">
		<div class="glass-card p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-[var(--glass-border)] bg-[var(--card)] rounded-[24px]">
			<!-- Dynamic Amber/Yellow Sandbox Border Tag -->
			<div class="absolute top-0 right-0 bg-amber-500/10 border-b border-l border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-bl-xl font-mono">
				Sandbox Mode
			</div>

			<div class="relative z-10">
				<!-- Header -->
				<div class="mb-8">
					<span class="text-3xl" aria-hidden="true">🛠️</span>
					<h1 class="text-2xl font-bold font-display text-[var(--text)] mt-4 mb-2">Billing Gateway Simulator</h1>
					<p class="text-sm text-[var(--text-muted)] leading-relaxed">
						We detected that your local API keys are placeholders. Use this sandbox panel to mock billing updates and test system synchronization.
					</p>
				</div>

				{#if errorText}
					<div class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex gap-2 items-center">
						<span>⚠️</span>
						<p>{errorText}</p>
					</div>
				{/if}

				<!-- Ledger Metadata Details -->
				<div class="bg-[var(--bg-alt)] border border-[var(--glass-border)] rounded-2xl p-5 mb-8 space-y-3 font-mono text-xs">
					<div class="flex justify-between">
						<span class="text-[var(--text-muted)]">Target Gateway:</span>
						<span class="font-bold text-[var(--text)] capitalize">{gateway}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--text-muted)]">Transaction Reference:</span>
						<span class="font-bold text-[var(--violet-light)]">{reference || 'N/A'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--text-muted)]">Subscription Amount:</span>
						<span class="font-bold text-[var(--text)]">₦{amount.toLocaleString()} NGN</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--text-muted)]">Associated Email:</span>
						<span class="font-bold text-[var(--text)]">{email || 'N/A'}</span>
					</div>
				</div>

				<!-- Interactive Simulators -->
				<div class="space-y-3">
					<button 
						onclick={simulateSuccess}
						disabled={loading}
						class="w-full bg-[var(--violet)] hover:bg-[var(--violet-light)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
					>
						{#if loading}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							<span>Broadcasting simulation...</span>
						{:else}
							<span>Simulate Successful Transaction Webhook ✓</span>
						{/if}
					</button>

					<button 
						onclick={simulateFailure}
						disabled={loading}
						class="w-full bg-white/5 hover:bg-white/10 text-[var(--text)] border border-[var(--glass-border)] py-4 rounded-2xl font-bold flex items-center justify-center transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
					>
						Simulate Failed / Cancelled Webhook ✕
					</button>
				</div>

				<!-- Educational context -->
				<p class="text-center text-[10px] text-[var(--text-muted)]/60 mt-6 leading-relaxed">
					This simulator updates Svelte-Convex state reactively by calling `/api/payment/mock-trigger` on the server and executing the local upgrade mutations.
				</p>
			</div>
		</div>
	</div>
</div>
