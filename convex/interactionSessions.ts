import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

/**
 * Enterprise client-side Session Heartbeat.
 * Automatically tracks and cleans up inactive interaction sessions.
 */
export const sessionHeartbeat = mutation({
  args: {
    sessionId: v.string(), // generated on client
    userId: v.optional(v.string()), // firebase UID
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existing = await ctx.db
      .query('userSessions')
      .withIndex('by_session_id', (q) => q.eq('sessionId', args.sessionId))
      .unique();

    if (existing) {
      // 5-minute debounce: update only if older than 5m
      const debounceMillis = 5 * 60 * 1000;
      if (now - existing.lastHeartbeat > debounceMillis || args.userId !== existing.userId) {
        await ctx.db.patch(existing._id, {
          userId: args.userId,
          lastHeartbeat: now,
        });
      }
      return existing._id;
    }

    // New Session
    return await ctx.db.insert('userSessions', {
      sessionId: args.sessionId,
      userId: args.userId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      lastHeartbeat: now,
      createdAt: now,
    });
  },
});

/**
 * Garbage collector for sessions that haven't flatlined for 7 days.
 */
export const cleanupSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const flatlined = await ctx.db
      .query('userSessions')
      .withIndex('by_heartbeat', (q) => q.lt('lastHeartbeat', sevenDaysAgo))
      .take(100);

    for (const session of flatlined) {
      await ctx.db.delete(session._id);
    }
  },
});

/**
 * Enterprise Audit Logger.
 * Records all mission-critical events (Role change, user deletion, payment gateway notifications).
 */
export const logAudit = mutation({
  args: {
    userId: v.optional(v.string()), // Firebase UID or "system"
    action: v.string(), // e.g. "payment_webhook", "role_override"
    status: v.union(v.literal('success'), v.literal('failure')),
    metadata: v.string(), // JSON blob for detailed tracking
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('auditLogs', {
      userId: args.userId,
      action: args.action,
      status: args.status,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

