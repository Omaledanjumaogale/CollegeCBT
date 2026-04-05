<script lang="ts">
	let { 
		studentName = '',
		questionsAnswered = 0,
		mockExamsCompleted = 0,
		timeSpent = 'N/A',
		averageScore = '0%',
		totalCorrectAnswers = 0,
		totalFailedQuestions = 0,
		course = '',
		institution = '',
		level = '',
		date = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
	} = $props<{
		studentName?: string;
		questionsAnswered?: number | string;
		mockExamsCompleted?: number | string;
		timeSpent?: string;
		averageScore?: string | number;
		totalCorrectAnswers?: number | string;
		totalFailedQuestions?: number | string;
		course?: string;
		institution?: string;
		level?: string;
		date?: string;
	}>();
</script>

<!--
	A4 Landscape certificate: 1122×794 CSS px (96dpi equivalent of 297×210mm)
	html2canvas captures this at scale:2 → 2244×1588 → placed into PDF landscape A4
-->
<div
	id="certificate-container"
	class="relative overflow-hidden bg-white font-sans text-black"
	style="width:1122px;height:794px;flex-shrink:0;"
>
	<!-- ── Outer decorative border ── -->
	<div class="absolute inset-[24px] border-[12px] border-[#064E3B] rounded-sm pointer-events-none z-10" style="border-style: double;"></div>
	<div class="absolute inset-[40px] border-2 border-[#A3E635]/80 rounded-sm pointer-events-none z-10"></div>

	<!-- ── Background gradient panels ── -->
	<div class="absolute inset-0 z-0" style="background:linear-gradient(135deg,#f0fdf4 0%,#ffffff 50%,#f0fdf4 100%);"></div>

	<!-- ── Watermark ── -->
	<div class="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none opacity-[0.03]">
		<span style="font-size:320px;font-weight:900;color:#064E3B;transform:rotate(-30deg);font-family:Arial,sans-serif;letter-spacing:-0.05em;">CBT</span>
	</div>

	<!-- ── Main content ── -->
	<div class="absolute inset-0 z-20 flex flex-col items-center px-[100px] pt-[80px] pb-[80px]">

		<!-- TOP HEADER ROW -->
		<div class="w-full flex items-center justify-between mb-8">
			<!-- Org name left -->
			<div class="text-left">
				<p style="font-size:16px;font-weight:700;color:#6b7280;letter-spacing:0.15em;font-family:Arial,sans-serif;text-transform:uppercase;">Elite Workforce Impact Nigeria</p>
				<p style="font-size:16px;font-weight:700;color:#6b7280;letter-spacing:0.15em;font-family:Arial,sans-serif;text-transform:uppercase;">(E-WIN) Project</p>
			</div>
			<!-- CollegeCBT logo centre -->
			<div class="text-center">
				<p style="font-size:48px;font-weight:900;letter-spacing:-0.02em;font-family:Arial,sans-serif;line-height:1;">
					<span style="color:#064E3B;">College</span><span style="color:#16a34a;">CBT</span>
				</p>
				<p style="font-size:14px;letter-spacing:0.25em;color:#6b7280;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px;">AI Exam Preparation Platform</p>
			</div>
			<!-- Date right -->
			<div class="text-right">
				<p style="font-size:16px;font-weight:700;color:#6b7280;letter-spacing:0.1em;font-family:Arial,sans-serif;text-transform:uppercase;">Date Issued</p>
				<p style="font-size:18px;font-weight:700;color:#374151;font-family:Arial,sans-serif;">{date}</p>
			</div>
		</div>

		<!-- THIN DIVIDER -->
		<div class="w-full mb-8" style="height:4px;background:linear-gradient(90deg,transparent,#064E3B 20%,#A3E635 50%,#064E3B 80%,transparent);"></div>

		<!-- CERTIFICATE TYPE -->
		<div class="text-center mb-4">
			<p style="font-size:18px;font-weight:700;letter-spacing:0.4em;color:#6b7280;text-transform:uppercase;font-family:Arial,sans-serif;">CollegeCBT Preparatory Test Report</p>
		</div>

		<!-- MAIN TITLE -->
		<h2 style="font-size:64px;font-weight:900;color:#064E3B;letter-spacing:0.04em;text-transform:uppercase;font-family:Georgia,serif;text-align:center;margin-bottom:12px;line-height:1.1;">
			Certificate of Readiness
		</h2>

		<!-- CERTIFY LINE -->
		<p style="font-size:24px;color:#374151;font-style:italic;font-family:Georgia,serif;margin-bottom:12px;">
			This is to certify that
		</p>

		<!-- STUDENT NAME -->
		<div class="text-center mb-6 px-12 py-2">
			<h1 style="font-size:64px;font-weight:900;color:#111827;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.04em;line-height:1.2;padding-bottom:12px;border-bottom:4px solid #064E3B;display:inline-block;">
				{studentName}
			</h1>
		</div>

		<!-- ACCOLADE TEXT -->
		<p style="font-size:20px;color:#374151;font-style:italic;font-family:Georgia,serif;text-align:center;max-width:850px;line-height:1.6;margin-bottom:24px;">
			has demonstrated exceptional commitment and achieved outstanding results in AI-powered exam preparation
			{#if course} for <strong style="color:#064E3B">{course}</strong>{/if}
			{#if level} at <strong style="color:#064E3B">{level}</strong>{/if}
			{#if institution} — <strong style="color:#064E3B">{institution}</strong>{/if}.
		</p>

		<!-- THIN DIVIDER -->
		<div class="w-[60%] mb-[30px]" style="height:2px;background:rgba(6,78,59,0.2);"></div>

		<!-- STATS + SIGNATURE ROW -->
		<div class="w-full flex items-end justify-between gap-10 mt-auto px-[30px]">

			<!-- LEFT: Performance Stats -->
			<div style="background:rgba(240,253,244,0.9);border:2px solid #A3E635;border-radius:16px;padding:24px 30px;width:480px;flex-shrink:0;">
				<h4 style="font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#064E3B;border-bottom:2px solid #A3E635;padding-bottom:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;font-family:Arial,sans-serif;">
					Performance Record <span style="font-size:24px;">🏆</span>
				</h4>
				<div style="display:grid;grid-template-columns:1fr auto;gap:12px 30px;font-family:Arial,sans-serif;align-items:center;">
					{#each [
						{ label: 'Mock Exams Completed', value: mockExamsCompleted, color: '#374151' },
						{ label: 'Total Questions Answered', value: questionsAnswered, color: '#374151' },
						{ label: 'Total Correct Answers', value: totalCorrectAnswers, color: '#15803d' },
						{ label: 'Total Incorrect Answers', value: totalFailedQuestions, color: '#dc2626' },
						{ label: 'Total Study Time', value: timeSpent, color: '#1d4ed8' }
					] as row}
						<span style="font-size:16px;font-weight:600;color:#4b5563;">{row.label}:</span>
						<span style="font-size:18px;font-weight:700;color:{row.color};text-align:right;">{row.value}</span>
					{/each}
					<!-- Average score full row -->
					<div style="grid-column:1/-1;border-top:2px solid #bbf7d0;margin-top:12px;padding-top:12px;display:grid;grid-template-columns:1fr auto;gap:0 30px;align-items:center;">
						<span style="font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#111827;font-family:Arial,sans-serif;">Average Score:</span>
						<span style="font-size:28px;font-weight:900;color:#064E3B;text-align:right;">{averageScore}</span>
					</div>
				</div>
			</div>

			<!-- CENTRE: Verification seal -->
			<div class="flex flex-col items-center flex-1">
				<div style="width:140px;height:140px;border-radius:50%;border:6px solid #064E3B;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0fdf4,#dcfce7);box-shadow:0 8px 30px rgba(6,78,59,0.25);">
					<span style="font-size:48px;line-height:1;font-weight:900;color:#A3E635;margin-bottom:4px;">✓</span>
					<span style="font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#064E3B;font-family:Arial,sans-serif;">Verified</span>
				</div>
				<p style="font-size:14px;font-weight:600;color:#6b7280;text-align:center;margin-top:16px;font-family:Arial,sans-serif;max-width:160px;line-height:1.4;">
					CollegeCBT Digital Certificate
				</p>
			</div>

			<!-- RIGHT: Signature block -->
			<div style="width:300px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding-bottom:10px;">
				<!-- Signature area placeholder -->
				<div style="height:80px;width:100%;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;">
					<span style="font-size:42px;font-style:italic;font-weight:700;font-family:Georgia,serif;color:#064E3B;letter-spacing:-0.02em;opacity:0.9;">E-WIN Project</span>
				</div>
				<div style="width:100%;border-top:3px solid #111827;margin-bottom:12px;"></div>
				<p style="font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#111827;text-align:center;font-family:Arial,sans-serif;">Project Founder</p>
				<p style="font-size:14px;font-weight:600;color:#6b7280;text-align:center;font-family:Arial,sans-serif;margin-top:4px;">Elite Workforce Impact Nigeria</p>
			</div>
		</div>
	</div>
</div>
