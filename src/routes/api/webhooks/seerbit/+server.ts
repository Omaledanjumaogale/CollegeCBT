import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { convex, api } from '$lib/services/convexClient';
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
        isValid = await verifyHmacSha256(secretKey, payloadText, signature);
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
        const email = customerEmail;

        if (email) {
            console.log(`[Seerbit Webhook] Payment verified: ${paymentReference} for ${email}`);
            try {
                // Call unified Convex transaction mutation to process subscription state
                const result = await convex.mutation(api.users.processPayment, {
                    email,
                    plan: 'pro',
                    amount: Number(amount),
                    gateway: 'seerbit',
                    reference: paymentReference
                }) as any;

                // Sync referral commission to E-WIN Server (Non-fatal / Non-blocking)
                if (result?.success && result.email) {
                    try {
                        const { syncReferralToEwinServer } = await import('$lib/services/referral');
                        await syncReferralToEwinServer({
                            userId: result.userId,
                            email: result.email,
                            referralCode: result.referralCode || 'webhook_auto',
                            type: 'subscription',
                            amount: Number(amount)
                        });
                    } catch (refErr) {
                        console.warn('[Seerbit Webhook] E-WIN referral sync failed (non-fatal):', refErr);
                    }
                }
            } catch (error) {
                console.error('[Seerbit Webhook] Convex sync failed:', error);
                return json({ status: 'error', message: 'Backend integration failed' }, { status: 500 });
            }
        }
    }

    return json({ status: 'accepted' });
};
