<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import { slide, fade } from 'svelte/transition';

	interface Props {
		institutionType: string;
		faculty: string;
		department: string;
		level: string;
		course: string;
		topic: string;
		onUpdate: (data: any) => void;
	}

	let { 
		institutionType = $bindable(''), 
		faculty = $bindable(''), 
		department = $bindable(''), 
		level = $bindable(''), 
		course = $bindable(''), 
		topic = $bindable(''),
		onUpdate 
	} = $props<Props>();

	// ── Queries ───────────────────────────────────────────────────────────────
	const instTypes = useQuery(api.academic.getInstitutionTypes, () => ({}));
	
	const institutions = useQuery(api.academic.getInstitutionsByType, () => 
		institutionType ? { type: institutionType } : 'skip'
	);
	
	const faculties = useQuery(api.academic.getFaculties, () => 
		institutionType ? { institutionType } : 'skip'
	);
	
	const departments = useQuery(api.academic.getDepartments, () => 
		institutionType && faculty && faculty !== 'Other' 
			? { institutionType, faculty } 
			: 'skip'
	);
	
	const levels = useQuery(api.academic.getLevels, () => 
		institutionType && faculty && department && faculty !== 'Other' && department !== 'Other'
			? { institutionType, faculty, department } 
			: 'skip'
	);
	
	const courses = useQuery(api.academic.getCourses, () => 
		institutionType && faculty && department && level && faculty !== 'Other' && department !== 'Other' && level !== 'Other'
			? { institutionType, faculty, department, level } 
			: 'skip'
	);

	// ── Other / Custom Inputs ──────────────────────────────────────────────────
	let otherFaculty = $state('');
	let otherDept = $state('');
	let otherCourse = $state('');
	let otherTopic = $state('');

	$effect(() => {
		onUpdate({
			institutionType,
			faculty: faculty === 'Other' ? otherFaculty : faculty,
			department: department === 'Other' ? otherDept : department,
			level,
			course: course === 'Other' ? otherCourse : course,
			topic: topic === 'Other' ? otherTopic : topic
		});
	});

	function resetFrom(step: 'type' | 'faculty' | 'dept' | 'level' | 'course') {
		if (step === 'type') { faculty = ''; department = ''; level = ''; course = ''; topic = ''; }
		if (step === 'faculty') { department = ''; level = ''; course = ''; topic = ''; }
		if (step === 'dept') { level = ''; course = ''; topic = ''; }
		if (step === 'level') { course = ''; topic = ''; }
		if (step === 'course') { topic = ''; }
	}
</script>

<div class="space-y-6">
	<!-- 1. Institution Type -->
	<div class="space-y-2">
		<label for="acs-inst-type" class="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">1. Institution Type</label>
		<select id="acs-inst-type" bind:value={institutionType} onchange={() => resetFrom('type')} class="form-select">
			<option value="">Select Type</option>
			{#if instTypes.data}
				{#each instTypes.data as t}
					<option value={t}>{t}</option>
				{/each}
			{/if}
			<option value="Other">Other / Specialized</option>
		</select>
	</div>

	<!-- 2. Faculty -->
	{#if institutionType}
		<div class="space-y-2" transition:slide>
			<label for="acs-faculty" class="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">2. Faculty / School</label>
			<select id="acs-faculty" bind:value={faculty} onchange={() => resetFrom('faculty')} class="form-select">
				<option value="">Select Faculty</option>
				{#if faculties.data}
					{#each faculties.data as f}
						<option value={f}>{f}</option>
					{/each}
				{/if}
				<option value="Other">Other (Input Below)</option>
			</select>
			{#if faculty === 'Other'}
				<input 
					type="text" 
					bind:value={otherFaculty} 
					placeholder="Enter your Faculty name..." 
					class="form-input mt-2" 
					transition:fade
				/>
			{/if}
		</div>
	{/if}

	<!-- 3. Department -->
	{#if faculty && (faculty !== 'Other' || otherFaculty)}
		<div class="space-y-2" transition:slide>
			<label for="acs-dept" class="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">3. Department</label>
			<select id="acs-dept" bind:value={department} onchange={() => resetFrom('dept')} class="form-select">
				<option value="">Select Department</option>
				{#if departments.data}
					{#each departments.data as d}
						<option value={d}>{d}</option>
					{/each}
				{/if}
				<option value="Other">Other (Input Below)</option>
			</select>
			{#if department === 'Other'}
				<input 
					type="text" 
					bind:value={otherDept} 
					placeholder="Enter your Department name..." 
					class="form-input mt-2" 
					transition:fade
				/>
			{/if}
		</div>
	{/if}

	<!-- 4. Level -->
	{#if department && (department !== 'Other' || otherDept)}
		<div class="space-y-2" transition:slide>
			<label for="acs-level" class="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">4. Academic Level</label>
			<select id="acs-level" bind:value={level} onchange={() => resetFrom('level')} class="form-select">
				<option value="">Select Level</option>
				{#if levels.data && levels.data.length > 0}
					{#each levels.data as l}
						<option value={l}>{l}</option>
					{/each}
				{:else}
					<!-- Default Fallbacks for common Nigerian levels if DB is empty -->
					{#each ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level', 'ND 1', 'ND 2', 'HND 1', 'HND 2', 'NCE 1', 'NCE 2', 'NCE 3', 'Postgraduate'] as l}
						<option value={l}>{l}</option>
					{/each}
				{/if}
			</select>
		</div>
	{/if}

	<!-- 5. Course / Subject -->
	{#if level}
		<div class="space-y-2" transition:slide>
			<label for="acs-course" class="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">5. Subject / Course Module</label>
			<select id="acs-course" bind:value={course} onchange={() => resetFrom('course')} class="form-select">
				<option value="">Select Subject</option>
				{#if courses.data}
					{#each courses.data as c}
						<option value={c.course}>{c.course}</option>
					{/each}
				{/if}
				<option value="Other">Other / Specific Topic (Input Below)</option>
			</select>
			{#if course === 'Other'}
				<input 
					type="text" 
					bind:value={otherCourse} 
					placeholder="e.g. GST 111, Advanced Calculus, Cardiac Nursing..." 
					class="form-input mt-2" 
					transition:fade
				/>
			{/if}
		</div>
	{/if}

	<!-- 6. Topic (Optional but encouraged for precision) -->
	{#if course && (course !== 'Other' || otherCourse)}
		<div class="space-y-2" transition:slide>
			<label for="acs-topic" class="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">6. Specific Topic (Optional)</label>
			<select id="acs-topic" bind:value={topic} class="form-select">
				<option value="General">General / All Topics</option>
				{#if courses.data}
					{@const currentCourseObj = courses.data.find(c => c.course === course)}
					{#if currentCourseObj?.topics}
						{#each currentCourseObj.topics as t}
							<option value={t}>{t}</option>
						{/each}
					{/if}
				{/if}
				<option value="Other">Enter Specific Topic Below</option>
			</select>
			{#if topic === 'Other'}
				<input 
					type="text" 
					bind:value={otherTopic} 
					placeholder="e.g. Cell Division, Nigerian Civil War Causes, Thermodynamics 1st Law..." 
					class="form-input mt-2" 
					transition:fade
				/>
			{/if}
		</div>
	{/if}
</div>
