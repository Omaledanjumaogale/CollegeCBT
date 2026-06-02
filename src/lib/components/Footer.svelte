<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="border-t py-20 relative overflow-hidden"
	style="border-color:var(--glass-border); background: var(--bg-alt);">

	<!-- Subtle background orb -->
	<div class="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full blur-[120px] pointer-events-none" style="background:rgba(22,163,74,0.04);"></div>

	<div class="page-container relative z-10 px-6 sm:px-12">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 items-start">
			<!-- Brand Column -->
			<div class="flex flex-col items-start gap-8">
				<a href="/" class="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
					<div class="w-12 h-12 rounded-2xl p-0.5 shadow-xl" style="background:linear-gradient(135deg,var(--violet),var(--lime));">
						<div class="w-full h-full rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white" style="background:var(--bg-alt);">C</div>
					</div>
					<div class="font-display font-black text-3xl tracking-tighter" style="color:var(--text);">College<span style="color:var(--lime);">CBT</span></div>
				</a>
				<p class="text-base leading-relaxed font-semibold max-w-sm" style="color:var(--text-muted);">
					Nigeria's #1 AI-powered exam preparation platform for higher institutions. Aligned to NUC, NBTE, and NCCE curriculum.
				</p>
				<div class="flex gap-4">
					{#each [
						{ label: 'Twitter/X', href: 'https://twitter.com/EWinProject', mark: 'X' },
						{ label: 'LinkedIn', href: 'https://linkedin.com/company/ewinproject', mark: 'in' },
						{ label: 'Email', href: 'mailto:support@collegecbt.dev', mark: '@' }
					] as platform}
						<a href={platform.href} target={platform.href.startsWith('http') ? '_blank' : undefined} rel={platform.href.startsWith('http') ? 'noopener noreferrer' : undefined} aria-label={platform.label}
							class="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
							style="background:var(--glass);border:1px solid var(--glass-border);color:var(--text-muted);"
							onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--violet)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(22,163,74,0.3)'; }}
							onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; }}>
							<span class="text-sm font-black italic">{platform.mark}</span>
						</a>
					{/each}
				</div>
			</div>

			<!-- Product Column -->
			<div class="flex flex-col gap-8">
				<h4 class="font-display font-black text-lg uppercase tracking-widest" style="color:var(--text);">The Platform</h4>
				<ul class="flex flex-col gap-4">
					{#each [
						{ name: 'Exam Lab', link: '/exam-lab' },
						{ name: 'Mock Exam', link: '/exam-lab' },
						{ name: 'Browse Subjects', link: '/#curriculum' },
						{ name: 'My Exam Score', link: '/dashboard' }
					] as link}
						<li><a href={link.link} class="text-sm font-bold uppercase tracking-wider transition-colors"
							style="color:var(--text-muted);"
							onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--violet)'; }}
							onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
						>{link.name}</a></li>
					{/each}
				</ul>
			</div>

			<!-- Company Column -->
			<div class="flex flex-col gap-8">
				<h4 class="font-display font-black text-lg uppercase tracking-widest" style="color:var(--text);">Company</h4>
				<ul class="flex flex-col gap-4">
					{#each [
						{ name: 'Pricing', link: '/pricing' },
						{ name: 'FAQ', link: '/faq' },
						{ name: 'Terms of Use', link: '/terms' },
						{ name: 'Privacy Policy', link: '/privacy' },
						{ name: 'Contact Us', link: 'mailto:support@collegecbt.dev' }
					] as link}
						<li><a href={link.link} class="text-sm font-bold uppercase tracking-wider transition-colors"
							style="color:var(--text-muted);"
							onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--violet)'; }}
							onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
						>{link.name}</a></li>
					{/each}
				</ul>
			</div>

			<!-- Support Column -->
			<div class="flex flex-col gap-8">
				<h4 class="font-display font-black text-lg uppercase tracking-widest" style="color:var(--text);">Support</h4>
				<div class="glass-card p-6 w-full" style="background:var(--glass);border:1px solid var(--glass-border);">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:var(--violet);"></div>
						<span class="text-[10px] font-black uppercase tracking-widest" style="color:var(--violet);">All Systems Online</span>
					</div>
					<p class="text-xs font-bold leading-relaxed mb-4 uppercase tracking-tighter" style="color:var(--text-muted);">Live sync active across 309+ Nigerian institutions via Convex.</p>
					<a href="mailto:support@collegecbt.dev" class="text-xs font-black underline underline-offset-4 transition-all" style="color:var(--lime);">Get Help →</a>
				</div>
			</div>
		</div>

		<!-- Footer Bottom -->
		<div class="pt-10 flex flex-col sm:flex-row items-center justify-between gap-10" style="border-top:1px solid var(--glass-border);">
			<div class="flex flex-col items-center sm:items-start gap-2">
				<div class="text-[10px] font-bold uppercase tracking-[0.3em]" style="color:var(--text-muted);">© {year} COLLEGE<span style="color:var(--lime);">CBT</span> TECHNOLOGIES</div>
				<div class="text-[10px] font-bold uppercase tracking-widest leading-relaxed" style="color:var(--text-muted);">A Platform under the Elite Workforce Impact Nigeria (E-WIN) Project</div>
			</div>

			<div class="flex items-center gap-10 opacity-40 scale-75 sm:scale-100">
				{#each ['NUC', 'NBTE', 'NCCE'] as body}
					<div class="text-center">
						<div class="font-display font-black text-lg leading-none" style="color:var(--text);">{body}</div>
						<div class="text-[8px] font-bold uppercase tracking-widest" style="color:var(--text-muted);">Compliant</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</footer>
