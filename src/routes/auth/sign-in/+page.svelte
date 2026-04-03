<script lang="ts">
	import { activeModal } from '$lib/stores';
	import { onMount } from 'svelte';

	// Open login modal immediately when this page loads
	onMount(() => {
		activeModal.set('login');
	});
</script>

<svelte:head>
	<title>Sign In — CollegeCBT | Access Your AI Exam Practice Account</title>
	<meta name="description" content="Sign in to your CollegeCBT account to access unlimited AI-generated exam questions, view your results, and track your progress." />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<!-- The AuthModal component in the layout handles the actual sign-in UI -->
<div class="pt-[120px] pb-20 min-h-screen flex items-center justify-center">
	<div class="page-container text-center">
		<div class="text-5xl mb-4">🔑</div>
		<h1 class="font-display text-3xl mb-3">Sign In to CollegeCBT</h1>
		<p class="text-white/50 text-sm max-w-sm mx-auto mb-6">
			Opening the sign-in form... If it doesn't appear, <button
				on:click={() => activeModal.set('login')}
				class="text-violet-light hover:underline font-semibold"
			>click here</button>.
		</p>
		<div class="text-white/30 text-sm">
			Don't have an account? <button
				on:click={() => activeModal.set('signup')}
				class="text-violet-light hover:underline"
			>Create one free →</button>
		</div>
	</div>
</div>
