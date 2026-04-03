<script lang="ts">
	import { activeModal, showToast } from '$lib/stores';

	const plans = [
		{
			name: 'Free Forever',
			price: '0',
			period: 'No credit card required · Forever free',
			features: [
				{ included: true, text: '5 AI questions per day' },
				{ included: true, text: 'Basic answer explanations' },
				{ included: true, text: '3 mock exams per month' },
				{ included: true, text: 'Full curriculum browser' },
				{ included: false, text: 'Distractor misconception analysis' },
				{ included: false, text: 'Theory questions & model answers' },
				{ included: false, text: 'AI Readiness Score & grade prediction' },
				{ included: false, text: 'Performance certificate download' },
				{ included: false, text: 'National benchmarking' }
			],
			cta: 'Start Free Today',
			ctaStyle: 'ghost',
			highlight: false
		},
		{
			name: 'Student Pro',
			price: '5,000',
			period: 'per semester · or ₦8,500/year (save 15%)',
			badge: '⭐ Most Popular',
			annualNote: 'Pay ₦8,500/year instead of ₦10,000',
			features: [
				{ included: true, text: 'Unlimited AI-generated questions' },
				{ included: true, text: 'Full explanations + distractor analysis' },
				{ included: true, text: 'Unlimited mock exams with WAEC grades' },
				{ included: true, text: 'Theory questions with model answers' },
				{ included: true, text: 'AI Readiness Score (0–100)' },
				{ included: true, text: 'Grade prediction & trajectory chart' },
				{ included: true, text: 'National benchmarking' },
				{ included: true, text: 'Downloadable performance certificate' },
				{ included: true, text: 'Topic heatmap & weak-area alerts' }
			],
			cta: 'Pay ₦5,000 → Start Now',
			ctaStyle: 'violet',
			highlight: true,
			planId: 'pro'
		},
		{
			name: 'Departmental / Institutional',
			price: '25,000',
			period: 'per year · up to 200 students',
			features: [
				{ included: true, text: 'All Pro features for up to 200 students' },
				{ included: true, text: 'Lecturer admin dashboard' },
				{ included: true, text: 'Department-level analytics' },
				{ included: true, text: 'Custom question sets per course' },
				{ included: true, text: 'Cohort performance reports' },
				{ included: true, text: 'Bulk student onboarding' },
				{ included: true, text: 'Priority AI support' },
				{ included: true, text: 'Dedicated account manager' },
				{ included: false, text: 'Unlimited students (contact for enterprise)' }
			],
			cta: 'Pay ₦25,000 → Get Started',
			ctaStyle: 'lime',
			highlight: false,
			planId: 'institutional'
		}
	];

	function handlePayment(plan: typeof plans[0]) {
		if (!plan.planId) {
			activeModal.set('signup');
			return;
		}
		showToast('💳 Payment', `Redirecting to Flutterwave for ${plan.name}...`, 'info');
		// TODO: Integrate Flutterwave payment
	}
</script>

<svelte:head>
	<title>Pricing — CollegeCBT | Simple Nigerian Naira Pricing</title>
	<meta name="description" content="Simple, transparent pricing for CollegeCBT. Pay in Nigerian Naira via Flutterwave. Free plan available, Student Pro at ₦5,000/semester, Institutional at ₦25,000/year." />
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

		<!-- Pricing Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
			{#each plans as plan}
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
						on:click={() => handlePayment(plan)}
						class="w-full py-3.5 rounded-xl font-bold text-sm transition-all {plan.ctaStyle === 'violet' ? 'btn-violet shadow-violet' : plan.ctaStyle === 'lime' ? 'btn-outline-lime' : 'btn-ghost'}"
					>
						{plan.cta}
					</button>
				</div>
			{/each}
		</div>

		<!-- Payment Strip -->
		<div class="glass-card p-4 flex flex-wrap items-center justify-center gap-4 mb-8">
			<div class="font-bold text-xs px-3 py-1.5 rounded-lg" style="background:#00C3F7;color:#fff;">Flutterwave</div>
			<div class="font-bold text-xs px-3 py-1.5 rounded-lg" style="background:#6d28d9;color:#fff;">KoraPay</div>
			<p class="text-xs text-white/40">🔒 Secure payments · Card · Bank Transfer · USSD · POS · Nigeria-native infrastructure</p>
		</div>

		<!-- Annual Banner -->
		<div class="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style="background:linear-gradient(135deg,rgba(124,58,237,0.18),rgba(132,204,22,0.08));">
			<div>
				<div class="font-bold text-lg mb-1">💡 Annual Plan — Save 15%</div>
				<p class="text-sm text-white/50">Pay ₦8,500/year instead of ₦10,000 (2×₦5,000 semesters). Best value for serious students.</p>
			</div>
			<button
				on:click={() => showToast('💳 Annual Plan', 'Redirecting to annual payment...', 'info')}
				class="btn-violet px-6 py-3 text-sm flex-shrink-0"
			>
				Pay ₦8,500/year →
			</button>
		</div>
	</div>
</div>
