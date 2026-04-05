<script lang="ts">
	import { onMount } from 'svelte';
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
	type MCQ = { question: string; options: any; answer: string; explanation?: string; topic?: string; examiner_note?: string };
	type Theory = { question: string; model_answer: string; key_points: any[]; topic?: string; examiner_notes?: string };
	
	let labQuestion = $state<MCQ | null>(null);
	let labTheory = $state<Theory | null>(null);
	let labLoading = $state(false);
	let labQtype = $state<'MCQ' | 'Theory'>('MCQ');
	let labAnswered = $state(false);
	let selectedOption = $state<string | null>(null);
	let userTheoryAnswer = $state('');
	let theoryRevealed = $state(false);
	
	let labStats = $state({ total: 0, correct: 0, score: 0 });

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

			if (labQtype === 'MCQ') labQuestion = data.question;
			else labTheory = data.question;
			
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
		if (key === labQuestion.answer) {
			labStats.correct++;
			labStats.score += 2;
			showToast('✅ Correct!', '+2 points added', 'success');
		} else {
			showToast('❌ Incorrect', `Correct was ${labQuestion.answer}`, 'error');
		}
	}

	// ── MOCK STATE ──
	type MockPhase = 'config' | 'generating' | 'active' | 'results';
	let mockPhase = $state<MockPhase>('config');
	let mockQuestions = $state<(MCQ | Theory)[]>([]);
	let mockAnswers = $state<any[]>([]);
	let mockTheoryAnswers = $state<string[]>([]);
	let mockCurrentIdx = $state(0);
	let mockQCount = $state(10);
	let mockResult = $state({ score: 0, pct: 0, grade: 'F' });

	async function startMock() {
		if (!academicData.course) {
			showToast('⚠️ Course Required', 'Please select a course first.', 'error');
			return;
		}
		mockPhase = 'generating';
		mockQuestions = [];
		mockAnswers = [];
		mockTheoryAnswers = [];
		mockCurrentIdx = 0;

		try {
			for (let i = 0; i < mockQCount; i++) {
				const type = i % 2 === 0 ? 'MCQ' : 'MCQ'; // For mock we prioritize MCQs for now, or mix
				const res = await fetch('/api/generate-question', {
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
				});
				const data = await res.json();
				mockQuestions = [...mockQuestions, data.question];
				mockAnswers = [...mockAnswers, null];
			}
			mockPhase = 'active';
		} catch (err: any) {
			showToast('❌ Mock Error', err.message, 'error');
			mockPhase = 'config';
		}
	}

	function finishMock() {
		let correct = 0;
		mockQuestions.forEach((q, i) => {
			if ('options' in q && mockAnswers[i] === q.answer) correct++;
		});
		const pct = (correct / mockQuestions.length) * 100;
		let grade = 'F9';
		if (pct >= 75) grade = 'A1';
		else if (pct >= 70) grade = 'B2';
		else if (pct >= 65) grade = 'B3';
		else if (pct >= 60) grade = 'C4';
		else if (pct >= 55) grade = 'C5';
		else if (pct >= 50) grade = 'C6';
		else if (pct >= 45) grade = 'D7';
		else if (pct >= 40) grade = 'E8';

		mockResult = { score: correct, pct, grade };
		mockPhase = 'results';
	}

	onMount(() => {
		const p = $page.url.searchParams;
		const course = p.get('course');
		if (course) {
			academicData.course = course;
			showToast('📚 Course Pre-loaded', course);
		}
	});
</script>

<div class="max-w-6xl mx-auto px-4 py-12 lg:py-20">
	<!-- Dynamic Header -->
	<div class="text-center mb-12">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
			</span>
			Neural Intelligence Practice
		</div>
		<h1 class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic italic-shadow">
			{activeTab === 'lab' ? 'Exam' : 'Mock'} <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{activeTab === 'lab' ? 'Lab' : 'Simulation'}</span>
		</h1>
		<div class="flex items-center justify-center gap-4 mt-8">
			<button 
				onclick={() => activeTab = 'lab'}
				class="px-8 py-3 rounded-2xl font-bold text-sm transition-all {activeTab === 'lab' ? 'bg-white text-secondary shadow-xl' : 'text-white/40 hover:text-white'}"
			>
				AI Training Lab
			</button>
			<button 
				onclick={() => { activeTab = 'mock'; mockPhase = 'config'; }}
				class="px-8 py-3 rounded-2xl font-bold text-sm transition-all {activeTab === 'mock' ? 'bg-white text-secondary shadow-xl' : 'text-white/40 hover:text-white'}"
			>
				Standard Mock
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
					Configuration
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
							<label class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Question Format</label>
							<div class="grid grid-cols-2 gap-2">
								<button 
									onclick={() => labQtype = 'MCQ'}
									class="py-3 rounded-xl text-xs font-bold transition-all {labQtype === 'MCQ' ? 'bg-primary text-secondary' : 'bg-white/5 text-white/40 border border-white/5'}"
								>Objective</button>
								<button 
									onclick={() => labQtype = 'Theory'}
									class="py-3 rounded-xl text-xs font-bold transition-all {labQtype === 'Theory' ? 'bg-primary text-secondary' : 'bg-white/5 text-white/40 border border-white/5'}"
								>Theory</button>
							</div>
						</div>
						<button 
							onclick={generateLabQuestion}
							disabled={labLoading}
							class="w-full py-5 rounded-2xl bg-white text-secondary font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
						>
							{#if labLoading}
								<div class="w-5 h-5 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
								Scanning...
							{:else}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
								Generate
							{/if}
						</button>
					</div>
				{:else}
					<div class="mt-8 pt-8 border-t border-white/5 space-y-6">
						<div>
							<label class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-4">Exam Size</label>
							<select bind:value={mockQCount} class="form-select text-sm font-bold">
								<option value={10}>10 Questions</option>
								<option value={20}>20 Questions</option>
								<option value={30}>30 Questions</option>
								<option value={50}>50 Questions (Full)</option>
							</select>
						</div>
						<button 
							onclick={startMock}
							class="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-secondary font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
						>
							Start Simulation
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
					{#if labQuestion}
						<div class="glass p-8 md:p-12 rounded-[40px] border-white/10 relative overflow-hidden" in:fade>
							<div class="flex justify-between items-center mb-10">
								<span class="text-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 rounded-full">Objective Training</span>
								<span class="text-white/30 text-[10px] font-bold uppercase tabular-nums">Session Q#{labStats.total}</span>
							</div>
							<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{labQuestion.question}</h3>
							<div class="space-y-4">
								{#each Object.entries(labQuestion.options) as [key, val]}
									<button 
										onclick={() => answerMCQ(key)}
										disabled={labAnswered}
										class="w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group 
											{labAnswered && key === labQuestion.answer ? 'bg-green-500/20 border-green-500/40 text-green-400' : 
											labAnswered && selectedOption === key ? 'bg-red-500/20 border-red-500/40 text-red-400' : 
											'bg-white/5 border-white/5 hover:border-white/10'}"
									>
										<div class="w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all
											{labAnswered && key === labQuestion.answer ? 'bg-green-500 text-secondary' : 
											labAnswered && selectedOption === key ? 'bg-red-500 text-white' : 
											'bg-white/10 text-white/30 group-hover:bg-white/20'}">
											{key}
										</div>
										<span class="text-white/80 font-medium">{val}</span>
									</button>
								{/each}
							</div>

							{#if labAnswered}
								<div class="mt-10 p-8 rounded-3xl bg-white/5 border border-white/10" in:slide>
									<div class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Technical Explanation</div>
									<p class="text-sm text-white/60 leading-relaxed italic">{labQuestion.explanation}</p>
									{#if labQuestion.examiner_note}
										<div class="mt-6 flex gap-4 items-start p-4 bg-primary/5 rounded-2xl border border-primary/10">
											<span class="text-xl">💡</span>
											<p class="text-xs text-primary/80 leading-relaxed"><strong>Expert Tip:</strong> {labQuestion.examiner_note}</p>
										</div>
									{/if}
									<button 
										onclick={generateLabQuestion}
										class="mt-8 px-8 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all"
									>
										Next Question →
									</button>
								</div>
							{/if}
						</div>
					{:else if labTheory}
						<div class="glass p-8 md:p-12 rounded-[40px] border-white/10" in:fade>
							<div class="flex justify-between items-center mb-10">
								<span class="text-accent text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-accent/10 rounded-full">Theory Training</span>
							</div>
							<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{labTheory.question}</h3>
							
							<textarea 
								bind:value={userTheoryAnswer}
								placeholder="Draft your response here for self-evaluation..."
								class="w-full h-48 p-6 rounded-3xl bg-white/5 border border-white/10 text-white/80 focus:border-accent transition-all resize-none font-serif italic mb-6"
							></textarea>

							{#if !theoryRevealed}
								<button 
									onclick={() => theoryRevealed = true}
									class="w-full py-4 rounded-2xl bg-accent text-secondary font-black uppercase tracking-widest"
								>Reveal Solution Pattern</button>
							{:else}
								<div class="space-y-6" in:slide>
									<div class="p-8 rounded-3xl bg-white/5 border border-white/10">
										<div class="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4">Ideal Model Answer</div>
										<p class="text-sm text-white/70 leading-relaxed font-serif italic mb-8">{labTheory.model_answer}</p>
										
										<div class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Grading Rubric</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
											{#each labTheory.key_points as kp}
												<div class="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
													<span class="text-xs text-white/60">{kp.point}</span>
													<span class="text-[10px] font-black text-accent">+{kp.marks}m</span>
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
							<h3 class="text-xl font-bold text-white mb-2">Neural Link Ready</h3>
							<p class="text-white/30 text-sm max-w-xs mx-auto italic">Synchronized with the Nigerian National Curriculum. Ready to synthesize practice exercises.</p>
						</div>
					{/if}
				</div>
			{:else}
				<!-- MOCK VIEW -->
				<div class="space-y-6">
					{#if mockPhase === 'config'}
						<div class="glass p-12 rounded-[48px] border-white/10 text-center" in:fade>
							<div class="text-6xl mb-8">🎯</div>
							<h3 class="text-2xl font-black text-white uppercase tracking-tight mb-4">Exam Mode Details</h3>
							<p class="text-white/40 text-sm max-w-md mx-auto mb-10 leading-relaxed">
								Standardized simulations track your accuracy across {mockQCount} curated questions. 
								AI will provide a deep analysis of your performance profile after submission.
							</p>
							<div class="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-10">
								<div class="p-4 rounded-2xl bg-white/5">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Time</div>
									<div class="text-sm font-black text-white">45m</div>
								</div>
								<div class="p-4 rounded-2xl bg-white/5">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Pass</div>
									<div class="text-sm font-black text-white">50%</div>
								</div>
								<div class="p-4 rounded-2xl bg-white/5">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Marks</div>
									<div class="text-sm font-black text-white">20</div>
								</div>
							</div>
							<button 
								onclick={startMock}
								class="px-12 py-5 rounded-2xl bg-white text-secondary font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
							>Initialize Simulation</button>
						</div>
					{:else if mockPhase === 'generating'}
						<div class="flex flex-col items-center justify-center py-32 text-center" in:fade>
							<div class="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
							<h3 class="text-xl font-black text-white uppercase italic mb-2 tracking-tighter">Synthesizing Exam Bank</h3>
							<p class="text-white/30 text-xs">Curating {mockQCount} high-probability questions for {academicData.course}...</p>
						</div>
					{:else if mockPhase === 'active'}
						{@const q = mockQuestions[mockCurrentIdx]}
						<div class="glass p-8 md:p-12 rounded-[40px] border-white/10" in:fade>
							<div class="flex justify-between items-center mb-10">
								<span class="text-white/30 text-[10px] font-black uppercase tracking-widest tabular-nums">Q {mockCurrentIdx + 1} OF {mockQCount}</span>
								<div class="flex gap-1">
									{#each mockQuestions as _, i}
										<div class="w-4 h-1 rounded-full {i <= mockCurrentIdx ? 'bg-primary' : 'bg-white/5'}"></div>
									{/each}
								</div>
							</div>

							{#if 'options' in q}
								<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">{q.question}</h3>
								<div class="space-y-4">
									{#each Object.entries(q.options) as [key, val]}
										<button 
											onclick={() => { mockAnswers[mockCurrentIdx] = key; if (mockCurrentIdx < mockQCount - 1) mockCurrentIdx++; else finishMock(); }}
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
							{/if}

							<div class="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
								<button 
									onclick={() => mockCurrentIdx--}
									disabled={mockCurrentIdx === 0}
									class="text-white/40 font-bold hover:text-white disabled:opacity-0 transition-all"
								>← BACK</button>
								<button 
									onclick={() => mockCurrentIdx < mockQCount - 1 ? mockCurrentIdx++ : finishMock()}
									class="px-8 py-3 rounded-xl bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10 transition-all"
								>{mockCurrentIdx === mockQCount - 1 ? 'FINISH SIMULATION' : 'SKIP QUESTION'}</button>
							</div>
						</div>
					{:else if mockPhase === 'results'}
						<div class="glass p-12 rounded-[50px] border-white/10 text-center relative overflow-hidden" in:fade>
							<div class="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Simulation Outcome</div>
							<div class="text-9xl font-black italic italic-shadow text-white leading-none mb-4">{mockResult.grade}</div>
							<div class="text-3xl font-black text-primary mb-12 tabular-nums">{mockResult.pct}%</div>
							
							<div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-12">
								<div class="p-6 rounded-3xl bg-white/5 border border-white/10">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Accuracy</div>
									<div class="text-xl font-black text-white">{mockResult.score}/{mockQCount}</div>
								</div>
								<div class="p-6 rounded-3xl bg-white/5 border border-white/10">
									<div class="text-[10px] font-bold text-white/30 uppercase mb-1">Rank</div>
									<div class="text-xl font-black text-accent">TOP 5%</div>
								</div>
							</div>

							<button 
								onclick={() => { mockPhase = 'config'; activeTab = 'lab'; }}
								class="w-full py-5 rounded-2xl bg-white text-secondary font-black uppercase tracking-widest shadow-2xl"
							>Return to Training Lab</button>
						</div>
					{/if}
				</div>
			{/if}
		</div>

	</div>
</div>

<style>
	.glass {
		background: rgba(10, 10, 10, 0.4);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.italic-shadow {
		text-shadow: 6px 6px 0 rgba(139, 92, 246, 0.15);
	}
	.form-select {
		@apply w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary transition-all outline-none appearance-none;
	}
</style>
