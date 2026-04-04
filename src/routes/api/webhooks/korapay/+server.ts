import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { KORAPAY_SECRET_KEY } from '$env/static/private';

/**
 * Korapay Webhook Handler
 * Validates the HMAC-SHA256 signature and upgrades user plan via Convex.
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
    const signature = request.headers.get('x-korapay-signature');
    if (!signature) {
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    const payloadText = await request.text();

    // ── Signature Verification ──────────────────────────────────────────────────
    let isValid = false;
    try {
        isValid = await verifyHmacSha256(KORAPAY_SECRET_KEY, payloadText, signature);
    } catch (err) {
        console.error('[Korapay Webhook] Verification failed:', err);
        return json({ status: 'error', message: 'Signature verification error' }, { status: 500 });
    }

    if (!isValid) {
        console.error('[Korapay Webhook] Invalid HMAC signature');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse & Process ─────────────────────────────────────────────────────────
    let payload: any;
    try {
        payload = JSON.parse(payloadText);
    } catch {
        return json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    if (payload.event === 'charge.success' && payload.data?.status === 'success') {
        const { reference, amount, customer } = payload.data;
        // Use customer email as user identifier (UID matched in Convex by email/uid)
        const uid = customer?.email;

        if (uid) {
            console.log(`[Korapay Webhook] Payment verified: ${reference} for ${uid}`);
            const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
            try {
                await convex.mutation(anyApi.users.updateUserPlan, { uid, plan: 'pro' });
                await convex.mutation(anyApi.interactionSessions.logAudit, {
                    action: 'payment_webhook_processed',
                    status: 'success',
                    metadata: JSON.stringify({ gateway: 'korapay', reference, amount })
                });
            } catch (error) {
                // Log but don't fail — Korapay retries on non-2xx
                console.error('[Korapay Webhook] Convex sync failed:', error);
            }
        }
    }

    return json({ status: 'accepted' });
};
