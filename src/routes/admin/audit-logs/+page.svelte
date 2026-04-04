<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import DataTable from '$lib/components/admin/DataTable.svelte';

	const logs = useQuery(api.admin.getAuditLogs, { limit: 100 });

	const columns = [
		{ key: 'timestamp', label: 'Time Registry', width: '20%', render: (row: any) => timeSnippet(row.timestamp) },
		{ key: 'userId', label: 'Subject', width: '20%', render: (row: any) => userSnippet(row.userId) },
		{ key: 'action', label: 'Operation', width: '25%', render: (row: any) => actionSnippet(row.action) },
		{ key: 'status', label: 'Outcome', width: '15%', render: (row: any) => statusSnippet(row.status) },
		{ key: 'metadata', label: 'Trace Data', width: '20%', render: (row: any) => metaSnippet(row.metadata) }
	];

	function formatTime(ts: number) {
		return new Date(ts).toLocaleString();
	}
</script>

{#snippet timeSnippet(ts: number)}
	<div class="text-[11px] font-mono font-bold text-white/50 tracking-tighter">
		{formatTime(ts)}
	</div>
{/snippet}

{#snippet userSnippet(uid: string)}
	<div class="flex items-center gap-2">
		<div class="w-6 h-6 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[10px]">👤</div>
		<span class="text-xs font-bold text-white/80 tracking-tight truncate max-w-[120px]">{uid || 'SYSTEM'}</span>
	</div>
{/snippet}

{#snippet actionSnippet(action: string)}
	<div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold text-violet-300 uppercase tracking-widest">
		{action.replace(/_/g, ' ')}
	</div>
{/snippet}

{#snippet statusSnippet(status: string)}
	<div class="flex items-center gap-2">
		<div class="w-1.5 h-1.5 rounded-full" style="background: {status === 'success' ? '#84cc16' : '#ef4444'};"></div>
		<span class="text-[10px] font-bold uppercase tracking-[0.2em] {status === 'success' ? 'text-lime-500' : 'text-rose-500'}">
			{status}
		</span>
	</div>
{/snippet}

{#snippet metaSnippet(meta: string)}
	<div class="text-[10px] font-mono text-white/20 truncate max-w-[200px]" title={meta}>
		{meta}
	</div>
{/snippet}

<div class="space-y-8">
	
	<!-- ── Header ── -->
	<div class="flex items-end justify-between">
		<div>
			<h1 class="font-display text-3xl text-white mb-2">Audit Registry</h1>
			<p class="text-white/40 text-sm italic">Immutable record of high-sensitivity operation signals.</p>
		</div>
		<button class="px-6 h-12 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-all shadow-xl">
			Download Immutable CSV
		</button>
	</div>

	<!-- ── Logs Table ── -->
	<DataTable 
		{columns} 
		data={$logs} 
		loading={$logs === undefined} 
	/>

</div>
