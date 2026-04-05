<script lang="ts">
	let { 
		studentName = 'STUDENT NAME',
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
	<div class="absolute inset-[16px] border-[3px] border-[#064E3B] rounded-sm pointer-events-none z-10"></div>
	<div class="absolute inset-[22px] border border-[#A3E635]/60 rounded-sm pointer-events-none z-10"></div>

	<!-- ── Background gradient panels ── -->
	<div class="absolute inset-0 z-0" style="background:linear-gradient(135deg,#f0fdf4 0%,#ffffff 50%,#f0fdf4 100%);"></div>

	<!-- ── Left accent strip ── -->
	<div class="absolute left-0 top-0 bottom-0 w-[14px] z-0" style="background:linear-gradient(180deg,#064E3B,#16a34a,#A3E635);"></div>

	<!-- ── Right accent strip ── -->
	<div class="absolute right-0 top-0 bottom-0 w-[14px] z-0" style="background:linear-gradient(180deg,#064E3B,#16a34a,#A3E635);"></div>

	<!-- ── Corner ornaments ── -->
	{#each [
		'top-[30px] left-[30px]',
		'top-[30px] right-[30px] rotate-90',
		'bottom-[30px] left-[30px] -rotate-90',
		'bottom-[30px] right-[30px] rotate-180'
	] as pos}
		<div class="absolute {pos} w-10 h-10 z-[11]" style="border-top:4px solid #064E3B;border-left:4px solid #064E3B;border-radius:2px 0 0 0;"></div>
	{/each}

	<!-- ── Watermark ── -->
	<div class="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none opacity-[0.04]">
		<span style="font-size:180px;font-weight:900;color:#064E3B;transform:rotate(-30deg);font-family:Arial,sans-serif;letter-spacing:-0.05em;">CBT</span>
	</div>

	<!-- ── Main content ── -->
	<div class="absolute inset-0 z-20 flex flex-col items-center px-[90px] pt-[46px] pb-[40px]">

		<!-- TOP HEADER ROW -->
		<div class="w-full flex items-center justify-between mb-3">
			<!-- Org name left -->
			<div class="text-left">
				<p style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:0.15em;font-family:Arial,sans-serif;text-transform:uppercase;">Elite Workforce Impact Nigeria</p>
				<p style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:0.15em;font-family:Arial,sans-serif;text-transform:uppercase;">(E-WIN) Project</p>
			</div>
			<!-- CollegeCBT logo centre -->
			<div class="text-center">
				<p style="font-size:28px;font-weight:900;letter-spacing:-0.02em;font-family:Arial,sans-serif;">
					<span style="color:#064E3B;">College</span><span style="color:#16a34a;">CBT</span>
				</p>
				<p style="font-size:9px;letter-spacing:0.25em;color:#6b7280;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:1px;">AI Exam Preparation Platform</p>
			</div>
			<!-- Date right -->
			<div class="text-right">
				<p style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:0.1em;font-family:Arial,sans-serif;text-transform:uppercase;">Date Issued</p>
				<p style="font-size:10px;font-weight:700;color:#374151;font-family:Arial,sans-serif;">{date}</p>
			</div>
		</div>

		<!-- THIN DIVIDER -->
		<div class="w-full mb-4" style="height:2px;background:linear-gradient(90deg,transparent,#064E3B 20%,#A3E635 50%,#064E3B 80%,transparent);"></div>

		<!-- CERTIFICATE TYPE -->
		<div class="text-center mb-2">
			<p style="font-size:10px;font-weight:700;letter-spacing:0.4em;color:#6b7280;text-transform:uppercase;font-family:Arial,sans-serif;">CollegeCBT Preparatory Test Report</p>
		</div>

		<!-- MAIN TITLE -->
		<h2 style="font-size:36px;font-weight:900;color:#064E3B;letter-spacing:0.04em;text-transform:uppercase;font-family:Georgia,serif;text-align:center;margin-bottom:6px;line-height:1.1;">
			Certificate of Readiness
		</h2>

		<!-- CERTIFY LINE -->
		<p style="font-size:13px;color:#374151;font-style:italic;font-family:Georgia,serif;margin-bottom:6px;">
			This is to certify that
		</p>

		<!-- STUDENT NAME -->
		<div class="text-center mb-3 px-8">
			<h1 style="font-size:38px;font-weight:900;color:#111827;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.04em;line-height:1;padding-bottom:6px;border-bottom:3px solid #064E3B;display:inline-block;">
				{studentName}
			</h1>
		</div>

		<!-- ACCOLADE TEXT -->
		<p style="font-size:12px;color:#374151;font-style:italic;font-family:Georgia,serif;text-align:center;max-width:600px;line-height:1.5;margin-bottom:12px;">
			has demonstrated exceptional commitment and achieved outstanding results in AI-powered exam preparation
			{#if course} for <strong>{course}</strong>{/if}
			{#if level} at <strong>{level}</strong>{/if}
			{#if institution} — <strong>{institution}</strong>{/if}.
		</p>

		<!-- THIN DIVIDER -->
		<div class="w-[60%] mb-10" style="height:1px;background:rgba(6,78,59,0.2);"></div>

		<!-- STATS + SIGNATURE ROW -->
		<div class="w-full flex items-end justify-between gap-6 mt-auto">

			<!-- LEFT: Performance Stats -->
			<div style="background:rgba(240,253,244,0.9);border:1.5px solid #A3E635;border-radius:12px;padding:16px 20px;width:420px;flex-shrink:0;">
				<h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#064E3B;border-bottom:1.5px solid #A3E635;padding-bottom:6px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;font-family:Arial,sans-serif;">
					Performance Record <span style="font-size:14px;">🏆</span>
				</h4>
				<div style="display:grid;grid-template-columns:1fr auto;gap:5px 20px;font-family:Arial,sans-serif;">
					{#each [
						{ label: 'Mock Exams Completed', value: mockExamsCompleted, color: '#374151' },
						{ label: 'Total Questions Answered', value: questionsAnswered, color: '#374151' },
						{ label: 'Total Correct Answers', value: totalCorrectAnswers, color: '#15803d' },
						{ label: 'Total Incorrect Answers', value: totalFailedQuestions, color: '#dc2626' },
						{ label: 'Total Study Time', value: timeSpent, color: '#1d4ed8' }
					] as row}
						<span style="font-size:11px;font-weight:600;color:#4b5563;">{row.label}:</span>
						<span style="font-size:11px;font-weight:700;color:{row.color};text-align:right;">{row.value}</span>
					{/each}
					<!-- Average score full row -->
					<div style="grid-column:1/-1;border-top:1px solid #d1fae5;margin-top:6px;padding-top:6px;display:grid;grid-template-columns:1fr auto;gap:0 20px;">
						<span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#111827;font-family:Arial,sans-serif;">Average Score:</span>
						<span style="font-size:16px;font-weight:900;color:#064E3B;text-align:right;">{averageScore}</span>
					</div>
				</div>
			</div>

			<!-- CENTRE: Verification seal -->
			<div class="flex flex-col items-center flex-1">
				<div style="width:90px;height:90px;border-radius:50%;border:4px solid #064E3B;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#f0fdf4,#dcfce7);box-shadow:0 4px 20px rgba(6,78,59,0.2);">
					<span style="font-size:24px;line-height:1;">✓</span>
					<span style="font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#064E3B;margin-top:2px;font-family:Arial,sans-serif;">Verified</span>
				</div>
				<p style="font-size:8px;color:#9ca3af;text-align:center;margin-top:8px;font-family:Arial,sans-serif;max-width:100px;line-height:1.3;">
					CollegeCBT Digital Certificate
				</p>
			</div>

			<!-- RIGHT: Signature block -->
			<div style="width:240px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding-bottom:4px;">
				<!-- Signature area placeholder -->
				<div style="height:52px;width:100%;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;">
					<span style="font-size:26px;font-style:italic;font-family:Georgia,serif;color:#064E3B;letter-spacing:-0.02em;opacity:0.8;">E-WIN Project</span>
				</div>
				<div style="width:100%;border-top:2.5px solid #111827;margin-bottom:6px;"></div>
				<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#111827;text-align:center;font-family:Arial,sans-serif;">Project Founder</p>
				<p style="font-size:10px;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">Elite Workforce Impact Nigeria</p>
			</div>
		</div>
	</div>
</div>
