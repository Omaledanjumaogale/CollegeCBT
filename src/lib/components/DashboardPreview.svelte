<script lang="ts">
	const heatmap = [
		{ topic: 'Data Structures', pct: 88, color: '#84cc16' },
		{ topic: 'Computer Networks', pct: 64, color: '#f59e0b' },
		{ topic: 'DB Normalization', pct: 45, color: '#e11d48' },
		{ topic: 'Algorithms', pct: 71, color: '#84cc16' }
	];
</script>

<section id="dashboard-preview" class="py-24 relative overflow-hidden" aria-labelledby="dash-heading">
	<!-- Decorative background orb -->
	<div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] bg-lime-600 opacity-5 pointer-events-none"></div>

	<div class="page-container">
		<div class="text-center mb-16">
			<div class="section-tag">📊 Student Dashboard Preview</div>
			<h2 id="dash-heading" class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
				Your Personal
				<br />
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Results Command Centre</span>
			</h2>
			<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-semibold">
				Track performance, AI readiness score, topic heatmaps, and grade predictions from your personalised dashboard — updated in real-time.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
			<!-- AI Readiness Score Card -->
			<div class="glass-card p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-lime-500/20" 
				style="background: linear-gradient(135deg, rgba(132, 204, 22, 0.08), rgba(15, 23, 42, 0.6)); border: 1px solid rgba(132, 204, 22, 0.2);">
				<div class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 mb-3">AI Readiness Score™</div>
				<div class="font-display font-black text-6xl sm:text-7xl mb-4 leading-none" style="color:#84cc16;">78</div>
				
				<div class="flex justify-between text-[10px] sm:text-xs font-bold uppercase mb-2">
					<span class="text-rose-500">Fail Zone</span>
					<span class="text-lime-500">Pass Zone</span>
				</div>
				
				<div class="h-3 rounded-full mb-6 bg-white/5 border border-white/5 p-[2px]">
					<div class="h-full rounded-full shadow-[0_0_15px_rgba(132,204,22,0.4)]" style="width:78%; background: linear-gradient(90deg, #dc2626, #f59e0b 45%, #84cc16);"></div>
				</div>
				
				<div class="p-3 rounded-xl text-xs font-bold flex items-center gap-3 animate-pulse-subtle" 
					style="background: rgba(132, 204, 22, 0.08); border: 1px solid rgba(132, 204, 22, 0.2);">
					<span class="text-lg">📈</span>
					<span class="text-lime-500">On track for A1 (85%+) in 2 weeks</span>
				</div>
				
				<!-- Subtle background text for enterprise look -->
				<div class="absolute -bottom-4 -right-1 opacity-[0.03] text-8xl font-black font-display pointer-events-none select-none">READINESS</div>
			</div>

			<!-- Grade Prediction Card -->
			<div class="glass-card p-8 lg:p-10 flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-violet-500/20">
				<div class="font-display font-bold text-lg sm:text-xl mb-6 text-white flex items-center gap-2">
					<span>🔮</span> Predicted Grade — <span class="text-violet-light underline underline-offset-4 decoration-violet-500/40">DBMS</span>
				</div>
				<div class="space-y-4 flex-1">
					<div class="flex items-center justify-between p-4 rounded-2xl bg-lime-DEFAULT/5 border border-lime-DEFAULT/20 shadow-sm transition-transform hover:translate-x-1">
						<span class="text-sm sm:text-base font-bold text-white/70">Grade Baseline</span>
						<span class="font-display font-black text-2xl" style="color:#84cc16;">B2 — 72%</span>
					</div>
					<div class="flex items-center justify-between p-4 rounded-2xl bg-violet-DEFAULT/5 border border-violet-DEFAULT/20 shadow-sm transition-transform hover:translate-x-1 hover:delay-75">
						<span class="text-sm sm:text-base font-bold text-white/70">National Rank</span>
						<span class="text-sm sm:text-base font-black text-violet-light uppercase tracking-tighter">Top 27% (NUC)</span>
					</div>
					<div class="flex items-center justify-between p-4 rounded-2xl bg-amber-DEFAULT/5 border border-amber-DEFAULT/20 shadow-sm transition-transform hover:translate-x-1 hover:delay-150">
						<span class="text-sm sm:text-base font-bold text-white/70">To Reach A1</span>
						<span class="text-sm sm:text-base font-black text-amber-DEFAULT uppercase tracking-tighter">12 Correct Answers</span>
					</div>
				</div>
			</div>

			<!-- Topic Heatmap Card -->
			<div class="glass-card p-8 lg:p-10 flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-amber-500/20">
				<div class="font-display font-bold text-lg sm:text-xl mb-8 text-white flex items-center gap-2">
					<span>🌡️</span> Personal Topic Heatmap
				</div>
				<div class="space-y-6 flex-1">
					{#each heatmap as h}
						<div class="group cursor-default">
							<div class="flex justify-between items-end text-xs font-bold uppercase tracking-wider mb-2 transition-all">
								<span class="text-white/50 group-hover:text-white/80">{h.topic}</span>
								<span style="color:{h.color};" class="text-sm font-black group-hover:scale-110 origin-right transition-transform">{h.pct}%</span>
							</div>
							<div class="h-2 rounded-full bg-white/5 border border-white/5 p-[1px] overflow-hidden">
								<div class="h-full rounded-full transition-all duration-1000 ease-out delay-150 w-0 group-hover:w-[{h.pct}%]" 
									style="width:{h.pct}%; background:{h.color};"></div>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-8 text-[10px] text-white/30 font-bold uppercase tracking-widest text-center border-t border-white/5 pt-4">Updated 4 minutes ago</div>
			</div>
		</div>

		<div class="text-center group">
			<a href="/dashboard" class="btn-violet px-10 py-5 text-lg font-black tracking-tight rounded-[20px] transition-all duration-500 shadow-violet group-hover:scale-105">
				📊 Access Full Command Centre →
			</a>
			<div class="mt-6 flex justify-center items-center gap-4 text-xs font-bold text-white/30 uppercase tracking-widest pointer-events-none">
				<span>Real-time Sync</span>
				<div class="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></div>
				<span>Convex Backend</span>
			</div>
		</div>
	</div>
</section>
