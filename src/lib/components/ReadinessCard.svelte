<script lang="ts">
	type TopicProgress = {
		label: string;
		value: number;
		color?: 'lime' | 'amber' | 'rose' | 'violet';
	};

	let {
		score = 78,
		grade = 'B2',
		streak = 14,
		topics = [
			{ label: 'Data Structures', value: 88, color: 'lime' },
			{ label: 'Computer Networks', value: 64, color: 'amber' },
			{ label: 'Database Systems', value: 82, color: 'lime' }
		],
		insight = 'Focus on Computer Networks. Twelve targeted questions can push this topic above the 75% readiness target.'
	}: {
		score?: number;
		grade?: string;
		streak?: number;
		topics?: TopicProgress[];
		insight?: string;
	} = $props();

	const clampedScore = $derived(Math.max(0, Math.min(score, 100)));

	function fillClass(color: TopicProgress['color'] = 'lime') {
		if (color === 'amber') return 'progress-fill-amber';
		if (color === 'rose') return 'progress-fill-rose';
		return 'progress-fill-lime';
	}
</script>

<aside class="relative" aria-label="Exam readiness preview">
	<div class="glass-card p-5 sm:p-6" style="border-color:rgba(22,163,74,0.2);">
		<div class="flex items-start justify-between gap-4 mb-5">
			<div>
				<p class="text-xs mb-1" style="color:var(--text-muted);">Exam Score</p>
				<div class="font-display font-black text-4xl" style="color:var(--violet);">
					{clampedScore}<span class="text-lg" style="color:var(--text-muted);">/100</span>
				</div>
			</div>
			<div class="text-center">
				<div class="inline-flex min-w-16 items-center justify-center rounded-2xl px-4 py-2 text-xl font-black grade-b2">
					{grade}
				</div>
				<div class="mt-1 text-xs text-white/40">Predicted Grade</div>
			</div>
		</div>

		<div class="mb-5">
			<div class="mb-2 flex justify-between text-xs" style="color:var(--text-muted);">
				<span>Fail Zone</span>
				<span class="font-bold" style="color:var(--violet);">75% Pass Mark</span>
				<span>100</span>
			</div>
			<div class="progress-track h-3">
				<div class="progress-fill-lime h-full" style="width: {clampedScore}%"></div>
			</div>
		</div>

		<div class="space-y-3 mb-5">
			{#each topics as topic}
				<div>
					<div class="mb-1.5 flex justify-between gap-3 text-xs">
						<span class="truncate" style="color:var(--text-muted);">{topic.label}</span>
						<span class="font-bold" style="color:var(--text-muted);">{topic.value}%</span>
					</div>
					<div class="progress-track">
						<div class={fillClass(topic.color)} style="width: {Math.max(0, Math.min(topic.value, 100))}%"></div>
					</div>
				</div>
			{/each}
		</div>

		<div class="rounded-2xl p-4" style="border:1px solid rgba(22,163,74,0.2);background:rgba(22,163,74,0.06);">
			<div class="flex items-start gap-3">
				<span class="text-xl" aria-hidden="true">🤖</span>
				<div>
					<div class="mb-1 text-xs font-black uppercase tracking-widest" style="color:var(--violet);">Study Tip</div>
					<p class="text-xs leading-relaxed" style="color:var(--text-muted);">{insight}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="absolute -right-3 -top-4 hidden rounded-2xl px-4 py-2 shadow-xl backdrop-blur-xl sm:block" style="background:var(--bg-alt);border:1px solid rgba(234,88,12,0.25);">
		<div class="text-xs font-black" style="color:var(--text);">🔥 {streak} Day Streak</div>
		<div class="text-[10px]" style="color:var(--text-muted);">Keep it up!</div>
	</div>

	<div class="absolute -bottom-4 -left-3 hidden rounded-2xl px-4 py-2 shadow-xl backdrop-blur-xl sm:block" style="background:var(--bg-alt);border:1px solid rgba(245,158,11,0.2);">
		<div class="text-xs font-black" style="color:var(--text);">⏱️ Mock Ready</div>
		<div class="text-[10px]" style="color:var(--text-muted);">90s/question</div>
	</div>
</aside>
