<script lang="ts">
	let {
		questions = 0,
		correct = 0,
		wrong = 0,
		score = 0,
		streak = 0
	}: {
		questions?: number;
		correct?: number;
		wrong?: number;
		score?: number;
		streak?: number;
	} = $props();

	const items = $derived([
		{ label: 'Questions', value: questions, icon: '🧠', color: 'text-violet-300' },
		{ label: 'Correct', value: correct, icon: '✅', color: 'text-lime-400' },
		{ label: 'Wrong', value: wrong, icon: '❌', color: 'text-rose-400' },
		{ label: 'Score', value: `${score} pts`, icon: '🏆', color: 'text-amber-400' },
		{ label: 'Streak', value: streak, icon: '🔥', color: 'text-lime-300' }
	]);
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Current exam session score">
	{#each items as item}
		<div class="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
			<div class="mb-1 text-lg" aria-hidden="true">{item.icon}</div>
			<div class={`text-base font-black tabular-nums ${item.color}`}>{item.value}</div>
			<div class="text-[10px] font-bold uppercase tracking-widest text-white/35">{item.label}</div>
		</div>
	{/each}
</div>
