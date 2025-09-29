# 🚨 DEPLOY SUBDOMAIN CONFIGURATION FIX

## 🔍 **CURRENT PROBLEM**
Your deploy subdomains show malformed URLs:
- ❌ `deploy-preview-123.elevateforhumanity.org.elevateforhumanity.org`
- ❌ `branch-name.elevateforhumanity.org.elevateforhumanity.org`

## 🎯 **EXACT FIX**

### **Step 1: Clear Current Configuration**
1. **Clear the fields** showing `elevateforhumanity.org`
2. **Leave them EMPTY** for now
3. **Click Save**

### **Step 2: Set Correct Subdomain Base**
1. **For Deploy Previews**: Leave the field **completely empty**
2. **For Branch Deploys**: Leave the field **completely empty**
3. **Click Save**

### **Step 3: Expected Result**
After clearing, the subdomains should show:
- ✅ `deploy-preview-123--sitename.cloudflare.app`
- ✅ `branch-name--sitename.cloudflare.app`

### **Step 4: Re-enable Custom Subdomains (Optional)**
Only AFTER the SSL issue is fixed:
1. **Add custom domain for deploy previews**: `elevateforhumanity.org`
2. **Add custom domain for branch deploys**: `elevateforhumanity.org`

## 🚨 **WHY THIS HAPPENS**
The double domain issue occurs when:
- Primary domain configuration is incorrect
- Subdomain base is set before SSL is properly configured
- There's a conflict between www and non-www settings

## ✅ **IMMEDIATE ACTION**
1. **Clear both subdomain fields** (make them empty)
2. **Click Save**
3. **Go back to main domain settings**
4. **Fix the primary domain configuration**
5. **Add www as redirect to primary**

## 🧪 **VERIFICATION**
After clearing the fields, check if:
```bash
curl -I https://www.elevateforhumanity.org
```
Works without SSL handshake failure.

**Clear the subdomain fields first, then fix the main domain configuration!**