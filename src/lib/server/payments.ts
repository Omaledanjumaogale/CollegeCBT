import { getRuntimeEnv, type RuntimeEnv } from './auth';

export type PaymentGateway = 'flutterwave' | 'korapay' | 'paystack' | 'seerbit';

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
