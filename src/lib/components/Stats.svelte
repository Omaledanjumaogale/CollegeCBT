<script lang="ts">
	import { onMount } from 'svelte';

	let counters = $state({ institutions: 0, questions: 0, students: 0, passRate: 0 });
	let hasAnimated = false;
	let sectionRef: HTMLElement;

	function animateCounters() {
		if (hasAnimated) return;
		hasAnimated = true;
		const targets = { institutions: 550, questions: 250, students: 12, passRate: 89 };
		const duration = 2000;
		const start = performance.now();

		function step(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const ease = 1 - Math.pow(1 - progress, 4); // Quartic ease out

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

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					animateCounters();
				}
			},
			{ threshold: 0.3 }
		);

		if (sectionRef) observer.observe(sectionRef);
		return () => observer.disconnect();
	});

	const stats = $derived([
		{ num: counters.institutions, suffix: '+', label: 'Institutions Covered', icon: '🏛️' },
		{ num: counters.questions, suffix: 'K+', label: 'Questions Generated', icon: '📝' },
		{ num: counters.students, suffix: 'K+', label: 'Active Students', icon: '👨‍🎓' },
		{ num: counters.passRate, suffix: '%', label: 'Target Pass Rate', icon: '🏆' }
	]);
</script>

<section bind:this={sectionRef} id="stats-section" class="py-16 relative overflow-hidden">
	<div class="page-container">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
			{#each stats as stat}
				<div class="glass-card p-6 text-center border-white/5 bg-white/5 transition-transform duration-500 hover:scale-[1.02]">
					<div class="text-3xl mb-3 flex justify-center">{stat.icon}</div>
					<div 
						class="font-display text-4xl sm:text-5xl mb-2" 
						style="background: linear-gradient(135deg, #a3e635, #bef264); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
					>
						{stat.num}{stat.suffix}
					</div>
					<div class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40">
						{stat.label}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
