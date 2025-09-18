# 🔒 Netlify Security Settings Checklist

## 🔍 How to Check Your Netlify Security Settings

### 1. **Access Your Netlify Dashboard**
- Go to: https://app.netlify.com
- Login to your account
- Select your site

### 2. **Security Settings to Check**

#### **Site Settings → Security**
```
✅ HTTPS Enforcement
   - Force HTTPS: Should be ENABLED
   - HSTS Header: Recommended ENABLED

✅ Access Control
   - Password Protection: Check if needed
   - Role-based Access: Review permissions

✅ Environment Variables
   - Check for exposed secrets
   - Ensure sensitive data is properly masked
```

#### **Site Settings → Environment Variables**
```
🔐 Critical Variables to Secure:
   - SUPABASE_SERVICE_ROLE_KEY (should be hidden)
   - NETLIFY_AUTH_TOKEN (should be hidden)
   - Any API keys or secrets

⚠️  Variables that can be public:
   - SUPABASE_URL (public)
   - SUPABASE_ANON_KEY (public - designed for client-side)
   - BASE_URL (public)
```

#### **Site Settings → Build & Deploy**
```
✅ Deploy Contexts
   - Production branch: main/master
   - Deploy previews: Check if enabled
   - Branch deploys: Review settings

✅ Build Hooks
   - Secure webhook URLs
   - Limited access tokens
```

### 3. **Headers & Security Policies**

#### **Check _headers file:**
```
# Security Headers (should be in your _headers file)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self' https://kkzbqkyuunahdxcfdfzv.supabase.co
```

#### **Check netlify.toml:**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 4. **Domain & DNS Security**

#### **Domain Settings:**
```
✅ Custom Domain
   - HTTPS certificate: Auto-renewed
   - DNS configuration: Secure

✅ Redirects
   - HTTP to HTTPS: Enabled
   - www to non-www (or vice versa): Configured
```

### 5. **Access & Team Security**

#### **Team Settings:**
```
✅ Team Members
   - Review who has access
   - Check permission levels
   - Remove unused accounts

✅ Deploy Keys
   - Review active deploy keys
   - Rotate if necessary
```

### 6. **Monitoring & Logs**

#### **Analytics & Logs:**
```
✅ Access Logs
   - Monitor for suspicious activity
   - Check for unusual traffic patterns

✅ Deploy Logs
   - Review build logs for exposed secrets
   - Check for failed deployments
```

## 🚨 **Security Red Flags to Look For:**

### **Immediate Action Required:**
- ❌ Exposed service role keys in environment variables
- ❌ HTTP-only sites (no HTTPS)
- ❌ Missing security headers
- ❌ Public access to admin functions
- ❌ Hardcoded secrets in code

### **Best Practices:**
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS enforcement
- ✅ Set up proper CORS policies
- ✅ Regular security audits
- ✅ Monitor access logs

## 🔧 **Quick Security Commands**

### **Check Current Headers:**
```bash
curl -I https://your-site.netlify.app
```

### **Test HTTPS Enforcement:**
```bash
curl -I http://your-site.netlify.app
# Should redirect to HTTPS
```

### **Validate Environment Variables:**
```bash
# In Netlify CLI
netlify env:list
```

## 📋 **Your EFH Platform Security Status**

Based on our deployment, your platform should have:

✅ **Secure Configuration:**
- HTTPS enforcement via netlify.toml
- Security headers configured
- Environment variables properly set
- Supabase integration secured

✅ **Protected Secrets:**
- Service role key in environment variables
- Database password secured
- Access tokens protected

✅ **Secure Defaults:**
- CORS properly configured for Supabase
- API endpoints secured
- Client-side keys appropriately public

## 🎯 **Action Items:**

1. **Login to Netlify Dashboard**
2. **Go to Site Settings → Security**
3. **Review Environment Variables**
4. **Check HTTPS Settings**
5. **Verify Team Access**
6. **Test Security Headers**

Would you like me to help you with any specific security configuration once you've checked your dashboard?