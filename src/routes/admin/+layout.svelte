<script lang="ts">
	import { page } from '$app/stores';
	import { fade, slide } from 'svelte/transition';
	import { showToast } from '$lib/stores';

	// ── Props & State ──
	let { data, children } = $props();
	let isSidebarOpen = $state(true);
	let isMobileOpen = $state(false);

	const navGroups = [
		{
			title: 'Control Center',
			items: [
				{ href: '/admin/dashboard', icon: '📊', label: 'Overview' },
				{ href: '/admin/users',     icon: '👥', label: 'User Management' }
			]
		},
		{
			title: 'Monitoring',
			items: [
				{ href: '/admin/monitoring', icon: '🩺', label: 'System Health' },
				{ href: '/admin/audit-logs', icon: '📜', label: 'Audit Logs' }
			]
		},
		{
			title: 'Settings',
			items: [
				{ href: '/admin/config-flags', icon: '⚙️', label: 'Feature Flags' },
				{ href: '/admin/settings',     icon: '🔧', label: 'Global Settings' }
			]
		}
	];

	let currentPath = $derived($page.url.pathname);
	let isLoginPage = $derived(currentPath === '/admin/login');

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function openMobile() {
		isMobileOpen = true;
	}

	function closeMobile() {
		isMobileOpen = false;
	}
</script>

<svelte:head>
	<title>Admin Portal — CollegeCBT</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if isLoginPage}
	<!-- Plain layout for login page -->
	{@render children?.()}
{:else}
	<div class="min-h-screen bg-[#060410] flex overflow-hidden">

		<!-- ── Desktop Sidebar ── -->
		<aside
			class="hidden lg:flex flex-col border-r border-white/5 bg-[#0D0820]/80 backdrop-blur-3xl transition-all duration-300 relative z-50"
			style="width: {isSidebarOpen ? '280px' : '88px'};"
		>
			<!-- Sidebar Logo -->
			<div class="h-[72px] flex items-center px-5 border-b border-white/5 gap-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 border border-violet-500/50 flex-shrink-0 flex items-center justify-center font-bold text-xl text-white">C</div>
				{#if isSidebarOpen}
					<div class="font-display text-xl text-white tracking-tight" in:fade>College<span class="text-lime-500">CBT</span> <span class="text-[10px] text-white/30 uppercase tracking-widest ml-1 bg-white/5 px-1.5 py-0.5 rounded-md">Admin</span></div>
				{/if}
			</div>

			<!-- Nav Sections -->
			<div class="flex-1 overflow-y-auto py-6 px-4 space-y-8 sidebar-scroll">
				{#each navGroups as group}
					<div class="space-y-1">
						{#if isSidebarOpen}
							<h3 class="px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3" in:fade>{group.title}</h3>
						{/if}
						{#each group.items as item}
							<a
								href={item.href}
								class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group"
								class:nav-active={currentPath.startsWith(item.href)}
								class:nav-inactive={!currentPath.startsWith(item.href)}
								title={!isSidebarOpen ? item.label : ''}
							>
								<span class="text-xl opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">{item.icon}</span>
								{#if isSidebarOpen}
									<span class="text-sm font-medium whitespace-nowrap" in:fade>{item.label}</span>
								{/if}
								{#if currentPath.startsWith(item.href)}
									<div class="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-violet-600 rounded-full blur-[4px]"></div>
								{/if}
							</a>
						{/each}
					</div>
				{/each}
			</div>

			<!-- Sidebar Footer: Sign Out -->
			<div class="p-4 border-t border-white/5 bg-black/20">
				<form action="/admin/login?/logout" method="POST" class="w-full">
					<button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all group overflow-hidden">
						<span class="text-xl group-hover:rotate-12 transition-transform flex-shrink-0">🚪</span>
						{#if isSidebarOpen}
							<span class="text-sm font-bold tracking-tight" in:fade>Sign Out</span>
						{/if}
					</button>
				</form>
			</div>
		</aside>

		<!-- ── Main Layout Canvas ── -->
		<div class="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">

			<!-- Top Navigation Bar -->
			<header class="h-[72px] border-b border-white/5 bg-[#0D0820]/50 backdrop-blur-xl px-6 flex items-center justify-between z-40 flex-shrink-0">

				<div class="flex items-center gap-4">
					<!-- Desktop sidebar toggle -->
					<button
						onclick={toggleSidebar}
						class="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors"
						aria-label="Toggle Sidebar"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
					</button>

					<!-- Mobile hamburger -->
					<button
						onclick={openMobile}
						class="lg:hidden flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors"
						aria-label="Open navigation menu"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
					</button>

					<!-- Breadcrumb -->
					<div class="flex items-center gap-2 text-sm text-white/40">
						<span class="capitalize hidden sm:inline">{currentPath.split('/')[1]}</span>
						<span class="text-white/10 hidden sm:inline">/</span>
						<span class="text-white font-medium capitalize">{currentPath.split('/')[2] || 'Home'}</span>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<!-- Notifications -->
					<button
						class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white relative group"
						onclick={() => showToast('System Update', 'All database clusters are healthy.', 'info')}
						aria-label="Notifications"
					>
						<span class="text-lg">🔔</span>
						<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border border-white/10 group-hover:scale-110 transition-transform"></span>
					</button>

					<!-- Session Status -->
					<div class="px-3 py-2 rounded-xl bg-lime-500/5 border border-lime-500/20 flex items-center gap-2">
						<div class="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></div>
						<span class="text-[10px] font-bold text-lime-500 uppercase tracking-widest hidden sm:inline">Session Active</span>
					</div>

					<div class="h-10 w-[1px] bg-white/5 mx-1"></div>

					<!-- Admin identity -->
					<div class="flex items-center gap-3">
						<div class="text-right hidden sm:block">
							<div class="text-[11px] font-bold text-white tracking-tight">Super Admin</div>
							<div class="text-[9px] text-white/30 uppercase tracking-widest">E-WIN Project</div>
						</div>
						<div class="w-10 h-10 rounded-xl bg-[#1a103d] border border-white/10 flex items-center justify-center text-xl shadow-inner">👤</div>
					</div>
				</div>
			</header>

			<!-- ── Scrollable Content Area ── -->
			<main class="flex-1 overflow-y-auto scroll-smooth bg-[#060410] relative custom-scrollbar">

				<!-- Page Header Gradient -->
				<div class="h-40 bg-gradient-to-b from-violet-600/5 to-transparent absolute top-0 left-0 right-0 pointer-events-none"></div>

				<div class="p-6 md:p-8 relative z-10">
					{#key currentPath}
						<div in:fade={{ duration: 400 }}>
							{@render children?.()}
						</div>
					{/key}
				</div>

				<!-- Admin Footer -->
				<footer class="px-8 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
					<div class="flex items-center gap-6">
						<span class="text-[10px] text-white/20 uppercase tracking-widest">© 2026 E-WIN Project</span>
						<div class="flex gap-4">
							<a href="/admin/audit-logs" class="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-bold">Audit Logs</a>
							<a href="/admin/monitoring" class="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-bold">Monitoring</a>
						</div>
					</div>
					<div class="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
						<span class="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono">Node: LON-01</span>
						<span class="text-[9px] text-lime-500/50 uppercase tracking-[0.2em] font-mono">Runtime: Edge</span>
					</div>
				</footer>
			</main>
		</div>

		<!-- ── Mobile Drawer ── -->
		{#if isMobileOpen}
			<div class="fixed inset-0 z-[100] lg:hidden" transition:fade={{ duration: 200 }}>
				<!-- Backdrop -->
				<div
					class="absolute inset-0 bg-black/60 backdrop-blur-sm"
					onclick={closeMobile}
					onkeydown={(e) => e.key === 'Escape' && closeMobile()}
					role="button"
					tabindex="-1"
					aria-label="Close navigation menu"
				></div>

				<!-- Drawer Panel -->
				<div
					class="absolute top-0 left-0 bottom-0 w-[280px] bg-[#0D0820] border-r border-white/10 flex flex-col"
					transition:slide={{ axis: 'x', duration: 300 }}
				>
					<!-- Mobile Drawer Header -->
					<div class="h-[72px] flex items-center justify-between px-5 border-b border-white/5">
						<div class="flex items-center gap-3">
							<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center font-bold text-white">C</div>
							<span class="font-display text-lg text-white">College<span class="text-lime-500">CBT</span></span>
						</div>
						<button
							onclick={closeMobile}
							class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors"
							aria-label="Close menu"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
						</button>
					</div>

					<!-- Mobile Nav Items -->
					<div class="flex-1 overflow-y-auto py-6 px-4 space-y-6 sidebar-scroll">
						{#each navGroups as group}
							<div class="space-y-1">
								<h3 class="px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">{group.title}</h3>
								{#each group.items as item}
									<a
										href={item.href}
										onclick={closeMobile}
										class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
										class:nav-active={currentPath.startsWith(item.href)}
										class:nav-inactive={!currentPath.startsWith(item.href)}
									>
										<span class="text-xl flex-shrink-0">{item.icon}</span>
										<span class="text-sm font-medium">{item.label}</span>
									</a>
								{/each}
							</div>
						{/each}
					</div>

					<!-- Mobile Sign Out -->
					<div class="p-4 border-t border-white/5 bg-black/20">
						<form action="/admin/login?/logout" method="POST" class="w-full">
							<button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
								<span class="text-xl">🚪</span>
								<span class="text-sm font-bold">Sign Out</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		{/if}

	</div>
{/if}

<style>
	.nav-active {
		background: rgba(124, 58, 237, 0.12);
		border: 1px solid rgba(124, 58, 237, 0.25);
		color: #c4b5fd;
	}
	.nav-inactive {
		color: rgba(255, 255, 255, 0.4);
		border: 1px solid transparent;
	}
	.nav-inactive:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}
	.custom-scrollbar::-webkit-scrollbar { width: 6px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
	.sidebar-scroll::-webkit-scrollbar { width: 4px; }
	.sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
	.sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.04); border-radius: 10px; }
</style>
