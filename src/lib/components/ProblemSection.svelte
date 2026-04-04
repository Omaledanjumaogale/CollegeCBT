<script lang="ts">
	const problems = [
		{ icon: '📚', title: 'No Practice Questions', desc: 'Old question books are outdated, incomplete, and expensive. Students have no way to practise on-demand for their specific course and level.' },
		{ icon: '🤯', title: 'No Explanations — Just Answers', desc: 'Even when students find questions, they get bare answers with no explanation of why the correct choice is right or why each wrong option fails.' },
		{ icon: '📉', title: 'No Real Performance Feedback', desc: "Students don't know where they stand. No grade predictions, no readiness scores, no insight into weak topics before the real exam." }
	];
</script>

<section id="problem" class="py-24 relative overflow-hidden" aria-labelledby="problem-heading">
	<div class="page-container">
		<div class="text-center mb-16">
			<div class="section-tag">⚡ The Problem</div>
			<h2 id="problem-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				Why Nigerian Students
				<br />
				<span style="background:linear-gradient(135deg,#e11d48,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Struggle in Exams</span>
			</h2>
			<p class="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
				The current system is broken. Students have syllabi but no quality practice questions. They are forced to memorise rather than understand.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
			{#each problems as p}
				<div class="glass-card p-8 group transition-all duration-300 hover:-translate-y-2 border-rose-500/10">
					<div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-amber-500 opacity-20 transition-opacity group-hover:opacity-100"></div>
					<div class="text-5xl mb-6 flex justify-center sm:justify-start">{p.icon}</div>
					<h3 class="font-display font-bold text-xl sm:text-2xl mb-4 text-white">{p.title}</h3>
					<p class="text-white/60 text-sm sm:text-base leading-relaxed">{p.desc}</p>
				</div>
			{/each}
		</div>

		<!-- RaaS Banner -->
		<div class="rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-2xl" 
			style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(132, 204, 22, 0.08)); border: 1px solid rgba(124, 58, 237, 0.25);">
			<div class="absolute inset-x-0 bottom-0 h-px bg-white/10"></div>
			<div class="text-6xl lg:text-7xl flex-shrink-0 animate-bounce-slow">🎯</div>
			<div class="text-center md:text-left">
				<h3 class="font-display font-bold text-2xl lg:text-3xl mb-4 text-white">We Don't Sell Software. We Deliver <br class="hidden sm:block" /> <span style="color:#84cc16;">Results.</span></h3>
				<p class="text-white/65 text-base sm:text-lg leading-relaxed max-w-3xl">
					CollegeCBT operates as a <strong class="text-white">Results-as-a-Service (RaaS)</strong> platform. We measure success by one metric only: <span style="color:#84cc16;" class="font-bold underline decoration-white/20 underline-offset-4">your exam score</span>. Our AI tracks your performance trajectory, predicts your readiness, and keeps generating questions until you hit 75%.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes bounce-slow {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
	.animate-bounce-slow {
		animation: bounce-slow 4s ease-in-out infinite;
	}
</style>
