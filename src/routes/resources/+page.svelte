<script lang="ts">
	import { onMount } from 'svelte';
	const articles = [
		{
			title: 'How to Smash Database Normalization (1NF, 2NF, 3NF)',
			excerpt: 'Struggling with database normalization? Here are 3 simple tricks to identify normal forms instantly in MCQs.',
			category: 'Exam Tips',
			readTime: '3 min read',
			date: 'Apr 3'
		},
		{
			title: 'Understanding Computer Networks TCP/IP Stack',
			excerpt: 'A comprehensive cheat sheet for the 4-layer TCP/IP stack vs OSI model for final year exams.',
			category: 'Study Guide',
			readTime: '5 min read',
			date: 'Apr 1'
		},
		{
			title: 'Mastering Time Management in CBT Exams',
			excerpt: 'Learn the "skip-and-return" strategy that guarantees you never run out of time when answering difficult questions.',
			category: 'Strategy',
			readTime: '4 min read',
			date: 'Mar 28'
		}
	];
</script>

<svelte:head>
	<title>Resources & Exam Tips — CollegeCBT</title>
	<meta name="description" content="Expert study guides, exam tips, and subject cheat sheets for Nigerian higher institution students." />
</svelte:head>

<div class="pt-[100px] pb-20">
	<div class="page-container">
		<div class="text-center mb-12">
			<div class="section-tag">📚 Study Resources</div>
			<h1 class="font-display text-4xl sm:text-5xl mb-4">Exam Tips & Study Guides</h1>
			<p class="text-white/50 max-w-xl mx-auto">Boost your AI Readiness Score with expert strategies and cheat sheets.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each articles as article}
				<a href="#article" class="glass-card p-6 flex flex-col transition-all hover:-translate-y-1 hover:border-violet-DEFAULT/50 group">
					<div class="flex justify-between items-start mb-4">
						<span class="badge badge-violet">{article.category}</span>
						<span class="text-xs text-white/40">{article.readTime}</span>
					</div>
					<h2 class="font-bold text-xl mb-3 group-hover:text-lime-DEFAULT transition-colors">{article.title}</h2>
					<p class="text-sm text-white/60 mb-6 flex-1">{article.excerpt}</p>
					<div class="flex justify-between items-center text-xs font-bold font-mono">
						<span class="text-white/40">{article.date}</span>
						<span class="text-violet-light group-hover:text-white transition-colors">Read Article →</span>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
