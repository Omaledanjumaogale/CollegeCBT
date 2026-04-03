<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import BgMesh from '$lib/components/BgMesh.svelte';
	import { onMount } from 'svelte';
	import { authLoading } from '$lib/stores';
	import { browser } from '$app/environment';

	onMount(async () => {
		// Only initialize Firebase on the client (browser) — never on the edge
		if (!browser) return;
		try {
			const { initAuth } = await import('$lib/services/firebase');
			await initAuth();
		} catch (err) {
			console.warn('[CollegeCBT] Auth init failed, continuing in demo mode:', err);
			authLoading.set(false);
		}
	});
</script>

<svelte:head>
	<title>CollegeCBT — AI Exam Practice for Nigerian Higher Institutions</title>
	<meta name="description" content="Unlimited AI-generated exam questions, timed mock exams, and grade prediction for all Nigerian universities, polytechnics, and colleges of education. Powered by Claude AI." />
	<meta name="keywords" content="CollegeCBT, Nigerian university exam practice, WAEC grading, AI exam questions, CBT practice, polytechnic exam, college of education" />
	<meta property="og:title" content="CollegeCBT — AI Exam Practice for Nigerian Higher Institutions" />
	<meta property="og:description" content="Unlimited AI exam questions, timed mock exams, and grade prediction for 550+ Nigerian institutions." />
	<meta property="og:url" content="https://collegecbt.ewinproject.org" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://collegecbt.ewinproject.org/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="CollegeCBT — AI Exam Lab for Nigerian Students" />
	<meta name="twitter:description" content="Practice smarter with AI-generated exam questions for 550+ Nigerian institutions." />
	<link rel="canonical" href="https://collegecbt.ewinproject.org" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json">
	{JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "CollegeCBT",
		"applicationCategory": "EducationalApplication",
		"operatingSystem": "All",
		"url": "https://collegecbt.ewinproject.org",
		"description": "Enterprise-grade Exam Preparation Platform for Nigerian Students featuring AI question generation and grade prediction.",
		"offers": {
			"@type": "AggregateOffer",
			"priceCurrency": "NGN",
			"lowPrice": "0",
			"highPrice": "5000",
			"offerCount": "2"
		},
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://collegecbt.ewinproject.org/exam-lab?course={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	})}
	</script>
</svelte:head>

<div class="min-h-screen" style="background:#0d0820;">
	<BgMesh />
	<Navbar />
	<main class="relative z-10" id="main-content">
		<slot />
	</main>
	<AuthModal />
	<Toast />
</div>
