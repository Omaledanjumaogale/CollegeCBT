import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { convex } from '$lib/services/convexClient';
import { anyApi } from 'convex/server';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

const mockTriggerSchema = z.object({
  gateway: z.enum(['flutterwave', 'korapay', 'paystack', 'seerbit']),
  amount: z.number().positive(),
  reference: z.string().min(1),
  email: z.string().email(),
  idToken: z.string().min(1),
});

function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[payment/mock-trigger] Error decoding JWT:', err);
    return null;
  }
}

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

    // 1. Verify token content (JWT decoding check)
    const tokenPayload = decodeJWT(idToken);
    if (!tokenPayload) {
      return json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const isMatched =
      (tokenPayload.email === email || tokenPayload.firebase?.identities?.email?.[0] === email);

    if (!isMatched) {
      return json({ error: 'Session identity mismatch' }, { status: 403 });
    }

    // Check expiration
    if (tokenPayload.exp && tokenPayload.exp < Date.now() / 1000) {
      return json({ error: 'Authentication token has expired' }, { status: 401 });
    }

    // 2. Resolve private API keys securely
    const env = (platform?.env || {}) as Record<string, string>;
    const getSecretKey = (key: string): string => {
      return env[key] || '';
    };

    let secretKey = '';
    if (gateway === 'flutterwave') secretKey = getSecretKey('FLUTTERWAVE_CLIENT_SECRET');
    if (gateway === 'korapay') secretKey = getSecretKey('KORAPAY_SECRET_KEY');
    if (gateway === 'paystack') secretKey = getSecretKey('PAYSTACK_SECRET_KEY');
    if (gateway === 'seerbit') secretKey = getSecretKey('SEERBIT_SECRET_KEY');

    const isPlaceholder = !secretKey || secretKey.toLowerCase().includes('placeholder') || secretKey.startsWith('your-') || secretKey.trim() === '';

    // If it's NOT a placeholder key, we should NOT allow mock trigger! This prevents abuse on live production platforms
    if (!isPlaceholder) {
      console.warn(`[payment/mock-trigger] Blocked mock trigger attempt for live gateway: ${gateway}`);
      return json({
        error: 'Mock simulation is disabled for this gateway in production environments.'
      }, { status: 403 });
    }

    console.log(`[payment/mock-trigger] Executing simulated Convex plan upgrade for reference: ${reference}`);

    // Call Convex mutation to record subscription and update user profile to pro
    const result = await convex.mutation(anyApi.users.processPayment, {
      email: email,
      plan: 'pro',
      amount: amount,
      gateway: gateway,
      reference: reference
    });

    return json({ success: true, result });

  } catch (err: any) {
    console.error('[payment/mock-trigger] Simulation trigger failed:', err);
    return json({ error: err.message || 'Simulation trigger failed' }, { status: 500 });
  }
};
