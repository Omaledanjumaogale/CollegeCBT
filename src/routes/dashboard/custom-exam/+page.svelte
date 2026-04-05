<script lang="ts">
	import { currentUser, isPro, showToast } from '$lib/stores';
	import AcademicSelector from '$lib/components/AcademicSelector.svelte';
	import { fade, slide } from 'svelte/transition';

	// ── State ─────────────────────────────────────────────────────────────────
	type Phase = 'config' | 'generating' | 'exam' | 'grading' | 'results';
	let phase = $state<Phase>('config');
	let academicData = $state({
		institutionType: 'University',
		faculty: '',
		department: '',
		level: '',
		course: '',
		topic: ''
	});
	let numQuestions = $state(10);
	let qType = $state<'MCQ' | 'Theory' | 'Mixed'>('MCQ');

	// Real-time questions
	type MCQ = { question: string; options: string[]; answer: string; explanation?: string; topic?: string };
	type Theory = { question: string; model_answer: string; key_points: { point: string; marks: number }[]; topic?: string };
	let questions = $state<(MCQ | Theory)[]>([]);
	let answers = $state<(string | number)[]>([]); // User selected MCQ index or written answer
	let theoryAnswers = $state<string[]>([]);
	let gradedResults = $state<any[]>([]); // AI grading for theory
	let score = $state(0);
	let generatingMsg = $state('');
	let error = $state('');

	// Timer
	let startTime = $state(0);
	let endTime = $state(0);

	// Derived
	let userPlan = $derived($currentUser?.plan ?? 'free');
	let canUseTheory = $derived($isPro);

	// ── Config validation ──────────────────────────────────────────────────────
	function validateConfig(): string | null {
		if (!academicData.course) return 'Please select or input a course/subject.';
		if (!academicData.institutionType) return 'Please select your institution type.';
		if (!academicData.level) return 'Please select your level.';
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
						course: academicData.course,
						level: academicData.level,
						institutionType: academicData.institutionType,
						topic: academicData.topic || undefined,
						type: t,
						uid: $currentUser?.uid,
					}),
				});
				const data = await res.json();
				if (data.error) throw new Error(data.error);

				questions = [...questions, data.question];
				answers = [...answers, -1]; // MCQ placeholder
				theoryAnswers = [...theoryAnswers, '']; // Theory placeholder
			} catch (e: any) {
				error = `Failed at question ${i + 1}: ${e.message}`;
				phase = 'config';
				return;
			}
		}

		startTime = Date.now();
		phase = 'exam';
	}

	// ── Exam logic ────────────────────────────────────────────────────────────
	let currentQIdx = $state(0);
	let currentQ = $derived(questions[currentQIdx]);

	function setAnswer(val: string | number) {
		answers[currentQIdx] = val;
	}

	// ── Grading ───────────────────────────────────────────────────────────────
	async function submitExam() {
		endTime = Date.now();
		phase = 'grading';
		
		let mcqScore = 0;
		let mcqTotal = 0;
		
		const mcqIndices: number[] = [];
		const theoryQs: { q: Theory; i: number }[] = [];

		questions.forEach((q, i) => {
			if ('options' in q) {
				mcqTotal++;
				if (q.options[answers[i] as number] === q.answer) {
					mcqScore++;
				}
				mcqIndices.push(i);
			} else {
				theoryQs.push({ q: q as Theory, i });
			}
		});

		// Grade theory via AI
		const answersPayload = theoryQs.map(({ q, i }) => {
			return {
				question: q.question,
				keyPoints: q.key_points,
				modelAnswer: q.model_answer,
				userAnswer: theoryAnswers[i] || '',
				maxMarks: q.key_points.reduce((s, kp) => s + kp.marks, 0),
				topic: q.topic,
			};
		});

		if (theoryQs.length > 0) {
			try {
				const res = await fetch('/api/grade-exam', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						course: academicData.course,
						level: academicData.level,
						institutionType: academicData.institutionType,
						uid: $currentUser?.uid,
						answers: answersPayload,
					}),
				});
				const data = await res.json();
				gradedResults = data.evaluations || [];
			} catch (e) {
				console.error('Theory grading failed:', e);
				gradedResults = theoryQs.map(() => ({ score: 0, feedback: 'Grading failed.' }));
			}
		}

		// Calculate total
		const theoryScore = gradedResults.reduce((s, r) => s + (r.score || 0), 0);
		const theoryTotal = theoryQs.reduce((s, { q }) => s + q.key_points.reduce((ks, kp) => ks + kp.marks, 0), 0);
		
		score = mcqTotal + theoryTotal > 0 
			? ((mcqScore + theoryScore) / (mcqTotal + theoryTotal)) * 100 
			: 0;

		phase = 'results';
	}
</script>

<div class="max-w-5xl mx-auto px-4 py-10 lg:py-16">
	<!-- Header -->
	<div class="mb-12 text-center">
		<h1 class="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase italic italic-shadow">
			AI Exam <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LAB</span>
		</h1>
		<p class="text-white/50 text-sm md:text-base max-w-2xl mx-auto">
			Generate professional-grade exams tailored to your specific curriculum. 
			Powered by AI, verified by the academic database.
		</p>
	</div>

	{#if phase === 'config'}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8" in:fade>
			<!-- Configuration Panel -->
			<div class="lg:col-span-12">
				<div class="glass p-6 md:p-10 border-white/10 rounded-3xl relative overflow-hidden backdrop-blur-xl">
					<div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
						<svg class="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
					</div>

					<div class="relative">
						<h2 class="text-xl font-bold text-white mb-8 flex items-center gap-3">
							<span class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm">01</span>
							Set Exam Context
						</h2>

						{#if error}
							<div class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3" transition:slide>
								<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
								{error}
							</div>
						{/if}

						<!-- Academic Selector component -->
						<AcademicSelector
							bind:institutionType={academicData.institutionType}
							bind:faculty={academicData.faculty}
							bind:department={academicData.department}
							bind:level={academicData.level}
							bind:course={academicData.course}
							bind:topic={academicData.topic}
							onUpdate={(data) => { academicData = data; }}
						/>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
							<div class="space-y-4">
								<h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">Question count</h3>
								<div class="flex items-center gap-4">
									<input type="range" min="1" max={userPlan === 'pro' ? 20 : 10} bind:value={numQuestions} class="flex-1 accent-primary" />
									<span class="text-xl font-black text-white w-8">{numQuestions}</span>
								</div>
								<p class="text-[10px] text-white/30 italic">Free users: 10 max | Pro: 20 max</p>
							</div>

							<div class="space-y-4">
								<h3 class="text-xs font-bold text-white/40 uppercase tracking-widest">Question format</h3>
								<div class="flex gap-2">
									{#each ['MCQ', 'Theory', 'Mixed'] as type}
										<button 
											class="flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all border {qType === type ? 'bg-primary border-primary text-secondary' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}"
											onclick={() => qType = type as any}
										>
											{type}
										</button>
									{/each}
								</div>
								{#if qType !== 'MCQ' && !canUseTheory}
									<p class="text-[10px] text-accent font-medium mt-1">Theory grading requires Student Pro plan.</p>
								{/if}
							</div>
						</div>

						<button 
							class="w-full mt-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-secondary font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 group"
							onclick={generateAll}
						>
							Start Intelligence Scan
							<svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
						</button>
					</div>
				</div>
			</div>
		</div>

	{:else if phase === 'generating'}
		<div class="flex flex-col items-center justify-center py-20 text-center" in:fade>
			<div class="relative mb-12">
				<div class="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
				<div class="absolute inset-0 flex items-center justify-center">
					<svg class="w-12 h-12 text-primary animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
				</div>
			</div>
			<p class="text-2xl font-black text-white mb-4 tracking-tight uppercase italic">{generatingMsg}</p>
			<p class="text-white/40 text-sm max-w-md mx-auto">AI is synthesizing academic content and cross-referencing with the national curriculum...</p>
		</div>

	{:else if phase === 'exam'}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8" in:fade>
			<!-- Exam HUD -->
			<div class="lg:col-span-4 space-y-6">
				<div class="glass p-6 rounded-3xl border-white/10 sticky top-24">
					<div class="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Exam Progress</div>
					<div class="text-3xl font-black text-white mb-6 tabular-nums">
						{Math.round((currentQIdx / questions.length) * 100)}%
					</div>
					
					<div class="grid grid-cols-5 gap-2 mb-8">
						{#each questions as _, i}
							<button 
								class="aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all {i === currentQIdx ? 'bg-primary text-secondary' : answers[i] !== -1 && (theoryAnswers[i] !== '' || 'options' in questions[i]) ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'}"
								onclick={() => currentQIdx = i}
							>
								{i + 1}
							</button>
						{/each}
					</div>

					<button 
						class="w-full py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2 group"
						onclick={submitExam}
					>
						Complete Exam
						<svg class="w-5 h-5 group-hover:scale-110 transition-transform text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
					</button>
				</div>
			</div>

			<!-- Question Content -->
			<div class="lg:col-span-8">
				<div class="glass p-8 md:p-12 rounded-[40px] border-white/10 relative overflow-hidden min-h-[500px]">
					<div class="flex justify-between items-start mb-10">
						<div>
							<div class="text-primary text-[10px] font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-primary/10 w-fit">
								Question {currentQIdx + 1} of {questions.length}
							</div>
							<div class="text-white/40 text-[10px] font-bold uppercase tracking-widest">
								{academicData.course}
							</div>
						</div>
						<div class="text-accent text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-accent/10">
							{'options' in currentQ ? 'Objective' : 'Theory'}
						</div>
					</div>

					<h3 class="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed">
						{currentQ.question}
					</h3>

					{#if 'options' in currentQ}
						<div class="space-y-4">
							{#each currentQ.options as opt, idx}
								<button 
									class="w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group {answers[currentQIdx] === idx ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:border-white/20'}"
									onclick={() => setAnswer(idx)}
								>
									<div class="w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors {answers[currentQIdx] === idx ? 'bg-primary text-secondary' : 'bg-white/10 text-white/50 group-hover:bg-white/20'}">
										{String.fromCharCode(65 + idx)}
									</div>
									<span class="text-white/80 font-medium">{opt}</span>
								</button>
							{/each}
						</div>
					{:else}
						<div class="space-y-4">
							<div class="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Write your answer below</div>
							<textarea 
								bind:value={theoryAnswers[currentQIdx]}
								class="w-full h-64 p-6 rounded-3xl bg-white/5 border-2 border-white/5 focus:border-primary transition-all text-white/90 placeholder:text-white/10 resize-none font-serif text-lg leading-relaxed"
								placeholder="Begin writing your detailed response here..."
							></textarea>
							<div class="text-right text-[10px] font-medium text-white/20 italic">Grading will focus on key thematic points and accuracy.</div>
						</div>
					{/if}

					<div class="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
						<button 
							class="px-6 py-3 rounded-xl text-white/40 font-bold hover:text-white disabled:opacity-0 transition-colors"
							disabled={currentQIdx === 0}
							onclick={() => currentQIdx--}
						>
							← Previous
						</button>
						<button 
							class="px-10 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/10"
							onclick={() => currentQIdx < questions.length - 1 ? currentQIdx++ : submitExam()}
						>
							{currentQIdx < questions.length - 1 ? 'Next Question →' : 'Submit Exam'}
						</button>
					</div>
				</div>
			</div>
		</div>

	{:else if phase === 'grading'}
		<div class="flex flex-col items-center justify-center py-32 text-center" in:fade>
			<div class="relative mb-12">
				<div class="w-32 h-32 rounded-full border-4 border-accent/20 border-t-accent animate-spin"></div>
			</div>
			<h2 class="text-3xl font-black text-white mb-4 tracking-tight uppercase italic">Auditing Performance...</h2>
			<p class="text-white/40 text-sm max-w-md mx-auto">AI is evaluating your responses against academic standards and awarding marks based on precision.</p>
		</div>

	{:else if phase === 'results'}
		<div class="max-w-4xl mx-auto" in:fade>
			<!-- Result Card -->
			<div class="glass p-12 rounded-[50px] border-white/10 relative overflow-hidden text-center mb-8">
				<div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary animate-pulse"></div>
				
				<div class="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6">Aggregate Performance</div>
				<div class="text-8xl md:text-[10rem] font-black leading-none mb-10 bg-gradient-to-br from-white to-white/20 bg-clip-text text-transparent italic flex items-center justify-center">
					{Math.round(score)}<span class="text-4xl md:text-6xl text-primary mt-10">%</span>
				</div>

				<div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
					<div class="p-6 rounded-3xl bg-white/5 border border-white/10">
						<div class="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Time Elapsed</div>
						<div class="text-xl font-black text-white">{Math.floor((endTime - startTime) / 60000)}m {Math.floor(((endTime - startTime) % 60000) / 1000)}s</div>
					</div>
					<div class="p-6 rounded-3xl bg-white/5 border border-white/10">
						<div class="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Status</div>
						<div class="text-xl font-black {score >= 50 ? 'text-green-400' : 'text-red-400'} uppercase">{score >= 50 ? 'Passed' : 'Failed'}</div>
					</div>
				</div>
			</div>

			<!-- Review Sections -->
			<div class="space-y-6">
				<h3 class="text-xl font-bold text-white pl-4 flex items-center gap-3">
					<svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
					Expert Feedback
				</h3>

				{#each questions as q, i}
					<div class="glass p-8 rounded-3xl border-white/10">
						<div class="flex justify-between items-start mb-6">
							<div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black text-white">{i + 1}</div>
							{#if 'options' in q}
								{#if q.options[answers[i] as number] === q.answer}
									<span class="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-400/10 px-3 py-1 rounded-full">Correct</span>
								{:else}
									<span class="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-3 py-1 rounded-full">Incorrect</span>
								{/if}
							{:else}
								{@const grading = gradedResults.find((_, ri) => ri === questions.slice(0, i).filter(sq => !('options' in sq)).length)}
								<span class="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
									{grading?.score}/{q.key_points.reduce((s, kp) => s + kp.marks, 0)} Marks
								</span>
							{/if}
						</div>

						<p class="text-lg text-white font-medium mb-6">{q.question}</p>

						{#if 'options' in q}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
								{#each q.options as opt, idx}
									<div class="p-4 rounded-2xl text-sm {opt === q.answer ? 'bg-green-500/10 border border-green-500/30 text-green-400' : idx === answers[i] ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-white/5 text-white/40'}">
										{opt}
									</div>
								{/each}
							</div>
							{#if q.explanation}
								<div class="p-6 rounded-2xl bg-white/5 border-l-4 border-primary">
									<div class="text-[10px] font-black text-primary uppercase tracking-widest mb-2 text-shadow-sm">Rationale</div>
									<p class="text-sm text-white/70 leading-relaxed italic">{q.explanation}</p>
								</div>
							{/if}
						{:else}
							{@const grading = gradedResults.find((_, ri) => ri === questions.slice(0, i).filter(sq => !('options' in sq)).length)}
							<div class="space-y-4">
								<div class="p-6 rounded-2xl bg-white/5">
									<div class="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Your Answer</div>
									<p class="text-sm text-white/60 leading-relaxed font-serif italic">{theoryAnswers[i]}</p>
								</div>
								{#if grading}
									<div class="p-6 rounded-2xl bg-primary/5 border-l-4 border-primary">
										<div class="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Evaluator Note</div>
										<p class="text-sm text-white/80 leading-relaxed italic">{grading.feedback}</p>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<button 
				class="w-full mt-12 py-5 rounded-3xl bg-primary text-secondary font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
				onclick={() => { phase = 'config'; questions = []; currentQIdx = 0; }}
			>
				New Simulation
			</button>
		</div>
	{/if}
</div>

<style>
	.glass {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.italic-shadow {
		text-shadow: 4px 4px 0 rgba(139, 92, 246, 0.2);
	}
</style>
