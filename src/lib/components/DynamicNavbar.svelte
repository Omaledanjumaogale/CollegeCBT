<script lang="ts">
	import { mobileMenuOpen, currentUser, activeModal } from '$lib/stores';
	import { signOut } from '$lib/services/firebase';
	import { page } from '$app/stores';

	const navLinks = [
		{ href: '/#features', label: 'Features' },
		{ href: '/#curriculum', label: 'Curriculum' },
		{ href: '/exam-lab', label: '🤖 Exam Lab' },
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/dashboard', label: 'Dashboard' }
	];

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
		if (href.startsWith('/#')) return p === '/';
		return p === href || p.startsWith(href + '/');
	}
</script>

<nav class="glass-nav fixed top-0 left-0 right-0 z-50">
	<div class="page-container">
		<div class="flex items-center justify-between h-[68px] gap-4">
			<!-- Logo -->
			<a href="/" class="flex-shrink-0 font-display text-2xl leading-none hover:opacity-90 transition-opacity" style="background:linear-gradient(135deg,#fff 40%,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
				College<span style="-webkit-text-fill-color:#84cc16;">CBT</span>
			</a>

			<!-- Desktop Nav -->
			<div class="hidden md:flex items-center gap-1 flex-1 justify-center">
				{#each navLinks as link}
					<a
						href={link.href}
						class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
						class:nav-active={isActive(link.href)}
						class:nav-inactive={!isActive(link.href)}
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- CTA Buttons -->
			<div class="hidden md:flex items-center gap-2 flex-shrink-0">
				{#if $currentUser}
					<span class="text-sm text-white/60 truncate max-w-[120px]">{$currentUser.displayName}</span>
					<button on:click={signOut} class="btn-ghost text-sm px-4 py-2">
						Sign Out
					</button>
				{:else}
					<button on:click={openLogin} class="btn-ghost text-sm px-4 py-2">Sign In</button>
					<button on:click={openSignup} class="btn-violet text-sm px-5 py-2 shadow-violet">
						Get Started →
					</button>
				{/if}
			</div>

			<!-- Hamburger -->
			<button
				on:click={toggleMenu}
				class="md:hidden flex flex-col gap-[5px] p-2 rounded-lg border border-white/10 bg-white/5 flex-shrink-0"
				aria-label="Toggle menu"
			>
				<span class="block w-[22px] h-[2px] bg-white rounded-full transition-all duration-300"
					class:rotate-hamburger-1={$mobileMenuOpen}></span>
				<span class="block w-[22px] h-[2px] bg-white rounded-full transition-all duration-300"
					class:opacity-0={$mobileMenuOpen}></span>
				<span class="block w-[22px] h-[2px] bg-white rounded-full transition-all duration-300"
					class:rotate-hamburger-3={$mobileMenuOpen}></span>
			</button>
		</div>
	</div>
</nav>

<!-- Mobile Menu -->
{#if $mobileMenuOpen}
	<div
		class="fixed top-[68px] left-0 right-0 z-40 border-b border-white/10 p-4 flex flex-col gap-2"
		style="background:rgba(13,8,32,0.98);backdrop-filter:blur(24px);"
		role="dialog"
		aria-label="Mobile navigation"
	>
		{#each navLinks as link}
			<a
				href={link.href}
				on:click={closeMenu}
				class="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
				class:nav-active={isActive(link.href)}
				class:nav-inactive={!isActive(link.href)}
			>
				{link.label}
			</a>
		{/each}
		<div class="flex flex-col gap-3 pt-3 border-t border-white/10 mt-1">
			{#if $currentUser}
				<div class="text-sm text-white/60 px-4">{$currentUser.email}</div>
				<button on:click={() => { signOut(); closeMenu(); }} class="btn-ghost text-sm py-3">
					Sign Out
				</button>
			{:else}
				<button on:click={openLogin} class="btn-ghost text-sm py-3">Sign In</button>
				<button on:click={openSignup} class="btn-violet text-sm py-3">Get Started Free →</button>
			{/if}
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
