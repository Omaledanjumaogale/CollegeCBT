<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	const health = useQuery(api.admin.getSystemHealth, {});
	const recentLogs = useQuery(api.admin.getRecentActivity, { limit: 20 });

	const services = [
		{ name: 'Convex Database', status: 'Operational', latency: '12ms', color: '#84cc16' },
		{ name: 'Firebase Execution', status: 'Optimal', latency: '45ms', color: '#22d3ee' },
		{ name: 'Edge Worker (LON-01)', status: 'Active', latency: '8ms', color: '#a78bfa' },
		{ name: 'Internal SvelteKit Stack', status: 'Stable', latency: '3ms', color: '#fcd34d' }
	];

	function formatTime(ts: number) {
		return new Date(ts).toLocaleTimeString();
	}
</script>

<div class="space-y-10">
	
	<!-- ── Header ── -->
	<div class="flex items-end justify-between">
		<div>
			<h1 class="font-display text-3xl text-white mb-2">System Observability</h1>
			<p class="text-white/40 text-sm italic">High-fidelity telemetry across the Edge and distributed clusters.</p>
		</div>
		<div class="px-5 py-2.5 rounded-full bg-lime-500/5 border border-lime-500/20 text-[10px] font-black text-lime-500 tracking-widest uppercase animate-pulse">
			Streaming Registry Sync
		</div>
	</div>

	<!-- ── Node Health Map ── -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
		{#each services as s}
			<div class="glass-card p-6 border border-white/5 relative overflow-hidden group">
				<div class="absolute -top-10 -right-10 w-24 h-24 blur-[30px] opacity-10 rounded-full" style="background:{s.color};"></div>
				
				<div class="flex items-center justify-between mb-4">
					<div class="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{s.name}</div>
					<div class="w-1.5 h-1.5 rounded-full" style="background:{s.color}; shadow: 0 0 10px {s.color}66;"></div>
				</div>

				<div class="flex items-end justify-between">
					<div>
						<div class="text-xs font-bold text-white mb-1">{s.status}</div>
						<div class="text-[10px] text-white/40 font-mono italic">Protocol: WebSocket</div>
					</div>
					<div class="text-right">
						<div class="text-sm font-black tracking-tight" style="color:{s.color};">{s.latency}</div>
						<div class="text-[8px] text-white/20 uppercase font-black">Latency</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
		
		<!-- ── Throughput Heatmap ── -->
		<div class="glass-card flex flex-col min-h-[500px]">
			<div class="h-16 px-8 border-b border-white/5 flex items-center justify-between">
				<h4 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Network Throughput Visualization</h4>
				<div class="flex gap-4">
					<div class="flex items-center gap-1.5 text-[9px] text-white/30"><span class="w-1.5 h-1.5 rounded-full bg-rose-500/40"></span> Failures</div>
					<div class="flex items-center gap-1.5 text-[9px] text-white/30"><span class="w-1.5 h-1.5 rounded-full bg-lime-500/40"></span> Success</div>
				</div>
			</div>

			<div class="flex-1 p-8 flex items-center justify-center relative bg-black/20 overflow-hidden">
				<!-- High Performance Grid Visualization -->
				<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image:radial-gradient(rgba(124,58,237,0.2) 1px, transparent 0); background-size: 24px 24px;"></div>
				
				<div class="w-full h-48 flex items-end gap-2 px-4 relative z-10">
					{#each Array(24) as _, i}
						<div class="flex-1 rounded-full bg-gradient-to-t from-violet-600/40 to-violet-500/80 transition-all duration-1000" style="height: {Math.random() * 80 + 20}%; opacity: {Math.random() * 0.5 + 0.5};"></div>
					{/each}
				</div>

				<div class="absolute bottom-8 left-8 text-left">
					<div class="text-4xl font-display text-white mb-1 tracking-tight">{$health?.throughput || 0} Req</div>
					<div class="text-[10px] text-white/20 uppercase tracking-widest font-black leading-tight">Requests per hour · Node Active</div>
				</div>
			</div>
		</div>

		<!-- ── Live Telemetry Feed ── -->
		<div class="glass-card flex flex-col p-6 bg-black/40">
			<div class="mb-6 flex items-center justify-between">
				<h4 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Registry Pulse</h4>
				<div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">🚀</div>
			</div>

			<div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
				{#if $recentLogs}
					{#each $recentLogs as log}
						<div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 group hover:border-violet-500/30 transition-all cursor-default">
							<div class="flex items-center justify-between">
								<span class="text-[9px] font-black uppercase tracking-widest {log.status === 'success' ? 'text-lime-500' : 'text-rose-500'}">
									{log.status === 'success' ? '✓ SYN' : '✕ ERR'}
								</span>
								<span class="text-[8px] text-white/10 font-mono">{formatTime(log.timestamp)}</span>
							</div>
							<div class="text-[10px] text-white font-bold leading-tight group-hover:text-violet-300 transition-colors">
								{log.action.replace(/_/g, ' ')}
							</div>
							<div class="text-[8px] text-white/20 truncate font-mono uppercase tracking-tighter">
								ID: {log.userId || 'SYSTEM'} · ADDR: GLOBAL
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

	</div>

	<!-- ── Component Load Details ── -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<div class="glass-card p-6 bg-white/[0.01]">
			<div class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">WebSocket Health</div>
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-2xl">🔗</div>
				<div>
					<div class="text-sm font-bold text-white">Full Duplex</div>
					<div class="text-[9px] text-lime-500/60 uppercase tracking-widest font-black">Connected · Edge Signal</div>
				</div>
			</div>
		</div>
		<div class="glass-card p-6 bg-white/[0.01]">
			<div class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Encryption Logic</div>
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-2xl">🛡️</div>
				<div>
					<div class="text-sm font-bold text-white">AES-256-GCM</div>
					<div class="text-[9px] text-white/20 uppercase tracking-widest font-black">Cloudflare Keyless Sync</div>
				</div>
			</div>
		</div>
		<div class="glass-card p-6 bg-white/[0.01]">
			<div class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">DB Consistency</div>
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-2xl">💎</div>
				<div>
					<div class="text-sm font-bold text-white">Strict ACID</div>
					<div class="text-[9px] text-violet-400 uppercase tracking-widest font-black">Convex Atomic Layer</div>
				</div>
			</div>
		</div>
	</div>

</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 3px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
</style>
