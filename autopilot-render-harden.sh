#!/bin/bash
set -euo pipefail

echo "🔧 Hardening Render/SPA/Env Configuration..."
echo "============================================="
echo ""

# Ensure Cloudflare/SPA redirects exist
echo "1️⃣  Checking SPA redirects..."
if [ ! -f "public/_redirects" ]; then
  echo "   Creating public/_redirects..."
  mkdir -p public
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
  echo "   ✅ Created public/_redirects"
else
  echo "   ✅ public/_redirects already exists"
fi

# Ensure frontend env guard exists
echo ""
echo "2️⃣  Checking frontend env guard..."
if [ ! -f "src/env-guard.ts" ]; then
  echo "   Creating src/env-guard.ts..."
  mkdir -p src
  cat > src/env-guard.ts <<'ENVGUARD'
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
ENVGUARD
  echo "   ✅ Created src/env-guard.ts"
else
  echo "   ✅ src/env-guard.ts already exists"
fi

# Ensure backend env guard exists
echo ""
echo "3️⃣  Checking backend env guard..."
if [ ! -f "backend/env-guard.js" ]; then
  echo "   Creating backend/env-guard.js..."
  mkdir -p backend
  cat > backend/env-guard.js <<'BACKENDGUARD'
/**
 * Environment Variable Guard
 * Validates required environment variables are present before starting the server
 */

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'PORT'
];

const missing = required.filter(k => !process.env[k]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(k => console.error(`   - ${k}`));
  console.error('\n💡 Add these to your Render service:');
  console.error('   Render Dashboard → Service → Environment');
  console.error('\n📝 Example values:');
  console.error('   SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_KEY=your-service-key');
  console.error('   JWT_SECRET=your-secret-key');
  console.error('   PORT=8080');
  process.exit(1);
}

console.log('✅ All required environment variables present');
BACKENDGUARD
  echo "   ✅ Created backend/env-guard.js"
else
  echo "   ✅ backend/env-guard.js already exists"
fi

# Ensure 404.html exists
echo ""
echo "4️⃣  Checking 404.html..."
if [ ! -f "public/404.html" ]; then
  echo "   Creating public/404.html..."
  cat > public/404.html <<'HTML404'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - Elevate for Humanity</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 6rem; margin: 0; }
    p { font-size: 1.5rem; margin: 1rem 0; }
    a { color: white; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Page not found</p>
    <p><a href="/">Return to homepage</a></p>
  </div>
  <script>
    // SPA fallback: redirect to index.html with original path
    if (window.location.pathname !== '/404.html') {
      window.location.href = '/';
    }
  </script>
</body>
</html>
HTML404
  echo "   ✅ Created public/404.html"
else
  echo "   ✅ public/404.html already exists"
fi

# Verify render.yaml exists
echo ""
echo "5️⃣  Checking render.yaml..."
if [ -f "render.yaml" ]; then
  echo "   ✅ render.yaml exists"
  
  # Check if it has the correct startCommand
  if grep -q "serve-static.cjs" render.yaml; then
    echo "   ✅ render.yaml uses serve-static.cjs"
  else
    echo "   ⚠️  render.yaml may need updating to use serve-static.cjs"
  fi
else
  echo "   ⚠️  render.yaml not found - you may need to create it"
fi

# Verify serve-static.cjs exists
echo ""
echo "6️⃣  Checking serve-static.cjs..."
if [ -f "serve-static.cjs" ]; then
  echo "   ✅ serve-static.cjs exists"
else
  echo "   ⚠️  serve-static.cjs not found - frontend may not serve correctly"
fi

echo ""
echo "============================================="
echo "✅ Hardening complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the created/updated files"
echo "   2. Commit changes: git add -A && git commit -m 'Harden Render deployment'"
echo "   3. Push to trigger deployment: git push"
echo "   4. Verify environment variables in Render dashboard"
echo ""
