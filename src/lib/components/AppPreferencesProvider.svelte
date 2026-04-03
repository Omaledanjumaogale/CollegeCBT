<script lang="ts">
	// AppPreferencesProvider: Manages user UI preferences (theme, accessibility, high-contrast)
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const labs_mode = writable<'compact' | 'expanded'>('expanded');
	const high_contrast = writable(false);
	
	setContext('preferences', { labs_mode, high_contrast });

	onMount(() => {
		const saved = localStorage.getItem('collegecbt_prefs');
		if (saved) {
			const parsed = JSON.parse(saved);
			labs_mode.set(parsed.labs_mode);
			high_contrast.set(parsed.high_contrast);
		}
	});

	$: if (typeof window !== 'undefined') {
		localStorage.setItem('collegecbt_prefs', JSON.stringify({ 
			labs_mode: $labs_mode, 
			high_contrast: $high_contrast 
		}));
	}
</script>

<slot />
