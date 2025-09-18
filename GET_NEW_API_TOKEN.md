# 🔑 GET NEW CLOUDFLARE API TOKEN

Your current token isn't working. Here's how to get a new one:

## 📋 STEP-BY-STEP TOKEN CREATION

### 1. Go to Cloudflare API Tokens Page
```
https://dash.cloudflare.com/profile/api-tokens
```

### 2. Create Custom Token
1. Click **"Create Token"**
2. Click **"Get started"** next to **"Custom token"**

### 3. Configure Token Permissions
Set these **exact** permissions:

**Permissions:**
- `Zone` : `Zone` : `Edit`
- `Zone` : `Zone Settings` : `Edit`
- `Zone` : `Page Rules` : `Edit`

**Zone Resources:**
- `Include` : `Specific zone` : `elevateforhumanity.org`

**Client IP Address Filtering:**
- Leave blank (or add your current IP if you want extra security)

### 4. Create and Copy Token
1. Click **"Continue to summary"**
2. Click **"Create Token"**
3. **COPY THE TOKEN IMMEDIATELY** (you won't see it again)

### 5. Test the New Token
Replace `YOUR_NEW_TOKEN_HERE` with the token you just copied:

```bash
export CLOUDFLARE_API_TOKEN="YOUR_NEW_TOKEN_HERE"
node autopilot-cloudflare-ssl-fix.cjs
```

---

## 🚀 ALTERNATIVE: MANUAL FIX (FASTER)

If you don't want to mess with API tokens, just do this manually:

1. **Go to**: https://dash.cloudflare.com/
2. **Click**: elevateforhumanity.org
3. **Go to**: SSL/TLS → Overview
4. **Change**: SSL mode to **"Full"**
5. **Turn ON**: "Always Use HTTPS"
6. **Wait**: 5 minutes

**This will fix your SSL issue immediately.**

---

## 🔍 WHY YOUR TOKEN FAILED

The token `B6Ei4OLJoHTzXykbr6zO6cP0HqhcW-p7cgzaIIm3` is either:
- ❌ Expired
- ❌ Wrong permissions
- ❌ Revoked
- ❌ Not associated with the right domain

A fresh token with the right permissions will work.

---

## ⚡ QUICK DECISION

**Want it fixed in 2 minutes?** → Manual fix in Cloudflare dashboard  
**Want to use autopilot?** → Create new API token with correct permissions

Both will solve your SSL problem!