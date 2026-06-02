<svelte:head>
	<title>Security — CollegeCBT</title>
	<meta
		name="description"
		content="CollegeCBT security practices for authentication, payment verification, exam integrity, privacy, and incident response."
	/>
</svelte:head>

<section class="page-container py-24">
	<div class="mx-auto max-w-4xl">
		<div class="mb-10">
			<p class="mb-4 text-xs font-black uppercase tracking-[0.3em] text-lime-300">Security Center</p>
			<h1 class="text-4xl font-black tracking-normal text-white sm:text-5xl">How CollegeCBT Protects Students</h1>
			<p class="mt-5 max-w-2xl text-sm leading-7 text-white/55">
				CollegeCBT is designed for guarded AI exam practice, verified payments, controlled access, and auditable learning records.
			</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			{#each [
				{
					title: 'Authentication',
					body: 'Firebase identity is synced with server-side session cookies and Convex role checks for protected dashboards and admin surfaces.'
				},
				{
					title: 'Exam Integrity',
					body: 'Questions, responses, timers, scores, and certificates are tied to session ownership with signed-out local fallback for practice continuity.'
				},
				{
					title: 'Payment Verification',
					body: 'Gateway callbacks are validated with provider signatures or verification hashes before subscription activation, with idempotent ledgers.'
				},
				{
					title: 'Data Protection',
					body: 'Private routes are excluded from service-worker caching, sensitive pages use no-store headers, and secrets are read from runtime environments.'
				}
			] as item}
				<article class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
					<h2 class="text-lg font-black text-white">{item.title}</h2>
					<p class="mt-3 text-sm leading-6 text-white/55">{item.body}</p>
				</article>
			{/each}
		</div>

		<div class="mt-8 rounded-2xl border border-lime-400/20 bg-lime-400/10 p-6">
			<h2 class="text-lg font-black text-lime-200">Report a Security Issue</h2>
			<p class="mt-3 text-sm leading-6 text-white/60">
				Send responsible disclosure reports to
				<a class="font-bold text-lime-200 underline underline-offset-4" href="mailto:support@collegecbt.dev">support@collegecbt.dev</a>.
				Include affected routes, steps to reproduce, impact, and screenshots or logs where safe.
			</p>
		</div>
	</div>
</section>
