import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ── Exam sessions ──────────────────────────────────────────────────────────
  sessions: defineTable({
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
    customTopic: v.optional(v.string()),
    timestamp: v.number(),
  }).index('by_user', ['userId']),

  // ── User profiles ──────────────────────────────────────────────────────────
  users: defineTable({
    uid: v.string(),            // Firebase UID
    email: v.string(),
    displayName: v.string(),
    plan: v.union(v.literal('free'), v.literal('pro'), v.literal('institutional')),
    role: v.optional(v.union(v.literal('user'), v.literal('admin'))),
    // Personal
    dob: v.optional(v.string()),
    nin: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    // Location
    stateOfOrigin: v.optional(v.string()),
    stateOfResidence: v.optional(v.string()),
    lga: v.optional(v.string()),
    address: v.optional(v.string()),
    // Academic
    institutionType: v.optional(v.string()),
    institutionName: v.optional(v.string()),
    faculty: v.optional(v.string()),
    department: v.optional(v.string()),
    level: v.optional(v.string()),
    matricNumber: v.optional(v.string()),
    // Meta
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_uid', ['uid'])
    .index('by_email', ['email'])
    .index('by_plan', ['plan']),

  // ── AI grade reports ───────────────────────────────────────────────────────
  gradeReports: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    course: v.string(),
    level: v.string(),
    answers: v.array(v.object({
      question: v.string(),
      userAnswer: v.string(),
      score: v.number(),
      maxScore: v.number(),
      feedback: v.string(),
    })),
    totalScore: v.number(),
    maxTotal: v.number(),
    percentage: v.number(),
    aiAnalysis: v.string(),
    timestamp: v.number(),
  }).index('by_user', ['userId']),

  // ── Crawler Multi-Tenancy ──────────────────────────────────────────────────
  crawlTenants: defineTable({
    apiKey: v.string(),
    name: v.string(),
    rateLimitGlobal: v.number(),
    rateLimitPerEndpoint: v.number(),
    usageCount: v.number(),
    isActive: v.boolean(),
  }).index('by_api_key', ['apiKey']),

  // ── Crawler Cache (48 hours TTL) ───────────────────────────────────────────
  crawlCache: defineTable({
    urlHash: v.string(),
    url: v.string(),
    content: v.string(), 
    metadata: v.string(),
    timestamp: v.number(),
    expiresAt: v.number(),
  })
    .index('by_url_hash', ['urlHash'])
    .index('by_expires_at', ['expiresAt']),

  // ── Crawler Jobs Queue ─────────────────────────────────────────────────────
  crawlJobs: defineTable({
    url: v.string(),
    urlHash: v.string(),
    tenantId: v.id('crawlTenants'),
    status: v.union(v.literal('pending'), v.literal('running'), v.literal('completed'), v.literal('failed')),
    retries: v.number(),
    priority: v.number(),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_url_hash', ['urlHash']),

  // ── Crawler Logs ───────────────────────────────────────────────────────────
  crawlLogs: defineTable({
    tenantId: v.optional(v.id('crawlTenants')),
    url: v.string(),
    endpoint: v.string(),
    responseTimeMs: v.number(),
    statusLabel: v.union(v.literal('success'), v.literal('error'), v.literal('ratelimited'), v.literal('cached')),
    errorMessage: v.optional(v.string()),
    timestamp: v.number(),
  }).index('by_tenant', ['tenantId']),

  // ── Infrastructure: Rate Limiting ──────────────────────────────────────────
  rateLimits: defineTable({
    key: v.string(), // e.g., userId:endpoint or ip:endpoint
    tokens: v.number(),
    lastUpdated: v.number(),
    burst: v.number(),
    rate: v.number(), // tokens per second
  }).index('by_key', ['key']),

  // ── Infrastructure: Interaction Sessions ──────────────────────────────────
  userSessions: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.string()), // firebase UID
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    lastHeartbeat: v.number(),
    createdAt: v.number(),
  })
    .index('by_session_id', ['sessionId'])
    .index('by_user', ['userId'])
    .index('by_heartbeat', ['lastHeartbeat']),

  // ── Infrastructure: Audit Logs ─────────────────────────────────────────────
  auditLogs: defineTable({
    userId: v.optional(v.string()),
    action: v.string(), // e.g., 'crawl_request', 'plan_upgrade'
    status: v.union(v.literal('success'), v.literal('failure')),
    metadata: v.string(), // JSON blob
    timestamp: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_action', ['action'])
    .index('by_timestamp', ['timestamp']),

  // ── Infrastructure: General API Caching ────────────────────────────────────
  apiCache: defineTable({
    key: v.string(), // URL or hash of inputs
    payload: v.string(),
    expiresAt: v.number(),
  })
    .index('by_key', ['key'])
    .index('by_expiry', ['expiresAt']),

  // ── Infrastructure: System Configuration Flags ───────────────────────────
  configFlags: defineTable({
    key: v.string(),          // e.g. 'maintenance_mode', 'ai_enabled'
    value: v.string(),        // string representation: 'true'/'false' or JSON
    description: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  // ── Infrastructure: Workflow Orchestration ────────────────────────────────
  workflows: defineTable({
    name: v.string(), // e.g., 'onboarding_sequence', 'exam_cleanup'
    status: v.union(v.literal('pending'), v.literal('in_progress'), v.literal('completed'), v.literal('failed')),
    steps: v.array(v.object({
      name: v.string(),
      status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed')),
      error: v.optional(v.string())
    })),
    currentStep: v.number(),
    payload: v.string(), // JSON context
    timestamp: v.number(),
  }).index('by_status', ['status']),
});
