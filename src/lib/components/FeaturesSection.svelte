<script lang="ts">
	const features = [
		{ icon: '🤖', title: 'AI Question Bank', desc: 'Unlimited, fresh, randomized questions generated on-demand by Claude AI for any topic, course, or level across all Nigerian higher institutions. Never repeat a question.', color: '#7c3aed', tag: 'Powered by Claude' },
		{ icon: '⏱️', title: 'Mock Exam Engine', desc: 'Timed countdown (90s/question), auto-submit, WAEC-style grading (A1–F9). Full exam simulation with performance report and topic heatmap at the end.', color: '#84cc16', tag: 'A1–F9 Grading' },
		{ icon: '📊', title: 'Results Intelligence', desc: 'AI Readiness Score (0–100), grade prediction, topic-level heatmaps, national benchmarking, and downloadable performance certificates.', color: '#f59e0b', tag: 'RaaS Core' },
		{ icon: '🎯', title: 'Distractor Analysis', desc: 'Every wrong option explained — understand exactly why your answer was wrong and the specific misconception behind each distractor. Deep learning, not memorisation.', color: '#22d3ee', tag: 'Deep Learning' },
		{ icon: '🏛️', title: '550+ Institutions', desc: 'Universities (NUC), Polytechnics (NBTE), Colleges of Education (NCCE), and IEIs. Every level, every course — 100L through Postgraduate.', color: '#a855f7', tag: '309+ Universities' },
		{ icon: '📝', title: 'Theory Questions', desc: 'Essay questions with AI-generated model answers, mark schemes, key points with marks allocation, and examiner notes — exactly as your lecturers expect.', color: '#e11d48', tag: 'Mark Schemes' }
	];
</script>

<section id="features" class="py-24 relative overflow-hidden" aria-labelledby="features-heading">
	<!-- Decorative background orb -->
	<div class="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] bg-violet-600 opacity-5 pointer-events-none"></div>
	
	<div class="page-container">
		<div class="text-center mb-20">
			<div class="section-tag">✨ Platform Features</div>
			<h2 id="features-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				Everything You Need to
				<br />
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Excel in Exams</span>
			</h2>
			<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
				Six enterprise-grade capabilities working together to guarantee your exam result — not just prepare you for it.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
			{#each features as feat}
				<div class="feature-card p-1 group transition-all duration-500 hover:scale-[1.02]">
					<div class="glass-card h-full p-8 relative overflow-hidden flex flex-col items-start text-left border-white/5 bg-white/5 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/10 group-hover:shadow-2xl">
						<!-- Accent line at top -->
						<div class="absolute top-0 left-0 right-0 h-1 transition-all duration-500 origin-left" style="background:{feat.color}; opacity: 0.15; transform: scaleX(0.1);" class:scale-x-100={true}></div>
						
						<div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:translate-x-1 transition-transform" 
							style="background:{feat.color}20; border: 1px solid {feat.color}35;">
							{feat.icon}
						</div>
						
						<h3 class="font-display font-bold text-xl sm:text-2xl mb-4 text-white group-hover:text-white transition-colors">{feat.title}</h3>
						<p class="text-white/55 text-sm sm:text-base leading-relaxed mb-8 font-medium flex-1 group-hover:text-white/70 transition-colors">{feat.desc}</p>
						
						<div class="pt-6 border-t border-white/5 w-full flex items-center justify-between">
							<span class="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest transition-all duration-300" style="background:{feat.color}15; color:{feat.color}; group-hover:scale-105">{feat.tag}</span>
							<a href="/exam-lab" class="text-xs font-bold transition-all duration-300 hover:translate-x-1 flex items-center gap-1.5" style="color:{feat.color};">
								Try it free 
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
