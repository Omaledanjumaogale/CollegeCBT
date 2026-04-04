<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser, activeModal } from '$lib/stores';

	const bottomLinks = [
		{ href: '/', label: 'Home', icon: '🏠' },
		{ href: '/exam-lab', label: 'Lab', icon: '🤖' },
		{ href: '/pricing', label: 'Pro', icon: '💎' },
		{ href: '/dashboard', label: 'User', icon: '👤' }
	];

	function isActive(href: string) {
		const p = $page.url.pathname;
		if (href === '/') return p === '/';
		return p.startsWith(href);
	}

	function handleUserClick() {
		if (!$currentUser) {
			activeModal.set('login');
		}
	}
</script>

<div class="md:hidden fixed bottom-0 left-0 right-0 z-[100] h-[72px] pb-[safe-area-inset-bottom] border-t border-white/10" style="background:rgba(13,8,30,0.95);backdrop-filter:blur(32px);">
	<div class="grid grid-cols-4 h-full">
		{#each bottomLinks as link}
			{#if link.href === '/dashboard' && !$currentUser}
				<button 
					on:click={handleUserClick}
					class="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white/40 transition-all hover:text-white/60"
				>
					<span class="text-xl">👤</span>
					<span>Login</span>
				</button>
			{:else}
				<a 
					href={link.href}
					class="flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all {isActive(link.href) ? 'text-white' : 'text-white/40'}"
				>
					<span class="text-xl">{link.icon}</span>
					<span>{link.label}</span>
					{#if isActive(link.href)}
						<div class="absolute bottom-1 w-1 h-1 rounded-full bg-violet-DEFAULT"></div>
					{/if}
				</a>
			{/if}
		{/each}
	</div>
</div>

<style>
	.bg-violet-DEFAULT { background-color: #7c3aed; }
</style>
