# CollegeCBT — AI-Powered Exam Practice Engine

Enterprise-grade AI Exam Preparation Platform for Nigerian Higher Institution students. Features unlimited AI-generated exam questions, timed mock exams, and grade prediction intelligence.

## 🚀 Recent Improvements & Upgrades

### 1. Hardened Backend Infrastructure (Convex)
*   **Token-Bucket Rate Limiter (`rateLimit.ts`):** ACID-compliant logic gating both generic reads and critical writes to ensure system stability.
*   **Distributed Session Bindings (`sessions.ts`):** Robust tracking linking heartbeat signals to client lifecycles against Google/Firebase UIDs.
*   **Edge-Ready Type Safety (`validators.ts`):** 100% type-safe edge validators using Zod for payload enforcement.
*   **Lifecycle Triggers (`triggers.ts`):** Emulated SQL row-level auditing triggers for high-sensitivity operations tracking.
*   **Autonomous Maintenance (`crons.ts`):** Automated garbage collection for stale sessions and rate limit entries.

### 2. Premium UI & UX (Svelte 5)
*   **Global Reactive Notifications (`toast.svelte.ts`):** Unified, accessible notification system replacing legacy UI blocks.
*   **Informational Tooltips (`Tooltip.svelte`):** Beautifully engineered tooltips providing contextual guidance on all key features.
*   **PWA & Real-time Push:** Successfull integration of service worker hooks and PushManager for real-time market/exam resolution deliveries.
*   **Online/Offline Resilience:** Automatic connection status tracking with user feedback.

## 🛠️ Technology Stack
*   **Frontend:** Svelte 5 (Runes), SvelteKit, TailwindCSS
*   **Backend:** Convex (Edge Runtime)
*   **Auth:** Firebase Authentication (tied to Convex Distributed Sessions)
*   **AI:** Claude AI (via Convex Actions)
*   **Deployment:** Cloudflare Pages (Edge)

## 📦 Getting Started

### Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env`
4. Run the dev server: `npm run dev`
5. Run Convex: `npx convex dev`

### Production Build
```bash
npm run build
```

## 🔒 Security & Compliance
*   **NIN Verification:** Used for student identity verification in registration.
*   **ACID Compliance:** Guaranteed via Convex database transactions.
*   **Rate Limiting:** Protects all sensitive endpoints.

---
Built with pride for Nigerian Students. Powered by Elite Workforce Impact Nigeria (E-WIN) Project.
