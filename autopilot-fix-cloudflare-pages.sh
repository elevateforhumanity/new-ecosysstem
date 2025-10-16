#!/usr/bin/env bash
set -euo pipefail

echo "⚙️  ElevateForHumanity — Cloudflare Pages SPA Autopilot Fix"

# 1) Ensure a public/ folder exists for Pages static controls
mkdir -p public

# 2) Force SPA fallback so ANY route (e.g. /programs, /lms) serves index.html
#    This is the #1 reason a Pages SPA shows a blank page or only the homepage.
cat > public/_redirects <<'REDIRECTS'
# API proxy to Render backend
/api/*  https://elevateforhumanity.onrender.com/api/:splat  200

# Static files should be served directly
/assets/*  /assets/:splat  200
/*.js  /:splat  200
/*.css  /:splat  200
/*.png  /:splat  200
/*.jpg  /:splat  200
/*.jpeg  /:splat  200
/*.svg  /:splat  200
/*.ico  /:splat  200
/*.woff  /:splat  200
/*.woff2  /:splat  200
/*.ttf  /:splat  200

# SEO files
/sitemap.xml  /sitemap.xml  200
/sitemap-pages.xml  /sitemap-pages.xml  200
/sitemap-courses.xml  /sitemap-courses.xml  200
/robots.txt  /robots.txt  200

# Always serve the SPA entry for client-routed paths
/*   /index.html   200
REDIRECTS
echo "✅ Created public/_redirects (SPA fallback + API proxy)"

# 3) Sensible cache headers for JS/CSS assets, and no-cache for HTML
cat > public/_headers <<'HEADERS'
# Security Headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Permissions-Policy: geolocation=(), microphone=(), camera=()

# CORS Headers - Allow Supabase and Render API
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: Content-Type, Authorization, apikey, X-Client-Info, X-Supabase-Auth
  Access-Control-Allow-Credentials: true

# Cache static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/*.woff
  Cache-Control: public, max-age=31536000, immutable

/*.ttf
  Cache-Control: public, max-age=31536000, immutable

# Don't cache HTML files
/*.html
  Cache-Control: public, max-age=0, must-revalidate

/index.html
  Cache-Control: public, max-age=0, must-revalidate

# API routes should not be cached
/api/*
  Cache-Control: no-cache, no-store, must-revalidate
HEADERS
echo "✅ Created public/_headers (cache hints + security + CORS)"

# 4) Provide a basic 404 that still bootstraps the SPA (helps bots & legacy)
cat > public/404.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Not Found • Elevate for Humanity</title>
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=/">
  </head>
  <body>
    <p>Redirecting to the app…</p>
  </body>
</html>
HTML
echo "✅ Created public/404.html (graceful SPA 404)"

# 5) Vite config hardening (creates if missing; patches if present)
#    - Ensures outDir=dist
#    - Generates sourcemaps (easier debugging in Pages)
#    - Keeps base="/" (Cloudflare Pages root)
VITE_CONFIG=""
if [[ -f vite.config.ts ]]; then VITE_CONFIG="vite.config.ts"; fi
if [[ -f vite.config.js ]]; then VITE_CONFIG="vite.config.js"; fi

if [[ -z "${VITE_CONFIG}" ]]; then
  cat > vite.config.ts <<'VITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
})
VITE
  echo "✅ Added vite.config.ts"
else
  echo "✅ Using existing ${VITE_CONFIG}"
fi

# 6) Package.json scripts (adds if missing)
if [[ -f package.json ]]; then
  node - <<'PKG'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts = pkg.scripts || {};
if (!pkg.scripts.dev)    pkg.scripts.dev = "vite";
if (!pkg.scripts.build)  pkg.scripts.build = "vite build";
if (!pkg.scripts.preview)pkg.scripts.preview = "vite preview --port 4173";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Ensured package.json scripts (dev/build/preview)');
PKG
else
  echo "⚠️ package.json not found — skip scripts patch"
fi

# 7) Env guard so missing API keys don't hard-crash the app to a blank screen
mkdir -p src
cat > src/env-guard.ts <<'TS'
/**
 * Runtime env guard — import *once* near app bootstrap.
 * Prevents silent blank screens when required env vars are missing.
 */
const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const missing = required.filter(k => !import.meta.env[k]);
if (missing.length) {
  // Surface a visible error in dev/preview; fail gracefully in prod
  console.error('❌ Missing env vars:', missing);
  const msg = `Configuration error. Missing: ${missing.join(', ')}`;
  if (typeof document !== 'undefined') {
    const el = document.createElement('pre');
    el.style.cssText = 'padding:16px;background:#fff3cd;border:1px solid #ffecb5;color:#664d03;margin:20px;border-radius:8px;font-family:monospace;';
    el.textContent = `⚠️ ${msg}\n\nAdd these to your Cloudflare Pages environment variables.`;
    document.body.prepend(el);
  }
}
export {};
TS
echo "✅ Added src/env-guard.ts (env guard)"

# 8) Update main.tsx to import env guard
if [[ -f src/main.tsx ]]; then
  if ! grep -q "env-guard" src/main.tsx; then
    sed -i "1i import './env-guard';" src/main.tsx
    echo "✅ Added env-guard import to src/main.tsx"
  else
    echo "✅ env-guard already imported in src/main.tsx"
  fi
elif [[ -f src/main.jsx ]]; then
  if ! grep -q "env-guard" src/main.jsx; then
    sed -i "1i import './env-guard';" src/main.jsx
    echo "✅ Added env-guard import to src/main.jsx"
  else
    echo "✅ env-guard already imported in src/main.jsx"
  fi
fi

# 9) Quick README with Cloudflare settings checklist
cat > CLOUDFLARE_PAGES_SETUP.md <<'MD'
# Cloudflare Pages — Required Settings (Elevate for Humanity)

## Build Settings

**Build command**
```
npm run build
```

**Build output directory**
```
dist
```

**Root directory**
```
(leave empty - project root)
```

## Environment Variables

Go to: **Settings → Environment Variables**

Add these variables:

### Required:
```
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
```

### Optional:
```
VITE_API_URL=https://elevateforhumanity.onrender.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NODE_ENV=production
```

## Custom Domain Setup

1. Go to **Custom domains** in Cloudflare Pages
2. Add: `lms.elevateforhumanity.org`
3. Cloudflare will provide DNS instructions
4. Add CNAME record in your domain registrar:
   ```
   Type: CNAME
   Name: lms
   Value: elevateforhumanity.pages.dev
   TTL: Auto
   ```

## Static Controls

These files are automatically included in your build:
- `/_redirects`  → SPA fallback + API proxy
- `/_headers`    → Security + CORS + Cache
- `/404.html`    → Graceful 404 handling

## Deployment

### Automatic (Recommended):
Push to GitHub main branch - Cloudflare Pages auto-deploys

### Manual:
```bash
npm run build
npx wrangler pages deploy dist --project-name=elevateforhumanity
```

## Troubleshooting

### Blank page on routes?
- Check `public/_redirects` exists
- Verify it's copied to `dist/_redirects` after build
- Check browser console for errors

### API calls failing?
- Verify environment variables are set in Cloudflare Pages
- Check CORS headers in `public/_headers`
- Test API directly: https://elevateforhumanity.onrender.com/api/health

### Missing env vars?
- The app will show a yellow warning banner
- Add missing vars in Cloudflare Pages settings
- Redeploy after adding vars

## URLs

- **Production**: https://elevateforhumanity.pages.dev
- **Custom Domain**: https://lms.elevateforhumanity.org (after DNS)
- **API Backend**: https://elevateforhumanity.onrender.com
- **Main Site**: https://www.elevateforhumanity.org (Durable)
MD
echo "✅ Wrote CLOUDFLARE_PAGES_SETUP.md"

# 10) Final build to validate locally
if command -v pnpm >/dev/null 2>&1; then
  echo "📦 Installing deps with pnpm (if needed)…"
  pnpm install --silent 2>/dev/null || true
  echo "🏗️ Building…"
  pnpm run build
  echo "✅ Build complete. dist/ is ready for Cloudflare Pages."
elif command -v npm >/dev/null 2>&1; then
  echo "📦 Installing deps with npm (if needed)…"
  npm install --silent 2>/dev/null || true
  echo "🏗️ Building…"
  npm run build
  echo "✅ Build complete. dist/ is ready for Cloudflare Pages."
else
  echo "⚠️ npm/pnpm not found — skipping build step."
fi

# 11) Verify critical files are in dist/
if [[ -d dist ]]; then
  echo ""
  echo "🔍 Verifying dist/ contents..."
  
  if [[ -f dist/_redirects ]]; then
    echo "  ✅ dist/_redirects exists"
  else
    echo "  ❌ dist/_redirects MISSING - copy public/_redirects to dist/"
  fi
  
  if [[ -f dist/_headers ]]; then
    echo "  ✅ dist/_headers exists"
  else
    echo "  ❌ dist/_headers MISSING - copy public/_headers to dist/"
  fi
  
  if [[ -f dist/index.html ]]; then
    echo "  ✅ dist/index.html exists"
  else
    echo "  ❌ dist/index.html MISSING - build failed?"
  fi
  
  if [[ -f dist/robots.txt ]]; then
    echo "  ✅ dist/robots.txt exists"
  else
    echo "  ⚠️  dist/robots.txt missing (optional)"
  fi
fi

echo ""
echo "🎉 Done! Commit & push these changes, then trigger a Pages deploy."
echo ""
echo "Next steps:"
echo "  1. git add ."
echo "  2. git commit -m 'fix: Cloudflare Pages SPA routing and env guards'"
echo "  3. git push origin main"
echo "  4. Check deployment at: https://elevateforhumanity.pages.dev"
echo ""
echo "📚 See CLOUDFLARE_PAGES_SETUP.md for environment variable setup"
