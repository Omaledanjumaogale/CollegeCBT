<script lang="ts">
	import { activeModal } from '$lib/stores';
</script>

<section id="cta" class="py-24 relative overflow-hidden" aria-labelledby="cta-heading">
	<!-- Background orbs — Nigeria theme -->
	<div class="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2" style="background:rgba(22,163,74,0.08);"></div>
	<div class="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none" style="background:rgba(234,88,12,0.05);"></div>

	<div class="page-container relative z-10 px-4">
		<div class="rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center group transition-all duration-700"
			style="background: linear-gradient(135deg, rgba(22,163,74,0.14), rgba(234,88,12,0.06)); border: 1px solid rgba(22,163,74,0.25);">

			<div class="text-7xl lg:text-8xl mb-8 group-hover:scale-110 transition-transform duration-500 animate-pulse-subtle">🎓</div>

			<h2 id="cta-heading" class="font-display font-black text-4xl sm:text-6xl mb-6 tracking-tight leading-none group-hover:translate-y-[-2px] transition-transform" style="color:var(--text);">
				<span class="block">Ready to Score A1?</span>
				<span class="block italic" style="color:var(--violet);">Join 12,000+ Students.</span>
			</h2>

			<p class="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-semibold" style="color:var(--text-muted);">
				Use AI-powered practice to study smarter, understand every answer, and hit your target grade — no guesswork needed.
			</p>

			<div class="flex flex-wrap gap-6 justify-center w-full sm:w-auto">
				<button onclick={() => activeModal.set('signup')} class="w-full sm:w-auto btn-violet px-10 py-5 text-lg font-black tracking-tighter uppercase shadow-violet group-hover:scale-105 transition-all">
					Start Free Today — No Credit Card
				</button>
				<a href="/exam-lab" class="w-full sm:w-auto btn-ghost px-10 py-5 text-lg font-black tracking-tighter uppercase transition-all">
					Try Exam Lab First →
				</a>
			</div>

			<!-- Live indicator -->
			<div class="mt-12 flex items-center justify-center gap-4 text-xs font-bold tracking-[0.2em] uppercase" style="color:var(--text-muted);">
				<div class="w-1.5 h-1.5 rounded-full animate-ping" style="background:var(--violet);"></div>
				<span>Live across 309+ Nigerian Institutions</span>
				<div class="w-1.5 h-1.5 rounded-full animate-ping delay-300" style="background:var(--lime);"></div>
			</div>

			<!-- Large background text -->
			<div class="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-[0.02] text-[15rem] font-black font-display pointer-events-none select-none tracking-tighter w-full text-center">GRADES</div>
		</div>
	</div>
</section>
