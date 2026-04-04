<script lang="ts">
	import Toast from './Toast.svelte';

	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<div class="toast-provider-wrapper relative">
	{#if children}
		{@render children()}
	{/if}
	
	<!-- Global High-Priority Notification Stack -->
	<Toast />
</div>

<style>
	.toast-provider-wrapper {
		display: contents;
	}
</style>
