import { writable, derived } from 'svelte/store';

// ── Types ──
export interface User {
	uid: string;
	email: string;
	displayName: string;
	fullName?: string;
	photoURL?: string;
	plan: 'free' | 'pro';
	role?: 'user' | 'admin';
	// Personal/Identity
	dob?: string;
	nin?: string;
	phone?: string;
	whatsapp?: string;
	// Location
	stateOfOrigin?: string;
	stateOfResidence?: string;
	lga?: string;
	address?: string;
	// Academic (Top-level in Convex schema)
	institutionType?: string;
	institutionName?: string;
	faculty?: string;
	department?: string;
	level?: string;
	matricNumber?: string;
	streak?: number;
}

export interface AcademicProfile {
	institutionType: string;
	institutionName: string;
	faculty?: string;
	department: string;
	level: string;
	matricNumber?: string;
	stateOfOrigin?: string;
	stateOfResidence?: string;
}

export interface StudySession {
	id: string;
	course: string;
	level: string;
	institutionType: string;
	questionsAnswered: number;
	correct: number;
	wrong: number;
	score: number;
	mode: 'lab' | 'mock';
	grade?: string;
	timestamp: number;
}

export interface Question {
	id: string;
	question: string;
	options: { A: string; B: string; C: string; D: string };
	correct: 'A' | 'B' | 'C' | 'D';
	explanations: {
		correct: string;
		A?: string;
		B?: string;
		C?: string;
		D?: string;
	};
	examiner_note?: string;
	topic: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TheoryQuestion {
	question: string;
	key_points: { point: string; marks: number }[];
	model_answer: string;
	examiner_notes: string;
	mark_scheme: string;
	topic: string;
}

export interface LabState {
	questionsCount: number;
	correct: number;
	wrong: number;
	score: number;
	streak: number;
	answered: boolean;
}

export interface MockState {
	course: string;
	institutionType: string;
	level: string;
	total: number;
	timePerQuestion: number;
	difficulty: string;
	current: number;
	questions: (Question | null)[];
	answers: ({ chosen: string | null; correct: string; ok: boolean; skipped: boolean } | null)[];
	timer: ReturnType<typeof setInterval> | null;
	timeLeft: number;
	correct: number;
	wrong: number;
	skipped: number;
}

// ── Auth Store ──
export const currentUser = writable<User | null>(null);
export const authLoading = writable(true);
export const authError = writable<string | null>(null);

// ── UI Stores ──
export const mobileMenuOpen = writable(false);
export const activeModal = writable<'login' | 'signup' | null>(null);
export const toastMessage = writable<{ title: string; message: string; type?: 'success' | 'error' | 'info' } | null>(null);

// ── Navigation ──
export const currentRoute = writable('/');

// ── Lab Store ──
export const labState = writable<LabState>({
	questionsCount: 0,
	correct: 0,
	wrong: 0,
	score: 0,
	streak: 0,
	answered: false
});

export const labConfig = writable({
	institutionType: '',
	course: '',
	level: '300 Level',
	questionType: 'MCQ',
	topic: '',
	difficulty: 'mixed'
});

export const currentLabQuestion = writable<Question | null>(null);
export const currentTheoryQuestion = writable<TheoryQuestion | null>(null);
export const labLoading = writable(false);

// ── Mock Store ──
export const mockConfig = writable({
	institutionType: '',
	course: '',
	level: '300 Level',
	totalQuestions: 10,
	timePerQuestion: 90,
	difficulty: 'mixed'
});

export const mockState = writable<'config' | 'active' | 'results'>('config');

// ── Dashboard Store ──
export const dashboardPanel = writable<'overview' | 'results' | 'activity' | 'settings'>('overview');

export const readinessScore = writable(78);

// ── Derived Stores ──
export const isAuthenticated = derived(currentUser, ($user) => $user !== null);
export const isPro = derived(currentUser, ($user) => $user?.plan === 'pro');

// ── Notification Helper (Delegates to Svelte 5 Reactive Manager) ──
export async function showToast(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
	const { toast } = await import('./toast.svelte');
	return toast.show({ title, message, type });
}

