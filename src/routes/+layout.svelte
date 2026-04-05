<script lang="ts">
	import '../app.css';
	import DynamicNavbar from '$lib/components/DynamicNavbar.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import TooltipProvider from '$lib/components/TooltipProvider.svelte';
	import AppPreferencesProvider from '$lib/components/AppPreferencesProvider.svelte';
	import ToastProvider from '$lib/components/ToastProvider.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import BgMesh from '$lib/components/BgMesh.svelte';
	import NetworkMonitor from '$lib/components/NetworkMonitor.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { authLoading, currentUser } from '$lib/stores';
	import { browser } from '$app/environment';
	import { setupConvex, useQuery } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';

	// ── Initialize Convex real-time WebSocket client ──
	// This must run during component init (not onMount) so setContext works
	const CONVEX_URL = 'https://different-warthog-453.eu-west-1.convex.cloud';
	setupConvex(CONVEX_URL);

	onMount(async () => {
		if (!browser) return;

		// 1. Core Auth Initialization
		try {
			const { initAuth } = await import('$lib/services/firebase');
			await initAuth();
		} catch (err) {
			console.warn('[CollegeCBT] Auth init failed:', err);
			authLoading.set(false);
		}

		// 2. Progressive Web Push & Offline Logic
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/sw.js', {
					scope: '/',
					updateViaCache: 'none'
				});
				console.log('[CollegeCBT] Service Worker registered:', registration.scope);

				if ('PushManager' in window) {
					const permission = await Notification.requestPermission();
					if (permission === 'granted') {
						console.log('[CollegeCBT] Push permission granted.');
					}
				}
			} catch (error) {
				console.error('[CollegeCBT] PWA/Push initialization failed:', error);
			}
		}
	});

	const appName = "CollegeCBT";
	const appUrl = "https://collegecbt.dev";
	let { children }: { children?: import('svelte').Snippet } = $props();

	// ── Real-time Enterprise Identity Sync ──
	// Reactively polls Convex for the authoritative user state (role, plan) and patches the local Firebase-hydrated UI store instantly.
	const syncedProfile = useQuery(api.users.getUserByUid, () => ({ uid: $currentUser?.uid || '' }));
	$effect(() => {
		if (syncedProfile.data && $currentUser) {
			const data = syncedProfile.data as any;
			if (data && (data.plan !== $currentUser.plan || data.role !== $currentUser.role || data.institutionName !== $currentUser.institutionName)) {
				currentUser.update(u => u ? { ...u, plan: data.plan, role: data.role, institutionName: data.institutionName } : null);
			}
		}
	});
</script>

<svelte:head>
	<title>{appName} — AI Exam Practice for Nigerian Higher Institutions</title>
	<meta name="description" content="Unlimited AI-generated exam questions, timed mock exams, and grade prediction for all Nigerian universities, polytechnics, and colleges of education. Powered by Claude AI." />
	<meta name="keywords" content="CollegeCBT, Nigerian university exam practice, WAEC grading, AI exam questions, CBT practice, polytechnic exam, college of education, UNILAG, UNN, ABU, JAMB CBT" />
	<link rel="canonical" href={appUrl} />

	<!-- Social Metadata -->
	<meta property="og:title" content="{appName} — AI Exam Practice for Nigerians" />
	<meta property="og:description" content="Practice smarter with AI-generated exam questions for 550+ Nigerian institutions." />
	<meta property="og:url" content={appUrl} />
	<meta property="og:image" content="{appUrl}/og-image.png" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{appName} — AI-Powered Study Engine" />
	<meta name="twitter:description" content="Unlimited AI-generated exam questions for Nigerian higher institutions." />
	<meta name="twitter:image" content="{appUrl}/og-image.png" />

	<!-- Favicons -->
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

	<script type="application/ld+json">
	{JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": appName,
		"applicationCategory": "EducationalApplication",
		"operatingSystem": "All",
		"url": "https://collegecbt.ewinproject.org",
		"description": "Enterprise-grade AI Exam Preparation Platform for Nigerian Students featuring MCQ generation, theory model answers, and grade prediction.",
		"brand": {
			"@type": "Brand",
			"name": "Elite Workforce Impact Nigeria (E-WIN) Project",
			"alternateName": "E-WIN"
		},
		"parentOrganization": {
			"@type": "Organization",
			"name": "Elite Workforce Impact Nigeria (E-WIN) Project",
			"url": "https://ewinproject.org"
		},
		"offers": {
			"@type": "AggregateOffer",
			"priceCurrency": "NGN",
			"lowPrice": "0",
			"highPrice": "25000",
			"offerCount": "3"
		},
		"potentialAction": {
			"@type": "SearchAction",
			"target": `https://collegecbt.ewinproject.org/exam-lab?course={search_term_string}&mode=mock`,
			"query-input": "required name=search_term_string"
		}
	})}
	</script>
</svelte:head>

<div class="min-h-screen" style="background:#0d0820;">
	<BgMesh />
	
	<AppPreferencesProvider>
		<ToastProvider>
			<TooltipProvider>
				<DynamicNavbar />
				<main class="relative z-10 pb-20 md:pb-0" id="main-content">
					{@render children?.()}
				</main>
				<BottomNav />
				<Footer />
			</TooltipProvider>
		</ToastProvider>
	</AppPreferencesProvider>

	<AuthModal />
	<NetworkMonitor />
</div>

