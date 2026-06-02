import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { verifyFirebaseIdentity } from '$lib/server/auth';
import {
  getPaymentSecretKey,
  isProductionRuntime,
  isPlaceholderSecret,
  processSubscriptionPayment,
  syncSubscriptionReferral
} from '$lib/server/payments';

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

    if (isProductionRuntime(env)) {
      console.warn(`[payment/mock-trigger] Blocked mock trigger in production runtime for gateway: ${gateway}`);
      return json({
        error: 'Mock payment simulation is disabled in production.'
      }, { status: 403 });
    }

    // If it's NOT a placeholder key, we should NOT allow mock trigger! This prevents abuse on live production platforms
    if (!isPlaceholder) {
      console.warn(`[payment/mock-trigger] Blocked mock trigger attempt for live gateway: ${gateway}`);
      return json({
        error: 'Mock simulation is disabled for this gateway in production environments.'
      }, { status: 403 });
    }

    console.log(`[payment/mock-trigger] Executing simulated Convex plan upgrade for reference: ${reference}`);

    const result = await processSubscriptionPayment({
      email,
      amount,
      gateway,
      reference
    });

    await syncSubscriptionReferral(result, amount, '[payment/mock-trigger]');

    return json({ success: true, result });

  } catch (err: any) {
    console.error('[payment/mock-trigger] Simulation trigger failed:', err);
    return json({ error: err.message || 'Simulation trigger failed' }, { status: 500 });
  }
};
