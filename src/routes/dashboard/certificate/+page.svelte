<script lang="ts">
	import { currentUser, isAuthenticated, showToast, activeModal } from '$lib/stores';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import { browser } from '$app/environment';
	import CertificateLayout from '$lib/components/CertificateLayout.svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Auth guard
	$effect(() => {
		if (!$isAuthenticated && typeof window !== 'undefined') {
			activeModal.set('login');
		}
	});

	// Real-time session data from Convex
	const sessionsQuery = useQuery(api.sessions.getUserSessions, () => ({
		userId: $currentUser?.uid || ''
	}));

	const analyticsQuery = useQuery(api.sessions.getDashboardAnalytics, () => ({
		userId: $currentUser?.uid || ''
	}));

	// Derived stats
	let userSessions = $derived((sessionsQuery.data ?? []) as any[]);
	let analyticsData = $derived((analyticsQuery.data ?? null) as any);

	let totalAnswered = $derived(userSessions.reduce((acc: number, s: any) => acc + (s.questionsAnswered || 0), 0));
	let mockExamsCount = $derived(userSessions.filter((s: any) => s.mode === 'mock').length);
	let totalCorrect = $derived(userSessions.reduce((acc: number, s: any) => acc + (s.correct || 0), 0));
	let totalWrong = $derived(userSessions.reduce((acc: number, s: any) => acc + (s.wrong || 0), 0));

	let avgScore = $derived((() => {
		const mocks = userSessions.filter((s: any) => s.mode === 'mock');
		if (mocks.length === 0) return 0;
		const total = mocks.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
		return Math.round(total / mocks.length);
	})());

	// Compute time spent (approx 90s per question)
	let timeSpent = $derived((() => {
		const totalSecs = totalAnswered * 90;
		const hrs = Math.floor(totalSecs / 3600);
		const mins = Math.floor((totalSecs % 3600) / 60);
		if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
		return `${mins} min${mins !== 1 ? 's' : ''}`;
	})());

	// Most-practised course
	let mostPracticedCourse = $derived((() => {
		const courseCounts: Record<string, number> = {};
		userSessions.forEach((s: any) => {
			if (s.course) courseCounts[s.course] = (courseCounts[s.course] || 0) + 1;
		});
		const entries = Object.entries(courseCounts).sort((a, b) => b[1] - a[1]);
		return entries.length > 0 ? entries[0][0] : '';
	})());

	let isGenerating = $state(false);
	let containerWidth = $state(1122);

	onMount(() => {
		// Responsive certificate scaling
		function updateScale() {
			const wrapper = document.getElementById('cert-wrapper');
			if (wrapper) {
				containerWidth = wrapper.clientWidth;
			}
		}
		updateScale();
		const ro = new ResizeObserver(updateScale);
		const wrapper = document.getElementById('cert-wrapper');
		if (wrapper) ro.observe(wrapper);
		return () => ro.disconnect();
	});

	let certScale = $derived(Math.min(1, (containerWidth - 32) / 1122));
	let certHeight = $derived(794 * certScale);

	async function downloadCertificate() {
		if (!browser) return;
		if (!$currentUser) {
			showToast('⚠️ Sign In Required', 'Please sign in to download your certificate.', 'error');
			return;
		}
		if (totalAnswered < 5) {
			showToast('⚠️ More Practice Needed', 'Complete at least 5 questions to earn your certificate.', 'info');
			return;
		}
		isGenerating = true;
		showToast('🎓 Generating', 'Preparing your official certificate...', 'info');
		try {
			const html2canvas = (await import('html2canvas')).default;
			const { jsPDF } = await import('jspdf');

			const element = document.getElementById('certificate-container');
			if (!element) throw new Error('Certificate element not found');

			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
				logging: false
			});

			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

			const safeName = ($currentUser.displayName || 'Student').replace(/\s+/g, '_');
			pdf.save(`${safeName}_CollegeCBT_Certificate.pdf`);
			showToast('✅ Downloaded!', 'Your certificate has been saved.', 'success');
		} catch (err) {
			console.error('Certificate generation error:', err);
			showToast('❌ Generation Failed', 'Please try again or contact support.', 'error');
		} finally {
			isGenerating = false;
		}
	}

	let loading = $derived(sessionsQuery.isLoading || analyticsQuery.isLoading);
	let hasSufficientData = $derived(totalAnswered >= 5 || mockExamsCount >= 1);

	let eligibilityMessage = $derived(
		!$currentUser ? 'Sign in to view your certificate.' :
		totalAnswered === 0 ? 'Start practising to earn your certificate.' :
		totalAnswered < 5 ? `Answer ${5 - totalAnswered} more question(s) to unlock your certificate.` :
		''
	);
</script>

<svelte:head>
	<title>My Certificate — CollegeCBT | Performance Certificate Download</title>
	<meta name="description" content="Download your official CollegeCBT Certificate of Readiness based on your AI exam practice performance." />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="pb-20" in:fly={{ y: 20, duration: 400 }}>
	<div class="page-container py-8">
		<!-- Page header -->
		<div class="mb-8">
			<div class="section-tag">🎓 Performance Certificate</div>
			<h1 class="font-display text-3xl sm:text-4xl mb-2">Your Official Certificate</h1>
			<p class="text-white/40 text-sm max-w-xl">
				Your personalised Certificate of Readiness — auto-generated from your real practice data. Download it as a high-quality A4 PDF.
			</p>
		</div>

		<!-- Stats summary row -->
		{#if $currentUser && !loading}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
				{#each [
					{ icon: '📝', value: totalAnswered, label: 'Questions Done', color: '#a78bfa' },
					{ icon: '🏆', value: mockExamsCount, label: 'Mock Exams', color: '#84cc16' },
					{ icon: '✅', value: totalCorrect, label: 'Correct Answers', color: '#22d3ee' },
					{ icon: '📈', value: avgScore + '%', label: 'Average Score', color: '#f59e0b' }
				] as stat}
					<div class="glass-card p-4 relative overflow-hidden">
						<div class="absolute top-0 left-0 right-0 h-0.5" style="background:{stat.color};"></div>
						<div class="text-2xl mb-1">{stat.icon}</div>
						<div class="font-display text-2xl" style="color:{stat.color};">{stat.value}</div>
						<div class="text-xs text-white/40">{stat.label}</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Loading state -->
		{#if loading}
			<div class="glass-card p-10 text-center mb-8">
				<div class="w-12 h-12 border-2 border-violet-DEFAULT/20 border-t-violet-DEFAULT rounded-full animate-spin mx-auto mb-4"></div>
				<p class="text-white/40 text-sm">Loading your performance data...</p>
			</div>
		{:else if !$currentUser}
			<div class="glass-card p-10 text-center mb-8" style="border-color:rgba(124,58,237,0.3);">
				<div class="text-5xl mb-4">🔒</div>
				<h2 class="font-bold text-lg mb-2">Sign In to View Your Certificate</h2>
				<p class="text-white/40 text-sm mb-6">Your certificate is generated from your live practice data.</p>
				<button onclick={() => activeModal.set('login')} class="btn-violet px-8 min-h-[44px] inline-flex items-center gap-2">
					Sign In →
				</button>
			</div>
		{:else if !hasSufficientData}
			<div class="glass-card p-10 text-center mb-8" style="border-color:rgba(132,204,22,0.25);background:rgba(132,204,22,0.04);">
				<div class="text-5xl mb-4">📚</div>
				<h2 class="font-bold text-lg mb-2">Keep Practising!</h2>
				<p class="text-white/40 text-sm mb-2">{eligibilityMessage}</p>
				<p class="text-xs text-white/30 mb-6">Complete at least 5 questions to unlock your certificate.</p>
				<a href="/exam-lab" class="btn-violet px-8 min-h-[44px] inline-flex items-center gap-2">
					🤖 Go to Exam Lab →
				</a>
			</div>
		{:else}
			<!-- Certificate preview -->
			<div class="glass-card p-6 mb-6 rounded-3xl" style="border-color:rgba(132,204,22,0.2);">
				<div class="flex items-center justify-between flex-wrap gap-4 mb-6">
					<div>
						<div class="font-bold text-lg flex items-center gap-2">
							🎓 Certificate Preview
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/30 uppercase tracking-wider">Official</span>
						</div>
						<p class="text-xs text-white/40 mt-0.5">Scroll horizontally on small screens</p>
					</div>
					<button
						onclick={downloadCertificate}
						disabled={isGenerating}
						class="btn-violet min-h-[44px] px-6 flex items-center gap-2 text-sm font-bold shadow-violet disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isGenerating}
							<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Generating PDF...
						{:else}
							📄 Download Certificate (PDF)
						{/if}
					</button>
				</div>

				<!-- Responsive scaler wrapper -->
				<div id="cert-wrapper" class="w-full overflow-hidden rounded-2xl bg-gray-100 p-4">
					<div
						style="
							transform-origin: top left;
							transform: scale({certScale});
							width: 1122px;
							height: {certHeight}px;
						"
					>
						<CertificateLayout
							studentName={($currentUser.displayName ?? 'STUDENT').toUpperCase()}
							questionsAnswered={totalAnswered}
							mockExamsCompleted={mockExamsCount}
							{timeSpent}
							averageScore="{avgScore}%"
							totalCorrectAnswers={totalCorrect}
							totalFailedQuestions={totalWrong}
							course={mostPracticedCourse}
							institution={$currentUser.institutionName ?? ''}
							level={$currentUser.level ?? ''}
						/>
					</div>
				</div>
			</div>

			<!-- Tips -->
			<div class="glass-card p-5">
				<div class="font-bold text-sm mb-3">💡 Certificate Tips</div>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/50">
					<div class="flex gap-2 items-start">
						<span class="text-lime-400 flex-shrink-0">✓</span>
						<span>Download as PDF for the best print quality on A4 paper.</span>
					</div>
					<div class="flex gap-2 items-start">
						<span class="text-lime-400 flex-shrink-0">✓</span>
						<span>Your stats update in real time as you keep practising.</span>
					</div>
					<div class="flex gap-2 items-start">
						<span class="text-lime-400 flex-shrink-0">✓</span>
						<span>Upgrade to Student Pro for a verified digital seal on your certificate.</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
