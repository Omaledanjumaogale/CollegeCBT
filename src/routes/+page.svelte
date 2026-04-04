<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import ProblemSection from '$lib/components/ProblemSection.svelte';
	import FeaturesSection from '$lib/components/FeaturesSection.svelte';
	import HowItWorks from '$lib/components/HowItWorks.svelte';
	import CurriculumBrowser from '$lib/components/CurriculumBrowser.svelte';
	import DashboardPreview from '$lib/components/DashboardPreview.svelte';
	import Testimonials from '$lib/components/Testimonials.svelte';
	import PricingSection from '$lib/components/PricingSection.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import CTABanner from '$lib/components/CTABanner.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';

	// SEO metadata is handled in +layout.svelte, but we can override if needed
	// The current monolithic logic is now fully modularized for enterprise-grade maintainability.
</script>

<svelte:head>
	<title>CollegeCBT — AI Exam Practice for Nigerian Higher Institutions</title>
	<meta name="description" content="Unlimited AI-generated exam questions, timed WAEC-graded mock exams, and AI Readiness Score for 550+ Nigerian universities, polytechnics, and colleges of education." />
</svelte:head>

<div class="landing-page overflow-x-hidden">
	<!-- High-fidelity Hero Section with Interactive Demo -->
	<Hero />

	<!-- Real-time Platform Statistics -->
	<Stats />

	<!-- Problem Identification & RaaS Value Proposition -->
	<ProblemSection />

	<!-- Platform Features & AI Capabilities -->
	<FeaturesSection />

	<!-- The Success Journey (Step-by-Step) -->
	<HowItWorks />

	<!-- National Higher Education Curriculum Browser -->
	<section id="curriculum" class="py-24 relative overflow-hidden bg-black/10">
		<div class="page-container">
			<div class="text-center mb-16">
				<div class="section-tag">📚 Nigerian Higher Education Curriculum</div>
				<h2 class="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight">
					<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">550+ Institutions.</span>
					<br />
					Every Level. Every Course.
				</h2>
				<p class="text-white/55 max-w-2xl mx-auto text-lg leading-relaxed font-semibold">
					Browse the full curriculum for Nigerian Universities, Polytechnics, and Colleges of Education. Select any course to generate context-aware AI practice questions.
				</p>
			</div>

			<!-- Institution Stats Row -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
				{#each [
					{ num: '309+', lbl: 'Universities', badge: 'NUC', color: '#7c3aed' },
					{ num: '78+', lbl: 'Polytechnics', badge: 'NBTE', color: '#f59e0b' },
					{ num: '163+', lbl: 'Colleges of Education', badge: 'NCCE', color: '#22c55e' },
					{ num: '50+', lbl: 'IEIs & Technical', badge: 'IEI', color: '#22d3ee' }
				] as s}
					<div class="glass-card p-6 text-center border-white/5 bg-white/5 transition-transform hover:scale-105">
						<div class="font-display font-title text-3xl mb-1" style="color:{s.color};">{s.num}</div>
						<div class="text-[10px] text-white/50 mb-3 font-bold uppercase tracking-widest leading-none">{s.lbl}</div>
						<span class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter" style="background:{s.color}15; color:{s.color}; border: 1px solid {s.color}25;">{s.badge} Approved</span>
					</div>
				{/each}
			</div>

			<!-- Core Curriculum Browser Component -->
			<div class="glass-card p-4 sm:p-8 bg-white/5 border-white/10 shadow-2xl">
				<CurriculumBrowser />
			</div>
		</div>
	</section>

	<section class="py-24 relative overflow-hidden" id="lab-preview">
		<div class="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent pointer-events-none"></div>
		<DashboardPreview />
	</section>

	<Testimonials />

	<PricingSection />

	<FAQ />

	<CTABanner />

	<Footer />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	
	.landing-page {
		--section-spacing: clamp(4rem, 10vw, 8rem);
	}
</style>
