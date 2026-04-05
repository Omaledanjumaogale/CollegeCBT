import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { checkRateLimitInternal } from './rateLimit';

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
      return existing._id;
    } else {
      // Initialize platform-specific user record referencing global ID
      return await ctx.db.insert('users', {
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
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized: Identity missing");

  const user = await ctx.db
    .query('users')
    .withIndex('by_uid', (q) => q.eq('uid', identity.subject))
    .first();

  if (!user) throw new Error("Unauthorized: User not found on this platform");
  
  // Platform-specific plan check (e.g., college-cbt only for paying users)
  // if (user.plan === 'free') throw new Error("Subscription required for this action");

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
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized: Identity missing");

  const user = await ctx.db
    .query('users')
    .withIndex('by_uid', (q) => q.eq('uid', identity.subject))
    .first();

  if (!user || user.role !== 'admin') {
    throw new Error("Unauthorized: Elevated privileges required");
  }
  
  return await handler(user);
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
      .first();
    if (user) {
      await ctx.db.patch(user._id, { plan: args.plan, updatedAt: Date.now() });
    }
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
