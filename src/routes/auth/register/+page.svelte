<script lang="ts">
	import { signUpWithEmail } from '$lib/services/firebase';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let step = $state(1); // 1=personal, 2=account, 3=academic
	let loading = $state(false);
	let errorMsg = $state('');
	let showPassword = $state(false);

	// Step 1 — Personal
	let fullName = $state('');
	let dob = $state('');
	let nin = $state('');

	// Step 2 — Account
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	// Step 3 — Academic
	let institutionType = $state('');
	let institutionName = $state('');
	let faculty = $state('');
	let department = $state('');
	let level = $state('');

	const institutionTypes = ['University', 'Polytechnic', 'College of Education', 'Monotechnic', 'Other'];
	const levels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level', 'ND 1', 'ND 2', 'HND 1', 'HND 2', 'NCE 1', 'NCE 2', 'NCE 3', 'Postgraduate'];

	onMount(() => {
		if ($currentUser) goto('/dashboard');
	});

	function nextStep() {
		errorMsg = '';
		if (step === 1) {
			if (!fullName.trim()) { errorMsg = 'Full name is required.'; return; }
			if (!dob) { errorMsg = 'Date of birth is required.'; return; }
			step = 2;
		} else if (step === 2) {
			if (!email.trim()) { errorMsg = 'Email address is required.'; return; }
			if (!phone.trim()) { errorMsg = 'Phone number is required.'; return; }
			if (password.length < 6) { errorMsg = 'Password must be at least 6 characters.'; return; }
			if (password !== confirmPassword) { errorMsg = 'Passwords do not match.'; return; }
			step = 3;
		}
	}

	function prevStep() {
		errorMsg = '';
		step = Math.max(1, step - 1);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!institutionType || !department || !level) {
			errorMsg = 'Please fill in all academic details.';
			return;
		}
		errorMsg = '';
		loading = true;
		try {
			const result = await signUpWithEmail(email, password, fullName, {
				phone,
				dob,
				nin,
				institutionType,
				institutionName,
				faculty,
				department,
				level,
				plan: 'free'
			});
			if (result.success) {
				goto('/dashboard');
			} else {
				errorMsg = result.error || 'Account creation failed. Please try again.';
			}
		} finally {
			loading = false;
		}
	}

	const stepLabels = ['Personal Info', 'Account Setup', 'Academic Profile'];
</script>

<svelte:head>
	<title>Create Account — CollegeCBT | Free AI Exam Practice for Nigerian Students</title>
	<meta name="description" content="Create your free CollegeCBT account and start practising with AI-generated exam questions for your Nigerian university, polytechnic or college." />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-20 pt-[100px]">
	<div class="w-full max-w-md">
		<!-- Card -->
		<div class="glass-card p-8 rounded-3xl">
			<!-- Header -->
			<div class="text-center mb-6">
				<a href="/" class="inline-block font-display text-3xl mb-4" style="background:linear-gradient(135deg,#fff 40%,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
					College<span style="-webkit-text-fill-color:#84cc16;">CBT</span>
				</a>
				<h1 class="font-display text-2xl text-white mb-1">Create Your Account</h1>
				<p class="text-white/40 text-sm">Join thousands of Nigerian students preparing smarter</p>
			</div>

			<!-- Step progress indicator -->
			<div class="flex items-center gap-2 mb-8">
				{#each stepLabels as label, i}
					<div class="flex-1 flex flex-col items-center gap-1">
						<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
							{step > i + 1 ? 'bg-lime-500 text-white' : step === i + 1 ? 'bg-violet-600 text-white ring-2 ring-violet-400/40' : 'bg-white/10 text-white/30'}">
							{step > i + 1 ? '✓' : i + 1}
						</div>
						<span class="text-[9px] font-bold uppercase tracking-wider
							{step === i + 1 ? 'text-violet-400' : step > i + 1 ? 'text-lime-400' : 'text-white/20'}">
							{label}
						</span>
					</div>
					{#if i < stepLabels.length - 1}
						<div class="flex-none w-8 h-px {step > i + 1 ? 'bg-lime-500/50' : 'bg-white/10'}"></div>
					{/if}
				{/each}
			</div>

			<!-- Step 1: Personal Info -->
			{#if step === 1}
				<div class="space-y-4">
					<div>
						<label for="reg-name" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name *</label>
						<input id="reg-name" type="text" bind:value={fullName} placeholder="e.g. Adaobi Chukwu" class="form-input" autocomplete="name" />
					</div>
					<div>
						<label for="reg-dob" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Date of Birth *</label>
						<input id="reg-dob" type="date" bind:value={dob} class="form-input" />
					</div>
					<div>
						<label for="reg-nin" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">NIN (National ID Number)</label>
						<input id="reg-nin" type="text" bind:value={nin} placeholder="11-digit NIN (optional)" class="form-input" maxlength="11" />
						<p class="text-[11px] text-white/30 mt-1">Used for identity verification only. Optional.</p>
					</div>
				</div>
			{/if}

			<!-- Step 2: Account Setup -->
			{#if step === 2}
				<div class="space-y-4">
					<div>
						<label for="reg-email" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email Address *</label>
						<input id="reg-email" type="email" bind:value={email} placeholder="you@university.edu.ng" class="form-input" autocomplete="email" />
					</div>
					<div>
						<label for="reg-phone" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Phone Number *</label>
						<input id="reg-phone" type="tel" bind:value={phone} placeholder="080x xxx xxxx" class="form-input" autocomplete="tel" />
					</div>
					<div>
						<label for="reg-password" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password *</label>
						<div class="relative">
							<input id="reg-password" type={showPassword ? 'text' : 'password'} bind:value={password} placeholder="Create a strong password" class="form-input pr-12" autocomplete="new-password" />
							<button type="button" onclick={() => showPassword = !showPassword} class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors" aria-label="Toggle password visibility">
								{showPassword ? '👁' : '🙈'}
							</button>
						</div>
						{#if password}
							<div class="mt-2 flex gap-1">
								{#each [1,2,3,4] as s}
									<div class="flex-1 h-1 rounded-full transition-all duration-300
										{password.length >= s * 3 ? (password.length >= 12 ? 'bg-lime-500' : password.length >= 8 ? 'bg-yellow-500' : 'bg-orange-500') : 'bg-white/10'}">
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div>
						<label for="reg-confirm" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Confirm Password *</label>
						<input id="reg-confirm" type="password" bind:value={confirmPassword} placeholder="Repeat your password" class="form-input" autocomplete="new-password" />
						{#if confirmPassword && password !== confirmPassword}
							<p class="text-xs text-rose-400 mt-1">❌ Passwords do not match</p>
						{:else if confirmPassword && password === confirmPassword}
							<p class="text-xs text-lime-400 mt-1">✓ Passwords match</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Step 3: Academic Profile -->
			{#if step === 3}
				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="reg-inst-type" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Institution Type *</label>
						<select id="reg-inst-type" bind:value={institutionType} class="form-select">
							<option value="">Select Type</option>
							{#each institutionTypes as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="reg-inst-name" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Institution Name</label>
						<input id="reg-inst-name" type="text" bind:value={institutionName} placeholder="e.g. University of Lagos, FUTO, BUK" class="form-input" />
					</div>
					<div>
						<label for="reg-faculty" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Faculty / School</label>
						<input id="reg-faculty" type="text" bind:value={faculty} placeholder="e.g. Faculty of Engineering" class="form-input" />
					</div>
					<div>
						<label for="reg-dept" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Department *</label>
						<input id="reg-dept" type="text" bind:value={department} placeholder="e.g. Computer Science, Nursing" class="form-input" />
					</div>
					<div>
						<label for="reg-level" class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Current Level *</label>
						<select id="reg-level" bind:value={level} class="form-select">
							<option value="">Select Level</option>
							{#each levels as l}
								<option value={l}>{l}</option>
							{/each}
						</select>
					</div>

					{#if errorMsg}
						<div class="p-3 rounded-xl text-sm text-rose-300 border" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.25);">
							⚠️ {errorMsg}
						</div>
					{/if}

					<button
						type="submit"
						disabled={loading}
						class="btn-violet w-full min-h-[48px] flex items-center justify-center gap-3 text-base font-bold shadow-violet disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if loading}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Creating Account...
						{:else}
							🎓 Create My Account →
						{/if}
					</button>
				</form>
			{/if}

			<!-- Error message (steps 1 & 2) -->
			{#if errorMsg && step < 3}
				<div class="mt-4 p-3 rounded-xl text-sm text-rose-300 border" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.25);">
					⚠️ {errorMsg}
				</div>
			{/if}

			<!-- Navigation buttons (steps 1 & 2) -->
			{#if step < 3}
				<div class="flex gap-3 mt-6">
					{#if step > 1}
						<button onclick={prevStep} class="btn-ghost flex-1 min-h-[44px] text-sm rounded-xl border border-white/10">
							← Back
						</button>
					{/if}
					<button onclick={nextStep} class="btn-violet flex-1 min-h-[44px] text-sm rounded-xl shadow-violet font-bold">
						Next →
					</button>
				</div>
			{/if}

			<!-- Footer - already have account -->
			<p class="text-center text-sm text-white/40 mt-6">
				Already have an account?
				<a href="/auth/login" class="text-violet-light hover:text-white font-semibold transition-colors ml-1">
					Sign in →
				</a>
			</p>
		</div>
	</div>
</div>
