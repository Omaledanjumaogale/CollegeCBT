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
    tenantId: v.optional(v.string()),
    email: v.string(),
    displayName: v.string(),
    plan: v.union(v.literal('free'), v.literal('pro')),
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
    .index('by_plan', ['plan'])
    .index('by_tenant', ['tenantId']),

  // ── Enterprise Tenancy ─────────────────────────────────────────────────────
  tenants: defineTable({
    slug: v.string(),
    name: v.string(),
    status: v.union(v.literal('active'), v.literal('suspended'), v.literal('trial'), v.literal('archived')),
    plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
    ownerUserId: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_owner', ['ownerUserId']),

  tenantMemberships: defineTable({
    tenantId: v.id('tenants'),
    userId: v.string(),
    role: v.union(v.literal('owner'), v.literal('admin'), v.literal('instructor'), v.literal('student'), v.literal('viewer')),
    status: v.union(v.literal('active'), v.literal('invited'), v.literal('suspended')),
    invitedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_tenant', ['tenantId'])
    .index('by_user', ['userId'])
    .index('by_tenant_user', ['tenantId', 'userId']),

  usageMetrics: defineTable({
    tenantId: v.optional(v.id('tenants')),
    userId: v.optional(v.string()),
    metric: v.union(
      v.literal('question_generated'),
      v.literal('exam_started'),
      v.literal('exam_completed'),
      v.literal('resource_downloaded'),
      v.literal('payment_attempted'),
      v.literal('agent_invoked')
    ),
    quantity: v.number(),
    unit: v.string(),
    metadata: v.optional(v.string()),
    periodKey: v.string(),
    timestamp: v.number(),
  })
    .index('by_tenant_period', ['tenantId', 'periodKey'])
    .index('by_user_period', ['userId', 'periodKey'])
    .index('by_metric', ['metric'])
    .index('by_timestamp', ['timestamp']),

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

  // ── Academic Infrastructure ────────────────────────────────────────────────
  institutions: defineTable({
    type: v.string(), // e.g., 'University', 'Polytechnic', 'College of Education'
    category: v.string(), // e.g., 'Federal', 'State', 'Private'
    name: v.string(),
    state: v.optional(v.string()),
    description: v.optional(v.string()),
  }).index('by_type', ['type'])
    .index('by_name', ['name']),

  curriculum: defineTable({
    institutionType: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.string(),
    course: v.string(),
    topics: v.array(v.string()), // Standard topics for this course
    metadata: v.optional(v.string()), // JSON for any extra info
  }).index('by_faculty', ['faculty'])
    .index('by_department', ['department'])
    .index('by_course', ['course']),

  questionBank: defineTable({
    course: v.string(),
    level: v.string(),
    institutionType: v.string(),
    topic: v.string(),
    difficulty: v.string(),
    type: v.union(v.literal('MCQ'), v.literal('Theory')),
    content: v.string(), // JSON stringified question object
    provider: v.string(), // e.g., 'claude-3-5-sonnet'
    hitCount: v.number(), // Track randomization frequency
    isOther: v.boolean(), // Flag for user-inputted "Other" topics/subjects
    userId: v.optional(v.string()), // Crediting originator if applicable
    timestamp: v.number(),
  }).index('by_course', ['course'])
    .index('by_topic', ['topic'])
    .index('by_type', ['type'])
    .index('by_other', ['isOther']),

  // ── Multi-Platform SaaS Subscriptions & Access Control ────────────────────
  subscriptions: defineTable({
    userId: v.string(), // Firebase UID
    platform: v.string(), // e.g. 'college_cbt'
    plan: v.union(v.literal('free'), v.literal('pro')),
    status: v.union(v.literal('active'), v.literal('expired'), v.literal('cancelled'), v.literal('pending')),
    amount: v.number(),
    gateway: v.union(v.literal('flutterwave'), v.literal('korapay'), v.literal('paystack'), v.literal('seerbit')),
    reference: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_reference', ['reference'])
    .index('by_platform', ['platform']),

  invoices: defineTable({
    tenantId: v.optional(v.id('tenants')),
    userId: v.string(),
    subscriptionReference: v.optional(v.string()),
    invoiceNumber: v.string(),
    status: v.union(v.literal('draft'), v.literal('open'), v.literal('paid'), v.literal('void'), v.literal('failed')),
    currency: v.string(),
    amount: v.number(),
    gateway: v.union(v.literal('flutterwave'), v.literal('korapay'), v.literal('paystack'), v.literal('seerbit'), v.literal('manual')),
    paymentReference: v.optional(v.string()),
    issuedAt: v.number(),
    paidAt: v.optional(v.number()),
    dueAt: v.optional(v.number()),
    metadata: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_tenant', ['tenantId'])
    .index('by_invoice_number', ['invoiceNumber'])
    .index('by_payment_reference', ['paymentReference'])
    .index('by_status', ['status']),

  paymentEvents: defineTable({
    tenantId: v.optional(v.id('tenants')),
    userId: v.optional(v.string()),
    gateway: v.union(v.literal('flutterwave'), v.literal('korapay'), v.literal('paystack'), v.literal('seerbit')),
    reference: v.string(),
    eventType: v.string(),
    status: v.union(v.literal('received'), v.literal('processed'), v.literal('duplicate'), v.literal('failed')),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    payload: v.string(),
    error: v.optional(v.string()),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index('by_reference', ['reference'])
    .index('by_gateway_status', ['gateway', 'status'])
    .index('by_user', ['userId'])
    .index('by_received_at', ['receivedAt']),

  platformAccess: defineTable({
    userId: v.string(), // Firebase UID
    platform: v.string(), // e.g. 'college_cbt'
    role: v.union(v.literal('user'), v.literal('admin')),
    status: v.union(v.literal('active'), v.literal('suspended'), v.literal('inactive')),
    expiresAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_platform_user', ['platform', 'userId']),

  // ── Support Chat & Messaging ──────────────────────────────────────────────
  supportMessages: defineTable({
    userId: v.string(), // Student user UID
    sender: v.union(v.literal('student'), v.literal('admin'), v.literal('system'), v.literal('ai')),
    senderName: v.string(),
    text: v.string(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp']),

  // ── Push Notification Subscriptions ─────────────────────────────────────────
  pushSubscriptions: defineTable({
    userId: v.string(), // Firebase UID
    subscription: v.string(), // JSON stringified PushSubscription
    updatedAt: v.number(),
  })
    .index('by_user', ['userId']),

  // ── Resource Library & Downloads ───────────────────────────────────────────
  resources: defineTable({
    tenantId: v.optional(v.id('tenants')),
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
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_tenant', ['tenantId'])
    .index('by_status', ['status'])
    .index('by_access', ['access'])
    .index('by_type', ['type']),

  downloads: defineTable({
    tenantId: v.optional(v.id('tenants')),
    resourceId: v.id('resources'),
    userId: v.string(),
    status: v.union(v.literal('queued'), v.literal('in_progress'), v.literal('completed'), v.literal('failed'), v.literal('cancelled')),
    progress: v.number(),
    attemptCount: v.number(),
    error: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_resource', ['resourceId'])
    .index('by_status', ['status'])
    .index('by_tenant', ['tenantId']),

  apiKeys: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    keyHash: v.string(),
    prefix: v.string(),
    status: v.union(v.literal('active'), v.literal('revoked')),
    scopes: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index('by_tenant', ['tenantId'])
    .index('by_prefix', ['prefix'])
    .index('by_status', ['status']),

  featureFlagTargets: defineTable({
    flagKey: v.string(),
    tenantId: v.optional(v.id('tenants')),
    userId: v.optional(v.string()),
    enabled: v.boolean(),
    variant: v.optional(v.string()),
    rolloutPercent: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index('by_flag', ['flagKey'])
    .index('by_tenant', ['tenantId'])
    .index('by_user', ['userId']),

  errorEvents: defineTable({
    tenantId: v.optional(v.id('tenants')),
    userId: v.optional(v.string()),
    source: v.union(v.literal('client'), v.literal('server'), v.literal('convex'), v.literal('worker')),
    severity: v.union(v.literal('info'), v.literal('warning'), v.literal('error'), v.literal('critical')),
    message: v.string(),
    stack: v.optional(v.string()),
    metadata: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index('by_timestamp', ['timestamp'])
    .index('by_severity', ['severity'])
    .index('by_user', ['userId'])
    .index('by_tenant', ['tenantId']),

  healthChecks: defineTable({
    service: v.string(),
    status: v.union(v.literal('healthy'), v.literal('degraded'), v.literal('down')),
    latencyMs: v.optional(v.number()),
    message: v.optional(v.string()),
    checkedAt: v.number(),
  })
    .index('by_service', ['service'])
    .index('by_status', ['status'])
    .index('by_checked_at', ['checkedAt']),

  // ── E-WIN Referral Logs ─────────────────────────────────────────────────────
  referralLogs: defineTable({
    userId: v.string(), // Firebase UID of referred user
    referralCode: v.string(), // E-WIN Referral/Affiliate code
    type: v.union(v.literal('signup'), v.literal('subscription')),
    amount: v.optional(v.number()),
    status: v.string(), // e.g. 'processed', 'failed_ewin'
    timestamp: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_code', ['referralCode'])
    .index('by_type', ['type']),
});
