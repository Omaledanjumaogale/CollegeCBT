<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { showToast } from '$lib/stores';

	let flags = $state([
		{ id: 'MAINTENANCE_MODE', label: 'Global Maintenance Mode', description: 'Redirect all non-admin traffic to maintenance page.', enabled: false, danger: true },
		{ id: 'AI_EXAM_GEN', label: 'AI Exam Generation', description: 'Enable real-time question generation via LLM gateway.', enabled: true, danger: false },
		{ id: 'REALTIME_PUSH', label: 'Push Notification Pipeline', description: 'Broadcast exam results via PushManager API.', enabled: true, danger: false },
		{ id: 'NIN_VALIDATION', label: 'Strict NIN Verification', description: 'Require 11-digit NIN for all new account signups.', enabled: true, danger: false },
		{ id: 'SM_ADS', label: 'Banner Ads Overlay', description: 'Show promotional placeholders in student dashboard.', enabled: false, danger: false }
	]);

	async function toggleFlag(id: string) {
		const flag = flags.find(f => f.id === id);
		if (!flag) return;
		
		if (flag.danger && !flag.enabled) {
			const confirm = window.confirm('CRITICAL ACTION: This will disrupt all student traffic. Proceed?');
			if (!confirm) return;
		}

		flag.enabled = !flag.enabled;
		showToast('✅ Configuration Updated', `Flag ${id} has been toggled to ${flag.enabled ? 'ON' : 'OFF'}.`, flag.danger ? 'warning' : 'success');
	}

	let appName = $state('CollegeCBT');
	let contactEmail = $state('support@collegecbt.dev');
</script>

<div class="space-y-10">
	
	<!-- ── Header ── -->
	<div>
		<h1 class="font-display text-3xl text-white mb-2">Configuration Engine</h1>
		<p class="text-white/40 text-sm italic">Master overrides for the CollegeCBT ecosystem runtime.</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
		
		<!-- ── Feature Flags ── -->
		<div class="space-y-6">
			<h3 class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Logic Overrides</h3>
			<div class="space-y-4">
				{#each flags as flag}
					<div class="glass-card p-6 flex items-center justify-between group hover:border-white/10 transition-all">
						<div class="space-y-1">
							<div class="flex items-center gap-3">
								<span class="text-sm font-bold {flag.danger ? 'text-rose-400' : 'text-white'}">{flag.label}</span>
								{#if flag.danger}
									<span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest border border-rose-500/20">Critical</span>
								{/if}
							</div>
							<p class="text-[10px] text-white/30 max-w-[280px] leading-relaxed">{flag.description}</p>
						</div>
						
						<button 
							onclick={() => toggleFlag(flag.id)}
							class="w-14 h-8 rounded-full border border-white/10 relative transition-all duration-300 shadow-inner overflow-hidden {flag.enabled ? 'bg-violet-600' : 'bg-black/40'}"
						>
							{#if flag.enabled}
								<div class="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-400 opacity-50"></div>
							{/if}
							<div 
								class="absolute top-1 w-6 h-6 rounded-full bg-white shadow-2xl transition-all duration-300 z-10"
								style="left: {flag.enabled ? 'calc(100% - 28px)' : '4px'};"
							></div>
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- ── System Environment ── -->
		<div class="space-y-6">
			<h3 class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Environment Variables</h3>
			<div class="glass-card p-8 bg-black/40 space-y-6 shadow-2xl relative overflow-hidden">
				<div class="absolute -top-20 -right-20 w-40 h-40 bg-violet-600/10 blur-[50px] rounded-full"></div>
				
				<div class="space-y-1.5">
					<label for="app-name" class="text-[9px] font-black text-white/20 uppercase tracking-widest">Instance Identifier</label>
					<input id="app-name" type="text" bind:value={appName} class="form-input bg-white/5 border-white/5 h-12 px-4 transition-all focus:border-violet-500/30" />
				</div>

				<div class="space-y-1.5">
					<label for="support-email" class="text-[9px] font-black text-white/20 uppercase tracking-widest">Support Node Endpoint</label>
					<input id="support-email" type="email" bind:value={contactEmail} class="form-input bg-white/5 border-white/5 h-12 px-4 transition-all focus:border-violet-500/30" />
				</div>

				<div class="space-y-1.5">
					<label for="api-key" class="text-[9px] font-black text-white/20 uppercase tracking-widest">Master API Key (Read-Only)</label>
					<div class="relative group">
						<input id="api-key" type="password" value="sk_test_••••••••••••••••" readonly class="form-input bg-white/5 border-white/5 h-12 px-10 text-white/20 cursor-not-allowed font-mono text-[10px]" />
						<div class="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">🔑</div>
						<div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button class="text-[10px] font-black text-violet-400 uppercase tracking-widest hover:text-white" onclick={() => showToast('Unauthorized', 'You must bypass manual gate to rotate keys.', 'error')}>Rotate</button>
						</div>
					</div>
				</div>

				<button class="w-full btn-violet h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs shadow-xl relative overflow-hidden group">
					<div class="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-white/10 to-violet-600/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
					Commit Configuration Changes
				</button>
			</div>

			<div class="p-6 rounded-3xl bg-lime-500/5 border border-lime-500/10 flex items-start gap-4">
				<span class="text-2xl mt-1">🧠</span>
				<div class="space-y-1">
					<div class="text-xs font-bold text-lime-500">Atomic Consistency</div>
					<p class="text-[10px] text-white/30 leading-relaxed italic">System changes are propagated via Convex reactive store across all Edge nodes within ~45ms of commitment.</p>
				</div>
			</div>
		</div>

	</div>

</div>
