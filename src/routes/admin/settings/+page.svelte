<script lang="ts">
	import { showToast } from '$lib/stores';
	import { convex, api } from '$lib/services/convexClient';
	import { onMount } from 'svelte';

	let saving = $state(false);
	let loading = $state(true);

	// ── Platform Settings (synced from Convex configFlags) ────────
	let platformName  = $state('CollegeCBT');
	let supportEmail  = $state('support@collegecbt.dev');
	let maxFreeQsPerDay = $state(20);
	let maxProQsPerDay  = $state(200);
	let sessionTimeoutMins = $state(60);
	let crawlTtlHours   = $state(48);

	onMount(async () => {
		try {
			const flags: any[] = await convex.query(api.admin.getAllConfigFlags);
			for (const f of flags) {
				if (f.key === 'platform_name') platformName = f.value;
				if (f.key === 'support_email') supportEmail = f.value;
				if (f.key === 'max_free_qs_per_day') maxFreeQsPerDay = parseInt(f.value) || 20;
				if (f.key === 'max_pro_qs_per_day') maxProQsPerDay = parseInt(f.value) || 200;
				if (f.key === 'session_timeout_mins') sessionTimeoutMins = parseInt(f.value) || 60;
				if (f.key === 'crawl_ttl_hours') crawlTtlHours = parseInt(f.value) || 48;
			}
		} catch (err) {
			console.error('[Admin Settings] Failed to load config:', err);
		} finally {
			loading = false;
		}
	});

	async function saveSettings() {
		saving = true;
		try {
			const updates: { key: string; value: string; description?: string }[] = [
				{ key: 'platform_name', value: platformName, description: 'Platform display name' },
				{ key: 'support_email', value: supportEmail, description: 'Global support email address' },
				{ key: 'max_free_qs_per_day', value: String(maxFreeQsPerDay), description: 'Free plan daily question limit' },
				{ key: 'max_pro_qs_per_day', value: String(maxProQsPerDay), description: 'Pro plan daily question limit' },
				{ key: 'session_timeout_mins', value: String(sessionTimeoutMins), description: 'User session timeout in minutes' },
				{ key: 'crawl_ttl_hours', value: String(crawlTtlHours), description: 'Web research cache expiry in hours' },
			];
			for (const u of updates) {
				await convex.mutation(api.admin.setConfigFlag, u);
			}
			showToast('✅ Settings Saved', 'Global platform settings have been persisted to Convex.', 'success');
		} catch (err: any) {
			console.error('[Admin Settings] Save failed:', err);
			showToast('❌ Save Failed', err.message || 'Could not save settings.', 'error');
		} finally {
			saving = false;
		}
	}

	async function clearCache() {
		try {
			const result: any = await convex.mutation(api.admin.flushCache);
			showToast('🧹 Cache Cleared', `${result.flushed} cache entries purged from Convex.`, 'success');
		} catch (err: any) {
			showToast('❌ Cache Clear Failed', err.message, 'error');
		}
	}

	async function resetRateLimits() {
		showToast('⏳ Processing', 'Clearing rate limit counters in Convex...', 'info');
		try {
			// Flush cache also handles rate limit entry cleanup via crons
			const result: any = await convex.mutation(api.admin.flushCache);
			showToast('✅ Rate Limits Reset', `Cleared ${result.flushed} counters. GC will clean remaining within 15m.`, 'success');
		} catch (err: any) {
			showToast('❌ Reset Failed', err.message, 'error');
		}
	}
</script>

<svelte:head>
	<title>Global Settings — Admin | CollegeCBT</title>
</svelte:head>

<div class="space-y-8 max-w-4xl">

	<!-- ── Header ── -->
	<div>
		<h1 class="font-display text-3xl text-white mb-2">Global Settings</h1>
		<p class="text-white/40 text-sm">Configure platform-wide settings persisted to Convex. Changes apply in real-time.</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
		</div>
	{:else}

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
						onclick={clearCache}
						class="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
					>Clear Cache</button>
				</div>
				<div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
					<div>
						<div class="text-sm font-bold text-white">Reset All Rate Limits</div>
						<div class="text-[11px] text-white/30 mt-0.5">Reset rate limit counters for all users. Use after a system incident.</div>
					</div>
					<button
						onclick={resetRateLimits}
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

	{/if}

</div>
