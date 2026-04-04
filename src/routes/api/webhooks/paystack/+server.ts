import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

/**
 * Paystack Webhook Handler
 * Validates HMAC-SHA512 signature and upgrades user plan via Convex.
 */

/** Edge-compatible HMAC-SHA512 hex verification */
async function verifyHmacSha512(secret: string, payload: string, expectedHex: string): Promise<boolean> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === expectedHex;
}

export const POST: RequestHandler = async ({ request }) => {
    const signature = request.headers.get('x-paystack-signature');
    if (!signature) {
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    const payloadText = await request.text();

    // ── Signature Verification ──────────────────────────────────────────────────
    let isValid = false;
    try {
        isValid = await verifyHmacSha512(env.PAYSTACK_SECRET_KEY!, payloadText, signature);
    } catch (err) {
        console.error('[Paystack Webhook] Verification failed:', err);
        return json({ status: 'error', message: 'Verification error' }, { status: 500 });
    }

    if (!isValid) {
        console.error('[Paystack Webhook] Invalid HMAC-SHA512 signature');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse & Process ─────────────────────────────────────────────────────────
    let payload: any;
    try {
        payload = JSON.parse(payloadText);
    } catch {
        return json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    if (payload.event === 'charge.success') {
        const { reference, amount, customer } = payload.data;
        const uid = customer?.email;

        if (uid) {
            console.log(`[Paystack Webhook] Payment verified: ${reference} for ${uid}`);
            const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
            try {
                await convex.mutation(anyApi.users.updateUserPlan, { uid, plan: 'pro' });
                await convex.mutation(anyApi.interactionSessions.logAudit, {
                    action: 'payment_webhook_processed',
                    status: 'success',
                    metadata: JSON.stringify({ gateway: 'paystack', reference, amount })
                });
            } catch (error) {
                console.error('[Paystack Webhook] Convex sync failed:', error);
            }
        }
    }

    return json({ status: 'accepted' });
};
