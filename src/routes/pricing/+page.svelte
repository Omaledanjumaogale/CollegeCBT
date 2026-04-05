<script lang="ts">
	import { activeModal, showToast, currentUser } from '$lib/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Load Flutterwave script for inline payment
		const script = document.createElement('script');
		script.src = 'https://checkout.flutterwave.com/v3.js';
		document.head.appendChild(script);
	});

	const plans = [
		{
			name: 'Free Forever',
			price: '0',
			period: 'No credit card required · Forever free',
			features: [
				{ included: true, text: '5 AI questions per day' },
				{ included: true, text: 'Basic answer explanations' },
				{ included: true, text: '3 mock exams per month' },
				{ included: true, text: 'Full curriculum selection' },
				{ included: false, text: 'Detailed AI answer logic' },
				{ included: false, text: 'Essay questions & model answers' },
				{ included: false, text: 'AI Readiness Score & grade prediction' },
				{ included: false, text: 'Performance certificate download' },
				{ included: false, text: 'Priority support' }
			],
			cta: 'Start Free Today',
			ctaStyle: 'ghost',
			highlight: false
		},
		{
			name: 'Student Pro',
			price: '10,000',
			period: 'per year · Full access for 12 months',
			badge: '⭐ Most Popular',
			annualNote: '₦10,000/year for everything you need to succeed',
			features: [
				{ included: true, text: 'Unlimited AI-generated questions' },
				{ included: true, text: 'Full explanations + answer logic' },
				{ included: true, text: 'Unlimited mock exams with official grades' },
				{ included: true, text: 'Detailed essay questions with model answers' },
				{ included: true, text: 'AI Readiness Score (0–100)' },
				{ included: true, text: 'Grade prediction & progress tracking' },
				{ included: true, text: 'National student ranking' },
				{ included: true, text: 'Downloadable performance certificate' },
				{ included: true, text: 'Custom study focus & question sets' },
				{ included: true, text: 'Priority AI assistant support' },
				{ included: true, text: 'Topic success charts' }
			],
			cta: 'Get Student Pro →',
			ctaStyle: 'violet',
			highlight: true,
			planId: 'pro'
		}
	];

	function handlePayment(plan: typeof plans[0]) {
		if (!plan.planId) {
			activeModal.set('login');
			return;
		}

		if (!$currentUser) {
			showToast('⚠️ Wait', 'Please login to upgrade your account', 'info');
			activeModal.set('login');
			return;
		}

		// Clean price for URL
		const amount = plan.price.replace(',', '');
		goto(`/checkout?plan=${plan.planId}&amount=${amount}`);
	}
</script>

<svelte:head>
	<title>Pricing — CollegeCBT | Simple Nigerian Naira Pricing</title>
	<meta name="description" content="Simple pricing for CollegeCBT. Pay in Nigerian Naira via Flutterwave or Korapay. Free plan available, Student Pro at only ₦10,000/year." />
</svelte:head>

<div class="pt-[100px] pb-20">
	<div class="page-container">
		<!-- Header -->
		<div class="text-center mb-12">
			<div class="section-tag">💰 Pricing Plans</div>
			<h1 class="font-display text-4xl sm:text-5xl mb-4">
				Simple Pricing. <span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Nigerian Naira.</span>
			</h1>
			<p class="text-white/50 max-w-xl mx-auto">No foreign currency conversion. Pay with Flutterwave or KoraPay — card, bank transfer, USSD, or POS. Cancel anytime.</p>
		</div>

		<!-- Pricing Grid — centered for 2 cards -->
		<div class="flex flex-wrap justify-center gap-6 mb-10">
			{#each plans as plan}
				<div class="w-full md:w-[360px]">
				<div class="glass-card p-7 relative flex flex-col transition-all hover:-translate-y-1 {plan.highlight ? 'border-violet-DEFAULT/50 shadow-violet' : ''}" style="{plan.highlight ? 'background:linear-gradient(135deg,rgba(124,58,237,0.22),rgba(168,85,247,0.12));' : ''}">
					{#if plan.badge}
						<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-violet-DEFAULT text-white whitespace-nowrap">{plan.badge}</div>
					{/if}

					<div class="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{plan.name}</div>
					<div class="font-title text-6xl leading-none mb-1"><sup class="font-body font-bold text-2xl align-super">₦</sup>{plan.price}</div>
					<div class="text-xs text-white/40 mb-6">{plan.period}</div>

					<div class="space-y-2.5 mb-7 flex-1">
						{#each plan.features as feat}
							<div class="flex items-start gap-2.5 text-sm">
								<span class="flex-shrink-0 mt-0.5 font-bold {feat.included ? 'text-lime-DEFAULT' : 'text-rose-DEFAULT'}">{feat.included ? '✓' : '✗'}</span>
								<span class="{feat.included ? 'text-white/80' : 'text-white/35'}">{feat.text}</span>
							</div>
						{/each}
					</div>

					<button
						onclick={() => handlePayment(plan)}
						class="w-full min-h-[44px] flex justify-center items-center py-3 rounded-xl font-bold text-sm transition-all {plan.ctaStyle === 'violet' ? 'btn-violet shadow-violet' : plan.ctaStyle === 'lime' ? 'btn-outline-lime' : 'btn-ghost'}"
					>
						{plan.cta}
					</button>
				</div>
				</div>
			{/each}
		</div>

		<div class="glass-card p-4 flex flex-wrap items-center justify-center gap-4 mb-8">
			<div class="flex items-center gap-2">
				<div class="font-bold text-xs px-3 py-1.5 rounded-lg" style="background:#00C3F7;color:#fff;">Flutterwave</div>
				<div class="font-bold text-xs px-3 py-1.5 rounded-lg" style="background:#6d28d9;color:#fff;">KoraPay</div>
			</div>
			<div class="h-4 w-px bg-white/10 hidden sm:block"></div>
			<div class="flex items-center gap-2 opacity-30 grayscale">
				<div class="text-[10px] font-bold uppercase tracking-wider">Coming Soon:</div>
				<div class="font-bold text-[9px] px-2 py-1 border border-white/20 rounded">Paystack</div>
				<div class="font-bold text-[9px] px-2 py-1 border border-white/20 rounded">Seerbit</div>
			</div>
			<p class="text-xs text-white/40 w-full text-center mt-2">🔒 Secure payments · Card · Bank Transfer · USSD · POS · Nigeria-native infrastructure</p>
		</div>

		<!-- Secure Payment Banner -->
		<div class="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style="background:linear-gradient(135deg,rgba(124,58,237,0.18),rgba(132,204,22,0.08)); border:1px solid rgba(132,204,22,0.25);">
			<div class="flex items-center gap-4">
				<div class="text-4xl">🛡️</div>
				<div>
					<div class="font-bold text-lg mb-1">Secure & Guaranteed Success</div>
					<p class="text-sm text-white/50">Your payment is processed through secure, bank-level encryption. Start your journey to A1 grades today.</p>
				</div>
			</div>
			<button
				onclick={() => handlePayment(plans[1])}
				class="btn-violet px-8 min-h-[44px] flex justify-center items-center w-full sm:w-auto text-sm font-bold flex-shrink-0"
			>
				Upgrade Now →
			</button>
		</div>
	</div>
</div>
