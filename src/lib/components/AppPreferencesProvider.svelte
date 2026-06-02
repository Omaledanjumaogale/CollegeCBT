<script lang="ts">
	// AppPreferencesProvider: Manages user UI preferences (theme, accessibility)
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const labs_mode = writable<'compact' | 'expanded'>('expanded');
	const high_contrast = writable(false);

	setContext('preferences', { labs_mode, high_contrast });

	let { children }: { children?: import('svelte').Snippet } = $props();

	onMount(() => {
		try {
			const saved = localStorage.getItem('collegecbt_prefs');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.labs_mode) labs_mode.set(parsed.labs_mode);
				if (typeof parsed.high_contrast === 'boolean') high_contrast.set(parsed.high_contrast);
			}
		} catch {
			// localStorage unavailable — no-op
		}
	});

	$effect(() => {
		try {
			localStorage.setItem('collegecbt_prefs', JSON.stringify({
				labs_mode: $labs_mode,
				high_contrast: $high_contrast
			}));
		} catch {
			// localStorage unavailable — no-op
		}
	});
</script>

{@render children?.()}
