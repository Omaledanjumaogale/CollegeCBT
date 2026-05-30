import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAdmin, requireAuth } from './authGuard';

export const getEnterpriseOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const tenants = await ctx.db.query('tenants').collect();
    const invoices = await ctx.db.query('invoices').collect();
    const paymentEvents = await ctx.db.query('paymentEvents').collect();
    const usage = await ctx.db.query('usageMetrics').collect();
    const downloads = await ctx.db.query('downloads').collect();
    const resources = await ctx.db.query('resources').collect();
    const errors = await ctx.db.query('errorEvents').withIndex('by_timestamp').order('desc').take(20);

    return {
      tenantCount: tenants.length,
      activeTenants: tenants.filter((tenant) => tenant.status === 'active').length,
      invoiceCount: invoices.length,
      paidRevenue: invoices
        .filter((invoice) => invoice.status === 'paid')
        .reduce((total, invoice) => total + invoice.amount, 0),
      paymentEvents: paymentEvents.length,
      failedPaymentEvents: paymentEvents.filter((event) => event.status === 'failed').length,
      usageEvents: usage.length,
      resourceCount: resources.length,
      activeDownloads: downloads.filter((download) => download.status === 'queued' || download.status === 'in_progress').length,
      recentErrors: errors,
    };
  },
});

export const listTenants = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query('tenants').withIndex('by_status').collect();
  },
});

export const upsertTenant = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    status: v.union(v.literal('active'), v.literal('suspended'), v.literal('trial'), v.literal('archived')),
    plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
    billingEmail: v.optional(v.string()),
    ownerUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query('tenants')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        status: args.status,
        plan: args.plan,
        billingEmail: args.billingEmail,
        ownerUserId: args.ownerUserId,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const tenantId = await ctx.db.insert('tenants', {
      slug: args.slug,
      name: args.name,
      status: args.status,
      plan: args.plan,
      billingEmail: args.billingEmail,
      ownerUserId: args.ownerUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert('tenantMemberships', {
      tenantId,
      userId: admin.uid,
      role: 'owner',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return tenantId;
  },
});

export const listResources = query({
  args: {
    status: v.optional(v.union(v.literal('draft'), v.literal('published'), v.literal('archived'))),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const resources = await ctx.db.query('resources').collect();
    return args.status ? resources.filter((resource) => resource.status === args.status) : resources;
  },
});

export const upsertResource = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('pdf'), v.literal('image'), v.literal('csv'), v.literal('video'), v.literal('link'), v.literal('document')),
    status: v.union(v.literal('draft'), v.literal('published'), v.literal('archived')),
    access: v.union(v.literal('public'), v.literal('authenticated'), v.literal('pro'), v.literal('admin')),
    url: v.string(),
    previewUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    return await ctx.db.insert('resources', {
      ...args,
      createdBy: admin.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const startDownload = mutation({
  args: {
    resourceId: v.id('resources'),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.status !== 'published') {
      throw new Error('Resource is not available for download.');
    }

    const downloadId = await ctx.db.insert('downloads', {
      resourceId: args.resourceId,
      userId: identity.subject,
      status: 'completed',
      progress: 100,
      attemptCount: 1,
      startedAt: Date.now(),
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert('usageMetrics', {
      userId: identity.subject,
      metric: 'resource_downloaded',
      quantity: 1,
      unit: 'download',
      metadata: JSON.stringify({ resourceId: args.resourceId }),
      periodKey: new Date().toISOString().slice(0, 7),
      timestamp: Date.now(),
    });

    return { downloadId, url: resource.url };
  },
});

export const getMyDownloads = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);
    return await ctx.db
      .query('downloads')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(50);
  },
});

export const listInvoices = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.query('invoices').take(args.limit ?? 100);
  },
});

export const listPaymentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query('paymentEvents')
      .withIndex('by_received_at')
      .order('desc')
      .take(args.limit ?? 100);
  },
});

export const recordClientError = mutation({
  args: {
    message: v.string(),
    stack: v.optional(v.string()),
    metadata: v.optional(v.string()),
    severity: v.optional(v.union(v.literal('info'), v.literal('warning'), v.literal('error'), v.literal('critical'))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert('errorEvents', {
      userId: identity?.subject,
      source: 'client',
      severity: args.severity ?? 'error',
      message: args.message,
      stack: args.stack,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});
