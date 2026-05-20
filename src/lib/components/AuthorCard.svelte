<!-- src/lib/components/AuthorCard.svelte -->
<script lang="ts">
	interface AuthorProps {
		name?: string;
		title?: string;
		credentials?: string;
		avatar?: string;
		url?: string;
		twitter?: string;
		linkedin?: string;
	}

	let {
		name = 'Omale Danjuma Ogale',
		title = 'Founder & CEO',
		credentials = 'Senior Systems Architect & Educational Tech Pioneer',
		avatar = '/avatars/danjuma.png',
		url = 'https://danjumaomaleogale.ewinproject.org',
		twitter = 'https://twitter.com/EWinProject',
		linkedin = 'https://linkedin.com/company/ewinproject'
	}: AuthorProps = $props();
</script>

<div class="author-card p-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row items-center sm:items-start gap-5 my-8" itemscope itemtype="https://schema.org/Person">
	<link itemprop="url" href={url} />
	
	<!-- Avatar -->
	<div class="relative w-16 h-16 rounded-full overflow-hidden border border-violet-500/30 flex-shrink-0 bg-violet-950 flex items-center justify-center">
		{#if avatar && avatar !== '/avatars/danjuma.png'}
			<img src={avatar} alt={name} itemprop="image" class="w-full h-full object-cover" />
		{#else}
			<!-- Visual User Initials Icon -->
			<span class="text-xl font-bold text-violet-300">OD</span>
		{/if}
	</div>

	<!-- Content Details -->
	<div class="text-center sm:text-left flex-grow">
		<h4 class="text-lg font-bold text-white mb-0.5" itemprop="name">{name}</h4>
		<p class="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wide" itemprop="jobTitle">{title}</p>
		<p class="text-sm text-white/60 leading-relaxed mb-4">
			{credentials}. Leading the development of enterprise solutions under the <strong>Elite Workforce Impact Nigeria (E-WIN) Project Ecosystem</strong>.
		</p>
		
		<!-- Social Channels -->
		<div class="flex items-center justify-center sm:justify-start gap-4">
			{#if twitter}
				<a href={twitter} target="_blank" rel="noopener noreferrer" class="text-white/40 hover:text-white transition-colors" aria-label="Twitter Page">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
					</svg>
				</a>
			{/if}
			{#if linkedin}
				<a href={linkedin} target="_blank" rel="noopener noreferrer" class="text-white/40 hover:text-white transition-colors" aria-label="LinkedIn Page">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
					</svg>
				</a>
			{/if}
			<a href={url} target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-lime-400 hover:text-lime-300 underline" itemprop="sameAs">
				Author Profile
			</a>
		</div>
	</div>
</div>

<style>
	.author-card {
		backdrop-filter: blur(10px);
	}
</style>
