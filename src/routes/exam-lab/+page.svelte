<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { currentUser, showToast } from '$lib/stores';
	import AcademicSelector from '$lib/components/AcademicSelector.svelte';
	import ExamScoreBar from '$lib/components/ExamScoreBar.svelte';
	import {
		completeExamRun,
		saveQuestionAttempt,
		saveStudySession,
		startExamRun
	} from '$lib/services/convexClient';
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
		topic: '',
		examType: 'Adaptive Practice'
	});

	// ── LAB STATE ──
	type OptionKey = 'A' | 'B' | 'C' | 'D';
	type MCQ = { question: string; options: Record<OptionKey,string>; answer?: OptionKey; correct?: OptionKey; explanation?: string; topic?: string; examiner_note?: string; explanations?: Record<string,string>; questionHash?: string; selectionKey?: string };
	type Theory = { question: string; model_answer: string; key_points: {point:string;marks:number}[]; topic?: string; examiner_notes?: string };
	
	let labQuestion = $state<MCQ | null>(null);
	let labTheory = $state<Theory | null>(null);
	let labLoading = $state(false);
	let labQtype = $state<'MCQ' | 'Theory'>('MCQ');
	let labAnswered = $state(false);
	let selectedOption = $state<OptionKey | null>(null);
	let userTheoryAnswer = $state('');
	let theoryRevealed = $state(false);
	
	let labStats = $state({ total: 0, correct: 0, wrong: 0, score: 0, streak: 0 });
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let activeLabSessionId = $state(`lab-${Date.now()}`);
	let activeMockSessionId = $state(`mock-${Date.now()}`);
	let questionStartedAt = $state(Date.now());
	const localAttemptCacheKey = 'collegecbt_exam_attempt_cache_v1';
	const localQuestionHashKey = 'collegecbt_exam_question_hashes_v1';
	const labDraftKey = 'collegecbt_exam_lab_draft_v1';
	let recentQuestionHashes = $state<string[]>([]);
	let mockDeadlineAt = $state<number | null>(null);

	const difficultyOptions = [
		{ value: 'mixed', label: 'Mixed Difficulty' },
		{ value: 'easy', label: 'Foundation / Easy' },
		{ value: 'medium', label: 'Standard / Medium' },
		{ value: 'hard', label: 'Advanced / Hard' }
	] as const;
	let labDifficulty = $state<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
	let mockDifficulty = $state<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
	const examTypeOptions = [
		'Adaptive Practice',
		'Semester Exam',
		'Departmental Test',
		'WAEC Style',
		'JAMB/Post-UTME',
		'NABTEB/Technical',
		'Professional Certification',
		'Scholarship Screening',
		'Entrance Exam',
		'Revision Drill'
	];

	function safeJsonParse<T>(value: string | null): T | null {
		if (!value) return null;
		try {
			return JSON.parse(value) as T;
		} catch {
			return null;
		}
	}

	function hashString(input: string) {
		let hash = 0;
		for (let i = 0; i < input.length; i++) {
			hash = Math.imul(31, hash) + input.charCodeAt(i) | 0;
		}
		return Math.abs(hash).toString(36);
	}

	function cacheAttempt(attempt: Record<string, unknown>) {
		if (typeof localStorage === 'undefined') return;
		const existing = safeJsonParse<Record<string, unknown>[]>(localStorage.getItem(localAttemptCacheKey)) || [];
		const next = [attempt, ...existing.filter((item) => item.cacheKey !== attempt.cacheKey)].slice(0, 250);
		localStorage.setItem(localAttemptCacheKey, JSON.stringify(next));
	}

	function rememberQuestionHash(hash?: string) {
		if (!hash) return;
		recentQuestionHashes = [hash, ...recentQuestionHashes.filter((item) => item !== hash)].slice(0, 80);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(localQuestionHashKey, JSON.stringify(recentQuestionHashes));
		}
	}

	function cacheDraft() {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(labDraftKey, JSON.stringify({
			academicData,
			labStats,
			activeTab,
			labQtype,
			labDifficulty,
			mockDifficulty,
			mockQCount,
			mockTimePerQ,
			recentQuestionHashes
		}));
	}

	function buildGenerationPayload(kind: 'lab' | 'mock', type: 'MCQ' | 'Theory') {
		return {
			course: academicData.course,
			level: academicData.level,
			institutionType: academicData.institutionType,
			faculty: academicData.faculty || undefined,
			department: academicData.department || undefined,
			topic: academicData.topic || undefined,
			examType: academicData.examType || undefined,
			difficulty: kind === 'mock' ? mockDifficulty : labDifficulty,
			type,
			sessionId: kind === 'mock' ? activeMockSessionId : activeLabSessionId,
			excludeHashes: recentQuestionHashes,
			uid: $currentUser?.uid
		};
	}

	async function startOwnedRun(kind: 'lab' | 'mock', questionCount: number, deadlineAt?: number) {
		const userId = $currentUser?.uid;
		if (!userId) return false;
		const now = Date.now();
		return await startExamRun({
			userId,
			clientSessionId: kind === 'mock' ? activeMockSessionId : activeLabSessionId,
			mode: kind,
			course: academicData.course,
			level: academicData.level || '100 Level',
			institutionType: academicData.institutionType,
			faculty: academicData.faculty || undefined,
			department: academicData.department || undefined,
			topic: academicData.topic || undefined,
			examType: academicData.examType || undefined,
			difficulty: kind === 'mock' ? mockDifficulty : labDifficulty,
			questionCount,
			deadlineAt,
			startedAt: now
		});
	}

	async function recordAttempt(input: {
		sessionId: string;
		mode: 'lab' | 'mock';
		type: 'MCQ' | 'Theory';
		question: string;
		options?: Record<string, string>;
		correctAnswer?: string;
		selectedAnswer?: string;
		isCorrect?: boolean;
		score: number;
		maxScore: number;
		grade?: string;
		topic?: string;
		questionHash?: string;
	}) {
		const userId = $currentUser?.uid;
		const now = Date.now();
		const questionHash = input.questionHash || hashString(`${input.question}:${input.correctAnswer ?? ''}:${input.topic ?? ''}`);
		const cacheKey = `${userId || 'guest'}:${input.sessionId}:${questionHash}:${input.selectedAnswer ?? 'draft'}`;
		const attempt = {
			userId: userId || 'guest',
			sessionId: input.sessionId,
			course: academicData.course,
			level: academicData.level || '100 Level',
			institutionType: academicData.institutionType,
			topic: input.topic || academicData.topic || 'General',
			mode: input.mode,
			type: input.type,
			questionHash,
			question: input.question,
			options: input.options ? JSON.stringify(input.options) : undefined,
			correctAnswer: input.correctAnswer,
			selectedAnswer: input.selectedAnswer,
			isCorrect: input.isCorrect,
			score: input.score,
			maxScore: input.maxScore,
			grade: input.grade,
			responseMs: Math.max(0, now - questionStartedAt),
			cacheKey,
			createdAt: now
		};

		cacheAttempt(attempt);
		cacheDraft();

		if (!userId || userId.startsWith('guest')) {
			saveState = 'saved';
			return;
		}

		saveState = 'saving';
		const ok = await saveQuestionAttempt(attempt);
		saveState = ok ? 'saved' : 'error';
	}

	function applyAcademicUpdate(data: Partial<typeof academicData>) {
		const next = { ...academicData, ...data };
		if (!next.faculty && academicData.faculty && next.institutionType === academicData.institutionType) {
			next.faculty = academicData.faculty;
		}
		if (!next.department && academicData.department && next.faculty === academicData.faculty) {
			next.department = academicData.department;
		}
		if (!next.level && academicData.level && next.department === academicData.department) {
			next.level = academicData.level;
		}
		if (!next.course && academicData.course && next.level === academicData.level) {
			next.course = academicData.course;
		}
		if (!next.topic && academicData.topic && next.course === academicData.course) {
			next.topic = academicData.topic;
		}

		if (
			next.institutionType === academicData.institutionType &&
			next.faculty === academicData.faculty &&
			next.department === academicData.department &&
			next.level === academicData.level &&
			next.course === academicData.course &&
			next.topic === academicData.topic
		) {
			return;
		}
		academicData = next;
		cacheDraft();
	}

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
			void startOwnedRun('lab', 1);
			const res = await fetch('/api/generate-question', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(buildGenerationPayload('lab', labQtype)),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			rememberQuestionHash(data.questionHash);
			if (labQtype === 'MCQ') labQuestion = data;
			else labTheory = data;
			
			labStats.total++;
			questionStartedAt = Date.now();
			cacheDraft();
		} catch (err: any) {
			showToast('❌ Generation Error', err.message, 'error');
		} finally {
			labLoading = false;
		}
	}

	async function persistStudyResult(session: {
		course: string;
		level: string;
		institutionType: string;
		questionsAnswered: number;
		correct: number;
		wrong: number;
		score: number;
		mode: 'lab' | 'mock';
		grade?: string;
	}) {
		if (!$currentUser?.uid) return;
		saveState = 'saving';

		try {
			const ok = await saveStudySession($currentUser.uid, {
				id: `session-${Date.now()}-${crypto.randomUUID()}`,
				...session,
				faculty: academicData.faculty || undefined,
				department: academicData.department || undefined,
				topic: academicData.topic || undefined,
				examType: academicData.examType || undefined,
				timestamp: Date.now()
			});
			saveState = ok ? 'saved' : 'error';
			if (!ok) showToast('⚠️ Sync Pending', 'Your result is visible locally but could not sync yet.', 'warning');
		} catch (err) {
			console.error('[CollegeCBT] Study session save failed:', err);
			saveState = 'error';
			showToast('⚠️ Sync Pending', 'Your result is visible locally but could not sync yet.', 'warning');
		}
	}

	function answerMCQ(key: OptionKey) {
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

		void persistStudyResult({
			course: academicData.course,
			level: academicData.level,
			institutionType: academicData.institutionType,
			questionsAnswered: 1,
			correct: isCorrect ? 1 : 0,
			wrong: isCorrect ? 0 : 1,
			score: isCorrect ? 100 : 0,
			mode: 'lab',
			grade: isCorrect ? 'A1' : 'F9'
		});
		void recordAttempt({
			sessionId: activeLabSessionId,
			mode: 'lab',
			type: 'MCQ',
			question: labQuestion.question,
			options: labQuestion.options,
			correctAnswer: correctKey,
			selectedAnswer: key,
			isCorrect,
			score: isCorrect ? 1 : 0,
			maxScore: 1,
			grade: isCorrect ? 'A1' : 'F9',
			topic: labQuestion.topic,
			questionHash: labQuestion.questionHash
		});
	}

	function revealTheoryAnswer() {
		if (!labTheory || theoryRevealed) return;
		theoryRevealed = true;
		const wordCount = userTheoryAnswer.trim().split(/\s+/).filter(Boolean).length;
		const score = wordCount >= 80 ? 1 : wordCount >= 30 ? 0.5 : 0;
		void recordAttempt({
			sessionId: activeLabSessionId,
			mode: 'lab',
			type: 'Theory',
			question: labTheory.question,
			selectedAnswer: userTheoryAnswer.trim(),
			score,
			maxScore: 1,
			grade: score >= 1 ? 'A1' : score >= 0.5 ? 'C4' : 'Practice',
			topic: labTheory.topic,
			questionHash: labTheory.question
		});
		if ($currentUser?.uid) {
			void persistStudyResult({
				course: academicData.course,
				level: academicData.level,
				institutionType: academicData.institutionType,
				questionsAnswered: 1,
				correct: score >= 1 ? 1 : 0,
				wrong: score >= 1 ? 0 : 1,
				score: Math.round(score * 100),
				mode: 'lab',
				grade: score >= 1 ? 'A1' : score >= 0.5 ? 'C4' : 'Practice'
			});
		}
		cacheDraft();
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
		activeMockSessionId = `mock-${Date.now()}`;
		mockPhase = 'generating';
		mockQuestions = [];
		mockAnswers = [];
		mockCurrentIdx = 0;
		mockQuestionStates = [];
		mockResult = { score: 0, correct: 0, wrong: 0, skipped: 0, pct: 0, grade: 'F9' };
		questionStartedAt = Date.now();
		mockDeadlineAt = Date.now() + mockQCount * mockTimePerQ * 1000;
		void startOwnedRun('mock', mockQCount, mockDeadlineAt);
		cacheDraft();

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
								...buildGenerationPayload('mock', 'MCQ'),
								excludeHashes: [
									...recentQuestionHashes,
									...mockQuestions.flatMap((question) => question.questionHash ? [question.questionHash] : [])
								]
							}),
						}).then(r => r.json())
					);
				}
				const results = await Promise.all(promises);
				for (const data of results) {
					if (!data.error && !mockQuestions.some((question) => question.questionHash === data.questionHash)) {
						rememberQuestionHash(data.questionHash);
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
			questionStartedAt = Date.now();
			cacheDraft();
			startMockTimer();
		} catch (err: any) {
			showToast('❌ Mock Error', err.message, 'error');
			mockPhase = 'config';
		}
	}

	function startMockTimer() {
		mockDeadlineAt = Date.now() + mockTimePerQ * 1000;
		mockTimeLeft = mockTimePerQ;
		if (mockTimer) clearInterval(mockTimer);
		mockTimer = setInterval(() => {
			if (!mockDeadlineAt) return;
			mockTimeLeft = Math.max(0, Math.ceil((mockDeadlineAt - Date.now()) / 1000));
			if (mockTimeLeft <= 0 && mockPhase === 'active') {
				handleSkip();
			}
		}, 250);
	}

	function resetMockTimer() {
		startMockTimer();
	}

	function handleAnswer(key: OptionKey) {
		const q = mockQuestions[mockCurrentIdx];
		if (!q || mockAnswers[mockCurrentIdx] !== null) return;
		
		mockAnswers[mockCurrentIdx] = key;
		const correctKey = q.correct || q.answer;
		const isCorrect = key === correctKey;
		mockQuestionStates[mockCurrentIdx] = isCorrect ? 'correct' : 'wrong';
		const nextCorrect = mockResult.correct + (isCorrect ? 1 : 0);
		const nextWrong = mockResult.wrong + (isCorrect ? 0 : 1);
		const answeredTotal = nextCorrect + nextWrong + mockResult.skipped;
		const nextPct = answeredTotal > 0 ? Math.round((nextCorrect / answeredTotal) * 100) : 0;
		mockResult = {
			score: nextCorrect,
			correct: nextCorrect,
			wrong: nextWrong,
			skipped: mockResult.skipped,
			pct: nextPct,
			grade: getWAECGrade(nextPct).grade
		};
		mockAnswers = [...mockAnswers];
		mockQuestionStates = [...mockQuestionStates];
		void recordAttempt({
			sessionId: activeMockSessionId,
			mode: 'mock',
			type: 'MCQ',
			question: q.question,
			options: q.options,
			correctAnswer: correctKey,
			selectedAnswer: key,
			isCorrect,
			score: isCorrect ? 1 : 0,
			maxScore: 1,
			grade: isCorrect ? 'A1' : 'F9',
			topic: q.topic,
			questionHash: q.questionHash
		});

		// Auto-advance to next question
		if (mockCurrentIdx < mockQuestions.length - 1) {
			mockCurrentIdx++;
			resetMockTimer();
			questionStartedAt = Date.now();
			cacheDraft();
		}
	}

	function handleSkip() {
		if (mockAnswers[mockCurrentIdx] === null) {
			mockQuestionStates[mockCurrentIdx] = 'skipped';
			mockResult = {
				...mockResult,
				skipped: mockResult.skipped + 1
			};
			mockQuestionStates = [...mockQuestionStates];
		}
		if (mockCurrentIdx < mockQuestions.length - 1) {
			mockCurrentIdx++;
			resetMockTimer();
			questionStartedAt = Date.now();
			cacheDraft();
		} else {
			finishMock();
		}
	}

	function jumpToQuestion(idx: number) {
		if (idx >= 0 && idx < mockQuestions.length) {
			mockCurrentIdx = idx;
			if (mockAnswers[idx] === null) resetMockTimer();
			questionStartedAt = Date.now();
			cacheDraft();
		}
	}

	function finishMock() {
		if (mockTimer) {
			clearInterval(mockTimer);
			mockTimer = null;
		}
		mockDeadlineAt = null;
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
		mockQuestionStates = [...mockQuestionStates];
		cacheDraft();

		void persistStudyResult({
			course: academicData.course,
			level: academicData.level,
			institutionType: academicData.institutionType,
			questionsAnswered: total,
			correct,
			wrong,
			score: pct,
			mode: 'mock',
			grade
		});
		if ($currentUser?.uid) {
			void completeExamRun({
				userId: $currentUser.uid,
				clientSessionId: activeMockSessionId,
				score: pct,
				correct,
				wrong,
				skipped,
				grade,
				completedAt: Date.now()
			});
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

	$effect(() => {
		cacheDraft();
	});

	onMount(() => {
		const draft = safeJsonParse<{
			academicData?: typeof academicData;
			labStats?: typeof labStats;
			activeTab?: 'lab' | 'mock';
			labQtype?: 'MCQ' | 'Theory';
			labDifficulty?: typeof labDifficulty;
			mockDifficulty?: typeof mockDifficulty;
			mockQCount?: number;
			mockTimePerQ?: number;
			recentQuestionHashes?: string[];
		}>(localStorage.getItem(labDraftKey));
		if (draft) {
			if (draft.academicData) academicData = { ...academicData, ...draft.academicData };
			if (draft.labStats) labStats = { ...labStats, ...draft.labStats };
			if (draft.activeTab) activeTab = draft.activeTab;
			if (draft.labQtype) labQtype = draft.labQtype;
			if (draft.labDifficulty) labDifficulty = draft.labDifficulty;
			if (draft.mockDifficulty) mockDifficulty = draft.mockDifficulty;
			if (draft.mockQCount) mockQCount = draft.mockQCount;
			if (draft.mockTimePerQ) mockTimePerQ = draft.mockTimePerQ;
			if (draft.recentQuestionHashes) recentQuestionHashes = draft.recentQuestionHashes;
		}
		const cachedHashes = safeJsonParse<string[]>(localStorage.getItem(localQuestionHashKey));
		if (cachedHashes) recentQuestionHashes = cachedHashes.slice(0, 80);

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
		cacheDraft();
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

<div class="mx-auto max-w-6xl overflow-x-hidden px-3 py-8 sm:px-4 sm:py-12 lg:py-20">
	<!-- Dynamic Header -->
	<div class="text-center mb-12">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
			</span>
			AI Practice Mode
		</div>
		<h1 class="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 tracking-normal uppercase italic italic-shadow">
			{activeTab === 'lab' ? 'Exam' : 'Mock'} <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{activeTab === 'lab' ? 'Practice' : 'Exam'}</span>
		</h1>
		<div class="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
			<button 
				onclick={() => activeTab = 'lab'}
				class="min-h-[44px] rounded-xl px-3 py-3 text-xs font-bold transition-all sm:text-sm {activeTab === 'lab' ? 'bg-white text-secondary shadow-xl' : 'text-white/40 hover:text-white'}"
			>
				Practice Mode
			</button>
			<button 
				onclick={() => { activeTab = 'mock'; mockPhase = 'config'; }}
				data-testid="tab-mock"
				class="min-h-[44px] rounded-xl px-3 py-3 text-xs font-bold transition-all sm:text-sm {activeTab === 'mock' ? 'bg-white text-secondary shadow-xl' : 'text-white/40 hover:text-white'}"
			>
				Mock Exam
			</button>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
		
		<!-- Sidebar Config -->
		<div class="lg:col-span-4">
			<div class="glass rounded-3xl border-white/10 p-4 sm:p-6 lg:sticky lg:top-24 lg:p-8">
				<h2 class="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
					<div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
					Exam Setup
				</h2>

				<AcademicSelector
					institutionType={academicData.institutionType}
					faculty={academicData.faculty}
					department={academicData.department}
					level={academicData.level}
					course={academicData.course}
					topic={academicData.topic}
					onUpdate={applyAcademicUpdate}
				/>

				<div class="mt-6">
					<label for="exam-type" class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Exam / Practice Type</label>
					<select id="exam-type" bind:value={academicData.examType} class="form-select text-sm font-bold">
						{#each examTypeOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
					<p class="mt-2 text-[11px] leading-relaxed text-white/35">
						Questions are routed with this selection, then cached and randomized for scoring.
					</p>
				</div>

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
						<div>
							<label for="lab-difficulty" class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Difficulty</label>
							<select id="lab-difficulty" bind:value={labDifficulty} class="form-select text-sm font-bold">
								{#each difficultyOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
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
						<div>
							<label for="mock-difficulty" class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Difficulty</label>
							<select id="mock-difficulty" bind:value={mockDifficulty} class="form-select text-sm font-bold">
								{#each difficultyOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
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
								data-testid="sidebar-start-mock"
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
						<ExamScoreBar
							questions={labStats.total}
							correct={labStats.correct}
							wrong={labStats.wrong}
							score={labStats.score}
							streak={labStats.streak}
						/>
						<div class="flex justify-end">
							<span class="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest
								{saveState === 'saving' ? 'text-amber-300 bg-amber-500/10' : saveState === 'error' ? 'text-rose-300 bg-rose-500/10' : saveState === 'saved' ? 'text-lime-300 bg-lime-500/10' : 'text-white/35 bg-white/5'}">
								{saveState === 'saving' ? 'Syncing result...' : saveState === 'error' ? 'Sync retry needed' : saveState === 'saved' ? 'Live dashboard updated' : 'Ready'}
							</span>
						</div>
					{/if}

					{#if labQuestion}
						<div class="glass relative overflow-hidden rounded-3xl border-white/10 p-4 sm:p-6 md:p-10" in:fade>
							<div class="flex justify-between items-center mb-10">
								<span class="text-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 rounded-full">📝 Multiple Choice Questions</span>
								<span class="text-white/30 text-[10px] font-bold uppercase tabular-nums">Question {labStats.total}</span>
							</div>
							<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{labQuestion.question}</h3>
							<div class="space-y-4">
								{#each Object.entries(labQuestion.options) as [key, val]}
									<button 
										onclick={() => answerMCQ(key as OptionKey)}
										data-testid={`lab-option-${key}`}
										disabled={labAnswered}
										class="group flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all sm:items-center sm:gap-4 sm:p-6
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
										<span class="min-w-0 break-words text-sm font-medium text-white/80 sm:text-base">{val}</span>
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
						<div class="glass rounded-3xl border-white/10 p-4 sm:p-6 md:p-10" in:fade>
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
									onclick={revealTheoryAnswer}
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
						<div class="glass rounded-3xl border-white/10 p-5 text-center sm:p-8 md:p-12" in:fade>
							<div class="text-6xl mb-8">🎯</div>
							<h3 class="text-2xl font-black text-white uppercase tracking-tight mb-4">Mock Exam Details</h3>
							<p class="text-white/40 text-sm max-w-md mx-auto mb-10 leading-relaxed">
								Take a timed exam with <strong>{mockQCount}</strong> practice questions at <strong>{mockTimePerQ}s</strong> each.
								Get your WAEC grade, topic breakdown, and AI recommendations after you submit.
							</p>
							<div class="mx-auto mb-10 grid max-w-sm grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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
								data-testid="mock-config-start"
								class="w-full max-w-sm rounded-2xl bg-white px-5 py-5 font-black uppercase tracking-widest text-secondary shadow-2xl transition-all hover:scale-105"
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
							<div class="glass rounded-3xl border-white/10 p-4 sm:p-6 md:p-10" in:fade>
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
											onclick={() => handleAnswer(key as OptionKey)}
											data-testid={`mock-option-${key}`}
											disabled={answered}
											class="group flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all sm:items-center sm:gap-4 sm:p-6
												{mockAnswers[mockCurrentIdx] === key ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:border-white/10'}"
										>
											<div class="w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all
												{mockAnswers[mockCurrentIdx] === key ? 'bg-primary text-secondary' : 'bg-white/10 text-white/30 group-hover:bg-white/20'}">
												{key}
											</div>
											<span class="min-w-0 break-words text-sm font-medium text-white/80 sm:text-base">{val}</span>
										</button>
									{/each}
								</div>

								<div class="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
									<button 
										onclick={() => jumpToQuestion(mockCurrentIdx - 1)}
										disabled={mockCurrentIdx === 0}
										class="text-white/40 font-bold hover:text-white disabled:opacity-0 transition-all"
									>← Back</button>
									<div class="grid grid-cols-2 gap-3 sm:flex">
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
						<div class="glass relative overflow-hidden rounded-3xl border-white/10 p-5 text-center sm:p-8 md:p-12" in:fade>
							<div class="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Exam Result</div>
							<div class="text-7xl font-black italic italic-shadow leading-none mb-2 sm:text-9xl" style="color:{gradeInfo.color};">{mockResult.grade}</div>
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
