# CollegeCBT — AI-Powered Exam Practice Engine

Enterprise-grade AI Exam Preparation Platform for Nigerian Higher Institution students. Features unlimited AI-generated exam questions, timed mock exams, and grade prediction intelligence.

## 🚀 Recent Improvements & Upgrades

### 1. Hardened Backend Infrastructure (Convex)

* **Token-Bucket Rate Limiter (`rateLimit.ts`):** ACID-compliant logic gating both generic reads and critical writes to ensure system stability.
* **Distributed Session Bindings (`sessions.ts`):** Robust tracking linking heartbeat signals to client lifecycles against Google/Firebase UIDs.
* **Edge-Ready Type Safety (`validators.ts`):** 100% type-safe edge validators using Zod for payload enforcement.
* **Lifecycle Triggers (`triggers.ts`):** Emulated SQL row-level auditing triggers for high-sensitivity operations tracking.
* **Autonomous Maintenance (`crons.ts`):** Automated garbage collection for stale sessions and rate limit entries.

### 2. Premium UI & UX (Svelte 5 Runes)

* **Svelte 5 Engine Upgrade:** 100% migration to `$state`, `$derived`, and `$props` runes for high-performance reactive updates and reduced bundle size.
* **Syntax Modernization:** Surgical conversion of legacy `on:event` handlers to the new `onclick`, `oninput`, etc., syntax to eliminate build-time reactivity warnings.
* **Global Reactive Notifications (`toast.svelte.ts`):** Unified, accessible notification manager providing real-time user feedback.
* **Informational Tooltips (`Tooltip.svelte`):** Contextual "knowledge node" indicators on all key features, helping students understand platform functionality instantly.
* **PWA & Real-time Connectivity:** Integrated service worker with network-first strategy and `PushManager` hooks for offline resilience and device-level notifications.
* **Mobile-First Engineering:** Optimized `BottomNav` and layout structure for a 100% responsive experience on any device.

### [v3.0.0] — AI Academic Infrastructure & Curriculum Orchestration (NEW)

* **Dynamic Academic Selector**: Reusable, cascading selection component (Institution → Faculty → Department → Level → Course) with full searchable support for 100+ universities.
* **AI Question Bank Orchestration**: Intelligent 'Lookup-First' logic in Convex. If questions aren't in the bank, AI generates them and **self-archives** the result to the global registry for future users.
* **Nigerian Higher Education Registry**: Integrated 100+ Federal, State, and Private universities, polytechnics, and colleges with structured curriculum mappings.
* **"Other" Topic Synthesizer**: Support for user-defined custom departments and topics. AI autonomously generates the syllabus and questions real-time.
* **Hardened 2-Tier Pricing**: Simplified "Free Forever" and "Student Pro" (₦10,000/annum) mapping across Convex and Firebase Auth.
* **Mock Simulation Engine**: Dynamic 50-question mock generator with WAEC-graded analysis (A1-F9) and AI topic heatmaps.

### [v2.1.0] — Enterprise UI & UX Modernization (Legacy Release)

* **Unified Notification System**: Built-in Toast and Tooltip mechanisms for real-time feedback.
* **Accessibility Hardening**: WCAG 2.2 AA compliant components with ARIA enhancement.
* **Svelte 5 Snippets**: Migration to the newest reactive syntax for cleaner modular code.
* **Performance**: Optimized metadata and zero-layout shift.

## 🛠️ Technology Stack

* **Frontend:** Svelte 5 (Runes), SvelteKit, TailwindCSS
* **Backend:** Convex (Edge Runtime)
* **Auth:** Firebase Authentication (tied to Convex Distributed Sessions)
* **AI:** Claude AI (via Convex Actions)
* **Deployment:** Cloudflare Pages (Edge)

## 📦 Getting Started

### Local Development

1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env`
4. Run the dev server: `npm run dev`
5. Run Convex: `npx convex dev`

### Production Build

### Local Data Seeding

To populate your live database with the 100+ institutions and initial curriculum:
1. Run `npx convex dev`
2. In the Convex dashboard, execute the **`seed:runSeed`** mutation.

## 🔒 Security & Compliance

* **NIN Verification:** Used for student identity verification in registration.
* **ACID Compliance:** Guaranteed via Convex database transactions.
* **Rate Limiting:** Protects all sensitive endpoints.

---

Built with pride for Nigerian Students. Powered by Elite Workforce Impact Nigeria (E-WIN) Project.
