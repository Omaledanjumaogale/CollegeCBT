import { v } from 'convex/values';
import { mutation } from './_generated/server';

/**
 * Utility mutation for administrators to register a new platform/client.
 */
export const registerTenant = mutation({
  args: {
    name: v.string(),
    apiKey: v.optional(v.string()), // generate if missing
    globalRateLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = args.apiKey || `sk-cbt-${Math.random().toString(36).substring(2, 11)}`;
    const tenantId = await ctx.db.insert('crawlTenants', {
      name: args.name,
      apiKey: apiKey,
      rateLimitGlobal: args.globalRateLimit || 1000,
      rateLimitPerEndpoint: 100,
      usageCount: 0,
      isActive: true,
    });
    return { tenantId, apiKey };
  },
});
