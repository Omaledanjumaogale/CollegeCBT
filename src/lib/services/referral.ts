import { api } from './convexClient';
import { convex } from './convexClient';

/**
 * Platform ID for this application in the E-WIN ecosystem.
 * Used when recording subscription commissions.
 */
const PLATFORM_ID = 'collegecbt';

/**
 * E-WIN Central Convex Backend — single source of truth for all referral/commission data.
 */
const EWIN_CONVEX_HTTP_URL = 'https://pastel-lemur-183.convex.site';
const EWIN_CONVEX_WS_URL  = 'https://pastel-lemur-183.convex.cloud';

/**
 * Capture referral code or affiliate slug from URL parameters and persist to sessionStorage.
 *
 * URL patterns handled:
 *   ?code=AMB-XXXX-0000  → Ambassador Invite Code (Impact Ambassador)
 *   ?ref=atn-xxxxxxxx    → Affiliate Referral Slug (Affiliate Trust Network)
 *   ?referral=X          → Legacy referral code (backward compat)
 *
 * These two systems are STRICTLY SEPARATE:
 * - Invite Codes are for Impact Ambassadors ONLY
 * - Referral Links are for Affiliate Trust Network ONLY
 */
export function captureReferralCode() {
  if (typeof window === 'undefined') return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Ambassador invite code (takes priority)
    const inviteCode = urlParams.get('code');
    if (inviteCode) {
      sessionStorage.setItem('ewin_invite_code', inviteCode);
      console.log(`[E-WIN Referral] Ambassador invite code captured: ${inviteCode}`);
      return;
    }

    // Affiliate referral slug
    const refSlug = urlParams.get('ref');
    if (refSlug) {
      sessionStorage.setItem('ewin_ref_slug', refSlug);
      console.log(`[E-WIN Referral] Affiliate referral slug captured: ${refSlug}`);
      return;
    }

    // Legacy referral code (backward compat)
    const legacyRef = urlParams.get('referral');
    if (legacyRef) {
      sessionStorage.setItem('ewin_invite_code', legacyRef);
      console.log(`[E-WIN Referral] Legacy referral code captured: ${legacyRef}`);
    }
  } catch (err) {
    console.warn('[E-WIN Referral] Failed to capture referral:', err);
  }
}

/**
 * Check if there's a stored referral (used to show referral banner).
 */
export function hasActiveReferral(): { type: 'ambassador' | 'affiliate' | null; code: string | null } {
  if (typeof window === 'undefined') return { type: null, code: null };
  try {
    const invite = sessionStorage.getItem('ewin_invite_code');
    if (invite) return { type: 'ambassador', code: invite };
    const ref = sessionStorage.getItem('ewin_ref_slug');
    if (ref) return { type: 'affiliate', code: ref };
  } catch {}
  return { type: null, code: null };
}

/**
 * Record a signup referral event to the E-WIN central Convex backend.
 * Call AFTER successful user registration — never block registration on this.
 * 
 * Uses the E-WIN Convex HTTP action endpoint.
 */
export async function recordReferralAfterSignup(
  userUid: string,
  userName: string,
  userEmail: string
): Promise<void> {
  try {
    const inviteCode: string | null =
      typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ewin_invite_code') : null;
    const refSlug: string | null =
      typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('ewin_ref_slug') : null;

    if (!inviteCode && !refSlug) return; // No referral — nothing to record

    // Build payload based on referral type
    const payload = inviteCode
      ? {
          referrerCode: inviteCode,
          referralType: 'invite_code',
          refereeUid: userUid,
          refereeName: userName,
          refereeEmail: userEmail,
        }
      : {
          referrerSlug: refSlug,
          referralType: 'referral_link',
          refereeUid: userUid,
          refereeName: userName,
          refereeEmail: userEmail,
        };

    // Call E-WIN Convex HTTP action endpoint
    const response = await fetch(`${EWIN_CONVEX_HTTP_URL}/referral/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('[E-WIN Referral] Signup recorded successfully');
      // Clear sessionStorage after successful recording
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('ewin_invite_code');
        sessionStorage.removeItem('ewin_ref_slug');
      }
    } else {
      console.warn(`[E-WIN Referral] Signup recording returned ${response.status}`);
    }
  } catch (err) {
    // NON-FATAL: referral failure must never block user registration
    console.warn('[E-WIN Referral] Signup recording failed (non-fatal):', err);
  }

  // Also record to local Convex for audit trail (non-fatal)
  try {
    const savedCode = inviteCode || refSlug;
    if (savedCode) {
      await convex.mutation(api.referrals.logReferral, {
        referralCode: savedCode,
        type: 'signup',
        status: 'recorded',
      });
    }
  } catch (err) {
    console.warn('[E-WIN Referral] Local audit log failed (non-fatal):', err);
  }
}

/**
 * Record a subscription commission event to the E-WIN central Convex backend.
 * Call AFTER payment is confirmed and subscription is activated.
 * 
 * Uses E-WIN Convex mutation directly.
 */
export async function recordSubscriptionCommission(
  subscriberFirebaseUid: string,
  planName: string,
  amountNGN: number
): Promise<void> {
  try {
    const response = await fetch(`${EWIN_CONVEX_HTTP_URL}/referral/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refereeFirebaseUid: subscriberFirebaseUid,
        platformId: PLATFORM_ID,
        subscriptionPlan: planName,
        subscriptionAmount: amountNGN,
      }),
    });

    if (response.ok) {
      console.log(`[E-WIN Referral] Subscription commission recorded: ${planName} ₦${amountNGN}`);
    } else {
      console.warn(`[E-WIN Referral] Commission recording returned ${response.status}`);
    }
  } catch (err) {
    // NON-FATAL: commission failure must never block payment confirmation
    console.warn('[E-WIN Referral] Commission recording failed (non-fatal):', err);
  }

  // Also record to local Convex for audit trail (non-fatal)
  try {
    await convex.mutation(api.referrals.logReferral, {
      referralCode: PLATFORM_ID,
      type: 'subscription',
      amount: amountNGN,
      status: 'commission_recorded',
    });
  } catch (err) {
    console.warn('[E-WIN Referral] Local audit log for commission failed (non-fatal):', err);
  }
}
