import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { convex } from '$lib/services/convexClient';
import { anyApi } from 'convex/server';
import { env } from '$env/dynamic/private';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

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
        isValid = await verifyHmacSha256(secretKey, payloadText, signature);
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
        const email = customer?.email;

        if (email) {
            console.log(`[Korapay Webhook] Payment verified: ${reference} for ${email}`);
            try {
                // Call unified Convex transaction mutation to process subscription state
                const result = await convex.mutation(anyApi.users.processPayment, {
                    email,
                    plan: 'pro',
                    amount: Number(amount),
                    gateway: 'korapay',
                    reference
                }) as any;

                // Sync referral to E-WIN Server API (Non-fatal / Non-blocking)
                if (result?.success && result.referralCode) {
                    try {
                        const { syncReferralToEwinServer } = await import('$lib/services/referral');
                        await syncReferralToEwinServer({
                            userId: result.userId,
                            email: result.email,
                            referralCode: result.referralCode,
                            type: 'subscription',
                            amount: Number(amount)
                        });
                    } catch (refErr) {
                        console.warn('[Korapay Webhook] E-WIN referral sync failed (non-fatal):', refErr);
                    }
                }
            } catch (error) {
                console.error('[Korapay Webhook] Convex sync failed:', error);
                return json({ status: 'error', message: 'Backend integration failed' }, { status: 500 });
            }
        }
    }

    return json({ status: 'accepted' });
};
