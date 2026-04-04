<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { showToast } from '$lib/stores';

	let isOnline = $state(true);

	function updateStatus() {
		const next = navigator.onLine;
		if (next !== isOnline) {
			isOnline = next;
			if (isOnline) {
				showToast('🌐 System Online', 'Secure WebSocket connection re-established with Edge clusters.', 'success');
			} else {
				showToast('⚠️ Offline Mode', 'Persistent data localizing. Actions will sync on reconnect.', 'warning');
			}
		}
	}

	onMount(() => {
		isOnline = navigator.onLine;
		window.addEventListener('online', updateStatus);
		window.addEventListener('offline', updateStatus);
	});

	onDestroy(() => {
		window.removeEventListener('online', updateStatus);
		window.removeEventListener('offline', updateStatus);
	});
</script>

{#if !isOnline}
	<div class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl flex items-center gap-3 shadow-2xl animate-bounce">
		<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
		<span class="text-[10px] font-black text-rose-500 uppercase tracking-widest">Network Outage: Offline Recovery Active</span>
	</div>
{/if}
