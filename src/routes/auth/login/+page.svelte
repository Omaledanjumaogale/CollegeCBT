<script lang="ts">
	import { activeModal, currentUser } from '$lib/stores';
	import { signInWithEmail } from '$lib/services/firebase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let showPassword = $state(false);

	onMount(() => {
		if ($currentUser) goto('/dashboard');
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		if (!email || !password) {
			errorMsg = 'Please fill in all fields.';
			return;
		}
		errorMsg = '';
		loading = true;
		try {
			const result = await signInWithEmail(email, password);
			if (result.success) {
				goto('/dashboard');
			} else {
				errorMsg = result.error || 'Login failed. Please check your details and try again.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In — CollegeCBT | AI Exam Practice for Nigerian Students</title>
	<meta name="description" content="Sign in to your CollegeCBT account to access unlimited AI-generated exam questions, track your performance and download your certificate." />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-20 pt-[100px]">
	<div class="w-full max-w-md">
		<!-- Card -->
		<div class="glass-card p-8 rounded-3xl" style="background:rgba(13,8,32,0.85);border:1px solid rgba(124,58,237,0.25);backdrop-filter:blur(20px);">
			<!-- Header -->
			<div class="text-center mb-8">
				<a href="/" class="inline-block font-display text-3xl mb-6" style="background:linear-gradient(135deg,#fff 40%,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
					College<span style="-webkit-text-fill-color:#84cc16;">CBT</span>
				</a>
				<h1 class="font-display text-2xl text-white mb-2">Welcome Back</h1>
				<p class="text-white/40 text-sm">Sign in to continue your exam preparation</p>
			</div>

			<!-- Form -->
			<form onsubmit={handleLogin} class="space-y-5">
				<!-- Email -->
				<div>
					<label for="login-email" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
					<input
						id="login-email"
						type="email"
						bind:value={email}
						placeholder="you@university.edu.ng"
						autocomplete="email"
						class="form-input"
						required
					/>
				</div>

				<!-- Password -->
				<div>
					<label for="login-password" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
					<div class="relative">
						<input
							id="login-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Your password"
							autocomplete="current-password"
							class="form-input pr-12"
							required
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{#if showPassword}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
							{/if}
						</button>
					</div>
				</div>

				<!-- Error message -->
				{#if errorMsg}
					<div class="p-3 rounded-xl text-sm text-rose-300 border" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.25);">
						⚠️ {errorMsg}
					</div>
				{/if}

				<!-- Submit -->
				<button
					type="submit"
					disabled={loading}
					class="btn-violet w-full min-h-[48px] flex items-center justify-center gap-3 text-base font-bold shadow-violet disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						Signing in...
					{:else}
						Sign In →
					{/if}
				</button>
			</form>

			<!-- Divider -->
			<div class="flex items-center gap-3 my-6">
				<div class="flex-1 h-px bg-white/10"></div>
				<span class="text-white/30 text-xs">OR</span>
				<div class="flex-1 h-px bg-white/10"></div>
			</div>

			<!-- Register link -->
			<p class="text-center text-sm text-white/40">
				Don't have an account?
				<a href="/auth/register" class="text-violet-light hover:text-white font-semibold transition-colors ml-1">
					Create one free →
				</a>
			</p>

			<!-- Admin link -->
			<p class="text-center text-xs text-white/20 mt-4">
				Institution admin?
				<a href="/admin/login" class="text-white/35 hover:text-white/60 transition-colors ml-1">
					Admin Portal →
				</a>
			</p>
		</div>

		<!-- Features reminder -->
		<div class="mt-6 grid grid-cols-3 gap-3 text-center">
			{#each [
				{ icon: '🤖', text: 'AI Questions' },
				{ icon: '📊', text: 'Grade Tracking' },
				{ icon: '🎓', text: 'Certificate' }
			] as feat}
				<div class="glass-card p-3 rounded-2xl">
					<div class="text-xl mb-1">{feat.icon}</div>
					<div class="text-[10px] text-white/40 font-medium">{feat.text}</div>
				</div>
			{/each}
		</div>
	</div>
</div>
