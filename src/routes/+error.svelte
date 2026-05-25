<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status} | CollegeCBT</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="page-container min-h-[70vh] flex items-center justify-center py-20">
	<section class="glass-card w-full max-w-2xl p-8 sm:p-10 text-center" aria-labelledby="error-title">
		<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-3xl">
			⚠️
		</div>
		<p class="mb-3 text-xs font-black uppercase tracking-[0.28em] text-rose-400">Something went wrong</p>
		<h1 id="error-title" class="font-display text-3xl sm:text-4xl text-white mb-4">
			Error {$page.status}
		</h1>
		<p class="text-sm sm:text-base text-white/55 leading-relaxed mb-8">
			{$page.error?.message ?? 'We could not complete this request. You can return home or continue practicing from the exam lab.'}
		</p>
		<div class="flex flex-col sm:flex-row items-center justify-center gap-3">
			<a href="/" class="btn-violet min-h-[44px] w-full sm:w-auto">Go Home</a>
			<a href="/exam-lab" class="btn-ghost min-h-[44px] w-full sm:w-auto">Open Exam Lab</a>
		</div>
	</section>
</main>
