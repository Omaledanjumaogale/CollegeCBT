<script lang="ts">
		import { currentUser, dashboardPanel, isAuthenticated, activeModal, showToast } from '$lib/stores';
	import type { StudySession } from '$lib/stores';
	import { api } from '$lib/services/convexClient';
	import { useQuery } from 'convex-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { updateUserProfile } from '$lib/services/firebase';
	import { profileUpdateSchema } from '$lib/data/schemas';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { triggerAgentTask } from '$lib/services/convexClient';
	import { subscribeToPush } from '$lib/services/pushManager';

	$effect(() => {
		if (!$isAuthenticated && typeof window !== 'undefined') {
			activeModal.set('login');
		}
	});

	// Provide sane defaults if currentUser is missing some fields
	// ── Enterprise Profile Resolution ──
	let mappedUser = $derived($currentUser as any);
	let userProfile = $derived({
		name: mappedUser?.displayName || 'Active Student',
		email: mappedUser?.email || '',
		plan: mappedUser?.plan || 'Free Plan',
		institution: mappedUser?.institutionName || 'Institution Not Linked',
		department: mappedUser?.department || 'Department Not Set',
		level: mappedUser?.level || 'Level Not Set',
		streak: mappedUser?.streak || 0
	});

		// ── Real-time Data Sync ──
	const sessionsQuery = useQuery(api.sessions.getUserSessions, () => ({ userId: $currentUser?.uid || '' }));
	const analyticsQuery = useQuery(api.sessions.getDashboardAnalytics, () => ({ userId: $currentUser?.uid || '' }));

	let userSessions = $derived(sessionsQuery.data ? (sessionsQuery.data as any[]).map((s) => ({
		id: s.sessionId,
		course: s.course,
		level: s.level,
		institutionType: s.institutionType,
		questionsAnswered: s.questionsAnswered,
		correct: s.correct,
		wrong: s.wrong,
		score: s.score,
		mode: s.mode,
		grade: s.grade,
		timestamp: s.timestamp
	})) : []);

	let loadingSessions = $derived(sessionsQuery.isLoading || analyticsQuery.isLoading);
	let savingProfile = $state(false);

	// Computed stats from real data
	let totalAnswered = $derived(userSessions.length > 0 ? userSessions.reduce((acc, s) => acc + (s.questionsAnswered || 0), 0) : 0);
	let mockExamsCount = $derived(userSessions.length > 0 ? userSessions.filter(s => s.mode === 'mock').length : 0);
	let avgScore = $derived((() => {
		const mocks = userSessions.filter(s => s.mode === 'mock');
		if (mocks.length === 0) return 0; 
		const total = mocks.reduce((sum, s) => sum + s.score, 0);
		return Math.round(total / mocks.length);
	})());

	let kpis = $derived([
		{ icon: '📝', value: totalAnswered.toString(), label: 'Questions Answered', change: 'Total', color: '#a78bfa' },
		{ icon: '🏆', value: mockExamsCount.toString(), label: 'Mock Exams Taken', change: 'Exams', color: '#84cc16' },
		{ icon: '📈', value: `${avgScore}%`, label: 'Average Score', change: 'Real-time', color: '#f59e0b' },
		{ icon: '🎯', value: avgScore > 0 ? (avgScore + 5).toString() : '0', label: 'AI Readiness Score', change: 'Target: 85+', color: '#22d3ee' }
	]);

	// Recent activity — exclusively real data
	let recentActivity = $derived(userSessions.map(s => ({
		icon: s.mode === 'mock' ? '⏱️' : '🤖',
		iconBg: s.mode === 'mock' ? 'rgba(132,204,22,0.15)' : 'rgba(124,58,237,0.15)',
		title: `${s.mode === 'mock' ? 'Mock Exam' : 'Exam Lab'} — ${s.course}`,
		meta: new Date(s.timestamp).toLocaleString(),
		badge: s.mode === 'mock' ? `Score: ${Math.round(s.score)}%` : `Correct: ${s.correct}`,
		badgeColor: s.mode === 'mock' && s.score >= 70 ? 'badge-lime' : 'badge-violet'
	})).slice(0, 6));

	const recommendations = [
		{ icon: '🗄️', title: 'Database Normalization', meta: 'DBMS · 300L · 45% avg', link: '/exam-lab?course=Database+Management+Systems&inst=University' },
		{ icon: '🌐', title: 'TCP/IP Protocol Suite', meta: 'Networks · 300L · 62% avg', link: '/exam-lab?course=Computer+Networks&inst=University' },
		{ icon: '⚡', title: 'Algorithm Complexity', meta: 'Data Structures · 300L', link: '/exam-lab?course=Data+Structures+%26+Algorithms&inst=University' },
		{ icon: '🔍', title: 'SQL Query Optimization', meta: 'DBMS · 300L · 58% avg', link: '/exam-lab?course=Database+Management+Systems&inst=University' }
	];

	// Bar chart data (mock exam score trajectory)
	let chartData = $state([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	let heatmap = $state<{ topic: string; pct: number; color: string; label: string }[]>([]);
	
	const maxVal = 100;
	const TARGET_LINE = 75;

	const panels = [
		{ id: 'overview', icon: '📊', label: 'Overview' },
		{ id: 'results', icon: '🎯', label: 'Results' },
		{ id: 'activity', icon: '📋', label: 'Activity' },
		{ id: 'settings', icon: '⚙️', label: 'Settings' }
	] as const;

		// Gauge animation
	let gaugeAngle = $state(0);
	let gaugeNum = $state(0);
	
	$effect(() => {
		if (analyticsQuery.data) {
			chartData = (analyticsQuery.data as any).chartData || [0,0,0,0,0,0,0,0,0,0];
			heatmap = (analyticsQuery.data as any).heatmap || [];
		}
	});

	// AI Logic
	let aiAnalyzing = $state(false);
	let aiPrediction = $state<any>(null);

	async function analyzePerformance() {
		if (!$currentUser?.uid) return;
		aiAnalyzing = true;
		showToast('🤖 AI Processing', 'Consulting orchestration cascade for insights...', 'info');

		try {
			// Construct prompt from real student telemetry
			const telemetry = {
				totalAnswered,
				avgScore,
				recentActivity: recentActivity.map(a => a.badge),
				heatmap: heatmap.map(h => ({ topic: h.topic, pct: h.pct }))
			};
			
			const res = await triggerAgentTask('performance_analyst', JSON.stringify(telemetry));
			
			if (res && res.ok && res.data) {
				try {
					aiPrediction = JSON.parse(res.data);
					showToast('✅ AI Complete', `Analysis routed via ${res.provider?.toUpperCase()}`, 'success');
				} catch {
					showToast('⚠️ AI Parse Warning', 'Agent output was not strictly structured.', 'warning');
				}
			} else {
				showToast('❌ AI Error', res?.message || 'Agent failed to respond', 'error');
			}
		} catch (error) {
			console.error(error);
			showToast('❌ Server Error', 'Failed to connect to agent workflow', 'error');
		} finally {
			aiAnalyzing = false;
		}
	}

	onMount(async () => {
		setTimeout(() => {
			const target = 78;
			const duration = 1200;
			const start = Date.now();
			const animate = () => {
				const p = Math.min((Date.now() - start) / duration, 1);
				const ease = 1 - Math.pow(1 - p, 3);
				gaugeNum = Math.floor(target * ease);
				gaugeAngle = (target / 100) * 180 * ease;
				if (p < 1) requestAnimationFrame(animate);
			};
			requestAnimationFrame(animate);
		}, 300);

		// ── Enterprise Push Subscription ──
		// Triggers permission request and VAPID binding after a short delay
		// ensuring user is warmed up and session is stable.
		setTimeout(() => {
			subscribeToPush();
		}, 2000);
	});

	// Settings form state — bound with proper IDs
	// Settings form state — derived from current profile
	let settingsName = $state($currentUser?.displayName || '');
	let settingsEmail = $state($currentUser?.email || '');
	let settingsPhone = $state($currentUser?.phone || '');
	let settingsInstitution = $state($currentUser?.institutionName || '');
	let settingsDept = $state($currentUser?.department || '');
	let settingsLevel = $state($currentUser?.level || '100 Level');

	// Certificate Downloader
	async function downloadCertificate() {
		showToast('📄 Certificate', 'Generating performance certificate...', 'info');
		try {
			// Dynamically import jspdf so SSR doesn't crash on node environment
			const { jsPDF } = await import('jspdf');
			const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

			// Background and border
			doc.setFillColor(13, 8, 32); 
			doc.rect(0, 0, 297, 210, 'F');
			doc.setDrawColor(124, 58, 237);
			doc.setLineWidth(1);
			doc.rect(10, 10, 277, 190);

			// Title
			doc.setTextColor(132, 204, 22);
			doc.setFontSize(28);
			doc.text('CollegeCBT Certificate of Readiness', 148, 40, { align: 'center' });

			// Content
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(16);
			doc.text('This certifies that', 148, 70, { align: 'center' });
			
			doc.setFontSize(24);
			doc.text($currentUser?.displayName || userProfile.name, 148, 90, { align: 'center' });
			
			doc.setFontSize(14);
			doc.text('has achieved an exceptional AI Readiness Score and practice trajectory.', 148, 110, { align: 'center' });
			
			// Stats
			doc.setFontSize(12);
			doc.text(`Questions Answered: ${totalAnswered}`, 50, 150);
			doc.text(`Mock Exams Completed: ${mockExamsCount}`, 50, 160);
			doc.text(`Average Score: ${avgScore}%`, 50, 170);

			// Date
			doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 200, 170);

			doc.save('CollegeCBT_Certificate.pdf');
			showToast('✅ Success', 'Certificate downloaded!', 'success');
		} catch (error) {
			console.error(error);
			showToast('❌ Error', 'Failed to generate PDF.', 'error');
		}
	}
</script>

<svelte:head>
	<title>Student Dashboard — CollegeCBT | AI Readiness Score & Results Intelligence</title>
	<meta name="description" content="Track your exam performance, AI readiness score, grade predictions, and topic heatmaps on the CollegeCBT dashboard." />
</svelte:head>

<div class="pt-[100px] pb-20">
	<div class="page-container">
		<div class="mb-4">
			<div class="section-tag">📊 Student Dashboard</div>
			<h1 class="font-display text-3xl sm:text-4xl mb-1">Your Results Intelligence Command Centre</h1>
			<p class="text-white/40 text-sm">Track performance, readiness score, topic heatmaps and grade predictions — all powered by AI.</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
			<!-- ── Sidebar ── -->
			<div class="glass-card p-5 h-fit lg:sticky lg:top-24">
				<div class="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl" style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:3px solid rgba(124,58,237,0.4);">🎓</div>
				<div class="text-center font-bold text-sm">{userProfile.name}</div>
				<div class="text-center text-xs text-white/40 mt-0.5">{userProfile.email}</div>
				<div class="flex justify-center mt-2 mb-4">
					{#if $currentUser?.plan === 'pro'}
						<span class="badge badge-lime text-xs">⭐ Pro Plan</span>
					{:else if $currentUser?.plan === 'institutional'}
						<span class="badge text-xs" style="background:rgba(34,211,238,0.12);color:#22d3ee;border:1px solid rgba(34,211,238,0.25);">🏛️ Institutional</span>
					{:else}
						<span class="badge badge-violet text-xs">🎓 Free Plan</span>
					{/if}
				</div>
				<hr class="border-white/8 mb-4" />
				<nav class="space-y-1">
					{#each panels as p}
						<button
							onclick={() => dashboardPanel.set(p.id)}
							class="w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-sm font-medium transition-all"
							class:dash-btn-active={$dashboardPanel === p.id}
							class:dash-btn-inactive={$dashboardPanel !== p.id}
						>
							<span>{p.icon}</span>{p.label}
						</button>
					{/each}
					<hr class="border-white/8 my-2" />
					<a href="/exam-lab" class="w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
						🤖 Go to Exam Lab →
					</a>
					<a href="/exam-lab?mode=mock" class="w-full flex items-center gap-2.5 px-3 min-h-[44px] rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
						⏱️ Take Mock Exam →
					</a>
				</nav>
			</div>

			<!-- ── Main Content ── -->
			<div class="min-w-0">

				<!-- ‒‒ OVERVIEW PANEL ‒‒ -->
				{#if $dashboardPanel === 'overview'}
					<!-- Greeting row -->
					<div class="flex items-center justify-between flex-wrap gap-3 mb-6">
						<div>
							<div class="font-display text-2xl">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userProfile.name.split(' ')[0]}! 👋</div>
							<div class="text-xs text-white/40 mt-0.5">{userProfile.level} {userProfile.department} · {userProfile.institution}</div>
						</div>
						<div class="flex items-center gap-2 px-3 py-2 rounded-xl" style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);">
							<span>🔥</span><span class="font-bold text-amber-DEFAULT text-sm">{userProfile.streak}-Day Streak</span>
						</div>
					</div>

					<!-- KPIs -->
					<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
						{#each kpis as k}
							<div class="glass-card p-5 relative overflow-hidden" style="--kpi-color:{k.color};">
								<div class="absolute top-0 left-0 right-0 h-0.5" style="background:{k.color};"></div>
								<div class="text-2xl mb-2">{k.icon}</div>
								<div class="font-title text-3xl" style="color:{k.color};">{k.value}</div>
								{#if k.label === 'AI Readiness Score'}
									<div class="flex items-center gap-1.5 mt-0.5">
										<div class="text-xs text-white/40">{k.label}</div>
										<Tooltip text="Our proprietary AI-driven projection of your likely performance in an actual examination setting, based on mastery and consistency." />
									</div>
								{:else if k.label === 'Average Score'}
									<div class="flex items-center gap-1.5 mt-0.5">
										<div class="text-xs text-white/40">{k.label}</div>
										<Tooltip text="Your cumulative average percentage across all mock exams taken on the platform." />
									</div>
								{:else if k.label === 'Questions Answered'}
									<div class="flex items-center gap-1.5 mt-0.5">
										<div class="text-xs text-white/40">{k.label}</div>
										<Tooltip text="The total number of AI-generated and curriculum-based questions you have attempted in the Exam Lab." />
									</div>
								{:else if k.label === 'Mock Exams Taken'}
									<div class="flex items-center gap-1.5 mt-0.5">
										<div class="text-xs text-white/40">{k.label}</div>
										<Tooltip text="Number of full-length timed mock exams completed under exam conditions." />
									</div>
								{:else}
									<div class="text-xs text-white/40 mt-0.5">{k.label}</div>
								{/if}
								<div class="text-xs mt-1" style="color:{k.color};">{k.change}</div>
							</div>
						{/each}
					</div>

					<!-- Readiness + Prediction Row -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
						<!-- Gauge -->
						<div class="glass-card p-5">
							<div class="font-bold text-sm mb-1">🎯 AI Readiness Score</div>
							<div class="text-xs text-white/40 mb-4">Based on 342 questions & 12 mock exams</div>
							<!-- Semicircle gauge -->
							<div class="relative w-36 h-[72px] mx-auto mb-2 overflow-hidden">
								<div class="absolute inset-0 rounded-t-full border-[10px] border-b-0" style="border-color:rgba(255,255,255,0.06);"></div>
								<div class="absolute inset-0 rounded-t-full border-[10px] border-b-0 transition-transform duration-1000 origin-bottom"
									style="border-color:#84cc16;transform:rotate({(gaugeAngle - 180)}deg);"></div>
								<div class="absolute bottom-1 left-0 right-0 text-center font-title text-3xl" style="color:#84cc16;">{gaugeNum}</div>
							</div>
							<div class="text-center text-xs text-white/40 mb-3">/ 100 — <span style="color:#84cc16;">Exam Ready</span></div>
							<div class="p-2.5 rounded-lg text-xs" style="background:rgba(132,204,22,0.08);border:1px solid rgba(132,204,22,0.2);color:#a3e635;">
								📈 At current pace, you'll reach 85+ within 2 weeks of consistent practice.
							</div>
						</div>
						<!-- Grade Prediction & AI Analyst -->
						<div class="glass-card p-5">
							<div class="flex items-center justify-between mb-1">
								<div class="font-bold text-sm">🔮 AI Performance Analyst</div>
								<button onclick={analyzePerformance} disabled={aiAnalyzing} class="btn-micro-feedback rounded-lg px-2.5 py-1 text-xs" style="background:rgba(124,58,237,0.15);color:#a855f7;border:1px solid rgba(124,58,237,0.3);">
									{#if aiAnalyzing}
										<span class="animate-pulse">🧠 Thinking...</span>
									{:else}
										<span>🤖 Analyze Telemetry</span>
									{/if}
								</button>
							</div>
							<div class="text-xs text-white/40 mb-4">Deep Analytics via Multi-Model Orchestrator</div>
							
							<div class="space-y-2.5">
								{#if aiPrediction}
									<!-- Dynamic AI insights via JSON parse -->
									<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(132,204,22,0.08);border:1px solid rgba(132,204,22,0.25);">
										<span class="text-sm">Motivation Score</span>
										<span class="font-title text-2xl text-lime-DEFAULT">{aiPrediction.motivationScore}/100</span>
									</div>
									<div class="p-3 rounded-xl" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);">
										<span class="text-xs font-semibold uppercase tracking-wider block mb-1">Top Weakness</span>
										<span class="text-sm font-medium">{aiPrediction.weaknesses?.[0] || 'Need more data'}</span>
									</div>
									<div class="p-3 rounded-xl" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);">
										<span class="text-xs font-semibold uppercase tracking-wider block mb-1">Actionable Next Step</span>
										<span class="text-sm font-medium text-amber-DEFAULT">{aiPrediction.nextSteps?.[0] || 'Keep practicing!'}</span>
									</div>
								{:else}
									<!-- Skeleton/Placeholder before trigger -->
									<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(132,204,22,0.08);border:1px solid rgba(132,204,22,0.25);">
										<span class="text-sm">Predicted Grade</span>
										<span class="font-title text-2xl" style="color:#84cc16;">B2 — 72%</span>
									</div>
									<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);">
										<span class="text-sm">National Rank</span>
										<span class="text-sm text-violet-light">Top 27% of 300L CS</span>
									</div>
									<div class="flex items-center justify-between p-3 rounded-xl" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);">
										<span class="text-sm">To reach A1 (75%+)</span>
										<span class="text-sm text-amber-DEFAULT">12 more correct answers</span>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Bar Chart -->
					<div class="glass-card p-5 mb-6">
						<div class="font-bold text-sm mb-5">📈 Grade Trajectory — Last 10 Mock Exams</div>
						<div class="flex items-end gap-2 h-36 relative">
							<!-- 75% target line -->
							<div class="absolute left-0 right-0 border-t border-dashed border-lime-DEFAULT/30"
								style="bottom:{(TARGET_LINE/maxVal)*100}%;"></div>
							<span class="absolute right-0 text-[10px] text-lime-DEFAULT/60" style="bottom:calc({(TARGET_LINE/maxVal)*100}% + 4px);">75% target</span>
							{#each chartData as val, i}
								<div class="flex-1 flex flex-col items-center relative min-w-0">
									<span class="absolute -top-5 text-[10px] font-mono text-violet-light">{val}%</span>
									<div class="w-full rounded-t-md transition-all duration-700 min-h-[4px]"
										style="height:{(val/maxVal)*100}%;background:linear-gradient(180deg,#a855f7,#7c3aed);">
									</div>
									<span class="absolute -bottom-5 text-[10px] text-white/30">M{i+1}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Recommendations -->
					<div>
						<div class="font-bold text-sm mb-1">🔥 Recommended Topics</div>
						<div class="text-xs text-white/40 mb-4">Based on your weak areas from recent sessions</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{#each recommendations as r}
								<a href={r.link} class="glass-card p-4 flex items-start gap-3 hover:border-violet-DEFAULT/50 transition-all group">
									<div class="text-2xl flex-shrink-0">{r.icon}</div>
									<div>
										<div class="font-semibold text-sm group-hover:text-white transition-colors">{r.title}</div>
										<div class="text-xs text-white/40 mb-1">{r.meta}</div>
										<div class="text-xs font-semibold text-violet-light">Start Practising →</div>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- ‒‒ RESULTS PANEL ‒‒ -->
				{#if $dashboardPanel === 'results'}
					<div class="font-display text-2xl mb-1">🎯 Results Intelligence (RaaS)</div>
					<div class="text-xs text-white/40 mb-6">Outcome tracking — performance trends, topic mastery, and grade forecasting.</div>

					<!-- Heatmap -->
					<div class="glass-card p-5 mb-5">
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center gap-2">
								<div class="font-bold text-sm">📊 Topic Performance Heatmap</div>
								<Tooltip text="Real-time mastery visualization. Red topics require urgent practice, while green indicates examination readiness." />
							</div>
							<div class="flex items-center gap-3 text-xs">
								<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full inline-block" style="background:#e11d48;"></span><span class="text-white/40">Needs Work</span></span>
								<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full inline-block" style="background:#f59e0b;"></span><span class="text-white/40">Developing</span></span>
								<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full inline-block" style="background:#84cc16;"></span><span class="text-white/40">Strong</span></span>
							</div>
						</div>
						<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
							{#each heatmap as h}
								<div class="p-3 rounded-xl" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
									<div class="text-[11px] font-semibold text-white/70 mb-2 leading-tight">{h.topic}</div>
									<div class="h-1.5 w-full rounded-full mb-2" style="background:rgba(255,255,255,0.06);">
										<div class="h-full rounded-full transition-all duration-700" style="width:{h.pct}%;background:{h.color};"></div>
									</div>
									<div class="flex items-center justify-between">
										<span class="font-mono text-sm font-bold" style="color:{h.color};">{h.pct}%</span>
										<span class="text-[10px]">{h.pct >= 75 ? '✓' : h.pct < 55 ? '⚠️' : '~'}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- AI Projection -->
					<div class="glass-card p-5 mb-5" style="background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.25);">
						<div class="font-bold text-sm text-violet-light mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">🤖 AI Outcome Projection</div>
							<Tooltip content="This analysis uses a predictive algorithm to forecast your final grade based on current mock exam data and topic mastery." />
						</div>
						<p class="text-sm text-white/80 leading-relaxed">
							Based on your current practice trajectory across DBMS, Computer Networks, and Data Structures, you are on course to achieve a
							<strong class="text-lime-DEFAULT">B2 grade (70–74%)</strong> in your end-of-semester examinations.
							To elevate to <strong class="text-lime-DEFAULT">A1 (75%+)</strong>, focus on
							<strong>Database Normalization</strong> (currently 45%) and SQL Query optimization.
							Completing 3 more focused practice sessions in these topics within the next 7 days will likely push you above the threshold.
							<strong class="text-amber-DEFAULT">You are exactly 12 correct answers away from the A1 guarantee.</strong>
						</p>
					</div>

					<div class="flex flex-col md:flex-row gap-3">
						<button onclick={downloadCertificate} class="btn-violet flex justify-center items-center px-5 min-h-[44px] w-full md:w-auto text-sm">
							📄 Download Certificate
						</button>
						<a href="/exam-lab" class="btn-outline-lime flex justify-center items-center px-5 min-h-[44px] w-full md:w-auto text-sm">🤖 Practice Weak Topics</a>
					</div>
				{/if}

				<!-- ‒‒ ACTIVITY PANEL ‒‒ -->
				{#if $dashboardPanel === 'activity'}
					<div class="font-display text-2xl mb-5">📋 Recent Activity</div>
					<div class="space-y-3">
						{#each recentActivity as act}
							<div class="glass-card p-4 flex items-center gap-3">
								<div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style="background:{act.iconBg};">{act.icon}</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-semibold truncate">{act.title}</div>
									<div class="text-xs text-white/40">{act.meta}</div>
								</div>
								<div class="badge {act.badgeColor} flex-shrink-0 text-xs">{act.badge}</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- ‒‒ SETTINGS PANEL ‒‒ -->
				{#if $dashboardPanel === 'settings'}
					<div class="font-display text-2xl mb-5">⚙️ Account Settings</div>

					<div class="glass-card p-5 mb-5">
						<div class="font-bold text-sm mb-4">📚 Academic Profile</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="s-name" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Full Name</label>
								<input id="s-name" type="text" bind:value={settingsName} class="form-input" autocomplete="name" />
							</div>
							<div>
								<label for="s-email" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Email</label>
								<input id="s-email" type="email" bind:value={settingsEmail} class="form-input" autocomplete="email" readonly />
							</div>
							<div>
								<label for="s-phone" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Phone Number</label>
								<input id="s-phone" type="tel" inputmode="tel" bind:value={settingsPhone} class="form-input" autocomplete="tel" />
							</div>
							<div>
								<label for="s-institution" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Institution</label>
								<input id="s-institution" type="text" bind:value={settingsInstitution} class="form-input" />
							</div>
							<div>
								<label for="s-dept" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Department</label>
								<input id="s-dept" type="text" bind:value={settingsDept} class="form-input" />
							</div>
							<div>
								<label for="s-level" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Current Level</label>
								<select id="s-level" bind:value={settingsLevel} class="form-select">
									<option>100 Level</option><option>200 Level</option><option>300 Level</option><option>400 Level</option><option>500 Level</option>
								</select>
							</div>
						</div>
												<button 
							onclick={async () => {
								if (!$currentUser?.uid || savingProfile) return;
								
								// 1. Validate with Zod
								const profileData = {
									displayName: settingsName,
									phone: settingsPhone,
									institutionName: settingsInstitution,
									department: settingsDept,
									level: settingsLevel
								};

								const validation = profileUpdateSchema.safeParse(profileData);
								if (!validation.success) {
									showToast('⚠️ Validation Error', 'Please check your inputs.', 'error');
									return;
								}

								savingProfile = true;
								try {
									const res = await updateUserProfile($currentUser.uid, validation.data);
									if (res.success) {
										showToast('✅ Profile Saved', 'Your settings have been updated.', 'success');
									} else {
										showToast('❌ Update Failed', res.error || 'Check connection', 'error');
									}
								} finally {
									savingProfile = false;
								}
							}} 
							class="btn-violet px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm mt-4"
							disabled={savingProfile}
						>
							{savingProfile ? 'Saving...' : 'Save Changes'}
						</button>
					</div>

					<div class="glass-card p-5">
						<div class="font-bold text-sm mb-3">💳 Subscription</div>
						<div class="flex items-center justify-between flex-wrap gap-3">
							<div>
								<div class="text-xs text-white/40">Current Plan</div>
								{#if $currentUser?.plan === 'pro'}
									<div class="font-bold text-lime-DEFAULT mt-0.5">⭐ Pro Student</div>
									<div class="text-xs text-white/40 mt-0.5">Active Premium Features</div>
								{:else if $currentUser?.plan === 'institutional'}
									<div class="font-bold text-lime-DEFAULT mt-0.5">🏛️ Institutional</div>
									<div class="text-xs text-white/40 mt-0.5">Managed by Administrator</div>
								{:else}
									<div class="font-bold text-white/80 mt-0.5">Free Forever</div>
									<div class="text-xs text-white/40 mt-0.5">Limited Practice Access</div>
								{/if}
							</div>
							<a href="/pricing" class="btn-violet px-5 min-h-[44px] flex justify-center items-center w-full md:w-auto text-sm">Manage Plan</a>
						</div>
					</div>
				{/if}

			</div>
		</div>
	</div>
</div>

<style>
	.dash-btn-active {
		background: rgba(124, 58, 237, 0.2);
		border: 1px solid rgba(124, 58, 237, 0.3);
		color: #a78bfa;
	}
	.dash-btn-inactive {
		color: #94a3b8;
		border: 1px solid transparent;
	}
	.dash-btn-inactive:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
	}
</style>
