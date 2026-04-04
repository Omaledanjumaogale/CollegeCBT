import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// ── Dashboard Overview ──────────────────────────────────────────────────────

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    const sessions = await ctx.db.query('sessions').collect();
    const activeHeartbeats = await ctx.db
      .query('userSessions')
      .withIndex('by_heartbeat', (q) => q.gt('lastHeartbeat', Date.now() - 5 * 60 * 1000))
      .collect();

    const planStats = {
      free: users.filter((u) => u.plan === 'free').length,
      pro: users.filter((u) => u.plan === 'pro').length,
      institutional: users.filter((u) => u.plan === 'institutional').length,
    };

    const examStats = {
      total: sessions.length,
      avgScore: sessions.length > 0 
        ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length) 
        : 0,
      mockExams: sessions.filter((s) => s.mode === 'mock').length,
    };

    return {
      totalUsers: users.length,
      activeSessions: activeHeartbeats.length,
      planStats,
      examStats,
      revenueEst: planStats.pro * 10000 + planStats.institutional * 50000, // Dummy pricing logic
    };
  },
});

export const getRecentActivity = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_timestamp')
      .order('desc')
      .take(args.limit);
    
    // Resolve user emails for logs
    const activities = await Promise.all(
      logs.map(async (log) => {
        const user = log.userId 
          ? await ctx.db.query('users').withIndex('by_uid', (q) => q.eq('uid', log.userId!)).unique()
          : null;
        return {
          ...log,
          userEmail: user?.email || 'System',
          userRole: (user as any)?.role || 'visitor',
        };
      })
    );

    return activities;
  },
});

// ── User Management ──────────────────────────────────────────────────────────

export const getUsers = query({
  args: { 
    search: v.optional(v.string()),
    plan: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let usersQuery = ctx.db.query('users');
    
    const users = await usersQuery.collect();
    
    let filtered = users;
    if (args.search) {
      const s = args.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(s) || 
        u.displayName.toLowerCase().includes(s) ||
        u.uid.toLowerCase().includes(s)
      );
    }
    
    if (args.plan) {
      filtered = filtered.filter(u => u.plan === args.plan);
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateUserRole = mutation({
  args: { uid: v.string(), role: v.union(v.literal('admin'), v.literal('user')) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_uid', (q) => q.eq('uid', args.uid))
      .unique();
    
    if (!user) throw new Error('User not found');
    
    await ctx.db.patch(user._id, { role: args.role, updatedAt: Date.now() });
    
    await ctx.db.insert('auditLogs', {
      userId: 'SYSTEM',
      action: 'role_update',
      status: 'success',
      metadata: JSON.stringify({ target: args.uid, newRole: args.role }),
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// ── Infrastructure & Monitoring ──────────────────────────────────────────────

export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    const lastHour = Date.now() - 3600000;
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_user') // Dummy check, would ideally have timestamp index
      .collect();
    
    const recentSessions = sessions.filter(s => s.timestamp > lastHour);
    
    const crawls = await ctx.db.query('crawlLogs').collect();
    const recentCrawls = crawls.filter(c => c.timestamp > lastHour);
    const crawlSuccess = recentCrawls.length > 0 
      ? Math.round((recentCrawls.filter(c => c.statusLabel === 'success').length / recentCrawls.length) * 100)
      : 100;

    return {
      status: 'Healthy',
      throughput: recentSessions.length,
      crawlSuccessRate: crawlSuccess,
      latencyAvg: recentCrawls.length > 0
        ? Math.round(recentCrawls.reduce((acc, c) => acc + c.responseTimeMs, 0) / recentCrawls.length)
        : 0,
    };
  },
});

export const getAuditLogs = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('auditLogs')
      .withIndex('by_timestamp')
      .order('desc')
      .take(args.limit);
  },
});
