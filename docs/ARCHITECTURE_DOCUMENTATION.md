# Multi-Platform Architecture Documentation

## Current Setup (As Designed)

### Platform Distribution

#### 1. **Durable.co** - Main Landing Page
- **URL**: https://elevateforhumanity.org (root domain)
- **Purpose**: Public-facing marketing landing page
- **Technology**: Durable.co (Next.js-based website builder)
- **Content**: 
  - Main homepage
  - Marketing content
  - Lead generation
  - SEO-optimized landing pages

#### 2. **Render + Vite/React** - Application Platform
- **URL**: https://elevateforhumanity.onrender.com
- **Purpose**: Full web application with interactive features
- **Technology**: Vite + React + Supabase
- **Content**:
  - `/durable` - Durable landing page clone
  - `/main-landing` - Alternative main landing
  - `/programs` - Programs catalog
  - `/hub` - Student/educator hub
  - `/lms` - Learning management system
  - All interactive application features

#### 3. **Cloudflare** - CDN/Proxy Layer
- **Purpose**: 
  - CDN for both platforms
  - SSL/TLS termination
  - DDoS protection
  - Caching

#### 4. **Supabase** - Backend Services
- **URL**: https://cuxzzpsyufcewtmicszk.supabase.co
- **Purpose**:
  - Database (PostgreSQL)
  - Authentication
  - Real-time subscriptions
  - Storage

### DNS Routing Strategy

```
elevateforhumanity.org (root)
└─> Durable.co (marketing landing page)

app.elevateforhumanity.org (subdomain - if configured)
└─> Render (Vite application)

OR

elevateforhumanity.onrender.com
└─> Direct access to Vite application
```

## Deployment Flow

### Durable.co (Main Landing)
1. Edit content in Durable dashboard
2. Publish changes
3. Durable auto-deploys to elevateforhumanity.org
4. Cloudflare caches and serves

### Vite Application (Render)
1. Push code to GitHub (tiny-new repo)
2. GitHub Actions trigger (or Render auto-deploy)
3. Render builds Vite app
4. Deploys to elevateforhumanity.onrender.com
5. Cloudflare proxies requests

## Why This Architecture?

### Advantages
1. **Separation of Concerns**
   - Marketing team can edit Durable landing page without touching code
   - Developers work on Vite app independently

2. **Performance**
   - Durable optimized for SEO and fast landing pages
   - Vite app optimized for interactive features

3. **Flexibility**
   - Can update marketing content quickly via Durable
   - Can deploy app features independently

4. **Cost Optimization**
   - Durable handles high-traffic landing page
   - Render handles authenticated app users

### Potential Issues
1. **User Confusion**
   - Users land on Durable site, need to navigate to app
   - Solution: Add clear CTAs linking to app.elevateforhumanity.org or /app path

2. **Duplicate Content**
   - Both platforms have landing pages
   - Solution: Use canonical URLs, noindex on duplicates

3. **Session Management**
   - Different domains = different cookies
   - Solution: Use subdomain (app.elevateforhumanity.org) or path-based routing

## Recommended Improvements

### Option 1: Subdomain Routing (Recommended)
```
elevateforhumanity.org → Durable (marketing)
app.elevateforhumanity.org → Render (application)
```

**Setup:**
1. Add CNAME in Cloudflare: `app → elevateforhumanity.onrender.com`
2. Add custom domain in Render: `app.elevateforhumanity.org`
3. Update links in Durable to point to app subdomain

### Option 2: Path-Based Routing
```
elevateforhumanity.org/ → Durable (marketing)
elevateforhumanity.org/app/* → Render (application)
```

**Setup:**
1. Configure Cloudflare Workers to route /app/* to Render
2. Keep root domain on Durable
3. More complex but maintains single domain

### Option 3: Full Migration to Render
```
elevateforhumanity.org → Render (serves both landing + app)
```

**Setup:**
1. Copy Durable content to Vite app
2. Point DNS to Render
3. Deprecate Durable site
4. Simplest long-term solution

## Current Status

✅ **Working:**
- Durable landing page live at elevateforhumanity.org
- Vite app deployed at elevateforhumanity.onrender.com
- Supabase backend configured
- GitHub Actions deployment pipeline

⚠️ **Needs Clarification:**
- How users navigate from Durable landing to Vite app
- Which pages should be on which platform
- Session/auth flow between platforms

## Next Steps

1. **Decide on routing strategy** (subdomain vs path-based)
2. **Configure DNS accordingly**
3. **Update navigation/links** between platforms
4. **Test user flow** from landing to app
5. **Document for team** which content goes where
