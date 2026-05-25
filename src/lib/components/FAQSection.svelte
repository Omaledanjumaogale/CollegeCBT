<!-- src/lib/components/FAQSection.svelte -->
<script lang="ts">
	import type { FAQItem } from '$lib/types/seo';
	import FAQAccordion from './FAQAccordion.svelte';

	interface Props {
		faqs: FAQItem[];
		title?: string;
	}

	let { faqs, title = 'Frequently Asked Questions' }: Props = $props();
	let items = $derived(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })));
</script>

<section class="faq-section py-12" aria-labelledby="faq-section-title">
	<div class="max-w-3xl mx-auto">
		{#if title}
			<h2 id="faq-section-title" class="text-3xl font-display font-bold text-center mb-8 text-white">
				{title}
			</h2>
		{/if}

		<FAQAccordion {items} />
	</div>
</section>
