import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { convex } from '$lib/services/convexClient';
import { anyApi } from 'convex/server';
import { env } from '$env/dynamic/private';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

/**
 * Flutterwave Webhook Handler
 * Validates the verif-hash header against a dedicated webhook hash secret
 * and upgrades user plan via the unified processPayment mutation.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
    const receivedHash = request.headers.get('verif-hash');

    if (!receivedHash) {
        console.error('[Flutterwave Webhook] Missing verif-hash header');
        return json({ status: 'error', message: 'Missing signature' }, { status: 401 });
    }

    // Resolve private API keys securely (fallback to platform.env for Edge environment compatibility)
    const platformEnv = (platform?.env || {}) as Record<string, string>;
    const expectedHash = env.FLUTTERWAVE_WEBHOOK_HASH || platformEnv.FLUTTERWAVE_WEBHOOK_HASH;

    if (!expectedHash) {
        console.error('[Flutterwave Webhook] Server hash secret not configured');
        return json({ status: 'error', message: 'Webhook configuration error' }, { status: 500 });
    }

    if (receivedHash !== expectedHash) {
        console.error('[Flutterwave Webhook] Invalid verif-hash signature mismatch');
        return json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    let payload: any;
    try {
        payload = await request.json();
    } catch {
        return json({ status: 'error', message: 'Invalid JSON body' }, { status: 400 });
    }

    if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
        const { tx_ref, amount, customer } = payload.data;
        const email = customer?.email;

        if (email) {
            console.log(`[Flutterwave Webhook] Payment verified: ${tx_ref} for ${email}`);
            try {
                // Call unified Convex transaction mutation to process subscription state
                await convex.mutation(anyApi.users.processPayment, {
                    email,
                    plan: 'pro',
                    amount: Number(amount),
                    gateway: 'flutterwave',
                    reference: tx_ref
                });
            } catch (error) {
                console.error('[Flutterwave Webhook] Convex sync failed:', error);
                return json({ status: 'error', message: 'Backend integration failed' }, { status: 500 });
            }
        }
    }

    return json({ status: 'accepted' });
};
