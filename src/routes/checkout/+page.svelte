<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { currentUser, showToast } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let planId = $page.url.searchParams.get('plan') || 'pro';
	let amount = parseInt($page.url.searchParams.get('amount') || '10000', 10);
	let selectedGateway = 'flutterwave';
	let loading = false;

	const gateways = [
		{ id: 'flutterwave', name: 'Flutterwave', icon: '💳', active: true, color: '#00C3F7' },
		{ id: 'korapay', name: 'Korapay', icon: '⚡', active: true, color: '#6d28d9' },
		{ id: 'paystack', name: 'Paystack', icon: '⏳', active: false, color: '#09a5db', note: 'Coming Soon' },
		{ id: 'seerbit', name: 'Seerbit', icon: '⏳', active: false, color: '#ea580c', note: 'Coming Soon' }
	];

	onMount(() => {
		// Load Flutterwave
		const flwScript = document.createElement('script');
		flwScript.src = 'https://checkout.flutterwave.com/v3.js';
		document.head.appendChild(flwScript);

		// Load Korapay
		const koraScript = document.createElement('script');
		koraScript.src = 'https://korapay.com/v1/checkout.js';
		document.head.appendChild(koraScript);
	});

	async function handlePayment() {
		if (!$currentUser) {
			showToast('⚠️ Identity Required', 'Please login to continue with the payment.', 'info');
			goto('/pricing');
			return;
		}

		loading = true;
		const tx_ref = `CBT-${$currentUser.uid}-${Date.now()}`;

		if (selectedGateway === 'flutterwave') {
			//@ts-ignore
			if (typeof FlutterwaveCheckout !== 'function') {
				showToast('❌ Error', 'Flutterwave is still loading. Please try again.', 'error');
				loading = false;
				return;
			}

			const flwKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOXDEMOKEY-X';

			//@ts-ignore
			FlutterwaveCheckout({
				public_key: flwKey,
				tx_ref: tx_ref,
				amount: amount,
				currency: 'NGN',
				payment_options: 'card, banktransfer, ussd',
				customer: {
					email: $currentUser.email,
					name: $currentUser.displayName || 'Student',
				},
				customizations: {
					title: `CollegeCBT ${planId.toUpperCase()}`,
					description: `Annual ${planId} Subscription`,
					logo: 'https://collegecbt.dev/favicon.png',
				},
				callback: function (data: any) {
					loading = false;
					if (data.status === 'successful' || data.status === 'completed') {
						showToast('✅ Success', 'Payment complete! Upgrading your account...', 'success');
						setTimeout(() => goto('/dashboard'), 3000);
					}
				},
				onclose: () => { loading = false; }
			});
		} else if (selectedGateway === 'korapay') {
			//@ts-ignore
			if (typeof Korapay === 'undefined') {
				showToast('❌ Error', 'Korapay is still loading. Please try again.', 'error');
				loading = false;
				return;
			}

			const koraKey = import.meta.env.VITE_KORAPAY_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxx';

			//@ts-ignore
			window.Korapay.initialize({
				key: koraKey,
				reference: tx_ref,
				amount: amount,
				currency: 'NGN',
				customer: {
					name: $currentUser.displayName || 'Student',
					email: $currentUser.email,
				},
				notification_url: window.location.origin + '/api/webhooks/korapay',
				onClose: () => { loading = false; },
				onSuccess: (data: any) => {
					loading = false;
					showToast('✅ Success', 'Payment received via Korapay! Redirecting...', 'success');
					setTimeout(() => goto('/dashboard'), 3000);
				},
				onFailed: (data: any) => {
					loading = false;
					showToast('❌ Failed', 'Korapay payment failed.', 'error');
				}
			});
		}
	}
</script>

<svelte:head>
	<title>Checkout — CollegeCBT Enterprise Payment</title>
</svelte:head>

<div class="pt-[100px] pb-20 min-h-screen flex items-center">
	<div class="page-container max-w-2xl mx-auto">
		<div class="glass-card p-8 relative overflow-hidden">
			<!-- Decoration -->
			<div class="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] -mr-32 -mt-32"></div>
			
			<div class="relative z-10">
				<button onclick={() => goto('/pricing')} class="text-xs text-white/40 hover:text-white mb-6 flex items-center gap-1 transition-colors">
					← Back to Pricing
				</button>

				<div class="mb-8">
					<h1 class="text-3xl font-display mb-2">Complete Your Upgrade</h1>
					<p class="text-white/50 text-sm">Securely upgrade your account to Student Pro.</p>
				</div>

				<!-- Plan Summary -->
				<div class="bg-white/5 rounded-2xl p-5 mb-8 border border-white/10">
					<div class="flex justify-between items-center mb-4">
						<div>
							<div class="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">Selected Plan</div>
							<div class="text-xl font-bold">Student Pro Access</div>
						</div>
						<div class="text-right">
							<div class="text-xs text-white/40 mb-1">Total Amount</div>
							<div class="text-2xl font-title leading-none">₦{amount.toLocaleString()}</div>
						</div>
					</div>
					<div class="pt-4 border-t border-white/5 space-y-2">
						<div class="flex items-center gap-2 text-xs text-white/60">
							<span class="text-lime-DEFAULT">✓</span> 12 Months of full access
						</div>
						<div class="flex items-center gap-2 text-xs text-white/60">
							<span class="text-lime-DEFAULT">✓</span> All pro features included
						</div>
					</div>
				</div>

				<!-- Gateway Selection -->
				<div class="mb-8">
					<h3 class="block text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Choose Payment Method</h3>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each gateways as gateway}
							<button 
								onclick={() => gateway.active && (selectedGateway = gateway.id)}
								class="relative flex items-center justify-between p-4 rounded-2xl border transition-all {gateway.active ? 'hover:bg-white/5' : 'opacity-40 cursor-not-allowed'} {selectedGateway === gateway.id ? 'border-violet-DEFAULT bg-violet-DEFAULT/5' : 'border-white/10'}"
							>
								<div class="flex items-center gap-3">
									<span class="text-xl">{gateway.icon}</span>
									<div class="text-left">
										<div class="text-sm font-bold">{gateway.name}</div>
										{#if gateway.note}
											<div class="text-[10px] text-white/40 italic">{gateway.note}</div>
										{/if}
									</div>
								</div>
								{#if selectedGateway === gateway.id}
									<div class="w-4 h-4 rounded-full bg-violet-DEFAULT flex items-center justify-center">
										<div class="w-1.5 h-1.5 rounded-full bg-white"></div>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<button 
					onclick={handlePayment}
					disabled={loading}
					class="w-full btn-violet py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-violet transition-transform active:scale-[0.98] disabled:opacity-50"
				>
					{#if loading}
						<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						Processing...
					{:else}
						🔒 Secure Pay ₦{amount.toLocaleString()} →
					{/if}
				</button>

				<p class="text-center text-[10px] text-white/30 mt-6 max-w-sm mx-auto leading-relaxed">
					By clicking pay, you agree to our terms of service. Payments are processed by {selectedGateway === 'flutterwave' ? 'Flutterwave' : 'Korapay'}, a PCIDSS compliant infrastructure.
				</p>
			</div>
		</div>
	</div>
</div>
