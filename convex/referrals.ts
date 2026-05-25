import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, validateAdminAuth } from "./authGuard";

export const logReferral = mutation({
  args: {
    referralCode: v.string(),
    type: v.union(v.literal("signup"), v.literal("subscription")),
    amount: v.optional(v.number()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Requires authenticated user
    const identity = await requireAuth(ctx);
    const userId = identity.subject;

    // Check if we already have a referral log for this user & type
    const existing = await ctx.db
      .query("referralLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .first();

    if (existing) {
      // Avoid duplicate referral logs for the same user and type
      return existing._id;
    }

    const logId = await ctx.db.insert("referralLogs", {
      userId,
      referralCode: args.referralCode,
      type: args.type,
      amount: args.amount,
      status: args.status,
      timestamp: Date.now(),
    });

    return logId;
  },
});

export const getReferralLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await validateAdminAuth(ctx);
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("referralLogs")
      .order("desc")
      .take(limit);
  },
});

export const getReferralStats = query({
  args: {},
  handler: async (ctx, args) => {
    await validateAdminAuth(ctx);

    const allLogs = await ctx.db.query("referralLogs").collect();

    const stats = {
      totalSignups: 0,
      totalSubscriptions: 0,
      totalRevenue: 0,
      byCode: {} as Record<string, { signups: number; subscriptions: number; revenue: number }>,
    };

    for (const log of allLogs) {
      if (!stats.byCode[log.referralCode]) {
        stats.byCode[log.referralCode] = { signups: 0, subscriptions: 0, revenue: 0 };
      }

      if (log.type === "signup") {
        stats.totalSignups++;
        stats.byCode[log.referralCode].signups++;
      } else if (log.type === "subscription") {
        stats.totalSubscriptions++;
        stats.byCode[log.referralCode].subscriptions++;
        if (log.amount) {
          stats.totalRevenue += log.amount;
          stats.byCode[log.referralCode].revenue += log.amount;
        }
      }
    }

    return stats;
  },
});
