# 🚀 Netlify Auto-Deploy Setup

## Immediate Commit-to-Live Workflow

**Goal:** Every git commit automatically deploys to live Netlify site within 30 seconds.

## 1. Netlify Site Configuration

### Connect GitHub Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub
4. Select repository: `elevateforhumanity/new-ecosysstem`
5. Configure build settings:
   ```
   Branch to deploy: main
   Build command: (leave empty for static site)
   Publish directory: . (root directory)
   ```

### Auto-Deploy Settings
- ✅ **Auto-deploy:** Enabled (deploys on every push to main)
- ✅ **Branch deploys:** Only main branch
- ✅ **Deploy previews:** Enabled for pull requests

## 2. Build Configuration

### netlify.toml (Already in repo)
```toml
[build]
  publish = "."
  
[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com;"

[[redirects]]
  from = "/index.html"
  to = "/hub.html"
  status = 301

[[redirects]]
  from = "/"
  to = "/hub.html"
  status = 301
```

## 3. Workflow Commands

### For Every Change (Use These Commands):
```bash
# Make your changes, then:
git add .
git commit -m "Brief description of changes"
git push origin main
# Site will be live in 30 seconds automatically
```

### Quick Deploy Script
```bash
#!/bin/bash
# quick-deploy.sh
echo "🚀 Quick deploying to live site..."
git add .
git commit -m "${1:-Quick update}"
git push origin main
echo "✅ Pushed to GitHub - Netlify will deploy automatically"
echo "🌐 Live in ~30 seconds at your Netlify URL"
```

## 4. Environment Variables (Set in Netlify)

### Required for Production:
```
NODE_VERSION=18
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Deploy Notifications

### Slack/Discord Integration (Optional)
- Set up deploy notifications in Netlify settings
- Get notified when deploys succeed/fail
- Monitor deploy times and performance

## 6. Domain Configuration

### Custom Domain Setup
1. In Netlify: Site settings → Domain management
2. Add custom domain: `elevateforhumanity.org`
3. Configure DNS records as instructed
4. Enable HTTPS (automatic)

### DNS Records Needed:
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app

Type: A
Name: @
Value: 75.2.60.5 (Netlify's IP)
```

## 7. Performance Monitoring

### Built-in Analytics
- Deploy frequency tracking
- Build time monitoring
- Error rate tracking
- Performance insights

## 8. Rollback Strategy

### Instant Rollback
```bash
# If something breaks, instantly rollback:
git revert HEAD
git push origin main
# Previous version will be live in 30 seconds
```

### Deploy History
- View all deploys in Netlify dashboard
- One-click rollback to any previous version
- Deploy previews for testing

## 9. Branch Protection (Recommended)

### GitHub Settings
1. Go to repository settings
2. Branches → Add rule for `main`
3. Enable:
   - Require pull request reviews (optional)
   - Require status checks to pass
   - Include administrators

## 10. Success Metrics

### What to Monitor:
- ✅ Deploy time: <2 minutes
- ✅ Success rate: >99%
- ✅ Build errors: <1%
- ✅ Site availability: 99.9%

---

## 🎯 IMMEDIATE WORKFLOW

**From now on, every change follows this pattern:**

1. **Make changes** to any file
2. **Run:** `git add . && git commit -m "Description" && git push origin main`
3. **Wait 30 seconds** - site is automatically live
4. **Verify** changes at Netlify URL

**No manual deployment steps needed - everything is automated!**