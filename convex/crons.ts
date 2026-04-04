import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
import { internalMutation } from './_generated/server';

const crons = cronJobs();

// ── Cache Cleaner (Every Hour) ──────────────────────────────────────────

/**
 * Cleanup expired cache entries (older than 48 hours).
 */
crons.interval(
  'clean-expired-cache',
  { minutes: 60 },
  internal.crons.cleanExpiredCache
);

// ── Job Reloader (Every 30 mins) ────────────────────────────────────────

/**
 * Find and retry 'stuck' jobs (running for too long or failed recently).
 */
crons.interval(
  'retry-stuck-jobs',
  { minutes: 30 },
  internal.crons.retryStuckJobs
);

// ── Infrastructure Cleanup (Scheduled Passive Tasks) ──────────────────────

/**
 * 1. Sweep away expired Rate Limit windows safely (every 15 mins).
 */
crons.interval(
  'maintenance-ratelimits',
  { minutes: 15 },
  internal.rateLimit.gcRateLimits
);

/**
 * 2. Purge stale interaction sessions (older than 7 days, daily).
 */
crons.daily(
  'maintenance-user-sessions',
  { hourUTC: 3, minuteUTC: 0 },
  internal.sessions.gcSessions
);


/**
 * 3. Delete expired generic API cache blocks (daily).
 */
crons.daily(
  'maintenance-api-cache',
  { hourUTC: 4, minuteUTC: 0 },
  internal.cache.pruneCache
);

export default crons;

// ── Internal Cron Logic ──────────────────────────────────────────────────

export const cleanExpiredCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('crawlCache')
      .withIndex('by_expires_at', (q) => q.lt('expiresAt', now))
      .take(100); // Batch cleaning

    const deleted = [];
    for (const entry of expired) {
      await ctx.db.delete(entry._id);
      deleted.push(entry._id);
    }
    console.log(`Cleaned ${deleted.length} expired cache entries.`);
  },
});

export const retryStuckJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find failed jobs with less than 3 retries
    const failedToRetry = await ctx.db
      .query('crawlJobs')
      .withIndex('by_status', (q) => q.eq('status', 'failed'))
      .filter(q => q.lt(q.field('retries'), 3))
      .take(10);

    for (const job of failedToRetry) {
        // Reset to pending
        await ctx.db.patch(job._id, {
            status: 'pending',
            retries: job.retries + 1,
            updatedAt: Date.now(),
        });
        // Action will be picked up by scheduler if we trigger it,
        // but here we rely on the main request loop or a manual trigger.
        // Let's re-trigger the scheduler for these.
        await ctx.scheduler.runAfter(0, internal.crawler.executeCrawlAction, { jobId: job._id });
    }
    console.log(`Retried ${failedToRetry.length} failed jobs.`);
  },
});
