<script lang="ts">
	import CertificateDownloader from '$lib/components/CertificateDownloader.svelte';
    import { fly } from 'svelte/transition';

	// Hardcoded sample data for preview purposes. 
    // In production, you would fetch this from your database based on the URL parameter.
	let sampleCertificate = {
		studentName: 'NAZIRU ISHAQ',
		courseName: 'VIRTUAL POLYWORKING & CAPACITY BUILDING TRAINING',
		date: '20th August, 2025'
	};
</script>

<svelte:head>
	<title>Certificate of Achievement | CollegeCBT</title>
</svelte:head>

<div class="px-6 space-y-8" in:fly={{ y: 20, duration: 400 }}>
	<div class="max-w-4xl mx-auto">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="font-display text-4xl text-white tracking-tight">Your Achievements</h1>
				<p class="text-white/40 text-sm mt-2">View and download your official CollegeCBT certificates.</p>
			</div>
		</div>

		<div class="glass-card p-6 border-white/5 relative overflow-hidden">
			<!-- Decoration -->
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="relative z-10 w-full flex justify-center">
			    <CertificateDownloader 
                    studentName={sampleCertificate.studentName}
                    courseName={sampleCertificate.courseName}
                    date={sampleCertificate.date}
                />
            </div>
		</div>
	</div>
</div>
