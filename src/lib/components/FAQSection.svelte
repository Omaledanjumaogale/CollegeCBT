<!-- src/lib/components/FAQSection.svelte -->
<script lang="ts">
	import type { FAQItem } from '$lib/types/seo';

	interface Props {
		faqs: FAQItem[];
		title?: string;
	}

	let { faqs, title = 'Frequently Asked Questions' }: Props = $props();
	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<section class="faq-section py-12" aria-labelledby="faq-section-title">
	<div class="max-w-3xl mx-auto">
		{#if title}
			<h2 id="faq-section-title" class="text-3xl font-display font-bold text-center mb-8 text-white">
				{title}
			</h2>
		{/if}

		<div class="space-y-4">
			{#each faqs as faq, idx}
				<div 
					class="faq-item border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all duration-200"
					itemscope 
					itemprop="mainEntity" 
					itemtype="https://schema.org/Question"
				>
					<!-- Question Header -->
					<button
						type="button"
						class="w-full text-left px-6 py-4 flex items-center justify-between gap-4 text-white hover:bg-white/5 transition-colors focus:outline-none"
						aria-expanded={openIndex === idx}
						onclick={() => toggle(idx)}
					>
						<span class="font-semibold text-base sm:text-lg" itemprop="name">{faq.question}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-white/50 transition-transform duration-200 flex-shrink-0"
							style="transform: rotate({openIndex === idx ? '180deg' : '0deg'});"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
					</button>

					<!-- Answer Body -->
					{#if openIndex === idx}
						<div 
							class="px-6 pb-5 text-white/70 text-sm sm:text-base leading-relaxed border-t border-white/5 pt-4 bg-white/[0.01]"
							itemscope 
							itemprop="acceptedAnswer" 
							itemtype="https://schema.org/Answer"
						>
							<div itemprop="text">
								{faq.answer}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
