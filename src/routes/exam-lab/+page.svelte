<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { labState, labConfig, showToast, currentLabQuestion, currentTheoryQuestion, labLoading } from '$lib/stores';
	import { generateMCQ, generateTheory, getDemoMCQ, getDemoTheory, getWaecGrade, getGradeClass, getAIRecommendation } from '$lib/services/ai';
	import { saveStudySession } from '$lib/services/convexClient';
	import { currentUser } from '$lib/stores';
	import { COURSES, INSTITUTION_TYPES, LEVELS, DIFFICULTIES, WAEC_GRADES, type InstitutionType } from '$lib/data/courseData';
	import type { Question, TheoryQuestion } from '$lib/stores';

	// ── TAB STATE ──
	let activeTab: 'lab' | 'mock' = 'lab';

	// ── LAB STATE (persisted per session) ──
	let labSession = {
		questionsCount: 0, correct: 0, wrong: 0, score: 0, streak: 0, answered: false
	};
	let labQuestion: Question | null = null;
	let labTheory: TheoryQuestion | null = null;
	let labShowScorebar = false;
	let labLoading_ = false;
	let theoryAnswerRevealed = false;
	let userTheoryAnswer = '';

	// ── LAB CONFIG ──
	let labInstType: InstitutionType | '' = '';
	let labCourse = '';
	let labLevel = '300 Level';
	let labQtype = 'MCQ';
	let labTopic = '';
	let labDiff = 'mixed';

	$: labCourses = labInstType ? (COURSES[labInstType] ?? []) : [];
	$: labLevels = labInstType ? (LEVELS[labInstType] ?? ['100 Level','200 Level','300 Level','400 Level']) : ['100 Level','200 Level','300 Level','400 Level'];
	
	// ── URL params pre-load ──
	onMount(() => {
		const p = $page.url.searchParams;
		const course = p.get('course');
		const inst = p.get('inst') as InstitutionType | null;
		const mode = p.get('mode');
		if (inst) labInstType = inst;
		if (course) { setTimeout(() => labCourse = course, 150); }
		if (mode === 'mock') activeTab = 'mock';
		if (course) showToast('📚 Course Pre-loaded', `${course} — configure and start!`);
	});

	async function genLabQuestion() {
		if (!labCourse || !labInstType) {
			showToast('⚠️ Missing Info', 'Select institution type and course first.', 'error');
			return;
		}
		labLoading_ = true;
		labQuestion = null;
		labTheory = null;
		labSession.answered = false;
		theoryAnswerRevealed = false;
		userTheoryAnswer = '';

		const opts = { 
			course: labCourse, 
			level: labLevel, 
			institutionType: labInstType, 
			topic: labTopic, 
			difficulty: labDiff,
			uid: $currentUser?.uid
		};

		try {
			if (labQtype === 'MCQ') {
				labQuestion = await generateMCQ(opts);
			} else {
				labLevel = labLevel || '300 Level';
				labTheory = await generateTheory(opts);
			}
			labSession.questionsCount++;
			labShowScorebar = true;
		} catch (err: any) {
			console.error('[ExamLab] Error:', err);
			if (err.status === 403) {
				showToast('💎 Pro Feature', err.message || 'Upgrade to Pro to access Theory questions.', 'info');
				activeTab = 'lab';
				labQtype = 'MCQ'; // falling back to MCQ
			} else if (err.status === 429) {
				showToast('⏱️ Limit Reached', err.message || 'You have reached your limit. Please wait.', 'error');
			} else {
				showToast('❌ Error', 'Could not generate question. Please check your connection.', 'error');
			}
		} finally {
			labLoading_ = false;
		}
	}

	let selectedOption: string | null = null;
	let answerResult: 'correct' | 'wrong' | null = null;

	async function answerLab(key: string) {
		if (labSession.answered || !labQuestion) return;
		labSession.answered = true;
		selectedOption = key;
		const correct = labQuestion.correct;
		const isCorrect = key === correct;
		if (isCorrect) {
			labSession.correct++;
			labSession.score += 2;
			labSession.streak++;
			answerResult = 'correct';
			showToast('✅ Correct! +2pts', 'Great work! See explanation below.', 'success');
		} else {
			labSession.wrong++;
			labSession.streak = 0;
			answerResult = 'wrong';
			showToast('❌ Wrong', `Correct answer: ${correct}. See explanation.`, 'error');
		}

		if ($currentUser?.uid) {
			await saveStudySession($currentUser.uid, {
				id: `lab-${Date.now()}`,
				course: labCourse,
				level: labLevel,
				institutionType: labInstType,
				questionsAnswered: 1,
				correct: isCorrect ? 1 : 0,
				wrong: isCorrect ? 0 : 1,
				score: isCorrect ? 2 : 0,
				mode: 'lab',
				timestamp: Date.now()
			});
		}
	}

	async function revealTheoryAnswer() {
		if (!labTheory) return;
		theoryAnswerRevealed = true;
		labSession.score += 5;
		labSession.questionsCount++;
		labShowScorebar = true;
		showToast('📖 Model Answer Revealed', '+5 pts for reviewing!', 'success');

		if ($currentUser?.uid) {
			await saveStudySession($currentUser.uid, {
				id: `lab-theory-${Date.now()}`,
				course: labCourse,
				level: labLevel,
				institutionType: labInstType,
				questionsAnswered: 1,
				correct: 1, // consider theory revealed as "correctly attempted" for stats
				wrong: 0,
				score: 5,
				mode: 'lab',
				timestamp: Date.now()
			});
		}
	}

	function clearLab() {
		labSession = { questionsCount: 0, correct: 0, wrong: 0, score: 0, streak: 0, answered: false };
		labQuestion = null;
		labTheory = null;
		labShowScorebar = false;
		selectedOption = null;
		answerResult = null;
	}

	// ── MOCK EXAM ──
	let mockInstType: InstitutionType | '' = '';
	let mockCourse = '';
	let mockLevel = '300 Level';
	let mockQcount = 10;
	let mockTimePerQ = 90;
	let mockDiff = 'mixed';
	$: mockCourses = mockInstType ? (COURSES[mockInstType] ?? []) : [];
	$: mockLevels = mockInstType ? (LEVELS[mockInstType] ?? ['100 Level','200 Level','300 Level','400 Level']) : ['100 Level','200 Level','300 Level','400 Level'];

	type MockScreen = 'config' | 'active' | 'results';
	let mockScreen: MockScreen = 'config';

	// Active mock data
	let mockCurrentQ = 0;
	let mockTotal = 10;
	let mockTimeLeft = 90;
	let mockTimer: ReturnType<typeof setInterval> | null = null;
	let mockQuestions: (Question | null)[] = [];
	let mockAnswers: ({ chosen: string | null; correct: string; ok: boolean; skipped: boolean } | null)[] = [];
	let mockLoading = false;
	let mockQloading = false;
	let mockCorrect = 0;
	let mockWrong = 0;
	let mockSkipped = 0;

	async function startMock() {
		if (!mockCourse || !mockInstType) {
			showToast('⚠️ Setup Required', 'Select institution type and course.', 'error');
			return;
		}
		mockTotal = mockQcount;
		mockCurrentQ = 0;
		mockCorrect = 0;
		mockWrong = 0;
		mockSkipped = 0;
		mockQuestions = new Array(mockTotal).fill(null);
		mockAnswers = new Array(mockTotal).fill(null);
		mockScreen = 'active';
		await loadMockQ(0);
	}

	async function loadMockQ(idx: number) {
		mockCurrentQ = idx;
		mockQloading = true;
		clearMockTimer();
		if (!mockQuestions[idx]) {
			try {
				mockQuestions[idx] = await generateMCQ({ 
					course: mockCourse, 
					level: mockLevel, 
					institutionType: mockInstType, 
					difficulty: mockDiff,
					uid: $currentUser?.uid
				});
			} catch (err: any) {
				console.error('[MockExam] Generation failed:', err);
				if (err.status === 429) {
					showToast('⏱️ Limit Reached', 'Slow down! You are generating too fast.', 'error');
				}
				mockQuestions[idx] = getDemoMCQ(mockCourse);
			}
		}
		mockQloading = false;
		startMockTimer(idx);
	}

	let mockSelectedOption: string | null = null;
	let mockAnsweredCurrent = false;

	function answerMock(key: string) {
		if (mockAnsweredCurrent || !mockQuestions[mockCurrentQ]) return;
		clearMockTimer();
		mockAnsweredCurrent = true;
		mockSelectedOption = key;
		const q = mockQuestions[mockCurrentQ]!;
		const ok = key === q.correct;
		mockAnswers[mockCurrentQ] = { chosen: key, correct: q.correct, ok, skipped: false };
		if (ok) mockCorrect++; else mockWrong++;
	}

	function skipMockQ() {
		clearMockTimer();
		if (!mockAnsweredCurrent && mockQuestions[mockCurrentQ]) {
			mockAnswers[mockCurrentQ] = { chosen: null, correct: mockQuestions[mockCurrentQ]!.correct, ok: false, skipped: true };
			mockSkipped++;
		}
		nextMockQ();
	}

	async function nextMockQ() {
		if (mockCurrentQ >= mockTotal - 1) { showMockResults(); return; }
		mockSelectedOption = null;
		mockAnsweredCurrent = false;
		await loadMockQ(mockCurrentQ + 1);
	}

	async function showMockResults() {
		clearMockTimer();
		mockScreen = 'results';
		
		// Wait for reactive variables to update to their final values before saving
		setTimeout(async () => {
			if ($currentUser?.uid) {
				await saveStudySession($currentUser.uid, {
					id: `mock-${Date.now()}`,
					course: mockCourse,
					level: mockLevel,
					institutionType: mockInstType,
					questionsAnswered: mockTotal - mockSkipped,
					correct: mockCorrect,
					wrong: mockWrong,
					score: mockPct,
					mode: 'mock',
					grade: mockGrade,
					timestamp: Date.now()
				});
			}
		}, 0);
	}

	function resetMock() {
		mockScreen = 'config';
		clearMockTimer();
		mockSelectedOption = null;
		mockAnsweredCurrent = false;
	}

	function startMockTimer(idx: number) {
		mockTimeLeft = mockTimePerQ;
		mockTimer = setInterval(() => {
			mockTimeLeft--;
			if (mockTimeLeft <= 0) {
				clearMockTimer();
				skipMockQ();
			}
		}, 1000);
	}

	function clearMockTimer() {
		if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
	}

	$: mockPct = mockTotal > 0 ? Math.round((mockCorrect / mockTotal) * 100) : 0;
	$: mockGrade = getWaecGrade(mockPct);
	$: mockGradeClass = getGradeClass(mockGrade);
	$: mockRecommendation = getAIRecommendation(mockPct);

	$: timerPct = (mockTimeLeft / mockTimePerQ) * 100;
	$: timerClass = mockTimeLeft <= 10 ? 'text-rose-400' : mockTimeLeft <= 20 ? 'text-amber-400' : 'text-lime-DEFAULT';
	$: timerCircleColor = mockTimeLeft <= 10 ? '#e11d48' : mockTimeLeft <= 20 ? '#f59e0b' : '#84cc16';
	$: timerDisplay = `${Math.floor(mockTimeLeft / 60)}:${(mockTimeLeft % 60).toString().padStart(2,'0')}`;
	$: timerDashOffset = 263.9 * (1 - mockTimeLeft / mockTimePerQ);
</script>

<svelte:head>
	<title>Exam Lab & Mock Exam — CollegeCBT | AI-Powered Practice Engine</title>
	<meta name="description" content="Generate unlimited MCQ and theory questions for any Nigerian university, polytechnic, or college course. Take timed mock exams with WAEC grading (A1–F9) and AI analysis." />
</svelte:head>

<div class="pt-[100px] pb-20">
	<div class="page-container">

		<!-- Page Header -->
		<div class="text-center mb-8">
			<div class="badge badge-violet mb-3 inline-flex">🤖 AI Practice Engine</div>
			<h1 class="font-display text-4xl sm:text-5xl mb-3">
				Practice Smart. <span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Score Higher.</span>
			</h1>
			<p class="text-white/50 max-w-xl mx-auto text-sm">Generate unlimited exam questions for any course in Nigerian higher institutions — with full explanations and timed mock exams.</p>
		</div>

		<!-- Main Tabs -->
		<div class="flex gap-2 p-1.5 rounded-2xl border border-white/10 bg-black/20 mb-8">
			<button
				on:click={() => activeTab = 'lab'}
				class="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
				class:tab-active={activeTab === 'lab'}
				class:tab-inactive={activeTab !== 'lab'}
			>
				🤖 AI Exam Lab
			</button>
			<button
				on:click={() => activeTab = 'mock'}
				class="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
				class:tab-active={activeTab === 'mock'}
				class:tab-inactive={activeTab !== 'mock'}
			>
				⏱️ Mock Exam
			</button>
		</div>

		<!-- ══ EXAM LAB TAB ══ -->
		{#if activeTab === 'lab'}
			<!-- Config Card -->
			<div class="glass-card p-5 mb-6">
				<div class="font-bold text-sm mb-4">⚙️ Set Up Your Practice Session</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
					<div>
						<label for="lab-inst-type" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Institution Type</label>
						<select id="lab-inst-type" bind:value={labInstType} class="form-select">
							<option value="">Select Type</option>
							{#each INSTITUTION_TYPES as t}<option value={t}>{t}</option>{/each}
						</select>
					</div>
					<div>
						<label for="lab-course" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Course / Subject</label>
						<select id="lab-course" bind:value={labCourse} class="form-select">
							<option value="">{labInstType ? 'Select a course' : 'Select institution first'}</option>
							{#each labCourses as c}<option value={c}>{c}</option>{/each}
						</select>
					</div>
					<div>
						<label for="lab-level" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Level</label>
						<select id="lab-level" bind:value={labLevel} class="form-select">
							{#each labLevels as l}<option value={l}>{l}</option>{/each}
						</select>
					</div>
					<div>
						<label for="lab-qtype" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Question Type</label>
						<select id="lab-qtype" bind:value={labQtype} class="form-select">
							<option value="MCQ">Multiple Choice (MCQ)</option>
							<option value="Theory">Theory / Essay</option>
						</select>
					</div>
					<div>
						<label for="lab-topic" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Specific Topic (Optional)</label>
						<input id="lab-topic" type="text" bind:value={labTopic} class="form-input" placeholder="e.g. Database Normalization..." />
					</div>
					<div>
						<label for="lab-diff" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Difficulty</label>
						<select id="lab-diff" bind:value={labDiff} class="form-select">
							{#each DIFFICULTIES as d}<option value={d.value}>{d.label}</option>{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col md:flex-row gap-3">
					<button on:click={genLabQuestion} disabled={labLoading_} class="btn-violet px-6 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm gap-2">
						{#if labLoading_}<span class="spinner w-4 h-4 border-2"></span> Generating...{:else}🤖 Generate Question{/if}
					</button>
					<button on:click={clearLab} class="btn-outline-lime px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">🔄 Reset Session</button>
				</div>
			</div>

			<!-- Score Bar -->
			{#if labShowScorebar}
				<div class="glass-card p-4 mb-6 flex flex-wrap gap-5 items-center">
					<div class="flex items-center gap-2"><span class="text-white/40 text-xs">Questions:</span><span class="font-mono font-bold text-violet-light">{labSession.questionsCount}</span></div>
					<div class="flex items-center gap-2"><span class="text-white/40 text-xs">Correct:</span><span class="font-mono font-bold text-lime-DEFAULT">{labSession.correct}</span></div>
					<div class="flex items-center gap-2"><span class="text-white/40 text-xs">Wrong:</span><span class="font-mono font-bold text-rose-DEFAULT">{labSession.wrong}</span></div>
					<div class="flex items-center gap-2"><span class="text-white/40 text-xs">Score:</span><span class="font-mono font-bold text-amber-DEFAULT">{labSession.score} pts</span></div>
					<div class="flex items-center gap-2"><span class="text-white/40 text-xs">Streak:</span><span class="font-mono font-bold text-amber-DEFAULT">🔥 {labSession.streak}</span></div>
				</div>
			{/if}

			<!-- Question Display Area -->
			<div class="min-h-[200px]">
				{#if labLoading_}
					<div class="glass-card p-12 flex flex-col items-center justify-center gap-4">
						<div class="spinner"></div>
						<p class="text-white/50 text-sm">Claude AI is generating a contextual question...</p>
					</div>
				{:else if labQuestion}
					<!-- MCQ Question Card -->
					<div class="glass-card overflow-hidden relative">
						<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>
						<!-- Header -->
						<div class="p-5 border-b border-white/8">
							<div class="flex flex-wrap gap-2 mb-3">
								<span class="badge badge-violet">🎓 {labCourse}</span>
								<span class="badge badge-lime">MCQ · {labLevel}</span>
								<span class="badge badge-amber font-mono">Q{labSession.questionsCount}</span>
								{#if labQuestion.topic}<span class="badge badge-violet">{labQuestion.topic}</span>{/if}
							</div>
							<p class="text-base text-white/90 font-medium leading-relaxed">{labQuestion.question}</p>
						</div>
						<!-- Options -->
						<div class="p-5">
							<div class="space-y-3 mb-5">
								{#each ['A','B','C','D'] as key}
									<button
										on:click={() => answerLab(key)}
										disabled={labSession.answered}
										class="mcq-option"
										class:correct={labSession.answered && key === labQuestion.correct}
										class:wrong={labSession.answered && selectedOption === key && key !== labQuestion.correct}
										class:dimmed={labSession.answered && key !== labQuestion.correct && key !== selectedOption}
									>
										<span class="w-7 h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">{key}</span>
										<span>{labQuestion.options[key as keyof typeof labQuestion.options]}</span>
									</button>
								{/each}
							</div>

							<!-- Explanation after answer -->
							{#if labSession.answered && labQuestion.explanations}
								<div class="rounded-xl p-4 mb-4 border" class:correct-box={answerResult === 'correct'} class:wrong-box={answerResult === 'wrong'}>
									<div class="font-bold text-sm mb-2">
										{answerResult === 'correct' ? '✅ Correct!' : `❌ Incorrect — Correct: ${labQuestion.correct}. ${labQuestion.options[labQuestion.correct]}`}
									</div>
									<p class="text-sm leading-relaxed opacity-90">{labQuestion.explanations.correct}</p>
									{#if labQuestion.examiner_note}
										<div class="mt-3 p-2.5 rounded-lg text-xs" style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);color:#a78bfa;">
											📌 <strong>Examiner Note:</strong> {labQuestion.examiner_note}
										</div>
									{/if}
								</div>
								<div class="flex flex-col md:flex-row gap-3">
									<button on:click={genLabQuestion} class="btn-violet px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">Next Question →</button>
								</div>
							{/if}
						</div>
					</div>
				{:else if labTheory}
					<!-- Theory Question Card -->
					<div class="glass-card overflow-hidden relative">
						<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>
						<div class="p-5 border-b border-white/8">
							<div class="flex flex-wrap gap-2 mb-3">
								<span class="badge badge-violet">🎓 {labCourse}</span>
								<span class="badge badge-lime">Theory · {labLevel}</span>
								{#if labTheory.topic}<span class="badge badge-amber">{labTheory.topic}</span>{/if}
							</div>
							<p class="text-base text-white/90 font-medium leading-relaxed">{labTheory.question}</p>
						</div>
						<div class="p-5">
							<p class="text-xs text-white/40 mb-3">Write your answer below, then reveal the model answer:</p>
							<textarea
								bind:value={userTheoryAnswer}
								class="form-input min-h-[120px] resize-y mb-4"
								placeholder="Type your answer here..."
							></textarea>
							<div class="flex flex-col md:flex-row gap-3 mb-4">
								<button on:click={revealTheoryAnswer} class="btn-outline-lime px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">📖 Show Model Answer</button>
								<button on:click={genLabQuestion} class="btn-violet px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">Next →</button>
							</div>
							{#if theoryAnswerRevealed}
								<div class="rounded-xl p-4 border" style="background:rgba(132,204,22,0.07);border-color:rgba(132,204,22,0.2);">
									<div class="font-bold text-sm mb-3">📚 Model Answer (+5 pts)</div>
									<p class="text-sm leading-relaxed text-white/80 mb-4">{labTheory.model_answer}</p>
									{#if labTheory.key_points?.length}
										<div class="mb-3">
											<p class="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">Key Points:</p>
											<div class="space-y-2">
												{#each labTheory.key_points as kp}
													<div class="flex gap-3 p-2.5 rounded-lg bg-black/20 border border-white/5 text-sm">
														<span class="font-mono font-bold text-lime-DEFAULT flex-shrink-0">[{kp.marks}m]</span>
														<span class="text-white/70">{kp.point}</span>
													</div>
												{/each}
											</div>
										</div>
									{/if}
									{#if labTheory.mark_scheme}
										<div class="p-2.5 rounded-lg text-xs mb-2" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);color:#a78bfa;">
											📊 <strong>Mark Scheme:</strong> {labTheory.mark_scheme}
										</div>
									{/if}
									{#if labTheory.examiner_notes}
										<div class="p-2.5 rounded-lg text-xs" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);color:#a78bfa;">
											📌 <strong>Examiner:</strong> {labTheory.examiner_notes}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<!-- Empty state -->
					<div class="glass-card p-12 text-center text-white/40">
						<div class="text-5xl mb-4">🤖</div>
						<div class="font-bold text-lg mb-2">Ready to practice?</div>
						<div class="text-sm">Configure your session above and click Generate Question.</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- ══ MOCK EXAM TAB ══ -->
		{#if activeTab === 'mock'}
			{#if mockScreen === 'config'}
				<!-- Setup Card -->
				<div class="glass-card p-5 mb-6">
					<div class="font-bold text-sm mb-4">⚙️ Set Up Your Mock Exam</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
						<div>
							<label for="mock-inst-type" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Institution Type</label>
							<select id="mock-inst-type" bind:value={mockInstType} class="form-select">
								<option value="">Select Type</option>
								{#each INSTITUTION_TYPES as t}<option value={t}>{t}</option>{/each}
							</select>
						</div>
						<div>
							<label for="mock-course" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Course / Subject</label>
							<select id="mock-course" bind:value={mockCourse} class="form-select">
								<option value="">{mockInstType ? 'Select a course' : 'Select institution first'}</option>
								{#each mockCourses as c}<option value={c}>{c}</option>{/each}
							</select>
						</div>
						<div>
							<label for="mock-level" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Level</label>
							<select id="mock-level" bind:value={mockLevel} class="form-select">
								{#each mockLevels as l}<option value={l}>{l}</option>{/each}
							</select>
						</div>
						<div>
							<label for="mock-qcount" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Number of Questions</label>
							<select id="mock-qcount" bind:value={mockQcount} class="form-select">
								<option value={5}>5 Questions (~7.5 min)</option>
								<option value={10}>10 Questions (~15 min)</option>
								<option value={20}>20 Questions (~30 min)</option>
								<option value={30}>30 Questions (~45 min)</option>
							</select>
						</div>
						<div>
							<label for="mock-time" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Time Per Question</label>
							<select id="mock-time" bind:value={mockTimePerQ} class="form-select">
								<option value={60}>60 seconds</option>
								<option value={90}>90 seconds (Standard)</option>
								<option value={120}>120 seconds</option>
							</select>
						</div>
						<div>
							<label for="mock-diff" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Difficulty</label>
							<select id="mock-diff" bind:value={mockDiff} class="form-select">
								{#each DIFFICULTIES as d}<option value={d.value}>{d.label}</option>{/each}
							</select>
						</div>
					</div>
					<button on:click={startMock} class="btn-violet px-6 min-h-[44px] flex justify-center items-center w-full text-sm">⏱️ Start Mock Exam</button>
				</div>

				<!-- WAEC Grade Reference -->
				<div class="glass-card p-5">
					<div class="font-bold text-sm mb-4">📊 WAEC Grading Reference (A1–F9)</div>
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
						{#each WAEC_GRADES as g}
							<div class="p-3 rounded-xl text-center" style="background:rgba({g.color.slice(1).match(/../g)?.map(h=>parseInt(h,16)).join(',')},0.12);border:1px solid rgba({g.color.slice(1).match(/../g)?.map(h=>parseInt(h,16)).join(',')},0.25);">
								<div class="font-title text-2xl" style="color:{g.color};">{g.grade}</div>
								<div class="text-[11px] text-white/40">≥{g.min}% {g.label}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if mockScreen === 'active'}
				<!-- Timer + Progress -->
				<div class="glass-card p-5 mb-5">
					<div class="grid grid-cols-[auto_1fr] gap-5 items-center">
						<!-- Timer Ring -->
						<div class="flex flex-col items-center gap-1">
							<div class="relative w-[90px] h-[90px]">
								<svg viewBox="0 0 100 100" width="90" height="90" class="-rotate-90">
									<circle cx="50" cy="50" r="42" class="fill-none stroke-white/8" stroke-width="6" />
									<circle cx="50" cy="50" r="42" class="fill-none transition-all duration-1000" style="stroke:{timerCircleColor};stroke-width:6;stroke-linecap:round;stroke-dasharray:263.9;stroke-dashoffset:{timerDashOffset};" />
								</svg>
								<div class="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg {timerClass}">{timerDisplay}</div>
							</div>
							<div class="text-[11px] text-white/40">Q {mockCurrentQ + 1} of {mockTotal}</div>
						</div>
						<!-- Progress strip -->
						<div>
							<div class="progress-track mb-3 h-2">
								<div class="progress-fill-lime" style="width:{((mockCurrentQ)/mockTotal)*100}%;"></div>
							</div>
							<div class="flex gap-1.5 flex-wrap">
								{#each Array(mockTotal) as _, i}
									<div class="w-8 h-8 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-all"
										style="
											background:{i === mockCurrentQ ? '#7c3aed' : mockAnswers[i]?.ok ? 'rgba(132,204,22,0.2)' : mockAnswers[i]?.skipped ? 'rgba(245,158,11,0.15)' : mockAnswers[i] ? 'rgba(225,29,72,0.2)' : 'transparent'};
											border-color:{i === mockCurrentQ ? '#7c3aed' : mockAnswers[i]?.ok ? '#84cc16' : mockAnswers[i]?.skipped ? '#f59e0b' : mockAnswers[i] ? '#e11d48' : 'rgba(255,255,255,0.1)'};
											color:{i === mockCurrentQ ? '#fff' : mockAnswers[i] ? 'inherit' : '#94a3b8'};
										"
									>{i + 1}</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Active Question -->
				{#if mockQloading}
					<div class="glass-card p-12 flex flex-col items-center gap-4">
						<div class="spinner"></div>
						<p class="text-white/50 text-sm">Generating question {mockCurrentQ + 1}...</p>
					</div>
				{:else if mockQuestions[mockCurrentQ]}
					{@const q = mockQuestions[mockCurrentQ]!}
					<div class="glass-card overflow-hidden relative mb-5">
						<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>
						<div class="p-5 border-b border-white/8">
							<div class="flex flex-wrap gap-2 mb-3">
								<span class="badge badge-violet">🎓 {mockCourse}</span>
								<span class="badge badge-lime">Q{mockCurrentQ + 1} of {mockTotal}</span>
							</div>
							<p class="text-base text-white/90 font-medium leading-relaxed">{q.question}</p>
						</div>
						<div class="p-5 space-y-3">
							{#each ['A','B','C','D'] as key}
								<button
									on:click={() => answerMock(key)}
									disabled={mockAnsweredCurrent}
									class="mcq-option"
									class:correct={mockAnsweredCurrent && key === q.correct}
									class:wrong={mockAnsweredCurrent && mockSelectedOption === key && key !== q.correct}
									class:dimmed={mockAnsweredCurrent && key !== q.correct && key !== mockSelectedOption}
								>
									<span class="w-7 h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">{key}</span>
									<span>{q.options[key as keyof typeof q.options]}</span>
								</button>
							{/each}

							{#if mockAnsweredCurrent}
								<div class="rounded-xl p-3 border mt-4 text-sm" class:correct-box={mockAnswers[mockCurrentQ]?.ok} class:wrong-box={!mockAnswers[mockCurrentQ]?.ok}>
									{mockAnswers[mockCurrentQ]?.ok ? '✅ Correct!' : `❌ Wrong — Correct: ${q.correct}. ${q.options[q.correct]}`}
									{#if q.explanations?.correct}<p class="text-xs mt-1 opacity-80">{q.explanations.correct}</p>{/if}
								</div>
							{/if}
						</div>
					</div>

					<div class="flex flex-col md:flex-row gap-3">
						{#if !mockAnsweredCurrent}
							<button on:click={skipMockQ} class="btn-ghost px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">Skip →</button>
						{:else}
							<button
								on:click={nextMockQ}
								class="btn-violet px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm"
							>
								{mockCurrentQ >= mockTotal - 1 ? '🏁 View Results' : 'Next Question →'}
							</button>
						{/if}
						<button on:click={showMockResults} class="btn-outline-lime px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">🏁 Finish Exam</button>
					</div>
				{/if}
			{/if}

			{#if mockScreen === 'results'}
				<!-- Results Screen -->
				<div>
					<!-- Grade Display -->
					<div class="glass-card p-8 text-center mb-6" style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(132,204,22,0.1));">
						<div class="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Your WAEC Grade</div>
						<div class="font-title text-8xl mb-2 {mockGradeClass} inline-block px-4 py-2 rounded-2xl">{mockGrade}</div>
						<div class="font-mono text-xl text-white/60 mb-2">{mockCorrect} / {mockTotal} — {mockPct}%</div>
						<div class="text-sm font-bold {mockPct >= 75 ? 'text-lime-DEFAULT' : 'text-rose-DEFAULT'}">
							{mockPct >= 75 ? '🎉 Target Achieved! (75%+)' : '⚠️ Below 75% Target — Keep Practising'}
						</div>
					</div>

					<!-- Stats Grid -->
					<div class="grid grid-cols-3 gap-4 mb-6">
						{#each [
							{ num: mockCorrect, label: 'Correct Answers', color: '#84cc16' },
							{ num: mockWrong, label: 'Wrong Answers', color: '#e11d48' },
							{ num: mockSkipped, label: 'Skipped', color: '#f59e0b' }
						] as s}
							<div class="glass-card p-4 text-center">
								<div class="font-title text-4xl" style="color:{s.color};">{s.num}</div>
								<div class="text-xs text-white/40 mt-1">{s.label}</div>
							</div>
						{/each}
					</div>

					<!-- AI Recommendation -->
					<div class="glass-card p-5 mb-6" style="background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.25);">
						<div class="font-bold text-sm mb-2 text-violet-light">🤖 AI Recommendation</div>
						<p class="text-sm text-white/70 leading-relaxed">{mockRecommendation}</p>
					</div>

					<!-- Question Review -->
					<div class="mb-6">
						<div class="font-bold text-sm mb-4">📋 Full Question Review</div>
						<div class="space-y-3">
							{#each mockQuestions as q, i}
								{#if q}
									{@const a = mockAnswers[i]}
									<div class="glass-card p-4">
										<div class="flex items-center gap-3 mb-2 flex-wrap">
											<span class="font-mono text-xs text-white/40">Q{i+1}</span>
											<span class="badge text-xs {a?.ok ? 'badge-lime' : a?.skipped ? 'badge-amber' : 'badge-rose'}">{a?.ok ? 'CORRECT' : a?.skipped ? 'SKIPPED' : 'WRONG'}</span>
										</div>
										<p class="text-sm text-white/80 mb-2">{q.question}</p>
										<p class="text-xs text-white/40">Correct: <strong class="text-lime-DEFAULT">{q.correct}. {q.options[q.correct]}</strong>
											{#if a?.chosen && !a.skipped && !a.ok}
												· Your answer: <span class="text-rose-DEFAULT">{a.chosen}. {q.options[a.chosen as keyof typeof q.options]}</span>
											{/if}
										</p>
									</div>
								{/if}
							{/each}
						</div>
					</div>

					<div class="flex flex-col md:flex-row gap-3">
						<button on:click={resetMock} class="btn-violet px-6 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">🔄 Take Another Mock</button>
						<button on:click={() => activeTab = 'lab'} class="btn-ghost px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">🤖 Practice in Exam Lab</button>
						<a href="/dashboard" class="btn-outline-lime px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">📊 View Dashboard</a>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.tab-active {
		background: #7c3aed;
		color: #fff;
		box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
	}
	.tab-inactive {
		color: #94a3b8;
	}
	.tab-inactive:hover {
		color: #fff;
		background: rgba(124, 58, 237, 0.12);
	}
	.correct-box {
		background: rgba(132, 204, 22, 0.08);
		border: 1px solid rgba(132, 204, 22, 0.25);
		color: #a3e635;
	}
	.wrong-box {
		background: rgba(225, 29, 72, 0.06);
		border: 1px solid rgba(225, 29, 72, 0.2);
		color: #fb7185;
	}
</style>
