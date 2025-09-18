# 🚀 NETLIFY AUTOPILOT: WWW SUBDOMAIN FIX

## 🎯 **AUTOMATED SOLUTION**

Since you want autopilot mode, here's the fastest path:

### **Option 1: Netlify Dashboard (2 minutes)**
1. **Go to**: https://app.netlify.com/
2. **Find site**: elevateforhumanity.org
3. **Click**: Site settings → Domain management
4. **Click**: "Add custom domain"
5. **Enter**: `www.elevateforhumanity.org`
6. **Select**: "Redirect to primary domain"
7. **Save** ✅

### **Option 2: Deploy _redirects File (Instant)**

I can create the redirect file for you right now:

```bash
# This will be deployed automatically
echo "https://www.elevateforhumanity.org/* https://elevateforhumanity.org/:splat 301!" > _redirects
```

### **Option 3: CLI Commands (After Login)**

```bash
# Login first (opens browser)
netlify login

# List your sites
netlify sites:list

# Add domain alias
netlify domains:create www.elevateforhumanity.org --site-id YOUR_SITE_ID

# Set up redirect
netlify domains:redirect www.elevateforhumanity.org elevateforhumanity.org
```

## 🔥 **FASTEST AUTOPILOT SOLUTION**

**I recommend Option 1** - just go to Netlify dashboard and add the www domain. Takes 2 minutes and fixes everything automatically.

## 🧪 **VERIFICATION**

After any option, test with:
```bash
curl -I https://www.elevateforhumanity.org
# Should return: HTTP/2 301 location: https://elevateforhumanity.org/
```

## ⚡ **STATUS**
- ✅ Netlify CLI installed
- ⚠️ Authentication needed (requires browser)
- 🎯 Ready for manual dashboard fix

**Choose your preferred option and I'll help verify it works!**