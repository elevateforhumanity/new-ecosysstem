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
