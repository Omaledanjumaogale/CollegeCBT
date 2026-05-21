<script lang="ts">
	import { page } from '$app/stores';
	import PageTemplate from '$lib/components/PageTemplate.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { defaultSEO, buildMeta } from '$lib/seo';

	const term = $page.url.pathname.split('/').pop() || '';

	const glossary: Record<string, { title: string; definition: string; context: string; category: string }> = {
		nuc: {
			title: 'NUC — National Universities Commission',
			definition: 'The National Universities Commission (NUC) is the federal regulatory agency overseeing university education in Nigeria. Established in 1962, it is responsible for the accreditation, quality assurance, and curriculum standardisation of all 309+ universities in Nigeria.',
			context: 'CollegeCBT aligns its question bank and curriculum browser with NUC-approved course structures across all Nigerian university faculties and departments.',
			category: 'Regulatory Bodies'
		},
		nbte: {
			title: 'NBTE — National Board for Technical Education',
			definition: 'The National Board for Technical Education (NBTE) is the regulatory body for polytechnics and technical colleges in Nigeria. It oversees the accreditation of programmes, curriculum development, and quality assurance for 78+ polytechnics.',
			context: 'CollegeCBT supports ND and HND students by structuring its practice exams around NBTE-approved syllabi.',
			category: 'Regulatory Bodies'
		},
		ncce: {
			title: 'NCCE — National Commission for Colleges of Education',
			definition: 'The National Commission for Colleges of Education (NCCE) is the regulatory agency responsible for the accreditation and quality assurance of 163+ Colleges of Education (COEs) in Nigeria, covering NCE programmes.',
			context: 'CollegeCBT provides NCE-level practice questions and mock exams aligned with NCCE curriculum standards.',
			category: 'Regulatory Bodies'
		},
		cbt: {
			title: 'CBT — Computer-Based Testing',
			definition: 'Computer-Based Testing (CBT) is an electronic examination method where candidates answer questions on a computer instead of traditional paper-and-pencil formats. In Nigeria, CBT is the standard for JAMB UTME, Post-UTME, and many institutional exams.',
			context: 'CollegeCBT is a dedicated CBT practice platform that simulates the exact exam environment, including timed questions, instant feedback, and AI-powered grading.',
			category: 'Examination Methods'
		},
		utme: {
			title: 'UTME — Unified Tertiary Matriculation Examination',
			definition: 'The Unified Tertiary Matriculation Examination (UTME) is the standard entrance examination administered by JAMB (Joint Admissions and Matriculation Board) for admission into Nigerian universities, polytechnics, and colleges of education.',
			context: 'CollegeCBT helps students prepare for UTME-style questions across all required subjects with AI-generated practice tests.',
			category: 'Examinations'
		},
		waec: {
			title: 'WAEC — West African Examinations Council',
			definition: 'The West African Examinations Council (WAEC) is the examining body responsible for the West African Senior School Certificate Examination (WASSCE). WAEC uses the A1–F9 grading system where A1 (75%+) is the highest grade and F9 (0–39%) is a fail.',
			context: 'CollegeCBT uses the WAEC A1–F9 grading scale for all mock exams, giving students an accurate prediction of their WASSCE performance.',
			category: 'Examinations'
		},
		neco: {
			title: 'NECO — National Examinations Council',
			definition: 'The National Examinations Council (NECO) is a Nigerian examination body that conducts the Senior School Certificate Examination (SSCE) for students in Nigeria. It serves as an alternative to WAEC.',
			context: 'CollegeCBT practice questions cover NECO curriculum standards and grading patterns.',
			category: 'Examinations'
		},
		jamb: {
			title: 'JAMB — Joint Admissions and Matriculation Board',
			definition: 'The Joint Admissions and Matriculation Board (JAMB) is the Nigerian entrance examination board for tertiary-level institutions. It conducts the UTME and manages the Central Admissions Processing System (CAPS).',
			context: 'CollegeCBT provides JAMB UTME practice questions with the exact format, timing, and scoring methodology used in the real exam.',
			category: 'Examinations'
		},
		hnd: {
			title: 'HND — Higher National Diploma',
			definition: 'The Higher National Diploma (HND) is a postgraduate-level qualification awarded by Nigerian polytechnics after two years of study following the National Diploma (ND). It is regulated by NBTE.',
			context: 'CollegeCBT offers HND-level practice questions across engineering, business, and applied science disciplines.',
			category: 'Qualifications'
		},
		nd: {
			title: 'ND — National Diploma',
			definition: 'The National Diploma (ND) is a two-year undergraduate programme offered by Nigerian polytechnics. It is the first level of polytechnic education, after which students can proceed to HND.',
			context: 'CollegeCBT supports ND students with curriculum-aligned practice questions for end-of-semester and NBTE examinations.',
			category: 'Qualifications'
		},
		nce: {
			title: 'NCE — Nigeria Certificate in Education',
			definition: 'The Nigeria Certificate in Education (NCE) is the minimum teaching qualification in Nigeria, awarded by Colleges of Education (COEs) after a three-year programme regulated by NCCE.',
			context: 'CollegeCBT offers NCE-level practice exams covering pedagogy, subject methodology, and professional education courses.',
			category: 'Qualifications'
		},
		gce: {
			title: 'GCE — General Certificate of Education',
			definition: 'The General Certificate of Education (GCE) is an external examination administered by WAEC for private candidates who did not take the WASSCE in school. It uses the same A1–F9 grading system.',
			context: 'CollegeCBT practice questions are suitable for GCE candidates preparing for the WAEC-conducted examination.',
			category: 'Examinations'
		},
		post_utme: {
			title: 'Post-UTME — Post Unified Tertiary Matriculation Examination',
			definition: 'The Post-UTME is a screening examination conducted by individual Nigerian universities as an additional requirement for admission after the JAMB UTME. Each institution sets its own Post-UTME format and passing score.',
			context: 'CollegeCBT helps students prepare for Post-UTME exams across 550+ Nigerian institutions with institution-specific practice questions.',
			category: 'Examinations'
		}
	};

	const entry = glossary[term] || null;
	const pageTitle = entry ? `${entry.title} — Glossary | CollegeCBT` : 'Glossary | CollegeCBT';
	const pageDesc = entry ? entry.definition.substring(0, 160) : 'Glossary of Nigerian higher education terms for NUC, NBTE, NCCE, WAEC, JAMB and more.';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDesc} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={`https://collegecbt.ewinproject.org/glossary/${term}`} />
	
	{#if entry}
		<script type="application/ld+json">
			{JSON.stringify({
				"@context": "https://schema.org",
				"@type": "DefinedTerm",
				"name": entry.title,
				"description": entry.definition,
				"inDefinedTermSet": "https://collegecbt.ewinproject.org/glossary",
				"mainEntityOfPage": {
					"@type": "WebPage",
					"@id": `https://collegecbt.ewinproject.org/glossary/${term}`
				}
			})}
		</script>
	{/if}
</svelte:head>

<div class="pt-[100px] pb-20">
	<div class="page-container max-w-4xl mx-auto px-4">
		{#if entry}
			<div class="mb-8">
				<div class="section-tag">📖 Academic Glossary</div>
				<h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">{entry.title}</h1>
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
					{entry.category}
				</div>
			</div>

			<div class="glass-card p-8 rounded-[32px] border-white/10 mb-8">
				<h2 class="text-lg font-bold text-white mb-4">Definition</h2>
				<p class="text-white/70 leading-relaxed">{entry.definition}</p>
			</div>

			<div class="glass-card p-8 rounded-[32px] border-white/10 mb-8">
				<h2 class="text-lg font-bold text-white mb-4">How It Relates to CollegeCBT</h2>
				<p class="text-white/70 leading-relaxed">{entry.context}</p>
			</div>

			<div class="glass-card p-8 rounded-[32px] border-white/10">
				<h2 class="text-lg font-bold text-white mb-6">Related Terms</h2>
				<div class="flex flex-wrap gap-3">
					{#each Object.entries(glossary) as [slug, g]}
						{#if slug !== term}
							<a href={`/glossary/${slug}`} class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
								{g.title.split(' — ')[0]}
							</a>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<!-- Glossary Index -->
			<div class="text-center mb-12">
				<div class="section-tag">📖 Academic Glossary</div>
				<h1 class="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">Nigerian Education <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Glossary</span></h1>
				<p class="text-white/40 text-sm max-w-2xl mx-auto">Key terms and definitions for Nigerian higher education regulatory bodies, examination systems, and qualifications.</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each Object.entries(glossary) as [slug, entry]}
					<a href={`/glossary/${slug}`} class="glass-card p-6 rounded-2xl border-white/10 hover:border-primary/40 transition-all group">
						<div class="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{entry.category}</div>
						<h3 class="font-bold text-white text-sm mb-2 group-hover:text-primary transition-colors">{entry.title}</h3>
						<p class="text-xs text-white/50 leading-relaxed line-clamp-3">{entry.definition.substring(0, 120)}...</p>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
