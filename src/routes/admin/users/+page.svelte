<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { showToast } from '$lib/stores';

	let users: any[] = [];
	let loading = true;
	let searchTerm = '';
	let upgradingUser: string | null = null;

	onMount(async () => {
		if (!browser) return;
		await loadUsers();
	});

	async function loadUsers() {
		loading = true;
		try {
			const { getConvexClient } = await import('$lib/services/convexClient');
			const convex = getConvexClient();
			const { api } = await import('$convex/_generated/api');
			const result = await convex.query(api.users.listUsers, { limit: 100 });
			users = result || [];
		} catch (err) {
			console.error('Failed to load users', err);
			// Fallback demo data
			users = [
				{ _id: '1', displayName: 'John Doe', email: 'john@uni.edu.ng', plan: 'pro', institutionName: 'University of Lagos', level: '400 Level' },
				{ _id: '2', displayName: 'Jane Smith', email: 'jane@poly.edu.ng', plan: 'free', institutionName: 'Yaba Tech', level: 'ND2' },
			];
		} finally {
			loading = false;
		}
	}

	async function setPlan(userId: string, plan: 'free' | 'pro' | 'institutional') {
		upgradingUser = userId;
		try {
			const { getConvexClient } = await import('$lib/services/convexClient');
			const convex = getConvexClient();
			const { api } = await import('$convex/_generated/api');
			await convex.mutation(api.users.adminOverridePlan, { userId: userId as any, plan });
			users = users.map((u) => (u._id === userId ? { ...u, plan } : u));
			showToast('✅ Success', `User plan updated to ${plan.toUpperCase()}`, 'success');
		} catch (err) {
			console.error('Failed to update plan', err);
			showToast('❌ Error', 'Failed to update plan', 'error');
		} finally {
			upgradingUser = null;
		}
	}

	$: filteredUsers = users.filter(
		(u) =>
			(u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			(u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			(u.institutionName || '').toLowerCase().includes(searchTerm.toLowerCase())
	);
</script>

<svelte:head>
	<title>User Management — Admin</title>
</svelte:head>

<div in:fade>
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
		<div>
			<h1 class="font-display text-2xl md:text-3xl mb-1">User Management</h1>
			<p class="text-white/40 text-sm">View, search, and manage user accounts and subscriptions.</p>
		</div>

		<div class="relative max-w-sm w-full">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Search users..."
				class="form-input pl-9 w-full text-sm py-2.5"
			/>
		</div>
	</div>

	<div class="glass-card overflow-hidden">
		<!-- Active users table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[700px]">
				<thead>
					<tr class="border-b border-white/10 bg-white/5">
						<th class="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">User</th>
						<th class="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Institution</th>
						<th class="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Level</th>
						<th class="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Plan</th>
						<th class="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5 text-sm">
					{#if loading}
						{#each Array(5) as _}
							<tr class="animate-pulse">
								<td class="p-4"><div class="h-4 bg-white/10 rounded w-3/4 mb-1"></div><div class="h-3 bg-white/5 rounded w-1/2"></div></td>
								<td class="p-4"><div class="h-4 bg-white/10 rounded w-full"></div></td>
								<td class="p-4"><div class="h-4 bg-white/10 rounded w-1/2"></div></td>
								<td class="p-4"><div class="h-6 bg-white/10 rounded-full w-16"></div></td>
								<td class="p-4"><div class="h-8 bg-white/10 rounded w-24 ml-auto"></div></td>
							</tr>
						{/each}
					{:else if filteredUsers.length === 0}
						<tr>
							<td colspan="5" class="p-8 text-center text-white/40 text-sm">No users found matching "{searchTerm}"</td>
						</tr>
					{:else}
						{#each filteredUsers as user (user._id)}
							<tr class="hover:bg-white/5 transition-colors group">
								<td class="p-4">
									<div class="font-medium text-white">{user.displayName || 'Unnamed User'}</div>
									<div class="text-xs text-white/40">{user.email}</div>
								</td>
								<td class="p-4 text-white/70">{user.institutionName || '—'}</td>
								<td class="p-4 text-white/70">{user.level || '—'}</td>
								<td class="p-4">
									<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
										style="
											background: {user.plan === 'pro' || user.plan === 'institutional' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.1)'};
											color: {user.plan === 'pro' || user.plan === 'institutional' ? '#fcd34d' : 'rgba(255,255,255,0.6)'};
										">
										{user.plan || 'Free'}
									</span>
								</td>
								<td class="p-4 text-right">
									<div class="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
										{#if user.plan === 'free'}
											<button
												class="btn-violet px-3 min-h-[44px] min-w-[100px] flex justify-center items-center text-[11px]"
												disabled={upgradingUser === user._id}
												on:click={() => setPlan(user._id, 'pro')}
											>
												{#if upgradingUser === user._id}<span class="spinner w-3 h-3"></span>{:else}Upgrade Pro{/if}
											</button>
										{:else}
											<button
												class="btn-ghost px-3 min-h-[44px] min-w-[100px] flex justify-center items-center text-[11px] bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20"
												disabled={upgradingUser === user._id}
												on:click={() => setPlan(user._id, 'free')}
											>
												Revoke Pro
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
