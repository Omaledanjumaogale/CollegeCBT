<script lang="ts">
	const problems = [
		{ icon: '📚', title: 'Hard to Find Questions', desc: 'Old practice books are hard to find and expensive. Students often have no way to practice for their specific course and level.' },
		{ icon: '🤯', title: 'Bare Answers - No Help', desc: 'Most books only give the answer (A, B, C). They don’t explain WHY it is correct or why other options are wrong.' },
		{ icon: '📉', title: 'No Way to Track Progress', desc: "Students don't know if they are truly ready. There are no score predictions or insights into which topics need more work." }
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
				The current way of studying is broken. Students have the syllabus but no quality practice questions. Most end up memorizing rather than understanding.
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

		<!-- Success Banner -->
		<div class="rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-2xl mx-4 md:mx-0" 
			style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(132, 204, 22, 0.08)); border: 1px solid rgba(124, 58, 237, 0.25);">
			<div class="absolute inset-x-0 bottom-0 h-px bg-white/10"></div>
			<div class="text-6xl lg:text-7xl flex-shrink-0 animate-bounce-slow">🎯</div>
			<div class="text-center md:text-left">
				<h3 class="font-display font-bold text-2xl lg:text-3xl mb-4 text-white">We Focus on Your <br class="hidden sm:block" /> <span style="color:#84cc16;">Final Score.</span></h3>
				<p class="text-white/65 text-base sm:text-lg leading-relaxed max-w-3xl font-medium">
					CollegeCBT is built for one thing: <span style="color:#84cc16;" class="font-bold underline decoration-white/20 underline-offset-4">helping you pass your exams</span>. Our AI tracks your progress, tells you exactly when you are ready, and gives you practice questions until you are confident in every topic.
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
