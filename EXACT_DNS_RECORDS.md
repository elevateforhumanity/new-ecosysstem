# 🎯 EXACT DNS RECORDS FOR REDIRECT

## For elevateforhumanity.org in Cloudflare:

### DNS Records:
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

### Page Rules (Rules → Page Rules):
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

## Result:
- elevateforhumanity.org → elevate4humanity.org
- www.elevateforhumanity.org → www.elevate4humanity.org
- elevateforhumanity.org/any-page → elevate4humanity.org/any-page

## Test After Setup:
```bash
curl -I https://elevateforhumanity.org
# Expected: HTTP/2 301, Location: https://elevate4humanity.org/

curl -I https://www.elevateforhumanity.org  
# Expected: HTTP/2 301, Location: https://www.elevate4humanity.org/
```

## IP Address: 192.0.2.1
## CNAME Target: elevateforhumanity.org