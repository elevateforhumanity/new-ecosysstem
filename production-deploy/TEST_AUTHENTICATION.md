# Authentication Testing Guide

## 🧪 Testing the Authentication Flow

This guide helps you verify that the Supabase Google SSO and Netlify Edge Function protection are working correctly.

---

## 🔍 Pre-Deployment Testing

### 1. File Structure Verification
Ensure all files are in place:
```
production-deploy/
├── netlify.toml ✅
├── public/
│   ├── index.html ✅
│   ├── login.html ✅
│   ├── login-callback.html ✅
│   ├── styles.css ✅
│   ├── portal/index.html ✅
│   ├── lms/index.html ✅
│   ├── enroll/index.html ✅
│   └── policies/ ✅
└── netlify/edge-functions/require-auth.ts ✅
```

### 2. Environment Variables Check
Before deploying, verify you have:
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY  
- [ ] SUPABASE_URL (for edge functions)
- [ ] SUPABASE_ANON_KEY (for edge functions)
- [ ] NODE_VERSION=22

---

## 🚀 Post-Deployment Testing

### Test 1: Public Pages (Should Work Without Auth)
Visit these URLs - they should load normally:
- [ ] `https://your-domain.com/` - Home page
- [ ] `https://your-domain.com/login.html` - Login page
- [ ] `https://your-domain.com/policies/eo.html` - Equal Opportunity page
- [ ] `https://your-domain.com/policies/grievance.html` - Grievance procedures
- [ ] `https://your-domain.com/policies/veterans.html` - Veterans priority
- [ ] `https://your-domain.com/policies/accessibility.html` - Accessibility statement

**Expected Result**: All pages load without requiring authentication.

### Test 2: Protected Pages (Should Redirect to Login)
Visit these URLs while NOT signed in:
- [ ] `https://your-domain.com/portal/` - Should redirect to login
- [ ] `https://your-domain.com/lms/` - Should redirect to login  
- [ ] `https://your-domain.com/enroll/` - Should redirect to login
- [ ] `https://your-domain.com/dashboard/` - Should redirect to login

**Expected Result**: All protected URLs should redirect to `/login.html?redirect=/original-path`

### Test 3: Google OAuth Flow
1. [ ] Visit `/login.html`
2. [ ] Click "Sign in with Google" button
3. [ ] Should redirect to Google OAuth consent screen
4. [ ] Complete Google sign-in
5. [ ] Should redirect back to `/login-callback.html`
6. [ ] Should show "Signing you in..." message
7. [ ] Should redirect to intended destination (e.g., `/portal/`)

**Expected Result**: Smooth OAuth flow with proper redirects.

### Test 4: Protected Access After Sign-In
After completing Google sign-in:
- [ ] Visit `https://your-domain.com/portal/` - Should show dashboard
- [ ] Visit `https://your-domain.com/lms/` - Should show learning management
- [ ] Visit `https://your-domain.com/enroll/` - Should show enrollment system
- [ ] User info should display correctly on portal page

**Expected Result**: All protected pages accessible, user information displayed.

### Test 5: Sign Out Functionality
1. [ ] Click "Sign Out" button on any protected page
2. [ ] Should redirect to home page
3. [ ] Try accessing `/portal/` again - should redirect to login

**Expected Result**: Sign out clears session and re-protects pages.

---

## 🔧 Troubleshooting Common Issues

### Issue: "Invalid redirect URL" Error
**Symptoms**: OAuth fails with redirect URL error
**Solution**: 
1. Check Supabase Authentication → URL Configuration
2. Ensure your domain is in "Site URL" and "Additional Redirect URLs"
3. Add: `https://your-domain.com/login-callback.html`

### Issue: Protected Pages Don't Redirect
**Symptoms**: Can access `/portal/` without signing in
**Solutions**:
1. Check Netlify Functions tab for edge function deployment
2. Verify `netlify.toml` is in root directory
3. Check environment variables are set for edge functions (without VITE_ prefix)

### Issue: "Authentication service not configured"
**Symptoms**: Login page shows configuration error
**Solutions**:
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
2. Check environment variable names (case-sensitive)
3. Redeploy after setting variables

### Issue: OAuth Callback Loops
**Symptoms**: Stuck on login-callback.html page
**Solutions**:
1. Check browser console for JavaScript errors
2. Verify Supabase project is active and accessible
3. Check Google OAuth configuration in Google Cloud Console

### Issue: Edge Function Authentication Fails
**Symptoms**: Get redirected to login even when signed in
**Solutions**:
1. Check Netlify Functions logs for errors
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY (server variables) are set
3. Ensure cookie is being set properly in login-callback.html

---

## 📊 Testing Checklist

### Basic Functionality
- [ ] Home page loads correctly
- [ ] Login page displays Google sign-in button
- [ ] Protected routes redirect to login when not authenticated
- [ ] Google OAuth flow completes successfully
- [ ] Protected routes accessible after authentication
- [ ] User information displays correctly
- [ ] Sign out functionality works
- [ ] Re-authentication required after sign out

### Accessibility Testing
- [ ] Tab navigation works through all pages
- [ ] Focus indicators are visible
- [ ] Screen reader compatibility (test with NVDA/VoiceOver)
- [ ] Color contrast meets WCAG AA standards
- [ ] All images have appropriate alt text
- [ ] Form labels are properly associated

### Mobile Testing
- [ ] All pages display correctly on mobile devices
- [ ] Touch targets are at least 44px
- [ ] Text is readable without zooming
- [ ] Navigation works on small screens
- [ ] OAuth flow works on mobile browsers

### Security Testing
- [ ] CSP headers are applied (check browser dev tools)
- [ ] HTTPS is enforced
- [ ] No mixed content warnings
- [ ] Authentication tokens are handled securely
- [ ] Protected routes cannot be bypassed

---

## 🎯 Success Criteria

Your authentication system is working correctly when:

1. **Public pages** load without authentication
2. **Protected pages** require sign-in
3. **Google OAuth** completes successfully  
4. **User sessions** persist across page loads
5. **Sign out** properly clears authentication
6. **Edge functions** protect routes effectively
7. **No console errors** in browser dev tools
8. **Mobile compatibility** works across devices

---

## 📞 Getting Help

If tests fail:

1. **Check Netlify Deploy Logs** - Look for build/deployment errors
2. **Check Netlify Functions Logs** - Look for edge function errors  
3. **Check Browser Console** - Look for JavaScript errors
4. **Check Supabase Logs** - Look for authentication errors
5. **Verify Environment Variables** - Ensure all are set correctly

**Support Contact**: support@elevateforhumanity.org

---

## 🔄 Continuous Testing

After initial deployment, test regularly:
- [ ] **Weekly**: Basic authentication flow
- [ ] **Monthly**: Full accessibility audit
- [ ] **Quarterly**: Security header verification
- [ ] **After updates**: Complete testing checklist

This ensures your authentication system remains secure and functional over time.