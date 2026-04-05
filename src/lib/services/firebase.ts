// ── Firebase Authentication Service ── (Edge-compatible, lazy-loaded)
import { currentUser, authLoading, showToast } from '$lib/stores';
import type { User } from '$lib/stores';
import type { Auth, User as FirebaseUser } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let auth: Auth | null = null;
let db: Firestore | null = null;
let initialized = false;
let initPromise: Promise<Auth | null> | null = null;

// ── Internal Firebase singleton bootstrap ─────────────────────────────────────
async function getFirebase(): Promise<Auth | null> {
	if (initialized) return auth;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		try {
			const { env } = await import('$env/dynamic/public');
			const {
				PUBLIC_FIREBASE_API_KEY,
				PUBLIC_FIREBASE_AUTH_DOMAIN,
				PUBLIC_FIREBASE_PROJECT_ID,
				PUBLIC_FIREBASE_STORAGE_BUCKET,
				PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
				PUBLIC_FIREBASE_APP_ID
			} = env as Record<string, string | undefined>;

			if (!PUBLIC_FIREBASE_API_KEY || PUBLIC_FIREBASE_API_KEY.includes('placeholder')) {
				console.warn('[CollegeCBT] Firebase not configured — using demo mode');
				authLoading.set(false);
				initialized = true;
				return null;
			}

			const { initializeApp, getApps } = await import('firebase/app');
			const { getAuth, onAuthStateChanged } = await import('firebase/auth');
			const { getFirestore, doc, getDoc } = await import('firebase/firestore');

			const app =
				getApps().length === 0
					? initializeApp({
							apiKey: PUBLIC_FIREBASE_API_KEY,
							authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
							projectId: PUBLIC_FIREBASE_PROJECT_ID,
							storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
							messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
							appId: PUBLIC_FIREBASE_APP_ID
						})
					: getApps()[0];

			auth = getAuth(app);
			db = getFirestore(app);
			initialized = true;

			onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
				if (firebaseUser) {
					let userData: User = {
						uid: firebaseUser.uid,
						email: firebaseUser.email || '',
						displayName: firebaseUser.displayName || '',
						fullName: firebaseUser.displayName || '',
						photoURL: firebaseUser.photoURL || undefined,
						plan: 'free'
					};

					// Pull extended profile from Firestore if available
					try {
						if (db) {
							const userDocRef = doc(db, 'users', firebaseUser.uid);
							const userDoc = await getDoc(userDocRef);
							if (userDoc.exists()) {
								const data = userDoc.data();
								userData = {
									...userData,
									...data,
									uid: firebaseUser.uid, // ensure UID stays correct
									plan: (data.plan as User['plan']) || 'free'
								};
							}
						}
					} catch (e) {
						console.error('[CollegeCBT] Firestore pull error:', e);
					}

					currentUser.set(userData);

					// ── Sync with Convex Platform DB ───────────────────────────────
					// Attach Firebase ID Token so ctx.auth works in Convex mutations
					try {
						const { convex } = await import('./convexClient');
						const { anyApi } = await import('convex/server');
						const idToken = await firebaseUser.getIdToken();
						// Attach token so Convex server-side auth can verify identity
						if (typeof (convex as any).setAuth === 'function') {
							(convex as any).setAuth(async () => idToken);
						}
						await convex.mutation(anyApi.users.storeUser, {
							plan: userData.plan ?? 'free'
						});
					} catch (e) {
						console.warn('[CollegeCBT] Convex sync on auth change failed (non-critical):', e);
					}
				} else {
					currentUser.set(null);
					// Clear Convex token
					try {
						const { convex } = await import('./convexClient');
						if (typeof (convex as any).clearAuth === 'function') {
							(convex as any).clearAuth();
						}
					} catch { /* non-critical */ }
				}
				authLoading.set(false);
			});

			return auth;
		} catch (err) {
			console.error('[CollegeCBT] Firebase init error:', err);
			authLoading.set(false);
			initialized = true;
			return null;
		}
	})();

	return initPromise;
}

export async function initAuth(): Promise<void> {
	if (typeof window === 'undefined') return;
	await getFirebase();
}

// ── Sign Up ───────────────────────────────────────────────────────────────────
export async function signUpWithEmail(
	email: string,
	password: string,
	displayName: string,
	profileData: Partial<User> = {}
): Promise<{ success: boolean; error?: string }> {
	try {
		const authInstance = await getFirebase();
		if (!authInstance) {
			// Demo mode
			const user: User = { uid: `demo-${Date.now()}`, email, displayName, plan: 'free', ...profileData };
			currentUser.set(user);
			showToast('✅ Account Created!', 'Welcome to CollegeCBT! (Demo mode)', 'success');
			return { success: true };
		}

		const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } =
			await import('firebase/auth');
		const { doc, setDoc } = await import('firebase/firestore');

		const result = await createUserWithEmailAndPassword(authInstance, email, password);
		await updateProfile(result.user, { displayName });

		// Create Firestore profile record (once)
		if (db) {
			await setDoc(doc(db, 'users', result.user.uid), {
				uid: result.user.uid,
				email,
				displayName,
				fullName: displayName,
				plan: 'free',
				createdAt: Date.now(),
				...profileData
			});
		}

		// Send email verification exactly once
		try {
			await sendEmailVerification(result.user);
			showToast('✉️ Verify Email', `We've sent a link to ${email}`, 'info');
		} catch (e) {
			console.warn('[Firebase] Verification email failed:', e);
		}

		showToast('✅ Account Created!', 'Welcome to CollegeCBT! Check your email to verify.', 'success');
		return { success: true };
	} catch (err: unknown) {
		const error = err as { code?: string };
		let message = 'Sign up failed. Please try again.';
		if (error.code === 'auth/email-already-in-use') message = 'This email is already registered.';
		if (error.code === 'auth/weak-password') message = 'Password must be at least 6 characters.';
		if (error.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
		return { success: false, error: message };
	}
}

// ── Sign In ───────────────────────────────────────────────────────────────────
export async function signInWithEmail(
	email: string,
	password: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const authInstance = await getFirebase();
		if (!authInstance) {
			// Demo mode
			const user: User = { uid: `demo-${Date.now()}`, email, displayName: email.split('@')[0], plan: 'free' };
			currentUser.set(user);
			showToast('🎓 Welcome back!', 'Login successful (Demo mode).', 'success');
			return { success: true };
		}

		const { signInWithEmailAndPassword } = await import('firebase/auth');
		// Firebase's onAuthStateChanged callback handles Convex sync automatically
		await signInWithEmailAndPassword(authInstance, email, password);
		showToast('🎓 Welcome back!', 'Login successful.', 'success');
		return { success: true };
	} catch (err: unknown) {
		const error = err as { code?: string };
		let message = 'Invalid email or password. Please try again.';
		if (error.code === 'auth/too-many-requests') {
			message = 'Too many attempts. Please wait a moment and try again.';
		}
		if (error.code === 'auth/user-disabled') {
			message = 'This account has been suspended. Contact support.';
		}
		return { success: false, error: message };
	}
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
	try {
		const authInstance = await getFirebase();
		if (!authInstance) {
			currentUser.set(null);
			showToast('👋 Signed out', 'See you next time!', 'info');
			return;
		}
		const { signOut: firebaseSignOut } = await import('firebase/auth');
		await firebaseSignOut(authInstance);
		currentUser.set(null);
		showToast('👋 Signed out', 'See you next time!', 'info');
	} catch (err) {
		console.error('[CollegeCBT] Sign out error:', err);
	}
}

// ── Update Profile ────────────────────────────────────────────────────────────
export async function updateUserProfile(
	uid: string,
	data: Partial<User>
): Promise<{ success: boolean; error?: string }> {
	try {
		const authInstance = await getFirebase();
		if (!authInstance || !db) {
			// Demo mode: update store only
			currentUser.update((u) => (u ? { ...u, ...data } : null));
			return { success: true };
		}

		const { doc, updateDoc } = await import('firebase/firestore');
		await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: Date.now() });
		currentUser.update((u) => (u ? { ...u, ...data } : null));
		return { success: true };
	} catch (err) {
		console.error('[CollegeCBT] Profile update error:', err);
		return { success: false, error: 'Failed to update profile.' };
	}
}
