import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAuth } from './authGuard';

/**
 * Subscription management utilities for the multi-gateway payment system.
 * Provides queries to check subscription status, billing history, and plan details.
 * Payment processing (processPayment) lives in convex/users.ts.
 */

export const recordPaymentVerification = mutation({
  args: {
    userId: v.optional(v.string()),
    gateway: v.union(v.literal('flutterwave'), v.literal('korapay'), v.literal('paystack'), v.literal('seerbit')),
    reference: v.string(),
    eventType: v.string(),
    status: v.union(v.literal('received'), v.literal('processed'), v.literal('duplicate'), v.literal('failed')),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    payload: v.string(),
    error: v.optional(v.string()),
    receivedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const recent = await ctx.db
      .query('paymentEvents')
      .withIndex('by_reference', (q) => q.eq('reference', args.reference))
      .filter((q) => q.and(
        q.eq(q.field('gateway'), args.gateway),
        q.eq(q.field('eventType'), args.eventType),
        q.eq(q.field('status'), args.status)
      ))
      .first();

    if (recent) return recent._id;

    return await ctx.db.insert('paymentEvents', {
      userId: args.userId,
      gateway: args.gateway,
      reference: args.reference,
      eventType: args.eventType,
      status: args.status,
      amount: args.amount,
      currency: args.currency,
      payload: args.payload,
      error: args.error,
      receivedAt: args.receivedAt ?? now,
      processedAt: args.processedAt,
    });
  },
});

/**
 * Get the current user's active subscription details.
 * Returns null if no active subscription exists.
 */
export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .first();

    if (!sub) return null;

    return {
      plan: sub.plan,
      status: sub.status,
      gateway: sub.gateway,
      amount: sub.amount,
      createdAt: sub.createdAt,
      expiresAt: sub.expiresAt,
      daysRemaining: Math.max(0, Math.floor((sub.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))),
      isExpired: sub.expiresAt < Date.now(),
    };
  },
});

/**
 * Get billing history for the current user.
 */
export const getMyBillingHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const subs = await ctx.db
      .query('subscriptions')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(50);

    return subs.map((s) => ({
      plan: s.plan,
      status: s.status,
      gateway: s.gateway,
      amount: s.amount,
      reference: s.reference,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  },
});

/**
 * Check if the current user has active platform access.
 * Returns the platformAccess record or null.
 */
export const checkPlatformAccess = query({
  args: { platform: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const platform = args.platform ?? 'college_cbt';
    const access = await ctx.db
      .query('platformAccess')
      .withIndex('by_platform_user', (q) => q.eq('platform', platform).eq('userId', identity.subject))
      .first();

    if (!access) return null;

    return {
      status: access.status,
      role: access.role,
      expiresAt: access.expiresAt,
      isActive: access.status === 'active' && access.expiresAt > Date.now(),
      daysRemaining: Math.max(0, Math.floor((access.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))),
    };
  },
});

/**
 * Admin-only: Get platform subscription stats.
 */
export const getSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Verify admin via authGuard
    const user = await ctx.db
      .query('users')
      .withIndex('by_uid', (q) => q.eq('uid', identity.subject))
      .first();

    if (!user || user.role !== 'admin') return null;

    const totalSubs = await ctx.db.query('subscriptions').collect();
    const activeSubs = totalSubs.filter(
      (s) => s.status === 'active' && s.expiresAt > Date.now()
    );
    const totalRevenue = activeSubs.reduce((sum, s) => sum + s.amount, 0);
    const byGateway = totalSubs.reduce(
      (acc, s) => {
        acc[s.gateway] = (acc[s.gateway] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalSubscriptions: totalSubs.length,
      activeSubscriptions: activeSubs.length,
      totalRevenue,
      revenueCurrency: 'NGN',
      byGateway,
    };
  },
});
