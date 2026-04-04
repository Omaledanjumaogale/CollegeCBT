<script lang="ts">
	import { currentUser, authLoading } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';

	// Admin gate - only users with role 'admin' or specific email can access
	const ADMIN_EMAILS = ['admin@collegecbt.dev', 'superadmin@collegecbt.dev'];

	$: isAdmin = $currentUser && (
		($currentUser as any).role === 'admin' ||
		ADMIN_EMAILS.includes($currentUser.email)
	);

	onMount(() => {
		if (!browser) return;
		// Wait for auth to settle
		const unsub = authLoading.subscribe((loading) => {
			if (!loading) {
				if (!$currentUser) {
					goto('/auth/sign-in?redirect=/admin/dashboard');
				} else if (!isAdmin) {
					goto('/dashboard');
				}
			}
		});
		return () => unsub();
	});

	const navItems = [
		{ href: '/admin/dashboard', icon: '📊', label: 'Overview' },
		{ href: '/admin/users',     icon: '👥', label: 'Users' },
		{ href: '/admin/settings',  icon: '⚙️', label: 'Settings' },
	];

	$: currentPath = $page.url.pathname;
</script>

<svelte:head>
	<title>Admin Portal — CollegeCBT</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if $authLoading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div class="spinner w-10 h-10 border-4 mx-auto mb-3"></div>
			<p class="text-white/40 text-sm">Checking access…</p>
		</div>
	</div>
{:else if isAdmin}
	<div class="min-h-screen pt-16 pb-24" in:fade>
		<!-- Admin top bar -->
		<div class="border-b border-white/10 bg-black/30 backdrop-blur-sm mb-6">
			<div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
				<span class="text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/25 px-2.5 py-1 rounded-full">🔒 ADMIN PORTAL</span>
				<span class="text-white/30 text-sm">{$currentUser?.email}</span>
				<div class="ml-auto">
					<a href="/dashboard" class="btn-ghost flex items-center justify-center text-xs px-3 min-h-[44px]">← Back to Dashboard</a>
				</div>
			</div>
		</div>

		<div class="max-w-7xl mx-auto px-4">
			<div class="flex gap-6">
				<!-- Sidebar nav -->
				<aside class="hidden md:flex flex-col gap-1 w-44 flex-shrink-0">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
							style="
								background:{currentPath === item.href ? 'rgba(124,58,237,0.2)' : 'transparent'};
								color:{currentPath === item.href ? '#c4b5fd' : 'rgba(255,255,255,0.5)'};
								border:1px solid {currentPath === item.href ? 'rgba(124,58,237,0.3)' : 'transparent'};
							"
						>
							<span>{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</aside>

				<!-- Mobile tab bar -->
				<div class="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl flex">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-all"
							style="color:{currentPath === item.href ? '#c4b5fd' : 'rgba(255,255,255,0.4)'};"
						>
							<span class="text-lg leading-none">{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</div>

				<!-- Page content -->
				<main class="flex-1 min-w-0">
					<slot />
				</main>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center p-4">
		<div class="glass-card p-8 text-center max-w-sm">
			<div class="text-5xl mb-4">🚫</div>
			<h1 class="font-display text-xl mb-2">Access Denied</h1>
			<p class="text-white/50 text-sm mb-5">You do not have administrator access to this portal.</p>
			<a href="/dashboard" class="btn-violet flex justify-center items-center px-6 min-h-[44px] w-full md:w-auto text-sm">← Return to Dashboard</a>
		</div>
	</div>
{/if}
