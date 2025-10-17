#!/usr/bin/env node

/**
 * Check required environment variables before build
 */

const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.warn('\n⚠️  Warning: Using fallback environment variables:\n');
  missing.forEach(key => {
    console.warn(`   - ${key} (using hardcoded fallback)`);
  });
  console.warn('\nFor production, add these to your deployment platform environment variables.');
  console.warn('For Netlify: https://app.netlify.com/sites/YOUR_SITE/settings/deploys#environment');
  console.warn('For Cloudflare Pages: https://dash.cloudflare.com/YOUR_ACCOUNT/pages/view/YOUR_PROJECT/settings/environment-variables\n');
} else {
  console.log('✅ All required environment variables are set');
}
