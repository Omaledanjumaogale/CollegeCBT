import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { convex, api } from '$lib/services/convexClient';
import { verifyFirebaseIdentity } from '$lib/server/auth';
import { getPaymentSecretKey, isPlaceholderSecret } from '$lib/server/payments';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

const mockTriggerSchema = z.object({
  gateway: z.enum(['flutterwave', 'korapay', 'paystack', 'seerbit']),
  amount: z.number().positive(),
  reference: z.string().min(1),
  email: z.string().email(),
  idToken: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const rawBody = await request.json();
    const validation = mockTriggerSchema.safeParse(rawBody);

    if (!validation.success) {
      return json({
        error: 'Invalid mock trigger parameters',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { gateway, amount, reference, email, idToken } = validation.data;

    const env = (platform?.env || {}) as Record<string, string | undefined>;
    const verifiedIdentity = await verifyFirebaseIdentity(idToken, { email }, env);
    if (!verifiedIdentity.ok) {
      return json({ error: verifiedIdentity.error }, { status: verifiedIdentity.status });
    }

    const secretKey = getPaymentSecretKey(gateway, env);
    const isPlaceholder = isPlaceholderSecret(secretKey);

    // If it's NOT a placeholder key, we should NOT allow mock trigger! This prevents abuse on live production platforms
    if (!isPlaceholder) {
      console.warn(`[payment/mock-trigger] Blocked mock trigger attempt for live gateway: ${gateway}`);
      return json({
        error: 'Mock simulation is disabled for this gateway in production environments.'
      }, { status: 403 });
    }

    console.log(`[payment/mock-trigger] Executing simulated Convex plan upgrade for reference: ${reference}`);

    // Call Convex mutation to record subscription and update user profile to pro
    const result = await convex.mutation(api.users.processPayment, {
      email: email,
      plan: 'pro',
      amount: amount,
      gateway: gateway,
      reference: reference
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
          amount: amount
        });
      } catch (refErr) {
        console.warn('[payment/mock-trigger] E-WIN referral sync failed (non-fatal):', refErr);
      }
    }

    return json({ success: true, result });

  } catch (err: any) {
    console.error('[payment/mock-trigger] Simulation trigger failed:', err);
    return json({ error: err.message || 'Simulation trigger failed' }, { status: 500 });
  }
};
