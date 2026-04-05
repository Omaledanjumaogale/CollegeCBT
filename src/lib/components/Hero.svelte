<script lang="ts">
	import { activeModal } from '$lib/stores';
	import { onMount } from 'svelte';

	let demoAnswered = $state(false);
	let demoCorrect = $state(false);
	let demoSelected = $state('');
	let demoTimer = $state(90);
	let demoInterval: any = null;

	const demoQ = {
		text: 'Which OSI layer does a router primarily operate at?',
		options: [
			{ key: 'A', text: 'Data Link Layer (Layer 2)', correct: false },
			{ key: 'B', text: 'Network Layer (Layer 3)', correct: true },
			{ key: 'C', text: 'Transport Layer (Layer 4)', correct: false },
			{ key: 'D', text: 'Physical Layer (Layer 1)', correct: false }
		],
		explanation: '✅ B is correct. Routers operate at Layer 3 (Network Layer), reading IP addresses to forward packets. ❌ A (Data Link) handles MAC addresses. ❌ C (Transport) handles TCP/UDP ports. ❌ D (Physical) handles raw bit transmission.'
	};

	function answerDemo(key: string, correct: boolean) {
		if (demoAnswered) return;
		demoAnswered = true;
		demoCorrect = correct;
		demoSelected = key;
		if (demoInterval) clearInterval(demoInterval);
	}

	function resetDemo() {
		demoAnswered = false;
		demoCorrect = false;
		demoSelected = '';
		demoTimer = 90;
		startDemoTimer();
	}

	function startDemoTimer() {
		if (demoInterval) clearInterval(demoInterval);
		demoInterval = setInterval(() => {
			if (demoTimer > 0) {
				demoTimer--;
			} else {
				clearInterval(demoInterval);
				if (!demoAnswered) demoAnswered = true;
			}
		}, 1000);
	}

	onMount(() => {
		startDemoTimer();
		return () => {
			if (demoInterval) clearInterval(demoInterval);
		};
	});
</script>

<section class="pt-[100px] pb-24 relative overflow-hidden" aria-labelledby="hero-heading">
	<div class="page-container">
		<div class="grid lg:grid-cols-2 gap-14 items-center">
			<!-- Left: Copy -->
			<div class="flex flex-col items-start text-left">
				<div class="badge badge-lime text-xs mb-5 inline-flex">
					🇳🇬 Nigeria's #1 AI Exam Prep · Guaranteed Success
				</div>
				<h1 id="hero-heading" class="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6 text-white" style="letter-spacing:-0.03em;">
					Pass Any Exam.
					<br />
					<span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Guaranteed by AI.</span>
				</h1>
				<p class="text-white/60 text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
					CollegeCBT uses AI to create practice questions for every course in Nigerian universities, polytechnics, and colleges. Practice with real exam scenarios and get full explanations for every answer.
				</p>

				<!-- Accreditation Badges -->
				<div class="flex items-center gap-2 flex-wrap mb-8">
					<span class="text-white/30 text-xs font-semibold uppercase tracking-wider">Aligned to:</span>
					<span class="badge badge-violet">NUC</span>
					<span class="badge badge-amber">NBTE</span>
					<span class="badge badge-lime">NCCE</span>
					<span class="badge badge-rose">IEIs</span>
				</div>

				<div class="flex flex-wrap gap-4 mb-10">
					<a href="/exam-lab" class="btn-violet px-8 py-4 text-base">
						🤖 Start Exam Lab — Free
					</a>
					<button onclick={() => activeModal.set('signup')} class="btn-ghost px-7 py-4 text-base">
						⏱️ Try Mock Exam →
					</button>
				</div>

				<!-- Social proof strip -->
				<div class="flex flex-wrap gap-5 items-center text-sm text-white/40 font-medium">
					<span>✅ No Credit Card required</span>
					<span class="hidden sm:inline">·</span>
					<span>✅ All Nigerian Institutions</span>
					<span class="hidden sm:inline">·</span>
					<span>✅ Free Plan Available</span>
				</div>
			</div>

			<!-- Right: Interactive MCQ Demo Card -->
			<div class="relative w-full">
				<div class="glass-card p-6 relative z-10 border-lime-500/20">
					<!-- Card Header -->
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-2">
							<span class="badge badge-lime text-[10px] sm:text-xs">🤖 Exam Lab Demo</span>
							<span class="badge badge-violet text-[10px] sm:text-xs">300L · CS</span>
						</div>
						<!-- Countdown Timer -->
						<div class="flex items-center gap-1.5" aria-label="Time remaining">
							<div class="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
								<svg class="absolute inset-0 w-full h-full -rotate-90">
									<circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2" class="text-white/10" />
									<circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2" 
										stroke-dasharray="113" 
										stroke-dashoffset={113 - (demoTimer / 90) * 113}
										class={demoTimer <= 15 ? 'text-rose-500' : 'text-amber-500'} 
										style="transition: stroke-dashoffset 1s linear;"
									/>
								</svg>
								<span class="text-xs font-mono font-bold" class:text-rose-500={demoTimer <= 15} class:text-amber-500={demoTimer > 15}>{demoTimer}</span>
							</div>
							<span class="text-[10px] text-white/35 font-bold uppercase tracking-tighter">sec</span>
						</div>
					</div>

					<!-- Question -->
					<div class="p-4 rounded-xl mb-4 bg-white/5 border border-white/10">
						<div class="text-[10px] text-white/35 uppercase tracking-widest font-bold mb-2">Computer Networks · MCQ</div>
						<p class="text-white/90 text-sm leading-relaxed font-semibold">{demoQ.text}</p>
					</div>

					<!-- Options -->
					<div class="space-y-2 mb-4">
						{#each demoQ.options as opt}
							{@const isSelected = demoSelected === opt.key}
							{@const isCorrect = opt.correct}
							<button
								onclick={() => answerDemo(opt.key, opt.correct)}
								disabled={demoAnswered}
								class="mcq-option {demoAnswered && isCorrect ? 'correct' : (demoAnswered && isSelected && !isCorrect ? 'wrong' : '')}"
							>
								<span class="font-bold mr-2 text-white/40">{opt.key}.</span>
								<span class="flex-1">{opt.text}</span>
								{#if demoAnswered && isCorrect}<span class="text-xs">✅</span>{/if}
								{#if demoAnswered && isSelected && !isCorrect}<span class="text-xs">❌</span>{/if}
							</button>
						{/each}
					</div>

					<!-- Explanation -->
					{#if demoAnswered}
						<div class="p-4 rounded-xl mb-4 text-xs leading-relaxed animate-fade-up" 
							style="background: {demoCorrect ? 'rgba(132, 204, 22, 0.08)' : 'rgba(225, 29, 72, 0.08)'}; 
									border: 1px solid {demoCorrect ? 'rgba(132, 204, 22, 0.25)' : 'rgba(225, 29, 72, 0.25)'}">
							<div class="font-bold mb-1" style="color: {demoCorrect ? '#84cc16' : '#f87171'}">
								{demoCorrect ? '🎯 Correct!' : '❌ Not Quite Right'}
							</div>
							<p class="text-white/65">{demoQ.explanation.replace('❌', '\n❌').replace('✅', '✅')}</p>
						</div>
						<button onclick={resetDemo} class="w-full btn-ghost py-2.5 text-sm">↩ Try Another Question</button>
					{:else}
						<div class="text-xs text-white/30 text-center font-medium italic">Click an option above — experience the real Exam Lab</div>
					{/if}
				</div>

				<!-- Floating Decorative Elements -->
				<div class="absolute -top-6 -right-4 glass-card px-4 py-2 hidden sm:flex items-center gap-3 border-lime-500/30 animate-pulse-subtle scale-90">
					<span class="text-lime-500 text-xl">🔥</span>
					<div>
						<div class="text-xs font-bold text-white leading-tight">14 Day Streak</div>
						<div class="text-[10px] text-white/40 font-medium">Results Guaranteed</div>
					</div>
				</div>
				<div class="absolute -bottom-6 -left-6 glass-card px-4 py-2 hidden sm:flex items-center gap-3 border-amber-500/30 animate-pulse-subtle delay-700 scale-90">
					<span class="text-amber-500 text-xl">⏱️</span>
					<div>
						<div class="text-xs font-bold text-white leading-tight">Mock Exam Ready</div>
						<div class="text-[10px] text-white/40 font-medium">90s per question</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes fade-up {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-up {
		animation: fade-up 0.4s ease-out forwards;
	}
</style>
