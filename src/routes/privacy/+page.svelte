<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { buildMeta } from '$lib/seo';

	const seo = buildMeta({
		title: 'Privacy Policy — CollegeCBT',
		description: 'CollegeCBT privacy policy covering student account data, exam practice data, payments, support messages, and platform security.',
		canonical: 'https://collegecbt.ewinproject.org/privacy'
	});
</script>

<SEO {seo} />

<main class="page-container py-20 sm:py-28">
	<article class="glass-card mx-auto max-w-4xl p-6 sm:p-10">
		<p class="section-tag">🔒 Privacy</p>
		<h1 class="font-display mb-4 text-4xl text-white">Privacy Policy</h1>
		<p class="mb-8 text-sm leading-relaxed text-white/60">
			This policy explains how CollegeCBT handles student and operational data. It is a production-ready baseline and should be reviewed with legal counsel before public launch.
		</p>

		<div class="space-y-8 text-sm leading-relaxed text-white/70">
			<section>
				<h2 class="mb-2 text-xl font-bold text-white">1. Data We Collect</h2>
				<p>We collect account details, academic profile details, exam practice activity, subscription status, payment references, support messages, device/session metadata, and analytics needed to operate the platform.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">2. How We Use Data</h2>
				<p>We use data to authenticate users, generate relevant study experiences, sync real-time dashboards, process subscriptions, provide support, prevent abuse, and improve platform quality.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">3. Security</h2>
				<p>Authentication is handled through Firebase. Application data is handled through Convex. Private routes are excluded from offline caching, and administrative actions require role-based checks.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">4. Payments</h2>
				<p>Payment gateways process card, transfer, and wallet details. CollegeCBT stores payment references, plan status, and verification results, not raw card details.</p>
			</section>

			<section>
				<h2 class="mb-2 text-xl font-bold text-white">5. Student Rights</h2>
				<p>Students may request account review, correction, export, or deletion through support. Some records may be retained where required for security, audit, billing, or legal reasons.</p>
			</section>
		</div>
	</article>
</main>
