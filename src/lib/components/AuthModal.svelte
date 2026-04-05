<script lang="ts">
	import { activeModal, showToast } from '$lib/stores';
	import { signUpWithEmail, signInWithEmail } from '$lib/services/firebase';
	import { NIGERIA_STATES, COURSES, INSTITUTION_TYPES, LEVELS, UNIVERSITIES_LIST, NIGERIAN_CURRICULUM, type InstitutionType } from '$lib/data/courseData';
	import { fade, scale, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let activeTab = $state<'login' | 'signup'>('signup');
	let step = $state(1);
	let loading = $state(false);

	// Login form
	let loginEmail = $state('');
	let loginPassword = $state('');

	// Signup form
	let suFullName = $state('');
	let suDob = $state('');
	let suEmail = $state('');
	let suNin = $state('');
	let suPassword = $state('');
	let suConfirmPassword = $state('');
	let suPhone = $state('');
	let suWhatsapp = $state('');
	let suStateOrigin = $state('');
	let suStateRes = $state('');
	let suLga = $state('');
	let suAddress = $state('');
	let suInstType = $state<InstitutionType | ''>('');
	let suInstName = $state('');
	let suOtherInstName = $state(''); // New field for "Other" institution
	let suFaculty = $state('');
	let suDept = $state('');
	let suLevel = $state('');
	let suMatric = $state('');
	let suTerms = $state(false);
	let signupSuccess = $state(false);

	// Derived lists for structured selection
	let facultyList = $derived(Object.keys(NIGERIAN_CURRICULUM));
	let departmentList = $derived(suFaculty ? Object.keys(NIGERIAN_CURRICULUM[suFaculty] || {}) : []);
	let levelList = $derived(suDept && suFaculty ? Object.keys(NIGERIAN_CURRICULUM[suFaculty][suDept] || {}) : []);

	// Sync the active tab when modal opens
	$effect(() => {
		if ($activeModal) {
			activeTab = $activeModal;
			step = 1;
			signupSuccess = false;
		}
	});

	function close() {
		activeModal.set(null);
	}

	function handleBackdropKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function switchTab(tab: 'login' | 'signup') {
		activeTab = tab;
		step = 1;
	}

	// Password strength
	function getPasswordStrength(pw: string) {
		if (!pw) return { width: '0%', color: 'transparent', label: '' };
		let score = 0;
		if (pw.length >= 8) score++;
		if (/[A-Z]/.test(pw)) score++;
		if (/[0-9]/.test(pw)) score++;
		if (/[^A-Za-z0-9]/.test(pw)) score++;
		const levels = [
			{ width: '20%', color: '#e11d48', label: 'Weak' },
			{ width: '40%', color: '#f59e0b', label: 'Fair' },
			{ width: '70%', color: '#84cc16', label: 'Good' },
			{ width: '100%', color: '#22d3ee', label: 'Strong' }
		];
		return levels[Math.min(score - 1, 3)] || levels[0];
	}

	let pwStrength = $derived(getPasswordStrength(suPassword));

	async function handleLogin() {
		if (!loginEmail || !loginPassword) {
			showToast('⚠️ Missing Fields', 'Please enter your email and password.', 'warning');
			return;
		}
		loading = true;
		const result = await signInWithEmail(loginEmail, loginPassword);
		loading = false;
		if (result.success) {
			showToast('✅ Welcome Back', 'Signed in successfully.', 'success');
			close();
		} else {
			showToast('❌ Sign In Failed', result.error || 'Check your credentials.', 'error');
		}
	}

	async function handleSignup() {
		if (!suFullName.trim() || !suEmail.trim() || !suPassword.trim() || !suNin.trim()) {
			showToast('⚠️ Required Fields', 'Please fill in all personal information fields.', 'warning');
			return;
		}
		if (suNin.length !== 11 || !/^\d{11}$/.test(suNin)) {
			showToast('⚠️ Invalid NIN', 'NIN must be exactly 11 digits.', 'warning');
			return;
		}
		if (suPassword.length < 8) {
			showToast('⚠️ Weak Password', 'Password must be at least 8 characters.', 'warning');
			return;
		}
		if (suPassword !== suConfirmPassword) {
			showToast('⚠️ Password Mismatch', 'Passwords do not match. Please try again.', 'warning');
			return;
		}
		if (!suPhone.trim() || !suStateOrigin || !suStateRes || !suLga.trim()) {
			showToast('⚠️ Required Fields', 'Please fill in all contact and location fields.', 'warning');
			return;
		}
		if (!suInstType || !suDept || !suLevel || !suTerms) {
			showToast('⚠️ Missing Information', 'Please complete all required fields and accept the terms.', 'warning');
			return;
		}
		
		loading = true;

		const finalInstitutionName = suInstName === 'Other (Please specify)' ? suOtherInstName : suInstName;

		// Flat profile shape matching Convex schema (no nested academicProfile)
		const profileData = {
			dob: suDob,
			nin: suNin,
			phone: suPhone,
			whatsapp: suWhatsapp,
			stateOfOrigin: suStateOrigin,
			stateOfResidence: suStateRes,
			lga: suLga,
			address: suAddress,
			institutionType: suInstType,
			institutionName: finalInstitutionName,
			faculty: suFaculty,
			department: suDept,
			level: suLevel,
			matricNumber: suMatric
		};

		const result = await signUpWithEmail(suEmail, suPassword, suFullName, profileData);
		loading = false;
		if (result.success) {
			showToast('✨ Account Created', 'Welcome to CollegeCBT!', 'success');
			signupSuccess = true;
		} else {
			showToast('❌ Sign Up Failed', result.error || 'Please try again.', 'error');
		}
	}
</script>

{#if $activeModal}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);"
		onclick={(e) => { if (e.target === e.currentTarget) close(); }}
		onkeydown={handleBackdropKey}
		role="dialog"
		aria-modal="true"
		aria-label="Authentication dialog"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
	>

		<div
			class="w-full max-w-lg"
			transition:scale={{ duration: 250, start: 0.95 }}
		>
			<!-- Tab switcher -->
			<div class="flex gap-2 mb-4 p-1.5 rounded-2xl border border-white/10 bg-black/25">
				<button
					onclick={() => switchTab('signup')}
					class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
					class:tab-active={activeTab === 'signup'}
					class:tab-inactive={activeTab !== 'signup'}
				>
					Create Account
				</button>
				<button
					onclick={() => switchTab('login')}
					class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
					class:tab-active={activeTab === 'login'}
					class:tab-inactive={activeTab !== 'login'}
				>
					Sign In
				</button>
			</div>

			<!-- Card -->
			<div class="glass-card p-6 relative overflow-hidden max-h-[85vh] overflow-y-auto modal-scroll">
				<!-- Top accent bar -->
				<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#064E3B,#A3E635);"></div>

				<!-- ── LOGIN PANEL ── -->
				{#if activeTab === 'login'}
					<h2 class="font-display text-2xl mb-1">Welcome Back</h2>
					<p class="text-white/50 text-sm mb-6">Sign in to your CollegeCBT account to continue.</p>

					<div class="space-y-4 mb-6">
						<div>
							<label for="login-email" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Email Address</label>
							<input id="login-email" type="email" bind:value={loginEmail} class="form-input" placeholder="you@university.edu.ng" autocomplete="email" />
						</div>
						<div>
							<label for="login-password" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Password</label>
							<input id="login-password" type="password" bind:value={loginPassword} class="form-input" placeholder="Your password" autocomplete="current-password" onkeydown={(e) => e.key === 'Enter' && handleLogin()} />
						</div>
					</div>

					<button onclick={handleLogin} disabled={loading} class="btn-lime w-full py-3 flex justify-center items-center gap-2">
						{#if loading}<span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>{:else}🔑 Sign In{/if}
					</button>

					<p class="text-center text-xs text-white/40 mt-4">
						Don't have an account? <button onclick={() => switchTab('signup')} class="text-[#A3E635] hover:underline">Create one free →</button>
					</p>
				{/if}

				<!-- ── SIGNUP PANEL ── -->
				{#if activeTab === 'signup'}
					{#if signupSuccess}
						<div class="text-center py-4">
							<div class="text-6xl mb-4">🎉</div>
							<h2 class="font-display text-2xl mb-2">Welcome to CollegeCBT!</h2>
							<p class="text-white/50 text-sm mb-6">Your account is ready. Check your email to verify, then start practising.</p>
							<div class="flex gap-3 justify-center flex-wrap">
								<a href="/exam-lab" onclick={close} class="btn-lime px-6 py-2.5 text-sm">🤖 Go to Exam Lab →</a>
								<a href="/dashboard" onclick={close} class="btn-ghost px-5 py-2.5 text-sm">📊 My Dashboard</a>
							</div>
						</div>
					{:else}
						<!-- Personal Information -->
						<div class="mb-6">
							<div class="text-xs font-700 uppercase tracking-widest mb-4" style="color:#A3E635;">Personal Information</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label for="su-fullname" class="text-xs text-white/45 mb-1.5 block font-600">Full Name *</label>
									<input id="su-fullname" type="text" bind:value={suFullName} placeholder="Emeka Okonkwo" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
								<div>
									<label for="su-dob" class="text-xs text-white/45 mb-1.5 block font-600">Date of Birth *</label>
									<input id="su-dob" type="date" bind:value={suDob} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
								<div>
									<label for="su-phone" class="text-xs text-white/45 mb-1.5 block font-600">Mobile Number *</label>
									<input id="su-phone" type="tel" bind:value={suPhone} placeholder="+234 800 000 0000" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
								<div>
									<label for="su-whatsapp" class="text-xs text-white/45 mb-1.5 block font-600">WhatsApp Number</label>
									<input id="su-whatsapp" type="tel" bind:value={suWhatsapp} placeholder="+234 800 000 0000" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
								<div>
									<label for="su-nin" class="text-xs text-white/45 mb-1.5 block font-600">NIN (National ID) *</label>
									<input id="su-nin" type="text" bind:value={suNin} placeholder="12345678901" maxlength="11" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
								<div>
									<label for="su-email" class="text-xs text-white/45 mb-1.5 block font-600">Email Address *</label>
									<input id="su-email" type="email" bind:value={suEmail} placeholder="emeka@university.edu.ng" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
							</div>
						</div>

						<!-- Location Information -->
						<div class="mb-6">
							<div class="text-xs font-700 uppercase tracking-widest mb-4" style="color:#A3E635;">Location Details</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label for="su-state-res" class="text-xs text-white/45 mb-1.5 block font-600">State of Residence *</label>
									<select id="su-state-res" bind:value={suStateRes} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select State…</option>
										{#each NIGERIA_STATES as state}
											<option value={state}>{state}</option>
										{/each}
									</select>
								</div>
								<div>
									<label for="su-state-origin" class="text-xs text-white/45 mb-1.5 block font-600">State of Origin *</label>
									<select id="su-state-origin" bind:value={suStateOrigin} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select State…</option>
										{#each NIGERIA_STATES as state}
											<option value={state}>{state}</option>
										{/each}
									</select>
								</div>
								<div>
									<label for="su-lga" class="text-xs text-white/45 mb-1.5 block font-600">LGA (Local Govt. Area) *</label>
									<input id="su-lga" type="text" bind:value={suLga} placeholder="e.g. Ikeja, Enugu North" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
								<div>
									<label for="su-address" class="text-xs text-white/45 mb-1.5 block font-600">Residential Address *</label>
									<input id="su-address" type="text" bind:value={suAddress} placeholder="No. 12, University Road, Zaria" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
							</div>
						</div>

						<!-- Academic Information -->
						<div class="mb-6">
							<div class="text-xs font-700 uppercase tracking-widest mb-4" style="color:#A3E635;">Academic Profile</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label for="su-inst-type" class="text-xs text-white/45 mb-1.5 block font-600">Institution Type *</label>
									<select id="su-inst-type" bind:value={suInstType} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select Type…</option>
										{#each INSTITUTION_TYPES as type}
											<option value={type}>{type}</option>
										{/each}
									</select>
								</div>
								<div>
									<label for="su-inst-name" class="text-xs text-white/45 mb-1.5 block font-600">Institution Name *</label>
									<select id="su-inst-name" bind:value={suInstName} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select Institution…</option>
										{#each UNIVERSITIES_LIST as uni}
											<option value={uni}>{uni}</option>
										{/each}
									</select>
								</div>
								{#if suInstName === 'Other (Please specify)'}
									<div transition:slide>
										<label for="su-other-inst" class="text-xs text-white/45 mb-1.5 block font-600">Specify Institution *</label>
										<input id="su-other-inst" type="text" bind:value={suOtherInstName} placeholder="Enter your institution name" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
									</div>
								{/if}
								<div>
									<label for="su-faculty" class="text-xs text-white/45 mb-1.5 block font-600">Faculty / School *</label>
									<select id="su-faculty" bind:value={suFaculty} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select Faculty…</option>
										{#each facultyList as f}
											<option value={f}>{f}</option>
										{/each}
									</select>
								</div>
								<div>
									<label for="su-dept" class="text-xs text-white/45 mb-1.5 block font-600">Department / Course *</label>
									<select id="su-dept" bind:value={suDept} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select Department…</option>
										{#each departmentList as d}
											<option value={d}>{d}</option>
										{/each}
										<option value="Other">Other (Not listed)</option>
									</select>
								</div>
								<div>
									<label for="su-level" class="text-xs text-white/45 mb-1.5 block font-600">Current Level *</label>
									<select id="su-level" bind:value={suLevel} class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]">
										<option value="">Select Level…</option>
										{#each levelList as l}
											<option value={l}>{l}</option>
										{/each}
										{#if levelList.length === 0}
											{#each ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level'] as l}
												<option value={l}>{l}</option>
											{/each}
										{/if}
									</select>
								</div>
								<div>
									<label for="su-matric" class="text-xs text-white/45 mb-1.5 block font-600">Matric / Student ID</label>
									<input id="su-matric" type="text" bind:value={suMatric} placeholder="Optional" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
								</div>
							</div>
						</div>

						<!-- Account Security -->
						<div class="mb-6">
							<div class="text-xs font-700 uppercase tracking-widest mb-4" style="color:#A3E635;">Account Security</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label for="su-password" class="text-xs text-white/45 mb-1.5 block font-600">Password *</label>
									<input id="su-password" type="password" bind:value={suPassword} placeholder="Minimum 8 characters" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
									{#if suPassword}
										<div class="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
											<div class="h-full rounded-full transition-all duration-300" style="width:{pwStrength.width};background:{pwStrength.color};"></div>
										</div>
										<p class="text-[11px] mt-1" style="color:{pwStrength.color};">{pwStrength.label} password</p>
									{/if}
								</div>
								<div>
									<label for="su-confirm" class="text-xs text-white/45 mb-1.5 block font-600">Confirm Password *</label>
									<input id="su-confirm" type="password" bind:value={suConfirmPassword} placeholder="Re-enter password" class="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-black/20 text-white outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]"/>
									{#if suConfirmPassword && suPassword !== suConfirmPassword}
										<p class="text-[11px] mt-1 text-rose-400">Passwords do not match</p>
									{:else if suConfirmPassword && suPassword === suConfirmPassword}
										<p class="text-[11px] mt-1 text-lime-400">✓ Passwords match</p>
									{/if}
								</div>
							</div>
						</div>

						<p class="text-xs text-white/30 mb-5">
							<label class="flex items-start gap-3 mb-4 cursor-pointer">
								<input type="checkbox" bind:checked={suTerms} class="mt-0.5 accent-lime-600 flex-shrink-0 w-4 h-4" />
								<span>By creating an account you agree to our <a href="/terms" class="text-[#A3E635] hover:underline">Terms of Service</a> and <a href="/privacy" class="text-[#A3E635] hover:underline">Privacy Policy</a>. Your NIN and personal data are secured and will not be shared.</span>
							</label>
						</p>

						<button onclick={handleSignup} disabled={loading} class="btn-lime w-full py-4 text-base font-display font-700 flex justify-center items-center gap-2">
							{#if loading}<span class="w-5 h-5 border-2 border-green-900/30 border-t-green-900 rounded-full animate-spin"></span>{:else}🚀 Create Free Account{/if}
						</button>
						
						<p class="text-center text-white/30 text-xs mt-4">
							Already have an account? <button onclick={() => switchTab('login')} class="text-[#A3E635] hover:underline">Sign In</button>
						</p>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.tab-active { background-color: #064E3B; color: white; }
	.tab-inactive { color: rgba(255,255,255,0.6); }
	.tab-inactive:hover { color: white; background: rgba(255,255,255,0.05); }
	.modal-scroll::-webkit-scrollbar { width: 4px; }
	.modal-scroll::-webkit-scrollbar-track { background: transparent; }
	.modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
</style>
