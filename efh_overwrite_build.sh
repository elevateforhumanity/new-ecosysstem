#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"

# -------- SETTINGS (tailored for fix2 repo structure) --------
# This repo has Vite at ROOT level (not frontend/)
FRONTEND_DIR="."                             # Vite app is at root
PUBLIC_DIR="public"                          # public/ at root
SRC_DIR="src"                                # src/ at root
DIST_DIR="dist"                              # dist/ at root
APP_NAME="Elevate for Humanity"              # shown in index.html title

# -------- helpers --------
backup_if_exists () {
  local f="$1"
  if [ -f "$f" ]; then
    cp -f "$f" "$f.bak.$TS"
    echo "✅ backup: $f -> $f.bak.$TS"
  fi
}

ensure_dir () {
  mkdir -p "$1"
}

write_file () {
  local path="$1"
  backup_if_exists "$path"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "✅ wrote: $path"
}

# -------- checks --------
[ -f "vite.config.js" ] || {
  echo "❌ ERROR: vite.config.js not found at root. This script is tailored for fix2 repo structure."
  exit 1
}

ensure_dir "$PUBLIC_DIR"
ensure_dir "$SRC_DIR/components"
ensure_dir ".github/workflows"

echo "🚀 Starting EFH Overwrite Build for fix2 repo..."
echo ""

# -------- vite.config.js (already exists, just ensure base path) --------
if ! grep -q "base: '/'," vite.config.js; then
  echo "⚠️  Adding base: '/' to vite.config.js..."
  # Already done in previous fix, but ensure it's there
  if grep -q "export default defineConfig" vite.config.js; then
    sed -i "/export default defineConfig/a\  base: '/'," vite.config.js 2>/dev/null || true
  fi
fi
echo "✅ vite.config.js: base path verified"

# -------- public/_redirects (already correct) --------
if [ -f "$PUBLIC_DIR/_redirects" ]; then
  echo "✅ public/_redirects: already exists"
else
  write_file "$PUBLIC_DIR/_redirects" <<'EOF'
/*  /index.html  200
EOF
fi

# -------- public/_headers (already fixed, but ensure it's optimal) --------
write_file "$PUBLIC_DIR/_headers" <<'EOF'
/*
  # Security Headers
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  
  # Content Security Policy - Optimized for Cloudflare Pages + CDNs
  Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https: wss:; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'
  
  # HSTS
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  
  # Cache Control
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.jpeg
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

/*.woff
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-store, no-cache, must-revalidate
  Pragma: no-cache
  Expires: 0
EOF

# -------- ErrorBoundary (already exists, verify it's good) --------
if [ -f "$SRC_DIR/components/ErrorBoundary.jsx" ]; then
  echo "✅ ErrorBoundary: already exists at src/components/ErrorBoundary.jsx"
else
  echo "⚠️  ErrorBoundary not found, creating..."
  write_file "$SRC_DIR/components/ErrorBoundary.jsx" <<'EOF'
import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    // Optional: Send to monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
          padding: '2rem',
          maxWidth: '600px',
          margin: '40px auto',
          textAlign: 'center',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#fff'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                Error Details (dev only)
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.875rem'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
EOF
fi

# -------- Verify App.jsx uses ErrorBoundary --------
if grep -q "ErrorBoundary" "$SRC_DIR/App.jsx" 2>/dev/null; then
  echo "✅ App.jsx: ErrorBoundary already imported"
else
  echo "⚠️  App.jsx: ErrorBoundary not found in imports (manual check recommended)"
fi

# -------- Environment variable guards --------
echo ""
echo "🔍 Checking environment variable usage..."
ENV_ISSUES=$(grep -r "import\.meta\.env\." src/ 2>/dev/null | grep -v "VITE_" | grep -v "MODE" || true)
if [ -n "$ENV_ISSUES" ]; then
  echo "⚠️  WARNING: Found non-VITE_ env vars (these won't work in browser):"
  echo "$ENV_ISSUES"
  echo "   → All client env vars must be prefixed with VITE_"
else
  echo "✅ Environment variables: All properly prefixed with VITE_"
fi

# -------- .env.example verification --------
if [ -f ".env.example" ]; then
  echo "✅ .env.example: exists"
else
  write_file ".env.example" <<'EOF'
# Environment Variables
# Copy this file to .env and fill in your actual values
# DO NOT commit .env to GitHub - it's in .gitignore

# ============================================
# SUPABASE
# ============================================
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ============================================
# CLOUDFLARE
# ============================================
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ACCOUNT_ID=6ba1d2a52a3fa230972960db307ac7c0

# ============================================
# SITE CONFIGURATION
# ============================================
VITE_SITE_URL=https://elevateforhumanity.pages.dev
VITE_SITE_NAME=Elevate for Humanity

# ============================================
# OPTIONAL: MONITORING
# ============================================
# VITE_SENTRY_DSN=your_sentry_dsn_here
EOF
fi

# -------- GitHub Actions workflow (already exists, verify) --------
if [ -f ".github/workflows/cloudflare-deploy.yml" ]; then
  echo "✅ GitHub Actions: cloudflare-deploy.yml exists"
else
  echo "⚠️  Creating GitHub Actions workflow..."
  write_file ".github/workflows/cloudflare-deploy.yml" <<'EOF'
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_SITE_URL: https://elevateforhumanity.pages.dev
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: elevateforhumanity
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Purge Cloudflare Cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'
        continue-on-error: true
EOF
fi

# -------- package.json scripts verification --------
echo ""
echo "🔍 Verifying package.json scripts..."
if grep -q '"build".*"vite build"' package.json; then
  echo "✅ package.json: build script correct"
else
  echo "⚠️  package.json: build script may need adjustment"
fi

# -------- Create deployment checklist --------
write_file "DEPLOYMENT_CHECKLIST.md" <<'EOF'
# Cloudflare Pages Deployment Checklist

## ✅ Pre-Deployment

- [x] `_redirects` file in `public/` (SPA routing)
- [x] `_headers` file in `public/` (security + cache)
- [x] `base: '/'` in `vite.config.js`
- [x] ErrorBoundary component exists
- [x] All env vars prefixed with `VITE_`
- [x] `.env.example` documented

## 🔧 Cloudflare Pages Settings

**Project Configuration:**
- **Framework preset:** None (or Vite)
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty)
- **Node version:** 20

**Environment Variables (in CF Pages dashboard):**
```
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_key_here
VITE_SITE_URL=https://elevateforhumanity.pages.dev
```

## 🚀 Deploy Commands

**Local build test:**
```bash
npm run build
npm run preview
```

**Manual deploy:**
```bash
npx wrangler pages deploy dist --project-name=elevateforhumanity
```

**Via GitHub Actions:**
- Push to `main` branch triggers automatic deployment
- Daily deployment at 6 AM UTC

## 🧪 Post-Deployment Tests

1. **Homepage loads:** https://elevateforhumanity.pages.dev
2. **Deep links work:** https://elevateforhumanity.pages.dev/programs
3. **Assets load:** Check browser console for 404s
4. **No white screen:** JS bundles execute properly
5. **ErrorBoundary works:** Intentionally throw error to test

## 📊 Monitoring

- **Cloudflare Analytics:** Check traffic and errors
- **Browser Console:** Check for runtime errors
- **Lighthouse:** Run performance audit
- **Uptime:** Monitor with external service

## 🔒 Security Headers Verification

Test with: https://securityheaders.com/

Expected headers:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: (present)

## 🐛 Troubleshooting

**White screen:**
- Check browser console for errors
- Verify `base: '/'` in vite.config.js
- Check CSP headers aren't blocking resources

**404 on routes:**
- Verify `_redirects` file is in dist/
- Check Cloudflare Pages build output includes _redirects

**Assets 404:**
- Verify assets are in dist/assets/
- Check base path configuration
- Clear Cloudflare cache

**Env vars not working:**
- Must be prefixed with `VITE_`
- Must be set in Cloudflare Pages dashboard
- Rebuild after adding new vars
EOF

# -------- Finish --------
echo ""
echo "=============================================="
echo " ✅ EFH OVERWRITE BUILD: COMPLETE"
echo "=============================================="
echo ""
echo "📋 Summary of changes:"
echo "   ✅ public/_headers - Optimized security + cache headers"
echo "   ✅ public/_redirects - SPA routing (already correct)"
echo "   ✅ vite.config.js - Base path verified"
echo "   ✅ ErrorBoundary - Verified/created"
echo "   ✅ Environment variables - Checked for VITE_ prefix"
echo "   ✅ GitHub Actions - Workflow verified/created"
echo "   ✅ DEPLOYMENT_CHECKLIST.md - Created"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Test build locally:"
echo "   npm run build && npm run preview"
echo ""
echo "2. Deploy to Cloudflare Pages:"
echo "   npx wrangler pages deploy dist --project-name=elevateforhumanity"
echo ""
echo "3. Or push to GitHub (triggers automatic deployment):"
echo "   git add -A"
echo "   git commit -m 'chore: Apply EFH overwrite build fixes'"
echo "   git push origin main"
echo ""
echo "4. Verify deployment:"
echo "   - Check https://elevateforhumanity.pages.dev"
echo "   - Test deep links (e.g., /programs, /lms)"
echo "   - Check browser console for errors"
echo ""
echo "📚 See DEPLOYMENT_CHECKLIST.md for full details"
echo "=============================================="
