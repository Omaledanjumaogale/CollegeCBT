# Multi-Platform Auth, Crawl4AI & Multi-Agent AI Implementation Plan

## Workstream 2: Multi-Platform Firebase Auth + Convex

### Current State (already implemented)
- Firebase Auth with email/password, Firestore profile storage, Convex user sync
- `platformAccess` table already exists with `userId`, `platform`, `role`, `status`, `expiresAt`
- `subscriptions` table already exists with plan tracking
- `authGuard.ts` already has `requirePlatformAccess(platform)`, `requireAdmin`, `requireUserProfile`
- `hooks.server.ts` handles admin cookie auth, security headers, cache control

### What Needs to Be Done
1. **Replace hardcoded admin credentials** with environment variables
2. **Add `zQuery` and `zMutation` Zod wrappers** in `convex/validators.ts`
3. **Add rate limit module** (`convex/rateLimit.ts`) with token-bucket algorithm
4. **Add session tracking** (`convex/sessions.ts`) with heartbeat, IP recording
5. **Add caching module** (`convex/cache.ts`) with distributed TTL-based caching
6. **Add cron jobs** (`convex/crons.ts`) for cleanup of expired sessions, rate limits, cache
7. **Add audit triggers** (`convex/triggers.ts`) for sensitive operations
8. **Wire platform_access into the auth flow** — check at login, redirect if expired

## Workstream 3: Crawl4AI + Convex Orchestration

### Files to Create
- `convex/crawler.ts` — Multi-tenant crawl orchestration with dedup, cache check, wake logic
- `convex/crawlTenants.ts` — Tenant API key management
- Integrate with existing `convex/aiOrchestrator.ts` for AI agent decisions

### Key Components
- **Multi-tenant API key validation** per platform/client
- **Cache layer** with 48-hour TTL
- **Rate limiter** per tenant per endpoint
- **Queue system** for background processing
- **Render wake handling** for cold starts
- **Structured logging** for all crawl requests

## Workstream 4: Multi-Agent AI Orchestration

### Files to Create/Update
- `convex/agentWorkflow.ts` (update existing) — Agent definitions and routing
- `convex/aiOrchestrator.ts` (update existing) — Fallback chain logic
- Agent configurations for each task type

### Agent Architecture
Primary: `gpt-4o-mini` (OpenAI)
Fallback chain: gemini → deepseek-v3-1 → deepseek-v3 → deepseek-r1 → qwen3-235b → nemotron-super → glm-4-5-air

### Agents to Define
1. **Question Generator** (MCQ + Theory) — Curriculum-aligned exam questions
2. **Exam Grader** — WAEC/NECO grading with per-answer analysis
3. **Performance Analyst** — Student progress insights and recommendations
4. **Curriculum Intel** — Course structure and topic mapping
5. **Market Analyst** — Student performance trends and institutional benchmarks
