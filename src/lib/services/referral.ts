import { api } from './convexClient';
import { convex } from './convexClient';

/**
 * Capture referral code from URL parameters and save to localStorage.
 */
export function captureReferralCode() {
  if (typeof window === 'undefined') return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('ref') || urlParams.get('referral');
    if (code) {
      localStorage.setItem('ewin_referral_code', code);
      console.log(`[CollegeCBT Referral] Referral code captured and saved: ${code}`);
    }
  } catch (err) {
    console.warn('[CollegeCBT Referral] Failed to capture referral code:', err);
  }
}

/**
 * Helper to get the saved referral code.
 */
export function getSavedReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('ewin_referral_code');
  } catch {
    return null;
  }
}

/**
 * Clear the saved referral code.
 */
export function clearSavedReferralCode() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('ewin_referral_code');
  } catch {}
}

/**
 * Records a referral event (signup or subscription) to both Convex and E-WIN ecosystem API.
 * This function is guaranteed to be NON-FATAL and will not throw errors to the caller.
 */
export async function recordReferralEvent(
  type: 'signup' | 'subscription',
  params: {
    userId: string;
    email: string;
    amount?: number;
  }
): Promise<void> {
  const referralCode = getSavedReferralCode();
  if (!referralCode) {
    // No referral code stored, nothing to record.
    return;
  }

  console.log(`[CollegeCBT Referral] Recording ${type} referral event for user ${params.userId} with code ${referralCode}`);

  let ewinStatus = 'pending';

  // 1. Report to the E-WIN Referral API (Non-blocking / Fire-and-forget)
  try {
    const ewinApiUrl = 'https://api.ewinproject.org/v1/referrals';
    const response = await fetch(ewinApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode,
        type,
        userId: params.userId,
        email: params.email,
        amount: params.amount,
        platform: 'college_cbt',
        timestamp: Date.now(),
      }),
    });

    if (response.ok) {
      console.log('[CollegeCBT Referral] Successfully recorded referral in E-WIN API');
      ewinStatus = 'processed';
    } else {
      console.warn(`[CollegeCBT Referral] E-WIN API responded with status ${response.status}`);
      ewinStatus = `failed_ewin_status_${response.status}`;
    }
  } catch (err) {
    console.warn('[CollegeCBT Referral] Failed to send referral event to E-WIN API (non-fatal):', err);
    ewinStatus = 'failed_ewin_network';
  }

  // 2. Record referral event to Convex for audit logs and admin insights
  try {
    await convex.mutation(api.referrals.logReferral, {
      referralCode,
      type,
      amount: params.amount,
      status: ewinStatus,
    });
    
    // Clear code after successful signup log
    if (type === 'signup') {
      clearSavedReferralCode();
    }
  } catch (err) {
    console.warn('[CollegeCBT Referral] Failed to save referral log to Convex (non-fatal):', err);
  }
}

/**
 * Server-side helper to sync a processed referral to E-WIN API.
 * This can be called from server-side webhooks or endpoints.
 */
export async function syncReferralToEwinServer(
  params: {
    userId: string;
    email: string;
    referralCode: string;
    type: 'signup' | 'subscription';
    amount?: number;
  }
): Promise<boolean> {
  try {
    const ewinApiUrl = 'https://api.ewinproject.org/v1/referrals';
    const response = await fetch(ewinApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode: params.referralCode,
        type: params.type,
        userId: params.userId,
        email: params.email,
        amount: params.amount,
        platform: 'college_cbt',
        timestamp: Date.now(),
      }),
    });

    return response.ok;
  } catch (err) {
    console.warn('[CollegeCBT Referral Server] Sync to E-WIN API failed:', err);
    return false;
  }
}
