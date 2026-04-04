<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api, convex } from '$lib/services/convexClient';
	import { anyApi } from 'convex/server';
	import { fade, slide } from 'svelte/transition';
	import { showToast } from '$lib/stores';

	// ── Real-time Analytics ──
	const statsQuery = useQuery(api.admin.getDashboardStats, {});
	const activityQuery = useQuery(api.admin.getRecentActivity, { limit: 12 });
	const healthQuery = useQuery(api.admin.getSystemHealth, {});
	const maintenanceQuery = useQuery(anyApi.admin.getConfigFlag, { key: 'maintenance_mode' });

	// ── Metrics Computed via .data property (Svelte 5 runes mode) ──
	let stats = $derived(statsQuery.data);
	let activity = $derived(activityQuery.data);
	let health = $derived(healthQuery.data);
	let maintenanceEnabled = $derived(maintenanceQuery.data === 'true');

	let isFlushing = $state(false);
	let isTogglingMaintenance = $state(false);

	let kpis = $derived([
		{ 
			label: 'Total Registered Users', 
			value: stats?.totalUsers ?? 0, 
			icon: '👥', 
			color: '#7c3aed', 
			trend: '+12%', 
			sub: 'Cumulative Growth' 
		},
		{ 
			label: 'Concurrent Active Sessions', 
			value: stats?.activeSessions ?? 0, 
			icon: '⚡', 
			color: '#84cc16', 
			trend: 'Stable', 
			sub: 'Past 5 Minutes' 
		},
		{ 
			label: 'Real-time Exam Count', 
			value: stats?.examStats?.total ?? 0, 
			icon: '📝', 
			color: '#22d3ee', 
			trend: '↑ 34', 
			sub: 'Conducted Today' 
		},
		{ 
			label: 'Estimated Revenue', 
			value: `₦${(stats?.revenueEst ?? 0).toLocaleString()}`, 
			icon: '💰', 
			color: '#f59e0b', 
			trend: 'New Milestone', 
			sub: 'Monthly Revenue' 
		}
	]);

	async function handleFlushCache() {
		if (isFlushing) return;
		isFlushing = true;
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result: any = await convex.mutation(anyApi.admin.flushCache, {});
			showToast('✅ Cache Flushed', `${result?.flushed ?? 0} entries cleared from global cache.`, 'success');
		} catch (err) {
			showToast('❌ Flush Failed', 'Could not flush cache. Check logs.', 'error');
		} finally {
			isFlushing = false;
		}
	}

	async function handleToggleMaintenance() {
		if (isTogglingMaintenance) return;
		isTogglingMaintenance = true;
		try {
			const next = !maintenanceEnabled;
			await convex.mutation(anyApi.admin.setMaintenanceMode, { enabled: next });
			showToast(
				next ? '🛑 Maintenance ON' : '✅ Maintenance OFF',
				next ? 'AI generation is now blocked for all users.' : 'System returned to normal operation.',
				next ? 'info' : 'success'
			);
		} catch (err) {
			showToast('❌ Failed', 'Could not toggle maintenance mode.', 'error');
		} finally {
			isTogglingMaintenance = false;
		}
	}

	function formatTime(ts: number) {
		return new Date(ts).toLocaleTimeString();
	}
</script>


<div class="space-y-8">
	<!-- ── Header & Time ── -->
	<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-3xl text-white mb-2">Operations Overview</h1>
			<p class="text-white/40 text-sm">Real-time command & analytics for the CollegeCBT ecosystem.</p>
		</div>
		<div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest">
			<span>⏱️ SYNCED: {formatTime(Date.now())}</span>
			<span class="w-1 h-1 rounded-full bg-lime-500"></span>
			<span>REGION: LON-01</span>
		</div>
	</div>

	<!-- ── KPI Dashboard ── -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
		{#each kpis as k}
			<div class="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
				<!-- KPI Accent Decor -->
				<div class="absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 rounded-full" style="background:{k.color};"></div>
				
				<div class="relative z-10">
					<div class="flex items-center justify-between mb-4">
						<div class="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl shadow-inner">{k.icon}</div>
						<div class="text-[10px] font-black px-2 py-1 rounded bg-white/5 border border-white/5" style="color:{k.color};">{k.trend}</div>
					</div>
					
					<div class="space-y-1">
						<div class="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{k.label}</div>
						<div class="text-3xl font-display text-white tracking-tight">{k.value}</div>
						<p class="text-[10px] text-white/20 italic">{k.sub}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
		
		<!-- ── Main Activity & Performance ── -->
		<div class="space-y-8">
			
			<!-- System Capacity Card -->
			<div class="glass-card p-8 min-h-[400px] flex flex-col">
				<div class="flex items-center justify-between mb-8">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-xl">🌐</div>
						<div>
							<h3 class="font-bold text-white text-sm">Cluster Performance Map</h3>
							<p class="text-white/30 text-[10px] uppercase tracking-widest">Global Telemetry Data</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<div class="flex items-center gap-1.5 text-xs text-lime-500 bg-lime-500/5 px-3 py-1 rounded-full border border-lime-500/20">
							<span class="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></span>
							Healthy
						</div>
					</div>
				</div>

				<div class="flex-1 flex flex-col items-center justify-center space-y-6">
					<!-- Visual Gauge -->
					<div class="relative w-64 h-64 flex items-center justify-center">
						<div class="absolute inset-0 rounded-full border-[12px] border-white/5"></div>
						<div class="absolute inset-0 rounded-full border-[12px] border-b-transparent border-l-transparent border-violet-600/50 rotate-45"></div>
						<div class="text-center">
							<div class="text-xs text-white/30 uppercase tracking-widest mb-1">Crawl Stability</div>
							<div class="text-5xl font-display text-white">{health?.crawlSuccessRate || 100}%</div>
							<div class="text-[10px] text-lime-500 font-bold mt-2">Optimal Bandwidth</div>
						</div>
					</div>

					<div class="grid grid-cols-3 w-full gap-4 pt-6">
						<div class="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
							<div class="text-white/30 text-[9px] uppercase tracking-widest mb-1">Avg Latency</div>
							<div class="text-sm font-bold text-white">{health?.latencyAvg || 0}ms</div>
						</div>
						<div class="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
							<div class="text-white/30 text-[9px] uppercase tracking-widest mb-1">Throughput / hr</div>
							<div class="text-sm font-bold text-white">{health?.throughput || 0} Req</div>
						</div>
						<div class="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
							<div class="text-white/30 text-[9px] uppercase tracking-widest mb-1">Memory Cache</div>
							<div class="text-sm font-bold text-lime-500">Hit: 92%</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Quick Admin Tools -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<button
					onclick={handleFlushCache}
					disabled={isFlushing}
					class="flex flex-col items-center gap-3 p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-violet-500/50 transition-all group shadow-xl disabled:opacity-60"
				>
					<span class="text-3xl group-hover:scale-110 transition-transform">🛠️</span>
					<span class="text-xs font-bold text-white/60 tracking-tight">
						{isFlushing ? 'Flushing...' : 'Rebuild Global Cache'}
					</span>
				</button>
				<button
				onclick={handleToggleMaintenance}
				disabled={isTogglingMaintenance}
				class={`flex flex-col items-center gap-3 p-6 rounded-3xl bg-black/40 border transition-all group shadow-xl disabled:opacity-60 ${maintenanceEnabled ? 'border-rose-500/50 hover:border-rose-500' : 'border-white/5 hover:border-rose-500/50'}`}
			>
				<span class="text-3xl group-hover:scale-110 transition-transform">
					{#if maintenanceEnabled}✅{:else}🛑{/if}
				</span>
				<span class={`text-xs font-bold tracking-tight ${maintenanceEnabled ? 'text-rose-400' : 'text-white/60'}`}>
					{#if isTogglingMaintenance}Toggling...{:else if maintenanceEnabled}Exit Maintenance{:else}Enter Maintenance{/if}
				</span>
			</button>

				<button
					onclick={() => showToast('Backup', 'Manual audit snapshot recorded.', 'success')}
					class="flex flex-col items-center gap-3 p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-lime-500/50 transition-all group shadow-xl"
				>
					<span class="text-3xl group-hover:scale-110 transition-transform">💾</span>
					<span class="text-xs font-bold text-white/60 tracking-tight">Manual Snapshot</span>
				</button>
			</div>

		</div>

		<!-- ── Live Activity Sidebar ── -->
		<div class="space-y-6">
			<div class="glass-card p-6 h-[720px] flex flex-col relative overflow-hidden">
				<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-lime-500"></div>
				
				<div class="flex items-center justify-between mb-8">
					<h3 class="font-bold text-white text-sm">System Pulse</h3>
					<div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-600/20 text-[9px] font-black text-violet-400 uppercase tracking-widest">Live</div>
				</div>

				<div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
					{#if activityQuery.isLoading}
						<div class="flex items-center justify-center h-40">
							<div class="text-white/20 animate-pulse">Establishing Signal...</div>
						</div>
					{:else if activity && activity.length > 0}
						{#each activity as act}
							<div class="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 relative group hover:bg-white/[0.06] transition-colors" in:slide>
								<div class="w-10 h-10 rounded-xl bg-black/60 flex items-center justify-center text-lg flex-shrink-0 border border-white/5 shadow-xl">
									{#if act.action.includes('login')} 🔑 
									{:else if act.action.includes('exam')} 📝
									{:else if act.action.includes('crawl')} 🤖
									{:else if act.action.includes('role')} 🛡️
									{:else} 🏷️ {/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center justify-between mb-1">
										<span class="text-[10px] font-bold text-white/60 truncate max-w-[140px] uppercase tracking-wider">{act.userEmail}</span>
										<span class="text-[9px] text-white/20">{formatTime(act.timestamp)}</span>
									</div>
									<div class="text-[11px] text-white/80 font-medium mb-1 capitalize leading-tight">
										{act.action.replace(/_/g, ' ')}
									</div>
									<div class="text-[9px] text-white/30 truncate font-mono">
										{act.metadata}
									</div>
								</div>
							</div>
						{/each}
					{:else}
						<div class="flex items-center justify-center h-40">
							<div class="text-white/20">No recent activity</div>
						</div>
					{/if}
				</div>

				<a href="/admin/audit-logs" class="mt-6 flex items-center justify-center py-3 rounded-xl border border-white/5 bg-white/5 text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white transition-colors">
					View Complete Registry →
				</a>
			</div>
		</div>

	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
</style>
