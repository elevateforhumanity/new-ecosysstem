# Durable Dual Domain Architecture
## elevateforhumanity.org + elevate4humanity.org

## Current Status Analysis

### Domain Status:
- **elevateforhumanity.org** → Cloudflare → Working (HTTP 200)
- **www.elevateforhumanity.org** → Cloudflare → Redirects to apex (HTTP 308)
- **elevate4humanity.org** → Wix (Pepyaka) → 404 but connected
- **www.elevate4humanity.org** → Wix (Pepyaka) → 404 but connected

## Recommended Durable Architecture

### Option A: Primary/Secondary Domain Strategy (RECOMMENDED)

#### Primary Domain: elevate4humanity.org (Wix)
```
elevate4humanity.org → Wix Main Site
www.elevate4humanity.org → Wix Main Site
app.elevate4humanity.org → Netlify (Application)
enterprise.elevate4humanity.org → Cloudflare Pages
auth.elevate4humanity.org → Supabase Auth
api.elevate4humanity.org → API Gateway
```

#### Secondary Domain: elevateforhumanity.org (Redirect Hub)
```
elevateforhumanity.org → 301 Redirect to elevate4humanity.org
www.elevateforhumanity.org → 301 Redirect to www.elevate4humanity.org
app.elevateforhumanity.org → 301 Redirect to app.elevate4humanity.org
*.elevateforhumanity.org → 301 Redirect to *.elevate4humanity.org
```

### Benefits:
- ✅ **SEO Consolidation** - All authority flows to one domain
- ✅ **Brand Consistency** - One primary domain for all marketing
- ✅ **User Experience** - No confusion about which domain to use
- ✅ **Maintenance** - Single domain to manage for content
- ✅ **SSL Simplicity** - One SSL certificate per service
- ✅ **Analytics Clarity** - All traffic consolidated

## Implementation Plan

### Phase 1: Set Up Primary Domain (elevate4humanity.org)

#### 1.1 Wix Configuration
```
In Wix Dashboard:
1. Connect elevate4humanity.org as primary domain
2. Connect www.elevate4humanity.org as alias
3. Set up SSL certificates
4. Configure redirects within Wix
```

#### 1.2 Cloudflare DNS for elevate4humanity.org
```
A Record:
- Name: @
- Value: [Wix IP from dashboard]
- Proxy: ON (Orange Cloud)

CNAME Record:
- Name: www
- Value: elevate4humanity.org
- Proxy: ON (Orange Cloud)

CNAME Records for Apps:
- Name: app
- Value: [netlify-site].netlify.app
- Proxy: ON

- Name: enterprise  
- Value: [project].pages.dev
- Proxy: ON

- Name: auth
- Value: [supabase-auth-domain]
- Proxy: ON

- Name: api
- Value: [api-endpoint]
- Proxy: ON
```

### Phase 2: Set Up Secondary Domain (elevateforhumanity.org)

#### 2.1 Cloudflare Page Rules for Redirects
```
Rule 1: Wildcard Subdomain Redirect
- URL: *.elevateforhumanity.org/*
- Setting: Forwarding URL (301 Redirect)
- Destination: https://$1.elevate4humanity.org/$2

Rule 2: WWW Redirect  
- URL: www.elevateforhumanity.org/*
- Setting: Forwarding URL (301 Redirect)
- Destination: https://www.elevate4humanity.org/$1

Rule 3: Apex Redirect
- URL: elevateforhumanity.org/*
- Setting: Forwarding URL (301 Redirect)
- Destination: https://elevate4humanity.org/$1
```

#### 2.2 Alternative: Cloudflare Workers Redirect
```javascript
// More flexible redirect handling
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  
  if (hostname.includes('elevateforhumanity.org')) {
    // Replace domain and maintain path/subdomain
    const newHostname = hostname.replace('elevateforhumanity.org', 'elevate4humanity.org')
    const newUrl = `https://${newHostname}${url.pathname}${url.search}`
    
    return Response.redirect(newUrl, 301)
  }
  
  return fetch(request)
}
```

### Phase 3: Update Application Configurations

#### 3.1 Update Netlify Configuration
```toml
# netlify.toml
[[redirects]]
  from = "https://www.elevateforhumanity.org/*"
  to = "https://www.elevate4humanity.org/:splat"
  status = 301
  force = true

[[redirects]]
  from = "https://app.elevateforhumanity.org/*"
  to = "https://app.elevate4humanity.org/:splat"
  status = 301
  force = true
```

#### 3.2 Update Headers for Both Domains
```
# _headers
/*
  Content-Security-Policy: frame-ancestors https://*.wix.com https://*.wixsite.com https://*.elevate4humanity.org https://*.elevateforhumanity.org;
  X-Frame-Options: ALLOWALL
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=60
```

#### 3.3 Update Environment Variables
```json
{
  "PRIMARY_DOMAIN": "elevate4humanity.org",
  "LEGACY_DOMAIN": "elevateforhumanity.org",
  "BASE_URL": "https://www.elevate4humanity.org",
  "APP_URL": "https://app.elevate4humanity.org",
  "API_URL": "https://api.elevate4humanity.org"
}
```

### Phase 4: Service Configuration Updates

#### 4.1 Supabase Configuration
```
Site URL: https://app.elevate4humanity.org

Redirect URLs:
- https://app.elevate4humanity.org/*
- https://enterprise.elevate4humanity.org/*
- https://www.elevate4humanity.org/*
- https://app.elevateforhumanity.org/* (legacy)
- https://www.elevateforhumanity.org/* (legacy)

CORS Origins:
- https://app.elevate4humanity.org
- https://enterprise.elevate4humanity.org  
- https://www.elevate4humanity.org
- https://app.elevateforhumanity.org (legacy)
- https://www.elevateforhumanity.org (legacy)
```

#### 4.2 Stripe Configuration
```
Success URL: https://app.elevate4humanity.org/success?session_id={CHECKOUT_SESSION_ID}
Cancel URL: https://app.elevate4humanity.org/cancel

Webhook Endpoint: https://api.elevate4humanity.org/stripe/webhook
```

## Migration Timeline

### Week 1: Primary Domain Setup
- Day 1-2: Configure Wix for elevate4humanity.org
- Day 3-4: Set up subdomains (app, enterprise, auth, api)
- Day 5-7: Test all services on new domain

### Week 2: Redirect Implementation  
- Day 1-3: Implement Cloudflare redirects for elevateforhumanity.org
- Day 4-5: Update application configurations
- Day 6-7: Test redirect flows

### Week 3: Service Migration
- Day 1-2: Update Supabase URLs
- Day 3-4: Update Stripe configuration
- Day 5-7: End-to-end testing

### Week 4: Monitoring & Optimization
- Monitor redirect performance
- Check SEO impact
- Optimize any issues

## Long-term Maintenance

### Annual Tasks:
- Renew SSL certificates
- Review redirect performance
- Monitor for broken links

### Monitoring:
- Set up alerts for domain resolution issues
- Monitor redirect response times
- Track SEO rankings for both domains

## Fallback Strategy

If issues arise:
1. **Immediate**: Switch DNS back to previous configuration
2. **Short-term**: Use both domains independently while troubleshooting
3. **Long-term**: Consider domain consolidation timeline

## Cost Considerations

### Ongoing Costs:
- Domain renewals: ~$20/year each
- Cloudflare Pro (optional): $20/month for advanced features
- SSL certificates: Free with Cloudflare

### One-time Costs:
- Migration effort: ~40 hours
- Testing and validation: ~20 hours

## Success Metrics

- ✅ All redirects return 301 status
- ✅ No broken links or 404s
- ✅ SSL certificates valid on all domains
- ✅ Application functionality preserved
- ✅ SEO rankings maintained or improved
- ✅ User experience seamless across domains