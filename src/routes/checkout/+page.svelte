<script lang="ts">
	import { currentUser, showToast } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getFirebaseIdToken } from '$lib/services/firebase';

	let planId = $page.url.searchParams.get('plan') || 'pro';
	let amount = parseInt($page.url.searchParams.get('amount') || '10000', 10);

	let selectedGateway = $state('flutterwave');
	let loading = $state(false);
	let errorMessage = $state('');

	const gateways = [
		{ 
			id: 'flutterwave', 
			name: 'Flutterwave', 
			icon: '💳', 
			color: '#00C3F7', 
			desc: 'Pay with Cards, Bank Transfer, or USSD' 
		},
		{ 
			id: 'korapay', 
			name: 'Korapay', 
			icon: '⚡', 
			color: '#6d28d9', 
			desc: 'Fast checkout via cards or bank accounts' 
		},
		{ 
			id: 'paystack', 
			name: 'Paystack', 
			icon: '💎', 
			color: '#09a5db', 
			desc: 'Secure checkout with cards, transfer, or bank' 
		},
		{ 
			id: 'seerbit', 
			name: 'Seerbit', 
			icon: '🛡️', 
			color: '#ea580c', 
			desc: 'Secure payments with card, bank, or transfer' 
		}
	];

	async function handlePayment() {
		if (!$currentUser) {
			showToast('⚠️ Registration Required', 'Please log in or register to complete payment.', 'info');
			goto('/pricing');
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			// Extract active Firebase ID Token
			const idToken = await getFirebaseIdToken();
			if (!idToken) {
				showToast('❌ Identity Verification Failed', 'Session expired. Please log in again.', 'error');
				loading = false;
				return;
			}

			// Call secure payment initializer endpoint
			const response = await fetch('/api/payment/initialize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					gateway: selectedGateway,
					amount: amount,
					plan: planId,
					email: $currentUser.email,
					uid: $currentUser.uid,
					idToken: idToken
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Gateway initialization failed.');
			}

			if (result.checkoutUrl) {
				if (result.simulated) {
					showToast('ℹ️ Sandbox Sandbox Mode', 'Testing mode initialized. Redirecting...', 'info');
				} else {
					showToast('🔒 Connection Secure', 'Redirecting to checkout...', 'success');
				}

				// Safe window redirection
				setTimeout(() => {
					window.location.href = result.checkoutUrl;
				}, 1000);
			} else {
				throw new Error('No redirection link returned by server.');
			}

		} catch (err: any) {
			console.error('[Checkout] Payment initialization error:', err);
			errorMessage = err.message || 'Payment service is offline. Please try again.';
			showToast('❌ Payment Failed', errorMessage, 'error');
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Checkout — CollegeCBT Payment</title>
</svelte:head>

<div class="pt-[120px] pb-24 min-h-screen flex items-center bg-[var(--bg)] transition-colors duration-300">
	<div class="page-container max-w-2xl mx-auto px-4 w-full">
		<div class="glass-card p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-[var(--glass-border)] bg-[var(--card)] rounded-[24px]">
			<!-- Dynamic Neon Ambient Overlay -->
			<div class="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 blur-[120px] -mr-36 -mt-36 pointer-events-none"></div>
			<div class="absolute bottom-0 left-0 w-72 h-72 bg-lime-600/5 blur-[120px] -ml-36 -mb-36 pointer-events-none"></div>
			
			<div class="relative z-10">
				<!-- Navigation Back Button -->
				<button 
					onclick={() => goto('/pricing')} 
					disabled={loading}
					class="text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-8 flex items-center gap-2 transition-colors duration-200 disabled:opacity-50"
				>
					<span class="text-sm">←</span> Return to Plan Selection
				</button>

				<!-- Header Title & Subtext -->
				<div class="mb-8">
					<h1 class="text-3xl font-bold font-display tracking-tight text-[var(--text)] mb-2">Upgrade to Student Pro</h1>
					<p class="text-[var(--text-muted)] text-sm leading-relaxed">Choose a local payment processor to instantly unlock your annual learning access.</p>
				</div>

				<!-- Detailed Plan Summary Card -->
				<div class="bg-[var(--bg-alt)] rounded-2xl p-6 mb-8 border border-[var(--glass-border)] transition-colors duration-300">
					<div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 pb-5 border-b border-[var(--glass-border)]">
						<div>
							<div class="text-xs font-bold uppercase tracking-widest text-[var(--violet)] mb-1">Selected Membership</div>
							<div class="text-xl font-bold text-[var(--text)]">Student Pro annual plan</div>
						</div>
						<div>
							<div class="text-xs text-[var(--text-muted)] mb-1 sm:text-right">Price per year</div>
							<div class="text-3xl font-black text-[var(--text)] tracking-tight">₦{amount.toLocaleString()}</div>
						</div>
					</div>
					<div class="space-y-3">
						<div class="flex items-center gap-3 text-xs text-[var(--text-muted)]">
							<span class="text-[var(--lime)] font-bold text-sm">✓</span> 
							<span>Full uninterrupted access to all curriculum platforms for 365 days</span>
						</div>
						<div class="flex items-center gap-3 text-xs text-[var(--text-muted)]">
							<span class="text-[var(--lime)] font-bold text-sm">✓</span> 
							<span>AI-powered exam grading, detailed theory solutions, and statistics dashboard</span>
						</div>
					</div>
				</div>

				<!-- Gateway Selection Form -->
				<div class="mb-8">
					<h3 class="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Select Payment Processor</h3>
					
					{#if errorMessage}
						<div class="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex gap-2 items-center">
							<span>⚠️</span>
							<p>{errorMessage}</p>
						</div>
					{/if}

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{#each gateways as gateway}
							<button 
								onclick={() => !loading && (selectedGateway = gateway.id)}
								disabled={loading}
								class="relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 text-left bg-[var(--bg-alt)] hover:scale-[1.01] hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100 {selectedGateway === gateway.id ? 'border-[var(--violet)] ring-1 ring-[var(--violet)] shadow-violet-500/10 bg-[var(--violet)]/5' : 'border-[var(--glass-border)]'}"
							>
								<div class="flex items-center justify-between w-full mb-3">
									<div class="flex items-center gap-3">
										<span class="text-2xl" aria-hidden="true">{gateway.icon}</span>
										<span class="text-sm font-bold text-[var(--text)]">{gateway.name}</span>
									</div>
									<div class="w-4 h-4 rounded-full border border-[var(--glass-border)] flex items-center justify-center {selectedGateway === gateway.id ? 'border-[var(--violet)] bg-[var(--violet)]' : ''}">
										{#if selectedGateway === gateway.id}
											<div class="w-1.5 h-1.5 rounded-full bg-white"></div>
										{/if}
									</div>
								</div>
								<p class="text-[11px] leading-snug text-[var(--text-muted)]">{gateway.desc}</p>
							</button>
						{/each}
					</div>
				</div>

				<!-- Submit Secure Payment Button -->
				<button 
					onclick={handlePayment}
					disabled={loading}
					class="w-full bg-[var(--violet)] hover:bg-[var(--violet-light)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-violet-600/20 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						<span>Processing your request...</span>
					{:else}
						<span>🔒 Secure Pay ₦{amount.toLocaleString()}</span>
						<span class="text-sm">→</span>
					{/if}
				</button>

				<!-- Security Compliance Assurance -->
				<p class="text-center text-[10px] text-[var(--text-muted)] mt-6 max-w-sm mx-auto leading-relaxed">
					Payments are encrypted and secured. Transactions are completed by your chosen platform (Paystack, Flutterwave, Korapay, or Seerbit) using PCI-DSS compliant protocols.
				</p>
			</div>
		</div>
	</div>
</div>
