<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import { fade, slide } from 'svelte/transition';
	import { showToast } from '$lib/stores';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import Drawer from '$lib/components/admin/Drawer.svelte';

	// ── State ──
	let searchTerm = $state('');
	let filterPlan = $state('');
	let selectedUser = $state<any>(null);
	let isDrawerOpen = $state(false);
	
	// ── Convex Real-time Data ──
	const users = useQuery(api.admin.getUsers, () => ({ 
		search: searchTerm, 
		plan: filterPlan || undefined 
	}));
	
	const convex = useConvexClient();

	// ── Table Column Definitions ──
	const columns = [
		{ 
			key: 'user', 
			label: 'Identity Registry', 
			width: '30%',
			render: (row: any) => rowSnippet(row)
		},
		{ 
			key: 'institutionName', 
			label: 'Affiliation', 
			width: '25%'
		},
		{ 
			key: 'plan', 
			label: 'Tier Status', 
			width: '15%',
			render: (row: any) => badgeSnippet(row.plan)
		},
		{ 
			key: 'role', 
			label: 'Permissions', 
			width: '15%',
			render: (row: any) => roleSnippet(row.role || 'user')
		},
		{ 
			key: 'level', 
			label: 'Level', 
			width: '10%'
		},
		{ 
			key: 'actions', 
			label: 'Ops', 
			width: '5%',
			render: (row: any) => actionsSnippet(row)
		}
	];

	function openUser(user: any) {
		selectedUser = user;
		isDrawerOpen = true;
	}

	async function toggleRole() {
		if (!selectedUser) return;
		const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
		try {
			await convex.mutation(api.admin.updateUserRole, { uid: selectedUser.uid, role: newRole });
			showToast('✅ Role Updated', `User ${selectedUser.email} is now a ${newRole.toUpperCase()}.`, 'success');
			isDrawerOpen = false;
		} catch (e) {
			showToast('❌ Error', 'Failed to update user permissions.', 'error');
		}
	}
</script>

{#snippet rowSnippet(row: any)}
	<div class="flex items-center gap-3">
		<div class="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-lg shadow-inner">
			{row.displayName?.[0] || '👤'}
		</div>
		<div class="min-w-0">
			<div class="text-sm font-bold text-white truncate max-w-[180px]">{row.displayName || 'Active Student'}</div>
			<div class="text-[10px] text-white/30 truncate max-w-[180px] font-mono tracking-tight">{row.email}</div>
		</div>
	</div>
{/snippet}

{#snippet badgeSnippet(plan: string)}
	<div 
		class="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
		style="
			background: {plan === 'pro' ? 'rgba(132,204,22,0.1)' : plan === 'institutional' ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)'};
			color: {plan === 'pro' ? '#84cc16' : plan === 'institutional' ? '#22d3ee' : 'rgba(255,255,255,0.4)'};
			border-color: {plan === 'pro' ? 'rgba(132,204,22,0.2)' : plan === 'institutional' ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.1)'};
		"
	>
		{plan || 'Free'}
	</div>
{/snippet}

{#snippet roleSnippet(role: string)}
	<div class="flex items-center gap-2">
		<div class="w-2 h-2 rounded-full" style="background: {role === 'admin' ? '#ef4444' : '#6b7280'}; shadow: 0 0 8px {role === 'admin' ? '#ef444455' : 'transparent'};"></div>
		<span class="text-[10px] font-bold uppercase tracking-widest {role === 'admin' ? 'text-rose-400' : 'text-white/30'}">{role}</span>
	</div>
{/snippet}

{#snippet actionsSnippet(row: any)}
	<button 
		class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/50 hover:text-white text-white/40 transition-all flex items-center justify-center"
		onclick={() => openUser(row)}
		aria-label="Manage User Configuration"
	>
		<span class="text-lg">⚙️</span>
	</button>
{/snippet}

<div class="space-y-8">
	
	<!-- ── Header & Strategy ── -->
	<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
		<div>
			<h1 class="font-display text-3xl text-white mb-2">Registry Management</h1>
			<p class="text-white/40 text-sm">Synchronized directory of all provisioned accounts across the cluster.</p>
		</div>
		
		<div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
			<div class="relative w-full sm:w-[280px]">
				<input 
					type="text" 
					bind:value={searchTerm}
					placeholder="Query UID, Email, or Name..."
					class="form-input h-12 bg-black/40 border-white/5 focus:border-violet-500/40 px-10 text-xs tracking-tight"
				/>
				<div class="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">🔍</div>
			</div>
			
			<select 
				bind:value={filterPlan}
				class="h-12 bg-black/40 border border-white/5 rounded-xl px-4 text-xs font-bold text-white/40 focus:border-violet-500/40 outline-none min-w-[140px]"
			>
				<option value="">All Tiers</option>
				<option value="free">Free Only</option>
				<option value="pro">Pro Tier</option>
				<option value="institutional">Institutional</option>
			</select>

			<button class="btn-violet h-12 px-6 flex items-center gap-2 text-[11px] font-bold shadow-2xl">
				<span>📤</span> Export Registry
			</button>
		</div>
	</div>

	<!-- ── Live Table View ── -->
	<DataTable 
		{columns} 
		data={$users} 
		loading={$users === undefined}
		onRowClick={openUser}
	/>

</div>

<!-- ── Identity Drawer ── -->
<Drawer 
	isOpen={isDrawerOpen}
	title="Identity Resolution"
	subtitle="UID: {selectedUser?.uid || 'Loading'}"
	onClose={() => isDrawerOpen = false}
>
	<div class="space-y-8">
		<!-- Summary Context -->
		<div class="p-6 rounded-3xl bg-white/[0.03] border border-white/5 text-center relative overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent"></div>
			<div class="w-20 h-20 rounded-2xl bg-black/60 mx-auto mb-4 flex items-center justify-center text-4xl shadow-2xl border border-white/10 relative z-10">
				{selectedUser?.displayName?.[0] || '👤'}
			</div>
			<h4 class="font-display text-xl text-white mb-1 relative z-10">{selectedUser?.displayName || 'Active Student'}</h4>
			<p class="text-xs text-white/30 font-mono relative z-10">{selectedUser?.email}</p>
		</div>

		<!-- Permission Matrix -->
		<div class="space-y-4">
			<h5 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-1">Infrastructure Access</h5>
			<div class="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
				<div>
					<div class="text-sm font-bold text-white">Administrator Privileges</div>
					<div class="text-[10px] text-white/20 uppercase tracking-widest mt-1">Full Edge Access</div>
				</div>
				<button 
					onclick={toggleRole}
					class="w-14 h-8 rounded-full border border-white/10 relative transition-all duration-300 {selectedUser?.role === 'admin' ? 'bg-violet-600' : 'bg-white/5'}"
					aria-label="Toggle Administrative Privileges"
				>
					<div 
						class="absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-300"
						style="left: {selectedUser?.role === 'admin' ? 'calc(100% - 28px)' : '4px'};"
					></div>
				</button>
			</div>
		</div>

		<!-- Identity Details -->
		<div class="space-y-4">
			<h5 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-1">Registry Metadata</h5>
			<div class="grid grid-cols-2 gap-3">
				<div class="p-4 rounded-2xl bg-white/5 border border-white/5">
					<div class="text-[9px] text-white/20 uppercase tracking-widest mb-1">State Origin</div>
					<div class="text-xs font-bold text-white">{selectedUser?.stateOfOrigin || 'Not Logged'}</div>
				</div>
				<div class="p-4 rounded-2xl bg-white/5 border border-white/5">
					<div class="text-[9px] text-white/20 uppercase tracking-widest mb-1">Device Signal</div>
					<div class="text-xs font-bold text-lime-500">Encrypted</div>
				</div>
			</div>
		</div>

		<!-- Dangerous Zone -->
		<div class="space-y-4 pt-6 border-t border-white/5">
			<h5 class="text-[10px] font-bold text-rose-500/50 uppercase tracking-[0.2em] px-1">Destructive Pipeline</h5>
			<button class="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 group hover:bg-rose-500/10 transition-all">
				<span class="text-xs font-bold text-left">Suspend Access Immediately</span>
				<span class="text-lg group-hover:translate-x-1 transition-transform">⚠️</span>
			</button>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex gap-4">
			<button class="btn-ghost flex-1 h-[52px] rounded-xl text-xs font-bold font-mono tracking-tight" onclick={() => isDrawerOpen = false}>CLOSE REGISTRY</button>
			<button class="btn-violet flex-1 h-[52px] rounded-xl text-xs font-bold tracking-tight shadow-xl">COMMUNICATION PUSH</button>
		</div>
	{/snippet}
</Drawer>

<style>
	:global(.nav-active) {
		background: rgba(124, 58, 237, 0.12);
		border-color: rgba(124, 58, 237, 0.25);
	}
</style>
