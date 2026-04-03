import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const saveSession = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    course: v.string(),
    level: v.string(),
    institutionType: v.string(),
    questionsAnswered: v.number(),
    correct: v.number(),
    wrong: v.number(),
    score: v.number(),
    mode: v.union(v.literal('lab'), v.literal('mock')),
    grade: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('sessions', {
      userId: args.userId,
      sessionId: args.sessionId,
      course: args.course,
      level: args.level,
      institutionType: args.institutionType,
      questionsAnswered: args.questionsAnswered,
      correct: args.correct,
      wrong: args.wrong,
      score: args.score,
      mode: args.mode,
      grade: args.grade,
      timestamp: args.timestamp,
    });
  },
});

export const getUserSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(50);
  },
});
