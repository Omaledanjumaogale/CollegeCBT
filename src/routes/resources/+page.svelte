<script lang="ts">
	import { activeModal } from '$lib/stores';

	type Category = 'All' | 'Exam Tips' | 'Study Guide' | 'Strategy' | 'Subject Deep-Dive' | 'Mock Exam Prep';

	let activeCategory = $state<Category>('All');
	let searchQuery = $state('');

	const articles = [
		{
			title: 'How to Smash Database Normalization (1NF, 2NF, 3NF)',
			excerpt: 'Struggling with database normalization? Here are 3 simple tricks to identify normal forms instantly in MCQs and never confuse 2NF with 3NF again.',
			category: 'Exam Tips' as Category,
			readTime: '3 min read',
			date: 'Apr 3, 2025',
			icon: '🗄️',
			color: '#7c3aed'
		},
		{
			title: 'Understanding Computer Networks: TCP/IP Stack Cheat Sheet',
			excerpt: 'A comprehensive cheat sheet for the 4-layer TCP/IP stack vs OSI model for final year exams — memorise it in 15 minutes.',
			category: 'Study Guide' as Category,
			readTime: '5 min read',
			date: 'Apr 1, 2025',
			icon: '🌐',
			color: '#22d3ee'
		},
		{
			title: 'Mastering Time Management in CBT Exams',
			excerpt: 'Learn the "skip-and-return" strategy that guarantees you never run out of time. Tested across 200+ Nigerian university CBT exams.',
			category: 'Strategy' as Category,
			readTime: '4 min read',
			date: 'Mar 28, 2025',
			icon: '⏱️',
			color: '#f59e0b'
		},
		{
			title: 'Data Structures: Sorting Algorithms You Must Know',
			excerpt: 'Bubble, Merge, Quick, Heap sort — their time complexity, space complexity, and when lecturers expect you to choose each. MCQ-targeted guide.',
			category: 'Subject Deep-Dive' as Category,
			readTime: '6 min read',
			date: 'Mar 25, 2025',
			icon: '📊',
			color: '#84cc16'
		},
		{
			title: 'How to Score A1 in Any Mock Exam: The CollegeCBT Method',
			excerpt: 'A proven 4-step approach: warm up with Exam Lab, take 3 consecutive mocks, analyse your heatmap, focus on your weakest 2 topics. Repeat.',
			category: 'Mock Exam Prep' as Category,
			readTime: '5 min read',
			date: 'Mar 20, 2025',
			icon: '🏆',
			color: '#84cc16'
		},
		{
			title: 'Financial Accounting: Ledger Accounts vs Trial Balance',
			excerpt: 'For 100L–200L Accounting students — the key differences, pro tips for detecting errors, and the 5 most commonly tested MCQ traps.',
			category: 'Subject Deep-Dive' as Category,
			readTime: '4 min read',
			date: 'Mar 18, 2025',
			icon: '📒',
			color: '#f59e0b'
		},
		{
			title: 'Eliminating Wrong Answers: How to Use Distractor Analysis',
			excerpt: 'CollegeCBT shows you why each wrong answer is wrong. Learn how to use this to eliminate 2 of 4 options in any MCQ within 20 seconds.',
			category: 'Strategy' as Category,
			readTime: '3 min read',
			date: 'Mar 15, 2025',
			icon: '🎯',
			color: '#e11d48'
		},
		{
			title: 'Law of Contract: Offer, Acceptance, and Consideration Simplified',
			excerpt: 'The 3 elements law students always confuse in MCQs, with landmark Nigerian cases attached to each concept for quick memorisation.',
			category: 'Subject Deep-Dive' as Category,
			readTime: '7 min read',
			date: 'Mar 10, 2025',
			icon: '⚖️',
			color: '#a855f7'
		},
		{
			title: 'Understanding Your AI Readiness Score',
			excerpt: 'What does a score of 78 mean? How is it calculated? And how do you get from 65 to 80 in 2 weeks? Full breakdown of the CollegeCBT scoring engine.',
			category: 'Exam Tips' as Category,
			readTime: '3 min read',
			date: 'Mar 5, 2025',
			icon: '📈',
			color: '#84cc16'
		}
	];

	const quickGuides = [
		{ icon: '📝', title: 'MCQ Attack Strategy', tip: 'Read the question, eliminate 2 options, then decide. Never spend more than 90s on any single question — move on and return.' },
		{ icon: '🔁', title: 'Active Recall Loop', tip: 'After each Exam Lab session, close CollegeCBT and write out everything you remember about the topic. Recall beats re-reading 5:1.' },
		{ icon: '🌡️', title: 'Use Your Heatmap', tip: 'Your topic heatmap shows exactly where to focus. Any topic below 60% needs 2 targeted sessions before your mock exam.' },
		{ icon: '⏰', title: 'Spaced Repetition', tip: 'Practise daily for 20 minutes. 20 minutes × 7 days beats 3 hours in one sitting. Consistency is the #1 predictor of exam success.' }
	];

	const categories: Category[] = ['All', 'Exam Tips', 'Study Guide', 'Strategy', 'Subject Deep-Dive', 'Mock Exam Prep'];

	let filteredArticles = $derived(articles.filter(a => {
		const matchCat = activeCategory === 'All' || a.category === activeCategory;
		const matchSearch = searchQuery === '' || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
		return matchCat && matchSearch;
	}));
</script>

<svelte:head>
	<title>Study Resources & Exam Tips — CollegeCBT | Nigerian Higher Education Guides</title>
	<meta name="description" content="Expert study guides, exam tips, and subject cheat sheets for Nigerian higher institution students. Score A1 with proven CollegeCBT strategies." />
	<meta name="keywords" content="Nigerian exam tips, CBT study guide, university exam strategy, CollegeCBT resources, how to pass exams Nigeria" />
</svelte:head>

<div class="pt-[100px] pb-20">
	<div class="page-container">

		<!-- ── Page Header ── -->
		<div class="text-center mb-12">
			<div class="section-tag">📚 Study Resources</div>
			<h1 class="font-display text-4xl sm:text-5xl mb-4">
				Exam Tips & <span style="background:linear-gradient(135deg,#a78bfa,#84cc16);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Study Guides</span>
			</h1>
			<p class="text-white/50 max-w-xl mx-auto text-lg">
				Evidence-based strategies and subject deep-dives to boost your AI Readiness Score and score A1 in your exams.
			</p>
		</div>

		<!-- ── Quick Strategy Cards ── -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
			{#each quickGuides as g}
				<div class="glass-card p-5">
					<div class="text-3xl mb-3">{g.icon}</div>
					<div class="font-bold text-sm mb-2">{g.title}</div>
					<p class="text-xs text-white/50 leading-relaxed">{g.tip}</p>
				</div>
			{/each}
		</div>

		<!-- ── Search + Filter Row ── -->
		<div class="flex flex-col sm:flex-row gap-4 mb-8">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search articles..."
				class="form-input flex-1"
				aria-label="Search articles"
			/>
			<div class="flex gap-2 flex-wrap">
				{#each categories as cat}
					<button
						onclick={() => activeCategory = cat}
						class="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
						class:category-active={activeCategory === cat}
						class:category-off={activeCategory !== cat}
						aria-pressed={activeCategory === cat}
					>
						{cat}
					</button>
				{/each}
			</div>
		</div>

		<!-- ── Articles Grid ── -->
		{#if filteredArticles.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
				{#each filteredArticles as article}
					<div class="glass-card p-6 flex flex-col hover:-translate-y-1 transition-all hover:border-violet-DEFAULT/40 group cursor-pointer">
						<!-- Category & Read Time -->
						<div class="flex justify-between items-start mb-5">
							<div class="flex items-center gap-2">
								<span class="text-2xl">{article.icon}</span>
								<span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background:{article.color}15;color:{article.color};">
									{article.category}
								</span>
							</div>
							<span class="text-xs text-white/35 flex-shrink-0">{article.readTime}</span>
						</div>

						<!-- Title -->
						<h2 class="font-bold text-lg mb-3 group-hover:text-lime-DEFAULT transition-colors leading-snug">{article.title}</h2>

						<!-- Excerpt -->
						<p class="text-sm text-white/55 mb-6 flex-1 leading-relaxed">{article.excerpt}</p>

						<!-- Footer -->
						<div class="flex justify-between items-center text-xs pt-4 border-t border-white/6">
							<span class="text-white/35">{article.date}</span>
							<span class="font-semibold transition-colors text-violet-light group-hover:text-white">Read Article →</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 text-white/40">
				<div class="text-5xl mb-4">🔍</div>
				<p class="text-lg font-semibold mb-2">No articles found</p>
				<p class="text-sm">Try adjusting your search or selecting a different category.</p>
			</div>
		{/if}

		<!-- ── Bottom CTA ── -->
		<div class="glass-card p-8 md:p-12 text-center" style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(132,204,22,0.06));border-color:rgba(124,58,237,0.25);">
			<div class="text-5xl mb-5">🤖</div>
			<h2 class="font-display text-3xl sm:text-4xl mb-4">
				Reading is Good. <span style="color:#84cc16;">Practising is Better.</span>
			</h2>
			<p class="text-white/55 max-w-lg mx-auto mb-8 leading-relaxed">
				Apply these strategies immediately in the CollegeCBT Exam Lab — unlimited AI-generated questions for every Nigerian higher education course.
			</p>
			<div class="flex flex-wrap gap-4 justify-center">
				<a href="/exam-lab" class="btn-violet px-8 py-4 text-base shadow-violet">
					🤖 Start Exam Lab — Free
				</a>
				<button onclick={() => activeModal.set('signup')} class="btn-ghost px-7 py-4 text-base">
					⏱️ Take a Mock Exam →
				</button>
			</div>
		</div>

	</div>
</div>

<style>
	.category-active {
		background: #7c3aed;
		color: #fff;
		box-shadow: 0 4px 16px rgba(124, 58, 237, 0.35);
	}
	.category-off {
		background: rgba(255, 255, 255, 0.05);
		color: #94a3b8;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.category-off:hover {
		background: rgba(124, 58, 237, 0.12);
		color: #fff;
	}
</style>
