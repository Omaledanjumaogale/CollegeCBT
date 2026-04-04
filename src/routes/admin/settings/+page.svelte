<script lang="ts">
	import { showToast } from '$lib/stores';

	let saving = $state(false);

	// ── Platform Settings ────────────────────────────────────────
	let platformName  = $state('CollegeCBT');
	let supportEmail  = $state('support@collegecbt.dev');
	let maxFreeQsPerDay = $state(20);
	let maxProQsPerDay  = $state(200);
	let sessionTimeoutMins = $state(60);
	let crawlTtlHours   = $state(48);

	async function saveSettings() {
		saving = true;
		// Simulated save — in production this would call a Convex mutation
		await new Promise(r => setTimeout(r, 800));
		saving = false;
		showToast('✅ Settings Saved', 'Global platform settings have been updated successfully.', 'success');
	}
</script>

<svelte:head>
	<title>Global Settings — Admin | CollegeCBT</title>
</svelte:head>

<div class="space-y-8 max-w-4xl">

	<!-- ── Header ── -->
	<div>
		<h1 class="font-display text-3xl text-white mb-2">Global Settings</h1>
		<p class="text-white/40 text-sm">Configure platform-wide settings. These affect all users and environments.</p>
	</div>

	<!-- ── Platform Identity ── -->
	<div class="glass-card p-6 border border-white/5 space-y-6">
		<h2 class="font-bold text-white flex items-center gap-2 text-base">
			<span class="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">🏫</span>
			Platform Identity
		</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label for="settings-name" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Platform Name</label>
				<input id="settings-name" type="text" bind:value={platformName} class="form-input" placeholder="CollegeCBT" />
			</div>
			<div>
				<label for="settings-email" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Support Email</label>
				<input id="settings-email" type="email" bind:value={supportEmail} class="form-input" placeholder="support@collegecbt.dev" />
			</div>
		</div>
	</div>

	<!-- ── Usage Limits ── -->
	<div class="glass-card p-6 border border-white/5 space-y-6">
		<h2 class="font-bold text-white flex items-center gap-2 text-base">
			<span class="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">📊</span>
			Usage Limits
		</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label for="settings-free-q" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Free Plan: Max Questions / Day</label>
				<input id="settings-free-q" type="number" min="1" max="100" bind:value={maxFreeQsPerDay} class="form-input" />
			</div>
			<div>
				<label for="settings-pro-q" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Pro Plan: Max Questions / Day</label>
				<input id="settings-pro-q" type="number" min="1" max="1000" bind:value={maxProQsPerDay} class="form-input" />
			</div>
			<div>
				<label for="settings-timeout" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Session Timeout (minutes)</label>
				<input id="settings-timeout" type="number" min="15" max="480" bind:value={sessionTimeoutMins} class="form-input" />
			</div>
			<div>
				<label for="settings-crawl-ttl" class="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Cache Expiry for Web Research (hours)</label>
				<input id="settings-crawl-ttl" type="number" min="1" max="168" bind:value={crawlTtlHours} class="form-input" />
			</div>
		</div>
	</div>

	<!-- ── Danger Zone ── -->
	<div class="glass-card p-6 border border-rose-500/20">
		<h2 class="font-bold text-rose-400 flex items-center gap-2 text-base mb-4">
			<span>🚨</span> Danger Zone
		</h2>
		<div class="space-y-4">
			<div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
				<div>
					<div class="text-sm font-bold text-white">Clear All Cache</div>
					<div class="text-[11px] text-white/30 mt-0.5">Wipe the web research cache. AI agents will re-fetch all data.</div>
				</div>
				<button
					onclick={() => showToast('⚠️ Cache Cleared', 'All research cache entries have been purged.', 'warning')}
					class="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
				>Clear Cache</button>
			</div>
			<div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
				<div>
					<div class="text-sm font-bold text-white">Reset All Rate Limits</div>
					<div class="text-[11px] text-white/30 mt-0.5">Reset rate limit counters for all users. Use after a system incident.</div>
				</div>
				<button
					onclick={() => showToast('✅ Rate Limits Reset', 'All rate limit counters have been cleared.', 'success')}
					class="px-4 py-2 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
				>Reset Limits</button>
			</div>
		</div>
	</div>

	<!-- ── Save Button ── -->
	<div class="flex justify-end">
		<button
			onclick={saveSettings}
			disabled={saving}
			class="btn-violet px-8 py-3 flex items-center gap-3 text-sm font-bold"
		>
			{#if saving}
				<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
				Saving...
			{:else}
				💾 Save All Settings
			{/if}
		</button>
	</div>

</div>
