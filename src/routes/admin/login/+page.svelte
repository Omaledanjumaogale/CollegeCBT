<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { fade } from 'svelte/transition';

	// ── Props & State ──
	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Admin Login — CollegeCBT | Restricted Access</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen relative flex items-center justify-center p-6 overflow-hidden"
     style="background:radial-gradient(circle at 0% 0%, #1a103d 0%, #0D0820 100%);">

	<!-- ── Background Orbs ── -->
	<div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px] animate-pulse"></div>
	<div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-lime-500/5 blur-[100px] animate-pulse"></div>

	<!-- ── Login Form Card ── -->
	<div class="relative z-10 w-full max-w-[440px]"
	     in:fade={{ duration: 600 }}>

		<div class="glass-card p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

			<div class="text-center mb-8">
				<div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-black/40 border border-white/10 mb-6 group transition-all hover:border-violet-500/50 shadow-2xl">
					<span class="text-4xl group-hover:scale-110 transition-transform">🛡️</span>
				</div>
				<h1 class="font-display text-2xl mb-2 text-white">Admin Portal Access</h1>
				<p class="text-white/40 text-sm">Enter your administrator credentials to sign in.</p>
			</div>

			<form
				method="POST"
				action="?/login"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<div>
					<label for="email" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
					<div class="relative group">
						<input
							id="email"
							name="email"
							type="email"
							placeholder="admin@collegecbt.dev"
							class="form-input bg-black/60 border-white/5 focus:border-violet-500/50 focus:ring-violet-500/10 h-[52px] px-5 transition-all"
							required
						/>
						<div class="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-violet-500/50 transition-colors">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
						</div>
					</div>
				</div>

				<div>
					<label for="password" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Password</label>
					<div class="relative group">
						<input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••••••••"
							class="form-input bg-black/60 border-white/5 focus:border-violet-500/50 focus:ring-violet-500/10 h-[52px] px-5 transition-all"
							required
						/>
						<div class="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-violet-500/50 transition-colors">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
						</div>
					</div>
				</div>

				{#if form?.error}
					<div
						class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3"
						role="alert"
					>
						<span class="text-xl flex-shrink-0">⚠️</span>
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					class="btn-violet w-full h-[54px] rounded-xl flex items-center justify-center font-bold text-sm shadow-2xl relative overflow-hidden group"
					disabled={loading}
				>
					{#if loading}
						<div class="flex items-center gap-3">
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							<span>Signing In...</span>
						</div>
					{:else}
						<span class="relative z-10">Sign In to Admin Portal →</span>
						<div class="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-white/10 to-violet-600/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
					{/if}
				</button>
			</form>

			<div class="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
				<p class="text-[10px] text-white/20 uppercase tracking-[0.2em]">Authorized Access Only</p>
				<p class="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono">v2.1</p>
			</div>
		</div>

		<!-- ── Footer Links ── -->
		<div class="mt-8 flex items-center justify-center gap-6">
			<a href="/" class="text-[11px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-colors">← Back to Home</a>
			<span class="w-1.5 h-1.5 rounded-full bg-white/10"></span>
			<a href="/dashboard" class="text-[11px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-colors">User Dashboard</a>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #0D0820;
	}
</style>
