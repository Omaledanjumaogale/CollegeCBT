import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { checkRateLimitInternal } from './rateLimit';
import { requireAdmin, requirePlatformAccess, requireUserProfile } from './authGuard';

// ── Identity Verification Mutation ──────────────────────────────────────────

/**
 * Enterprise sync mutation called after client-side Firebase login.
 * Uses Convex's built-in ctx.auth to verify the JWT identity from the EWINPROJECT identity provider.
 */
export const storeUser = mutation({
  args: {
    institutionType: v.optional(v.string()),
    institutionName: v.optional(v.string()),
    plan: v.optional(v.union(v.literal('free'), v.literal('pro'))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated identity in platform sync. Check Firebase ID Token.");
    }

    // ── Rate Limit Check ──
    const rl = await checkRateLimitInternal(ctx, { 
      key: `sync:${identity.subject}`, 
      burst: 5, 
      rate: 0.1 // 1 refill every 10 seconds
    });
    if (!rl.ok) throw new Error(rl.message);

    const existing = await ctx.db
      .query('users')
      .withIndex('by_uid', (q) => q.eq('uid', identity.subject)) // Firebase UID is in identity.subject
      .first();

    if (existing) {
      // Update platform profile
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        displayName: identity.name ?? existing.displayName,
        plan: args.plan ?? existing.plan,
        updatedAt: Date.now(),
      });

      // Ensure platformAccess exists
      const access = await ctx.db
        .query('platformAccess')
        .withIndex('by_platform_user', (q) => q.eq('platform', 'college_cbt').eq('userId', identity.subject))
        .first();
      if (!access) {
        await ctx.db.insert('platformAccess', {
          userId: identity.subject,
          platform: 'college_cbt',
          role: 'user',
          status: 'active',
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        });
      }

      return existing._id;
    } else {
      // Initialize platform-specific user record referencing global ID
      const newUserId = await ctx.db.insert('users', {
        uid: identity.subject,
        email: identity.email ?? "unknown@email.com",
        displayName: identity.name ?? "Student",
        plan: args.plan ?? 'free', // Default platform role
        role: 'user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        institutionType: args.institutionType,
        institutionName: args.institutionName
      });

      // Provision platformAccess record for 'college_cbt'
      await ctx.db.insert('platformAccess', {
        userId: identity.subject,
        platform: 'college_cbt',
        role: 'user',
        status: 'active',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });

      return newUserId;
    }
  },
});

/**
 * Platform Middleware: withPlatformAuth
 * Ensures the user has a valid subscription to THIS platform specifically.
 */
export async function withPlatformAuth<T>(
  ctx: QueryCtx | MutationCtx,
  handler: (user: Doc<"users">) => Promise<T>
) {
  await requirePlatformAccess(ctx, 'college_cbt');
  const user = await requireUserProfile(ctx);
  return await handler(user);
}

/**
 * Platform Middleware: withAdminAuth
 * Ensures the user has a valid identity AND the admin role on this platform.
 */
export async function withAdminAuth<T>(
  ctx: QueryCtx | MutationCtx,
  handler: (user: Doc<"users">) => Promise<T>
) {
  const admin = await requireAdmin(ctx);
  return await handler(admin);
}

// ── Get user by Firebase UID ──────────────────────────────────────────────────
export const getUserByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_uid', (q) => q.eq('uid', args.uid))
      .first();
  },
});

// ── Update subscription plan ───────────────────────────────────────────────────
export const updateUserPlan = mutation({
  args: {
    uid: v.string(),
    plan: v.union(v.literal('free'), v.literal('pro')),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_uid', (q) => q.eq('uid', args.uid))
      .first() || await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.uid))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { plan: args.plan, updatedAt: Date.now() });

      // Upsert / upgrade subscription record
      const subscription = await ctx.db
        .query('subscriptions')
        .withIndex('by_user', (q) => q.eq('userId', user.uid))
        .first();

      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // default 30 days
      if (subscription) {
        await ctx.db.patch(subscription._id, {
          plan: args.plan,
          status: args.plan === 'pro' ? 'active' : 'expired',
          expiresAt: args.plan === 'pro' ? expiresAt : Date.now(),
        });
      } else {
        await ctx.db.insert('subscriptions', {
          userId: user.uid,
          platform: 'college_cbt',
          plan: args.plan,
          status: args.plan === 'pro' ? 'active' : 'expired',
          amount: 0, // system update
          gateway: 'flutterwave', // default fallback
          reference: `SYS-UPGRADE-${user.uid}-${Date.now()}`,
          createdAt: Date.now(),
          expiresAt: args.plan === 'pro' ? expiresAt : Date.now(),
        });
      }

      // Sync platformAccess
      const access = await ctx.db
        .query('platformAccess')
        .withIndex('by_platform_user', (q) => q.eq('platform', 'college_cbt').eq('userId', user.uid))
        .first();
      if (access) {
        await ctx.db.patch(access._id, {
          expiresAt: args.plan === 'pro' ? expiresAt : Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  },
});

// ── Process payment gateway webhook with idempotency & annual expiration ──
export const processPayment = mutation({
  args: {
    email: v.string(),
    plan: v.union(v.literal('free'), v.literal('pro')),
    amount: v.number(),
    gateway: v.union(v.literal('flutterwave'), v.literal('korapay'), v.literal('paystack'), v.literal('seerbit')),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Idempotency Check: look up subscription by reference
    const existingSub = await ctx.db
      .query('subscriptions')
      .withIndex('by_reference', (q) => q.eq('reference', args.reference))
      .first();

    if (existingSub) {
      console.log(`[processPayment] Reference ${args.reference} already processed`);
      return { success: true, alreadyProcessed: true };
    }

    // 2. Locate user profile by email or UID
    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (!user) {
      user = await ctx.db
        .query('users')
        .withIndex('by_uid', (q) => q.eq('uid', args.email))
        .first();
    }

    if (!user) {
      console.error(`[processPayment] User with email/UID ${args.email} not found.`);
      throw new Error(`User not found for payment reference: ${args.reference}`);
    }

    // 3. Update the user plan
    await ctx.db.patch(user._id, { plan: args.plan, updatedAt: Date.now() });

    // 4. Calculate annual expiration (365 days)
    const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;

    // 5. Insert subscription ledger entry
    await ctx.db.insert('subscriptions', {
      userId: user.uid,
      platform: 'college_cbt',
      plan: args.plan,
      status: 'active',
      amount: args.amount,
      gateway: args.gateway,
      reference: args.reference,
      createdAt: Date.now(),
      expiresAt: expiresAt,
    });

    // 6. Sync platformAccess permissions
    const access = await ctx.db
      .query('platformAccess')
      .withIndex('by_platform_user', (q) => q.eq('platform', 'college_cbt').eq('userId', user.uid))
      .first();

    if (access) {
      await ctx.db.patch(access._id, {
        status: 'active',
        expiresAt: expiresAt,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('platformAccess', {
        userId: user.uid,
        platform: 'college_cbt',
        role: 'user',
        status: 'active',
        expiresAt: expiresAt,
        updatedAt: Date.now(),
      });
    }

    // 7. Audit log event
    await ctx.db.insert('auditLogs', {
      userId: user.uid,
      action: 'payment_webhook_processed',
      status: 'success',
      metadata: JSON.stringify({
        gateway: args.gateway,
        reference: args.reference,
        amount: args.amount,
        plan: args.plan,
      }),
      timestamp: Date.now(),
    });

    return { success: true, alreadyProcessed: false };
  },
});

// ── Admin: list all users (paginated) ─────────────────────────────────────────
export const listUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await withAdminAuth(ctx, async () => {
      return await ctx.db
        .query('users')
        .order('desc')
        .take(args.limit ?? 50);
    });
  },
});

// ── Admin: get platform-wide stats ────────────────────────────────────────────
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    return await withAdminAuth(ctx, async () => {
      const users = await ctx.db.query('users').collect();
      const sessions = await ctx.db.query('sessions').collect();
      const gradeReports = await ctx.db.query('gradeReports').collect();

      const totalUsers = users.length;
      const proUsers = users.filter((u) => u.plan === 'pro').length;
      const totalSessions = sessions.length;
      const avgScore =
        sessions.length > 0
          ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length)
          : 0;
      const totalGraded = gradeReports.length;

      return { totalUsers, proUsers, totalSessions, avgScore, totalGraded };
    });
  },
});

// ── Admin: update user plan override ──────────────────────────────────────────
export const adminOverridePlan = mutation({
  args: {
    userId: v.id('users'),
    plan: v.union(v.literal('free'), v.literal('pro')),
  },
  handler: async (ctx, args) => {
    return await withAdminAuth(ctx, async (admin) => {
      const user = await ctx.db.get(args.userId);
      if (!user) throw new Error("User not found");

      const oldPlan = user.plan;
      await ctx.db.patch(args.userId, { plan: args.plan, updatedAt: Date.now() });

      // ── Audit Log ──
      await ctx.db.insert('auditLogs', {
        userId: admin.uid,
        action: 'admin_plan_override',
        status: 'success',
        metadata: JSON.stringify({
          targetUid: user.uid,
          oldPlan,
          newPlan: args.plan
        }),
        timestamp: Date.now()
      });
    });
  },
});
