# CollegeCBT Enterprise Audit & Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring CollegeCBT to a verified, enterprise-grade SvelteKit 5 + Convex + Firebase + Cloudflare Pages SaaS platform without breaking existing routes, auth, exam, dashboard, payment, or admin flows.

**Architecture:** The current app is a SvelteKit 2/Svelte 5 Cloudflare Pages application with Convex as the real-time backend, Firebase as the identity provider, Tailwind for UI, and server routes for AI generation and payment orchestration. The migration plan keeps the existing Svelte app as the source of truth, extracts missing UI/interaction details from the standalone HTML prototypes, and introduces enterprise hardening in reversible slices behind existing fallbacks.

**Tech Stack:** SvelteKit 2, Svelte 5 runes, TypeScript, Tailwind CSS, Convex, Firebase Auth, Cloudflare Pages adapter, Wrangler, Zod, Flutterwave/KoraPay/Paystack/Seerbit, Resend, Vitest, Playwright.

---

## Master Quality Directives

- Never break an existing route, user flow, page, or component.
- Make every change gradual, reversible, and small enough to verify.
- Run `npm run build` after each major step and resolve all errors before continuing.
- Preserve backward compatibility while improving architecture.
- Use simple, clear English in code comments and documentation.
- End every phase with the required verification block:

```text
✅ IMPLEMENTATION VERIFICATION COMPLETE
• All routes, links, and navigation work perfectly
• No broken elements or horizontal overflow
• Application remains fully functional and responsive
• npm run build succeeded with zero errors/warnings
• Git commit created and pushed
Status: PERFECT WORKING STATE
```

## Phase 0 Audit Summary

### Repository State

- GitHub repository exists: `https://github.com/Omaledanjumaogale/CollegeCBT.git`.
- Default branch is `master`.
- Cloudflare adapter is already configured in `svelte.config.js`.
- `wrangler.toml` already includes `pages_build_output_dir = ".svelte-kit/cloudflare"` and `nodejs_compat`.
- `.github/workflows/deploy.yml` does not exist.
- `tests/` does not exist.
- `Dockerfile` and `.dockerignore` do not exist.
- `package.json` has exact versions and scripts for `dev`, `build`, `check`, `test`, `lint`, and `sync`.

### HTML Prototype Inventory

- `dealxexam.html` is a complete one-page product prototype with rich sections: fixed navigation, mobile nav, hero, feature pillars, how-it-works timeline, curriculum tabs, exam lab, mock exam, dashboard preview, pricing, footer, signup modal, login modal, toast, and extensive inline JavaScript.
- `collegecbt-part1.html` contains landing, problem, feature, how-it-works, curriculum browser, lightweight auth modals, and demo question interactions.
- `collegecbt-part2.html` contains exam lab and mock exam mechanics: course selectors, difficulty selectors, score bar, timed mock mode, question strip, skip/next flow, WAEC grade results, and local AI fallback examples.
- `collegecbt-part3.html` contains student dashboard panels, pricing, testimonials, FAQ accordion, full three-step signup flow, password strength meter, auth tabs, and footer.
- `src/app.html` is the SvelteKit shell and should not be treated as a prototype page.

### SvelteKit Route Map

- Public routes: `/`, `/about`, `/pricing`, `/resources`, `/exam-lab`, `/glossary/[term]`, `/sitemap.xml`, `/rss.xml`.
- Auth routes: `/auth/login`, `/auth/register`.
- Student routes: `/dashboard`, `/dashboard/custom-exam`, `/dashboard/certificate`.
- Checkout routes: `/checkout`, `/checkout/mock-gateway`, `/checkout/success`.
- Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/support`, `/admin/audit-logs`, `/admin/monitoring`, `/admin/config-flags`, `/admin/settings`.
- API routes: `/api/generate-question`, `/api/grade-exam`, `/api/payment/initialize`, `/api/payment/mock-trigger`, `/api/webhooks/flutterwave`, `/api/webhooks/korapay`, `/api/webhooks/paystack`, `/api/webhooks/seerbit`.

### Component Map

- Existing shared UI: `DynamicNavbar.svelte`, `Footer.svelte`, `Hero.svelte`, `ProblemSection.svelte`, `FeaturesSection.svelte`, `HowItWorks.svelte`, `CurriculumBrowser.svelte`, `DashboardPreview.svelte`, `PricingSection.svelte`, `Testimonials.svelte`, `FAQSection.svelte`, `AuthModal.svelte`, `ToastProvider.svelte`, `TooltipProvider.svelte`, `SupportChat.svelte`, `BottomNav.svelte`, `NetworkMonitor.svelte`.
- Existing admin UI: `admin/DataTable.svelte`, `admin/Drawer.svelte`.
- Existing domain UI: `AcademicSelector.svelte`, `CertificateLayout.svelte`, `CertificateDownloader.svelte`, `RelatedLinks.svelte`, `SEO.svelte`, `PageTemplate.svelte`.

### HTML-to-Svelte Gaps

- `dealxexam.html` hero includes a detailed results meter, grade badge, topic progress rows, AI study insight card, and floating streak/mock/ResultsGuard badges. The Svelte hero has the core message, but the prototype's full readiness-card composition should be extracted into a reusable component.
- `dealxexam.html` and `collegecbt-part1.html` curriculum browsers include deeper institution tabs, level tabs, selected-course bars, and action buttons. The Svelte app has `CurriculumBrowser.svelte` and `AcademicSelector.svelte`, but the selected-course CTA and full level panel behavior need parity.
- `collegecbt-part2.html` exam lab has a live score bar with questions, correct, wrong, score, and streak. The Svelte `/exam-lab` flow has real AI calls and mock mode, but the score bar and streak affordance need better persistence and visual parity.
- `collegecbt-part2.html` mock mode includes question strip, timed ring, skip/next state, and results review. Svelte `/exam-lab` implements most mechanics, but needs visual QA across 320px-2560px and stronger real-time session persistence.
- `collegecbt-part3.html` dashboard has tabbed overview/results/activity/settings panels, gauge animation, bar chart, and profile/account settings. Svelte `/dashboard` has Convex-backed analytics, but dashboard settings and activity tab parity are partial.
- `collegecbt-part3.html` FAQ accordion exists as prototype behavior. Svelte has `FAQSection.svelte`, but route-level `/faq` is missing while `/about` links to `/faq`.
- Prototype footer has social links and NDPR/legal links. Svelte footer links to `/terms` and `/privacy`, but those routes are missing.
- Prototype auth includes password strength feedback and three-step signup. Svelte `AuthModal.svelte` and `/auth/register` include multi-step signup, but password strength and state/LGA population parity need tightening.
- Prototype payment copy references Paystack in FAQ, while current Svelte pricing/payment architecture emphasizes Flutterwave primary plus KoraPay/Paystack/Seerbit. Copy and gateway UX need alignment.

### Broken Links and Dead Ends

- `/faq` is linked from `/about` but no route exists.
- `/terms` and `/privacy` are linked from `Footer.svelte` and `AuthModal.svelte` but no routes exist.
- Footer social links use fragment placeholders such as `#Twitter`, `#LinkedIn`, and `#Facebook`.
- Some admin buttons are visual-only, such as "SEND MESSAGE" in user drawer and "Manual audit snapshot recorded" in dashboard.
- `checkout/mock-gateway` is intentionally sandbox-only, but must be clearly environment-gated in production.

### Data and Contract Gaps

- Convex schema has core tables for users, sessions, grade reports, crawl jobs, audit logs, config flags, curriculum, question bank, subscriptions, platform access, support messages, push subscriptions, and referral logs.
- Missing enterprise tables: tenants, tenant memberships, invoices, payment events, usage metrics, resource library assets, signed download records, notification templates, support tickets, device sessions, API keys, billing plans, quotas, and feature flag targeting rules.
- Several UI routes still cast Convex data with `as any`; this is acceptable for the current build but blocks long-term contract safety.
- `convex/auth.config.js` contains a project-specific Firebase domain that should be env-documented and checked against production Firebase settings.
- Convex actions use `process.env`, which is acceptable inside Convex functions, but SvelteKit server routes should continue moving to `$env/dynamic/private` plus Cloudflare `platform.env`.

### Security Findings

- Admin Convex operations now require Convex-authenticated Firebase admin role, which is the correct direction.
- Admin login still uses server-side `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to preserve current `/admin/login`; the final target should use Firebase session cookies plus Convex role claims.
- Payment initialization verifies Firebase tokens through Firebase REST lookup. This should later be centralized in one server utility.
- Service worker excludes admin, dashboard, auth, checkout, API, Convex, and Firebase requests, which reduces private caching risk.
- CSP is present in `hooks.server.ts`, but it needs nonce/hash strategy before strict production mode because it currently allows inline scripts and styles.

### Cloudflare Pages Configuration Findings

- `@sveltejs/adapter-cloudflare` is installed and used.
- `wrangler.toml` has a suitable app name, compatibility date, `nodejs_compat`, and Cloudflare output directory.
- Missing `preview:cf` and `deploy` scripts from the requested Cloudflare guide.
- Missing `static/_headers` and optional `static/_redirects`.
- Missing `.github/workflows/deploy.yml`.
- Missing Cloudflare Platform binding type declarations for future KV/D1/R2 bindings.
- `svelte.config.js` does not currently include `platformProxy`; add it only after confirming local Wrangler behavior.

### UX and Responsiveness Findings

- Global anti-overflow rules exist in `src/app.css`.
- Some compact buttons and cards use large uppercase text that may need viewport QA at 320px.
- Global `max-width: 100%` on all elements prevents overflow but can distort intentional layout primitives if not tested visually.
- The app uses a hamburger drawer as the main navigation, which aligns with the requested navigation direction.
- Bottom mobile navigation still exists. Phase 3 must decide whether it remains as a mobile quick-action bar or is removed to satisfy "hamburger is the only navigation."

### Testing and Observability Findings

- `npm test` currently aliases `npm run check`.
- There is no Vitest test suite.
- There is no Playwright E2E suite.
- There is no coverage threshold.
- There is no CI pipeline.
- Runtime logging is mostly `console.warn` and `console.error`; structured logging and audit logging are only partially present.

## Prioritized Backlog

| Priority | Item | Risk | Impact | Acceptance Criteria |
|---|---|---:|---:|---|
| P0 | Preserve build/check green state | High | High | `npm run check`, `npm run test`, and `npm run build` pass before and after each phase |
| P0 | Add CI/CD skeleton | Medium | High | GitHub Actions runs install, check, test, build, and Cloudflare deploy step gated by secrets |
| P0 | Add missing legal/FAQ routes | Low | High | `/faq`, `/terms`, and `/privacy` resolve and are linked from nav/footer/auth |
| P0 | Centralize auth/session verification | High | High | Firebase token/session validation exists in one server utility and Convex role checks remain enforced |
| P1 | HTML component parity extraction | Medium | High | Readiness card, selected-course CTA, score bar, FAQ accordion, dashboard panels, and modal affordances exist as reusable Svelte components |
| P1 | Convex schema enterprise expansion | High | High | Tenants, memberships, invoices, payment events, usage, resources, downloads, audit, and tickets have indexed tables |
| P1 | Replace mock/local-only flows with live data | High | High | Dashboards, support, notifications, payments, sessions, resources, and usage read from Convex subscriptions |
| P2 | Payment gateway hardening | High | High | Flutterwave primary works in test mode; KoraPay, Paystack, and Seerbit have verified webhook signature checks |
| P2 | PWA and Cloudflare production config | Medium | Medium | `_headers`, manifest, SW cache rules, Cloudflare preview/deploy scripts, and generated worker output are verified |
| P2 | E2E tests and coverage | Medium | High | Playwright covers public browsing, auth, exam, dashboard, checkout, admin guard; Vitest covers utilities |
| P3 | Observability and runbooks | Medium | Medium | Health dashboard, structured logs, audit events, deployment checklist, and incident rollback guide exist |

## Technology Decisions

- Keep SvelteKit 2 and Svelte 5 runes. The app already compiles on this stack.
- Keep Tailwind 3 for now. Tailwind 4 migration is deferred because it is not needed for correctness and could disturb visual behavior.
- Keep Convex as the real-time source of truth. Firebase remains identity only.
- Keep Cloudflare Pages adapter as the deployment target.
- Use server routes for payment and AI edge orchestration, and Convex functions for durable state, audit, real-time dashboards, and scheduled jobs.
- Use Zod on all server/API boundaries and Convex validators on all Convex functions.
- Use feature flags from Convex `configFlags` for risky UI migrations and new enterprise features.

## SEO Strategy

- Keep canonical domain `https://collegecbt.ewinproject.org`.
- Add route-specific `SEO.svelte` usage for every public route.
- Add `/faq`, `/terms`, `/privacy`, and richer `/resources/[slug]` metadata.
- Keep `sitemap.xml` and `robots.txt`; update sitemap when new routes are added.
- Add WebApplication JSON-LD on `/`, FAQPage JSON-LD on `/faq`, Product/Offer JSON-LD on `/pricing`, and BreadcrumbList JSON-LD on content routes.
- Ensure every image has descriptive alt text and uses WebP where possible.

## Performance Targets

- LCP under 2 seconds on mid-tier mobile.
- TTI under 100ms for static public pages after hydration.
- Main JS budget under 200kB per critical route where feasible.
- No horizontal overflow from 320px to 2560px.
- Cloudflare Pages output must include `.svelte-kit/cloudflare/_worker.js` after build.

## Accessibility Targets

- WCAG 2.2 AA for all public and authenticated flows.
- Keyboard-accessible drawer, modal, FAQ accordion, dashboard tabs, exam answer controls, checkout controls, and admin drawers.
- Focus trapping for modal/drawer surfaces.
- Visible focus rings for all interactive controls.
- Correct heading hierarchy per route.
- Reduced-motion support preserved.

## GitHub Repository Plan

- Use existing repository: `https://github.com/Omaledanjumaogale/CollegeCBT.git`.
- Keep `master` unless the owner decides to rename to `main`.
- Commit Phase 0 documentation and current verified baseline.
- Add `.github/workflows/deploy.yml` in Phase 1.
- Configure GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and build-time public env vars.
- Configure Cloudflare Pages secrets outside git: Firebase, Convex deploy key, payment secrets, Resend, Anthropic, Crawl4AI.

## Phase 1: Project Initialization & Foundation

**Files:**
- Modify: `package.json`
- Modify: `svelte.config.js`
- Modify: `vite.config.ts`
- Modify: `wrangler.toml`
- Modify: `src/app.d.ts`
- Modify: `.env.example`
- Create: `.github/workflows/deploy.yml`
- Create: `static/_headers`
- Create: `static/_redirects`
- Create: `.dockerignore`
- Create: `Dockerfile`
- Create: `src/routes/+error.svelte`

- [ ] Add `preview:cf` and `deploy` scripts while keeping existing scripts unchanged.
- [ ] Add Cloudflare Pages deploy workflow that runs `npm ci`, `npm run check`, `npm test`, and `npm run build`.
- [ ] Add `static/_headers` with security headers and immutable caching for `/_app/immutable/*`.
- [ ] Add optional `static/_redirects` for future domain redirects without changing local routing.
- [ ] Add Docker files for local packaging only; do not make Docker required for development.
- [ ] Add `+error.svelte` with accessible recovery links.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.
- [ ] Commit with `chore(init): project foundation and audit complete`.

**Acceptance Criteria:**
- Existing pages still load.
- Cloudflare build output contains `_worker.js`.
- No route, auth, dashboard, exam, payment, or admin behavior regresses.

## Phase 2: HTML Extraction, Component Migration & UI Upgrade

**Files:**
- Create: `src/lib/components/ReadinessCard.svelte`
- Create: `src/lib/components/SelectedCourseBar.svelte`
- Create: `src/lib/components/ExamScoreBar.svelte`
- Create: `src/lib/components/FAQAccordion.svelte`
- Create: `src/lib/components/DashboardGauge.svelte`
- Create: `src/lib/components/DashboardActivityTabs.svelte`
- Modify: `src/lib/components/Hero.svelte`
- Modify: `src/lib/components/CurriculumBrowser.svelte`
- Modify: `src/routes/exam-lab/+page.svelte`
- Modify: `src/routes/dashboard/+page.svelte`
- Modify: `src/routes/+page.svelte`
- Modify: `src/app.css`

- [ ] Extract the prototype readiness card into `ReadinessCard.svelte`.
- [ ] Add topic progress rows, grade badge, AI insight, streak badge, and ResultsGuard badge.
- [ ] Extract selected-course CTA behavior into `SelectedCourseBar.svelte`.
- [ ] Wire selected courses to `/exam-lab?course=...&mode=lab` and `/exam-lab?course=...&mode=mock`.
- [ ] Extract live exam score UI into `ExamScoreBar.svelte`.
- [ ] Replace duplicated FAQ markup with `FAQAccordion.svelte`.
- [ ] Add dashboard gauge and activity tabs without replacing existing Convex-backed analytics.
- [ ] Run mobile and desktop visual checks after each component group.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- All migrated prototype elements are responsive and keyboard-accessible.
- Visual intent is preserved while using the Svelte app's design system.
- No horizontal overflow at 320px, 375px, 768px, 1024px, 1440px, and 2560px.

## Phase 3: Navigation, Routing & Layout Harmonization

**Files:**
- Modify: `src/lib/components/DynamicNavbar.svelte`
- Modify: `src/lib/components/BottomNav.svelte`
- Modify: `src/routes/+layout.svelte`
- Create: `src/routes/faq/+page.svelte`
- Create: `src/routes/terms/+page.svelte`
- Create: `src/routes/privacy/+page.svelte`
- Modify: `src/lib/components/Footer.svelte`
- Modify: `src/routes/about/+page.svelte`

- [ ] Make the top-right hamburger drawer the single primary navigation surface.
- [ ] Decide whether `BottomNav.svelte` becomes a contextual quick-action bar or is disabled behind a feature flag.
- [ ] Add `/faq`, `/terms`, and `/privacy` routes to eliminate dead links.
- [ ] Ensure auth-aware drawer links are consistent for signed-out users, students, and admins.
- [ ] Ensure logout always closes the drawer and redirects to the correct signed-out state.
- [ ] Verify every link in header, footer, auth modal, dashboard, pricing, resources, and admin shell.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- Hamburger is the only primary navigation.
- No dead-end links remain.
- Public and protected layouts share consistent signed-in and signed-out behavior.

## Phase 4: Firebase Authentication & Protected Routes

**Files:**
- Modify: `src/lib/services/firebase.ts`
- Create: `src/lib/server/auth.ts`
- Modify: `src/hooks.server.ts`
- Modify: `src/routes/+layout.server.ts`
- Modify: `src/routes/dashboard/+page.svelte`
- Modify: `src/routes/dashboard/custom-exam/+page.svelte`
- Modify: `src/routes/dashboard/certificate/+page.svelte`
- Modify: `src/routes/auth/login/+page.svelte`
- Modify: `src/routes/auth/register/+page.svelte`
- Modify: `convex/users.ts`
- Modify: `convex/authGuard.ts`

- [ ] Centralize Firebase token verification in `src/lib/server/auth.ts`.
- [ ] Add server-backed session cookie issuance after login.
- [ ] Keep client Firebase auth persistence for backward compatibility during rollout.
- [ ] Add route guards for student dashboard routes.
- [ ] Add role guards for admin surfaces.
- [ ] Sync Firebase user creation/update into Convex `users` and `platformAccess`.
- [ ] Add password reset and OAuth buttons only after env and Firebase provider settings are documented.
- [ ] Verify login, register, logout, dashboard redirect, admin login, and admin RBAC.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- Protected dashboards require authentication.
- Admin routes require both admin session and Convex/Firebase admin role until the final session model replaces the legacy gate.
- Session restoration is consistent across reloads.

## Phase 5: Convex Backend Integration & Real-Time Data

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/tenants.ts`
- Create: `convex/resources.ts`
- Create: `convex/usage.ts`
- Create: `convex/invoices.ts`
- Create: `convex/domain/referrals.ts`
- Create: `convex/domain/notifications.ts`
- Modify: `convex/users.ts`
- Modify: `convex/sessions.ts`
- Modify: `convex/payments.ts`
- Modify: `convex/admin.ts`
- Modify: `src/routes/dashboard/+page.svelte`
- Modify: `src/routes/admin/dashboard/+page.svelte`
- Modify: `src/routes/admin/users/+page.svelte`
- Modify: `src/routes/admin/monitoring/+page.svelte`

- [ ] Add tenant, membership, usage, invoice, payment event, resource, download, notification template, support ticket, device session, API key, quota, and feature flag targeting tables.
- [ ] Add indexes for every common query path before wiring UI.
- [ ] Move one dashboard panel at a time to live Convex subscriptions.
- [ ] Replace local/manual refresh state with query-driven state plus optimistic pending state.
- [ ] Keep fallback empty/loading states for every panel.
- [ ] Add audit logging for admin actions, payment updates, support messages, and auth-sensitive transitions.
- [ ] Verify real-time updates in two browser sessions.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- Convex is the source of truth for dashboards, referrals, notifications, chat, admin metrics, and usage.
- No production route depends on hardcoded mock data.

## Phase 6: Payments, Additional Services & Features

**Files:**
- Modify: `src/routes/api/payment/initialize/+server.ts`
- Modify: `src/routes/api/webhooks/flutterwave/+server.ts`
- Modify: `src/routes/api/webhooks/korapay/+server.ts`
- Modify: `src/routes/api/webhooks/paystack/+server.ts`
- Modify: `src/routes/api/webhooks/seerbit/+server.ts`
- Modify: `convex/payments.ts`
- Modify: `convex/mail.ts`
- Create: `src/lib/server/payments.ts`
- Create: `src/lib/server/email.ts`
- Create: `src/lib/components/ResourcePreviewModal.svelte`
- Create: `src/lib/components/DownloadManager.svelte`
- Create: `src/routes/admin/tenants/+page.svelte`
- Create: `src/routes/admin/billing/+page.svelte`
- Create: `src/routes/admin/analytics/+page.svelte`

- [ ] Centralize gateway initialization and webhook verification.
- [ ] Keep Flutterwave primary and expose KoraPay, Paystack, and Seerbit as configured options.
- [ ] Add Resend transactional email utility.
- [ ] Add Crawl4AI configuration checks and UI status.
- [ ] Add resource preview modal for PDF, image, CSV, and text resources.
- [ ] Add download manager with progress, retry, and signed URL support.
- [ ] Add tenant management, billing, and analytics admin pages.
- [ ] Verify payment test mode, webhook handling, email sending in sandbox, and Convex billing sync.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- Payment flows are wired in test mode.
- Billing state updates Convex and reflects in the UI without manual refresh.
- Additional gateways degrade gracefully when not configured.

## Phase 7: SEO, Metadata & Production Polish

**Files:**
- Modify: `src/lib/seo.ts`
- Modify: `src/lib/components/SEO.svelte`
- Modify: `src/routes/sitemap.xml/+server.ts`
- Modify: `static/robots.txt`
- Modify: `src/routes/+page.svelte`
- Modify: `src/routes/pricing/+page.svelte`
- Modify: `src/routes/resources/+page.svelte`
- Modify: `src/routes/faq/+page.svelte`
- Add optimized assets under: `static/images/`

- [ ] Add route-specific metadata for every public route.
- [ ] Add FAQPage JSON-LD to `/faq`.
- [ ] Add Product/Offer JSON-LD to `/pricing`.
- [ ] Add WebApplication JSON-LD to `/`.
- [ ] Generate or optimize Open Graph image assets.
- [ ] Ensure all public images use alt text and WebP where practical.
- [ ] Verify sitemap includes all public routes and excludes private/admin pages.
- [ ] Verify `npm run check`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- SEO metadata is unique per route.
- Social cards render correctly.
- Robots and sitemap match production domain.

## Phase 8: Performance, Testing, Security & Final Hardening

**Files:**
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/unit/auth.test.ts`
- Create: `tests/unit/payments.test.ts`
- Create: `tests/e2e/public.spec.ts`
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/exam.spec.ts`
- Create: `tests/e2e/dashboard.spec.ts`
- Create: `tests/e2e/admin.spec.ts`
- Modify: `src/hooks.server.ts`
- Modify: `static/sw.js`
- Modify: `package.json`

- [ ] Add Vitest for utility and server helper tests.
- [ ] Add Playwright for public browsing, auth, exam, dashboard, checkout, and admin guard journeys.
- [ ] Add Lighthouse/performance budget check in CI after baseline tuning.
- [ ] Tighten CSP with nonces or hashes where possible.
- [ ] Add input sanitization and output encoding checks for user-generated content.
- [ ] Add error boundaries and empty/loading states to every dynamic route.
- [ ] Verify private routes are never cached by service worker.
- [ ] Verify `npm run check`, `npm run lint`, `npm test`, and `npm run build`.

**Acceptance Criteria:**
- Critical path coverage reaches at least 90%.
- Security headers are production-ready.
- PWA install/offline behavior does not expose private content.

## Phase 9: Final Validation, Documentation & Deployment Readiness

**Files:**
- Modify: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/deployment.md`
- Create: `docs/runbooks/incident-response.md`
- Create: `docs/runbooks/rollback.md`
- Create: `docs/diagrams/auth-sequence.md`
- Create: `docs/diagrams/payment-sequence.md`
- Create: `docs/diagrams/agent-workflow.md`

- [ ] Run full manual walkthrough for public, auth, exam, dashboard, checkout, admin, and support flows.
- [ ] Update README setup, env, architecture, deployment, testing, and extension notes.
- [ ] Add sequence diagrams for auth, payment, support chat, AI question generation, and Crawl4AI agent workflow.
- [ ] Add deployment checklist for Cloudflare Pages.
- [ ] Add rollback guide using git tags and Cloudflare deployment rollback.
- [ ] Verify `npm install && npm run dev` bootstrap instructions.
- [ ] Verify `npm run check`, `npm run lint`, `npm test`, and `npm run build`.
- [ ] Commit and push final production-ready state.

**Acceptance Criteria:**
- A new developer can bootstrap the app from README.
- Cloudflare Pages deployment requirements are documented and verified.
- Final report confirms production readiness and remaining risks, if any.

## Rollback and Risk Mitigation

- Use one commit per phase at minimum; use smaller commits for schema, auth, payment, or routing work.
- Keep feature flags for risky UI and backend migrations.
- Keep existing routes and components until their replacements are verified.
- Never remove a prototype-migrated behavior until the Svelte equivalent passes visual and E2E checks.
- For schema changes, add new tables/indexes first, dual-read or backfill where needed, then remove legacy reads in a later commit.
- For auth changes, keep legacy admin cookie gate until Firebase session cookie and Convex RBAC are both verified.
- For payments, keep mock gateway available only when live secrets are absent.
- For service worker changes, test fresh install, update, offline, and private-route cache behavior before release.

## Phase 0 Verification Commands

```powershell
npm run check
npm test
npm run build
git status --short --branch
git remote -v
gh repo view --json nameWithOwner,url,defaultBranchRef
```

