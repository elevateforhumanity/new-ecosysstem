# 🌐 DNS & CDN Configuration Guide

## ⚠️ CRITICAL: Avoid Double CDN Issues

**Problem**: Cloudflare proxying in front of Netlify causes cache/header conflicts.

**Solution**: Choose ONE CDN approach:

### Option 1: Netlify CDN Only (Recommended)
```
✅ Cloudflare DNS: Grey cloud (DNS only)
✅ Netlify: Primary CDN
✅ No conflicts, optimal performance
```

**Steps:**
1. In Cloudflare Dashboard → DNS
2. Set A/CNAME records to **DNS Only (grey cloud)**
3. Let Netlify handle all CDN/caching

### Option 2: Cloudflare Proxy (Advanced)
If you must use Cloudflare proxy:

**Page Rules in Cloudflare:**
```
elevateforhumanity.org/*
- Cache Level: Respect Existing Headers
- Browser Cache TTL: Respect Existing Headers
- Disable: HTML Minification, Auto Minify CSS/JS
- Disable: Rocket Loader, Mirage
```

**Transform Rules:**
```
Skip all transforms for:
- Content-Type contains "text/html"
- Host equals "elevateforhumanity.org"
```

## 🎯 Recommended DNS Setup

### Cloudflare DNS Records (Grey Cloud)
```
Type: CNAME
Name: elevateforhumanity.org
Target: your-site.netlify.app
Proxy: DNS Only (grey cloud)

Type: CNAME  
Name: www
Target: elevateforhumanity.org
Proxy: DNS Only (grey cloud)
```

### Netlify Domain Settings
```
Primary domain: elevateforhumanity.org
Redirect: www.elevateforhumanity.org → elevateforhumanity.org
HTTPS: Force HTTPS
```

## 🔧 Verification Commands

Test your setup:
```bash
# Check CDN headers
curl -I https://elevateforhumanity.org

# Should show:
# server: Netlify
# x-nf-request-id: [present]
# cache-control: [your settings]

# NOT:
# server: cloudflare
# cf-ray: [present]
```

## 📊 Performance Benefits

**Single CDN (Netlify):**
- ✅ Consistent cache behavior
- ✅ Proper header handling
- ✅ Optimal On-Demand Builder performance
- ✅ No cache conflicts

**Double CDN Issues:**
- ❌ Cache misses
- ❌ Header conflicts
- ❌ Slower performance
- ❌ Debugging complexity