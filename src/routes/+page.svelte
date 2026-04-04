<script lang="ts">
	import { activeModal, showToast } from '$lib/stores';
	import { COURSES, PLATFORM_STATS, INSTITUTION_TYPES, type InstitutionType } from '$lib/data/courseData';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import CurriculumBrowser from '$lib/components/CurriculumBrowser.svelte';

	// ── Interactive Demo (Hero MCQ Card) ─────────────────
	let counters = { institutions: 0, questions: 0, students: 0, passRate: 0 };
	let hasAnimated = false;

	function animateCounters() {
		if (hasAnimated) return;
		hasAnimated = true;
		const targets = { institutions: 550, questions: 250, students: 12, passRate: 89 };
		const duration = 1800;
		const start = performance.now();
		function step(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const ease = 1 - Math.pow(1 - progress, 3);
			counters = {
				institutions: Math.floor(targets.institutions * ease),
				questions: Math.floor(targets.questions * ease),
				students: Math.floor(targets.students * ease),
				passRate: Math.floor(targets.passRate * ease)
			};
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	// ── Problem Cards ───────────────────────────────────
	const problems = [
		{ icon: '📚', title: 'No Practice Questions', desc: 'Old question books are outdated, incomplete, and expensive. Students have no way to practise on-demand for their specific course and level.' },
		{ icon: '🤯', title: 'No Explanations — Just Answers', desc: 'Even when students find questions, they get bare answers with no explanation of why the correct choice is right or why each wrong option fails.' },
		{ icon: '📉', title: 'No Real Performance Feedback', desc: "Students don't know where they stand. No grade predictions, no readiness scores, no insight into weak topics before the real exam." }
	];

	// ── Features ─────────────────────────────────────────
	const features = [
		{ icon: '🤖', title: 'AI Question Bank', desc: 'Unlimited, fresh, randomized questions generated on-demand by Claude AI for any topic, course, or level across all Nigerian higher institutions. Never repeat a question.', color: '#7c3aed', tag: 'Powered by Claude' },
		{ icon: '⏱️', title: 'Mock Exam Engine', desc: 'Timed countdown (90s/question), auto-submit, WAEC-style grading (A1–F9). Full exam simulation with performance report and topic heatmap at the end.', color: '#84cc16', tag: 'A1–F9 Grading' },
		{ icon: '📊', title: 'Results Intelligence', desc: 'AI Readiness Score (0–100), grade prediction, topic-level heatmaps, national benchmarking, and downloadable performance certificates.', color: '#f59e0b', tag: 'RaaS Core' },
		{ icon: '🎯', title: 'Distractor Analysis', desc: 'Every wrong option explained — understand exactly why your answer was wrong and the specific misconception behind each distractor. Deep learning, not memorisation.', color: '#22d3ee', tag: 'Deep Learning' },
		{ icon: '🏛️', title: '550+ Institutions', desc: 'Universities (NUC), Polytechnics (NBTE), Colleges of Education (NCCE), and IEIs. Every level, every course — 100L through Postgraduate.', color: '#a855f7', tag: '309+ Universities' },
		{ icon: '📝', title: 'Theory Questions', desc: 'Essay questions with AI-generated model answers, mark schemes, key points with marks allocation, and examiner notes — exactly as your lecturers expect.', color: '#e11d48', tag: 'Mark Schemes' }
	];

	// ── How It Works ─────────────────────────────────────
	const steps = [
		{ step: '01', icon: '🎓', title: 'Select Your Course', desc: 'Choose your institution type, course, level, and difficulty. CollegeCBT supports 550+ institutions from 100 Level to Postgraduate.' },
		{ step: '02', icon: '🤖', title: 'Generate & Practise', desc: 'Claude AI generates contextual, curriculum-aligned questions with full distractor explanations instantly. Never the same question twice.' },
		{ step: '03', icon: '⏱️', title: 'Take a Mock Exam', desc: 'Run a timed mock exam with 90 seconds per question. Auto-submit. Get your WAEC grade (A1–F9) and full examiner feedback.' },
		{ step: '04', icon: '📈', title: 'Track Your Score', desc: 'Review your AI Readiness Score, grade prediction, topic heatmap, and personalised study recommendations — updated after every session.' }
	];

	// ── Testimonials ─────────────────────────────────────
	const testimonials = [
		{ quote: "I failed DBMS in 200L. After 3 weeks with CollegeCBT's Exam Lab and Mock Exams, I scored 79% in my 300L resit. The distractor explanations are what made the difference.", name: 'Emeka Okonkwo', meta: 'Computer Science · 300L · UNN', grade: '🏆 A1 — 79% in DBMS', emoji: '👨🏾‍🎓', color: 'rgba(124,58,237,0.2)' },
		{ quote: 'As a pharmacy student at UNILAG, finding relevant practice questions was nearly impossible. CollegeCBT generated questions specific to Pharmacology at exactly my level. I went from 58% to 81%.', name: 'Fatima Abdullahi', meta: 'Pharmacy · 400L · UNILAG', grade: '🏆 A1 — 81% in Pharmacology', emoji: '👩🏽‍⚕️', color: 'rgba(132,204,22,0.15)' },
		{ quote: "I'm a HND Accountancy student at Yaba Tech and CollegeCBT is the first platform that actually has our level and courses. The mock exam timer prepared me mentally. I went from C4 to B2.", name: 'Chidi Nwosu', meta: 'Accountancy HND · Yaba Tech', grade: '📈 C4 → B2 improvement', emoji: '👨🏿‍💼', color: 'rgba(245,158,11,0.15)' }
	];

	// ── FAQ ───────────────────────────────────────────────
	let openFaq = -1;
	const faqs = [
		{ q: 'How does the AI generate relevant exam questions for my specific course?', a: "CollegeCBT uses Anthropic's Claude AI trained on vast academic literature. When you select your institution, course, level and topic, Claude generates fresh, contextual questions aligned with NUC, NBTE, or NCCE curriculum — never repeated." },
		{ q: 'Is CollegeCBT suitable for all Nigerian higher institutions?', a: "Yes. All 309+ accredited universities (NUC), 78+ polytechnics (NBTE), 163+ Colleges of Education (NCCE), and IEIs are covered — 100 Level through Postgraduate and HND." },
		{ q: 'What is the difference between Exam Lab and Mock Exam?', a: "Exam Lab is open-ended practice — one question at a time, explanation shown immediately. Mock Exam simulates real exam conditions: 90 seconds per question, auto-submitted on timeout, WAEC grading (A1–F9), full performance report." },
		{ q: 'How does payment work? Can I pay in Naira?', a: "Yes — all pricing is in Nigerian Naira (₦). We support Verve, Mastercard, Visa, bank transfer, USSD, and POS via Flutterwave. No dollar card needed. The Free plan needs no payment at all." },
		{ q: 'What is the AI Readiness Score and how is it calculated?', a: "The AI Readiness Score (0–100) is a composite of your correct-answer rate, study streak, timed vs untimed performance, and topic coverage breadth. A score of 75+ indicates exam readiness. It updates after every session." },
		{ q: 'What is "Results as a Service" (RaaS)?', a: "RaaS means we measure our success by your exam score. CollegeCBT tracks your grade trajectory, predicts readiness, and provides targeted practice until you hit 75%. Pro students who complete 30+ mock exams and don't achieve 75% get a free semester extension." }
	];

	// ── Interactive Demo (Hero MCQ Card) ─────────────────
	let demoAnswered = false;
	let demoCorrect = false;
	let demoSelected = '';
	let demoTimer = 90;
	let demoInterval: ReturnType<typeof setInterval> | null = null;

	const demoQ = {
		text: 'Which OSI layer does a router primarily operate at?',
		options: [
			{ key: 'A', text: 'Data Link Layer (Layer 2)', correct: false },
			{ key: 'B', text: 'Network Layer (Layer 3)', correct: true },
			{ key: 'C', text: 'Transport Layer (Layer 4)', correct: false },
			{ key: 'D', text: 'Physical Layer (Layer 1)', correct: false }
		],
		explanation: '✅ B is correct. Routers operate at Layer 3 (Network Layer), reading IP addresses to forward packets. ❌ A (Data Link) handles MAC addresses — that\'s switches. ❌ C (Transport) handles TCP/UDP ports. ❌ D (Physical) handles raw bit transmission.'
	};

	function answerDemo(key: string, correct: boolean) {
		if (demoAnswered) return;
		demoAnswered = true; demoCorrect = correct; demoSelected = key;
		if (demoInterval) clearInterval(demoInterval);
	}

	function resetDemo() {
		demoAnswered = false; demoCorrect = false; demoSelected = ''; demoTimer = 90;
		startDemoTimer();
	}

	function startDemoTimer() {
		if (demoInterval) clearInterval(demoInterval);
		demoInterval = setInterval(() => {
			demoTimer--;
			if (demoTimer <= 0) { clearInterval(demoInterval!); if (!demoAnswered) { demoAnswered = true; } }
		}, 1000);
	}

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(e => { if (e.isIntersecting) animateCounters(); });
		}, { threshold: 0.3 });
		const statsEl = document.getElementById('stats-section');
		if (statsEl) observer.observe(statsEl);
		startDemoTimer();
		return () => {
			observer.disconnect();
			if (demoInterval) clearInterval(demoInterval);
		};
	});
</script>

<svelte:head>
	<title>CollegeCBT — AI Exam Practice for Nigerian Higher Institutions | Practice Smart, Score Higher</title>
	<meta name="description" content="Unlimited AI-generated exam questions, timed WAEC-graded mock exams, and AI Readiness Score for 550+ Nigerian universities, polytechnics, and colleges of education. Powered by Claude AI." />
	<meta name="keywords" content="Nigerian university exam practice, CBT practice, AI exam questions, CollegeCBT, WAEC grading, polytechnic exam, college of education, NUC, NBTE, NCCE" />
	<meta property="og:title" content="CollegeCBT — AI Exam Practice for Nigerian Higher Institutions" />
	<meta property="og:description" content="Unlimited AI exam questions, timed mock exams, and grade prediction for 550+ Nigerian institutions." />
	<meta property="og:url" content="https://collegecbt.ewinproject.org" />
	<meta property="og:type" content="website" />
</svelte:head>

<!-- ═══════════════════════════ HERO ═══════════════════════════ -->
<section class="pt-[100px] pb-24 relative overflow-hidden" aria-labelledby="hero-heading">
	<!-- E-WIN Ecosystem Banner (Enterprise SEO) -->
	<div 
		class="w-full mb-10 py-3 px-4 border-y border-[#6cd973]/10 flex items-center justify-center gap-3 animate-pulse-subtle group"
		style="background: rgba(108, 217, 115, 0.08);"
		itemscope 
		itemtype="https://schema.org/Organization"
	>
		<meta itemprop="name" content="Elite Workforce Impact Nigeria (E-WIN) Project" />
		<div class="w-2 h-2 rounded-full bg-[#6cd973] shadow-[0_0_10px_#6cd973]"></div>
		<span class="text-[#6cd973] text-xs sm:text-sm font-bold tracking-wide uppercase text-center">
			A platform under the <span class="underline underline-offset-4 decoration-[#6cd973]/30">Elite Workforce Impact Nigeria (E-WIN)</span> Project Ecosystem
		</span>
	</div>

	<div class="page-container">
		<div class="grid lg:grid-cols-2 gap-14 items-center">
			<!-- Left: Copy -->
			<div>
				<div class="badge badge-lime text-xs mb-5 inline-flex">
					🇳🇬 Nigeria's #1 AI Exam Prep · Results as a Service
				</div>
				<h1 id="hero-heading" class="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6" style="letter-spacing:-0.03em;">
					<span class="text-white">Pass Any Exam.</span>
					<br />
					<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Guaranteed by AI.</span>
				</h1>
				<p class="text-white/60 text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
					CollegeCBT uses Claude AI to generate unlimited, contextual exam questions for every course in Nigerian universities, polytechnics, and colleges of education — with full explanations and WAEC-style grading.
				</p>

				<!-- Accreditation Badges -->
				<div class="flex items-center gap-2 flex-wrap mb-8">
					<span class="text-white/30 text-xs">Curriculum aligned to:</span>
					<span class="badge badge-violet">NUC</span>
					<span class="badge badge-amber">NBTE</span>
					<span class="badge badge-lime">NCCE</span>
					<span class="badge badge-gray">IEIs</span>
				</div>

				<div class="flex flex-wrap gap-4 mb-10">
					<a href="/exam-lab" class="btn-violet px-8 py-4 text-base shadow-violet">
						🤖 Start Exam Lab — Free
					</a>
					<button on:click={() => activeModal.set('signup')} class="btn-ghost px-7 py-4 text-base">
						⏱️ Try Mock Exam →
					</button>
				</div>

				<!-- Social proof strip -->
				<div class="flex flex-wrap gap-5 items-center text-sm text-white/40">
					<span>✅ No credit card required</span>
					<span>·</span>
					<span>✅ Works for all Nigerian institutions</span>
					<span>·</span>
					<span>✅ Free plan available</span>
				</div>
			</div>

			<!-- Right: Interactive MCQ Demo Card -->
			<div class="relative">
				<div class="glass-card p-6 relative z-10" style="border-color:rgba(132,204,22,0.2);">
					<!-- Card Header -->
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-2">
							<span class="badge badge-lime text-xs">🤖 Exam Lab Demo</span>
							<span class="badge badge-violet text-xs">300L · CS</span>
						</div>
						<!-- Countdown Timer -->
						<div class="flex items-center gap-1.5" aria-label="Time remaining">
							<div class="relative w-10 h-10 rounded-full flex items-center justify-center" style="background:conic-gradient(#f59e0b {demoTimer/90*360}deg, rgba(255,255,255,0.08) 0);">
								<div class="absolute inset-1 rounded-full flex items-center justify-center" style="background:#0d0820;">
									<span class="text-xs font-mono font-bold" style="color:{demoTimer <= 15 ? '#e11d48' : '#f59e0b'}">{demoTimer}</span>
								</div>
							</div>
							<span class="text-xs text-white/35">sec</span>
						</div>
					</div>

					<!-- Question -->
					<div class="p-4 rounded-xl mb-4" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
						<div class="text-xs text-white/35 uppercase tracking-widest font-semibold mb-2">Computer Networks · MCQ</div>
						<p class="text-white/90 text-sm leading-relaxed font-medium">{demoQ.text}</p>
					</div>

					<!-- Options -->
					<div class="space-y-2 mb-4">
						{#each demoQ.options as opt}
							{@const isSelected = demoSelected === opt.key}
							{@const isCorrect = opt.correct}
							{@const showResult = demoAnswered}
							<button
								on:click={() => answerDemo(opt.key, opt.correct)}
								disabled={demoAnswered}
								class="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
								style="{showResult && isCorrect ? 'background:rgba(132,204,22,0.15);border:1px solid #84cc16;color:#84cc16;' : showResult && isSelected && !isCorrect ? 'background:rgba(225,29,72,0.15);border:1px solid #e11d48;color:#f87171;' : 'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.75);'}"
							>
								<span class="font-bold mr-2">{opt.key}.</span>{opt.text}
								{#if showResult && isCorrect}<span class="float-right">✓</span>{/if}
								{#if showResult && isSelected && !isCorrect}<span class="float-right">✗</span>{/if}
							</button>
						{/each}
					</div>

					<!-- Explanation (shown after answer) -->
					{#if demoAnswered}
						<div class="p-3.5 rounded-xl mb-4 text-xs leading-relaxed" style="background:{demoCorrect ? 'rgba(132,204,22,0.08)' : 'rgba(225,29,72,0.08)'};border:1px solid {demoCorrect ? 'rgba(132,204,22,0.25)' : 'rgba(225,29,72,0.25)'}">
							<div class="font-bold mb-1" style="color:{demoCorrect ? '#84cc16' : '#f87171'}">{demoCorrect ? '🎯 Correct!' : '❌ Not quite'}</div>
							<p class="text-white/65">{demoQ.explanation}</p>
						</div>
						<button on:click={resetDemo} class="w-full btn-ghost py-2.5 text-sm">↩ Try Another Question</button>
					{:else}
						<div class="text-xs text-white/30 text-center">Click an option above — like the real Exam Lab</div>
					{/if}
				</div>

				<!-- Floating Badges -->
				<div class="absolute -top-4 -right-2 glass-card px-4 py-2 hidden sm:flex items-center gap-2 float-badge" style="border-color:rgba(132,204,22,0.25);">
					<span class="text-lime-DEFAULT text-base">🔥</span>
					<div><div class="text-xs font-bold text-white">14 Day Streak</div><div class="text-xs text-white/35">Keep it up!</div></div>
				</div>
				<div class="absolute -bottom-4 -left-4 glass-card px-4 py-2 hidden sm:flex items-center gap-2 float-badge-2" style="border-color:rgba(245,158,11,0.25);">
					<span class="text-amber-DEFAULT text-base">⏱️</span>
					<div><div class="text-xs font-bold text-white">Mock Exam Ready</div><div class="text-xs text-white/35">90s/question</div></div>
				</div>
			</div>

		</div>
	</div>
</section>

<!-- ═══════════════════════════ STATS ═══════════════════════════ -->
<section id="stats-section" class="py-16 relative overflow-hidden">
	<div class="page-container">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
			{#each [
				{ num: counters.institutions + '+', label: 'Institutions Covered', icon: '🏛️' },
				{ num: counters.questions + 'K+', label: 'Questions Generated', icon: '📝' },
				{ num: counters.students + 'K+', label: 'Active Students', icon: '👨‍🎓' },
				{ num: counters.passRate + '%', label: 'Target Pass Rate', icon: '🏆' }
			] as stat}
				<div class="glass-card p-6 text-center">
					<div class="text-3xl mb-2">{stat.icon}</div>
					<div class="font-title text-4xl sm:text-5xl" style="background:linear-gradient(135deg,#a3e635,#bef264);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
						{stat.num}
					</div>
					<div class="text-xs text-white/50 mt-1 font-medium">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ════════════════════════ THE PROBLEM ════════════════════════ -->
<section id="problem" class="py-20 relative" aria-labelledby="problem-heading">
	<div class="page-container">
		<div class="text-center mb-12">
			<div class="section-tag">⚡ The Problem</div>
			<h2 id="problem-heading" class="font-display text-4xl sm:text-5xl mb-4">
				Why Nigerian Students
				<span style="background:linear-gradient(135deg,#e11d48,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Struggle in Exams</span>
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">The system is broken. Students have syllabi but no practice questions. They memorise without understanding.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
			{#each problems as p}
				<div class="glass-card p-7 relative overflow-hidden">
					<div class="absolute bottom-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#e11d48,transparent);"></div>
					<div class="text-4xl mb-4">{p.icon}</div>
					<h3 class="font-bold text-lg mb-3">{p.title}</h3>
					<p class="text-white/50 text-sm leading-relaxed">{p.desc}</p>
				</div>
			{/each}
		</div>

		<!-- RaaS Banner -->
		<div class="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6" style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(132,204,22,0.08));border:1px solid rgba(124,58,237,0.25);">
			<div class="text-5xl flex-shrink-0">🎯</div>
			<div>
				<h3 class="font-display text-2xl mb-2">We Don't Sell Software. We Deliver <span style="color:#84cc16;">Results.</span></h3>
				<p class="text-white/60 leading-relaxed">CollegeCBT operates as a <strong class="text-white/80">Results-as-a-Service (RaaS)</strong> platform. We measure success by one metric only: <span style="color:#84cc16;">your exam score</span>. Our AI tracks your performance trajectory, predicts your readiness, and keeps generating questions until you hit 75% — the national pass threshold.</p>
			</div>
		</div>
	</div>
</section>

<!-- ═══════════════════════ FEATURES ═══════════════════════ -->
<section id="features" class="py-20 relative" aria-labelledby="features-heading">
	<div class="page-container">
		<div class="text-center mb-14">
			<div class="section-tag">✨ Platform Features</div>
			<h2 id="features-heading" class="font-display text-4xl sm:text-5xl mb-4">
				Everything You Need to
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Excel in Exams</span>
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">Six enterprise-grade capabilities working together to guarantee your exam result — not just prepare you for it.</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feat}
				<div class="feature-card p-7 relative overflow-hidden">
					<div class="absolute top-0 left-0 right-0 h-0.5" style="background:{feat.color};opacity:0;" class:opacity-100={true}></div>
					<div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5" style="background:{feat.color}20;border:1px solid {feat.color}30;">
						{feat.icon}
					</div>
					<h3 class="font-bold text-lg mb-2">{feat.title}</h3>
					<p class="text-white/50 text-sm leading-relaxed mb-4">{feat.desc}</p>
					<div class="pt-4 border-t border-white/5 flex items-center justify-between">
						<span class="text-xs font-semibold px-2.5 py-1 rounded-full" style="background:{feat.color}15;color:{feat.color};">{feat.tag}</span>
						<a href="/exam-lab" class="text-xs font-semibold transition-colors hover:opacity-80" style="color:{feat.color};">Try it free →</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════ HOW IT WORKS ══════════════════════ -->
<section id="how-it-works" class="py-20" aria-labelledby="how-heading">
	<div class="page-container">
		<div class="text-center mb-14">
			<div class="section-tag">🚀 Getting Started</div>
			<h2 id="how-heading" class="font-display text-4xl sm:text-5xl mb-4">
				From Zero to 75%
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> in 4 Steps</span>
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">The complete CollegeCBT journey — from choosing your course to walking into the real exam with certainty.</p>
		</div>

		<!-- Desktop: horizontal steps with connector -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
			<!-- Connector line (desktop only) -->
			<div class="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style="background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(132,204,22,0.4),transparent);"></div>

			{#each steps as item}
				<div class="text-center relative">
					<div class="relative inline-block mb-6">
						<div class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto" style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2);">{item.icon}</div>
						<div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-violet-DEFAULT flex items-center justify-center text-xs font-bold font-mono">{item.step}</div>
					</div>
					<h3 class="font-bold text-lg mb-2">{item.title}</h3>
					<p class="text-white/50 text-sm leading-relaxed">{item.desc}</p>
				</div>
			{/each}
		</div>

		<!-- ResultsGuard Callout -->
		<div class="mt-12 glass-card p-6 flex flex-col sm:flex-row items-center gap-5" style="background:rgba(132,204,22,0.06);border-color:rgba(132,204,22,0.2);">
			<div class="text-4xl flex-shrink-0">🛡️</div>
			<div>
				<div class="font-bold text-lime-DEFAULT mb-1">ResultsGuard™</div>
				<p class="text-white/60 text-sm leading-relaxed">Complete 30+ mock exams with your AI Study Contract and don't hit 75%? We'll give you a free semester extension. Your result is our result.</p>
			</div>
			<button on:click={() => activeModal.set('signup')} class="btn-violet px-6 py-3 text-sm flex-shrink-0 ml-auto">
				Claim Protection →
			</button>
		</div>
	</div>
</section>

<!-- ═══════════════════════ CURRICULUM ═══════════════════════ -->
<section id="curriculum" class="py-20" aria-labelledby="curriculum-heading">
	<div class="page-container">
		<div class="text-center mb-10">
			<div class="section-tag">📚 Course Browser</div>
			<h2 id="curriculum-heading" class="font-display text-4xl sm:text-5xl mb-4">
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">550+ Institutions.</span><br />Every Course. Every Level.
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">Browse the full Nigerian higher education curriculum. Select any course to generate AI-powered practice questions instantly.</p>
		</div>

		<!-- Institution Stats Row -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			{#each [
				{ num: '309+', lbl: 'Accredited Universities', badge: 'NUC', color: '#7c3aed' },
				{ num: '78+', lbl: 'Polytechnics', badge: 'NBTE', color: '#f59e0b' },
				{ num: '163+', lbl: 'Colleges of Education', badge: 'NCCE', color: '#22c55e' },
				{ num: '50+', lbl: 'IEIs & Technical', badge: 'IEI', color: '#22d3ee' }
			] as s}
				<div class="glass-card p-4 text-center">
					<div class="font-title text-3xl mb-1" style="color:{s.color};">{s.num}</div>
					<div class="text-xs text-white/50 mb-2">{s.lbl}</div>
					<span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:{s.color}15;color:{s.color};">{s.badge}</span>
				</div>
			{/each}
		</div>

		<CurriculumBrowser />

	</div>
</section>


<!-- ══════════════════════════════════════════════════════
  EXAM LAB — AI QUESTION GENERATOR (Extracted Preview)
══════════════════════════════════════════════════════ -->
<section id="exam-lab" class="py-28 relative overflow-hidden">
  <div class="orb orb-forest" style="width:450px;height:450px;bottom:0;left:-8%;opacity:.12;"></div>
  <div class="noise-overlay"></div>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full border border-lime-DEFAULT/20 bg-lime-DEFAULT/10 text-lime-DEFAULT text-xs font-bold uppercase tracking-wider mb-4">🧪 AI Exam Lab</div>
      <h2 class="font-display font-bold text-white mt-2 mb-4 text-4xl sm:text-5xl" style="letter-spacing:-.03em;">Unlimited <span style="color:#A3E635;">AI-Generated</span> Questions</h2>
      <p class="text-white/50 max-w-2xl mx-auto">Generate fresh, contextual questions on any course or topic. Each answer reveals the full reasoning — why correct and why each wrong option exists — building real understanding.</p>
    </div>

    <!-- Lab Config -->
    <div class="glass-card p-6 mb-6">
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label for="inst-type" class="text-xs text-white/45 mb-2 block font-semibold">Institution Type</label>
          <select id="inst-type" class="w-full form-input py-2.5 text-sm" disabled>
            <option>University</option>
          </select>
        </div>
        <div>
          <label for="course-subject" class="text-xs text-white/45 mb-2 block font-semibold">Course / Subject</label>
          <select id="course-subject" class="w-full form-input py-2.5 text-sm" disabled>
            <option>Computer Networks</option>
          </select>
        </div>
        <div>
          <label for="question-type" class="text-xs text-white/45 mb-2 block font-semibold">Question Type</label>
          <select id="question-type" class="w-full form-input py-2.5 text-sm" disabled>
            <option>Objective (MCQ)</option>
          </select>
        </div>
        <div>
          <label for="specific-topic" class="text-xs text-white/45 mb-2 block font-semibold">Specific Topic</label>
          <input id="specific-topic" type="text" placeholder="e.g. OSI Model..." class="w-full form-input py-2.5 text-sm" disabled/>
        </div>
      </div>
      <div class="mt-5 flex flex-wrap gap-3 items-center">
        <a href="/exam-lab" class="btn-lime px-6 py-3 text-sm flex items-center gap-2">
          Practise Now
        </a>
        <div class="ml-auto text-xs text-white/25 hidden sm:block">Powered by Claude AI · Anthropic</div>
      </div>
    </div>

    <!-- Question Display Area -->
    <div class="glass-card overflow-hidden">
      <!-- Question Header -->
      <div class="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-white/5">
        <div class="flex items-center gap-3">
          <div class="badge badge-lime text-xs">Computer Networks</div>
          <div class="badge badge-amber text-xs">Objective</div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-white/35">Score:</span>
          <span class="font-semibold text-sm text-lime-DEFAULT">10 pts</span>
          <span class="text-xs text-white/20">|</span>
          <span class="text-xs text-white/35">Streak: 3🔥</span>
        </div>
      </div>

      <!-- Question Body -->
      <div class="p-6 md:p-8">
        <div class="p-5 rounded-2xl border border-white/10 mb-6 bg-white/5">
          <div class="text-xs text-white/40 font-semibold mb-2.5 uppercase tracking-widest">Question</div>
          <p class="text-white/90 leading-relaxed text-base">At which layer of the OSI model does a router primarily operate?</p>
        </div>

        <!-- MCQ Options -->
        <div class="space-y-3 mb-6">
          <button class="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 text-white/80 opacity-50 cursor-not-allowed">A. Data Link Layer</button>
          <button class="w-full text-left p-4 rounded-xl border border-lime-DEFAULT bg-lime-DEFAULT/10 text-lime-DEFAULT cursor-not-allowed">B. Network Layer ✅ Correct</button>
          <button class="w-full text-left p-4 rounded-xl border border-red-500 bg-red-500/10 text-red-400 cursor-not-allowed">C. Transport Layer ❌</button>
          <button class="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 text-white/80 opacity-50 cursor-not-allowed">D. Physical Layer</button>
        </div>

        <!-- Explanation panel -->
        <div class="rounded-2xl overflow-hidden mb-5 border border-lime-DEFAULT/20 bg-lime-DEFAULT/5">
          <div class="px-5 py-3.5 text-sm font-bold font-display border-b border-lime-DEFAULT/10 text-lime-DEFAULT">Detailed Explanation</div>
          <div class="px-5 py-4 text-sm text-white/70 leading-relaxed space-y-2.5">
            <p><strong class="text-lime-DEFAULT">Why B is correct:</strong> Routers are network-layer (Layer 3) devices. They read the logical addressing (IP addresses) in packet headers to determine the best path to forward the packets across different networks.</p>
            <p><strong class="text-white/50">Why C is wrong:</strong> The Transport Layer (Layer 4) uses protocols like TCP and UDP for end-to-end communication and port addressing, not routing between networks.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════════════════════════════════
  MOCK EXAM — TIMED CBT SIMULATION (Extracted Preview)
══════════════════════════════════════════════════════ -->
<section id="mock-exam" class="py-28 relative overflow-hidden bg-black/20">
  <div class="orb orb-amber" style="width:400px;height:400px;top:5%;right:-8%;opacity:.07;"></div>
  <div class="noise-overlay"></div>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full border border-amber-DEFAULT/20 bg-amber-DEFAULT/10 text-amber-DEFAULT text-xs font-bold uppercase tracking-wider mb-4">⏱️ Mock Exam Mode</div>
      <h2 class="font-display font-bold text-white mt-2 mb-4 text-4xl sm:text-5xl" style="letter-spacing:-.03em;">Real Exam Conditions. <span style="color:#F59E0B;">WAEC Grading.</span></h2>
      <p class="text-white/50 max-w-xl mx-auto">90 seconds per question. Auto-submits. Generates a full performance report with WAEC-style A1–F9 grade and topic-level analysis.</p>
    </div>

    <!-- Active Mock Exam Preview -->
    <div>
      <!-- Top Bar -->
      <div class="glass-card p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-4">
          <!-- Timer Ring -->
          <div class="relative w-14 h-14 flex items-center justify-center rounded-full border-4 border-amber-DEFAULT/20 border-t-amber-DEFAULT">
            <span class="text-amber-DEFAULT font-bold text-lg">89</span>
          </div>
          <div>
            <div class="text-xs text-white/35">Question</div>
            <div class="font-display font-bold text-white text-xl">14<span class="text-white/35 text-sm">/20</span></div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-center hidden sm:block">
            <div class="text-xs text-white/35 mb-0.5">Score</div>
            <div class="font-display font-bold text-base text-lime-DEFAULT">11/13</div>
          </div>
          <button on:click={() => activeModal.set('signup')} class="btn-ghost px-4 py-2 text-xs">Take a Free Mock Exam</button>
        </div>
      </div>

      <!-- Question Card -->
      <div class="glass-card p-6 md:p-8 mb-4">
        <div>
          <div class="p-5 rounded-2xl border border-white/10 mb-6 bg-white/5">
            <div class="text-xs text-white/30 mb-2 uppercase tracking-widest font-semibold">Nigerian Constitutional Law</div>
            <p class="text-white/90 leading-relaxed text-base">Under the 1999 Constitution of the Federal Republic of Nigeria, exclusive legislative powers are vested in the:</p>
          </div>
          <div class="space-y-3">
            <button class="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:border-lime-DEFAULT/50 transition-colors">A. State House of Assembly</button>
            <button class="w-full text-left p-4 rounded-xl border border-lime-DEFAULT bg-lime-DEFAULT/10 text-lime-DEFAULT font-semibold">B. National Assembly (Selected)</button>
            <button class="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:border-lime-DEFAULT/50 transition-colors">C. Executive Council</button>
            <button class="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:border-lime-DEFAULT/50 transition-colors">D. Judiciary</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════ DASHBOARD PREVIEW ══════════════════ -->
<section id="dashboard-preview" class="py-20 relative" aria-labelledby="dash-preview-heading">
	<div class="page-container">
		<div class="text-center mb-12">
			<div class="section-tag">📊 Student Dashboard</div>
			<h2 id="dash-preview-heading" class="font-display text-4xl sm:text-5xl mb-4">
				Your Personal
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Results Command Centre</span>
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">Track performance, AI readiness score, topic heatmaps, and grade predictions from your personalised dashboard.</p>
		</div>

		<!-- Dashboard Preview Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
			<!-- AI Score Card -->
			<div class="glass-card p-6" style="background:linear-gradient(135deg,rgba(132,204,22,0.08),rgba(15,23,42,0.6));border-color:rgba(132,204,22,0.2);">
				<div class="text-xs text-white/40 mb-1">AI Readiness Score™</div>
				<div class="font-display font-bold text-5xl mb-2" style="color:#84cc16;">78</div>
				<div class="flex justify-between text-xs text-white/35 mb-1">
					<span>Fail Zone</span><span style="color:#84cc16;">Pass Zone</span>
				</div>
				<div class="h-2 rounded-full mb-3" style="background:rgba(255,255,255,0.06);">
					<div class="h-full rounded-full" style="width:78%;background:linear-gradient(90deg,#dc2626,#f59e0b 45%,#84cc16);"></div>
				</div>
				<div class="glass-card p-2.5 text-xs" style="background:rgba(132,204,22,0.06);">
					<span style="color:#84cc16;">📈</span> On track for A1 in 2 weeks
				</div>
			</div>

			<!-- Grade Prediction -->
			<div class="glass-card p-6">
				<div class="font-bold text-sm mb-4">🔮 Grade Prediction — DBMS</div>
				<div class="space-y-3">
					<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(132,204,22,0.08);border:1px solid rgba(132,204,22,0.2);">
						<span class="text-sm">Predicted Grade</span>
						<span class="font-title text-xl" style="color:#84cc16;">B2 — 72%</span>
					</div>
					<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);">
						<span class="text-sm">National Rank</span>
						<span class="text-sm text-violet-light">Top 27% of 300L CS</span>
					</div>
					<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);">
						<span class="text-sm">To reach A1</span>
						<span class="text-sm text-amber-DEFAULT">12 more ✓ answers</span>
					</div>
				</div>
			</div>

			<!-- Topic Heatmap -->
			<div class="glass-card p-6">
				<div class="font-bold text-sm mb-4">🌡️ Topic Heatmap</div>
				<div class="space-y-3">
					{#each [
						{ topic: 'Data Structures', pct: 88, color: '#84cc16' },
						{ topic: 'Computer Networks', pct: 64, color: '#f59e0b' },
						{ topic: 'DB Normalization', pct: 45, color: '#e11d48' },
						{ topic: 'Algorithms', pct: 71, color: '#84cc16' }
					] as h}
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="text-white/60">{h.topic}</span>
								<span style="color:{h.color};" class="font-semibold">{h.pct}%</span>
							</div>
							<div class="h-1 rounded-full" style="background:rgba(255,255,255,0.06);">
								<div class="h-full rounded-full" style="width:{h.pct}%;background:{h.color};"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="text-center">
			<a href="/dashboard" class="btn-violet px-8 py-4 text-base shadow-violet inline-block">
				📊 View Full Dashboard →
			</a>
		</div>
	</div>
</section>

<!-- ═══════════════════════ TESTIMONIALS ═══════════════════════ -->
<section id="testimonials" class="py-20" aria-labelledby="test-heading">
	<div class="page-container">
		<div class="text-center mb-12">
			<div class="section-tag">💬 Student Success Stories</div>
			<h2 id="test-heading" class="font-display text-4xl sm:text-5xl mb-4">
				Real Students. <span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Real Results.</span>
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">Nigerian undergraduates across universities and polytechnics sharing their CollegeCBT experience.</p>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each testimonials as t}
				<div class="glass-card p-6 relative flex flex-col">
					<div class="absolute top-4 right-5 font-display text-5xl text-violet-DEFAULT/20 leading-none">"</div>
					<p class="text-white/80 text-sm italic leading-relaxed mb-6 flex-1">"{t.quote}"</p>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style="background:{t.color};">{t.emoji}</div>
						<div>
							<div class="font-bold text-sm">{t.name}</div>
							<div class="text-xs text-white/40">{t.meta}</div>
							<div class="text-xs font-mono font-semibold text-lime-DEFAULT mt-0.5">{t.grade}</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════ PRICING PREVIEW ══════════════════════ -->
<section id="pricing-preview" class="py-20" aria-labelledby="price-prev-heading">
	<div class="page-container">
		<div class="text-center mb-12">
			<div class="section-tag">💰 Pricing Plans</div>
			<h2 id="price-prev-heading" class="font-display text-4xl sm:text-5xl mb-4">
				Simple Pricing.
				<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;"> Nigerian Naira.</span>
			</h2>
			<p class="text-white/50 max-w-xl mx-auto">No foreign currency. Pay with card, bank transfer, USSD or POS — Nigeria-native payment infrastructure.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<!-- Free -->
			<div class="glass-card p-7 flex flex-col">
				<div class="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Free Forever</div>
				<div class="font-title text-5xl leading-none mb-1"><sup class="font-body font-bold text-xl align-super">₦</sup>0</div>
				<div class="text-xs text-white/40 mb-6">No credit card required · Forever free</div>
				<ul class="space-y-2 mb-7 flex-1">
					{#each ['5 AI questions per day', 'Basic answer explanations', '3 mock exams per month', 'Full curriculum browser'] as f}
						<li class="flex items-start gap-2 text-sm"><span class="text-lime-DEFAULT font-bold flex-shrink-0 mt-0.5">✓</span><span class="text-white/80">{f}</span></li>
					{/each}
					{#each ['AI Readiness Score', 'Grade prediction', 'Performance certificate'] as f}
						<li class="flex items-start gap-2 text-sm"><span class="text-rose-DEFAULT font-bold flex-shrink-0 mt-0.5">✗</span><span class="text-white/35">{f}</span></li>
					{/each}
				</ul>
				<a href="/exam-lab" class="btn-ghost w-full py-3.5 text-sm text-center font-bold rounded-xl">Start Free Today</a>
			</div>

			<!-- Pro (highlighted) -->
			<div class="glass-card p-7 flex flex-col relative" style="background:linear-gradient(135deg,rgba(124,58,237,0.22),rgba(168,85,247,0.12));border-color:rgba(124,58,237,0.5);">
				<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-violet-DEFAULT text-white whitespace-nowrap">⭐ Most Popular</div>
				<div class="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Student Pro</div>
				<div class="font-title text-5xl leading-none mb-1"><sup class="font-body font-bold text-xl align-super">₦</sup>5,000</div>
				<div class="text-xs text-white/40 mb-6">per semester · or ₦8,500/year (save 15%)</div>
				<ul class="space-y-2 mb-7 flex-1">
					{#each ['Unlimited AI-generated questions', 'Full explanations + distractor analysis', 'Unlimited mock exams (WAEC grades)', 'Theory questions with model answers', 'AI Readiness Score (0–100)', 'Grade prediction & trajectory chart', 'National benchmarking', 'Downloadable performance certificate'] as f}
						<li class="flex items-start gap-2 text-sm"><span class="text-lime-DEFAULT font-bold flex-shrink-0 mt-0.5">✓</span><span class="text-white/80">{f}</span></li>
					{/each}
				</ul>
				<a href="/pricing" class="btn-violet w-full py-3.5 text-sm text-center font-bold rounded-xl shadow-violet">Pay ₦5,000 → Start Now</a>
			</div>

			<!-- Institutional -->
			<div class="glass-card p-7 flex flex-col">
				<div class="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Departmental / Institutional</div>
				<div class="font-title text-5xl leading-none mb-1"><sup class="font-body font-bold text-xl align-super">₦</sup>25,000</div>
				<div class="text-xs text-white/40 mb-6">per year · up to 200 students</div>
				<ul class="space-y-2 mb-7 flex-1">
					{#each ['All Pro features for up to 200 students', 'Lecturer admin dashboard', 'Department-level analytics', 'Custom question sets per course', 'Cohort performance reports', 'Bulk student onboarding', 'Priority AI support'] as f}
						<li class="flex items-start gap-2 text-sm"><span class="text-lime-DEFAULT font-bold flex-shrink-0 mt-0.5">✓</span><span class="text-white/80">{f}</span></li>
					{/each}
				</ul>
				<a href="/pricing" class="btn-outline-lime w-full py-3.5 text-sm text-center font-bold rounded-xl">Get Started →</a>
			</div>
		</div>
	</div>
</section>

<!-- ══════════════════════════ FAQ ══════════════════════════ -->
<section id="faq" class="py-20" aria-labelledby="faq-heading">
	<div class="page-container max-w-3xl">
		<div class="text-center mb-10">
			<div class="section-tag">❓ Common Questions</div>
			<h2 id="faq-heading" class="font-display text-4xl sm:text-5xl mb-4">
				Questions About <span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">CollegeCBT</span>
			</h2>
		</div>
		<div class="space-y-3">
			{#each faqs as faq, i}
				<div class="glass-card overflow-hidden">
					<button
						on:click={() => openFaq = openFaq === i ? -1 : i}
						class="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm hover:text-violet-light transition-colors"
						aria-expanded={openFaq === i}
						id="faq-btn-{i}"
						aria-controls="faq-panel-{i}"
					>
						<span>{faq.q}</span>
						<span class="flex-shrink-0 text-lg transition-transform duration-300" class:rotate-45={openFaq === i}>+</span>
					</button>
					{#if openFaq === i}
						<div id="faq-panel-{i}" role="region" aria-labelledby="faq-btn-{i}" class="px-5 pb-4 text-sm text-white/60 leading-relaxed border-t border-white/5 pt-3">
							{faq.a}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ════════════════════════ CTA BANNER ════════════════════════ -->
<section class="py-20" aria-labelledby="cta-heading">
	<div class="page-container">
		<div class="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden" style="background:linear-gradient(135deg,rgba(124,58,237,0.22),rgba(132,204,22,0.08));border:1px solid rgba(124,58,237,0.3);">
			<div class="text-6xl mb-4">🎓</div>
			<h2 id="cta-heading" class="font-display text-4xl sm:text-5xl mb-4">Ready to Score A1?</h2>
			<p class="text-white/60 max-w-lg mx-auto mb-8">Join 12,000+ Nigerian students who use CollegeCBT to practise smarter and achieve their target grades.</p>
			<div class="flex flex-wrap gap-4 justify-center">
				<button on:click={() => activeModal.set('signup')} class="btn-violet px-8 py-4 text-base shadow-violet">
					Start Free Today — No Credit Card
				</button>
				<a href="/exam-lab" class="btn-ghost px-7 py-4 text-base">
					Try Exam Lab First →
				</a>
			</div>
		</div>
	</div>
</section>

<!-- ════════════════════════ FOOTER ════════════════════════ -->
<footer class="border-t border-white/8 py-14" style="background:rgba(0,0,0,0.5);">
	<div class="page-container">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
			<div class="col-span-2 md:col-span-1">
				<a href="/" class="font-display text-2xl block mb-3" style="background:linear-gradient(135deg,#fff 40%,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" aria-label="CollegeCBT Home">
					College<span style="-webkit-text-fill-color:#84cc16;">CBT</span>
				</a>
				<p class="text-xs text-white/40 leading-relaxed max-w-[240px] mb-4">
					AI-powered exam practice for every Nigerian higher education student. Results as a Service.
				</p>
				<div class="flex items-center gap-2">
					<div class="w-2 h-2 rounded-full bg-lime-DEFAULT animate-blink"></div>
					<span class="text-xs text-lime-DEFAULT font-semibold">System Operational</span>
				</div>
			</div>
			<div>
				<h3 class="font-bold text-sm mb-4">Platform</h3>
				<div class="space-y-2.5">
					<a href="/exam-lab" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Exam Lab</a>
					<a href="/exam-lab?mode=mock" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Mock Exams</a>
					<a href="/dashboard" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Dashboard</a>
					<a href="/pricing" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Pricing</a>
					<a href="/resources" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Resources</a>
				</div>
			</div>
			<div>
				<h3 class="font-bold text-sm mb-4">Institutions</h3>
				<div class="space-y-2.5">
					{#each ['Universities (NUC)', 'Polytechnics (NBTE)', 'Colleges of Education', 'IEI / Technical'] as link}
						<a href="/exam-lab" class="block text-sm text-white/40 hover:text-violet-light transition-colors">{link}</a>
					{/each}
				</div>
			</div>
			<div>
				<h3 class="font-bold text-sm mb-4">Company</h3>
				<div class="space-y-2.5">
					<a href="/#problem" class="block text-sm text-white/40 hover:text-violet-light transition-colors">About CollegeCBT</a>
					<a href="/pricing" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Pricing</a>
					<a href="/resources" class="block text-sm text-white/40 hover:text-violet-light transition-colors">Study Resources</a>
					<button on:click={() => activeModal.set('signup')} class="block text-left text-sm text-white/40 hover:text-violet-light transition-colors">Contact Us</button>
				</div>
			</div>
		</div>
		<div class="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p class="text-xs text-white/30">© {new Date().getFullYear()} CollegeCBT. All rights reserved. Powered by Anthropic Claude AI.</p>
			<p class="text-xs text-white/30">Built for Nigerian higher education students</p>
		</div>
	</div>
</footer>

<style>
	.float-badge {
		animation: floatY 4s ease-in-out infinite;
	}
	.float-badge-2 {
		animation: floatY 5s ease-in-out infinite;
		animation-delay: 1.5s;
	}
	@keyframes floatY {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
</style>
