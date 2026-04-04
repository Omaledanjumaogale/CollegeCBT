import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

/**
 * Seerbit Webhook Handler
 * Validates HMAC-SHA256 signature and upgrades user plan via Convex.
 */

/** Edge-compatible HMAC-SHA256 hex verification */
async function verifyHmacSha256(secret: string, payload: string, expectedHex: string): Promise<boolean> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === expectedHex;
}

export const POST: RequestHandler = async ({ request }) => {
    const signature = request.headers.get('x-seerbit-signature') || request.headers.get('Hash');
    if (!signature) {
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    const payloadText = await request.text();

    // ── Signature Verification ──────────────────────────────────────────────────
    let isValid = false;
    try {
        isValid = await verifyHmacSha256(env.SEERBIT_SECRET_KEY!, payloadText, signature);
    } catch (err) {
        console.error('[Seerbit Webhook] Verification failed:', err);
        return json({ status: 'error', message: 'Verification error' }, { status: 500 });
    }

    if (!isValid) {
        console.error('[Seerbit Webhook] Invalid HMAC signature');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse & Process ─────────────────────────────────────────────────────────
    let payload: any;
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
        const uid = customerEmail;

        if (uid) {
            console.log(`[Seerbit Webhook] Payment verified: ${paymentReference} for ${uid}`);
            const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
            try {
                await convex.mutation(anyApi.users.updateUserPlan, { uid, plan: 'pro' });
                await convex.mutation(anyApi.interactionSessions.logAudit, {
                    action: 'payment_webhook_processed',
                    status: 'success',
                    metadata: JSON.stringify({ gateway: 'seerbit', reference: paymentReference, amount })
                });
            } catch (error) {
                console.error('[Seerbit Webhook] Convex sync failed:', error);
            }
        }
    }

    return json({ status: 'accepted' });
};
