# 🏗️ DURABLE SETUP CHECKLIST

## What Goes in a Durable Setup:

### 🎯 **Primary Domain Strategy**
Choose ONE primary domain and stick with it:
- **elevate4humanity.org** (recommended - shorter, cleaner)
- All services point to this domain
- All marketing uses this domain
- All SEO authority flows here

### 🔄 **Redirect Strategy**
All other domains redirect to primary:
- **elevateforhumanity.org** → **elevate4humanity.org** (301 redirect)
- **www.elevateforhumanity.org** → **www.elevate4humanity.org** (301 redirect)
- Any typos/variations → primary domain

### 🌐 **Subdomain Architecture**
Consistent subdomain structure:
```
elevate4humanity.org → Wix main site
www.elevate4humanity.org → Wix main site
app.elevate4humanity.org → Netlify application
api.elevate4humanity.org → API endpoints
auth.elevate4humanity.org → Supabase Auth
studio.elevate4humanity.org → Gitpod workspace
enterprise.elevate4humanity.org → Enterprise portal
```

### 🔒 **SSL/TLS Strategy**
- **Cloudflare Universal SSL** for all subdomains
- **Automatic HTTPS redirects** enabled
- **HSTS headers** for security
- **Certificate transparency** monitoring

### 📊 **Analytics Consolidation**
- **Single Google Analytics** property for main domain
- **Subdomain tracking** configured properly
- **Cross-domain tracking** for user journeys
- **Unified reporting** across all properties

### 🔧 **Technical Durability**

#### DNS Configuration:
```
# Primary Records (elevate4humanity.org)
A @ → [Wix IP] (unproxied)
CNAME www → elevate4humanity.org (unproxied)
CNAME app → [netlify-site].netlify.app (proxied)
CNAME api → [api-endpoint] (proxied)
CNAME auth → [supabase-domain] (unproxied)
CNAME studio → [tunnel-id].cfargotunnel.com (proxied)

# Redirect Records (elevateforhumanity.org)
A @ → 192.0.2.1 (proxied)
CNAME www → elevateforhumanity.org (proxied)
+ Cloudflare Redirect Rules → elevate4humanity.org
```

#### Email Configuration:
```
MX records for professional email
SPF, DKIM, DMARC for deliverability
Consistent sender domains
```

#### Backup Strategy:
```
DNS zone file backups
Configuration documentation
Recovery procedures
Monitoring alerts
```

### 🎨 **Brand Consistency**
- **Logo/branding** uses primary domain
- **Marketing materials** reference primary domain
- **Social media** profiles use primary domain
- **Business cards/print** use primary domain

### 📈 **SEO Durability**
- **301 redirects** preserve link equity
- **Canonical URLs** point to primary domain
- **Sitemap** submitted for primary domain
- **Schema markup** uses primary domain
- **Internal linking** uses primary domain

### 🔄 **Service Integration**
All services configured with primary domain:

#### Wix:
- Connected to elevate4humanity.org
- Custom domain verified
- SSL certificate active

#### Supabase:
- Site URL: https://app.elevate4humanity.org
- Redirect URLs include all subdomains
- CORS configured for all origins

#### Stripe:
- Success URL: https://app.elevate4humanity.org/success
- Cancel URL: https://app.elevate4humanity.org/cancel
- Webhook endpoint: https://api.elevate4humanity.org/stripe

#### Netlify:
- Custom domain: app.elevate4humanity.org
- SSL certificate: Cloudflare managed
- Headers configured for embedding

### 🛡️ **Security Durability**
- **API tokens** with minimal required permissions
- **Environment variables** properly secured
- **CORS policies** restrictive but functional
- **CSP headers** allow necessary origins
- **Rate limiting** configured appropriately

### 📋 **Documentation Durability**
- **Setup procedures** documented
- **Recovery procedures** documented
- **API credentials** securely stored
- **Configuration changes** tracked
- **Contact information** updated

### 🔄 **Maintenance Strategy**
- **Regular SSL certificate checks**
- **DNS propagation monitoring**
- **Uptime monitoring** for all services
- **Performance monitoring**
- **Security scanning**

### 🎯 **Migration Strategy**
If you ever need to change:
- **Gradual migration** with overlapping periods
- **301 redirects** from old to new
- **Analytics tracking** during transition
- **User communication** about changes
- **Rollback procedures** if needed

## ✅ Durable Setup Benefits:

1. **SEO Authority** - All link equity flows to one domain
2. **Brand Recognition** - Users remember one domain
3. **Easier Management** - One primary domain to maintain
4. **Better Analytics** - Consolidated traffic data
5. **Professional Image** - Consistent brand presence
6. **Future-Proof** - Easy to scale and modify
7. **Cost Effective** - Fewer SSL certificates and services
8. **User Experience** - No confusion about which domain to use

## 🚀 Implementation with Your Autopilot:

Your `efh-autopilot.sh` can set up the entire durable architecture:

```bash
./efh-autopilot.sh
# Choose: Wix DNS (primary domain)
# Choose: Cloudflare redirect (secondary domain)
# Choose: Supabase custom domain
# Choose: Gitpod tunnel
```

**Result: Complete durable setup in one run!** 🎯