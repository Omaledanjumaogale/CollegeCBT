<script lang="ts">
	import { page } from '$app/stores';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { activeModal, showToast } from '$lib/stores';

	// ── Props & State ──
	let { data, children } = $props();
	let isSidebarOpen = $state(true);
	let isMobileOpen = $state(false);
	
	const navGroups = [
		{
			title: 'Control Center',
			items: [
				{ href: '/admin/dashboard', icon: '📊', label: 'Overview' },
				{ href: '/admin/users',     icon: '👥', label: 'User & Role Management' }
			]
		},
		{
			title: 'Observability',
			items: [
				{ href: '/admin/monitoring', icon: '🩺', label: 'System Health' },
				{ href: '/admin/audit-logs', icon: '📜', label: 'Audit Logs' }
			]
		},
		{
			title: 'Engineering',
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

	function closeMobile() {
		isMobileOpen = false;
	}
</script>

<svelte:head>
	<title>Super Admin Portal — CollegeCBT | Enterprise Gate v2.1</title>
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
			<div class="h-[72px] flex items-center px-6 border-b border-white/5 gap-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 border border-violet-500/50 flex-shrink-0 flex items-center justify-center font-display font-bold text-xl text-white">C</div>
				{#if isSidebarOpen}
					<div class="font-display text-xl text-white tracking-tight" in:fade>College<span class="text-lime-500">CBT</span> <span class="text-[10px] text-white/30 uppercase tracking-widest ml-1 bg-white/5 px-1.5 py-0.5 rounded-md">Admin</span></div>
				{/if}
			</div>

			<!-- Nav Sections -->
			<div class="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
				{#each navGroups as group}
					<div class="space-y-1">
						{#if isSidebarOpen}
							<h3 class="px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3" in:fade>{group.title}</h3>
						{/if}
						{#each group.items as item}
							<a 
								href={item.href}
								class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group"
								class:nav-active={currentPath === item.href}
								class:nav-inactive={currentPath !== item.href}
								title={!isSidebarOpen ? item.label : ''}
							>
								<span class="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
								{#if isSidebarOpen}
									<span class="text-sm font-medium whitespace-nowrap" in:fade>{item.label}</span>
								{/if}
								{#if currentPath === item.href}
									<div class="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-violet-600 rounded-full blur-[4px]"></div>
								{/if}
							</a>
						{/each}
					</div>
				{/each}
			</div>

			<!-- Sidebar Footer -->
			<div class="p-4 border-t border-white/5 bg-black/20">
				<form action="/admin/login?/logout" method="POST" class="w-full">
					<button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all group overflow-hidden">
						<span class="text-2xl group-hover:rotate-12 transition-transform">🚪</span>
						{#if isSidebarOpen}
							<span class="text-sm font-bold tracking-tight" in:fade>Terminate Session</span>
						{/if}
					</button>
				</form>
			</div>
		</aside>

		<!-- ── Main Layout Canvas ── -->
		<div class="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
			
			<!-- Top Navigation Bar -->
			<header class="h-[72px] border-b border-white/5 bg-[#0D0820]/50 backdrop-blur-xl px-6 flex items-center justify-between z-40">
				
				<div class="flex items-center gap-4">
					<button 
						onclick={toggleSidebar}
						class="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors"
						aria-label="Toggle Sidebar"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
					</button>

					<div class="flex items-center gap-2 text-sm text-white/40">
						<span class="capitalize">{currentPath.split('/')[1]}</span>
						<span class="text-white/10">/</span>
						<span class="text-white font-medium">{currentPath.split('/')[2] || 'Home'}</span>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<!-- Notifications Trigger -->
					<button 
						class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white relative group"
						onclick={() => showToast('System Update', 'Database clusters are healthy.', 'info')}
					>
						<span class="text-lg">🔔</span>
						<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border border-white/10 group-hover:scale-110 transition-transform"></span>
					</button>

					<!-- Secure Session Status -->
					<div class="px-4 py-2 rounded-xl bg-lime-500/5 border border-lime-500/20 flex items-center gap-2">
						<div class="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></div>
						<span class="text-[10px] font-bold text-lime-500 uppercase tracking-widest hidden sm:inline">Edge Bypass Active</span>
					</div>

					<div class="h-10 w-[1px] bg-white/5 mx-1"></div>

					<div class="flex items-center gap-3">
						<div class="text-right hidden sm:block">
							<div class="text-[11px] font-bold text-white tracking-tight">Super Admin</div>
							<div class="text-[9px] text-white/30 uppercase tracking-widest">E-WIN Project</div>
						</div>
						<div class="w-10 h-10 rounded-xl bg-[#1a103d] border border-white/10 flex items-center justify-center text-xl shadow-inner">👤</div>
					</div>
				</div>
			</header>

			<!-- ── Scrollable Body Viewport ── -->
			<main class="flex-1 overflow-y-auto scroll-smooth bg-[#060410] relative custom-scrollbar">
				
				<!-- Page Header Strip -->
				<div class="h-40 bg-gradient-to-b from-violet-600/5 to-transparent absolute top-0 left-0 right-0 pointer-events-none"></div>

				<div class="p-6 md:p-8 relative z-10">
					{#key currentPath}
						<div in:fade={{ duration: 400 }}>
							{@render children?.()}
						</div>
					{/key}
				</div>
				
				<!-- Admin Footer -->
				<footer class="px-8 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
					<div class="flex items-center gap-6">
						<span class="text-[10px] text-white/20 uppercase tracking-widest">© 2026 E-WIN PROJECT SECURITY</span>
						<div class="flex gap-4">
							<a href="/admin/audit-logs" class="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-bold">Policy & Audit</a>
							<a href="/admin/monitoring" class="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-bold">Latency Map</a>
						</div>
					</div>
					<div class="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
						<span class="text-[9px] text-white/20 uppercase tracking-[0.2em] font-mono">Build Node: LON-01</span>
						<span class="text-[9px] text-lime-500/50 uppercase tracking-[0.2em] font-mono">Runtime: Edge</span>
					</div>
				</footer>
			</main>
		</div>

		<!-- ── Mobile Menu Sidebar (Drawer) ── -->
		{#if isMobileOpen}
			<div class="fixed inset-0 z-[100] lg:hidden" transition:fade>
				<div 
					class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
					onclick={closeMobile}
					onkeydown={(e) => e.key === 'Escape' && closeMobile()}
					role="button"
					tabindex="-1"
					aria-label="Close mobile menu"
				></div>
				<div class="absolute top-0 left-0 bottom-0 w-[280px] bg-[#0D0820] border-r border-white/10" transition:slide={{ axis: 'x' }}>
					<!-- Drawer Content Similar to Sidebar -->
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

	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.1);
	}
</style>
