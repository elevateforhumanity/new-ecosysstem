# Quick Durable Setup Guide (30 Minutes)
## Consolidate Both Domains Under elevate4humanity.org

## Step 1: Choose Your Primary Domain (2 minutes)

**Recommendation: elevate4humanity.org**
- Shorter and cleaner
- Already connected to Wix
- Easier to remember and type

## Step 2: Configure Wix (10 minutes)

### In Wix Dashboard:
1. **Go to Settings → Domains**
2. **Set elevate4humanity.org as Primary Domain**
3. **Add www.elevate4humanity.org as Domain Alias**
4. **Verify both domains are connected**
5. **Publish your site**

### Wix will give you DNS records like:
```
A Record: @ → 185.230.63.107 (example)
CNAME: www → elevate4humanity.org
```

## Step 3: Configure Cloudflare for elevate4humanity.org (8 minutes)

### In Cloudflare Dashboard:
1. **Add elevate4humanity.org as a site** (if not already added)
2. **Create DNS records from Wix:**
   ```
   Type: A
   Name: @
   Value: [IP from Wix]
   Proxy: ON (Orange Cloud)
   
   Type: CNAME  
   Name: www
   Value: elevate4humanity.org
   Proxy: ON (Orange Cloud)
   ```

3. **Add subdomain records:**
   ```
   Type: CNAME
   Name: app
   Value: [your-site].netlify.app
   Proxy: ON
   
   Type: CNAME
   Name: enterprise
   Value: [your-project].pages.dev
   Proxy: ON
   ```

## Step 4: Set Up Redirects for elevateforhumanity.org (10 minutes)

### Option A: Cloudflare Page Rules (Easier)
1. **Go to Rules → Page Rules**
2. **Create Rule 1:**
   ```
   URL: *.elevateforhumanity.org/*
   Setting: Forwarding URL (301 Redirect)
   Destination: https://$1.elevate4humanity.org/$2
   ```
3. **Create Rule 2:**
   ```
   URL: elevateforhumanity.org/*
   Setting: Forwarding URL (301 Redirect)  
   Destination: https://elevate4humanity.org/$1
   ```

### Option B: Cloudflare Redirect Rules (More Flexible)
1. **Go to Rules → Redirect Rules**
2. **Create Dynamic Redirect:**
   ```
   When incoming requests match:
   - Hostname equals "elevateforhumanity.org" OR
   - Hostname contains "elevateforhumanity.org"
   
   Then:
   - Type: Dynamic
   - Expression: concat("https://", regex_replace(http.host, "elevateforhumanity\.org", "elevate4humanity.org"), http.request.uri.path)
   - Status Code: 301
   ```

## Step 5: Update Your Application Configs (5 minutes)

### Update netlify.toml:
```toml
# Add redirect for legacy domain
[[redirects]]
  from = "https://www.elevateforhumanity.org/*"
  to = "https://www.elevate4humanity.org/:splat"
  status = 301
  force = true
```

### Update environment variables:
```json
{
  "BASE_URL": "https://www.elevate4humanity.org",
  "APP_URL": "https://app.elevate4humanity.org",
  "API_URL": "https://api.elevate4humanity.org"
}
```

## Step 6: Test Everything (5 minutes)

### Test these URLs:
- ✅ https://elevate4humanity.org → Should load Wix site
- ✅ https://www.elevate4humanity.org → Should load Wix site  
- ✅ https://elevateforhumanity.org → Should redirect to elevate4humanity.org
- ✅ https://www.elevateforhumanity.org → Should redirect to www.elevate4humanity.org
- ✅ https://app.elevate4humanity.org → Should load your app

### Check redirect status:
```bash
curl -I https://elevateforhumanity.org
# Should return: HTTP/2 301
# Location: https://elevate4humanity.org/
```

## Final Result

### Primary Domain (elevate4humanity.org):
- **Main site:** elevate4humanity.org → Wix
- **WWW:** www.elevate4humanity.org → Wix
- **App:** app.elevate4humanity.org → Netlify
- **Enterprise:** enterprise.elevate4humanity.org → Cloudflare Pages

### Legacy Domain (elevateforhumanity.org):
- **All traffic redirects to elevate4humanity.org equivalents**
- **SEO authority transfers to primary domain**
- **Users automatically sent to correct domain**

## Benefits You Get:

1. ✅ **One clear brand identity**
2. ✅ **All SEO authority consolidated**  
3. ✅ **No user confusion**
4. ✅ **Professional appearance**
5. ✅ **Clean analytics**
6. ✅ **Future-proof architecture**

## Troubleshooting

### If redirects don't work:
1. Check DNS propagation: whatsmydns.net
2. Clear browser cache
3. Wait up to 24 hours for full propagation

### If Wix doesn't load:
1. Verify DNS records match Wix requirements
2. Check domain verification in Wix dashboard
3. Ensure SSL certificates are active

**Total Time: ~30 minutes**
**Maintenance: Minimal (just domain renewals)**
**Future-proof: Yes, scales with your business**