<script lang="ts">
	import { NIGERIAN_CURRICULUM, COURSES, LEVELS, type InstitutionType } from '$lib/data/courseData';
	import { fade, slide } from 'svelte/transition';
	import Tooltip from './Tooltip.svelte';
	import SelectedCourseBar from './SelectedCourseBar.svelte';

	let activeType = $state<InstitutionType | 'JAMB'>('University');
	
	// Ensure we don't try to access undefined keys in LEVELS
	let availableLevels = $derived(activeType === 'JAMB' ? [] : (LEVELS[activeType as InstitutionType] || []));

	let selectedLevel = $state('');
	
	// We'll show a sample of courses or structured departments
	const courseSamples: Record<string, string[]> = {
		'University': Object.keys(NIGERIAN_CURRICULUM).flatMap(f => Object.keys(NIGERIAN_CURRICULUM[f])),
		'Polytechnic': ['Computer Science (ND)', 'Business Admin (HND)', 'Civil Engineering', 'Science Laboratory Tech'],
		'College of Education': ['Early Childhood Education', 'English/Social Studies', 'Primary Education Studies'],
		'IEI / Technical': ['ICT & Computer Networking (NID)', 'Carpentry & Joinery'],
		'JAMB': ['Use of English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government']
	};

	let searchQuery = $state('');
	let selectedCourse = $state('');

	let displayedCourses = $derived((courseSamples[activeType] || [])
		.filter((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())));

	function selectCourse(course: string) {
		selectedCourse = course;
		if (activeType === 'JAMB') {
			selectedLevel = '';
			return;
		}
		
		if (!selectedLevel) {
			// Select first level if none selected to make it easy
			selectedLevel = availableLevels[0] || '100 Level';
		}
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
	<div class="flex overflow-x-auto hide-scrollbar border-b p-2 gap-2" style="border-color:var(--glass-border);">
		{#each types as t}
			<div class="flex items-center gap-1">
				<button
					class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
					style="
						background:{activeType === t.id ? 'rgba(22,163,74,0.12)' : 'transparent'};
						color:{activeType === t.id ? 'var(--violet)' : 'var(--text-muted)'};
						border:1px solid {activeType === t.id ? 'rgba(22,163,74,0.25)' : 'transparent'};
					"
					onclick={() => {
						activeType = t.id;
						selectedLevel = '';
						selectedCourse = '';
					}}
				>
					<span class="text-lg">{t.icon}</span>
					{t.label}
				</button>
				{#if t.id === 'JAMB'}
					<Tooltip text="Subject-specific questions following the official JAMB syllabus for university and polytechnic entrance." />
				{:else if t.id === 'University'}
					<Tooltip text="Curriculum-based practice for federally and state-accredited Nigerian universities." />
				{/if}
			</div>
		{/each}
	</div>

	<!-- Content Area -->
	<div class="p-5 md:p-6" in:fade={{duration: 200}}>
		<div class="flex flex-col md:flex-row gap-4 mb-6">
			<!-- Search -->
			<div class="relative flex-1">
				<span class="absolute left-3 top-1/2 -translate-y-1/2" style="color:var(--text-muted);">🔍</span>
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
						class="text-left p-4 rounded-xl border transition-all group relative overflow-hidden"
						style="{selectedCourse === course ? 'border-color:var(--violet);background:rgba(22,163,74,0.08);' : 'border-color:var(--glass-border);background:var(--glass);'}"
						onclick={() => selectCourse(course)}
					>
						<div class="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
							<span style="color:var(--violet);">→</span>
						</div>
						<div class="font-medium mb-1 pr-4" style="color:var(--text);">{course}</div>
						<div class="text-[11px] uppercase tracking-wider" style="color:var(--text-muted);">
							{activeType} {activeType !== 'JAMB' ? `· ${selectedLevel || 'All Levels'}` : ''}
						</div>
					</button>
				{/each}
			</div>
			{#if selectedCourse}
				<SelectedCourseBar course={selectedCourse} level={selectedLevel} institutionType={activeType} />
			{/if}
		{:else}
			<div class="text-center py-10 border border-dashed rounded-2xl" style="border-color:var(--glass-border);">
				<div class="text-3xl mb-2 opacity-50">📂</div>
				<p class="text-sm" style="color:var(--text-muted);">No courses found matching "{searchQuery}"</p>
			</div>
		{/if}
		
		<div class="mt-6 flex justify-between items-center p-4 rounded-xl" style="background:rgba(22,163,74,0.07);border:1px solid rgba(22,163,74,0.2);">
			<div>
				<div class="flex items-center gap-2 mb-1">
					<h4 class="font-bold text-sm" style="color:var(--text);">Custom Exam Need?</h4>
					<Tooltip text="Use our advanced AI generator to create questions for any specific module or topic not listed here." />
				</div>
				<p class="text-xs" style="color:var(--text-muted);">Can't find your specific topic or course? Use our AI generator.</p>
			</div>
			<a href="/dashboard/custom-exam" class="btn-violet px-4 py-2 text-xs whitespace-nowrap">Build Custom →</a>
		</div>
	</div>
</div>
