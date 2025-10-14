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
