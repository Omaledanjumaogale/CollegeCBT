# DealxExam - Web Platform Implementation Plan

This document outlines the comprehensive strategy for extracting the DealxExam static HTML templates and migrating them into an enterprise-grade, fully functional SvelteKit application backed by Convex, Firebase, and Cloudflare Pages.

> [!IMPORTANT]
> User review and approval are required before proceeding to Phase 1 of this implementation. Please review the details carefully and grant permission to proceed.

## Project Architecture & Tech Stack
- **Frontend**: SvelteKit + Svelte (TypeScript)
- **Styling**: Tailwind CSS (with emoji-based vibrant icons, maintaining the dark/light mode adaptable "glassmorphism" aesthetic)
- **Backend Data Layer**: Convex (Queries, Mutations, Real-time Subscriptions)
- **Authentication**: Firebase Authentication (Email/Password + OAuth)
- **Deployment & Edge Run**: Cloudflare Pages (`adapter-cloudflare`)
- **Other Integrations**:
  - **AI Web Scraping**: Crawl4AI on Render
  - **Email**: Resend
  - **Payments**: Flutterwave, KoraPay, Seerbit (and Paystack later)

## Phase-by-Phase Plan

### Phase 1: Project Initialization & Configuration
- Scaffold the SvelteKit project using `create-svelte` configured with TypeScript and Tailwind CSS within the `.dev` folder.
- Setup `adapter-cloudflare` for Edge compatibility.
- Configure environment variables for Firebase, Convex, Resend, and Payment Providers.
- Initialize Convex (`npx convex dev`) and Firebase within the project.
- Configure ESLint, Prettier, and PostCSS.

### Phase 2: Template Extraction & UI Components Generation
- Break down the provided HTML templates (`dealxexam.html`, `collegecbt-part1.html`, etc.) into modular `.svelte` components.
- Establish the Global Layout (`src/routes/+layout.svelte`) preserving the dark UI, glassmorphism filters, and CSS variables.
- Migrate and harmonize primary (`--forest`) and secondary (`--lime`, `--amber`) colors into the Tailwind configuration.
- Implement the requested hamburger navigation menu, relocating global navigation links into a responsive side/top drawer layout with strict overflow control to prevent UI clipping.

### Phase 3: Route Generation & Navigation
Create the following route structure mapping to the HTML layouts:
- `/` (Home/Landing Page optimized for SEO)
- `/dashboard` (User Dashboard with metrics & exam lab access)
- `/exam-lab` (Practice engine via AI logic)
- `/mock-exam` (Timed simulation mode)
- `/pricing` (Subscription plans)
- `/auth/sign-in` , `/auth/sign-up` (Firebase Auth flows)

### Phase 4: Authentication & Security (Firebase + Convex)
- Implement Firebase Auth flows.
- Create syncing logic to store the Firebase user ID inside the Convex `users` table via server-side session cookies or direct client syncing.
- Implement RBAC (Role-Based Access Control) to gate `/dashboard` and premium routes.

### Phase 5: Database Models & Real-time Integration (Convex)
Design Convex schemas for the following entities:
- `users`: Profile data, plan status.
- `questions`: Generated questions, options, correct answers, explanations.
- `practice_sessions`: Tracking user performance, scores, readiness calculations.
- `subscriptions`: Tracking Stripe/Flutterwave payment states.
- Connect the frontend metrics (e.g. Exam Readiness Score) to real-time Convex subscriptions.

### Phase 6: Third-Party Integrations
- Integrate Flutterwave/KoraPay logic for checkout.
- Configure Resend for transactional emails (welcome, receipts, exam results).
- Setup Crawl4AI configuration wrappers pointing to a Render service for agentic scraping.

### Phase 7: SEO, Crawlability, & Metadata Optimization
- Implement dynamic `<svelte:head>` metadata components across all routes.
- Format Title Tags: `[App Name] - Free [Benefit/Use Case] Web App | DealxExam`
- Inject JSON-LD `WebApplication` schema markup for Rich Results.
- Generate `robots.txt` and an XML sitemap script linking all canonical URLs mapped to `collegecbt.ewinproject.org`.

### Phase 8: Quality Assurance & Build Verification
- Perform responsive scaling audits on mobile devices.
- Verify global anti-overflow rules ensuring no layout breakages.
- Execute a final `npm run build` and ensure successful Cloudflare deployment output validation.
- Commit all changes natively to the GitHub source control.

## Open Questions
> [!WARNING]
> 1. Since Crawl4AI functions on Python/FastAPI primarily, how would you prefer the integration layer implemented within SvelteKit? Should we create a microservice interface (API routes in SvelteKit that communicate with your Render deployment)?
> 2. Are there specific schema overrides or existing Firebase Project IDs / Convex deployment URLs I should use immediately, or should I scaffold them as generic placeholders that you feed environment variables into later?

## Verification Plan
1. **Automated Tasks**: Vite build step and component tree checks.
2. **Visual Checks**: Ensure 100% fidelity to the provided DealX HTML designs with enhanced interactive emoji elements.
3. **Data Flow Check**: Ensure Convex realtime streams update the "Exam Readiness Score" immediately upon form submission.
