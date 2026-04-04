import { mutation, query, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { checkRateLimitInternal } from './rateLimit';

/**
 * Distributed Session Bindings.
 * Designed robust tracking logic tying heartbeat signals to client lifecycles 
 * mapping closely against Google/Firebase UIDs with heartbeat refreshes.
 */

export const withSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.string()), // Firebase UID
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // ── Rate Limit ──
    const rl = await checkRateLimitInternal(ctx, { 
      key: `heartbeat:${args.sessionId}`, 
      burst: 10, 
      rate: 1 
    });
    if (!rl.ok) throw new Error(rl.message);
    
    const existing = await ctx.db
      .query('userSessions')
      .withIndex('by_session_id', (q) => q.eq('sessionId', args.sessionId))
      .unique();

    if (existing) {
      // 5-minute debounce for heartbeat refreshes
      const debounceMillis = 5 * 60 * 1000;
      if (now - existing.lastHeartbeat > debounceMillis || args.userId !== existing.userId) {
        await ctx.db.patch(existing._id, {
          userId: args.userId ?? existing.userId,
          lastHeartbeat: now,
        });
      }
      return existing._id;
    }

    // Initialize new Distributed Session Binding
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
 * saveSession: Captures end-of-interaction results (e.g., Exam Scores).
 */
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
    mode: v.union(v.literal('lab'), v.literal('mock'), v.literal('custom')),
    grade: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // ── Rate Limit ──
    const rl = await checkRateLimitInternal(ctx, { 
      key: `saveSession:${args.userId}`, 
      burst: 3, 
      rate: 0.001 // 1 refill every 1000 seconds (~15 mins)
    });
    if (!rl.ok) throw new Error("Please wait before saving another result.");
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

export const getDashboardAnalytics = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    if (sessions.length === 0) return null;

    const chartData = sessions
      .filter((s) => s.mode === 'mock')
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-10)
      .map((s) => Math.round(s.score));

    const topicAgg: Record<string, { total: number; count: number }> = {};
    sessions.forEach((s) => {
      if (!topicAgg[s.course]) topicAgg[s.course] = { total: 0, count: 0 };
      topicAgg[s.course].total += s.score;
      topicAgg[s.course].count += 1;
    });

    const heatmap = Object.entries(topicAgg).map(([topic, data]) => {
      const pct = Math.round(data.total / data.count);
      let color = '#84cc16';
      let label = 'Strong';
      if (pct < 50) {
        color = '#e11d48';
        label = 'Needs Work';
      } else if (pct < 70) {
        color = '#f59e0b';
        label = 'Developing';
      }
      return { topic, pct, color, label };
    });

    return { chartData, heatmap };
  },
});

/**
 * Autonomous Garbage Collection for stale sessions.
 */
export const gcSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 Days
    const flatlined = await ctx.db
      .query('userSessions')
      .withIndex('by_heartbeat', (q) => q.lt('lastHeartbeat', threshold))
      .take(100);

    for (const session of flatlined) {
      await ctx.db.delete(session._id);
    }
  },
});

