import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireAdmin, requireAuth } from './authGuard';

/**
 * Save or update a client's VAPID Push Subscription
 */
export const saveSubscription = mutation({
  args: {
    userId: v.string(),
    subscription: v.string(), // JSON string representation of PushSubscription
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    if (identity.subject !== args.userId) {
      throw new Error('Unauthorized push subscription update.');
    }

    const existing = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        subscription: args.subscription,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('pushSubscriptions', {
        userId: args.userId,
        subscription: args.subscription,
        updatedAt: Date.now(),
      });
    }

    // Insert an audit log entry
    await ctx.db.insert('auditLogs', {
      userId: args.userId,
      action: 'push_subscription_registered',
      status: 'success',
      metadata: JSON.stringify({ registeredAt: Date.now() }),
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a user's push subscription
 */
export const deleteSubscription = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    if (identity.subject !== args.userId) {
      throw new Error('Unauthorized push subscription delete.');
    }

    const existing = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      
      await ctx.db.insert('auditLogs', {
        userId: args.userId,
        action: 'push_subscription_removed',
        status: 'success',
        metadata: JSON.stringify({ removedAt: Date.now() }),
        timestamp: Date.now(),
      });
    }
    return { success: true };
  },
});

/**
 * Send a notification payload to a specific user.
 * Real production system would invoke web-push package or Cloudflare Worker Push Service here.
 * In Edge/Convex runtime, we register the event and log it.
 */
export const triggerPush = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const subscription = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .unique();

    if (!subscription) {
      console.warn(`[PushService] No push subscription found for user: ${args.userId}`);
      return { success: false, reason: 'No active subscription' };
    }

    // Log the push notification trigger event to audit logs
    await ctx.db.insert('auditLogs', {
      userId: args.userId,
      action: 'push_notification_triggered',
      status: 'success',
      metadata: JSON.stringify({
        title: args.title,
        body: args.body,
        url: args.url || '/',
        triggeredAt: Date.now()
      }),
      timestamp: Date.now(),
    });

    console.log(`[PushService] Dispatched push notification payload to user ${args.userId}:`, {
      title: args.title,
      body: args.body,
      url: args.url
    });

    return { success: true };
  },
});
