import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Zero-Latency Lifecycle Triggers.
 * Emulates SQL row-level auditing triggers leveraging generic hook overlays.
 * Robustly handles high-sensitivity operations tracking.
 */

export function withTriggers<T extends Record<string, any>, R>(
  options: {
    action: string;
    beforeCreate?: (ctx: any, args: T) => Promise<void>;
    afterCreate?: (ctx: any, args: T, result: R) => Promise<void>;
    onError?: (ctx: any, args: T, error: any) => Promise<void>;
  },
  handler: (ctx: any, args: T) => Promise<R>
) {
  return mutation({
    args: { userId: v.optional(v.string()), args: v.any() },
    handler: async (ctx, { userId, args }) => {
      const now = Date.now();
      
      try {
        // [beforeCreate] Hook
        if (options.beforeCreate) await options.beforeCreate(ctx, args);

        const result = await handler(ctx, args);

        // [afterCreate] Hook & Audit Log
        if (options.afterCreate) await options.afterCreate(ctx, args, result);
        
        await ctx.db.insert('auditLogs', {
          userId: userId ?? undefined,
          action: options.action,
          status: 'success',
          metadata: JSON.stringify({ summary: 'Operation completed successfully', timestamp: now }),
          timestamp: now,
        });

        return result;
      } catch (err: any) {
        // [onError] Hook & Audit Log
        if (options.onError) await options.onError(ctx, args, err);

        await ctx.db.insert('auditLogs', {
          userId: userId ?? undefined,
          action: options.action,
          status: 'failure',
          metadata: JSON.stringify({ error: err.message, timestamp: now }),
          timestamp: now,
        });
        throw err;
      }
    },
  });
}

/**
 * Legacy Wrapper for standard Audit Logging (backward compatibility)
 */
export function withAuditLog<T extends Record<string, any>, R>(
  action: string,
  handler: (ctx: any, args: T) => Promise<R>
) {
  return withTriggers({ action }, handler);
}

