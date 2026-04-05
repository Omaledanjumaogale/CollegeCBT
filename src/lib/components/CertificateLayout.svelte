<script lang="ts">
    let { 
        studentName = 'STUDENT NAME',
        questionsAnswered = 850,
        mockExamsCompleted = 12,
        timeSpent = '48 hrs 30 mins',
        averageScore = '85%',
        totalCorrectAnswers = 722,
        totalFailedQuestions = 128,
        date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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

    function handleImageError(e: Event) {
        const target = e.currentTarget as HTMLImageElement;
        if (target) {
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1056' height='816' viewBox='0 0 1056 816'%3E%3Crect width='1056' height='816' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3EMissing Background%3C/text%3E%3C/svg%3E";
        }
    }
</script>

<div class="relative w-[1056px] h-[816px] flex items-center justify-center bg-white shadow-xl overflow-hidden font-sans mx-auto text-center" id="certificate-container">
	<!-- Background Image Component (loads from static/images/cert-bg.png) -->
	<img src="/images/cert-bg.png" alt="Certificate Background" class="absolute inset-0 w-full h-full object-cover z-0" crossorigin="anonymous" onerror={handleImageError} />
	
	<!-- Foreground Certificate Typography Overlay -->
	<div class="relative z-10 w-[85%] h-full flex flex-col items-center pt-[100px]">
        <!-- 1. Project Full Name -->
        <h3 class="text-[19px] font-bold text-gray-800 tracking-[0.15em] uppercase mb-1" style="font-family: Arial, sans-serif;">ELITE WORKFORCE IMPACT NIGERIA (E-WIN) PROJECT</h3>
        
        <!-- 2. Application Name (Boldly) -->
        <h1 class="text-[38px] font-extrabold text-[#064E3B] mb-7 uppercase tracking-[0.05em]" style="font-family: Arial, sans-serif;">COLLEGECBT PREPARATORY TEST REPORT</h1>
        
        <!-- 3. Readiness -->
        <h2 class="text-5xl font-bold text-[#A3E635] mb-5 uppercase tracking-wide" style="font-family: Georgia, serif;">CERTIFICATE OF READINESS</h2>
        
        <!-- 4. Certify Text -->
        <p class="text-[24px] text-[#374151] mb-6 italic" style="font-family: Georgia, serif;">This is to certify that</p>
        
        <!-- 5. Active Student Fullname -->
        <h2 class="text-[54px] font-extrabold text-black mb-4 uppercase tracking-wide border-b-[3px] border-[#064E3B] pb-2 px-[80px]" style="font-family: Arial, sans-serif;">{studentName}</h2>
        
        <!-- 6. Accolade Phrase -->
        <p class="text-[22px] text-[#374151] mb-12 italic px-8" style="font-family: Georgia, serif;">has achieved an exceptional AI Readiness Score and practice trajectory</p>
        
        <!-- Footer Area -->
        <div class="flex justify-between items-end w-full absolute bottom-[90px] px-8">
            <!-- 7. Left Side: Stats -->
            <div class="flex flex-col items-start text-left bg-white/75 backdrop-blur-sm p-5 rounded-2xl border border-gray-300 shadow-md w-[430px]">
                <h4 class="text-lg font-bold text-black mb-3 uppercase tracking-wider border-b-2 border-[#A3E635] pb-1 w-full flex items-center justify-between">Performance Record <span class="text-xl">🏆</span></h4>
                <div class="grid grid-cols-[1fr_auto] gap-x-6 gap-y-[9px] text-[16px] text-gray-800 w-full mt-1">
                    <span class="font-semibold text-gray-700">Mock Exams Completed:</span> <span class="font-bold text-[#064E3B] text-right">{mockExamsCompleted}</span>
                    <span class="font-semibold text-gray-700">Questions Answered:</span> <span class="font-bold text-[#064E3B] text-right">{questionsAnswered}</span>
                    <span class="font-semibold text-gray-700">Total Correct Answers:</span> <span class="font-bold text-emerald-600 text-right">{totalCorrectAnswers}</span>
                    <span class="font-semibold text-gray-700">Total Failed Questions:</span> <span class="font-bold text-rose-500 text-right">{totalFailedQuestions}</span>
                    <span class="font-semibold text-gray-700">Total Time Spent:</span> <span class="font-bold text-blue-700 text-right">{timeSpent}</span>
                    <div class="col-span-2 border-t border-gray-200 mt-1 pt-2 grid grid-cols-[1fr_auto] gap-x-6">
                        <span class="font-extrabold text-black uppercase text-sm self-center tracking-wider">Average Score:</span> 
                        <span class="font-black text-[#064E3B] text-xl text-right">{averageScore}</span>
                    </div>
                </div>
            </div>

            <!-- 8. Right Side: Signature & Date -->
            <div class="flex flex-col items-center justify-end w-[300px] pb-1">
                <img src="/images/signature.jpg" alt="Founder Signature" class="h-32 object-contain mb-[-10px] mix-blend-multiply" crossorigin="anonymous" onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                <div class="w-full border-t-[3px] border-black mt-1"></div>
                <p class="text-[16px] font-extrabold text-black mt-2 uppercase tracking-wide">Signed by the Project Founder</p>
                <p class="text-lg font-bold text-gray-700 mt-1 italic">{date}</p>
            </div>
        </div>
	</div>
</div>
