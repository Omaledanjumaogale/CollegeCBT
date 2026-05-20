# CollegeCBT — Comprehensive Audit & Implementation Plan

**Project:** CollegeCBT — Nigeria's #1 AI Exam Prep Platform | Results as a Service (RaaS)
**Version:** 0.1.0
**Domain:** https://collegecbt.ewinproject.org
**Date:** 2026-05-20
**Status:** ✅ Build passes (zero errors/warnings) — GitHub repository exists

---

## 1. Executive Summary

CollegeCBT is a fully-functional SvelteKit 5 application with Convex backend, Firebase auth, and multi-provider AI orchestration. The `npm run build` succeeds cleanly. The app is already live on Cloudflare Pages. The existing codebase is solid — this plan focuses on filling gaps identified between the HTML design prototypes and the SvelteKit implementation rather than rebuilding from scratch.

**GitHub:** https://github.com/Omaledanjumaogale/CollegeCBT.git

---

## 2. Deep Forensic Audit — Gap Analysis

### 2.1 Current State (Good / No Action Needed)

| Area | Status | Notes |
|------|--------|-------|
| Build pipeline | ✅ Passes with 0 errors, 0 warnings | SvelteKit 5 + adapter-cloudflare |
| Core architecture | ✅ Solid | SvelteKit + Convex + Firebase + AI orchestration |
| Route structure | ✅ Comprehensive | 30+ routes including admin, API, dashboard |
| Auth system | ✅ Complete | Firebase Auth + Convex sync, admin session cookies |
| Payment webhooks | ✅ 4 gateways | Flutterwave, KoraPay, Paystack, Seerbit |
| AI orchestration | ✅ 7+ models | Cascading fallback with Crawl4AI enrichment |
| Convex schema | ✅ 21 tables | Full data model with RBAC, audit trails |
| SEO/AEO | ✅ Present | robots.txt, llms.txt, sitemap.xml, AI manifest, JSON-LD |
| PWA | ✅ Present | Service worker, manifest.json |
| CSS/Theme | ✅ Good | Tailwind with custom palette, dark mode, animations |
| Responsiveness | ✅ Good | Mobile-first approach with bottom nav |
| TypeScript | ✅ Strict | Path aliases configured |
| Security | ✅ Good | CSP headers, admin guards, rate limiting, sanitization |

### 2.2 Critical Gaps (Must Fix — Phase Priority)

| # | Gap | Phase | Description |
|---|-----|-------|-------------|
| G1 | **Mock Exam Timer Ring** | 2 | SVG circular animated timer with color thresholds (green→amber→red) missing from `exam-lab/+page.svelte` |
| G2 | **Question Navigation Strip** | 2 | Color-coded clickable question squares (green/wrong/amber/violet) missing |
| G3 | **Score Bar (Streak Tracking)** | 2 | Persistent Q/C/W/S/Streak bar during lab practice missing |
| G4 | **WAEC Grading Reference Table** | 2 | Complete A1-F9 grade grid with percentage ranges missing |
| G5 | **Mock Results — Topic Bars + AI Rec** | 2 | Per-topic performance bars + AI recommendation text per score band missing |
| G6 | **Departmental/Institutional Plan** | 2 | ₦25,000/yr tier for up to 200 students missing from pricing |
| G7 | **3 Missing Testimonials** | 2 | Ngozi, Tunde, Maryam stories not ported |
| G8 | **Missing FAQ Item** | 2 | "How accurate are AI-generated questions?" missing |
| G9 | **Hamburger Menu Standardization** | 3 | All nav buttons must live in hamburger drawer (top-right) |
| G10 | **Auth loading/error states** | 4 | Edge cases in auth flow need hardening |
| G11 | **Mock data in dashboard** | 5 | Some dashboard placeholders need live Convex queries |
| G12 | **Payment price discrepancy** | 6 | Student Pro shows ₦10,000/yr vs HTML ₦8,500/yr → align |
| G13 | **AI key rotation from .env** | 8 | Live API keys in `.env` should use env var placeholders |

### 2.3 Desirable Enhancements (Nice to Have)

| # | Enhancement | Description |
|---|-------------|-------------|
| E1 | **DealxExam design elements** | Forest-green theme alternative, ResultsGuard™, 6 RaaS Pillars |
| E2 | **Fade-up staggered animations** | `.fu.d1-5` style entrance animations from dealxexam.html |
| E3 | **Login via Matric Number** | Part 3 HTML allows matric number login |
| E4 | **Step progress indicator for signup** | 3-step circles with lines in AuthModal |
| E5 | **Auto-submit on timer expiry** | Auto-skip/submit when mock timer hits zero |
| E6 | **Animated floating badges** | Correct answer badges with float animation |
| E7 | **Orb breathe animation** | 14s breathe animation on background orbs |
| E8 | **Distractor analysis per option** | Per-option misconception breakdown for MCQ |

### 2.4 Technology Decisions (Aligned)

| Decision | Current | Plan |
|----------|---------|------|
| **Framework** | SvelteKit 5 (latest) | ✅ Keep |
| **CSS** | Tailwind CSS 3 + custom CSS | ✅ Keep |
| **Backend** | Convex v1.34 | ✅ Keep |
| **Auth** | Firebase Auth (E-WIN Project) | ✅ Keep |
| **Payments** | Flutterwave, KoraPay, Paystack, Seerbit | ✅ Keep |
| **Email** | Resend | ✅ Keep |
| **AI** | OpenRouter cascade: DeepSeek→Qwen→Nemotron→GLM | ✅ Keep (add key rotation) |
| **Hosting** | Cloudflare Pages (adapter-cloudflare) | ✅ Keep |
| **Database** | Convex (21 tables) | ✅ Keep |
| **Form validation** | Zod v4 | ✅ Keep |
| **Icons** | Emoji-based + Lucide option | ✅ Keep (emoji) |

### 2.5 SEO Strategy (Already Implemented)

| Element | Status | Notes |
|---------|--------|-------|
| Dynamic per-route SEO | ✅ | `SEO.svelte` + `seo.ts` helpers |
| JSON-LD Schema.org | ✅ | WebApplication, FAQ, Course schemas |
| Sitemap.xml | ✅ | Dynamic with all public routes |
| Robots.txt | ✅ | AEO-optimized, crawler-specific rules |
| LLMs.txt (standard) | ✅ | Both `llms.txt` and `llms-full.txt` |
| AI Agent Manifest | ✅ | `.well-known/ai-agent-manifest.json` |
| OG/Twitter meta | ✅ | Structured builders |
| Breadcrumbs | ✅ | Schema.org BreadcrumbList |

### 2.6 Performance Targets

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| LCP | <2s | ~1.2s (estimated) | Good — preloaded fonts |
| TTI | <100ms on 3G | ~300ms (estimated) | Need code splitting |
| Lighthouse | >90 all | Not measured | Run after Phase 7 |
| Bundle (initial) | <100KB gzip | ~14KB CSS + ~16KB JS | Already excellent |
| Time to interactive | <1.5s | Good | Static prerender helps |

### 2.7 Accessibility (WCAG 2.2 AA)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Color contrast | ✅ | High-contrast violet/lime on dark |
| Keyboard navigation | ⚠️ Partial | Tab through forms OK, but no skip links |
| ARIA labels | ⚠️ Partial | Forms have labels, dynamic content needs `aria-live` |
| Focus indicators | ⚠️ Partial | Some focus rings present |
| Reduced motion | ✅ | `prefers-reduced-motion` respected |

### 2.8 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing working code | Build check after EVERY change; never modify working files without reading first |
| API key exposure | `.env` is in `.gitignore`; verify before commit |
| Firebase/Convex quota | Existing rate limiting; monitor admin dashboard |
| Payment integration breaks | Test in mock mode; webhook idempotency already implemented |
| Regression in auth flows | All auth paths have loading/error states; test login + register after changes |

---

## 3. Phased Implementation Plan

### Phase 1: Project Initialization & Foundation
**Status:** ✅ **ALREADY COMPLETE** — Build passes, repo exists, folder structure clean.

**Verification steps:**
- [x] `npm run build` succeeds with 0 errors/warnings
- [x] SvelteKit 5 + TypeScript + Tailwind CSS configured
- [x] Environment variables documented in `.env.example`
- [x] Folder structure: `src/routes/`, `src/lib/components/`, `convex/`, `static/`
- [x] `wrangler.toml` for Cloudflare Pages
- [x] ESLint/Prettier can be added if desired

---

### Phase 2: HTML Extraction, Component Migration & UI Upgrade
**Estimated changes:** 8-12 components modified/created

**Tasks:**

#### 2.1 Mock Exam Lab Upgrades (`exam-lab/+page.svelte`)
| Task | Acceptance Criteria |
|------|---------------------|
| **Timer Ring** (SVG) | ✅ Animated circular SVG timer: green (>20s), amber (10-20s), red (<10s) with pulsing effect |
| **Question Navigation Strip** | ✅ Color-coded clickable squares: green (correct), red (wrong), amber (skipped), violet (current). Click to navigate. |
| **Score Bar** | ✅ Persistent bar below config: Questions count, Correct, Wrong, Score %, Streak with fire emoji |
| **Progress Bar** | ✅ Linear gradient bar showing % of mock exam completed |
| **WAEC Grading Reference Table** | ✅ Expandable table in mock config section: A1→F9 with score ranges and grade colors |
| **Skip / End Early buttons** | ✅ "Skip →" for unanswered, "🏁 Finish Exam" for early submission |
| **Auto-submit on timeout** | ✅ Timer reaches 0 → auto-skip / auto-submit last question |
| **Per-topic Results Bars** | ✅ Horizontal bars per topic with score % and color |
| **AI Recommendation Block** | ✅ Contextual recommendation per score band (75%+, 60-74%, 45-59%, <45%) |
| **Distractor Analysis** | ✅ Per-option misconception explanation in MCQ review |

#### 2.2 Dashboard Upgrades (`dashboard/+page.svelte`)
| Task | Acceptance Criteria |
|------|---------------------|
| **Settings: Add WhatsApp + Phone + Institution** | ✅ Add fields matching HTML spec (WhatsApp, phone number, institution name) |

#### 2.3 Pricing Section Upgrades (`PricingSection.svelte`)
| Task | Acceptance Criteria |
|------|---------------------|
| **Departmental Plan** | ✅ New ₦25,000/yr plan card for up to 200 students with 9 features |
| **Fix Student Pro price** | ✅ Change ₦10,000/yr → ₦8,500/yr (align with HTML spec) |
| **Add "Save 15%" annual banner** | ✅ Highlight on Student Pro card |

#### 2.4 Content Additions
| Task | Acceptance Criteria |
|------|---------------------|
| **3 Missing Testimonials** | ✅ Ngozi Eze, Tunde Adeleke, Maryam Suleiman stories added to array |
| **FAQ #7** | ✅ "How accurate are AI-generated questions?" added with answer |

#### 2.5 Visual Polish
| Task | Acceptance Criteria |
|------|---------------------|
| **Global overflow rules** | ✅ `overflow-x-hidden` on body; max-width constraints on all cards |
| **Scrollbar styling** | ✅ Custom 6px violet scrollbar |
| **Fade-up entrance animations** | ✅ Staggered fade-up on section entrance (`.fu.d1-5`) |
| **Floating badge animations** | ✅ Correct answer badges with float animation |
| **Orb breathe enhancement** | ✅ 14s breathe keyframes on BgMesh orbs |
| **Shimmer text on guarantee** | ✅ Subtle shimmer on "Guaranteed Results" text |
| **Mobile responsiveness audit** | ✅ Test 320px-2560px, zero overflow, all elements visible |

**Verification:** `npm run build` succeeds. All new components render correctly. Manual visual check of exam-lab, dashboard, pricing.

---

### Phase 3: Navigation, Routing & Layout Harmonization
**Estimated changes:** 3-5 files

**Tasks:**
| Task | Acceptance Criteria |
|------|---------------------|
| **Hamburger menu audit** | ✅ Navbar has hamburger icon (top-right). ALL nav links live in drawer. No button bar at top. |
| **Route dead-end check** | ✅ Walk all links — no 404s or broken routes |
| **Footer consistency** | ✅ Same footer on public + protected pages |
| **Admin layout** | ✅ Already separated via `admin/+layout.svelte` — keep |

**Verification:** `npm run build` succeeds. Manual navigation walkthrough.

---

### Phase 4: Firebase Authentication & Protected Routes
**Status:** ✅ **ALREADY IMPLEMENTED** — Firebase Auth with email/password, OAuth, session persistence, Convex sync.

**Audit-only tasks:**
| Task | Acceptance Criteria |
|------|---------------------|
| **Loading states** | ✅ `authLoading` store respected in all components |
| **Error boundary** | ✅ `authError` store shown via Toast |
| **Route guard for protected paths** | ✅ `/dashboard/*`, `/exam-lab` require auth |
| **Admin route guard** | ✅ Cookie-based `admin_session` in `hooks.server.ts` |
| **Password reset flow** | ✅ Firebase built-in, triggered from modal |

---

### Phase 5: Convex Backend Integration & Real-Time Data
**Status:** ✅ **LARGELY IMPLEMENTED** — 21 tables, auth middleware, 50+ queries/mutations.

**Remaining tasks:**
| Task | Acceptance Criteria |
|------|---------------------|
| **Replace dashboard placeholders** | ✅ Mock data in `dashboard/+page.svelte` → Convex queries |
| **Streak tracking** | ✅ New Convex mutation: incrementStreak, getStreak. Persist in `sessions` table. |
| **Question navigation persistence** | ✅ Store question state (answered/skipped) in local session state |

---

### Phase 6: Payments, Additional Services & Features
**Status:** ✅ **LARGELY IMPLEMENTED** — 4 payment gateways, webhooks, Convex processing.

**Tasks:**
| Task | Acceptance Criteria |
|------|---------------------|
| **Fix price in payment init** | ✅ Update Student Pro amount to ₦8,500/yr in both UI and payment initialization |
| **Departmental plan payment** | ✅ Add ₦25,000/yr option to checkout flow |

---

### Phase 7: SEO, Metadata & Production Polish
**Status:** ✅ **ALREADY IMPLEMENTED** — Full SEO system, sitemap, robots.txt, AI manifest, JSON-LD.

---

### Phase 8: Performance, Testing, Security & Final Hardening

**Tasks:**
| Task | Acceptance Criteria |
|------|---------------------|
| **Sanitize .env** | ✅ Move live API keys to environment variables (not in committed `.env`) |
| **CSP hardening** | ✅ Verify Content-Security-Policy headers in `hooks.server.ts` |
| **Rate limit audit** | ✅ Confirm Convex rate limiter active on all public API endpoints |
| **Bundle optimization** | ✅ Check for code-splitting opportunities in large components |
| **PWA audit** | ✅ Service worker caches correctly, offline fallback works |

**Verification:** `npm run build` succeeds. Lighthouse audit >85 on all categories.

---

### Phase 9: Final Validation, Documentation & Deployment

**Deliverables:**
1. ✅ This implementation summary
2. ✅ Localhost preview walkthrough
3. ✅ Git commit with all changes
4. ✅ Deployment readiness confirmed

---

## 4. GitHub Repository

- **Remote:** `origin → https://github.com/Omaledanjumaogale/CollegeCBT.git`
- **Branch:** `master`
- **Status:** 50+ commits, active development history
- **Next commit message style:** `feat(scope): description`

---

## Appendix A: Complete File Inventory Reference

See forensic audit output for complete file-by-file analysis.

## Appendix B: Environment Variables Reference

| Variable | Purpose | Status |
|----------|---------|--------|
| `PUBLIC_CONVEX_URL` | Convex deployment URL | ✅ Configured |
| `PUBLIC_FIREBASE_*` | Firebase project config | ✅ Configured |
| `ANTHROPIC_API_KEY` | Claude AI | ✅ Live key |
| `OPENAI_API_KEY` | GPT-4o-mini | ✅ Live key |
| `GEMINI_API_KEY` | Gemini 1.5 Flash | ✅ Live key |
| `DEEPSEEK_API_KEY` | DeepSeek V3/V3.1/R1 | ✅ Live keys |
| `FLUTTERWAVE_SECRET_KEY` | Payment gateway | ✅ Configured |
| `KORAPAY_SECRET_KEY` | Payment gateway | ✅ Configured |
| `RESEND_API_KEY` | Email service | ✅ Configured |
| `CRAWL4AI_BASE_URL` | Web crawler service | ✅ Configured |

---

**Plan prepared:** 2026-05-20
**Next action:** Awaiting Phase 2 approval to begin implementation.
