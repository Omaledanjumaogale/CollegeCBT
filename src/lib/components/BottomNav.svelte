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

<div class="md:hidden fixed bottom-0 left-0 right-0 z-[100] h-[72px] pb-[safe-area-inset-bottom]" style="background: var(--bg-alt); backdrop-filter: blur(32px); border-top: 1px solid var(--glass-border);">
	<div class="grid grid-cols-4 h-full">
		{#each bottomLinks as link}
			{#if link.href === '/dashboard' && !$currentUser}
				<button 
					onclick={handleUserClick}
					class="flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all"
					style="color: var(--text-muted);"
				>
					<span class="text-xl">👤</span>
					<span>Login</span>
				</button>
			{:else}
				<a 
					href={link.href}
					class="flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all relative"
					style="color: {isActive(link.href) ? 'var(--text)' : 'var(--text-muted)'};"
				>
					<span class="text-xl">{link.icon}</span>
					<span>{link.label}</span>
					{#if isActive(link.href)}
						<div class="absolute bottom-1.5 w-1.5 h-1.5 rounded-full" style="background-color: var(--violet);"></div>
					{/if}
				</a>
			{/if}
		{/each}
	</div>
</div>


