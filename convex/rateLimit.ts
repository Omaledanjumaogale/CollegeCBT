import { v } from 'convex/values';
import { mutation, query, internalMutation, type MutationCtx } from './_generated/server';

/**
 * Enterprise Rate Limiting using a Token Bucket algorithm.
 * ACID compliant and optimized for low-latency gates.
 * Seamlessly throttles both generic reads and critical writes.
 */

export const checkRateLimitInternal = async (
  ctx: MutationCtx,
  args: { key: string; burst: number; rate: number; cost?: number }
) => {
  const now = Date.now();
  const cost = args.cost ?? 1;

  // Fetch existing bucket state using the unique key
  let limit = await ctx.db
    .query('rateLimits')
    .withIndex('by_key', (q) => q.eq('key', args.key))
    .unique();

  if (!limit) {
    // Initialize bucket if first time seeing this key
    await ctx.db.insert('rateLimits', {
      key: args.key,
      tokens: args.burst - cost,
      lastUpdated: now,
      burst: args.burst,
      rate: args.rate,
    });
    return { ok: true, remaining: args.burst - cost };
  }

  // Refill Calculation (Refilled since last update)
  const elapsedSeconds = (now - limit.lastUpdated) / 1000;
  const refilledTokens = Math.min(
    limit.burst,
    limit.tokens + (elapsedSeconds * limit.rate)
  );

  // Gate Logic: Check if bucket has enough tokens
  if (refilledTokens < cost) {
    const waitSeconds = Math.ceil((cost - refilledTokens) / limit.rate);
    return { 
      ok: false, 
      retryAfter: waitSeconds,
      message: `Rate limit exceeded. Try again in ${waitSeconds}s.`
    };
  }

  // Deduct tokens and update state
  const newTokens = refilledTokens - cost;
  await ctx.db.patch(limit._id, {
    tokens: newTokens,
    lastUpdated: now,
  });

  return { ok: true, remaining: Math.floor(newTokens) };
};

export const checkRateLimit = mutation({
  args: {
    key: v.string(),
    burst: v.number(),
    rate: v.number(),
    cost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await checkRateLimitInternal(ctx, args);
  },
});

/**
 * rateLimitQuery: Fast read-only peek for checking limits without write locks.
 */
export const rateLimitQuery = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const limit = await ctx.db
      .query('rateLimits')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();
    if (!limit) return { ok: true, tokens: 999 };
    
    const elapsed = (Date.now() - limit.lastUpdated) / 1000;
    const current = Math.min(limit.burst, limit.tokens + (elapsed * limit.rate));
    return { ok: current >= 1, tokens: Math.floor(current) };
  },
});

/**
 * rateLimitMutation: Wrapper trigger for mutations to enforce limits.
 */
export const rateLimitMutation = mutation({
  args: { key: v.string(), burst: v.number(), rate: v.number() },
  handler: async (ctx, args) => {
    return await checkRateLimitInternal(ctx, args);
  },
});

/**
 * Autonomous Garbage Collection for stale Rate Limit entries.
 * Executed via crons to prevent DB bloat.
 */
export const gcRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expirationThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 Hours
    const stale = await ctx.db
      .query('rateLimits')
      .filter((q) => q.lt(q.field('lastUpdated'), expirationThreshold))
      .take(100);
      
    for (const item of stale) {
      await ctx.db.delete(item._id);
    }
  },
});

