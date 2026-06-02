# CollegeCBT Production Deployment Runbook

## Preflight

Run these commands before every production deployment:

```bash
npm ci
npm run check
npm test
npm run test:e2e
npm run build
```

Confirm the Cloudflare output contains:

```text
.svelte-kit/cloudflare/_worker.js
.svelte-kit/cloudflare/_routes.json
```

## Required Environment Variables

Configure these in Cloudflare Pages and Convex dashboards. Never commit real secrets.

- `PUBLIC_APP_ENV`
- `PUBLIC_APP_URL`
- `PUBLIC_CONVEX_URL`
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `FIREBASE_API_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_WEBHOOK_HASH`
- `KORAPAY_SECRET_KEY`
- `PAYSTACK_SECRET_KEY`
- `SEERBIT_SECRET_KEY`
- `RESEND_API_KEY`
- `CRAWL4AI_API_URL`
- `CRAWL4AI_API_SECRET`
- `CRAWL4AI_SERVICE_ID`

## Deployment

```bash
npm run build
npm run deploy
```

For GitHub Actions, verify these repository secrets exist:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `PUBLIC_APP_NAME`

## Smoke Test

Check these routes after deployment:

- `/`
- `/exam-lab`
- `/pricing`
- `/auth/login`
- `/dashboard`
- `/admin/login`
- `/admin/enterprise`
- `/sitemap.xml`
- `/api/payment/initialize`

## Rollback

1. Identify the last known good commit in GitHub.
2. Revert the deployment commit or redeploy the previous Cloudflare Pages deployment.
3. Keep Convex schema additions backward compatible. Do not remove tables during rollback.
4. Re-run the smoke test.
5. Record the incident in admin audit logs and the incident notes.

## Incident Triage

- Payment issue: inspect `paymentEvents`, `invoices`, and gateway webhook logs.
- Auth issue: inspect Firebase configuration and `platformAccess`.
- Exam/dashboard issue: inspect `sessions`, `usageMetrics`, and browser console errors.
- Performance issue: run Lighthouse and inspect bundle sizes from `npm run build`.
