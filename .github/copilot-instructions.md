# AI agent guide for this repo

Purpose: give AI coding agents the minimum context to make correct edits fast. Keep changes aligned with these patterns and workflows.

## What this project is
- Frontend app built with Vite + React + TypeScript; ships as a static site in `dist/`.
- Implements a multi-site ecosystem (Hub/Programs/LMS/Connect) with shared user "memory" via Supabase.
- Payments handled by an external/adjacent Node + Stripe backend (see integration helpers in repo), not by this static app.

Key folders/files
- `src/` React app source; TypeScript enabled. Tailwind/PostCSS configured via `tailwind.config.*` and `postcss.config.*`.
- Root-level `*.html` pages and `public/` assets are included in build output and mapped 1:1 to URLs.
- `shared/` holds cross-site client helpers (e.g., Supabase, enrollment utilities).
- `routes.config.mjs` documents static routes/aliases.
- `deploy.sh` is the authoritative release script (S3 + CloudFront) — it also generates `robots.txt` and `sitemap.xml` during deploy.

## Local dev and tests
- Node 18.x only (see `package.json.engines`).
- Scripts:
  - `npm run dev` (Vite dev server)
  - `npm run build` (Vite build → `dist/`)
  - `npm run preview` (serve built site)
  - `npm run test` (Vitest, jsdom)
- Env: copy `.env.example` → `.env` for local keys (Supabase, etc.). Do not commit secrets.

## CI/CD and deploys
- Primary: Cloudflare Pages via GitHub Actions (`.github/workflows/cloudflare-pages.yml`). Required repo secrets:
  - `CLOUDFLARE_API_TOKEN` (Pages write), `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT`.
  - Builds with Node 18 → publishes `dist/`.
- Static hosting behavior for Pages configured with:
  - `public/_headers` for security headers (mirrors prior `vercel.json` intent)
  - `public/_redirects` for SPA fallback (`/* -> /index.html 200`).
- Legacy/alt path (kept, not default): AWS S3 + CloudFront via `.github/workflows/deploy.yml` and `deploy.sh`.
- Netlify config (`netlify.toml`) exists but is not the primary path.

## Project conventions that matter
- Keep Node pinned to 18.x to avoid build differences.
- Add pages so they resolve cleanly in the static output:
  - `about/index.html` → `/about/`; `page.html` → `/page.html`.
  - React routes should also work as pre-rendered entry points or fallback to SPA routing depending on hosting.
- SEO: use `react-helmet-async` in React pages; ensure important static pages include correct `<head>` meta.
- Supabase integration lives in `shared/` and is consumed by pages and widgets (e.g., account drawer, enrollment helpers). Keep interfaces stable.
- Stripe/payment hooks exist as client helpers and docs (`pay-backend-integration.js`, `webhook-handler.js`); server-side lives elsewhere.

## Common tasks (examples)
- Add a new public page: create `your-page/index.html` or a React route, reference shared utilities from `shared/`, and verify it appears in the generated `sitemap.xml` after `./deploy.sh`.
- Adjust caching/SEO rules:
  - Cloudflare Pages: edit `public/_headers` and `public/_redirects`; for pre-rendered pages/SEO, ensure proper HTML output and helmet meta.
  - AWS path (legacy): tweak `deploy.sh` for cache-control and sitemap generation.
- Debug CI build: reproduce locally with `npm ci || npm i --legacy-peer-deps` then `npm run build`. Ensure Node 18 and no missing envs.

## References
- Workflows: `.github/workflows/cloudflare-pages.yml` (primary), `.github/workflows/deploy.yml` (legacy AWS), `.github/workflows/netlify.yml` (optional)
- Config: `public/_headers`, `public/_redirects`, `postcss.config.*`, `tailwind.config.*`, `vite.config.*`, `tsconfig.*`
- Docs: `README.md` (architecture + setup), `DEPLOYMENT_CHECKLIST.md`

Notes for agents
- Prefer Cloudflare Pages config files for headers/redirects; keep Node at 18.
- Treat Vercel-related scripts under migration folders as historical; do not wire them back into CI.
