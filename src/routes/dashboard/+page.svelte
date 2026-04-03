<script lang="ts">
	import { currentUser, dashboardPanel, isAuthenticated, activeModal, showToast } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	$: if (!$isAuthenticated && typeof window !== 'undefined') {
		// show login modal if not authenticated
		activeModal.set('login');
	}

	// Demo data for authenticated user view
	const demoUser = {
		name: 'Adaobi Chukwu',
		email: 'adaobi@unn.edu.ng',
		plan: 'Pro Student',
		institution: 'University of Nigeria, Nsukka',
		department: 'Computer Science',
		level: '300L',
		streak: 14
	};

	const kpis = [
		{ icon: '📝', value: '342', label: 'Questions Answered', change: '↑ +28 this week', color: '#a78bfa' },
		{ icon: '🏆', value: '12', label: 'Mock Exams Taken', change: 'Best: A1 (82%)', color: '#84cc16' },
		{ icon: '📈', value: '71%', label: 'Average Score', change: '↑ +6% this month', color: '#f59e0b' },
		{ icon: '🎯', value: '78', label: 'AI Readiness Score', change: 'Target: 85+', color: '#22d3ee' }
	];

	const heatmap = [
		{ topic: 'DBMS Normalization', pct: 45, color: '#e11d48' },
		{ topic: 'Computer Networks', pct: 62, color: '#f59e0b' },
		{ topic: 'Data Structures', pct: 80, color: '#84cc16' },
		{ topic: 'OOP Concepts', pct: 88, color: '#84cc16' },
		{ topic: 'SQL Queries', pct: 58, color: '#f59e0b' },
		{ topic: 'AI & ML', pct: 72, color: '#84cc16' }
	];

	const recentActivity = [
		{ icon: '✅', iconBg: 'rgba(132,204,22,0.15)', title: 'Mock Exam — Database Management Systems', meta: 'Today, 10:42 AM · 20 questions · 90s/question', badge: 'A1 — 82%', badgeColor: 'badge-lime' },
		{ icon: '🤖', iconBg: 'rgba(124,58,237,0.15)', title: 'Exam Lab — Computer Networks (MCQ)', meta: 'Yesterday, 7:15 PM · 18 questions answered', badge: '71% correct', badgeColor: 'badge-amber' },
		{ icon: '📝', iconBg: 'rgba(34,211,238,0.15)', title: 'Theory Practice — DBMS Normalization', meta: '2 days ago · 5 theory questions reviewed', badge: '+25 pts', badgeColor: 'badge-violet' },
		{ icon: '⏱️', iconBg: 'rgba(168,85,247,0.15)', title: 'Mock Exam — Data Structures & Algorithms', meta: '3 days ago · 10 questions · Timed', badge: 'B2 — 70%', badgeColor: 'badge-violet' }
	];

	const recommendations = [
		{ icon: '🗄️', title: 'Database Normalization', meta: 'DBMS · 300L · 45% avg', link: '/exam-lab?course=Database+Management+Systems&inst=University' },
		{ icon: '🌐', title: 'TCP/IP Protocol Suite', meta: 'Networks · 300L · 62% avg', link: '/exam-lab?course=Computer+Networks&inst=University' },
		{ icon: '⚡', title: 'Algorithm Complexity', meta: 'Data Structures · 300L', link: '/exam-lab?course=Data+Structures+%26+Algorithms&inst=University' },
		{ icon: '🔍', title: 'SQL Query Optimization', meta: 'DBMS · 300L · 58% avg', link: '/exam-lab?course=Database+Management+Systems&inst=University' }
	];

	// Bar chart data (mock exam scores)
	const chartData = [58, 62, 65, 60, 70, 72, 68, 75, 79, 82];
	const maxVal = 100;
	const TARGET_LINE = 75;

	const panels = [
		{ id: 'overview', icon: '📊', label: 'Overview' },
		{ id: 'results', icon: '🎯', label: 'Results' },
		{ id: 'activity', icon: '📋', label: 'Activity' },
		{ id: 'settings', icon: '⚙️', label: 'Settings' }
	] as const;

	// Gauge animation
	let gaugeAngle = 0;
	let gaugeNum = 0;
	onMount(() => {
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
	});

	// Form state for settings
	let settingsName = 'Adaobi Chukwu';
	let settingsEmail = 'adaobi@unn.edu.ng';
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
				<div class="text-center font-bold text-sm">{demoUser.name}</div>
				<div class="text-center text-xs text-white/40 mt-0.5">{demoUser.email}</div>
				<div class="flex justify-center mt-2 mb-4">
					<span class="badge badge-lime text-xs">⭐ Pro Student</span>
				</div>
				<hr class="border-white/8 mb-4" />
				<nav class="space-y-1">
					{#each panels as p}
						<button
							on:click={() => dashboardPanel.set(p.id)}
							class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
							class:dash-btn-active={$dashboardPanel === p.id}
							class:dash-btn-inactive={$dashboardPanel !== p.id}
						>
							<span>{p.icon}</span>{p.label}
						</button>
					{/each}
					<hr class="border-white/8 my-2" />
					<a href="/exam-lab" class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
						🤖 Go to Exam Lab →
					</a>
					<a href="/exam-lab?mode=mock" class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
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
							<div class="font-display text-2xl">Good morning, {demoUser.name.split(' ')[0]}! 👋</div>
							<div class="text-xs text-white/40 mt-0.5">{demoUser.level} {demoUser.department} · {demoUser.institution}</div>
						</div>
						<div class="flex items-center gap-2 px-3 py-2 rounded-xl" style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);">
							<span>🔥</span><span class="font-bold text-amber-DEFAULT text-sm">{demoUser.streak}-Day Streak</span>
						</div>
					</div>

					<!-- KPIs -->
					<div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
						{#each kpis as k}
							<div class="glass-card p-5 relative overflow-hidden" style="--kpi-color:{k.color};">
								<div class="absolute top-0 left-0 right-0 h-0.5" style="background:{k.color};"></div>
								<div class="text-2xl mb-2">{k.icon}</div>
								<div class="font-title text-3xl" style="color:{k.color};">{k.value}</div>
								<div class="text-xs text-white/40 mt-0.5">{k.label}</div>
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
						<!-- Grade Prediction -->
						<div class="glass-card p-5">
							<div class="font-bold text-sm mb-1">🔮 Grade Prediction</div>
							<div class="text-xs text-white/40 mb-4">DBMS End-of-Semester Exam</div>
							<div class="space-y-2.5">
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
						<div class="font-bold text-sm mb-4">📊 Topic Performance Heatmap</div>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{#each heatmap as h}
								<div class="glass-card p-3">
									<div class="text-xs font-semibold text-white/80 mb-2">{h.topic}</div>
									<div class="heat-bar mb-2">
										<div class="h-full rounded-full transition-all duration-700" style="width:{h.pct}%;background:{h.color};"></div>
									</div>
									<div class="font-mono text-sm font-bold" style="color:{h.color};">{h.pct}% {h.pct >= 75 ? '✓' : h.pct < 55 ? '⚠️' : ''}</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- AI Projection -->
					<div class="glass-card p-5 mb-5" style="background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.25);">
						<div class="font-bold text-sm text-violet-light mb-3 flex items-center gap-2">🤖 AI Outcome Projection</div>
						<p class="text-sm text-white/80 leading-relaxed">
							Based on your current practice trajectory across DBMS, Computer Networks, and Data Structures, you are on course to achieve a
							<strong class="text-lime-DEFAULT">B2 grade (70–74%)</strong> in your end-of-semester examinations.
							To elevate to <strong class="text-lime-DEFAULT">A1 (75%+)</strong>, focus on
							<strong>Database Normalization</strong> (currently 45%) and SQL Query optimization.
							Completing 3 more focused practice sessions in these topics within the next 7 days will likely push you above the threshold.
							<strong class="text-amber-DEFAULT">You are exactly 12 correct answers away from the A1 guarantee.</strong>
						</p>
					</div>

					<div class="flex gap-3 flex-wrap">
						<button on:click={() => showToast('📄 Certificate', 'Generating performance certificate...', 'info')} class="btn-violet px-5 py-2.5 text-sm">
							📄 Download Certificate
						</button>
						<a href="/exam-lab" class="btn-outline-lime px-5 py-2.5 text-sm">🤖 Practice Weak Topics</a>
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
								<input id="s-email" type="email" bind:value={settingsEmail} class="form-input" autocomplete="email" />
							</div>
							<div>
								<label for="s-phone" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Phone Number</label>
								<input id="s-phone" type="tel" class="form-input" value="08012345678" autocomplete="tel" />
							</div>
							<div>
								<label for="s-institution" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Institution</label>
								<input id="s-institution" type="text" class="form-input" value="University of Nigeria, Nsukka" />
							</div>
							<div>
								<label for="s-dept" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Department</label>
								<input id="s-dept" type="text" class="form-input" value="Computer Science" />
							</div>
							<div>
								<label for="s-level" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Current Level</label>
								<select id="s-level" class="form-select">
									<option>100 Level</option><option>200 Level</option><option selected>300 Level</option><option>400 Level</option>
								</select>
							</div>
						</div>
						<button on:click={() => showToast('✅ Profile Saved', 'Your settings have been updated.', 'success')} class="btn-violet px-5 py-2.5 text-sm mt-4">
							Save Changes
						</button>
					</div>

					<div class="glass-card p-5">
						<div class="font-bold text-sm mb-3">💳 Subscription</div>
						<div class="flex items-center justify-between flex-wrap gap-3">
							<div>
								<div class="text-xs text-white/40">Current Plan</div>
								<div class="font-bold text-lime-DEFAULT mt-0.5">⭐ Pro Student — ₦5,000/semester</div>
								<div class="text-xs text-white/40 mt-0.5">Renews: June 30, 2025</div>
							</div>
							<a href="/pricing" class="btn-violet px-5 py-2.5 text-sm">Manage Plan</a>
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
