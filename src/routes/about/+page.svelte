<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import PageTemplate from '$lib/components/PageTemplate.svelte';
	import RelatedLinks from '$lib/components/RelatedLinks.svelte';
	import { buildMeta } from '$lib/seo';
	import { buildOrganizationSchema, buildBreadcrumbSchema } from '$lib/schema/builders';
	import { buildPageGraph } from '$lib/schema/graph';

	const siteUrl = 'https://collegecbt.ewinproject.org';
	const pageUrl = `${siteUrl}/about`;

	const orgSchema = buildOrganizationSchema({
		name: 'Elite Workforce Impact Nigeria (E-WIN) Project',
		url: 'https://ewinproject.org',
		logo: 'https://ewinproject.org/logo.png',
		description: 'National human-capital development ecosystem accelerating workforce preparedness and engineering skills.',
		sameAs: [
			'https://twitter.com/EWinProject',
			'https://linkedin.com/company/ewinproject'
		]
	});

	const breadcrumbSchema = buildBreadcrumbSchema([
		{ name: 'About', item: '/about' }
	], siteUrl);

	const graph = buildPageGraph([orgSchema, breadcrumbSchema]);

	const seo = buildMeta({
		title: 'About Us — CollegeCBT | Powered by E-WIN',
		description: 'Learn about the mission behind CollegeCBT and the Elite Workforce Impact Nigeria (E-WIN) Project in upgrading academic examination readiness.',
		canonical: pageUrl,
		schemaJsonLd: [graph]
	});

	const relatedResources = [
		{ title: 'Pricing Plans', href: '/pricing', description: 'Explore Student Pro subscription structures and features.' },
		{ title: 'Help & FAQs', href: '/faq', description: 'Common inquiries on exam setups, mock formats, and grades.' }
	];
</script>

<SEO {seo} />

<div class="pt-[80px]">
	<PageTemplate 
		title="Our Academic Mission" 
		subtitle="Empowering Nigerian higher education through context-aware mock simulations and intelligent exam analytics."
		category="Elite Workforce Impact Nigeria"
		crumbs={[{ name: 'About', item: '/about' }]}
	>
		<!-- Main Content -->
		<div class="space-y-6 text-white/80">
			<section class="prose prose-invert max-w-none">
				<p class="text-lg leading-relaxed">
					<strong>CollegeCBT</strong> is a specialized computer-based testing engine built under the 
					<strong>Elite Workforce Impact Nigeria (E-WIN) Project</strong>. Our primary mandate is to improve 
					examination preparedness, cognitive retention, and grading accuracy for students in Nigerian Universities, 
					Polytechnics, and Colleges of Education.
				</p>

				<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">The E-WIN Ecosystem Vision</h2>
				<p class="leading-relaxed">
					Nigeria's higher institutions host millions of talented minds. However, access to personalized feedback loops 
					and mock test structures remains a critical barrier to high-grade academic success. CollegeCBT breaks down this 
					barrier by utilizing intelligent exam pattern mapping.
				</p>
				<p class="leading-relaxed">
					By mapping practice templates directly to the National Universities Commission (NUC), National Board for 
					Technical Education (NBTE), and National Commission for Colleges of Education (NCCE) curricula, CollegeCBT delivers 
					context-specific evaluations tailored to each student's course load.
				</p>

				<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">Core Platform Pillars</h2>
				<div class="grid sm:grid-cols-3 gap-6 my-6">
					<div class="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
						<div class="text-2xl mb-2">⚡</div>
						<h3 class="text-sm font-bold text-white mb-2 uppercase tracking-wide">Dynamic Generation</h3>
						<p class="text-xs text-white/50 leading-relaxed">
							Practice questions mapped to the distinct exam profiles of your specific school and course curriculum.
						</p>
					</div>
					<div class="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
						<div class="text-2xl mb-2">📊</div>
						<h3 class="text-sm font-bold text-white mb-2 uppercase tracking-wide">Readiness Prediction</h3>
						<p class="text-xs text-white/50 leading-relaxed">
							Analyze scoring rates, average times per answer, and subject strengths to forecast final exam letter grades.
						</p>
					</div>
					<div class="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
						<div class="text-2xl mb-2">🏆</div>
						<h3 class="text-sm font-bold text-white mb-2 uppercase tracking-wide">National Ranking</h3>
						<p class="text-xs text-white/50 leading-relaxed">
							Compare test scores with fellow students nationwide, building focus and motivation prior to examination date.
						</p>
					</div>
				</div>

				<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">Governing Principles</h2>
				<ul class="list-disc pl-5 space-y-2">
					<li><strong>Accessibility First:</strong> Native desktop and responsive mobile layouts designed to conserve data.</li>
					<li><strong>Accurate Assessment:</strong> Graded rubrics conforming to authentic West African and national higher education standards.</li>
					<li><strong>Academic E-E-A-T:</strong> Developed with advice from Nigerian university lecturers and pedagogy advisors.</li>
				</ul>
			</section>

			<!-- Related Internal link widgets -->
			<RelatedLinks links={relatedResources} />
		</div>

		{#snippet sidebar()}
			<div class="glass-card p-6 border border-white/10 bg-white/5 rounded-2xl">
				<h3 class="text-lg font-bold text-white mb-4">E-WIN Contact Info</h3>
				<div class="space-y-4 text-sm text-white/70">
					<p>
						<span class="block text-xs font-bold text-white/40 uppercase tracking-widest">Office Address</span>
						Elite Workforce Impact Nigeria Hub,<br />
						Abuja, Nigeria.
					</p>
					<p>
						<span class="block text-xs font-bold text-white/40 uppercase tracking-widest">Email Channels</span>
						admin@ewinproject.org
					</p>
					<p>
						<span class="block text-xs font-bold text-white/40 uppercase tracking-widest">Official Web Link</span>
						<a href="https://ewinproject.org" class="text-violet-400 hover:underline">ewinproject.org</a>
					</p>
				</div>
			</div>
		{/snippet}
	</PageTemplate>
</div>
