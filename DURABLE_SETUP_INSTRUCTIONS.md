# 🚀 DURABLE SETUP INSTRUCTIONS

## **STEP-BY-STEP GUIDE TO FIX SSL IMMEDIATELY**

---

## **STEP 1: LOGIN TO DURABLE (2 minutes)**

1. **Go to:** https://durable.co/login
2. **Login** with your credentials
3. **Navigate to** your elevateforhumanity.org website
4. **Click "Edit"** or "Customize"

---

## **STEP 2: REPLACE HOMEPAGE CONTENT (3 minutes)**

### **Option A: Full Page Replace (Recommended)**
1. **Go to homepage editor**
2. **Select all content** (Ctrl+A or Cmd+A)
3. **Delete everything**
4. **Switch to HTML/Code view** (look for "</>" or "HTML" button)
5. **Paste the complete code** from `DURABLE_REDIRECT_PAGE.html`

### **Option B: Add to Existing Page**
1. **Go to homepage editor**
2. **Add HTML block** or "Custom Code" section
3. **Paste the redirect script** (just the JavaScript part):

```html
<script>
(function() {
    const targetURL = "https://www.selfishincsupport.org/elevate/";
    try {
        window.location.replace(targetURL);
    } catch(e) {
        window.location.href = targetURL;
    }
})();
</script>
<meta http-equiv="refresh" content="0;url=https://www.selfishincsupport.org/elevate/">
```

---

## **STEP 3: PUBLISH CHANGES (1 minute)**

1. **Click "Save"** or "Publish"
2. **Confirm changes**
3. **Wait for deployment** (usually instant)

---

## **STEP 4: TEST REDIRECT (2 minutes)**

1. **Open new browser tab**
2. **Visit:** https://elevateforhumanity.org
3. **Should immediately redirect** to www.selfishincsupport.org/elevate/
4. **Check SSL certificate** - should show Wix certificate (green lock)

---

## **STEP 5: WIX SETUP (15 minutes)**

### **5.1 Upgrade Wix Plan**
1. **Login to Wix:** https://www.wix.com/my-account
2. **Go to your site:** www.selfishincsupport.org
3. **Upgrade to Business VIP** ($39/month)
4. **Wait for upgrade** to process (2-3 minutes)

### **5.2 Create Elevate Page**
1. **Go to Pages** in Wix editor
2. **Add New Page**
3. **Page name:** "Elevate for Humanity"
4. **URL:** `/elevate/`
5. **Page type:** "Blank" or "Custom"

### **5.3 Upload Your Landing Page**
1. **Add HTML element** to page
2. **Paste your Astro landing page** content from `/dist/index.html`
3. **Or use Wix editor** to recreate your design
4. **Add your content:**
   - WIOA training programs
   - Application forms
   - Contact information
   - Professional styling

### **5.4 Configure Navigation**
1. **Add menu item:** "Training Programs"
2. **Link to:** `/elevate/`
3. **Set as main** education section

---

## **STEP 6: VERIFICATION CHECKLIST**

### **✅ Test Complete Flow:**
- [ ] Visit elevateforhumanity.org
- [ ] Redirects to www.selfishincsupport.org/elevate/
- [ ] SSL certificate shows green lock
- [ ] Page loads professional content
- [ ] Mobile responsive design
- [ ] All links work correctly

### **✅ SEO Verification:**
- [ ] Meta tags present
- [ ] Canonical URL set
- [ ] Page title correct
- [ ] Description optimized

### **✅ Performance Check:**
- [ ] Redirect happens instantly
- [ ] Page loads quickly
- [ ] No error messages
- [ ] Professional appearance

---

## **🎯 EXPECTED RESULTS:**

### **Before Fix:**
❌ elevateforhumanity.org → SSL error, "unsafe" warning  
❌ Visitors see security warnings  
❌ Lost credibility and enrollments  

### **After Fix:**
✅ elevateforhumanity.org → instant redirect  
✅ www.selfishincsupport.org/elevate/ → working SSL  
✅ Professional landing page displayed  
✅ No security warnings  
✅ Students can enroll immediately  

---

## **🔧 TROUBLESHOOTING:**

### **If Redirect Doesn't Work:**
1. **Check Durable editor** - ensure code was saved
2. **Clear browser cache** - Ctrl+F5 or Cmd+Shift+R
3. **Try different browser** - test in incognito mode
4. **Check for errors** - open browser console (F12)

### **If Wix Page Not Loading:**
1. **Verify Business VIP** upgrade completed
2. **Check page URL** - ensure `/elevate/` is correct
3. **Test page directly** - visit www.selfishincsupport.org/elevate/
4. **Review page settings** - ensure page is published

### **If SSL Still Shows Issues:**
1. **Wait 5-10 minutes** - DNS propagation
2. **Clear browser cache** completely
3. **Test from different device** - mobile phone
4. **Check Wix SSL** settings in dashboard

---

## **📞 NEED HELP?**

### **Durable Support:**
- **Help Center:** https://help.durable.co
- **Live Chat:** Available in Durable dashboard
- **Email:** support@durable.co

### **Wix Support:**
- **Help Center:** https://support.wix.com
- **Phone:** Available 24/7 for Business VIP
- **Live Chat:** In Wix dashboard

---

## **🚀 IMMEDIATE BENEFITS:**

### **SSL Problem Solved:**
- ✅ **Working certificate** from Wix
- ✅ **Green lock icon** in browser
- ✅ **No security warnings**
- ✅ **Professional appearance**

### **Business Impact:**
- ✅ **Students can enroll** immediately
- ✅ **Credibility restored**
- ✅ **Professional platform** live
- ✅ **WIOA compliance** maintained

### **Technical Benefits:**
- ✅ **Fast redirect** (instant)
- ✅ **SEO preserved** (301 redirects)
- ✅ **Mobile optimized**
- ✅ **Analytics tracking** ready

---

## **⏰ TIMELINE:**

**Total Time: 25 minutes**

- **Durable setup:** 5 minutes
- **Wix upgrade:** 5 minutes  
- **Page creation:** 10 minutes
- **Testing:** 5 minutes

**Result: Working SSL + Professional platform in under 30 minutes!**

---

**🎯 Ready to implement? Start with Step 1 - login to Durable and let's fix this SSL issue right now!**