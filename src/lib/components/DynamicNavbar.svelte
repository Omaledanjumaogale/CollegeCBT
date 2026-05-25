<script lang="ts">
	import { mobileMenuOpen, currentUser, activeModal } from '$lib/stores';
	import { signOut } from '$lib/services/firebase';
	import { page } from '$app/stores';

	import { fade, fly } from 'svelte/transition';

	const publicLinks = [
		{ href: '/', label: '🏠 Home' },
		{ href: '/#features', label: '✨ Features' },
		{ href: '/#curriculum', label: '📚 Subjects' },
		{ href: '/exam-lab', label: '🤖 Exam Lab' },
		{ href: '/pricing', label: '💰 Pricing' },
		{ href: '/resources', label: '📖 Resources' },
		{ href: '/about', label: '🏢 About' },
		{ href: '/faq', label: '❓ FAQs' },
	];

	const authLinks = [
		{ href: '/', label: '🏠 Home' },
		{ href: '/dashboard', label: '📊 My Dashboard' },
		{ href: '/exam-lab', label: '🤖 Exam Lab' },
		{ href: '/dashboard/custom-exam', label: '🛠️ Custom Study Material' },
		{ href: '/dashboard/certificate', label: '🎓 My Certificate' },
		{ href: '/pricing', label: '💰 Pricing' },
		{ href: '/resources', label: '📖 Resources' },
		{ href: '/faq', label: '❓ FAQs' },
	];

	let navLinks = $derived(
		$currentUser
			? ($currentUser.role === 'admin'
				? [
						...authLinks,
						{ href: '/admin/dashboard', label: '👑 Admin Panel' }
				  ]
				: authLinks)
			: publicLinks
	);

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
			<a href="/" class="flex-shrink-0 font-display text-2xl leading-none hover:opacity-90 transition-opacity" style="background:linear-gradient(135deg,var(--text) 40%,var(--violet-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
				College<span style="-webkit-text-fill-color:var(--lime-light);">CBT</span>
			</a>

			<!-- Right side: Auth buttons + Hamburger -->
			<div class="flex items-center gap-3 flex-shrink-0">
				<button
					onclick={toggleMenu}
					class="flex flex-col justify-center items-center h-[44px] w-[44px] rounded-lg flex-shrink-0 transition-all hover:opacity-85"
					style="background: var(--glass); border: 1px solid var(--glass-border);"
					aria-label={$mobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={$mobileMenuOpen}
				>
					<div class="flex flex-col gap-[5px]">
						<span class="block w-[22px] h-[2px] rounded-full transition-all duration-300"
							style="background-color: var(--text);"
							class:rotate-hamburger-1={$mobileMenuOpen}></span>
						<span class="block w-[22px] h-[2px] rounded-full transition-all duration-300"
							style="background-color: var(--text);"
							class:opacity-0={$mobileMenuOpen}></span>
						<span class="block w-[22px] h-[2px] rounded-full transition-all duration-300"
							style="background-color: var(--text);"
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
		transition:fade={{ duration: 200 }}
	>
		<!-- Slide-in Drawer -->
		<div
			class="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm flex flex-col border-l shadow-2xl"
			style="background: var(--bg); border-color: var(--glass-border);"
			role="dialog"
			aria-label="Navigation menu"
			aria-modal="true"
			transition:fly={{ x: 300, duration: 300 }}
		>
			<!-- Drawer header -->
			<div class="h-[68px] flex items-center justify-between px-6" style="border-bottom: 1px solid var(--glass-border);">
				<span class="font-display text-xl font-bold" style="color: var(--text);">Navigation</span>
				<button
					onclick={closeMenu}
					class="h-[44px] w-[44px] flex items-center justify-center rounded-lg transition-colors"
					style="background: var(--glass); border: 1px solid var(--glass-border); color: var(--text);"
					aria-label="Close navigation menu"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<!-- User info bar (mobile) -->
			{#if $currentUser}
				<div class="px-6 py-4 flex items-center gap-3" style="border-bottom: 1px solid var(--glass-border);">
					<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style="background:linear-gradient(135deg,var(--violet),var(--violet-light));">
						🎓
					</div>
					<div class="min-w-0">
						<div class="text-sm font-bold truncate" style="color: var(--text);">{$currentUser.fullName || $currentUser.displayName}</div>
						<div class="text-xs truncate" style="color: var(--text-muted);">{$currentUser.email}</div>
					</div>
					<span class="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 {$currentUser.plan === 'pro' ? 'badge badge-lime' : 'badge badge-violet'}">
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
			<div class="p-4 flex flex-col gap-2" style="border-top: 1px solid var(--glass-border); background: var(--glass);">
				{#if $currentUser}
					<button
						onclick={() => { signOut(); closeMenu(); }}
						class="btn-ghost flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl"
					>
						👋 Sign Out
					</button>
				{:else}
					<button
						onclick={openLogin}
						class="btn-ghost flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl"
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
	.rotate-hamburger-1 {
		transform: rotate(45deg) translate(5px, 5px);
	}
	.rotate-hamburger-3 {
		transform: rotate(-45deg) translate(5px, -5px);
	}
</style>
