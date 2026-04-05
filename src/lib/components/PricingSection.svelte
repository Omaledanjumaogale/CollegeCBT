<script lang="ts">
	import { activeModal } from '$lib/stores';

	const pricing = [
		{ 
			name: 'Free Forever', 
			price: '0', 
			period: 'No payment needed · Forever free', 
			cta: 'Start Free Today', 
			link: '/exam-lab',
			features: [
				{ text: '5 AI questions per day', included: true },
				{ text: 'Simple answer explanations', included: true },
				{ text: '3 mock exams per month', included: true },
				{ text: 'Full curriculum selection', included: true },
				{ text: 'Exam Readiness Score', included: false },
				{ text: 'Grade prediction', included: false },
				{ text: 'Performance certificate', included: false }
			]
		},
		{ 
			name: 'Student Pro', 
			price: '10,000', 
			period: 'per year · Full access for 12 months', 
			cta: 'Pay ₦10,000 → Get Pro', 
			link: '/pricing',
			popular: true,
			features: [
				{ text: 'Unlimited AI-generated questions', included: true },
				{ text: 'Full explanations for every answer', included: true },
				{ text: 'Unlimited mock exams (A1-F9 grades)', included: true },
				{ text: 'Theory questions with model answers', included: true },
				{ text: 'Exam Readiness Score (0–100)', included: true },
				{ text: 'Grade tracking & progress charts', included: true },
				{ text: 'Compare with other students nationwide', included: true },
				{ text: 'Downloadable official certificate', included: true }
			]
		}
	];
</script>

<section id="pricing" class="py-24 relative overflow-hidden" aria-labelledby="price-prev-heading">
	<div class="page-container">
		<div class="text-center mb-16">
			<div class="section-tag">💰 Simple Pricing</div>
			<h2 id="price-prev-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				One Plan.
				<br />
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Full Success.</span>
			</h2>
			<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-semibold">
				Pay once a year in Nigerian Naira. No hidden fees. Pay with card, bank transfer, or USSD via Flutterwave or KoraPay.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch px-4 max-w-4xl mx-auto">
			{#each pricing as plan}
				<div class="glass-card flex flex-col p-1 group transition-all duration-500 hover:scale-[1.02]" class:border-violet-500={plan.popular}>
					<div class="glass-card flex-1 p-8 lg:p-10 relative overflow-hidden flex flex-col items-start bg-white/5 border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-300"
						style={plan.popular ? 'background:linear-gradient(135deg,rgba(124,58,237,0.22),rgba(168,85,247,0.12)); border: 1.5px solid rgba(124,58,237,0.4); box-shadow: 0 20px 60px rgba(124,58,237,0.2);' : ''}>
						
						{#if plan.popular}
							<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-violet-600 text-white whitespace-nowrap shadow-xl z-20">⭐ Student Choice</div>
						{/if}

						<div class="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">{plan.name}</div>
						
						<div class="font-display font-black text-6xl leading-none mb-2 text-white flex items-start">
							<span class="font-body text-2xl font-bold align-super mt-1">₦</span>
							{plan.price}
						</div>
						
						<div class="text-[10px] sm:text-xs font-bold text-white/40 mb-10 tracking-tight leading-relaxed">{plan.period}</div>
						
						<ul class="space-y-4 mb-12 flex-1 w-full">
							{#each plan.features as f}
								<li class="flex items-start gap-3 transition-opacity duration-300" class:opacity-30={!f.included}>
									<span class="text-lg flex-shrink-0" class:text-lime-500={f.included} class:text-rose-500={!f.included}>
										{f.included ? '✓' : '✗'}
									</span>
									<span class="text-sm sm:text-base font-bold tracking-tight text-white/80">{f.text}</span>
								</li>
							{/each}
						</ul>
						
						<a href={plan.link} class="w-full py-4 text-sm sm:text-base text-center font-black rounded-2xl transition-all duration-500 uppercase tracking-widest
							{plan.popular ? 'btn-violet shadow-violet group-hover:scale-[1.03]' : 'btn-ghost group-hover:bg-white/10 group-hover:text-white'}">
							{plan.cta}
						</a>
						
						{#if plan.popular}
							<!-- Shine effect -->
							<div class="absolute top-0 -left-full w-full h-[300%] bg-white/5 -rotate-45 transition-all duration-1000 group-hover:left-[150%] pointer-events-none"></div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Trust Strip -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 px-6 rounded-3xl bg-black/20 border border-white/5 animate-pulse-subtle">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-[#6d28d9] flex items-center justify-center text-white font-black text-xs">K</div>
				<span class="font-display font-black text-xl italic text-white tracking-tighter">KoraPay</span>
				<div class="w-px h-6 bg-white/10 mx-1"></div>
				<span class="font-display font-black text-xl italic text-white tracking-tighter">Flutterwave</span>
			</div>
			<div class="hidden sm:block w-px h-6 bg-white/10 mx-2"></div>
			<p class="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center sm:text-left leading-relaxed">
				🔒 Secure Payments · Card · Bank Transfer · USSD · POS · Nigeria Native Infrastructure
			</p>
		</div>

		<!-- Recommendation Banner -->
		<div class="mt-8 overflow-hidden relative group rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-large"
			style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(132, 204, 22, 0.08)); border: 1px solid rgba(124, 58, 237, 0.3);">
			<div class="flex-1 text-center md:text-left">
				<div class="font-display font-black text-2xl lg:text-3xl text-white mb-2 tracking-tight">💡 Focus on Your Success</div>
				<p class="text-white/55 text-base sm:text-lg leading-relaxed font-semibold">
					Student Pro gives you everything you need for the entire academic year. One payment, zero worries.
				</p>
			</div>
			<div class="flex flex-col items-center gap-2">
				<a href="/pricing" class="btn-violet px-10 py-4 text-base shadow-violet flex-shrink-0 group-hover:scale-[1.05] transition-transform">
					Get Pro Access →
				</a>
				<span class="text-[10px] text-lime-500 font-bold uppercase tracking-widest">Recommended for Every Student</span>
			</div>
		</div>
	</div>
</section>
