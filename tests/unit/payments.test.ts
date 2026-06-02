import { describe, expect, it } from 'vitest';
import { getPaymentSecretKey, isPlaceholderSecret, verifyHmacHex } from '$lib/server/payments';

describe('payment server helpers', () => {
	it('resolves gateway secrets from runtime environment records', () => {
		expect(getPaymentSecretKey('flutterwave', { FLUTTERWAVE_CLIENT_SECRET: 'flw-secret' })).toBe('flw-secret');
		expect(getPaymentSecretKey('korapay', { KORAPAY_SECRET_KEY: 'kora-secret' })).toBe('kora-secret');
		expect(getPaymentSecretKey('paystack', { PAYSTACK_SECRET_KEY: 'paystack-secret' })).toBe('paystack-secret');
		expect(getPaymentSecretKey('seerbit', { SEERBIT_SECRET_KEY: 'seerbit-secret' })).toBe('seerbit-secret');
	});

	it('detects placeholder and missing secrets', () => {
		expect(isPlaceholderSecret('')).toBe(true);
		expect(isPlaceholderSecret('your-secret-here')).toBe(true);
		expect(isPlaceholderSecret('placeholder_secret')).toBe(true);
		expect(isPlaceholderSecret('live_secret_value')).toBe(false);
	});

	it('verifies webhook HMAC signatures', async () => {
		const secret = 'test-secret';
		const payload = JSON.stringify({ reference: 'ref_123', status: 'success' });
		const key = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(secret),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);
		const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
		const hex = Array.from(new Uint8Array(signature))
			.map((byte) => byte.toString(16).padStart(2, '0'))
			.join('');

		await expect(verifyHmacHex('SHA-256', secret, payload, hex)).resolves.toBe(true);
		await expect(verifyHmacHex('SHA-256', secret, payload, 'bad-signature')).resolves.toBe(false);
	});
});
