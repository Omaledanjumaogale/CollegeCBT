import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

/**
 * Enterprise key-based query caching for high-cost operations (AI/Crawling).
 */
export const fetchCache = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query('apiCache')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();

    if (!cached || cached.expiresAt < Date.now()) return null;
    return JSON.parse(cached.payload);
  },
});

export const setCache = mutation({
  args: {
    key: v.string(),
    payload: v.string(), // json
    ttlSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('apiCache')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();

    const expiresAt = Date.now() + args.ttlSeconds * 1000;

    if (existing) {
      await ctx.db.patch(existing._id, {
        payload: args.payload,
        expiresAt,
      });
    } else {
      await ctx.db.insert('apiCache', {
        key: args.key,
        payload: args.payload,
        expiresAt,
      });
    }
  },
});

/**
 * Auto-vacuum expired cache blocks.
 */
export const pruneCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('apiCache')
      .withIndex('by_expiry', (q) => q.lt('expiresAt', now))
      .take(100);

    for (const item of expired) {
      await ctx.db.delete(item._id);
    }
  },
});
