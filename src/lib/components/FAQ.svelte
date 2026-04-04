<script lang="ts">
	let openFaq = $state(-1);

	const faqs = [
		{ q: 'How does the AI generate relevant exam questions for my specific course?', a: "CollegeCBT uses Anthropic's Claude AI trained on vast academic literature. When you select your institution, course, level and topic, Claude generates fresh, contextual questions aligned with NUC, NBTE, or NCCE curriculum — never repeated." },
		{ q: 'Is CollegeCBT suitable for all Nigerian higher institutions?', a: "Yes. All 309+ accredited universities (NUC), 78+ polytechnics (NBTE), 163+ Colleges of Education (NCCE), and IEIs are covered — 100 Level through Postgraduate and HND." },
		{ q: 'What is the difference between Exam Lab and Mock Exam?', a: "Exam Lab is open-ended practice — one question at a time, explanation shown immediately. Mock Exam simulates real exam conditions: 90 seconds per question, auto-submitted on timeout, WAEC grading (A1–F9), full performance report." },
		{ q: 'How does payment work? Can I pay in Naira?', a: "Yes — all pricing is in Nigerian Naira (₦). We support Verve, Mastercard, Visa, bank transfer, USSD, and POS via Paystack. No dollar card needed. The Free plan needs no payment at all." },
		{ q: 'What is the AI Readiness Score and how is it calculated?', a: "The AI Readiness Score (0–100) is a composite of your correct-answer rate, study streak, timed vs untimed performance, and topic coverage breadth. A score of 75+ indicates exam readiness." },
		{ q: 'What is "Results as a Service" (RaaS)?', a: "RaaS means we measure our success by your exam score. CollegeCBT tracks your grade trajectory, predicts readiness, and provides targeted practice until you hit 75%. Pro students get guaranteed success." }
	];
</script>

<section id="faq" class="py-24 relative overflow-hidden" aria-labelledby="faq-heading">
	<div class="page-container max-w-4xl px-4">
		<div class="text-center mb-16">
			<div class="section-tag">❓ Common Questions</div>
			<h2 id="faq-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				Questions About
				<br />
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> CollegeCBT</span>
			</h2>
			<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-semibold">
				Everything you need to know about our AI study platform and how it helps you secure target grades.
			</p>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, i}
				<div class="glass-card overflow-hidden group transition-all duration-300" class:border-violet-500={openFaq === i}>
					<button
						onclick={() => openFaq = (openFaq === i ? -1 : i)}
						class="w-full text-left px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-6 transition-all group-hover:bg-white/5"
						aria-expanded={openFaq === i}
						id="faq-btn-{i}"
						aria-controls="faq-panel-{i}"
					>
						<span class="font-display font-bold text-lg sm:text-xl text-white group-hover:text-violet-light transition-colors leading-tight">
							{faq.q}
						</span>
						<div class="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300"
							class:rotate-45={openFaq === i} class:bg-violet-600={openFaq === i} class:border-violet-600={openFaq === i}>
							<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
								<line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line>
							</svg>
						</div>
					</button>
					
					{#if openFaq === i}
						<div id="faq-panel-{i}" role="region" aria-labelledby="faq-btn-{i}" 
							class="px-6 sm:px-8 pb-6 sm:pb-8 text-white/55 text-sm sm:text-base leading-relaxed tracking-tight border-t border-white/5 pt-5 animate-fade-down">
							<p class="font-medium bg-white/5 p-5 rounded-2xl border border-white/10">{faq.a}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Still have questions footer -->
		<div class="mt-16 text-center">
			<div class="p-6 rounded-[24px] bg-white/5 border border-white/5 inline-flex flex-col sm:flex-row items-center gap-6 group hover:border-violet-500 transition-all">
				<p class="text-white/40 text-sm font-bold uppercase tracking-widest">Still have questions?</p>
				<div class="flex items-center gap-3">
					<a href="mailto:support@collegecbt.dev" class="text-violet-light font-black text-lg underline underline-offset-4 decoration-violet-500/20 group-hover:decoration-violet-500/80 transition-all">
						support@collegecbt.dev
					</a>
					<span class="text-lg">📩</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes fade-down {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-down {
		animation: fade-down 0.3s ease-out forwards;
	}
</style>
