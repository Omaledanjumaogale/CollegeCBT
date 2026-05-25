<script lang="ts">
	export type FAQAccordionItem = {
		question: string;
		answer: string;
	};

	let { items }: { items: FAQAccordionItem[]; initialOpen?: number } = $props();
	let openIndex = $state<number | null>(0);
</script>

<div class="space-y-4" itemscope itemtype="https://schema.org/FAQPage">
	{#each items as item, i}
		<div class="glass-card overflow-hidden" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
			<button
				type="button"
				class="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-white/5 sm:px-7"
				aria-expanded={openIndex === i}
				aria-controls="faq-panel-{i}"
				id="faq-button-{i}"
				onclick={() => openIndex = openIndex === i ? null : i}
			>
				<span class="text-base font-bold leading-snug text-white sm:text-lg" itemprop="name">{item.question}</span>
				<span
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-white transition-transform"
					class:rotate-45={openIndex === i}
					class:bg-violet-600={openIndex === i}
				>
					+
				</span>
			</button>

			{#if openIndex === i}
				<div
					id="faq-panel-{i}"
					role="region"
					aria-labelledby="faq-button-{i}"
					class="border-t border-white/10 px-5 py-5 text-sm leading-relaxed text-white/65 sm:px-7"
					itemscope
					itemprop="acceptedAnswer"
					itemtype="https://schema.org/Answer"
				>
					<p itemprop="text">{item.answer}</p>
				</div>
			{/if}
		</div>
	{/each}
</div>
