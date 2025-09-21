# Wix Domain Connection Plan for Selfish Inch

## Current Situation Analysis
- **Existing Setup**: Wix pages for "selfish inch" are already created
- **Goal**: Connect main home page to a separate external domain
- **Current Domain**: Likely using temporary Wix subdomain (e.g., username.wixsite.com/sitename)

## Domain Connection Strategy

### Phase 1: Preparation (Day 1)
1. **Domain Requirements Check**
   - ✅ Verify you own the external domain
   - ✅ Ensure domain registrar access (GoDaddy, Namecheap, etc.)
   - ✅ Confirm Wix Premium plan (required for custom domains)
   - ✅ Backup current Wix site settings

2. **DNS Access Verification**
   - Access domain registrar control panel
   - Locate DNS management section
   - Document current DNS records (for backup)

### Phase 2: Wix Configuration (Day 1-2)
1. **Connect Domain in Wix**
   ```
   Wix Dashboard → Settings → Domains → Connect a Domain You Already Own
   ```

2. **Domain Connection Options**
   
   **Option A: Full Domain Connection (Recommended)**
   - Connect `yourdomain.com` directly to Wix
   - All traffic goes to Wix site
   - Best for SEO and branding
   
   **Option B: Subdomain Connection**
   - Connect `app.yourdomain.com` or `portal.yourdomain.com` to Wix
   - Keep main domain for other purposes
   - Good for segmented approach
   
   **Option C: Path-Based Setup**
   - Use `yourdomain.com/app` redirecting to Wix
   - Requires additional redirect setup

### Phase 3: DNS Configuration (Day 2)

#### For Full Domain Connection:
```dns
# A Records (if using Wix IP addresses)
@ (root)    A    23.235.33.229
www         A    23.235.33.229

# OR CNAME Records (if using Wix domains)
www         CNAME    username.wixsite.com
```

#### For Subdomain Connection:
```dns
# CNAME Record for subdomain
app         CNAME    username.wixsite.com
portal      CNAME    username.wixsite.com
```

### Phase 4: SSL Certificate Setup (Day 2-3)
1. **Automatic SSL through Wix**
   - Wix provides free SSL certificates
   - Automatically configured after domain connection
   - Usually takes 24-72 hours to activate

2. **Verification Steps**
   - Check SSL certificate status in Wix dashboard
   - Test HTTPS access
   - Verify redirect from HTTP to HTTPS

### Phase 5: Testing & Verification (Day 3-4)
1. **Domain Propagation Check**
   - Use tools like `whatsmydns.net` to check global propagation
   - Test from different locations/devices
   - Verify both www and non-www versions work

2. **Functionality Testing**
   - Test all pages and navigation
   - Verify forms and interactive elements
   - Check mobile responsiveness
   - Test payment/enrollment systems

## Implementation Checklist

### Pre-Implementation
- [ ] Backup current Wix site
- [ ] Document current domain DNS settings
- [ ] Verify Wix Premium plan active
- [ ] Prepare domain registrar access

### Wix Dashboard Setup
- [ ] Navigate to Wix Dashboard → Settings → Domains
- [ ] Click "Connect a Domain You Already Own"
- [ ] Enter target domain name
- [ ] Choose connection method (full domain vs subdomain)
- [ ] Note DNS instructions provided by Wix

### DNS Configuration
- [ ] Log into domain registrar
- [ ] Navigate to DNS management
- [ ] Add/modify A records or CNAME records as instructed
- [ ] Save DNS changes
- [ ] Wait for propagation (24-72 hours)

### Post-Connection
- [ ] Verify domain connection in Wix dashboard
- [ ] Test website access via new domain
- [ ] Check SSL certificate activation
- [ ] Update any hardcoded links
- [ ] Test all functionality
- [ ] Update Google Analytics/Search Console
- [ ] Notify users of domain change

## Technical Requirements

### Wix Plan Requirements
- **Minimum**: Wix Premium Plan (Connect Domain plan or higher)
- **Recommended**: Unlimited or VIP plan for better performance
- **Cost**: Starting at $14/month for Connect Domain plan

### Domain Registrar Compatibility
- ✅ GoDaddy
- ✅ Namecheap
- ✅ Google Domains
- ✅ Cloudflare
- ✅ Most major registrars

### DNS Record Types Needed
```
Type    Name    Value                   TTL
A       @       23.235.33.229          3600
A       www     23.235.33.229          3600
CNAME   *       username.wixsite.com   3600
```

## Troubleshooting Guide

### Common Issues & Solutions

1. **Domain Not Connecting**
   - Verify DNS records are correct
   - Check for typos in domain name
   - Ensure 24-72 hour propagation time
   - Clear browser cache and DNS cache

2. **SSL Certificate Issues**
   - Wait full 72 hours for automatic SSL
   - Check domain verification in Wix
   - Ensure www and non-www both point to Wix

3. **Redirect Loops**
   - Check for conflicting redirects
   - Verify DNS records don't conflict
   - Clear all caches

4. **Site Not Loading**
   - Verify Wix site is published
   - Check domain connection status
   - Test with different browsers/devices

## Alternative Solutions

### If Direct Connection Fails:

1. **Domain Forwarding**
   ```
   Set up 301 redirect from yourdomain.com to username.wixsite.com
   ```

2. **Reverse Proxy Setup**
   ```
   Use Cloudflare or similar service to proxy requests
   ```

3. **Iframe Integration**
   ```html
   <!-- Embed Wix site in existing domain -->
   <iframe src="https://username.wixsite.com/sitename" 
           width="100%" height="100%" frameborder="0">
   </iframe>
   ```

## Timeline Expectations

- **Day 1**: Wix configuration and DNS changes
- **Day 2-3**: DNS propagation and SSL activation
- **Day 4**: Final testing and verification
- **Day 5**: Go-live and monitoring

## Success Metrics

- [ ] Domain resolves to Wix site
- [ ] SSL certificate active and valid
- [ ] All pages load correctly
- [ ] Forms and functionality work
- [ ] Mobile responsiveness maintained
- [ ] SEO elements preserved
- [ ] Analytics tracking functional

## Next Steps

1. **Immediate Actions**:
   - Verify Wix Premium plan
   - Gather domain registrar credentials
   - Choose connection method (full domain vs subdomain)

2. **Implementation**:
   - Follow Phase 1-5 implementation plan
   - Monitor progress daily
   - Test thoroughly before announcing

3. **Post-Launch**:
   - Monitor site performance
   - Update marketing materials
   - Inform stakeholders of new domain

## Support Resources

- **Wix Support**: Available 24/7 for Premium users
- **Domain Registrar Support**: For DNS-related issues
- **DNS Propagation Checker**: whatsmydns.net
- **SSL Checker**: ssllabs.com/ssltest

---

**Note**: This plan assumes you want to connect an external domain to your existing Wix site. If you need to migrate content FROM Wix TO another platform, that would require a different approach.