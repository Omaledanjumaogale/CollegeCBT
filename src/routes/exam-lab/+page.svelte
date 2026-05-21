<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { currentUser, isPro, showToast } from '$lib/stores';
	import AcademicSelector from '$lib/components/AcademicSelector.svelte';
	import { fade, slide } from 'svelte/transition';

	// ── TAB STATE ──
	let activeTab = $state<'lab' | 'mock'>('lab');

	// ── SHARED ACADEMIC DATA ──
	let academicData = $state({
		institutionType: 'University',
		faculty: '',
		department: '',
		level: '',
		course: '',
		topic: ''
	});

	// ── LAB STATE ──
	type MCQ = { question: string; options: Record<string,string>; answer: string; correct: string; explanation?: string; topic?: string; examiner_note?: string; explanations?: Record<string,string> };
	type Theory = { question: string; model_answer: string; key_points: {point:string;marks:number}[]; topic?: string; examiner_notes?: string };
	
	let labQuestion = $state<MCQ | null>(null);
	let labTheory = $state<Theory | null>(null);
	let labLoading = $state(false);
	let labQtype = $state<'MCQ' | 'Theory'>('MCQ');
	let labAnswered = $state(false);
	let selectedOption = $state<string | null>(null);
	let userTheoryAnswer = $state('');
	let theoryRevealed = $state(false);
	
	let labStats = $state({ total: 0, correct: 0, wrong: 0, score: 0, streak: 0 });

	async function generateLabQuestion() {
		if (!academicData.course) {
			showToast('⚠️ Course Required', 'Please select a course first.', 'error');
			return;
		}
		labLoading = true;
		labQuestion = null;
		labTheory = null;
		labAnswered = false;
		theoryRevealed = false;
		selectedOption = null;
		userTheoryAnswer = '';

		try {
			const res = await fetch('/api/generate-question', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					course: academicData.course,
					level: academicData.level,
					institutionType: academicData.institutionType,
					topic: academicData.topic || undefined,
					type: labQtype,
					uid: $currentUser?.uid
				}),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			if (labQtype === 'MCQ') labQuestion = data;
			else labTheory = data;
			
			labStats.total++;
		} catch (err: any) {
			showToast('❌ Generation Error', err.message, 'error');
		} finally {
			labLoading = false;
		}
	}

	function answerMCQ(key: string) {
		if (labAnswered || !labQuestion) return;
		labAnswered = true;
		selectedOption = key;
		const correctKey = labQuestion.correct || labQuestion.answer;
		const isCorrect = key === correctKey;
		if (isCorrect) {
			labStats.correct++;
			labStats.score += 2;
			labStats.streak++;
			showToast('✅ Correct!', '+2 points added', 'success');
		} else {
			labStats.wrong++;
			labStats.streak = 0;
			showToast('❌ Incorrect', `Correct answer: ${correctKey}`, 'error');
		}

		if ($currentUser?.uid) {
			import('$lib/services/convexClient').then(({ saveStudySession }) => {
				saveStudySession($currentUser.uid, {
					id: `practice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					course: academicData.course,
					level: academicData.level,
					institutionType: academicData.institutionType,
					questionsAnswered: 1,
					correct: isCorrect ? 1 : 0,
					wrong: isCorrect ? 0 : 1,
					score: isCorrect ? 100 : 0,
					mode: 'lab',
					grade: isCorrect ? 'A1' : 'F9',
					timestamp: Date.now()
				}).catch(err => console.error('[CollegeCBT] Practice session save failed:', err));
			});
		}
	}

	// ── MOCK STATE ──
	type MockPhase = 'config' | 'generating' | 'active' | 'results';
	let mockPhase = $state<MockPhase>('config');
	let mockQuestions = $state<MCQ[]>([]);
	let mockAnswers = $state<(string | null)[]>([]);
	let mockCurrentIdx = $state(0);
	let mockQCount = $state(10);
	let mockTimePerQ = $state(90);
	let mockResult = $state({ score: 0, correct: 0, wrong: 0, skipped: 0, pct: 0, grade: 'F' });
	let mockTimer = $state<ReturnType<typeof setInterval> | null>(null);
	let mockTimeLeft = $state(90);
	// Question nav flag states: 'correct' | 'wrong' | 'skipped' | null (unanswered)
	let mockQuestionStates = $state<(string | null)[]>([]);

	// WAEC grade table
	const WAEC_GRADES = [
		{ grade: 'A1', min: 75, max: 100, color: '#10b981', label: 'Excellent' },
		{ grade: 'B2', min: 70, max: 74, color: '#22d3ee', label: 'Very Good' },
		{ grade: 'B3', min: 65, max: 69, color: '#67e8f9', label: 'Good' },
		{ grade: 'C4', min: 60, max: 64, color: '#f59e0b', label: 'Credit' },
		{ grade: 'C5', min: 55, max: 59, color: '#fbbf24', label: 'Credit' },
		{ grade: 'C6', min: 50, max: 54, color: '#fcd34d', label: 'Credit' },
		{ grade: 'D7', min: 45, max: 49, color: '#f97316', label: 'Pass' },
		{ grade: 'E8', min: 40, max: 44, color: '#ef4444', label: 'Pass' },
		{ grade: 'F9', min: 0, max: 39, color: '#f43f5e', label: 'Fail' },
	];

	function getWAECGrade(pct: number) {
		for (const g of WAEC_GRADES) {
			if (pct >= g.min && pct <= g.max) return g;
		}
		return WAEC_GRADES[8];
	}

	function startMock() {
		if (!academicData.course) {
			showToast('⚠️ Course Required', 'Please select a course first.', 'error');
			return;
		}
		mockPhase = 'generating';
		mockQuestions = [];
		mockAnswers = [];
		mockCurrentIdx = 0;
		mockQuestionStates = [];

		// Generate questions in batches
		generateMockQuestions();
	}

	async function generateMockQuestions() {
		try {
			const batchSize = Math.min(mockQCount, 10);
			for (let i = 0; i < mockQCount; i += batchSize) {
				const promises = [];
				for (let j = 0; j < batchSize && (i + j) < mockQCount; j++) {
					promises.push(
						fetch('/api/generate-question', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								course: academicData.course,
								level: academicData.level,
								institutionType: academicData.institutionType,
								topic: academicData.topic || undefined,
								type: 'MCQ',
								uid: $currentUser?.uid
							}),
						}).then(r => r.json())
					);
				}
				const results = await Promise.all(promises);
				for (const data of results) {
					if (!data.error) {
						mockQuestions = [...mockQuestions, data];
						mockAnswers = [...mockAnswers, null];
						mockQuestionStates = [...mockQuestionStates, null];
					}
				}
			}
			if (mockQuestions.length === 0) {
				showToast('❌ Mock Error', 'No questions could be generated.', 'error');
				mockPhase = 'config';
				return;
			}
			mockPhase = 'active';
			startMockTimer();
		} catch (err: any) {
			showToast('❌ Mock Error', err.message, 'error');
			mockPhase = 'config';
		}
	}

	function startMockTimer() {
		mockTimeLeft = mockTimePerQ;
		if (mockTimer) clearInterval(mockTimer);
		mockTimer = setInterval(() => {
			mockTimeLeft--;
			if (mockTimeLeft <= 0) {
				// Auto-skip on timeout
				handleSkip();
			}
		}, 1000);
	}

	function resetMockTimer() {
		mockTimeLeft = mockTimePerQ;
	}

	function handleAnswer(key: string) {
		const q = mockQuestions[mockCurrentIdx];
		if (!q || mockAnswers[mockCurrentIdx] !== null) return;
		
		mockAnswers[mockCurrentIdx] = key;
		const correctKey = q.correct || q.answer;
		mockQuestionStates[mockCurrentIdx] = key === correctKey ? 'correct' : 'wrong';

		// Auto-advance to next question
		if (mockCurrentIdx < mockQuestions.length - 1) {
			mockCurrentIdx++;
			resetMockTimer();
		}
	}

	function handleSkip() {
		if (mockAnswers[mockCurrentIdx] === null) {
			mockQuestionStates[mockCurrentIdx] = 'skipped';
		}
		if (mockCurrentIdx < mockQuestions.length - 1) {
			mockCurrentIdx++;
			resetMockTimer();
		} else {
			finishMock();
		}
	}

	function jumpToQuestion(idx: number) {
		if (idx >= 0 && idx < mockQuestions.length) {
			mockCurrentIdx = idx;
			if (mockAnswers[idx] === null) resetMockTimer();
		}
	}

	function finishMock() {
		if (mockTimer) {
			clearInterval(mockTimer);
			mockTimer = null;
		}
		// Record any unanswered as skipped
		let correct = 0, wrong = 0, skipped = 0;
		mockQuestions.forEach((q, i) => {
			if (mockAnswers[i] === null) {
				skipped++;
				mockQuestionStates[i] = 'skipped';
			} else {
				const correctKey = q.correct || q.answer;
				if (mockAnswers[i] === correctKey) correct++;
				else wrong++;
			}
		});
		const total = mockQuestions.length;
		const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
		const grade = getWAECGrade(pct).grade;

		mockResult = { score: correct, correct, wrong, skipped, pct, grade };
		mockPhase = 'results';

		// Save session
		if ($currentUser?.uid) {
			import('$lib/services/convexClient').then(({ saveStudySession }) => {
				saveStudySession($currentUser.uid, {
					id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					course: academicData.course,
					level: academicData.level,
					institutionType: academicData.institutionType,
					questionsAnswered: total,
					correct,
					wrong,
					score: pct,
					mode: 'mock',
					grade,
					timestamp: Date.now()
				});
			}).catch(err => console.error('[CollegeCBT] Failed to save session:', err));
		}
	}

	function getTimerColor() {
		if (mockTimeLeft > 20) return '#84cc16';
		if (mockTimeLeft > 10) return '#f59e0b';
		return '#ef4444';
	}

	// ── Topic breakdown from mock questions ──
	let topicBreakdown = $derived.by(() => {
		const map = new Map<string, { correct: number; total: number }>();
		mockQuestions.forEach((q, i) => {
			const t = q.topic || 'General';
			if (!map.has(t)) map.set(t, { correct: 0, total: 0 });
			const entry = map.get(t)!;
			entry.total++;
			if (mockAnswers[i] !== null && (mockAnswers[i] === (q.correct || q.answer))) {
				entry.correct++;
			}
		});
		return Array.from(map.entries()).map(([topic, data]) => ({
			topic,
			pct: Math.round((data.correct / data.total) * 100) || 0,
			correct: data.correct,
			total: data.total
		})).sort((a, b) => a.pct - b.pct);
	});

	function getAIRec(pct: number) {
		if (pct >= 75) return 'Excellent work! You demonstrate strong mastery. Stay consistent with revision to maintain your A1 grade.';
		if (pct >= 60) return 'Good progress! Focus on topics where you lost marks — targeted practice can push you into the A1 range.';
		if (pct >= 45) return 'You are on the right track. We recommend reviewing foundational concepts and practising more questions in your weak areas.';
		return 'Keep going! Start with core topics and build up gradually. Consistent daily practice will improve your score significantly.';
	}

	onMount(() => {
		const p = $page.url.searchParams;
		const course = p.get('course');
		if (course) {
			academicData.course = course;
			showToast('📚 Course Pre-loaded', course);
		}
		const mode = p.get('mode');
		if (mode === 'mock') {
			activeTab = 'mock';
		}
	});

	onDestroy(() => {
		if (mockTimer) clearInterval(mockTimer);
	});
</script>

<svelte:head>
	<title>Exam Lab — CollegeCBT | AI-Generated Practice Questions</title>
	<meta name="description" content="Access unlimited multiple choice and essay/theory questions for Nigerian higher education courses. Custom practice sets dynamically generated by AI." />
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"name": "Exam Lab",
			"description": "Access unlimited multiple choice and essay/theory questions for Nigerian higher education courses. Custom practice sets dynamically generated by AI.",
			"url": "https://collegecbt.ewinproject.org/exam-lab"
		}
	</script>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12 lg:py-20">
	<!-- Dynamic Header -->
	<div class="text-center mb-12">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
			</span>
			AI Practice Mode
		</div>
		<h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic italic-shadow">
			{activeTab === 'lab' ? 'Exam' : 'Mock'} <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{activeTab === 'lab' ? 'Practice' : 'Exam'}</span>
		</h1>
		<div class="flex items-center justify-center gap-4 mt-8">
			<button 
				onclick={() => activeTab = 'lab'}
				class="px-8 py-3 rounded-2xl font-bold text-sm transition-all {activeTab === 'lab' ? 'bg-white text-secondary shadow-xl' : 'text-white/40 hover:text-white'}"
			>
				Practice Mode
			</button>
			<button 
				onclick={() => { activeTab = 'mock'; mockPhase = 'config'; }}
				class="px-8 py-3 rounded-2xl font-bold text-sm transition-all {activeTab === 'mock' ? 'bg-white text-secondary shadow-xl' : 'text-white/40 hover:text-white'}"
			>
				Mock Exam
			</button>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
		
		<!-- Sidebar Config -->
		<div class="lg:col-span-4">
			<div class="glass p-8 rounded-[32px] border-white/10 sticky top-24">
				<h2 class="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
					<div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
					Exam Setup
				</h2>

				<AcademicSelector
					bind:institutionType={academicData.institutionType}
					bind:faculty={academicData.faculty}
					bind:department={academicData.department}
					bind:level={academicData.level}
					bind:course={academicData.course}
					bind:topic={academicData.topic}
					onUpdate={(data) => { academicData = data; }}
				/>

				{#if activeTab === 'lab'}
					<div class="mt-8 pt-8 border-t border-white/5 space-y-6">
						<div>
							<div class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Question Format</div>
							<div class="grid grid-cols-2 gap-2">
								<button 
									onclick={() => labQtype = 'MCQ'}
									class="py-3 rounded-xl text-xs font-bold transition-all {labQtype === 'MCQ' ? 'bg-primary text-secondary' : 'bg-white/5 text-white/40 border border-white/5'}"
								>📝 Multiple Choice</button>
								<button 
									onclick={() => labQtype = 'Theory'}
									class="py-3 rounded-xl text-xs font-bold transition-all {labQtype === 'Theory' ? 'bg-primary text-secondary' : 'bg-white/5 text-white/40 border border-white/5'}"
								>✍️ Written / Essay</button>
							</div>
						</div>
						<button 
							onclick={generateLabQuestion}
							disabled={labLoading}
							class="w-full py-5 rounded-2xl bg-white text-secondary font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
						>
							{#if labLoading}
								<div class="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
								Preparing...
							{:else}
								<span>⚡ Generate Question</span>
							{/if}
						</button>
					</div>
				{:else}
					<div class="mt-8 pt-8 border-t border-white/5 space-y-6">
						<div>
							<label for="exam-size" class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Exam Size</label>
							<select id="exam-size" bind:value={mockQCount} class="form-select text-sm font-bold">
								<option value={5}>5 Questions</option>
								<option value={10}>10 Questions</option>
								<option value={20}>20 Questions</option>
								<option value={30}>30 Questions</option>
								<option value={50}>50 Questions (Full)</option>
							</select>
						</div>
						<div>
							<label for="time-per-q" class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Time Per Question</label>
							<select id="time-per-q" bind:value={mockTimePerQ} class="form-select text-sm font-bold">
								<option value={60}>60 seconds</option>
								<option value={90}>90 seconds</option>
								<option value={120}>120 seconds</option>
							</select>
						</div>
						<!-- WAEC Grading Reference -->
						<details class="group">
							<summary class="cursor-pointer text-[10px] font-bold text-white/30 uppercase tracking-widest py-2 flex items-center gap-2 hover:text-white/60 transition-colors">
								📊 WAEC Grading Guide
								<span class="ml-auto transition-transform group-open:rotate-180">▾</span>
							</summary>
							<div class="mt-3 space-y-1">
								{#each WAEC_GRADES as g}
									<div class="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs" style="background:rgba(255,255,255,0.03);">
										<div class="flex items-center gap-2">
											<span class="font-black font-mono" style="color:{g.color};">{g.grade}</span>
											<span class="text-white/40">{g.label}</span>
										</div>
										<span class="text-white/30 tabular-nums">{g.min}–{g.max === 100 ? '100' : g.max}%</span>
									</div>
								{/each}
							</div>
						</details>
						<button 
							onclick={startMock}
							class="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-secondary font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
						>
							🎯 Start Mock Exam
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Main Display -->
		<div class="lg:col-span-8">
			{#if activeTab === 'lab'}
				<!-- LAB VIEW -->
				<div class="space-y-6">
					{#if labStats.total > 0}
						<!-- Score Bar -->
						<div class="glass p-4 rounded-2xl border-white/10 flex items-center gap-4 text-xs flex-wrap justify-center sm:justify-between">
							<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
								<span class="text-white/40">📋</span>
								<span class="text-white/70 font-bold tabular-nums">{labStats.total}</span>
								<span class="text-white/30">Total</span>
							</div>
							<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
								<span class="text-lime-400">✅</span>
								<span class="text-lime-400 font-bold tabular-nums">{labStats.correct}</span>
								<span class="text-white/30">Correct</span>
							</div>
							<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
								<span class="text-rose-400">❌</span>
								<span class="text-rose-400 font-bold tabular-nums">{labStats.wrong}</span>
								<span class="text-white/30">Wrong</span>
							</div>
							<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
								<span class="text-amber-400">📈</span>
								<span class="text-amber-400 font-bold tabular-nums">{labStats.score}</span>
								<span class="text-white/30">Score</span>
							</div>
							<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl" style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);">
								<span>🔥</span>
								<span class="text-amber-400 font-bold tabular-nums">{labStats.streak}</span>
								<span class="text-white/30">Streak</span>
							</div>
						</div>
					{/if}

					{#if labQuestion}
						<div class="glass p-8 md:p-12 rounded-[40px] border-white/10 relative overflow-hidden" in:fade>
							<div class="flex justify-between items-center mb-10">
								<span class="text-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 rounded-full">📝 Multiple Choice Questions</span>
								<span class="text-white/30 text-[10px] font-bold uppercase tabular-nums">Question {labStats.total}</span>
							</div>
							<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{labQuestion.question}</h3>
							<div class="space-y-4">
								{#each Object.entries(labQuestion.options) as [key, val]}
									<button 
										onclick={() => answerMCQ(key)}
										disabled={labAnswered}
										class="w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group 
											{labAnswered && key === (labQuestion.correct || labQuestion.answer) ? 'bg-green-500/20 border-green-500/40 text-green-400' : 
											labAnswered && selectedOption === key ? 'bg-red-500/20 border-red-500/40 text-red-400' : 
											'bg-white/5 border-white/5 hover:border-white/10'}"
									>
										<div class="w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all
											{labAnswered && key === (labQuestion.correct || labQuestion.answer) ? 'bg-green-500 text-secondary' : 
											labAnswered && selectedOption === key ? 'bg-red-500 text-white' : 
											'bg-white/10 text-white/30 group-hover:bg-white/20'}">
											{key}
										</div>
										<span class="text-white/80 font-medium">{val}</span>
									</button>
								{/each}
							</div>

							{#if labAnswered}
								<div class="mt-10 space-y-6" in:slide>
									<div class="p-8 rounded-3xl bg-white/5 border border-white/10">
										<div class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">📖 Answer Explanation</div>
										<p class="text-sm text-white/60 leading-relaxed italic">{labQuestion.explanation}</p>
									</div>
									<!-- Distractor Analysis -->
									{#if labQuestion.explanations}
										<div class="p-6 rounded-3xl bg-white/5 border border-white/10">
											<div class="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4">🔍 Why Each Option Was Included</div>
											<div class="space-y-3">
												{#each Object.entries(labQuestion.explanations) as [optKey, optExp]}
													{@const isCorrect = optKey === (labQuestion.correct || labQuestion.answer)}
													{@const isSelected = selectedOption === optKey}
													<div class="p-3 rounded-xl text-xs leading-relaxed" 
														style="background:{isCorrect ? 'rgba(16,185,129,0.08)' : isSelected ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)'};
														border:1px solid {isCorrect ? 'rgba(16,185,129,0.2)' : isSelected ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'};">
														<span class="font-bold text-white/70">{optKey}.</span>
														<span class="text-white/50"> {optExp}</span>
														{#if isCorrect}
															<span class="text-lime-400 ml-1">✓ Correct</span>
														{/if}
													</div>
												{/each}
											</div>
										</div>
									{/if}
									{#if labQuestion.examiner_note}
										<div class="flex gap-4 items-start p-4 bg-primary/5 rounded-2xl border border-primary/10">
											<span class="text-xl">💡</span>
											<p class="text-xs text-primary/80 leading-relaxed"><strong>Expert Tip:</strong> {labQuestion.examiner_note}</p>
										</div>
									{/if}
									<button 
										onclick={generateLabQuestion}
										class="px-8 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
									>
										Next Question →
									</button>
								</div>
							{/if}
						</div>
					{:else if labTheory}
						<div class="glass p-8 md:p-12 rounded-[40px] border-white/10" in:fade>
							<div class="flex justify-between items-center mb-10">
								<span class="text-accent text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-accent/10 rounded-full">✍️ Written Answer Practice</span>
							</div>
							<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{labTheory.question}</h3>
							
							<textarea 
								bind:value={userTheoryAnswer}
								placeholder="Write your answer here for self-practice..."
								class="w-full h-48 p-6 rounded-3xl bg-white/5 border border-white/10 text-white/80 focus:border-accent transition-all resize-none font-serif italic mb-6"
							></textarea>

							{#if !theoryRevealed}
								<button 
									onclick={() => theoryRevealed = true}
									class="w-full py-4 rounded-2xl bg-accent text-secondary font-black uppercase tracking-widest"
								>🔍 Show Suggested Answer</button>
							{:else}
								<div class="space-y-6" in:slide>
									<div class="p-8 rounded-3xl bg-white/5 border border-white/10">
										<div class="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4">Suggested Answer</div>
										<p class="text-sm text-white/70 leading-relaxed font-serif italic mb-8">{labTheory.model_answer}</p>
										
										<div class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Marking Scheme</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
											{#each labTheory.key_points as kp}
												<div class="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
													<span class="text-xs text-white/60">{kp.point}</span>
													<span class="text-[10px] font-black text-accent">+{kp.marks} Marks</span>
												</div>
											{/each}
										</div>
									</div>
									<button 
										onclick={generateLabQuestion}
										class="w-full py-4 rounded-2xl bg-white/10 text-white font-bold"
									>Next Question →</button>
								</div>
							{/if}
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-32 text-center">
							<div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
								<svg class="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
							</div>
							<h3 class="text-xl font-bold text-white mb-2">Ready to Start</h3>
							<p class="text-white/30 text-sm max-w-xs mx-auto italic">Based on your school curriculum. Ready to generate practice questions.</p>
						</div>
					{/if}
				</div>
			{:else}
				<!-- MOCK VIEW -->
				<div class="space-y-6">
					{#if mockPhase === 'config'}
						<div class="glass p-12 rounded-[48px] border-white/10 text-center" in:fade>
							<div class="text-6xl mb-8">🎯</div>
							<h3 class="text-2xl font-black text-white uppercase tracking-tight mb-4">Mock Exam Details</h3>
							<p class="text-white/40 text-sm max-w-md mx-auto mb-10 leading-relaxed">
								Take a timed exam with <strong>{mockQCount}</strong> practice questions at <strong>{mockTimePerQ}s</strong> each.
								Get your WAEC grade, topic breakdown, and AI recommendations after you submit.
							</p>
							<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-sm mx-auto mb-10">
								<div class="p-4 rounded-2xl bg-white/5">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Questions</div>
									<div class="text-sm font-black text-white">{mockQCount}</div>
								</div>
								<div class="p-4 rounded-2xl bg-white/5">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Time/Q</div>
									<div class="text-sm font-black text-white">{mockTimePerQ}s</div>
								</div>
								<div class="p-4 rounded-2xl bg-white/5">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Total Time</div>
									<div class="text-sm font-black text-white">{Math.round(mockQCount * mockTimePerQ / 60)}m</div>
								</div>
							</div>
							<button 
								onclick={startMock}
								class="px-12 py-5 rounded-2xl bg-white text-secondary font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
							>🎯 Start Mock Exam</button>
						</div>
					{:else if mockPhase === 'generating'}
						<div class="flex flex-col items-center justify-center py-32 text-center" in:fade>
							<div class="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
							<h3 class="text-xl font-black text-white uppercase italic mb-2 tracking-tighter">Preparing Questions</h3>
							<p class="text-white/30 text-xs">Generating {mockQCount} practice questions for {academicData.course}...</p>
						</div>
					{:else if mockPhase === 'active'}
						{@const q = mockQuestions[mockCurrentIdx]}
						{@const answered = mockAnswers[mockCurrentIdx] !== null}
						
						<!-- Mock Progress & Timer Bar -->
						<div class="glass p-4 rounded-2xl border-white/10 mb-6">
							<div class="flex items-center justify-between mb-3">
								<!-- Score Bar -->
								<div class="flex items-center gap-3">
									<div class="flex items-center gap-1 text-xs text-white/50"><span class="text-lime-400">✅</span><span class="tabular-nums">{mockResult.correct}</span></div>
									<div class="flex items-center gap-1 text-xs text-white/50"><span class="text-rose-400">❌</span><span class="tabular-nums">{mockResult.wrong}</span></div>
									<div class="flex items-center gap-1 text-xs text-white/50"><span class="text-amber-400">⏭️</span><span class="tabular-nums">{mockResult.skipped}</span></div>
								</div>
								<!-- Timer Ring -->
								<div class="relative w-10 h-10 flex items-center justify-center">
									<svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
										<circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
										<circle cx="18" cy="18" r="15" fill="none" stroke={getTimerColor()} stroke-width="3" stroke-linecap="round"
											stroke-dasharray={2 * Math.PI * 15}
											stroke-dashoffset={2 * Math.PI * 15 * (1 - mockTimeLeft / mockTimePerQ)}
											class="transition-all duration-500"/>
									</svg>
									<span class="text-[10px] font-mono font-bold" style="color:{getTimerColor()};">{mockTimeLeft}</span>
								</div>
							</div>
							<!-- Progress Bar -->
							<div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
								<div class="h-full rounded-full transition-all duration-500" 
									style="width:{((mockCurrentIdx + 1) / mockQuestions.length) * 100}%;background:linear-gradient(90deg,#7c3aed,#a855f7);"></div>
							</div>
							<!-- Question Navigation Strip -->
							<div class="flex gap-1.5 flex-wrap justify-center">
								{#each mockQuestions as _, i}
									<button onclick={() => jumpToQuestion(i)}
										class="w-6 h-6 rounded text-[9px] font-bold transition-all flex items-center justify-center"
										style="background:{mockQuestionStates[i] === 'correct' ? 'rgba(16,185,129,0.25)' : 
											mockQuestionStates[i] === 'wrong' ? 'rgba(239,68,68,0.25)' : 
											mockQuestionStates[i] === 'skipped' ? 'rgba(245,158,11,0.25)' : 
											i === mockCurrentIdx ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)'};
										border:1px solid {i === mockCurrentIdx ? 'rgba(124,58,237,0.6)' : 'transparent'};
										color:{mockQuestionStates[i] ? 'white' : 'rgba(255,255,255,0.4)'};"
									>{i + 1}</button>
								{/each}
							</div>
						</div>

						<!-- Question Card -->
						{#if q}
							<div class="glass p-8 md:p-12 rounded-[40px] border-white/10" in:fade>
								<div class="flex justify-between items-center mb-8">
									<span class="text-white/30 text-[10px] font-black uppercase tracking-widest tabular-nums">Q {mockCurrentIdx + 1} OF {mockQuestions.length}</span>
									{#if q.topic}
										<span class="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/40">{q.topic}</span>
									{/if}
								</div>

								<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{q.question}</h3>
								<div class="space-y-4">
									{#each Object.entries(q.options) as [key, val]}
										<button 
											onclick={() => handleAnswer(key)}
											disabled={answered}
											class="w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group 
												{mockAnswers[mockCurrentIdx] === key ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:border-white/10'}"
										>
											<div class="w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all
												{mockAnswers[mockCurrentIdx] === key ? 'bg-primary text-secondary' : 'bg-white/10 text-white/30 group-hover:bg-white/20'}">
												{key}
											</div>
											<span class="text-white/80 font-medium">{val}</span>
										</button>
									{/each}
								</div>

								<div class="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
									<button 
										onclick={() => jumpToQuestion(mockCurrentIdx - 1)}
										disabled={mockCurrentIdx === 0}
										class="text-white/40 font-bold hover:text-white disabled:opacity-0 transition-all"
									>← Back</button>
									<div class="flex gap-3">
										<button 
											onclick={handleSkip}
											class="px-6 py-3 rounded-xl bg-white/5 text-white/60 font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all text-xs"
										>Skip →</button>
										{#if mockCurrentIdx === mockQuestions.length - 1}
											<button 
												onclick={finishMock}
												class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold transition-all hover:scale-105 text-xs"
											>🏁 Finish Exam</button>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					{:else if mockPhase === 'results'}
						{@const gradeInfo = getWAECGrade(mockResult.pct)}
						<div class="glass p-12 rounded-[50px] border-white/10 text-center relative overflow-hidden" in:fade>
							<div class="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Exam Result</div>
							<div class="text-9xl font-black italic italic-shadow leading-none mb-2" style="color:{gradeInfo.color};">{mockResult.grade}</div>
							<div class="text-3xl font-black mb-2 tabular-nums" style="color:{gradeInfo.color};">{mockResult.pct}%</div>
							<div class="text-xs text-white/40 mb-12">{mockResult.score} of {mockQuestions.length} correct · {gradeInfo.label}</div>
							
							<!-- Results Stats Grid -->
							<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md mx-auto mb-10">
								<div class="p-5 rounded-3xl bg-white/5 border border-white/10">
									<div class="text-xs mb-1">✅ Correct</div>
									<div class="text-xl font-black text-lime-400">{mockResult.correct}</div>
								</div>
								<div class="p-5 rounded-3xl bg-white/5 border border-white/10">
									<div class="text-xs mb-1">❌ Wrong</div>
									<div class="text-xl font-black text-rose-400">{mockResult.wrong}</div>
								</div>
								<div class="p-5 rounded-3xl bg-white/5 border border-white/10">
									<div class="text-xs mb-1">⏭️ Skipped</div>
									<div class="text-xl font-black text-amber-400">{mockResult.skipped}</div>
								</div>
							</div>

							<!-- Topic Performance Bars -->
							{#if topicBreakdown.length > 0}
								<div class="text-left mb-10">
									<div class="text-xs font-black text-white/30 uppercase tracking-widest mb-4">📊 Topic Performance</div>
									<div class="space-y-3">
										{#each topicBreakdown as t}
											<div>
												<div class="flex items-center justify-between text-xs mb-1">
													<span class="text-white/70">{t.topic}</span>
													<span class="font-bold" style="color:{t.pct >= 75 ? '#84cc16' : t.pct >= 50 ? '#f59e0b' : '#ef4444'};">{t.pct}%</span>
												</div>
												<div class="h-2 rounded-full bg-white/5 overflow-hidden">
													<div class="h-full rounded-full transition-all duration-700"
														style="width:{t.pct}%;background:{t.pct >= 75 ? '#84cc16' : t.pct >= 50 ? '#f59e0b' : '#ef4444'};"></div>
												</div>
												<div class="text-[10px] text-white/30 mt-0.5">{t.correct}/{t.total} correct</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- AI Recommendation -->
							<div class="p-6 rounded-3xl text-left mb-10" style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);">
								<div class="text-xs font-black text-primary uppercase tracking-widest mb-2">🤖 AI Recommendation</div>
								<p class="text-sm text-white/70 leading-relaxed">{getAIRec(mockResult.pct)}</p>
							</div>

							<!-- Question Review -->
							<details class="text-left mb-10 group">
								<summary class="cursor-pointer text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2 hover:text-white/60 transition-colors mb-4">
									📋 Review All Questions
									<span class="ml-auto transition-transform group-open:rotate-180">▾</span>
								</summary>
								<div class="space-y-4 mt-4">
									{#each mockQuestions as q, i}
										{@const ans = mockAnswers[i]}
										{@const correctKey = q.correct || q.answer}
										{@const isOk = ans === correctKey}
										<div class="p-4 rounded-2xl" style="background:rgba(255,255,255,0.03);border:1px solid {isOk ? 'rgba(16,185,129,0.2)' : ans === null ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'};">
											<div class="flex items-start justify-between gap-2 mb-2">
												<span class="text-xs text-white/60 font-medium">Q{i + 1}. {q.question?.substring(0, 80)}{q.question?.length > 80 ? '...' : ''}</span>
												<span class="text-[10px] font-bold whitespace-nowrap"
													style="color:{isOk ? '#84cc16' : ans === null ? '#f59e0b' : '#ef4444'};">
													{isOk ? '✅ Correct' : ans === null ? '⏭️ Skipped' : '❌ Wrong'}
												</span>
											</div>
											<div class="text-[10px] text-white/40">Your answer: {ans || '—'} · Correct: {correctKey}</div>
											{#if q.topic}
												<div class="text-[10px] text-white/30 mt-1">Topic: {q.topic}</div>
											{/if}
										</div>
									{/each}
								</div>
							</details>

							<button 
								onclick={() => { mockPhase = 'config'; }}
								class="w-full py-5 rounded-2xl bg-white text-secondary font-black uppercase tracking-widest shadow-2xl"
							>🔄 Take Another Mock Exam</button>
						</div>
					{/if}
				</div>
			{/if}
		</div>

	</div>
</div>

<style>
	.glass {
		background: var(--glass);
		backdrop-filter: blur(24px);
		border: 1px solid var(--glass-border);
	}
	.italic-shadow {
		text-shadow: 6px 6px 0 rgba(139, 92, 246, 0.15);
	}
</style>