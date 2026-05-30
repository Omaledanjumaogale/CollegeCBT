import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { processSubscriptionPayment, syncSubscriptionReferral, verifyHmacHex } from '$lib/server/payments';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

/**
 * Paystack Webhook Handler
 * Validates HMAC-SHA512 signature and upgrades user plan via processPayment.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
    const signature = request.headers.get('x-paystack-signature');
    if (!signature) {
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    const payloadText = await request.text();

    // Resolve private API keys securely (fallback to platform.env for Edge environment compatibility)
    const platformEnv = (platform?.env || {}) as Record<string, string>;
    const secretKey = env.PAYSTACK_SECRET_KEY || platformEnv.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        console.error('[Paystack Webhook] Secret key not configured');
        return json({ status: 'error', message: 'Webhook configuration error' }, { status: 500 });
    }

    // ── Signature Verification ──────────────────────────────────────────────────
    let isValid = false;
    try {
        isValid = await verifyHmacHex('SHA-512', secretKey, payloadText, signature);
    } catch (err) {
        console.error('[Paystack Webhook] Verification failed:', err);
        return json({ status: 'error', message: 'Verification error' }, { status: 500 });
    }

    if (!isValid) {
        console.error('[Paystack Webhook] Invalid HMAC-SHA512 signature');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse & Process ─────────────────────────────────────────────────────────
    let payload: {
        event?: string;
        data?: {
            reference?: string;
            amount?: number | string;
            customer?: { email?: string };
        };
    };
    try {
        payload = JSON.parse(payloadText);
    } catch {
        return json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    const data = payload.data;
    if (payload.event === 'charge.success' && data) {
        const { reference, amount, customer } = data;
        const email = customer?.email;

        if (email && reference) {
            console.log(`[Paystack Webhook] Payment verified: ${reference} for ${email}`);
            try {
                // Convert amount from kobo (minor unit) to NGN (major unit)
                const majorAmount = Number(amount) / 100;

                const result = await processSubscriptionPayment({
                    email,
                    amount: majorAmount,
                    gateway: 'paystack',
                    reference
                });

                await syncSubscriptionReferral(result, majorAmount, '[Paystack Webhook]');
            } catch (error) {
                console.error('[Paystack Webhook] Convex sync failed:', error);
                return json({ status: 'error', message: 'Backend integration failed' }, { status: 500 });
            }
        }
    }

    return json({ status: 'accepted' });
};
