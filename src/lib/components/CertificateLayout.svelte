<script lang="ts">
    let { 
        studentName = 'STUDENT NAME',
        courseName = 'COURSE NAME', 
        date = 'DATE',
        certificateType = 'Certificate of Attendance',
        accomplishmentText = 'has successfully participated in the'
    } = $props<{
        studentName?: string;
        courseName?: string;
        date?: string;
        certificateType?: string;
        accomplishmentText?: string;
    }>();

    function handleImageError(e: Event) {
        const target = e.currentTarget as HTMLImageElement;
        if (target) {
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1056' height='816' viewBox='0 0 1056 816'%3E%3Crect width='1056' height='816' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3EPlease place cert-bg.png in static/images/ folder%3C/text%3E%3C/svg%3E";
        }
    }
</script>

<div class="relative w-[1056px] h-[816px] flex items-center justify-center bg-white shadow-xl overflow-hidden font-sans mx-auto text-center" id="certificate-container">
	<!-- Background Image Component (loads from static/images/cert-bg.png) -->
	<img src="/images/cert-bg.png" alt="Certificate Background" class="absolute inset-0 w-full h-full object-cover z-0" crossorigin="anonymous" onerror={handleImageError} />
	
	<!-- Foreground Certificate Typography Overlay -->
	<div class="relative z-10 w-[80%] flex flex-col items-center justify-center pt-8">
        <h1 class="text-5xl font-bold text-[#ef4444] mb-5 uppercase tracking-wider" style="font-family: Georgia, serif;">{certificateType}</h1>
        
        <p class="text-[22px] text-[#374151] mb-10 italic" style="font-family: Georgia, serif;">This is to certify that</p>
        
        <h2 class="text-5xl font-extrabold text-black mb-3 uppercase tracking-wide border-b-2 border-black pb-3 px-20">{studentName}</h2>
        
        <p class="text-[22px] text-[#374151] mt-8 mb-5 italic" style="font-family: Georgia, serif;">{accomplishmentText}</p>
        
        <h3 class="text-[34px] font-bold text-[#10b981] mb-10 uppercase tracking-wide px-8">{courseName}</h3>
        
        <p class="text-[22px] text-[#374151] font-medium mb-10" style="font-family: sans-serif;">held on <span class="font-bold text-black">{date}</span></p>
        
        <p class="text-xl text-[#4b5563] italic" style="font-family: Georgia, serif;">In recognition of this achievement, this certificate is hereby awarded.</p>
	</div>
</div>
