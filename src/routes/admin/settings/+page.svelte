<script lang="ts">
	import { fade } from 'svelte/transition';
	import { showToast } from '$lib/stores';

	let saving = false;

	// Mock settings state
	let settings = {
		allowNewSignups: true,
		maintenanceMode: false,
		jambRegistrationActive: true,
		aiGenerationEnabled: true,
		freePlanMaxQuestions: 5,
		proPlanMaxQuestions: 50,
		demoModeActive: false
	};

	async function saveSettings() {
		saving = true;
		// Simulated save
		await new Promise(r => setTimeout(r, 800));
		saving = false;
		showToast('✅ Saved', 'System settings updated successfully', 'success');
	}
</script>

<svelte:head>
	<title>System Settings — Admin</title>
</svelte:head>

<div in:fade class="max-w-3xl">
	<div class="mb-6">
		<h1 class="font-display text-2xl md:text-3xl mb-1">System Settings</h1>
		<p class="text-white/40 text-sm">Configure global application parameters.</p>
	</div>

	<div class="glass-card p-6 mb-6">
		<h2 class="font-semibold text-sm text-white/70 uppercase tracking-wider mb-5">Platform Controls</h2>
		
		<div class="space-y-4">
			<label class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
				<div>
					<div class="font-medium text-white text-sm mb-0.5">Allow New Signups</div>
					<div class="text-xs text-white/40">Enable or disable new user registrations.</div>
				</div>
				<input type="checkbox" bind:checked={settings.allowNewSignups} class="w-5 h-5 accent-violet-DEFAULT" />
			</label>

			<label class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
				<div>
					<div class="font-medium text-white text-sm mb-0.5">Maintenance Mode</div>
					<div class="text-xs text-white/40">Display maintenance page to non-admins.</div>
				</div>
				<input type="checkbox" bind:checked={settings.maintenanceMode} class="w-5 h-5 accent-rose-500" />
			</label>
			
			<label class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
				<div>
					<div class="font-medium text-white text-sm mb-0.5">JAMB Special Registration</div>
					<div class="text-xs text-white/40">Show JAMB specific alerts on landing page.</div>
				</div>
				<input type="checkbox" bind:checked={settings.jambRegistrationActive} class="w-5 h-5 accent-violet-DEFAULT" />
			</label>
		</div>
	</div>

	<div class="glass-card p-6 mb-6">
		<h2 class="font-semibold text-sm text-white/70 uppercase tracking-wider mb-5">AI Orchestration Config</h2>
		
		<div class="space-y-4 mb-5">
			<label class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
				<div>
					<div class="font-medium text-white text-sm mb-0.5">Enable AI Generation API</div>
					<div class="text-xs text-white/40">Master switch for Anthropic Claude integration.</div>
				</div>
				<input type="checkbox" bind:checked={settings.aiGenerationEnabled} class="w-5 h-5 accent-violet-DEFAULT" />
			</label>
			
			<label class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
				<div>
					<div class="font-medium text-white text-sm mb-0.5">Mock / Demo Mode API</div>
					<div class="text-xs text-white/40">Bypass actual API calls and return static mock data.</div>
				</div>
				<input type="checkbox" bind:checked={settings.demoModeActive} class="w-5 h-5 accent-amber-500" />
			</label>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="free-limit" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
					Free Plan Topic Limit
				</label>
				<input id="free-limit" type="number" bind:value={settings.freePlanMaxQuestions} class="form-input text-sm" />
			</div>
			<div>
				<label for="pro-limit" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
					Pro Plan Topic Limit
				</label>
				<input id="pro-limit" type="number" bind:value={settings.proPlanMaxQuestions} class="form-input text-sm" />
			</div>
		</div>
	</div>

	<div class="flex justify-end gap-3">
		<button class="btn-ghost px-5 py-2.5 text-sm" on:click={() => location.reload()}>Cancel</button>
		<button class="btn-violet px-6 py-2.5 text-sm font-bold" on:click={saveSettings} disabled={saving}>
			{#if saving}<span class="spinner w-4 h-4"></span>{:else}Save Settings{/if}
		</button>
	</div>
</div>
