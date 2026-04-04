<script lang="ts">
	import { activeModal } from '$lib/stores';
</script>

<section id="cta" class="py-24 relative overflow-hidden" aria-labelledby="cta-heading">
	<!-- Background bubbles -->
	<div class="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] bg-violet-600/10 pointer-events-none -translate-y-1/2"></div>
	<div class="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] bg-lime-600/5 pointer-events-none"></div>

	<div class="page-container relative z-10 px-4">
		<div class="rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center group transition-all duration-700 hover:shadow-[0_0_80px_rgba(124,58,237,0.15)] hover:border-violet-500/30" 
			style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.22), rgba(132, 204, 22, 0.08)); border: 1px solid rgba(124, 58, 237, 0.3);">
			
			<div class="text-7xl lg:text-8xl mb-8 group-hover:scale-110 transition-transform duration-500 animate-pulse-subtle">🎓</div>
			
			<h2 id="cta-heading" class="font-display font-black text-4xl sm:text-6xl mb-6 text-white tracking-tight leading-none group-hover:translate-y-[-2px] transition-transform">
				<span class="block">Ready to Score A1?</span>
				<span class="block text-violet-light italic">Join 12,000+ Students.</span>
			</h2>
			
			<p class="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-semibold">
				Experience the power of AI-driven study. Practise smarter, understand explanations, and achieve your target grade — guaranteed.
			</p>
			
			<div class="flex flex-wrap gap-6 justify-center w-full sm:w-auto">
				<button onclick={() => activeModal.set('signup')} class="w-full sm:w-auto btn-violet px-10 py-5 text-lg font-black tracking-tighter uppercase shadow-violet group-hover:scale-105 transition-all">
					Start Free Today — No Credit Card
				</button>
				<a href="/exam-lab" class="w-full sm:w-auto btn-ghost px-10 py-5 text-lg font-black tracking-tighter uppercase border-white/10 text-white/70 group-hover:bg-white/10 group-hover:text-white transition-all">
					Try Exam Lab First →
				</a>
			</div>
			
			<!-- AI Proof -->
			<div class="mt-12 flex items-center justify-center gap-4 text-xs font-bold text-white/30 tracking-[0.2em] uppercase">
				<div class="w-1.5 h-1.5 rounded-full bg-lime-500 animate-ping"></div>
				<span>Results as a Service — CollegeCBT Ecosystem</span>
				<div class="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping delay-300"></div>
			</div>
			
			<!-- Large background text -->
			<div class="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-[0.02] text-[15rem] font-black font-display pointer-events-none select-none tracking-tighter w-full text-center">GRADES</div>
		</div>
	</div>
</section>
