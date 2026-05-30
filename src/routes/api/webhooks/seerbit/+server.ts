import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { processSubscriptionPayment, syncSubscriptionReferral, verifyHmacHex } from '$lib/server/payments';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

/**
 * Seerbit Webhook Handler
 * Validates HMAC-SHA256 signature and upgrades user plan via processPayment.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
    const signature = request.headers.get('x-seerbit-signature') || request.headers.get('Hash');
    if (!signature) {
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    const payloadText = await request.text();

    // Resolve private API keys securely (fallback to platform.env for Edge environment compatibility)
    const platformEnv = (platform?.env || {}) as Record<string, string>;
    const secretKey = env.SEERBIT_SECRET_KEY || platformEnv.SEERBIT_SECRET_KEY;

    if (!secretKey) {
        console.error('[Seerbit Webhook] Secret key not configured');
        return json({ status: 'error', message: 'Webhook configuration error' }, { status: 500 });
    }

    // ── Signature Verification ──────────────────────────────────────────────────
    let isValid = false;
    try {
        isValid = await verifyHmacHex('SHA-256', secretKey, payloadText, signature);
    } catch (err) {
        console.error('[Seerbit Webhook] Verification failed:', err);
        return json({ status: 'error', message: 'Verification error' }, { status: 500 });
    }

    if (!isValid) {
        console.error('[Seerbit Webhook] Invalid HMAC signature');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse & Process ─────────────────────────────────────────────────────────
    let payload: {
        eventType?: string;
        type?: string;
        notificationType?: string;
        payments?: {
            paymentReference?: string;
            amount?: number | string;
            customerEmail?: string;
        };
        paymentReference?: string;
        amount?: number | string;
        customerEmail?: string;
    };
    try {
        payload = JSON.parse(payloadText);
    } catch {
        return json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    const eventType: string = payload.eventType || payload.type || '';
    const isSuccess = eventType === 'TRANSACTION_SUCCESSFUL' || payload.notificationType === 'SUCCESS';

    if (isSuccess) {
        const data = payload.payments || payload;
        const { paymentReference, amount, customerEmail } = data;
        const email = customerEmail;

        if (email && paymentReference) {
            console.log(`[Seerbit Webhook] Payment verified: ${paymentReference} for ${email}`);
            try {
                const result = await processSubscriptionPayment({
                    email,
                    amount: Number(amount),
                    gateway: 'seerbit',
                    reference: paymentReference
                });

                await syncSubscriptionReferral(result, Number(amount), '[Seerbit Webhook]');
            } catch (error) {
                console.error('[Seerbit Webhook] Convex sync failed:', error);
                return json({ status: 'error', message: 'Backend integration failed' }, { status: 500 });
            }
        }
    }

    return json({ status: 'accepted' });
};
