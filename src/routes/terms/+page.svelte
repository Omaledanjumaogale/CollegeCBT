<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { buildMeta } from '$lib/seo';

	const seo = buildMeta({
		title: 'Terms of Service — CollegeCBT',
		description: 'CollegeCBT terms of service for students, departments, administrators, subscriptions, and acceptable platform use.',
		canonical: 'https://collegecbt.ewinproject.org/terms'
	});
</script>

<SEO {seo} />

<main class="page-container py-20 sm:py-28">
	<article class="glass-card mx-auto max-w-4xl p-6 sm:p-10">
		<p class="section-tag">📄 Legal</p>
		<h1 class="font-display mb-4 text-4xl text-white">Terms of Service</h1>
		<p class="mb-8 text-sm leading-relaxed text-white/60">
			These terms explain the expected use of CollegeCBT. They are written in plain English and should be reviewed with legal counsel before final production launch.
		</p>

		<div class="space-y-8 text-sm leading-relaxed text-white/70">
			<section>
				<h2 class="mb-2 text-xl font-bold text-white">1. Platform Use</h2>
				<p>CollegeCBT provides AI-assisted study, practice questions, mock examinations, analytics, and learning support. Students must use the platform for lawful academic preparation only.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">2. Accounts and Access</h2>
				<p>Users are responsible for keeping their login details secure. Administrators must only access student or operational data for valid support, security, billing, or compliance reasons.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">3. AI Content</h2>
				<p>AI-generated questions and answers are study aids. Students should use them alongside course materials, lecturer guidance, and official examination instructions.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">4. Payments and Subscriptions</h2>
				<p>Paid plans unlock additional usage and premium features. Payment confirmation depends on the active payment gateway and successful backend verification.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">5. Acceptable Use</h2>
				<p>Users may not attack the service, bypass limits, scrape private data, resell account access, upload harmful content, or use the platform to assist academic dishonesty.</p>
			</section>
		</div>
	</article>
</main>
