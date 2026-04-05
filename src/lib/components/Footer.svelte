<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="border-t border-white/8 py-20 relative overflow-hidden" 
	style="background: linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.8));">
	
	<!-- Background orb -->
	<div class="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] bg-violet-600/5 pointer-events-none"></div>

	<div class="page-container relative z-10 px-6 sm:px-12">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 items-start">
			<!-- Brand Column -->
			<div class="flex flex-col items-start gap-8">
				<a href="/" class="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
					<div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-lime-500 p-0.5 shadow-xl shadow-violet-900/20">
						<div class="w-full h-full rounded-2xl bg-[#0d0820] flex items-center justify-center font-display font-black text-2xl text-white">C</div>
					</div>
					<div class="font-display font-black text-3xl group-hover:text-violet-light transition-colors text-white tracking-tighter">College<span class="text-lime-500">CBT</span></div>
				</a>
				<p class="text-white/40 text-base leading-relaxed font-semibold max-w-sm">
					Nigeria's #1 AI-powered exam preparation engine for higher institutions. Aligned to NUC, NBTE, and NCCE curriculum.
				</p>
				<div class="flex gap-4">
					{#each ['Twitter', 'LinkedIn', 'Facebook'] as platform}
						<a href="#{platform}" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
							<span class="text-sm font-black italic">{platform[0]}</span>
						</a>
					{/each}
				</div>
			</div>

			<!-- Product Column -->
			<div class="flex flex-col gap-8">
				<h4 class="font-display font-black text-lg text-white uppercase tracking-widest text-shadow-sm">The Platform</h4>
				<ul class="flex flex-col gap-4">
					{#each [
						{ name: 'Exam Lab', link: '/exam-lab' },
						{ name: 'Mock Exam Engine', link: '/exam-lab' },
						{ name: 'Curriculum Browser', link: '/#curriculum' },
						{ name: 'AI Readiness Score', link: '/dashboard' }
					] as link}
						<li><a href={link.link} class="text-white/40 text-sm font-bold uppercase tracking-wider hover:text-violet-light transition-colors">{link.name}</a></li>
					{/each}
				</ul>
			</div>

			<!-- Company Column -->
			<div class="flex flex-col gap-8">
				<h4 class="font-display font-black text-lg text-white uppercase tracking-widest text-shadow-sm">Organization</h4>
				<ul class="flex flex-col gap-4">
					{#each [
						{ name: 'Pricing', link: '/pricing' },
						{ name: 'Terms of Service', link: '/terms' },
						{ name: 'Privacy Policy', link: '/privacy' },
						{ name: 'Contact Us', link: 'mailto:support@collegecbt.dev' }
					] as link}
						<li><a href={link.link} class="text-white/40 text-sm font-bold uppercase tracking-wider hover:text-violet-light transition-colors">{link.name}</a></li>
					{/each}
				</ul>
			</div>

			<!-- Trust Column -->
			<div class="flex flex-col gap-8">
				<h4 class="font-display font-black text-lg text-white uppercase tracking-widest text-shadow-sm">Enterprise Support</h4>
				<div class="glass-card p-6 bg-white/5 border-white/10 shadow-large rounded-2xl w-full">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></div>
						<span class="text-[10px] font-black uppercase tracking-widest text-lime-500">Systems Operational</span>
					</div>
					<p class="text-white/60 text-xs font-bold leading-relaxed mb-4 uppercase tracking-tighter">Real-time sync enabled across 309+ universities via Convex Edge nodes.</p>
					<a href="mailto:support@collegecbt.dev" class="text-xs font-black text-violet-light underline underline-offset-4 decoration-violet-500/20 hover:decoration-violet-500 transition-all">Connect with Support →</a>
				</div>
			</div>
		</div>

		<!-- Footer Bottom -->
		<div class="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-10">
			<div class="flex flex-col items-center sm:items-start gap-2">
				<div class="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em]">© {year} COLLEGE<span class="text-violet-400">CBT</span> TECHNOLOGIES</div>
				<div class="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">A Platform under the Elite Workforce Impact Nigeria (E-WIN) Project Ecosystem</div>
			</div>
			
			<div class="flex items-center gap-10 opacity-30 grayscale group-hover:grayscale-0 transition-all scale-75 sm:scale-100">
				<div class="text-center">
					<div class="font-display font-black text-lg text-white leading-none">NUC</div>
					<div class="text-[8px] font-bold text-white/50 uppercase tracking-widest">Compliant</div>
				</div>
				<div class="text-center">
					<div class="font-display font-black text-lg text-white leading-none">NBTE</div>
					<div class="text-[8px] font-bold text-white/50 uppercase tracking-widest">Compliant</div>
				</div>
				<div class="text-center">
					<div class="font-display font-black text-lg text-white leading-none">NCCE</div>
					<div class="text-[8px] font-bold text-white/50 uppercase tracking-widest">Compliant</div>
				</div>
			</div>
		</div>
	</div>
</footer>
