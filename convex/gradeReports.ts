import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// ── Save AI grade report ──────────────────────────────────────────────────────
export const saveGradeReport = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    course: v.string(),
    level: v.string(),
    answers: v.array(
      v.object({
        question: v.string(),
        userAnswer: v.string(),
        score: v.number(),
        maxScore: v.number(),
        feedback: v.string(),
      })
    ),
    totalScore: v.number(),
    maxTotal: v.number(),
    percentage: v.number(),
    aiAnalysis: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('gradeReports', args);
  },
});

// ── Get user's grade reports ───────────────────────────────────────────────────
export const getUserGradeReports = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('gradeReports')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(20);
  },
});
