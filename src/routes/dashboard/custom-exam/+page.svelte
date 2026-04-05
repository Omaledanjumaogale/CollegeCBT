<script lang="ts">
	import { currentUser, isPro, showToast } from '$lib/stores';
	import { COURSES, INSTITUTION_TYPES, LEVELS, type InstitutionType } from '$lib/data/courseData';
	import { fade, slide } from 'svelte/transition';

	// ── State ─────────────────────────────────────────────────────────────────
	type Phase = 'config' | 'generating' | 'exam' | 'grading' | 'results';
	let phase = $state<Phase>('config');
	let customTopic = $state('');
	let customSubject = $state('');
	let selectedCourse = $state('');
	let selectedInstType = $state<InstitutionType | ''>('');
	let selectedLevel = $state('');
	let numQuestions = $state(5);
	let qType = $state<'MCQ' | 'Theory' | 'Mixed'>('MCQ');

	// Questions & Answers
	interface MCQ {
		id: string;
		question: string;
		options: { A: string; B: string; C: string; D: string };
		correct: string;
		explanations: Record<string, string>;
		examiner_note?: string;
		topic: string;
		type: 'MCQ';
	}
	interface Theory {
		question: string;
		key_points: { point: string; marks: number }[];
		model_answer: string;
		examiner_notes: string;
		mark_scheme: string;
		topic: string;
		type: 'Theory';
	}
	type AnyQuestion = MCQ | Theory;

	let questions = $state<AnyQuestion[]>([]);
	let mcqAnswers = $state<Record<number, string>>({});
	let theoryAnswers = $state<Record<number, string>>({});
	let currentQ = $state(0);
	let gradeReport = $state<any>(null);
	let generatingMsg = $state('');
	let error = $state('');

	// ── Derived ───────────────────────────────────────────────────────────────
	let userPlan = $derived($currentUser?.plan ?? 'free');
	let canUseTheory = $derived($isPro);
	let totalMarks = $derived(questions
		.filter((q) => q.type === 'Theory')
		.reduce((acc, q) => acc + (q as Theory).key_points.reduce((s, kp) => s + kp.marks, 0), 0));

	// ── Config validation ──────────────────────────────────────────────────────
	function validateConfig(): string | null {
		if (!customTopic.trim() && !selectedCourse) return 'Please enter a custom topic or select a course.';
		if (!selectedInstType) return 'Please select your institution type.';
		if (!selectedLevel) return 'Please select your level.';
		if (qType === 'Theory' && !canUseTheory) return 'Theory questions require a Pro subscription.';
		return null;
	}

	// ── Generate questions one by one ─────────────────────────────────────────
	async function generateAll() {
		const validError = validateConfig();
		if (validError) { error = validError; return; }
		error = '';
		phase = 'generating';
		questions = [];

		const course = customTopic.trim()
			? `${customTopic.trim()}${customSubject ? ' — ' + customSubject.trim() : ''}`
			: selectedCourse;

		const types: ('MCQ' | 'Theory')[] = qType === 'Mixed'
			? Array.from({ length: numQuestions }, (_, i) => i % 2 === 0 ? 'MCQ' : 'Theory')
			: Array(numQuestions).fill(qType);

		// Filter theory if free user
		const filteredTypes = canUseTheory ? types : types.map(() => 'MCQ' as 'MCQ');

		for (let i = 0; i < filteredTypes.length; i++) {
			const t = filteredTypes[i];
			generatingMsg = `Generating question ${i + 1} of ${filteredTypes.length} (${t})…`;
			try {
				const res = await fetch('/api/generate-question', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						course,
						level: selectedLevel,
						institutionType: selectedInstType,
						topic: customTopic || undefined,
						type: t,
						uid: $currentUser?.uid,
					}),
				});
				const data = await res.json();
				if (data.error) throw new Error(data.error);
				questions = [...questions, { ...data, type: t, id: crypto.randomUUID() }];
			} catch (err: any) {
				showToast('⚠️ Generation Warning', err.message || 'A question failed to load.', 'error');
				// Continue generating the rest
			}
		}

		if (questions.length === 0) {
			error = 'No questions could be generated. Please check your settings and try again.';
			phase = 'config';
			return;
		}

		currentQ = 0;
		phase = 'exam';
	}

	// ── Navigation ─────────────────────────────────────────────────────────────
	function nextQuestion() {
		if (currentQ < questions.length - 1) currentQ++;
	}
	function prevQuestion() {
		if (currentQ > 0) currentQ--;
	}

	// ── Submit exam for grading ─────────────────────────────────────────────────
	async function submitExam() {
		phase = 'grading';

		const theoryQs = questions
			.map((q, i) => ({ q, i }))
			.filter(({ q }) => q.type === 'Theory');

		if (theoryQs.length === 0) {
			// Pure MCQ — grade immediately
			gradeReport = gradeMCQLocally();
			phase = 'results';
			return;
		}

		// Grade theory via AI
		const course = customTopic.trim() || selectedCourse;
		const answersPayload = theoryQs.map(({ q, i }) => {
			const tq = q as Theory;
			return {
				question: tq.question,
				keyPoints: tq.key_points,
				modelAnswer: tq.model_answer,
				userAnswer: theoryAnswers[i] || '',
				maxMarks: tq.key_points.reduce((s, kp) => s + kp.marks, 0),
				topic: tq.topic,
			};
		});

		try {
			const res = await fetch('/api/grade-exam', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					course,
					level: selectedLevel,
					institutionType: selectedInstType,
					uid: $currentUser?.uid,
					answers: answersPayload,
				}),
			});
			const aiGrade = await res.json();

			// Merge with MCQ scores
			const mcqResult = gradeMCQLocally();
			gradeReport = mergeReports(mcqResult, aiGrade, questions);
		} catch (err) {
			gradeReport = gradeMCQLocally();
			showToast('⚠️ Grading Notice', 'AI grading unavailable, MCQ scores calculated locally.', 'info');
		}

		phase = 'results';
	}

	// ── Local MCQ grading ──────────────────────────────────────────────────────
	function gradeMCQLocally() {
		const mcqItems = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.type === 'MCQ');
		let correct = 0;
		const details = mcqItems.map(({ q, i }) => {
			const mq = q as MCQ;
			const chosen = mcqAnswers[i] || '';
			const ok = chosen === mq.correct;
			if (ok) correct++;
			return { question: mq.question, userAnswer: chosen, correctAnswer: mq.correct, ok, explanation: mq.explanations?.correct || '' };
		});
		const total = mcqItems.length;
		const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
		return { mcqDetails: details, mcqCorrect: correct, mcqTotal: total, mcqPercent: pct };
	}

	function mergeReports(mcq: any, ai: any, qs: AnyQuestion[]) {
		const mcqTotal = mcq.mcqTotal * 1; // 1 mark each
		const mcqScore = mcq.mcqCorrect;
		const aiTotal = ai.maxTotal || 0;
		const aiScore = ai.totalScore || 0;
		const grandTotal = mcqTotal + aiTotal;
		const grandScore = mcqScore + aiScore;
		const pct = grandTotal > 0 ? Math.round((grandScore / grandTotal) * 100) : 0;
		const grade = pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 45 ? 'D' : 'F';
		return {
			...mcq,
			theoryAnswers: ai.answers || [],
			theoryAnalysis: ai.aiAnalysis || '',
			grandScore,
			grandTotal,
			percentage: pct,
			grade,
		};
	}

	function restart() {
		phase = 'config';
		questions = [];
		mcqAnswers = {};
		theoryAnswers = {};
		gradeReport = null;
		currentQ = 0;
		error = '';
	}

	let currentQuestion = $derived(questions[currentQ] ?? null);
	let progress = $derived(questions.length > 0 ? Math.round(((currentQ + 1) / questions.length) * 100) : 0);
</script>

<svelte:head>
	<title>Custom AI Exam — CollegeCBT | Study Any Topic</title>
	<meta name="description" content="Build a custom AI exam on any subject, topic, or module. Enter your course material and let the AI generate professional exam questions." />
</svelte:head>

<div class="min-h-screen pt-20 pb-24 px-4">
	<div class="max-w-3xl mx-auto">

		<!-- ── Header ──────────────────────────────────────────────────────── -->
		{#if phase !== 'results'}
			<div class="text-center mb-8" in:fade>
				<div class="text-4xl mb-3">🤖</div>
				<h1 class="font-display text-3xl md:text-4xl mb-2">Custom AI Exam Builder</h1>
				<p class="text-white/50 text-sm max-w-md mx-auto">
					Enter any topic, module, or course — the AI will research it and build a full exam with questions, marking schemes, and instant grading.
				</p>
				{#if !$isPro}
					<div class="mt-3 inline-flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
						⚡ Free plan: MCQ only · <a href="/pricing" class="underline hover:text-amber-300">Upgrade for Theory + AI grading</a>
					</div>
				{/if}
			</div>
		{/if}

		<!-- ── CONFIG PHASE ────────────────────────────────────────────────── -->
		{#if phase === 'config'}
			<div class="glass-card p-6" in:fade>
				<div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>

				{#if error}
					<div class="p-3 rounded-xl mb-5 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20" transition:slide>
						⚠️ {error}
					</div>
				{/if}

				<!-- Custom topic input -->
				<div class="mb-6">
					<label for="custom-topic" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
						📚 Your Custom Topic or Module *
					</label>
					<input
						id="custom-topic"
						type="text"
						bind:value={customTopic}
						class="form-input text-base"
						placeholder="e.g. Cardiac Pharmacology, Nigerian Constitutional Law, Digital Signal Processing…"
					/>
					<p class="text-[11px] text-white/30 mt-1.5">Enter any subject, topic, or module — the AI will generate questions based on this.</p>
				</div>

				<div class="mb-6">
					<label for="custom-subject" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
						🎯 Optional Subtopic or Focus Area
					</label>
					<input
						id="custom-subject"
						type="text"
						bind:value={customSubject}
						class="form-input"
						placeholder="e.g. Drug interactions of beta-blockers, Section 14 of the 1999 Constitution…"
					/>
				</div>

				<!-- OR separator -->
				<div class="flex items-center gap-3 mb-5">
					<div class="flex-1 h-px bg-white/10"></div>
					<span class="text-xs text-white/30">OR select from the curriculum</span>
					<div class="flex-1 h-px bg-white/10"></div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
					<!-- Institution Type -->
					<div>
						<label for="custom-inst" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
							Institution Type *
						</label>
						<select id="custom-inst" bind:value={selectedInstType} class="form-select">
							<option value="">Select Type</option>
							{#each INSTITUTION_TYPES as t}<option value={t}>{t}</option>{/each}
						</select>
					</div>

					<!-- Level -->
					<div>
						<label for="custom-level" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
							Study Level *
						</label>
						<select id="custom-level" bind:value={selectedLevel} class="form-select">
							<option value="">Select Level</option>
							{#if selectedInstType && LEVELS[selectedInstType as InstitutionType]}
								{#each LEVELS[selectedInstType as InstitutionType] as lvl}<option value={lvl}>{lvl}</option>{/each}
							{:else}
								{#each ['100 Level','200 Level','300 Level','400 Level','500/600 Level'] as lvl}<option value={lvl}>{lvl}</option>{/each}
							{/if}
						</select>
					</div>

					<!-- Question count -->
					<div>
						<label for="custom-count" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
							Number of Questions
						</label>
						<select id="custom-count" bind:value={numQuestions} class="form-select">
							{#each [3, 5, 8, 10] as n}<option value={n}>{n} Questions</option>{/each}
						</select>
					</div>

					<!-- Question type -->
					<div>
						<label for="custom-type" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
							Question Format
						</label>
						<select id="custom-type" bind:value={qType} class="form-select">
							<option value="MCQ">Multiple Choice (MCQ)</option>
							<option value="Theory" disabled={!canUseTheory}>Theory / Essay {canUseTheory ? '' : '(Pro only)'}</option>
							<option value="Mixed" disabled={!canUseTheory}>Mixed: MCQ + Theory {canUseTheory ? '' : '(Pro only)'}</option>
						</select>
					</div>
				</div>

				<button
					onclick={generateAll}
					class="btn-violet w-full py-3.5 justify-center text-base font-bold"
					disabled={phase !== 'config'}
				>
					🤖 Build My Custom Exam →
				</button>
			</div>
		{/if}

		<!-- ── GENERATING PHASE ────────────────────────────────────────────── -->
		{#if phase === 'generating'}
			<div class="glass-card p-10 text-center" in:fade>
				<div class="text-5xl mb-4 animate-bounce">🧠</div>
				<h2 class="font-display text-2xl mb-2">AI is Building Your Exam</h2>
				<p class="text-white/50 text-sm mb-6">{generatingMsg}</p>
				<div class="w-full bg-white/10 rounded-full h-2 mb-3">
					<div
						class="h-2 rounded-full transition-all duration-500"
						style="width:{questions.length > 0 ? Math.round((questions.length / numQuestions) * 100) : 5}%;background:linear-gradient(90deg,#7c3aed,#84cc16);"
					></div>
				</div>
				<p class="text-xs text-white/30">{questions.length} of {numQuestions} questions ready</p>
			</div>
		{/if}

		<!-- ── EXAM PHASE ──────────────────────────────────────────────────── -->
		{#if phase === 'exam' && currentQuestion}
			<div in:fade>
				<!-- Progress bar -->
				<div class="mb-4">
					<div class="flex justify-between text-xs text-white/40 mb-1.5">
						<span>Question {currentQ + 1} of {questions.length}</span>
						<span>{progress}% complete</span>
					</div>
					<div class="w-full bg-white/10 rounded-full h-1.5">
						<div class="h-1.5 rounded-full transition-all" style="width:{progress}%;background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>
					</div>
				</div>

				<!-- Question card -->
				<div class="glass-card p-6 relative overflow-hidden">
					<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>

					<!-- Type badge -->
					<div class="flex items-center gap-2 mb-4">
						<span class="text-[11px] font-bold px-2.5 py-1 rounded-full"
							style="background:{currentQuestion.type === 'MCQ' ? 'rgba(124,58,237,0.2)' : 'rgba(132,204,22,0.15)'};color:{currentQuestion.type === 'MCQ' ? '#a78bfa' : '#84cc16'};">
							{currentQuestion.type === 'MCQ' ? '📝 Multiple Choice' : '✍️ Theory / Essay'}
						</span>
						<span class="text-xs text-white/30">{currentQuestion.topic}</span>
					</div>

					<h2 class="text-base md:text-lg font-semibold text-white leading-relaxed mb-5">
						{currentQuestion.question}
					</h2>

					<!-- MCQ Options -->
					{#if currentQuestion.type === 'MCQ'}
						{@const mq = currentQuestion as MCQ}
						<div class="space-y-3 mb-6">
							{#each Object.entries(mq.options) as [key, val]}
								<button
									onclick={() => { mcqAnswers[currentQ] = key; }}
									class="w-full text-left p-3.5 rounded-xl border transition-all text-sm"
									style="
										border-color:{mcqAnswers[currentQ] === key ? '#7c3aed' : 'rgba(255,255,255,0.08)'};
										background:{mcqAnswers[currentQ] === key ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)'};
										color:{mcqAnswers[currentQ] === key ? '#c4b5fd' : 'rgba(255,255,255,0.8)'};
									"
								>
									<span class="font-bold mr-2" style="color:{mcqAnswers[currentQ] === key ? '#a78bfa' : 'rgba(255,255,255,0.4)'};">{key}.</span>
									{val}
								</button>
							{/each}
						</div>
					{/if}

					<!-- Theory Answer -->
					{#if currentQuestion.type === 'Theory'}
						{@const tq = currentQuestion as Theory}
						<div class="mb-5">
							<div class="p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 mb-3 text-xs text-lime-300">
								💡 <strong>Mark scheme:</strong> {tq.mark_scheme}
							</div>
							<label for="theory-answer-{currentQ}" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
								Your Answer (write as much as needed)
							</label>
							<textarea
								id="theory-answer-{currentQ}"
								bind:value={theoryAnswers[currentQ]}
								rows="8"
								class="form-input resize-y"
								placeholder="Write your detailed answer here. Remember to define key terms, provide Nigerian examples, and use clear paragraphs…"
							></textarea>
						</div>
					{/if}

					<!-- Navigation -->
					<div class="flex gap-3">
						{#if currentQ > 0}
							<button onclick={prevQuestion} class="btn-ghost flex-1 py-3 text-sm">← Previous</button>
						{/if}
						{#if currentQ < questions.length - 1}
							<button onclick={nextQuestion} class="btn-violet flex-1 py-3 text-sm justify-center">Next →</button>
						{:else}
							<button onclick={submitExam} class="btn-violet flex-1 py-3 text-sm justify-center font-bold">
								✅ Submit for Grading
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- ── GRADING PHASE ───────────────────────────────────────────────── -->
		{#if phase === 'grading'}
			<div class="glass-card p-10 text-center" in:fade>
				<div class="text-5xl mb-4" style="animation:spin 2s linear infinite;">⚙️</div>
				<h2 class="font-display text-2xl mb-2">AI is Marking Your Answers</h2>
				<p class="text-white/50 text-sm">Analysing your responses against the marking scheme…</p>
			</div>
		{/if}

		<!-- ── RESULTS PHASE ───────────────────────────────────────────────── -->
		{#if phase === 'results' && gradeReport}
			<div in:fade>
				<!-- Score card -->
				<div class="glass-card p-6 mb-5 text-center relative overflow-hidden">
					<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>
					<div class="text-6xl font-black mb-1" style="background:linear-gradient(135deg,#7c3aed,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
						{gradeReport.grade}
					</div>
					<div class="text-3xl font-bold text-white mb-1">
						{gradeReport.grandScore ?? gradeReport.mcqCorrect}/{gradeReport.grandTotal ?? gradeReport.mcqTotal}
					</div>
					<p class="text-white/50 text-sm">
						{gradeReport.percentage ?? gradeReport.mcqPercent}% — Custom AI Exam Score
					</p>
					{#if gradeReport.theoryAnalysis}
						<div class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/70 leading-relaxed">
							<p class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">🤖 AI Feedback</p>
							{gradeReport.theoryAnalysis}
						</div>
					{/if}
				</div>

				<!-- MCQ Results -->
				{#if gradeReport.mcqDetails && gradeReport.mcqDetails.length > 0}
					<div class="glass-card p-5 mb-4">
						<h3 class="font-semibold text-sm text-white/70 uppercase tracking-wider mb-4">📝 MCQ Breakdown</h3>
						<div class="space-y-3">
							{#each gradeReport.mcqDetails as d, i}
								<div class="p-3 rounded-xl border text-sm"
									style="border-color:{d.ok ? 'rgba(132,204,22,0.3)' : 'rgba(239,68,68,0.3)'};background:{d.ok ? 'rgba(132,204,22,0.07)' : 'rgba(239,68,68,0.07)'};">
									<div class="flex items-start gap-2">
										<span class="text-lg mt-0.5">{d.ok ? '✅' : '❌'}</span>
										<div>
											<p class="text-white/80 mb-1">{d.question}</p>
											<p class="text-xs" style="color:{d.ok ? '#84cc16' : '#f87171'};">
												Your answer: <strong>{d.userAnswer || 'None'}</strong>
												{#if !d.ok} · Correct: <strong>{d.correctAnswer}</strong>{/if}
											</p>
											{#if d.explanation}
												<p class="text-xs text-white/40 mt-1">{d.explanation}</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Theory Results -->
				{#if gradeReport.theoryAnswers && gradeReport.theoryAnswers.length > 0}
					<div class="glass-card p-5 mb-4">
						<h3 class="font-semibold text-sm text-white/70 uppercase tracking-wider mb-4">✍️ Theory Marking</h3>
						<div class="space-y-4">
							{#each gradeReport.theoryAnswers as t}
								<div class="p-4 rounded-xl border border-white/10 bg-white/3">
									<p class="text-sm text-white/80 mb-2">{t.question}</p>
									<div class="flex items-center gap-2 mb-2">
										<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
											{t.score}/{t.maxScore} marks
										</span>
									</div>
									<p class="text-xs text-white/50 leading-relaxed">{t.feedback}</p>
									{#if t.missedPoints && t.missedPoints.length > 0}
										<div class="mt-2">
											<p class="text-[11px] text-rose-300 font-semibold mb-1">Missed key points:</p>
											<ul class="list-disc list-inside text-xs text-white/40 space-y-0.5">
												{#each t.missedPoints as pt}<li>{pt}</li>{/each}
											</ul>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex gap-3 flex-wrap">
					<button onclick={restart} class="btn-ghost flex-1 py-3 text-sm">🔄 New Custom Exam</button>
					<a href="/exam-lab" class="btn-violet flex-1 py-3 text-sm text-center justify-center">🎯 Go to Exam Lab</a>
				</div>
			</div>
		{/if}

	</div>
</div>

<style>
	@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
