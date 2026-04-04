<script lang="ts">
	import { activeModal } from '$lib/stores';

	const steps = [
		{ step: '01', icon: '🎓', title: 'Select Your Course', desc: 'Choose your institution type, course, level, and difficulty. CollegeCBT supports 550+ institutions from 100 Level to Postgraduate.' },
		{ step: '02', icon: '🤖', title: 'Generate & Practise', desc: 'Claude AI generates contextual, curriculum-aligned questions with full distractor explanations instantly. Never the same question twice.' },
		{ step: '03', icon: '⏱️', title: 'Take a Mock Exam', desc: 'Run a timed mock exam with 90 seconds per question. Auto-submit. Get your WAEC grade (A1–F9) and full examiner feedback.' },
		{ step: '04', icon: '📈', title: 'Track Your Score', desc: 'Review your AI Readiness Score, grade prediction, topic heatmap, and personalised study recommendations — updated after every session.' }
	];
</script>

<section id="how-it-works" class="py-24 relative overflow-hidden bg-black/5" aria-labelledby="how-heading">
	<div class="page-container">
		<div class="text-center mb-20">
			<div class="section-tag">🚀 Getting Started</div>
			<h2 id="how-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				From Zero to 75%
				<br />
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> in 4 Steps</span>
			</h2>
			<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-semibold">
				The complete CollegeCBT journey — from choosing your course to walking into the real exam with absolute certainty.
			</p>
		</div>

		<!-- Steps Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 relative px-4 sm:px-0">
			<!-- Connector line (desktop only) -->
			<div class="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px]" style="background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(132,204,22,0.4),transparent);"></div>

			{#each steps as item}
				<div class="text-center group transition-all duration-300 hover:-translate-y-1">
					<div class="relative inline-block mb-8">
						<div class="w-[90px] h-[90px] rounded-[24px] flex items-center justify-center text-4xl mx-auto z-10 relative transition-transform duration-500 group-hover:scale-[1.05]" 
							style="background:rgba(124,58,237,0.12); border: 1.5px solid rgba(124,58,237,0.25);">
							{item.icon}
						</div>
						<div class="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold font-mono z-20 shadow-xl shadow-violet-900/40 border border-violet-400/30">
							{item.step}
						</div>
					</div>
					<h3 class="font-display font-bold text-xl sm:text-2xl mb-4 text-white">{item.title}</h3>
					<p class="text-white/55 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
				</div>
			{/each}
		</div>

		<!-- ResultsGuard Callout -->
		<div class="mt-20 group relative rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden" 
			style="background: linear-gradient(135deg, rgba(132,204,22,0.12), rgba(15,23,42,0.8)); border: 1px solid rgba(132,204,22,0.25);">
			<div class="absolute top-0 left-0 w-2 h-full bg-lime-500"></div>
			<div class="text-6xl flex-shrink-0 animate-pulse-slow">🛡️</div>
			<div class="flex-1 text-center md:text-left">
				<div class="font-display font-black text-2xl lg:text-3xl text-lime-DEFAULT mb-2 tracking-tight uppercase">ResultsGuard™ Protection</div>
				<p class="text-white/70 text-base sm:text-lg leading-relaxed max-w-4xl font-medium">
					Complete 30+ mock exams within your <strong class="text-white">AI Study Contract</strong> and don't hit 75%+? We'll give you a <span class="underline decoration-lime-500 underline-offset-4">free semester extension</span>. Your result is our reputation.
				</p>
			</div>
			<button onclick={() => activeModal.set('signup')} class="btn-violet px-8 py-4 text-base shadow-violet flex-shrink-0 group-hover:scale-[1.05] transition-transform">
				Claim Protection →
			</button>
		</div>
	</div>
</section>

<style>
	@keyframes pulse-slow {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(0.95); }
	}
	.animate-pulse-slow {
		animation: pulse-slow 3s ease-in-out infinite;
	}
</style>
