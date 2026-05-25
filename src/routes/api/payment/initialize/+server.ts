import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { verifyFirebaseIdentity } from '$lib/server/auth';
import {
	createPaymentReference,
	getAppUrl,
	getPaymentSecretKey,
	isPlaceholderSecret
} from '$lib/server/payments';

export const _runtime = 'edge';
export const _dynamic = 'force-dynamic';

const paymentInitSchema = z.object({
  gateway: z.enum(['flutterwave', 'korapay', 'paystack', 'seerbit']),
  amount: z.number().positive(),
  plan: z.literal('pro'),
  email: z.string().email(),
  uid: z.string().min(1),
  idToken: z.string().min(1),
});

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const rawBody = await request.json();
    const validation = paymentInitSchema.safeParse(rawBody);

    if (!validation.success) {
      return json({
        error: 'Invalid initialization parameters',
        details: validation.error.format()
      }, { status: 400 });
    }

    const { gateway, amount, plan, email, uid, idToken } = validation.data;

    const env = (platform?.env || {}) as Record<string, string | undefined>;
    const verifiedIdentity = await verifyFirebaseIdentity(idToken, { uid, email }, env);
    if (!verifiedIdentity.ok) {
      return json({ error: verifiedIdentity.error }, { status: verifiedIdentity.status });
    }

    const appUrl = getAppUrl(env);
    const reference = createPaymentReference(uid);

    // 3. Check if we should trigger Sandbox simulator route
    const secretKey = getPaymentSecretKey(gateway, env);
    const isPlaceholder = isPlaceholderSecret(secretKey);

    if (isPlaceholder) {
      console.log(`[payment/initialize] Gateway ${gateway} API keys are placeholders. Redirecting to mock gateway simulator.`);
      const mockCheckoutUrl = `/checkout/mock-gateway?gateway=${gateway}&reference=${reference}&amount=${amount}&email=${encodeURIComponent(email)}`;
      return json({ checkoutUrl: mockCheckoutUrl, simulated: true });
    }

    // 4. Contact real Payment Gateway
    let checkoutUrl = '';

    if (gateway === 'flutterwave') {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount: amount,
          currency: 'NGN',
          redirect_url: `${appUrl}/checkout/success?reference=${reference}&gateway=flutterwave`,
          customer: { email },
          customizations: {
            title: 'CollegeCBT Student Pro',
            description: 'Annual membership subscription'
          }
        }),
        signal: AbortSignal.timeout(15_000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[payment/initialize] Flutterwave init failed:', response.status, errorText);
        throw new Error('Flutterwave service initialization failed');
      }

      const data = await response.json() as { status: string; data?: { link: string } };
      if (data.status === 'success' && data.data?.link) {
        checkoutUrl = data.data.link;
      } else {
        throw new Error('Invalid initialization response from Flutterwave');
      }
    } 
    
    else if (gateway === 'korapay') {
      const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          customer: { email },
          reference: reference,
          notification_url: `${appUrl}/api/webhooks/korapay`,
          redirect_url: `${appUrl}/checkout/success?reference=${reference}&gateway=korapay`,
          description: 'CollegeCBT Student Pro Annual Plan'
        }),
        signal: AbortSignal.timeout(15_000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[payment/initialize] Korapay init failed:', response.status, errorText);
        throw new Error('Korapay service initialization failed');
      }

      const data = await response.json() as { status: boolean; data?: { checkout_url: string } };
      if (data.status && data.data?.checkout_url) {
        checkoutUrl = data.data.checkout_url;
      } else {
        throw new Error('Invalid initialization response from Korapay');
      }
    } 
    
    else if (gateway === 'paystack') {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // in kobo
          email: email,
          reference: reference,
          callback_url: `${appUrl}/checkout/success?reference=${reference}&gateway=paystack`,
          metadata: {
            custom_fields: [
              {
                display_name: 'Plan',
                variable_name: 'plan',
                value: 'pro'
              }
            ]
          }
        }),
        signal: AbortSignal.timeout(15_000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[payment/initialize] Paystack init failed:', response.status, errorText);
        throw new Error('Paystack service initialization failed');
      }

      const data = await response.json() as { status: boolean; data?: { authorization_url: string } };
      if (data.status && data.data?.authorization_url) {
        checkoutUrl = data.data.authorization_url;
      } else {
        throw new Error('Invalid initialization response from Paystack');
      }
    } 
    
    else if (gateway === 'seerbit') {
      const response = await fetch('https://api.seerbitapigateway.com/api/v2/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          callbackUrl: `${appUrl}/checkout/success?reference=${reference}&gateway=seerbit`,
          country: 'NG',
          currency: 'NGN',
          email: email,
          paymentReference: reference,
          productDescription: 'CollegeCBT Student Pro Annual Plan',
          productId: 'college_cbt_pro'
        }),
        signal: AbortSignal.timeout(15_000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[payment/initialize] Seerbit init failed:', response.status, errorText);
        throw new Error('Seerbit service initialization failed');
      }

      const data = await response.json() as { status: string; data?: { payments?: { redirectUrl: string } } };
      if (data.status === 'SUCCESS' && data.data?.payments?.redirectUrl) {
        checkoutUrl = data.data.payments.redirectUrl;
      } else {
        throw new Error('Invalid initialization response from Seerbit');
      }
    }

    return json({ checkoutUrl, simulated: false });

  } catch (err: any) {
    console.error('[payment/initialize] Internal initialize error:', err);
    // As an enterprise fallback, if anything fails (e.g. gateway api is down), we fallback to simulation in dev/preview settings
    return json({
      error: err.message || 'Payment initialization failed'
    }, { status: 500 });
  }
};
