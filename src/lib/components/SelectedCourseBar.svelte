<script lang="ts">
	import { goto } from '$app/navigation';

	let {
		course,
		level = '',
		institutionType = 'University'
	}: {
		course: string;
		level?: string;
		institutionType?: string;
	} = $props();

	function open(mode: 'lab' | 'mock') {
		const params = new URLSearchParams({
			course,
			mode,
			inst: institutionType
		});

		if (level) params.set('level', level);
		goto(`/exam-lab?${params.toString()}`);
	}
</script>

<div class="mt-6 rounded-2xl border border-lime-500/25 bg-lime-500/10 p-4 sm:p-5">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="min-w-0">
			<p class="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-lime-400">Selected course</p>
			<h3 class="truncate text-lg font-black text-white">{course}</h3>
			<p class="text-xs text-white/50">{institutionType}{level ? ` · ${level}` : ''}</p>
		</div>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<button type="button" class="btn-violet min-h-[44px] text-xs" onclick={() => open('lab')}>
				🤖 Open Exam Lab
			</button>
			<button type="button" class="btn-outline-lime min-h-[44px] text-xs" onclick={() => open('mock')}>
				⏱️ Start Mock Exam
			</button>
		</div>
	</div>
</div>
