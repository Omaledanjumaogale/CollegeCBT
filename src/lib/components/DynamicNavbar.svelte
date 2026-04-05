<script lang="ts">
	import { mobileMenuOpen, currentUser, activeModal } from '$lib/stores';
	import { signOut } from '$lib/services/firebase';
	import { page } from '$app/stores';

	const publicLinks = [
		{ href: '/', label: '🏠 Home' },
		{ href: '/#features', label: '✨ Features' },
		{ href: '/#curriculum', label: '📚 Subjects' },
		{ href: '/exam-lab', label: '🤖 Exam Lab' },
		{ href: '/pricing', label: '💰 Pricing' },
		{ href: '/resources', label: '📖 Resources' },
	];

	const authLinks = [
		{ href: '/', label: '🏠 Home' },
		{ href: '/dashboard', label: '📊 My Dashboard' },
		{ href: '/exam-lab', label: '🤖 Exam Lab' },
		{ href: '/dashboard/certificate', label: '🎓 My Certificate' },
		{ href: '/pricing', label: '💰 Pricing' },
		{ href: '/resources', label: '📖 Resources' },
	];

	let navLinks = $derived($currentUser ? authLinks : publicLinks);

	function toggleMenu() {
		mobileMenuOpen.update((v) => !v);
	}

	function closeMenu() {
		mobileMenuOpen.set(false);
	}

	function openSignup() {
		activeModal.set('signup');
		closeMenu();
	}

	function openLogin() {
		activeModal.set('login');
		closeMenu();
	}

	function isActive(href: string) {
		let p = $page.url.pathname;
		if (href === '/') return p === '/';
		if (href.startsWith('/#')) return p === '/';
		return p === href || p.startsWith(href + '/');
	}
</script>

<!-- Static header — fixed so it doesn't shift content; main content has pt-[72px] via layout -->
<nav class="glass-nav static z-50 border-b border-white/5 h-[68px]" aria-label="Main navigation">
	<div class="page-container h-full">
		<div class="flex items-center justify-between h-full gap-4">
			<!-- Logo -->
			<a href="/" class="flex-shrink-0 font-display text-2xl leading-none hover:opacity-90 transition-opacity" style="background:linear-gradient(135deg,#fff 40%,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
				College<span style="-webkit-text-fill-color:#84cc16;">CBT</span>
			</a>

			<!-- Right side: Auth buttons + Hamburger -->
			<div class="flex items-center gap-3 flex-shrink-0">
				<!-- Hamburger — always visible -->
				<button
					onclick={toggleMenu}
					class="flex flex-col justify-center items-center h-[44px] w-[44px] rounded-lg border border-white/10 bg-white/5 flex-shrink-0 transition-colors hover:bg-white/10"
					aria-label={$mobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={$mobileMenuOpen}
				>
					<div class="flex flex-col gap-[5px]">
						<span class="block w-[22px] h-[2px] bg-white rounded-full transition-all duration-300"
							class:rotate-hamburger-1={$mobileMenuOpen}></span>
						<span class="block w-[22px] h-[2px] bg-white rounded-full transition-all duration-300"
							class:opacity-0={$mobileMenuOpen}></span>
						<span class="block w-[22px] h-[2px] bg-white rounded-full transition-all duration-300"
							class:rotate-hamburger-3={$mobileMenuOpen}></span>
					</div>
				</button>
			</div>
		</div>
	</div>
</nav>

<!-- Navigation Drawer — slides in from right -->
{#if $mobileMenuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) closeMenu(); }}
	>
		<!-- Slide-in Drawer -->
		<div
			class="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm flex flex-col border-l border-white/10 shadow-2xl"
			style="background:rgba(13,8,32,0.98);"
			role="dialog"
			aria-label="Navigation menu"
			aria-modal="true"
		>
			<!-- Drawer header -->
			<div class="h-[68px] flex items-center justify-between px-6 border-b border-white/10">
				<span class="font-display text-xl text-white">Navigation</span>
				<button
					onclick={closeMenu}
					class="h-[44px] w-[44px] flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
					aria-label="Close navigation menu"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<!-- User info bar (mobile) -->
			{#if $currentUser}
				<div class="px-6 py-4 border-b border-white/5 flex items-center gap-3">
					<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style="background:linear-gradient(135deg,#7c3aed,#a855f7);">
						🎓
					</div>
					<div class="min-w-0">
						<div class="text-sm font-bold text-white truncate">{$currentUser.displayName}</div>
						<div class="text-xs text-white/40 truncate">{$currentUser.email}</div>
					</div>
					<span class="ml-auto text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 {$currentUser.plan === 'pro' ? 'bg-lime-900/50 text-lime-400 border border-lime-500/30' : 'bg-violet-900/50 text-violet-400 border border-violet-500/30'}">
						{$currentUser.plan === 'pro' ? '⭐ PRO' : 'FREE'}
					</span>
				</div>
			{/if}

			<!-- Nav links -->
			<div class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={closeMenu}
						class="flex items-center min-h-[48px] px-4 rounded-xl text-sm font-medium transition-all"
						class:nav-active={isActive(link.href)}
						class:nav-inactive={!isActive(link.href)}
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- CTA / auth section at bottom -->
			<div class="p-4 border-t border-white/10 flex flex-col gap-2 bg-black/20">
				{#if $currentUser}
					<button
						onclick={() => { signOut(); closeMenu(); }}
						class="btn-ghost flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl border border-white/10 bg-white/5"
					>
						👋 Sign Out
					</button>
				{:else}
					<button
						onclick={openLogin}
						class="btn-ghost flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl border border-white/10 bg-white/5"
					>
						Sign In
					</button>
					<button
						onclick={openSignup}
						class="btn-violet flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl shadow-violet"
					>
						Get Started Free →
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.nav-active {
		color: #a78bfa;
		background: rgba(124, 58, 237, 0.12);
		border: 1px solid rgba(124, 58, 237, 0.2);
	}
	.nav-inactive {
		color: #94a3b8;
		border: 1px solid transparent;
	}
	.nav-inactive:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.05);
	}
	.rotate-hamburger-1 {
		transform: rotate(45deg) translate(5px, 5px);
	}
	.rotate-hamburger-3 {
		transform: rotate(-45deg) translate(5px, -5px);
	}
</style>
