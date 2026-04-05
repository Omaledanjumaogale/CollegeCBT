<script lang="ts">
	import { browser } from '$app/environment';
	import CertificateLayout from './CertificateLayout.svelte';
	
    let { 
        studentName = '',
        questionsAnswered = 0,
        mockExamsCompleted = 0,
        timeSpent = '',
        averageScore = '',
        totalCorrectAnswers = 0,
        totalFailedQuestions = 0,
        date = ''
    } = $props<{
        studentName?: string;
        questionsAnswered?: number | string;
        mockExamsCompleted?: number | string;
        timeSpent?: string;
        averageScore?: string | number;
        totalCorrectAnswers?: number | string;
        totalFailedQuestions?: number | string;
        date?: string;
    }>();

	let isGenerating = $state(false);

	async function downloadCertificate() {
		if (!browser) return;
		isGenerating = true;
		
		try {
			// Dynamically import client-side only heavy libraries
			const html2canvas = (await import('html2canvas')).default;
			const { jsPDF } = await import('jspdf');
			
			const element = document.getElementById('certificate-container');
			if (!element) throw new Error("Certificate container not found");
			
			// Render perfect quality canvas (scale: 2)
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
                backgroundColor: '#ffffff'
			});
			
			const imgData = canvas.toDataURL('image/png');
			
			// A4 standard PDF dimensions
			const pdf = new jsPDF({
				orientation: 'landscape',
				unit: 'mm',
				format: 'a4'
			});
			
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			
			pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
			pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
			
		} catch (error) {
			console.error("Failed to generate PDF", error);
			alert("Failed to download certificate. Please verify if the images folder allows CORS, and try again.");
		} finally {
			isGenerating = false;
		}
	}
</script>

<div class="flex flex-col items-center gap-6 w-full mx-auto my-8">
	<!-- Fixed dimension scaler container automatically shrinks big certs for smaller screens 
         while retaining 1056x816 DOM pixel mapping required for high-res PDF conversion. -->
	<div class="w-full overflow-x-auto pb-6 pt-6 custom-scrollbar flex justify-center bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-2 md:p-8">
        <div style="transform-origin: top center; transform: scale(min(1, 100% / 1056));" class="flex-shrink-0 transition-all duration-300 pointer-events-none select-none">
		    <CertificateLayout 
				{studentName} 
				{questionsAnswered}
				{mockExamsCompleted}
				{timeSpent}
				{averageScore}
				{totalCorrectAnswers}
				{totalFailedQuestions}
				{date} 
			/>
        </div>
	</div>

	<button 
		onclick={downloadCertificate} 
		disabled={isGenerating}
		class="btn-violet px-8 py-4 rounded-xl text-lg font-bold shadow-violet flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(124,58,237,0.4)] active:scale-95"
	>
		{#if isGenerating}
			<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
			Rendering High-Res PDF...
		{:else}
			<span class="text-xl">🎓</span> Download Official Certificate
		{/if}
	</button>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { height: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
</style>
