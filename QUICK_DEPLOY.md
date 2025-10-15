# 🚀 Quick Deploy - LMS Production

**5-Minute Quick Start Guide**

---

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Cloudflare account (free)
- [ ] Supabase account (free)
- [ ] Render account (free)

---

## Step 1: Database (5 min)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project: `elevate-lms`
3. Go to **SQL Editor** → **New Query**
4. Run each file in `supabase/migrations/` (001 through 012)
5. Copy **Project URL** and **anon key** from Settings → API

---

## Step 2: Backend (3 min)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. New + → Web Service → Connect `elevateforhumanity/fix2`
3. Settings:
   ```
   Name: efh-lms-backend
   Root Directory: backend
   Build: npm install
   Start: npm start
   ```
4. Environment Variables:
   ```bash
   NODE_ENV=production
   SUPABASE_URL=<from step 1>
   SUPABASE_ANON_KEY=<from step 1>
   JWT_SECRET=<generate below>
   FRONTEND_URL=https://elevateforhumanity.pages.dev
   ```
5. Generate JWT Secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
6. Click **Create Web Service**
7. Copy your backend URL (e.g., `https://efh-lms-backend.onrender.com`)

---

## Step 3: Frontend (3 min)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → Create → Pages → Connect to Git
3. Select `elevateforhumanity/fix2`
4. Settings:
   ```
   Project: elevateforhumanity
   Build: npm run build
   Output: dist
   ```
5. Environment Variables:
   ```bash
   VITE_SUPABASE_URL=<from step 1>
   VITE_SUPABASE_ANON_KEY=<from step 1>
   VITE_API_URL=<from step 2>
   ```
6. Click **Save and Deploy**
7. Wait 2-3 minutes for build

---

## Step 4: Verify (2 min)

```bash
# Test backend
curl https://efh-lms-backend.onrender.com/health

# Test frontend
curl https://elevateforhumanity.pages.dev

# Test API
curl https://efh-lms-backend.onrender.com/api/v1/courses
```

---

## ✅ Done!

Your LMS is live at:
- **Frontend:** https://elevateforhumanity.pages.dev
- **Backend:** https://efh-lms-backend.onrender.com

---

## 🆘 Troubleshooting

**Backend won't start?**
- Check environment variables are set
- Verify JWT_SECRET is 32+ characters
- Check Supabase credentials

**Frontend build fails?**
- Ensure all VITE_ variables are set
- Check build logs in Cloudflare dashboard

**Database errors?**
- Verify all 12 migrations ran successfully
- Check Supabase project is active (not paused)

---

## 📚 Full Documentation

- **Complete Guide:** DEPLOY_LMS_PRODUCTION.md
- **Summary:** LMS_PRODUCTION_READY_SUMMARY.md
- **Verification:** `./verify-deployment.sh`

---

## 💰 Cost

**Free Tier:** $0/month (up to 100 users)

All services have generous free tiers!

---

**Total Time:** ~15 minutes  
**Difficulty:** Easy  
**Status:** Production Ready ✅
