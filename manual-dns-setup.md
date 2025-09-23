# 🔧 MANUAL DNS SETUP (If API Token Issues Persist)

## If you prefer to input DNS manually in Cloudflare dashboard:

### 1. DNS Records for elevateforhumanity.org:

**In Cloudflare Dashboard → DNS → Records:**

```
Type: A
Name: @
Value: 192.0.2.1
Proxy: ON (Orange Cloud)
TTL: Auto

Type: CNAME  
Name: www
Value: elevateforhumanity.org
Proxy: ON (Orange Cloud)
TTL: Auto
```

### 2. Redirect Rules:

**In Cloudflare Dashboard → Rules → Redirect Rules:**

```
Rule Name: Redirect to elevate4humanity.org

When incoming requests match:
- Field: Hostname
- Operator: equals  
- Value: elevateforhumanity.org

Then:
- Type: Static
- URL: https://elevate4humanity.org
- Status Code: 301
- Preserve query string: Yes
```

**Add second rule for www:**

```
Rule Name: WWW Redirect to elevate4humanity.org

When incoming requests match:
- Field: Hostname
- Operator: equals
- Value: www.elevateforhumanity.org

Then:
- Type: Static  
- URL: https://www.elevate4humanity.org
- Status Code: 301
- Preserve query string: Yes
```

### 3. Test After Setup:

```bash
./test-autopilot-redirect.sh
```

Or manually:
```bash
curl -I https://elevateforhumanity.org
curl -I https://www.elevateforhumanity.org
```

Expected: HTTP/2 301 with Location header pointing to elevate4humanity.org

### 4. Production Note:

⚠️ **Replace 192.0.2.1 with your real IP:**
- If pointing to Wix: Use Wix's provided IP
- If pointing to Netlify: Use Netlify's IP  
- If pointing to your server: Use your server's IP

**This manual setup achieves the same result as the autopilot!** 🎯