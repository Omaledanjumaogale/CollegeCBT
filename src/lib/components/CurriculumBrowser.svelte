<script lang="ts">
	import { COURSES, LEVELS, type InstitutionType } from '$lib/data/courseData';
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { isPro, currentUser } from '$lib/stores';

	let activeType: InstitutionType | 'JAMB' = 'University';
	
	// Ensure we don't try to access undefined keys in LEVELS
	$: availableLevels = activeType === 'JAMB' ? [] : (LEVELS[activeType as InstitutionType] || []);

	let selectedLevel = '';
	
	// We'll show a sample of courses
	const courseSamples: Record<string, string[]> = {
		'University': ['Computer Science', 'Medicine & Surgery', 'Law', 'Accounting', 'Mechanical Engineering', 'Mass Communication'],
		'Polytechnic': ['Computer Science (ND)', 'Business Admin (HND)', 'Civil Engineering', 'Science Laboratory Tech'],
		'College of Education': ['Early Childhood Education', 'English/Social Studies', 'Primary Education Studies'],
		'IEI / Technical': ['ICT & Computer Networking (NID)', 'Carpentry & Joinery'],
		'JAMB': ['Use of English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government']
	};

	let searchQuery = '';

	$: displayedCourses = (courseSamples[activeType] || [])
		.filter((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()));

	function launchPractice(course: string) {
		if (activeType === 'JAMB') {
			goto(`/exam-lab?course=${encodeURIComponent(course)}&mode=mock&inst=JAMB`);
			return;
		}
		
		if (!selectedLevel) {
			// Select first level if none selected to make it easy
			selectedLevel = availableLevels[0] || '100 Level';
		}
		
		goto(`/exam-lab?course=${encodeURIComponent(course)}&level=${encodeURIComponent(selectedLevel)}&inst=${encodeURIComponent(activeType)}&mode=lab`);
	}

	const types: {id: InstitutionType | 'JAMB', label: string, icon: string}[] = [
		{ id: 'University', label: 'Universities', icon: '🎓' },
		{ id: 'Polytechnic', label: 'Polytechnics', icon: '🏛️' },
		{ id: 'College of Education', label: 'Colleges of Ed', icon: '🏫' },
		{ id: 'JAMB', label: 'JAMB UTME', icon: '📝' }
	];

</script>

<div class="glass-card overflow-hidden">
	<!-- Tab Bar -->
	<div class="flex overflow-x-auto hide-scrollbar border-b border-white/10 p-2 gap-2 bg-black/20">
		{#each types as t}
			<button
				class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
				style="
					background:{activeType === t.id ? 'rgba(124,58,237,0.2)' : 'transparent'};
					color:{activeType === t.id ? '#c4b5fd' : 'rgba(255,255,255,0.6)'};
					border:1px solid {activeType === t.id ? 'rgba(124,58,237,0.3)' : 'transparent'};
				"
				on:click={() => {
					activeType = t.id;
					selectedLevel = '';
				}}
			>
				<span class="text-lg">{t.icon}</span>
				{t.label}
			</button>
		{/each}
	</div>

	<!-- Content Area -->
	<div class="p-5 md:p-6" in:fade={{duration: 200}}>
		<div class="flex flex-col md:flex-row gap-4 mb-6">
			<!-- Search -->
			<div class="relative flex-1">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search {activeType} courses..."
					class="form-input pl-10 w-full"
				/>
			</div>

			<!-- Level Filter (Not for JAMB) -->
			{#if activeType !== 'JAMB'}
				<div class="w-full md:w-48" transition:slide={{axis: 'x'}}>
					<select bind:value={selectedLevel} class="form-select w-full">
						<option value="">Any Level</option>
						{#each availableLevels as lvl}
							<option value={lvl}>{lvl}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		<!-- Courses Grid -->
		{#if displayedCourses.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{#each displayedCourses as course}
					<button
						class="text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all group relative overflow-hidden"
						on:click={() => launchPractice(course)}
					>
						<div class="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
							<span class="text-violet-400">→</span>
						</div>
						<div class="font-medium text-white mb-1 pr-4">{course}</div>
						<div class="text-[11px] text-white/40 uppercase tracking-wider">
							{activeType} {activeType !== 'JAMB' ? `· ${selectedLevel || 'All Levels'}` : ''}
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div class="text-center py-10 border border-dashed border-white/10 rounded-2xl">
				<div class="text-3xl mb-2 opacity-50">📂</div>
				<p class="text-white/50 text-sm">No courses found matching "{searchQuery}"</p>
			</div>
		{/if}
		
		<div class="mt-6 flex justify-between items-center p-4 bg-violet-900/20 border border-violet-500/20 rounded-xl">
			<div>
				<h4 class="font-bold text-violet-100 text-sm mb-1">Custom Exam Need?</h4>
				<p class="text-xs text-violet-300/70">Can't find your specific topic or module? Use the AI orchestrator.</p>
			</div>
			<a href="/dashboard/custom-exam" class="btn-violet px-4 py-2 text-xs whitespace-nowrap">Build Custom →</a>
		</div>
	</div>
</div>
