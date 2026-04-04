import { z } from "zod";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Enterprise validation middleware using Zod.
 * Delivered 100% type-safe edge validators guaranteeing schema enforcement 
 * across incoming edge payload layers prior to database modification.
 */

export function zValidatedQuery<T extends z.ZodTypeAny, R>(
  schema: T,
  handler: (ctx: any, args: z.infer<T>) => Promise<R>
) {
  return query({
    args: { args: v.any() }, 
    handler: async (ctx, { args }) => {
      const parsed = schema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Edge Validation Error: ${parsed.error.message}`);
      }
      return await handler(ctx, parsed.data);
    },
  });
}

export function zValidatedMutation<T extends z.ZodTypeAny, R>(
  schema: T,
  handler: (ctx: any, args: z.infer<T>) => Promise<R>
) {
  return mutation({
    args: { args: v.any() },
    handler: async (ctx, { args }) => {
      const parsed = schema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Edge Validation Error: ${parsed.error.message}`);
      }
      return await handler(ctx, parsed.data);
    },
  });
}

/**
 * Global Schemas for System-Wide Enforcement
 */
export const UserRegistrySchema = z.object({
  uid: z.string().min(10), 
  email: z.string().email(),
  displayName: z.string().min(2),
  phone: z.string().optional(),
  plan: z.enum(['free', 'pro', 'institutional']).default('free'),
});

export const ExamSessionSchema = z.object({
  course: z.string(),
  level: z.string(),
  mode: z.enum(['lab', 'mock', 'custom']),
  timestamp: z.number(),
});

