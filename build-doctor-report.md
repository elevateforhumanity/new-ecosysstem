# EFH Build Doctor Report
_2025-09-25 09:56:44Z UTC_

## Repo Basics
- ✅ Git repo detected (branch: `main`)
- ⚠️ Uncommitted changes present — commit/push to avoid Gitpod data loss.

---

## Environment & Versions
- Node: `v18.20.8` | npm: `10.8.2` | pnpm: `9.7.0`
- .nvmrc present: `20.18.1`
- package.json engines.node: `20.18.1`
- packageManager: `pnpm@9.7.0`

---

## Framework / Project Check
- ⚠️ Next.js not clearly detected (this tool assumes Next.js; still running generic checks)
- netlify.toml present
- .gitpod.yml present
- .gitpod.Dockerfile present

---

## Environment Variables
- .env.example present
- ✅ NEXT_PUBLIC_SITE_URL set (in env or .env)
- ✅ NEXT_PUBLIC_SUPABASE_URL set (in env or .env)
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY set (in env or .env)

---

## Dependency Version Audit
- ✅ All dependency versions appear pinned (no ^, ~, latest, etc.)

---

## Deterministic Install & Build
- Running: corepack enable && corepack prepare pnpm@9.7.0 --activate
- Running: pnpm install --frozen-lockfile
- ✅ Install OK (frozen lockfile)
- Running: pnpm typecheck
- ❌ Typecheck failed — see tail of .tools/build.log below
- Running: pnpm lint
- ❌ Lint failed — see tail of .tools/build.log below
- Running: pnpm build
- ✅ Build passed

### Build Log (tail)
\n```text
 WARN  Unsupported engine: wanted: {"node":"20.18.1"} (current: {"node":"v18.20.8","pnpm":"9.7.0"})
Lockfile is up to date, resolution step is skipped
Progress: resolved 1, reused 0, downloaded 0, added 0
Packages: +209
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 209, reused 209, downloaded 0, added 209, done

dependencies:
+ @supabase/supabase-js 2.57.4
+ @vitejs/plugin-react 4.7.0
+ jsdom 23.2.0
+ node-fetch 3.3.2
+ prop-types 15.8.1
+ react 19.1.1
+ react-dom 19.1.1
+ react-helmet-async 2.0.5
+ react-router-dom 6.30.1
+ rollup-plugin-visualizer 6.0.3
+ slugify 1.6.6
+ vite 6.3.6

devDependencies:
+ rimraf 5.0.10

Done in 931ms
 WARN  Unsupported engine: wanted: {"node":"20.18.1"} (current: {"node":"v18.20.8","pnpm":"9.7.0"})

> efh-autopilot@2.0.0 typecheck /workspaces/new-ecosysstem
> tsc --noEmit

 ELIFECYCLE  Command failed.
 WARN  Unsupported engine: wanted: {"node":"20.18.1"} (current: {"node":"v18.20.8","pnpm":"9.7.0"})

> efh-autopilot@2.0.0 lint /workspaces/new-ecosysstem
> eslint . --ext .js,.jsx,.ts,.tsx

 ELIFECYCLE  Command failed with exit code 2.
 WARN  Unsupported engine: wanted: {"node":"20.18.1"} (current: {"node":"v18.20.8","pnpm":"9.7.0"})

> efh-autopilot@2.0.0 build /workspaces/new-ecosysstem
> vite build

vite v6.3.6 building for production...
transforming...
✓ 29 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.49 kB │ gzip:   0.33 kB
dist/assets/index-CFH3XUSf.css    0.35 kB │ gzip:   0.25 kB
dist/assets/index-RIj5rA9A.js   372.43 kB │ gzip: 109.89 kB │ map: 1,546.38 kB
✓ built in 2.61s
```

---

## SEO Routes Check
- ⚠️ No sitemap route found
- ⚠️ No robots.txt route found

---

## Recommendations
- Pin Node in .nvmrc and package.json engines (e.g., 20.11.1)
- Commit lockfile and use `pnpm install --frozen-lockfile` in Gitpod/CI
- Add netlify.toml with Node 20 + Next.js plugin if using Netlify
- Add .gitpod.yml (prebuilds on) and .gitpod.Dockerfile to fix env drift
- Provide .env.example; set real env in Gitpod Variables/Netlify
- Replace loose dependency ranges (^, ~, latest) with exact versions

---

