<script lang="ts">
	import { convex } from '$lib/services/convexClient';
	import { anyApi } from 'convex/server';
	import { showToast } from '$lib/stores';

	// ── Feature Flags State (local with Convex sync planned) ──
	let flags = $state([
		{ id: 'ai_orchestration',    label: 'AI Exam Generation',     desc: 'Enable multi-model AI question generation for all users.',   enabled: true,  badge: 'Core' },
		{ id: 'crawl4ai_pipeline',   label: 'Web Research Agent',     desc: 'Allow AI agents to fetch and cache external content.',        enabled: true,  badge: 'AI' },
		{ id: 'theory_questions',    label: 'Theory Questions',        desc: 'Enable theory/essay question mode in the Exam Lab.',         enabled: true,  badge: 'Feature' },
		{ id: 'pro_gating',          label: 'Pro Plan Gating',         desc: 'Restrict advanced features to Pro and Institutional users.',  enabled: false, badge: 'Billing' },
		{ id: 'maintenance_mode',    label: 'Maintenance Mode',        desc: 'Show a maintenance page to all users except admins.',        enabled: false, badge: 'System' },
		{ id: 'manual_snapshots',    label: 'Manual DB Snapshots',     desc: 'Allow triggering database snapshots from this panel.',       enabled: false, badge: 'System' },
		{ id: 'beta_features',       label: 'Beta Features Access',    desc: 'Open beta experiments to opted-in users.',                   enabled: false, badge: 'Beta' },
		{ id: 'email_notifications', label: 'Email Notifications',     desc: 'Send automated emails on score submissions and upgrades.',   enabled: true,  badge: 'Comms' },
	]);

	async function toggleFlag(id: string) {
		const flag = flags.find(f => f.id === id);
		if (!flag) return;
		flag.enabled = !flag.enabled;

		// Sync maintenance_mode to Convex backend
		if (id === 'maintenance_mode') {
			try {
				await convex.mutation(anyApi.admin.setMaintenanceMode, { enabled: flag.enabled });
			} catch (err) {
				console.error('[Admin] Maintenance flag sync failed:', err);
			}
		}

		showToast(
			flag.enabled ? '✅ Flag Enabled' : '⚠️ Flag Disabled',
			`"${flag.label}" has been ${flag.enabled ? 'turned on' : 'turned off'}.`,
			flag.enabled ? 'success' : 'warning'
		);
	}

	const badgeColors: Record<string, string> = {
		'Core':    'bg-violet-500/10 text-violet-400 border-violet-500/20',
		'AI':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
		'Feature': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
		'Billing': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
		'System':  'bg-rose-500/10 text-rose-400 border-rose-500/20',
		'Beta':    'bg-pink-500/10 text-pink-400 border-pink-500/20',
		'Comms':   'bg-sky-500/10 text-sky-400 border-sky-500/20',
	};

	let maintenanceFlag = $derived(flags.find(f => f.id === 'maintenance_mode'));
</script>

<svelte:head>
	<title>Feature Flags — Admin | CollegeCBT</title>
</svelte:head>

<div class="space-y-8">

	<!-- ── Header ── -->
	<div class="flex items-end justify-between flex-wrap gap-4">
		<div>
			<h1 class="font-display text-3xl text-white mb-2">Feature Flags</h1>
			<p class="text-white/40 text-sm">Toggle platform features on or off in real time. Changes take effect immediately.</p>
		</div>
		<div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
			<span class="text-lg">⚠️</span>
			<span class="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Changes are live — use with care</span>
		</div>
	</div>

	<!-- ── Stats ── -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#each [
			{ label: 'Total Flags',  value: flags.length, color: '#a78bfa' },
			{ label: 'Enabled',      value: flags.filter(f => f.enabled).length,           color: '#84cc16' },
			{ label: 'Disabled',     value: flags.filter(f => !f.enabled).length,          color: '#f59e0b' },
			{ label: 'System Flags', value: flags.filter(f => f.badge === 'System').length, color: '#22d3ee' },
		] as stat}
			<div class="glass-card p-5 border border-white/5">
				<div class="text-2xl font-display font-bold" style="color:{stat.color};">{stat.value}</div>
				<div class="text-[10px] text-white/30 uppercase tracking-widest mt-1">{stat.label}</div>
			</div>
		{/each}
	</div>

	<!-- ── Flags Grid ── -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each flags as flag (flag.id)}
			<div class={`glass-card p-6 flex items-start gap-4 group transition-all border ${flag.enabled ? 'border-lime-500/10 hover:border-lime-500/20' : 'border-white/5 hover:border-violet-500/20'}`}>

				<!-- Toggle Switch -->
				<button
					onclick={() => toggleFlag(flag.id)}
					class="relative w-12 h-6 rounded-full border transition-all duration-300 flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
					style="background:{flag.enabled ? 'rgba(132,204,22,0.2)' : 'rgba(255,255,255,0.05)'};border-color:{flag.enabled ? 'rgba(132,204,22,0.4)' : 'rgba(255,255,255,0.08)'};"
					aria-label="Toggle {flag.label}"
					role="switch"
					aria-checked={flag.enabled}
				>
					<div
						class="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-lg"
						style="background:{flag.enabled ? '#84cc16' : 'rgba(255,255,255,0.2)'};left:{flag.enabled ? 'calc(100% - 22px)' : '2px'};"
					></div>
				</button>

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-1 flex-wrap">
						<span class="text-sm font-bold text-white">{flag.label}</span>
						<span class={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${badgeColors[flag.badge] ?? ''}`}>{flag.badge}</span>
						{#if flag.enabled}
							<span class="text-[9px] font-bold text-lime-500 uppercase tracking-widest ml-auto">ON</span>
						{:else}
							<span class="text-[9px] font-bold text-white/25 uppercase tracking-widest ml-auto">OFF</span>
						{/if}
					</div>
					<p class="text-[11px] text-white/40 leading-relaxed">{flag.desc}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- ── Danger Zone: Maintenance Mode ── -->
	<div class="glass-card p-6 border border-rose-500/20">
		<h3 class="font-bold text-rose-400 mb-1 flex items-center gap-2">
			<span>🚨</span> Maintenance Mode Warning
		</h3>
		<p class="text-[11px] text-white/40 mb-4">
			Enabling maintenance mode will show a "Platform is temporarily unavailable" page to all regular users. Admins retain full access.
		</p>
		<button
			onclick={() => toggleFlag('maintenance_mode')}
			class={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${maintenanceFlag?.enabled ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
		>
			{#if maintenanceFlag?.enabled}
				✅ Maintenance Mode is ON — Click to Disable
			{:else}
				🔴 Enable Maintenance Mode
			{/if}
		</button>
	</div>

</div>
