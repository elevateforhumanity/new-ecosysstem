# 🔒 CLOUDFLARE SSL FIX GUIDE

## The Problem
- ✅ `elevateforhumanity.org` works fine (TLS 1.3)
- ❌ `www.elevateforhumanity.org` fails with SSL handshake error

## Step-by-Step Fix

### 1. Login to Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/
2. Login with your Cloudflare account
3. Select your `elevateforhumanity.org` domain

### 2. Fix SSL/TLS Settings
1. Click **SSL/TLS** in the left sidebar
2. Click **Overview**
3. Set **SSL/TLS encryption mode** to:
   - **"Full"** (if you have a valid SSL cert on your origin server)
   - **"Full (strict)"** (if you have a valid SSL cert from a trusted CA)
   - **NOT "Flexible"** (this causes issues)

### 3. Enable HTTPS Redirects
1. Still in **SSL/TLS** → **Overview**
2. Turn ON **"Always Use HTTPS"**

### 4. Configure Edge Certificates
1. Go to **SSL/TLS** → **Edge Certificates**
2. Make sure these are enabled:
   - ✅ **Always Use HTTPS**: ON
   - ✅ **HTTP Strict Transport Security (HSTS)**: Enable
   - ✅ **Minimum TLS Version**: 1.2
   - ✅ **TLS 1.3**: ON
   - ✅ **Automatic HTTPS Rewrites**: ON

### 5. Check Certificate Coverage
1. In **SSL/TLS** → **Edge Certificates**
2. Look at **"Universal SSL Certificate"**
3. Make sure it covers BOTH:
   - `elevateforhumanity.org`
   - `*.elevateforhumanity.org` (wildcard for subdomains)

### 6. Add Page Rule (Recommended)
1. Go to **Rules** → **Page Rules**
2. Click **"Create Page Rule"**
3. Set URL pattern: `www.elevateforhumanity.org/*`
4. Add setting: **"Forwarding URL"** → **301 Permanent Redirect**
5. Destination URL: `https://elevateforhumanity.org/$1`
6. Save and Deploy

### 7. Wait and Test
1. Changes can take 5-15 minutes to propagate
2. Test both URLs:
   - https://elevateforhumanity.org
   - https://www.elevateforhumanity.org (should redirect to non-www)

## Alternative: Quick DNS Fix

If you want to remove www entirely:
1. Go to **DNS** in Cloudflare
2. Find the **www** CNAME record
3. Delete it or set it to redirect

## Verification

After making changes, test:
```bash
curl -I https://elevateforhumanity.org
curl -I https://www.elevateforhumanity.org
```

Both should return successful HTTPS responses.

## If Still Not Working

1. **Check Origin Server**: Make sure your hosting provider supports SSL
2. **Contact Cloudflare Support**: If you have a paid plan
3. **Try "Pause Cloudflare"**: Temporarily to test direct connection
4. **Check DNS Propagation**: Use https://dnschecker.org/

## Common Issues

- **"Flexible" SSL mode**: Causes infinite redirects
- **Mixed Content**: HTTP resources on HTTPS pages
- **Origin Certificate**: May need to install Cloudflare origin certificate on your server
- **DNS Propagation**: Changes take time to spread globally

---

**The main issue is likely the SSL/TLS encryption mode in Cloudflare. Set it to "Full" and enable "Always Use HTTPS".**