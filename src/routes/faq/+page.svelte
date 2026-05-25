<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import FAQAccordion from '$lib/components/FAQAccordion.svelte';
	import { buildMeta } from '$lib/seo';

	type FAQAccordionItem = {
		question: string;
		answer: string;
	};

	const items: FAQAccordionItem[] = [
		{
			question: 'How does CollegeCBT generate course-specific exam questions?',
			answer: 'CollegeCBT combines your institution type, level, course, topic, and difficulty to create focused prompts for the AI question engine. The app also checks the question bank first so useful generated questions can be reused safely.'
		},
		{
			question: 'Is CollegeCBT built for Nigerian higher institutions?',
			answer: 'Yes. The platform is designed around universities, polytechnics, colleges of education, technical institutes, and JAMB-style subjects. It supports NUC, NBTE, and NCCE-aligned study paths.'
		},
		{
			question: 'What is the difference between Exam Lab and Mock Exam mode?',
			answer: 'Exam Lab is for learning one question at a time with immediate feedback. Mock Exam mode is for timed practice, question navigation, auto-scoring, and WAEC-style grade prediction.'
		},
		{
			question: 'Can I use CollegeCBT for free?',
			answer: 'Yes. The free plan gives students a safe way to try the platform. Student Pro unlocks higher usage, deeper mock exam practice, certificates, and advanced analytics.'
		},
		{
			question: 'How do payments work?',
			answer: 'Payments are designed for Nigerian students and are priced in naira. Flutterwave is the primary gateway, with KoraPay, Paystack, and Seerbit prepared as fallback providers.'
		},
		{
			question: 'How is my student data protected?',
			answer: 'Authentication uses Firebase, real-time application data is stored in Convex, private routes are excluded from service worker caching, and admin operations require role-based authorization.'
		}
	];

	const seo = buildMeta({
		title: 'FAQ — CollegeCBT',
		description: 'Answers to common questions about CollegeCBT exam practice, AI questions, mock exams, payments, and student data protection.',
		canonical: 'https://collegecbt.ewinproject.org/faq'
	});
</script>

<SEO {seo} />

<main class="page-container py-20 sm:py-28">
	<section class="mx-auto max-w-4xl">
		<div class="mb-12 text-center">
			<div class="section-tag">❓ Help Center</div>
			<h1 class="font-display text-4xl text-white sm:text-5xl">Frequently Asked Questions</h1>
			<p class="mx-auto mt-4 max-w-2xl text-white/55">
				Quick answers for students, departments, and administrators using CollegeCBT.
			</p>
		</div>

		<FAQAccordion {items} />
	</section>
</main>
