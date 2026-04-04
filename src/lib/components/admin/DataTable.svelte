<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	// ── Props & State ──
	let { 
		columns, 
		data, 
		loading = false,
		onRowClick = () => {}
	}: {
		columns: { key: string; label: string; width?: string; render?: any }[];
		data: any[] | undefined;
		loading?: boolean;
		onRowClick?: (row: any) => void;
	} = $props();

	let selectedRows = $state<Set<string>>(new Set());

	function toggleSelectAll(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.checked && data) {
			data.forEach(row => selectedRows.add(row._id));
		} else {
			selectedRows.clear();
		}
	}

	function toggleRowSelect(id: string) {
		if (selectedRows.has(id)) {
			selectedRows.delete(id);
		} else {
			selectedRows.add(id);
		}
	}
</script>

<div class="glass-card overflow-hidden border border-white/5 shadow-2xl relative">
	{#if loading}
		<div class="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center" transition:fade>
			<div class="flex flex-col items-center gap-4">
				<div class="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
				<p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Streaming Data...</p>
			</div>
		</div>
	{/if}

	<div class="overflow-x-auto custom-scrollbar">
		<table class="w-full text-left border-collapse min-w-[800px]">
			<thead>
				<tr class="bg-white/[0.02] border-b border-white/5">
					<th class="p-4 w-12">
						<div class="flex items-center justify-center">
							<input 
								type="checkbox" 
								class="w-4 h-4 rounded border-white/10 bg-black/40 text-violet-600 focus:ring-violet-500/20 transition-all cursor-pointer"
								onchange={toggleSelectAll}
							/>
						</div>
					</th>
					{#each columns as col}
						<th 
							class="p-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]"
							style="width: {col.width || 'auto'};"
						>
							{col.label}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#if data && data.length > 0}
					{#each data as row (row._id)}
						<tr 
							class="group hover:bg-white/[0.03] transition-colors cursor-pointer relative"
							onclick={() => onRowClick(row)}
						>
							<td class="p-4" onclick={(e) => e.stopPropagation()}>
								<div class="flex items-center justify-center">
									<input 
										type="checkbox" 
										checked={selectedRows.has(row._id)}
										class="w-4 h-4 rounded border-white/10 bg-black/40 text-violet-600 focus:ring-violet-500/20 transition-all cursor-pointer"
										onchange={() => toggleRowSelect(row._id)}
									/>
								</div>
							</td>
							{#each columns as col}
								<td class="p-4">
									{#if col.render}
										{@render col.render(row)}
									{:else}
										<span class="text-sm text-white/80 font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block">
											{row[col.key] || '—'}
										</span>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{:else if !loading}
					<tr>
						<td colspan={columns.length + 1} class="p-20 text-center">
							<div class="flex flex-col items-center gap-3">
								<span class="text-4xl filter grayscale opacity-20">📂</span>
								<p class="text-white/20 text-sm font-medium tracking-tight">No records found in current registry context.</p>
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Table Footer Stats -->
	<div class="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
		<div class="text-[10px] text-white/20 uppercase tracking-widest font-bold">
			Total Entries: {data?.length || 0}
		</div>
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] text-white/40 uppercase tracking-widest font-black">
				<span class="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
				Ready
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		height: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
</style>
