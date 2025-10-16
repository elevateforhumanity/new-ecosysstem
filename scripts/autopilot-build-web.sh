#!/usr/bin/env bash
set -euo pipefail

# CONFIG — frontend is at repo root
WEB_DIR="${WEB_DIR:-.}"

echo "🔧 Autopilot: hardening ${WEB_DIR} build for SPA on Render/Cloudflare Pages"
echo ""

# 1) Ensure required files/structure
mkdir -p "${WEB_DIR}/public" "${WEB_DIR}/src"

# Create _redirects (copied by Vite to dist/)
cat > "${WEB_DIR}/public/_redirects" <<'R'
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
R
echo "✅ Ensured ${WEB_DIR}/public/_redirects"

# Create _headers
cat > "${WEB_DIR}/public/_headers" <<'H'
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
H
echo "✅ Ensured ${WEB_DIR}/public/_headers"

# Verify index.html exists at root
if [ ! -f "${WEB_DIR}/index.html" ]; then
  echo "❌ ${WEB_DIR}/index.html not found!"
  echo "   Creating basic index.html..."
  cat > "${WEB_DIR}/index.html" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Elevate for Humanity - Workforce Development & Learning Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML
  echo "✅ Created ${WEB_DIR}/index.html"
else
  echo "✅ ${WEB_DIR}/index.html exists"
fi

# 2) Verify Vite config has base='/' and outDir='dist'
if [ -f "${WEB_DIR}/vite.config.ts" ] || [ -f "${WEB_DIR}/vite.config.js" ]; then
  echo "✅ Vite config exists"
else
  echo "⚠️  No vite.config found, creating one..."
  cat > "${WEB_DIR}/vite.config.js" <<'VITE'
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
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
})
VITE
  echo "✅ Created ${WEB_DIR}/vite.config.js"
fi

# 3) Ensure package scripts exist
if [ -f "${WEB_DIR}/package.json" ]; then
  echo "✅ package.json exists"
else
  echo "❌ ${WEB_DIR}/package.json not found!"
  exit 1
fi

# 4) Clean old build
echo ""
echo "🧹 Cleaning old build artifacts..."
rm -rf "${WEB_DIR}/dist"
rm -rf "${WEB_DIR}/.vite"
rm -rf "${WEB_DIR}/node_modules/.vite"
echo "✅ Cleaned"

# 5) Install deps & build
echo ""
echo "📦 Installing dependencies..."
if [ -f "${WEB_DIR}/pnpm-lock.yaml" ]; then
  ( cd "${WEB_DIR}" && pnpm install --frozen-lockfile=false )
else
  ( cd "${WEB_DIR}" && npm ci || npm install )
fi
echo "✅ Dependencies installed"

echo ""
echo "🏗️  Building..."
if [ -f "${WEB_DIR}/pnpm-lock.yaml" ]; then
  ( cd "${WEB_DIR}" && pnpm run build:frontend )
else
  ( cd "${WEB_DIR}" && npm run build )
fi
echo "✅ Build complete"

# 6) Verify outputs
echo ""
echo "🔍 Verifying build outputs..."

if [ -f "${WEB_DIR}/dist/index.html" ]; then
  echo "   ✅ ${WEB_DIR}/dist/index.html exists"
  TITLE=$(grep -o "<title>.*</title>" "${WEB_DIR}/dist/index.html" | head -1)
  echo "   Title: $TITLE"
else
  echo "   ❌ ${WEB_DIR}/dist/index.html not found!"
  echo "      - Make sure your index.html is at ${WEB_DIR}/ (not in src/)"
  echo "      - Ensure build tool is Vite and 'vite build' ran without errors"
  exit 1
fi

if [ -f "${WEB_DIR}/dist/_redirects" ]; then
  echo "   ✅ ${WEB_DIR}/dist/_redirects exists"
else
  echo "   ❌ ${WEB_DIR}/dist/_redirects not found!"
  echo "      - _redirects must be placed in ${WEB_DIR}/public/_redirects so Vite copies it"
  echo "      - Re-run: npm run build"
  exit 1
fi

if [ -f "${WEB_DIR}/dist/_headers" ]; then
  echo "   ✅ ${WEB_DIR}/dist/_headers exists"
else
  echo "   ⚠️  ${WEB_DIR}/dist/_headers not found (optional but recommended)"
fi

# Check for route-specific HTML files
echo ""
echo "📄 Checking route-specific HTML files..."
ROUTES=("programs" "lms" "hub" "connect" "get-started")
for route in "${ROUTES[@]}"; do
  if [ -f "${WEB_DIR}/dist/${route}/index.html" ]; then
    echo "   ✅ dist/${route}/index.html"
  else
    echo "   ⚠️  dist/${route}/index.html not found (will use SPA fallback)"
  fi
done

echo ""
echo "🎉 Build ready for deployment!"
echo ""
echo "📋 Render Configuration:"
echo "   Root directory = . (repo root)"
echo "   Build command  = pnpm install --frozen-lockfile=false && pnpm run build:frontend"
echo "   Start command  = pnpm start"
echo "   Publish dir    = dist"
echo ""
echo "📋 Cloudflare Pages Configuration:"
echo "   Build command  = pnpm install && pnpm run build:frontend"
echo "   Build output   = dist"
echo "   Root directory = (leave empty)"
echo ""
