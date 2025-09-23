
# 🚀 MANUAL CLOUDFLARE REDIRECT SETUP

## Step 1: DNS Records for elevateforhumanity.org

In Cloudflare Dashboard → DNS → Records:

```
Type: A
Name: @
Value: 192.0.2.1
Proxy: ON (Orange Cloud)

Type: CNAME
Name: www
Value: elevateforhumanity.org
Proxy: ON (Orange Cloud)
```

## Step 2: Redirect Rules

In Cloudflare Dashboard → Rules → Page Rules:

```
Rule 1:
URL Pattern: *elevateforhumanity.org/*
Setting: Forwarding URL (301 - Permanent Redirect)
Destination: https://elevate4humanity.org/$2

Rule 2:
URL Pattern: elevateforhumanity.org/*
Setting: Forwarding URL (301 - Permanent Redirect)
Destination: https://elevate4humanity.org/$1
```

## Step 3: Test

```bash
curl -I https://elevateforhumanity.org
# Should return: HTTP/2 301
# Location: https://elevate4humanity.org/

curl -I https://www.elevateforhumanity.org
# Should return: HTTP/2 301
# Location: https://www.elevate4humanity.org/
```

## ✅ Success Criteria

- All redirects return 301 status
- Location headers point to elevate4humanity.org
- No 404 or 500 errors
- Redirects work within 24 hours
