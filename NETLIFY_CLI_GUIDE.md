# 🔧 NETLIFY CLI STEP-BY-STEP GUIDE

## 🚀 **QUICK COMMANDS**

### **1. Setup (One-time)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login (opens browser)
netlify login

# Link to your site (if not already linked)
netlify link
```

### **2. Fix WWW Domain**
```bash
# Add www subdomain
netlify domains:create www.elevateforhumanity.org

# Deploy current config
netlify deploy --prod

# Test the fix
curl -I https://www.elevateforhumanity.org
```

### **3. Alternative Commands**
```bash
# List current domains
netlify domains:list

# Check site status
netlify status

# Force redeploy
netlify deploy --prod --dir=.
```

## 🎯 **AUTOMATED SCRIPT**

Run the provided script:
```bash
./fix-www-domain.sh
```

## 🔍 **TROUBLESHOOTING**

### **If "netlify login" fails:**
```bash
# Try manual token
netlify login --new

# Or use browser manually
open https://app.netlify.com/user/applications
```

### **If domain already exists:**
```bash
# Check current domains
netlify domains:list

# Remove and re-add
netlify domains:delete www.elevateforhumanity.org
netlify domains:create www.elevateforhumanity.org
```

### **If SSL still fails:**
```bash
# Force SSL renewal
netlify api refreshSiteDomain --site-id=YOUR_SITE_ID --domain=www.elevateforhumanity.org

# Or wait 10 minutes for automatic provisioning
```

## 📋 **VERIFICATION COMMANDS**

```bash
# Test main domain
curl -I https://elevateforhumanity.org

# Test www domain
curl -I https://www.elevateforhumanity.org

# Should return 301 redirect to main domain
```

## ⚡ **FASTEST METHOD**

**Still recommend Netlify Dashboard:**
1. https://app.netlify.com/
2. Site settings → Domain management
3. Add custom domain: `www.elevateforhumanity.org`
4. Select "Redirect to primary domain"

**Takes 2 minutes and works 100% of the time!**