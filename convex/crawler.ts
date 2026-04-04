import { v } from 'convex/values';
import { mutation, query, action, internalAction, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';

// ── Multi-Tenant Management ──────────────────────────────────────────────

export const createTenant = mutation({
  args: {
    name: v.string(),
    apiKey: v.string(),
    rateLimitGlobal: v.number(),
    rateLimitPerEndpoint: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('crawlTenants')
      .withIndex('by_api_key', (q) => q.eq('apiKey', args.apiKey))
      .first();
    if (existing) throw new Error('Tenant with this API key already exists');
    
    return await ctx.db.insert('crawlTenants', {
      name: args.name,
      apiKey: args.apiKey,
      rateLimitGlobal: args.rateLimitGlobal,
      rateLimitPerEndpoint: args.rateLimitPerEndpoint,
      usageCount: 0,
      isActive: true,
    });
  },
});

export const getTenant = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('crawlTenants')
      .withIndex('by_api_key', (q) => q.eq('apiKey', args.apiKey))
      .unique();
  },
});

// ── Core Crawl Logic (Orchestrator) ───────────────────────────────────────

/**
 * Entry point for AI agents to request a crawl.
 * Implements Caching, Rate Limiting, and Queuing.
 */
export const requestCrawl = mutation({
  args: {
    apiKey: v.string(),
    url: v.string(),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Validate Tenant
    const tenant = await ctx.db
      .query('crawlTenants')
      .withIndex('by_api_key', (q) => q.eq('apiKey', args.apiKey))
      .unique();

    if (!tenant || !tenant.isActive) {
      throw new Error('Unauthorized or inactive tenant');
    }

    // 2. Rate Limiting Check (Global Simple)
    if (tenant.usageCount >= tenant.rateLimitGlobal) {
        await ctx.db.insert('crawlLogs', {
            tenantId: tenant._id,
            url: args.url,
            endpoint: '/crawl',
            responseTimeMs: 0,
            statusLabel: 'ratelimited',
            errorMessage: 'Global rate limit exceeded',
            timestamp: Date.now(),
        });
        throw new Error('Rate limit exceeded for this tenant');
    }

    // 3. Cache Check (48h TTL)
    const urlHash = Buffer.from(args.url).toString('base64'); // Simple hash for demo, would use crypto in action
    const cached = await ctx.db
      .query('crawlCache')
      .withIndex('by_url_hash', (q) => q.eq('urlHash', urlHash))
      .first();

    if (cached && cached.expiresAt > Date.now()) {
      await ctx.db.insert('crawlLogs', {
        tenantId: tenant._id,
        url: args.url,
        endpoint: '/cache',
        responseTimeMs: 0,
        statusLabel: 'cached',
        timestamp: Date.now(),
      });
      return { status: 'cached', data: JSON.parse(cached.content) };
    }

    // 4. Check for Existing Active Job (Deduplication)
    const existingJob = await ctx.db
      .query('crawlJobs')
      .withIndex('by_url_hash', (q) => q.eq('urlHash', urlHash))
      .filter(q => q.or(q.eq(q.field('status'), 'pending'), q.eq(q.field('status'), 'running')))
      .first();

    if (existingJob) {
      return { status: 'queued', jobId: existingJob._id };
    }

    // 5. Queue the Job
    const jobId = await ctx.db.insert('crawlJobs', {
      url: args.url,
      urlHash: urlHash,
      tenantId: tenant._id,
      status: 'pending',
      retries: 0,
      priority: args.priority ?? 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Increment Usage
    await ctx.db.patch(tenant._id, { usageCount: tenant.usageCount + 1 });

    // 6. Trigger background execution (Non-blocking)
    await ctx.scheduler.runAfter(0, internal.crawler.executeCrawlAction, { jobId });

    return { status: 'queued', jobId };
  },
});

// ── Background Execution Action ───────────────────────────────────────────

export const executeCrawlAction = internalAction({
  args: { jobId: v.id('crawlJobs') },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.crawler.getInternalJob, { jobId: args.jobId });
    if (!job || job.status !== 'pending') return;

    // Update status to running
    await ctx.runMutation(internal.crawler.updateJobStatus, { jobId: args.jobId, status: 'running' });

    const startTime = Date.now();
    const apiUrl = process.env.CRAWL4AI_API_URL;
    const apiSecret = process.env.CRAWL4AI_API_SECRET;

    if (!apiUrl) {
      console.error('CRAWL4AI_API_URL not configured');
      await ctx.runMutation(internal.crawler.failJob, { 
        jobId: args.jobId, 
        error: 'API Configuration Missing' 
      });
      return;
    }

    try {
      // 1. Render Sleep Handling (Wake Request)
      // Small timeout to just wake it if it's sleeping
      try {
          await fetch(apiUrl + '/health', { method: 'GET', signal: AbortSignal.timeout(5000) });
      } catch (e) {
          console.log('Render service might be waking up...');
      }

      // 2. Perform Crawl
      const response = await fetch(apiUrl + '/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSecret}`
        },
        body: JSON.stringify({ url: job.url }),
      });

      if (!response.ok) {
        throw new Error(`Crawl4AI error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // 3. Update Status and Cache
      await ctx.runMutation(internal.crawler.completeJob, {
        jobId: args.jobId,
        result: JSON.stringify(data),
        responseTime,
      });

    } catch (error: any) {
      console.error('Crawl execution failed:', error);
      const canRetry = job.retries < 3;
      
      if (canRetry) {
        // Retry with exponential backoff (simplified)
        await ctx.runMutation(internal.crawler.prepRetry, { jobId: args.jobId });
        await ctx.scheduler.runAfter(Math.pow(2, job.retries) * 1000, internal.crawler.executeCrawlAction, { jobId: args.jobId });
      } else {
        await ctx.runMutation(internal.crawler.failJob, { 
          jobId: args.jobId, 
          error: error.message 
        });
      }
    }
  },
});

// ── Internal Helpers ──────────────────────────────────────────────────────

export const getInternalJob = internalQuery({
  args: { jobId: v.id('crawlJobs') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const updateJobStatus = internalMutation({
  args: { jobId: v.id('crawlJobs'), status: v.union(v.literal('running'), v.literal('completed'), v.literal('failed')) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: args.status, updatedAt: Date.now() });
  },
});

export const completeJob = internalMutation({
  args: { jobId: v.id('crawlJobs'), result: v.string(), responseTime: v.number() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;

    // 1. Update Job
    await ctx.db.patch(args.jobId, {
      status: 'completed',
      result: args.result,
      updatedAt: Date.now(),
    });

    // 2. Cache Result (48h)
    const TTL = 48 * 60 * 60 * 1000;
    await ctx.db.insert('crawlCache', {
      url: job.url,
      urlHash: job.urlHash,
      content: args.result,
      metadata: JSON.stringify({ tenantId: job.tenantId }),
      timestamp: Date.now(),
      expiresAt: Date.now() + TTL,
    });

    // 3. Log Success
    await ctx.db.insert('crawlLogs', {
      tenantId: job.tenantId,
      url: job.url,
      endpoint: '/crawl',
      responseTimeMs: args.responseTime,
      statusLabel: 'success',
      timestamp: Date.now(),
    });
  },
});

export const failJob = internalMutation({
  args: { jobId: v.id('crawlJobs'), error: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;

    await ctx.db.patch(args.jobId, {
      status: 'failed',
      error: args.error,
      updatedAt: Date.now(),
    });

    await ctx.db.insert('crawlLogs', {
      tenantId: job.tenantId,
      url: job.url,
      endpoint: '/crawl',
      responseTimeMs: 0,
      statusLabel: 'error',
      errorMessage: args.error,
      timestamp: Date.now(),
    });
  },
});

export const prepRetry = internalMutation({
  args: { jobId: v.id('crawlJobs') },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;
    await ctx.db.patch(args.jobId, {
      status: 'pending',
      retries: job.retries + 1,
      updatedAt: Date.now(),
    });
  },
});
