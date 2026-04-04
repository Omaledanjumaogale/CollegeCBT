import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { FLUTTERWAVE_WEBHOOK_HASH } from '$env/static/private';

/**
 * Flutterwave Webhook Handler
 * Validates the verif-hash header against a dedicated webhook hash secret
 * (set in Flutterwave Dashboard → Webhooks → Secret Hash) and upgrades user plan.
 *
 * NOTE: FLUTTERWAVE_WEBHOOK_HASH is a separate secret you define yourself
 * in the Flutterwave dashboard. It is NOT the API Client Secret nor the
 * Encryption Key. Set a strong random string there and add it to .env here.
 */
export const POST: RequestHandler = async ({ request }) => {
    const receivedHash = request.headers.get('verif-hash');

    // Simple constant-time-safe comparison using crypto.subtle
    if (!receivedHash) {
        console.error('[Flutterwave Webhook] Missing verif-hash header');
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    if (receivedHash !== FLUTTERWAVE_WEBHOOK_HASH) {
        console.error('[Flutterwave Webhook] Invalid verif-hash');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    // ── Parse ────────────────────────────────────────────────────────────────────
    let payload: any;
    try {
        payload = await request.json();
    } catch {
        return json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    // ── Process successful charge ────────────────────────────────────────────────
    if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
        const { tx_ref, amount, customer } = payload.data;
        // Use email as the user identifier (matched in Convex by uid which is email on signup)
        const uid = customer?.email;

        if (uid) {
            console.log(`[Flutterwave Webhook] Payment verified: ${tx_ref} for ${uid}`);
            const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
            try {
                await convex.mutation(anyApi.users.updateUserPlan, { uid, plan: 'pro' });
                await convex.mutation(anyApi.interactionSessions.logAudit, {
                    action: 'payment_webhook_processed',
                    status: 'success',
                    metadata: JSON.stringify({ gateway: 'flutterwave', tx_ref, amount })
                });
            } catch (error) {
                console.error('[Flutterwave Webhook] Convex sync failed:', error);
            }
        }
    }

    return json({ status: 'accepted' });
};
