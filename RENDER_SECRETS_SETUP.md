# 🔐 Render Dashboard - Required Secrets Setup

**CRITICAL:** Your build is failing because Supabase secrets are missing in Render.

---

## 🚨 Immediate Action Required

Your deployment needs these secrets added to **Render Dashboard** right now.

---

## 📋 Step-by-Step Instructions

### 1. Go to Render Dashboard
🔗 **[https://dashboard.render.com](https://dashboard.render.com)**

### 2. Select Your Service
- Click on **"elevateforhumanity"** service
- Or whatever your service name is

### 3. Go to Environment Tab
- Click **"Environment"** in the left sidebar
- You'll see existing environment variables

### 4. Add Required Secrets

Click **"Add Environment Variable"** for each of these:

---

## 🔑 Required Secrets

### Secret #1: VITE_SUPABASE_ANON_KEY

**Key:** `VITE_SUPABASE_ANON_KEY`

**Where to get the value:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **cuxzzpsyufcewtmicszk**
3. Click **Settings** (gear icon) → **API**
4. Under **"Project API keys"** section
5. Copy the **"anon public"** key
6. It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Paste this value in Render**

---

### Secret #2: SUPABASE_SERVICE_ROLE_KEY (Optional but recommended)

**Key:** `SUPABASE_SERVICE_ROLE_KEY`

**Where to get the value:**
1. Same Supabase dashboard: **Settings** → **API**
2. Under **"Project API keys"** section
3. Copy the **"service_role"** key (⚠️ Keep this secret!)
4. It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Paste this value in Render**

---

### Secret #3: JWT_SECRET (Already generated)

**Key:** `JWT_SECRET`

**Value:** `3k6r5h+CvwLnIvGE3nuW/FQyY5IqNYpvbA3gq7DLwwPp9BIQ62Qex0l7sGHGfNrr`

**Paste this value in Render**

---

## 5. Save Changes

After adding all three secrets:
1. Click **"Save Changes"** button
2. Render will automatically trigger a new deployment
3. This time the build will succeed! ✅

---

## 📸 Visual Guide

```
Render Dashboard
├── Services
│   └── elevateforhumanity (click here)
│       └── Environment (click here)
│           └── Add Environment Variable (click here)
│               ├── Key: VITE_SUPABASE_ANON_KEY
│               ├── Value: [paste from Supabase]
│               └── Add (click)
│           └── Add Environment Variable (click again)
│               ├── Key: SUPABASE_SERVICE_ROLE_KEY
│               ├── Value: [paste from Supabase]
│               └── Add (click)
│           └── Add Environment Variable (click again)
│               ├── Key: JWT_SECRET
│               ├── Value: 3k6r5h+CvwLnIvGE3nuW/FQyY5IqNYpvbA3gq7DLwwPp9BIQ62Qex0l7sGHGfNrr
│               └── Add (click)
│           └── Save Changes (click)
```

---

## ✅ Verification

After adding secrets and saving:

1. **Check Build Logs**
   - Go to **"Logs"** tab in Render
   - You should see: `Build succeeded` ✅

2. **Check Deployment**
   - Wait 3-5 minutes for deployment
   - Visit: [https://elevateforhumanity.org](https://elevateforhumanity.org)
   - Should see the polished design! 🎨

3. **Check Sitemaps**
   - Visit: [https://elevateforhumanity.org/sitemap.xml](https://elevateforhumanity.org/sitemap.xml)
   - Should see XML sitemap ✅

---

## 🆘 Troubleshooting

### Build Still Failing?

**Check these:**
- ✅ All 3 secrets added?
- ✅ No typos in secret names?
- ✅ Values copied completely (no spaces)?
- ✅ Clicked "Save Changes"?

### Can't Find Supabase Keys?

**Alternative method:**
1. Go to Supabase project: [https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk](https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk)
2. Click the **Settings** gear icon (bottom left)
3. Click **API** in the settings menu
4. Scroll to **"Project API keys"**
5. Copy both keys

---

## 📞 Need Help?

If you're stuck:
1. Take a screenshot of the Render Environment page
2. Take a screenshot of any error messages
3. Share with your team

---

## ⚡ Quick Summary

**What you need to do RIGHT NOW:**

1. Open [Render Dashboard](https://dashboard.render.com)
2. Click your service
3. Click "Environment"
4. Add 3 secrets (see above)
5. Click "Save Changes"
6. Wait 5 minutes
7. Check [elevateforhumanity.org](https://elevateforhumanity.org)

**That's it!** 🎉

---

**Status:** ⏳ Waiting for you to add secrets in Render Dashboard
