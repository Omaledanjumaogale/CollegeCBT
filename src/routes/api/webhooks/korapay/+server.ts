import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { processSubscriptionPayment, syncSubscriptionReferral, verifyHmacHex } from '$lib/server/payments';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

/**
 * Korapay Webhook Handler
 * Validates HMAC-SHA256 signature and upgrades user plan via processPayment.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
    const signature = request.headers.get('x-korapay-signature');
    if (!signature) {
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    const payloadText = await request.text();

    // Resolve private API keys securely (fallback to platform.env for Edge environment compatibility)
    const platformEnv = (platform?.env || {}) as Record<string, string>;
    const secretKey = env.KORAPAY_SECRET_KEY || platformEnv.KORAPAY_SECRET_KEY;

    if (!secretKey) {
        console.error('[Korapay Webhook] Secret key not configured');
        return json({ status: 'error', message: 'Webhook configuration error' }, { status: 500 });
    }

    // ── Signature Verification ──────────────────────────────────────────────────
    let isValid = false;
    try {
        isValid = await verifyHmacHex('SHA-256', secretKey, payloadText, signature);
    } catch (err) {
        console.error('[Korapay Webhook] Verification failed:', err);
        return json({ status: 'error', message: 'Signature verification error' }, { status: 500 });
    }

    if (!isValid) {
        console.error('[Korapay Webhook] Invalid HMAC signature');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse & Process ─────────────────────────────────────────────────────────
    let payload: {
        event?: string;
        data?: {
            status?: string;
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

    if (payload.event === 'charge.success' && payload.data?.status === 'success') {
        const { reference, amount, customer } = payload.data;
        const email = customer?.email;

        if (email && reference) {
            console.log(`[Korapay Webhook] Payment verified: ${reference} for ${email}`);
            try {
                const result = await processSubscriptionPayment({
                    email,
                    amount: Number(amount),
                    gateway: 'korapay',
                    reference
                });

                await syncSubscriptionReferral(result, Number(amount), '[Korapay Webhook]');
            } catch (error) {
                console.error('[Korapay Webhook] Convex sync failed:', error);
                return json({ status: 'error', message: 'Backend integration failed' }, { status: 500 });
            }
        }
    }

    return json({ status: 'accepted' });
};
