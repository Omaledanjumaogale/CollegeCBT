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
				class="md:hidden flex flex-col justify-center items-center h-[44px] w-[44px] rounded-lg border border-white/10 bg-white/5 flex-shrink-0 relative"
				aria-label="Toggle menu"
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
</nav>

<!-- Mobile Drawer Backdrop -->
{#if $mobileMenuOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div 
		class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
		on:click|self={closeMenu}
	>
		<!-- Slide-in Drawer -->
		<div
			class="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm flex flex-col border-l border-white/10 shadow-2xl transition-transform duration-300"
			style="background:rgba(13,8,32,0.98);"
			role="dialog"
			aria-label="Mobile navigation"
		>
			<div class="h-[68px] flex items-center justify-between px-6 border-b border-white/10">
				<span class="font-display text-xl text-white">Menu</span>
				<button on:click={closeMenu} class="h-[44px] w-[44px] flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors" aria-label="Close menu">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
				</button>
			</div>
			
			<div class="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3">
				{#each navLinks as link}
					<a
						href={link.href}
						on:click={closeMenu}
						class="flex items-center min-h-[44px] px-4 rounded-xl text-sm font-medium transition-all"
						class:nav-active={isActive(link.href)}
						class:nav-inactive={!isActive(link.href)}
					>
						{link.label}
					</a>
				{/each}
			</div>

			<div class="p-6 border-t border-white/10 flex flex-col gap-3 bg-black/20">
				{#if $currentUser}
					<div class="text-sm text-white/60 px-2 font-medium truncate">{$currentUser.email}</div>
					<button on:click={() => { signOut(); closeMenu(); }} class="btn-ghost flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl border border-white/10 bg-white/5">
						Sign Out
					</button>
				{:else}
					<button on:click={openLogin} class="btn-ghost flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl border border-white/10 bg-white/5 mb-2">Sign In</button>
					<button on:click={openSignup} class="btn-violet flex items-center justify-center min-h-[44px] w-full text-sm rounded-xl shadow-violet">Get Started Free →</button>
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
