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
		onUpdate: (data: {
			institutionType: string;
			faculty: string;
			department: string;
			level: string;
			course: string;
			topic: string;
		}) => void;
	}

	const fallbackFaculties = [
		'Science',
		'Engineering',
		'Management Sciences',
		'Social Sciences',
		'Arts and Humanities',
		'Education',
		'Health Sciences',
		'Law',
		'Agriculture',
		'Environmental Studies',
		'Vocational and Technical Education'
	];

	const fallbackDepartmentsByFaculty: Record<string, string[]> = {
		Science: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Microbiology', 'Statistics'],
		Engineering: ['Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'],
		'Management Sciences': ['Accounting', 'Business Administration', 'Banking and Finance', 'Marketing', 'Public Administration'],
		'Social Sciences': ['Economics', 'Political Science', 'Sociology', 'Psychology', 'Mass Communication'],
		'Arts and Humanities': ['English', 'History and International Studies', 'Linguistics', 'Philosophy', 'Religious Studies'],
		Education: ['Educational Management', 'Guidance and Counselling', 'Science Education', 'Business Education', 'Early Childhood Education'],
		'Health Sciences': ['Nursing Science', 'Medical Laboratory Science', 'Pharmacy', 'Public Health', 'Anatomy', 'Physiology'],
		Law: ['Law'],
		Agriculture: ['Agricultural Economics', 'Animal Science', 'Crop Science', 'Soil Science', 'Fisheries'],
		'Environmental Studies': ['Architecture', 'Estate Management', 'Quantity Surveying', 'Urban and Regional Planning'],
		'Vocational and Technical Education': ['Technical Education', 'Home Economics', 'Agricultural Education', 'Fine and Applied Arts']
	};

	const fallbackCoursesByDepartment: Record<string, string[]> = {
		'Computer Science': ['Introduction to Programming', 'Data Structures and Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
		Mathematics: ['Calculus', 'Linear Algebra', 'Real Analysis', 'Abstract Algebra', 'Numerical Analysis'],
		Physics: ['Mechanics', 'Electricity and Magnetism', 'Thermodynamics', 'Modern Physics'],
		Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry'],
		Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution'],
		Accounting: ['Financial Accounting', 'Cost Accounting', 'Auditing', 'Taxation', 'Management Accounting'],
		'Business Administration': ['Principles of Management', 'Business Law', 'Entrepreneurship', 'Operations Management'],
		Economics: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics'],
		'Political Science': ['Introduction to Political Science', 'Nigerian Government and Politics', 'International Relations'],
		English: ['Use of English', 'Literary Studies', 'Phonetics and Phonology', 'Advanced Composition'],
		'Electrical Engineering': ['Circuit Theory', 'Electronics', 'Power Systems', 'Control Systems'],
		'Mechanical Engineering': ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Machine Design'],
		'Nursing Science': ['Anatomy and Physiology', 'Medical-Surgical Nursing', 'Community Health Nursing', 'Pharmacology'],
		Law: ['Constitutional Law', 'Criminal Law', 'Law of Contract', 'Tort Law', 'Nigerian Legal System']
	};

	const fallbackTopicsByCourse: Record<string, string[]> = {
		'Introduction to Programming': ['Variables and Data Types', 'Control Flow', 'Functions', 'Arrays', 'Object-Oriented Programming'],
		'Data Structures and Algorithms': ['Arrays and Linked Lists', 'Stacks and Queues', 'Trees', 'Graphs', 'Sorting and Searching'],
		'Database Systems': ['ER Modelling', 'SQL Queries', 'Normalization', 'Transactions', 'Indexing'],
		'Computer Networks': ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'Wireless Networks'],
		'Financial Accounting': ['Double Entry', 'Trial Balance', 'Final Accounts', 'Bank Reconciliation', 'Depreciation'],
		Microeconomics: ['Demand and Supply', 'Elasticity', 'Consumer Theory', 'Market Structures'],
		Macroeconomics: ['National Income', 'Inflation', 'Monetary Policy', 'Fiscal Policy'],
		'Use of English': ['Comprehension', 'Summary Writing', 'Lexis and Structure', 'Essay Writing'],
		'Constitutional Law': ['Supremacy of the Constitution', 'Separation of Powers', 'Fundamental Rights', 'Federalism']
	};

	let { 
		institutionType = $bindable(''), 
		faculty = $bindable(''), 
		department = $bindable(''), 
		level = $bindable(''), 
		course = $bindable(''), 
		topic = $bindable(''),
		onUpdate 
	}: Props = $props();

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

	function mergeOptions(primary: string[] | undefined, fallback: string[]) {
		return Array.from(new Set([...(primary || []), ...fallback])).filter(Boolean);
	}

	function canonicalFaculty(value: string) {
		return value.replace(/^Faculty of\s+/i, '').replace(/^School of\s+/i, '').trim();
	}

	let facultyOptions = $derived(mergeOptions(faculties.data, fallbackFaculties));
	let departmentOptions = $derived(
		mergeOptions(
			departments.data,
			fallbackDepartmentsByFaculty[faculty] ||
				fallbackDepartmentsByFaculty[canonicalFaculty(faculty)] ||
				Object.values(fallbackDepartmentsByFaculty).flat()
		)
	);
	let courseOptions = $derived(
		mergeOptions(
			courses.data?.map((item) => item.course),
			fallbackCoursesByDepartment[department] || ['General Studies', 'Use of English', 'Computer Appreciation', 'Mathematics', 'Entrepreneurship']
		)
	);
	let topicOptions = $derived.by(() => {
		const selectedCourse = courses.data?.find((item) => item.course === course);
		return mergeOptions(
			selectedCourse?.topics,
			fallbackTopicsByCourse[course] || ['General Concepts', 'Definitions and Scope', 'Applications', 'Exam Traps', 'Past Question Patterns']
		);
	});

	$effect(() => {
		if (!faculty && department) {
			const match = Object.entries(fallbackDepartmentsByFaculty).find(([, departments]) =>
				departments.includes(department)
			);
			if (match) faculty = match[0];
		}
		if (!department && course) {
			const match = Object.entries(fallbackCoursesByDepartment).find(([, courses]) =>
				courses.includes(course)
			);
			if (match) department = match[0];
		}
	});

	// ── Other / Custom Inputs ──────────────────────────────────────────────────
	let otherFaculty = $state('');
	let otherDept = $state('');
	let otherCourse = $state('');
	let otherTopic = $state('');

	$effect(() => {
		const hasCustomInput =
			faculty === 'Other' ||
			department === 'Other' ||
			course === 'Other' ||
			topic === 'Other';

		if (!hasCustomInput) return;

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
				{:else}
					{#each ['University', 'Polytechnic', 'College of Education', 'Monotechnic/Specialized'] as t}
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
				{#each facultyOptions as f}
					<option value={f}>{f}</option>
				{/each}
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
				{#each departmentOptions as d}
					<option value={d}>{d}</option>
				{/each}
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
				{#each courseOptions as c}
					<option value={c}>{c}</option>
				{/each}
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
				{#each topicOptions as t}
					<option value={t}>{t}</option>
				{/each}
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
