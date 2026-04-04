<script lang="ts">
	import { activeModal } from '$lib/stores';
	import { onMount } from 'svelte';

	// Open signup modal immediately when this page loads
	onMount(() => {
		activeModal.set('signup');
	});
</script>

<svelte:head>
	<title>Create Account — CollegeCBT | Start Your Free AI Exam Practice</title>
	<meta name="description" content="Create your free CollegeCBT account and start practising with unlimited AI-generated exam questions for Nigerian universities, polytechnics, and colleges." />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<!-- The AuthModal component in the layout handles the actual sign-up UI -->
<div class="pt-[120px] pb-20 min-h-screen flex items-center justify-center">
	<div class="page-container text-center">
		<div class="text-5xl mb-4">🎓</div>
		<h1 class="font-display text-3xl mb-3">Create Your CollegeCBT Account</h1>
		<p class="text-white/50 text-sm max-w-sm mx-auto mb-6">
			Opening the sign-up form... If it doesn't appear, <button
				onclick={() => activeModal.set('signup')}
				class="text-violet-light hover:underline font-semibold"
			>click here</button>.
		</p>
		<div class="text-white/30 text-sm">
			Already have an account? <button
				onclick={() => activeModal.set('login')}
				class="text-violet-light hover:underline"
			>Sign in →</button>
		</div>
	</div>
</div>
