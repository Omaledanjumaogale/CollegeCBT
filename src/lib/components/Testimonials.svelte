<script lang="ts">
	const testimonials = [
		{ quote: "I failed DBMS in 200L. After 3 weeks with CollegeCBT's Exam Lab and Mock Exams, I scored 79% in my 300L resit. The distractor explanations are what made the difference — I finally understood WHY my answers were wrong.", name: 'Emeka Okonkwo', meta: 'Computer Science · 300L · UNN', grade: '🏆 A1 — 79% in DBMS', emoji: '👨🏾‍🎓', color: 'rgba(124,58,237,0.2)' },
		{ quote: 'As a pharmacy student at UNILAG, finding relevant practice questions was nearly impossible. CollegeCBT generated questions specific to Pharmacology at exactly my level. I went from 58% to 81%.', name: 'Fatima Abdullahi', meta: 'Pharmacy · 400L · UNILAG', grade: '🏆 A1 — 81% in Pharmacology', emoji: '👩🏽‍⚕️', color: 'rgba(132,204,22,0.15)' },
		{ quote: "I'm a HND Accountancy student at Yaba Tech and CollegeCBT is the first platform that actually has our level and courses. The mock exam timer prepared me mentally. I went from C4 to B2.", name: 'Chidi Nwosu', meta: 'Accountancy HND · Yaba Tech', grade: '📈 C4 → B2 improvement', emoji: '👨🏿‍💼', color: 'rgba(245,158,11,0.15)' }
	];
</script>

<section id="testimonials" class="py-24 relative overflow-hidden" aria-labelledby="test-heading">
	<!-- Background grid effect -->
	<div class="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.03),transparent)] pointer-events-none"></div>

	<div class="page-container relative z-10">
		<div class="text-center mb-16 px-4">
			<div class="section-tag">💬 Student Success Stories</div>
			<h2 id="test-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				Real Students.
				<br />
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Real Results.</span>
			</h2>
			<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-semibold">
				Nigerian undergraduates across universities and polytechnics sharing their CollegeCBT experience and target grade results.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-0">
			{#each testimonials as t}
				<div class="glass-card p-10 group relative flex flex-col transition-all duration-500 hover:scale-[1.02] border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-2xl">
					<!-- Quote icon -->
					<div class="absolute top-6 right-8 font-display text-8xl text-violet-DEFAULT/5 group-hover:text-violet-DEFAULT/10 leading-none transition-colors select-none pointer-events-none">"</div>
					
					<p class="text-white/80 text-base sm:text-lg italic leading-relaxed mb-10 flex-1 relative z-10 font-medium">
						"{t.quote}"
					</p>
					
					<div class="flex items-center gap-4 pt-8 border-t border-white/5">
						<div class="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 transition-transform group-hover:rotate-12" style="background:{t.color}; border: 1.5px solid rgba(255,255,255,0.05);">
							{t.emoji}
						</div>
						<div class="flex-1 overflow-hidden">
							<div class="font-display font-bold text-lg text-white mb-1 tracking-tight truncate">{t.name}</div>
							<div class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 mb-2 truncate">{t.meta}</div>
							<div class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-lime-500 py-1 px-3 rounded-full bg-lime-500/10 border border-lime-500/20 group-hover:scale-105 transition-transform origin-left">
								{t.grade}
							</div>
						</div>
					</div>

					<!-- Hover glow effect -->
					<div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[80px] bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
				</div>
			{/each}
		</div>

		<!-- National average trust badge -->
		<div class="mt-20 flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale group-hover:grayscale-0 transition-all">
			<div class="text-xs font-bold uppercase tracking-[0.3em] text-white/50 text-center w-full mb-4">Trusted by students from:</div>
			<div class="flex items-center gap-4 text-sm font-black text-white/40"><span class="text-2xl">🏛️</span> 309+ UNIVERSITIES</div>
			<div class="flex items-center gap-4 text-sm font-black text-white/40"><span class="text-2xl">⚡</span> 78+ POLYTECHNICS</div>
			<div class="flex items-center gap-4 text-sm font-black text-white/40"><span class="text-2xl">🎓</span> 163+ COEs</div>
		</div>
	</div>
</section>
