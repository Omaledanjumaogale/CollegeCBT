<script lang="ts">
	import { activeModal, showToast } from '$lib/stores';
	import { signUpWithEmail, signInWithEmail } from '$lib/services/firebase';
	import { NIGERIA_STATES, COURSES, INSTITUTION_TYPES, LEVELS, type InstitutionType } from '$lib/data/courseData';
	import { fade, scale } from 'svelte/transition';

	let activeTab: 'login' | 'signup' = 'signup';
	let step = 1;
	let loading = false;
	let errorMsg = '';

	// Login form
	let loginEmail = '';
	let loginPassword = '';

	// Signup form
	let suFullName = '';
	let suDob = '';
	let suEmail = '';
	let suNin = '';
	let suPassword = '';
	let suPhone = '';
	let suWhatsapp = '';
	let suStateOrigin = '';
	let suStateRes = '';;
	let suLga = '';
	let suAddress = '';
	let suInstType: InstitutionType | '' = '';
	let suInstName = '';
	let suFaculty = '';
	let suDept = '';
	let suLevel = '';
	let suMatric = '';
	let suTerms = false;
	let signupSuccess = false;

	$: if ($activeModal) {
		activeTab = $activeModal;
		step = 1;
		errorMsg = '';
		signupSuccess = false;
	}

	function close() {
		activeModal.set(null);
	}

	function handleBackdropKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function switchTab(tab: 'login' | 'signup') {
		activeTab = tab;
		step = 1;
		errorMsg = '';
	}

	// Password strength
	function getPasswordStrength(pw: string) {
		if (!pw) return { width: '0%', color: 'transparent', label: '' };
		let score = 0;
		if (pw.length >= 8) score++;
		if (/[A-Z]/.test(pw)) score++;;
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

	$: pwStrength = getPasswordStrength(suPassword);

	function nextStep() {
		errorMsg = '';
		if (step === 1) {
			if (!suFullName.trim() || !suEmail.trim() || !suPassword.trim() || !suNin.trim()) {
				errorMsg = 'Please fill in all required fields.';
				return;
			}
			if (suNin.length !== 11) {
				errorMsg = 'NIN must be exactly 11 digits.';
				return;
			}
			step = 2;
		} else if (step === 2) {
			if (!suPhone.trim() || !suStateOrigin || !suStateRes || !suLga.trim()) {
				errorMsg = 'Please fill in all required contact fields.';
				return;
			}
			step = 3;
		}
	}

	async function handleLogin() {
		if (!loginEmail || !loginPassword) {
			errorMsg = 'Please enter your email and password.';
			return;
		}
		loading = true;
		const result = await signInWithEmail(loginEmail, loginPassword);
		loading = false;
		if (result.success) {
			close();
		} else {
			errorMsg = result.error || 'Login failed.';
		}
	}

	async function handleSignup() {
		if (!suInstType || !suDept || !suLevel || !suTerms) {
			errorMsg = 'Please complete all fields and accept the terms.';
			return;
		}
		loading = true;
		
		const profileData = {
			dob: suDob,
			nin: suNin,
			phone: suPhone,
			whatsapp: suWhatsapp,
			stateOfOrigin: suStateOrigin,
			stateOfResidence: suStateRes,
			lga: suLga,
			address: suAddress,
			academicProfile: {
				institutionType: suInstType,
				institutionName: suInstName,
				faculty: suFaculty,
				department: suDept,
				level: suLevel,
				matricNumber: suMatric
			}
		};

		const result = await signUpWithEmail(suEmail, suPassword, suFullName, profileData);
		loading = false;
		if (result.success) {
			signupSuccess = true;
		} else {
			errorMsg = result.error || 'Signup failed.';
		}
	}
</script>

{#if $activeModal}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);"
		on:click|self={close}
		on:keydown={handleBackdropKey}
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
					on:click={() => switchTab('signup')}
					class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
					class:bg-violet-DEFAULT={activeTab === 'signup'}
					class:text-white={activeTab === 'signup'}
					class:text-white-60={activeTab !== 'signup'}
				>
					Create Account
				</button>
				<button
					on:click={() => switchTab('login')}
					class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
					class:bg-violet-DEFAULT={activeTab === 'login'}
					class:text-white={activeTab === 'login'}
					class:text-white-60={activeTab !== 'login'}
				>
					Sign In
				</button>
			</div>

			<!-- Card -->
			<div class="glass-card p-6 relative overflow-hidden max-h-[85vh] overflow-y-auto">
				<!-- Top accent bar -->
				<div class="absolute top-0 left-0 right-0 h-0.5" style="background:linear-gradient(90deg,#7c3aed,#84cc16);"></div>

				<!-- ── LOGIN PANEL ── -->
				{#if activeTab === 'login'}
					<h2 class="font-display text-2xl mb-1">Welcome Back</h2>
					<p class="text-white/50 text-sm mb-6">Sign in to your CollegeCBT account to continue.</p>

					{#if errorMsg}
						<div class="badge badge-rose w-full justify-start p-3 rounded-xl mb-4 text-sm">{errorMsg}</div>
					{/if}

					<div class="space-y-4 mb-6">
						<div>
							<label for="login-email" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Email Address</label>
							<input id="login-email" type="email" bind:value={loginEmail} class="form-input" placeholder="you@university.edu.ng" autocomplete="email" />
						</div>
						<div>
							<label for="login-password" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Password</label>
							<input id="login-password" type="password" bind:value={loginPassword} class="form-input" placeholder="Your password" autocomplete="current-password" on:keydown={(e) => e.key === 'Enter' && handleLogin()} />
						</div>
					</div>

					<button on:click={handleLogin} disabled={loading} class="btn-violet w-full py-3 justify-center">
						{#if loading}<span class="spinner w-5 h-5 border-2"></span>{:else}🔑 Sign In{/if}
					</button>

					<p class="text-center text-xs text-white/40 mt-4">
						Don't have an account? <button on:click={() => switchTab('signup')} class="text-violet-light hover:underline">Create one free →</button>
					</p>
				{/if}

				<!-- ── SIGNUP PANEL ── -->
				{#if activeTab === 'signup'}
					{#if signupSuccess}
						<div class="text-center py-4">
							<div class="text-6xl mb-4">🎉</div>
							<h2 class="font-display text-2xl mb-2">Welcome to CollegeCBT!</h2>
							<p class="text-white/50 text-sm mb-6">Your account is ready. Start practising and track your results.</p>
							<div class="flex gap-3 justify-center flex-wrap">
								<a href="/exam-lab" on:click={close} class="btn-violet px-6 py-2.5 text-sm">🤖 Go to Exam Lab →</a>
								<a href="/dashboard" on:click={close} class="btn-ghost px-5 py-2.5 text-sm">📊 Dashboard</a>
							</div>
						</div>
					{:else}
						<!-- Step indicator -->
						<div class="flex items-center gap-0 mb-6">
							{#each [1,2,3] as s, i}
								<div class="flex flex-col items-center">
									<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
										style="border-color:{step > s ? '#84cc16' : step === s ? '#7c3aed' : 'rgba(255,255,255,0.1)'};background:{step > s ? 'rgba(132,204,22,0.15)' : step === s ? '#7c3aed' : 'transparent'};color:{step > s ? '#84cc16' : '#fff'};">
										{step > s ? '✓' : s}
									</div>
									<span class="text-[11px] text-white/40 mt-1">{['Personal','Contact','Academic'][i]}</span>
								</div>
								{#if i < 2}
									<div class="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all" style="background:{step > s + 1 || (step === s + 1) ? '#84cc16' : 'rgba(255,255,255,0.08)'};"></div>
								{/if}
							{/each}
						</div>

						{#if errorMsg}
							<div class="p-3 rounded-xl mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{errorMsg}</div>
						{/if}

						<!-- Step 1 -->
						{#if step === 1}
							<h2 class="font-display text-xl mb-1">Create Your Account</h2>
							<p class="text-white/40 text-xs mb-4">Step 1 of 3 — Personal Information</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
								<div>
									<label for="su-fullname" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Full Name *</label>
									<input id="su-fullname" type="text" bind:value={suFullName} class="form-input" placeholder="e.g. Adaobi Chukwu" autocomplete="name" />
								</div>
								<div>
									<label for="su-dob" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Date of Birth *</label>
									<input id="su-dob" type="date" bind:value={suDob} class="form-input" autocomplete="bday" />
								</div>
								<div>
									<label for="su-email" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Email Address *</label>
									<input id="su-email" type="email" bind:value={suEmail} class="form-input" placeholder="you@university.edu.ng" autocomplete="email" />
								</div>
								<div>
									<label for="su-nin" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">NIN *</label>
									<input id="su-nin" type="text" bind:value={suNin} class="form-input" placeholder="11-digit NIN" maxlength="11" />
									<p class="text-[11px] text-white/30 mt-1">Used for identity verification only.</p>
								</div>
								<div class="sm:col-span-2">
									<label for="su-password" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Password *</label>
									<input id="su-password" type="password" bind:value={suPassword} class="form-input" placeholder="Create a strong password" autocomplete="new-password" />
									{#if suPassword}
										<div class="mt-2 h-1 rounded-full overflow-hidden bg-white/10">
											<div class="h-full rounded-full transition-all duration-300" style="width:{pwStrength.width};background:{pwStrength.color};"></div>
										</div>
										<p class="text-[11px] mt-1" style="color:{pwStrength.color};">{pwStrength.label} password</p>
									{/if}
								</div>
							</div>
							<button on:click={nextStep} class="btn-violet w-full py-3 justify-center">Continue to Step 2 →</button>
						{/if}

						<!-- Step 2 -->
						{#if step === 2}
							<h2 class="font-display text-xl mb-1">Contact & Location</h2>
							<p class="text-white/40 text-xs mb-4">Step 2 of 3 — How to reach you</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
								<div>
									<label for="su-phone" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Phone Number *</label>
									<input id="su-phone" type="tel" bind:value={suPhone} class="form-input" placeholder="080x xxx xxxx" autocomplete="tel" />
								</div>
								<div>
									<label for="su-whatsapp" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">WhatsApp Number</label>
									<input id="su-whatsapp" type="tel" bind:value={suWhatsapp} class="form-input" placeholder="Same or different number" />
								</div>
								<div>
									<label for="su-state-origin" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">State of Origin *</label>
									<select id="su-state-origin" bind:value={suStateOrigin} class="form-select">
										<option value="">Select State</option>
										{#each NIGERIA_STATES as state}<option value={state}>{state}</option>{/each}
									</select>
								</div>
								<div>
									<label for="su-state-res" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">State of Residence *</label>
									<select id="su-state-res" bind:value={suStateRes} class="form-select">
										<option value="">Select State</option>
										{#each NIGERIA_STATES as state}<option value={state}>{state}</option>{/each}
									</select>
								</div>
								<div>
									<label for="su-lga" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">LGA *</label>
									<input id="su-lga" type="text" bind:value={suLga} class="form-input" placeholder="Your LGA" />
								</div>
								<div>
									<label for="su-address" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Home Address *</label>
									<input id="su-address" type="text" bind:value={suAddress} class="form-input" placeholder="Street, City" autocomplete="street-address" />
								</div>
							</div>
							<div class="flex gap-3">
								<button on:click={() => step = 1} class="btn-ghost flex-1 py-3 text-sm">← Back</button>
								<button on:click={nextStep} class="btn-violet flex-1 py-3 text-sm justify-center">Continue to Step 3 →</button>
							</div>
						{/if}

						<!-- Step 3 -->
						{#if step === 3}
							<h2 class="font-display text-xl mb-1">Academic Profile</h2>
							<p class="text-white/40 text-xs mb-4">Step 3 of 3 — Institution & course details</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
								<div>
									<label for="su-inst-type" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Institution Type *</label>
									<select id="su-inst-type" bind:value={suInstType} class="form-select">
										<option value="">Select Type</option>
										{#each INSTITUTION_TYPES as t}<option value={t}>{t}</option>{/each}
									</select>
								</div>
								<div>
									<label for="su-inst-name" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Institution Name *</label>
									<input id="su-inst-name" type="text" bind:value={suInstName} class="form-input" placeholder="e.g. University of Nigeria, Nsukka" />
								</div>
								<div>
									<label for="su-faculty" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Faculty / School</label>
									<input id="su-faculty" type="text" bind:value={suFaculty} class="form-input" placeholder="e.g. Science" />
								</div>
								<div>
									<label for="su-dept" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Department *</label>
									<input id="su-dept" type="text" bind:value={suDept} class="form-input" placeholder="e.g. Computer Science" />
								</div>
								<div>
									<label for="su-level" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Current Level *</label>
									<select id="su-level" bind:value={suLevel} class="form-select">
										<option value="">Select Level</option>
										{#if suInstType && LEVELS[suInstType as InstitutionType]}
											{#each LEVELS[suInstType as InstitutionType] as lvl}<option value={lvl}>{lvl}</option>{/each}
										{:else}
											{#each ['100 Level','200 Level','300 Level','400 Level','500/600 Level'] as lvl}<option value={lvl}>{lvl}</option>{/each}
										{/if}
									</select>
								</div>
								<div>
									<label for="su-matric" class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Matric / Student ID</label>
									<input id="su-matric" type="text" bind:value={suMatric} class="form-input" placeholder="Optional" />
								</div>
							</div>
							<label class="flex items-start gap-3 mb-4 cursor-pointer">
								<input type="checkbox" bind:checked={suTerms} class="mt-0.5 accent-violet-DEFAULT flex-shrink-0" />
								<span class="text-xs text-white/40">I agree to the <a href="/terms" class="text-violet-light hover:underline">Terms of Service</a> and <a href="/privacy" class="text-violet-light hover:underline">Privacy Policy</a>. My NIN is used solely for identity verification.</span>
							</label>
							<div class="flex gap-3">
								<button on:click={() => step = 2} class="btn-ghost flex-1 py-3 text-sm">← Back</button>
								<button on:click={handleSignup} disabled={loading} class="btn-violet flex-1 py-3 text-sm justify-center">
									{#if loading}<span class="spinner w-4 h-4 border-2"></span>{:else}🎓 Create My Account →{/if}
								</button>
							</div>
						{/if}
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.bg-violet-DEFAULT { background-color: #7c3aed; }
	.text-white-60 { color: rgba(255,255,255,0.6); }
</style>
