# 🌐 NETLIFY WWW SUBDOMAIN FIX

## 📊 CURRENT STATUS
- ✅ `elevateforhumanity.org` - Working perfectly (TLS 1.3)
- ❌ `www.elevateforhumanity.org` - SSL handshake failure
- 🏠 **Hosting**: Netlify (confirmed by headers)

## 🚀 NETLIFY DASHBOARD FIX

### Option 1: Add WWW Domain in Netlify
1. **Go to**: https://app.netlify.com/
2. **Login** to your Netlify account
3. **Find your site**: elevateforhumanity.org
4. **Go to**: Site settings → Domain management
5. **Click**: "Add custom domain"
6. **Enter**: `www.elevateforhumanity.org`
7. **Choose**: "Redirect to primary domain" (recommended)
8. **Save** and wait 5-10 minutes

### Option 2: DNS Redirect (If you control DNS)
1. **Go to your DNS provider** (where you bought the domain)
2. **Add CNAME record**:
   - Name: `www`
   - Value: `elevateforhumanity.org`
3. **Or add redirect rule**:
   - From: `www.elevateforhumanity.org`
   - To: `https://elevateforhumanity.org`
   - Type: 301 Permanent

## 🔧 NETLIFY _REDIRECTS FILE FIX

If you can't access Netlify dashboard, add this to your site:

**Create file: `_redirects`**
```
# Redirect www to non-www
https://www.elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!
http://www.elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!
```

**Or create file: `netlify.toml`**
```toml
[[redirects]]
  from = "https://www.elevateforhumanity.org/*"
  to = "https://elevateforhumanity.org/:splat"
  status = 301
  force = true

[[redirects]]
  from = "http://www.elevateforhumanity.org/*"
  to = "https://elevateforhumanity.org/:splat"
  status = 301
  force = true
```

## 🧪 TEST AFTER CHANGES

```bash
curl -I https://www.elevateforhumanity.org
```

Should return:
```
HTTP/2 301
location: https://elevateforhumanity.org/
```

## ⏰ TIMING

- **Netlify dashboard changes**: 5-10 minutes
- **DNS changes**: 15 minutes to 24 hours
- **_redirects file**: Immediate (next deploy)

## 🎯 RECOMMENDED SOLUTION

**Use Netlify dashboard** to add `www.elevateforhumanity.org` as a custom domain with redirect. This is the cleanest and most reliable solution.

---

**Your main domain SSL is perfect - just need to handle the www subdomain properly in Netlify!**