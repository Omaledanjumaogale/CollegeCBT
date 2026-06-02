import { getRuntimeEnv, type RuntimeEnv } from './auth';

export type PaymentGateway = 'flutterwave' | 'korapay' | 'paystack' | 'seerbit';
export type PaymentPlan = 'free' | 'pro';

export type ProcessPaymentResult = {
	success: boolean;
	alreadyProcessed?: boolean;
	userId: string;
	email: string;
	referralCode?: string | null;
	referralLogged?: boolean;
};

export type ProcessPaymentInput = {
	email: string;
	plan?: PaymentPlan;
	amount: number;
	gateway: PaymentGateway;
	reference: string;
};

export function getPaymentSecretKey(gateway: PaymentGateway, platformEnv?: RuntimeEnv) {
	const env = getRuntimeEnv(platformEnv);

	if (gateway === 'flutterwave') {
		return env.FLUTTERWAVE_SECRET_KEY || env.FLUTTERWAVE_CLIENT_SECRET || '';
	}

	if (gateway === 'korapay') return env.KORAPAY_SECRET_KEY || '';
	if (gateway === 'paystack') return env.PAYSTACK_SECRET_KEY || '';
	if (gateway === 'seerbit') return env.SEERBIT_SECRET_KEY || '';
	return '';
}

export function isPlaceholderSecret(secretKey: string) {
	const normalized = secretKey.trim().toLowerCase();
	return !normalized || normalized.includes('placeholder') || normalized.startsWith('your-');
}

export function getAppUrl(platformEnv?: RuntimeEnv) {
	return getRuntimeEnv(platformEnv).PUBLIC_APP_URL || 'http://localhost:5173';
}

export function createPaymentReference(uid: string) {
	return `CBT-${uid.substring(0, 8)}-${Date.now()}`;
}

export async function verifyHmacHex(
	algorithm: 'SHA-256' | 'SHA-512',
	secret: string,
	payload: string,
	expectedHex: string
): Promise<boolean> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: algorithm },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
	const computed = Array.from(new Uint8Array(sig))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return computed.toLowerCase() === expectedHex.toLowerCase();
}

function isProcessPaymentResult(value: unknown): value is ProcessPaymentResult {
	if (!value || typeof value !== 'object') return false;
	const result = value as Partial<ProcessPaymentResult>;
	return result.success === true && typeof result.userId === 'string' && typeof result.email === 'string';
}

export async function processSubscriptionPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
	const { api, convex } = await import('$lib/services/convexClient');
	const result: unknown = await convex.mutation(api.users.processPayment, {
		email: input.email,
		plan: input.plan ?? 'pro',
		amount: input.amount,
		gateway: input.gateway,
		reference: input.reference
	});

	if (!isProcessPaymentResult(result)) {
		throw new Error(`Unexpected payment mutation response for ${input.gateway}:${input.reference}`);
	}

	return result;
}

export async function syncSubscriptionReferral(
	result: ProcessPaymentResult,
	amount: number,
	logPrefix: string
): Promise<void> {
	if (!result.success || !result.email) return;

	try {
		const { syncReferralToEwinServer } = await import('$lib/services/referral');
		await syncReferralToEwinServer({
			userId: result.userId,
			email: result.email,
			referralCode: result.referralCode || 'webhook_auto',
			type: 'subscription',
			amount
		});
	} catch (refErr) {
		console.warn(`${logPrefix} E-WIN referral sync failed (non-fatal):`, refErr);
	}
}
