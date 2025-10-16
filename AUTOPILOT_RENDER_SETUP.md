# 🤖 Autopilot Render Setup Instructions

Your autopilot can add secrets to Render automatically! Here's how:

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Render API Key

1. Go to: [https://dashboard.render.com/u/settings/api-keys](https://dashboard.render.com/u/settings/api-keys)
2. Click **"Create API Key"**
3. Name: `Autopilot Deploy`
4. Click **"Create"**
5. **Copy the key** (you'll only see it once!)

### Step 2: Get Supabase Keys

1. Go to: [https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk/settings/api](https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk/settings/api)
2. Copy **"anon public"** key
3. Copy **"service_role"** key (optional but recommended)

### Step 3: Run Autopilot

```bash
# Set your keys
export RENDER_API_KEY='rnd_xxxxxxxxxxxxxxxxxxxxx'
export SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
export SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# Run autopilot
bash autopilot-add-render-secrets.sh
```

**That's it!** Autopilot will:
- ✅ Find your Render service
- ✅ Add all secrets
- ✅ Trigger deployment
- ✅ Your site goes live in 5 minutes

---

## 📋 Full Command Example

```bash
# All in one command
export RENDER_API_KEY='rnd_your_key_here' && \
export SUPABASE_ANON_KEY='eyJ_your_anon_key_here' && \
export SUPABASE_SERVICE_ROLE_KEY='eyJ_your_service_key_here' && \
bash autopilot-add-render-secrets.sh
```

---

## ✅ What Autopilot Does

1. **Validates** - Checks you have all required keys
2. **Finds Service** - Locates your Render service via API
3. **Adds Secrets** - Uploads all 3 secrets:
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
4. **Triggers Deploy** - Starts new deployment automatically
5. **Reports Status** - Shows you the results

---

## 🔐 Security Notes

- ✅ Keys are sent directly to Render via API (secure)
- ✅ Keys are not stored in git
- ✅ Keys are only in your terminal session
- ⚠️ Don't share your RENDER_API_KEY
- ⚠️ Don't share your SUPABASE_SERVICE_ROLE_KEY

---

## 🆘 Troubleshooting

### "RENDER_API_KEY not found"
- Make sure you ran `export RENDER_API_KEY='...'`
- Check for typos
- Make sure there are no spaces around the `=`

### "Could not find service"
- Your Render API key might be wrong
- Or you don't have access to the service
- Check: https://dashboard.render.com

### "SUPABASE_ANON_KEY not found"
- Make sure you ran `export SUPABASE_ANON_KEY='...'`
- Get it from Supabase dashboard

---

## 🎯 Expected Output

```
🤖 Advanced Autopilot - Adding Secrets to Render
=================================================

🔍 Step 1: Checking for Render API key...
✅ Render API key found

🔍 Step 2: Finding your Render service...
✅ Found service: srv-xxxxx

🔍 Step 3: Getting Supabase keys...
✅ Supabase keys ready

🔐 Step 4: Adding secrets to Render...
Adding VITE_SUPABASE_ANON_KEY...
✅ Added VITE_SUPABASE_ANON_KEY
Adding SUPABASE_SERVICE_ROLE_KEY...
✅ Added SUPABASE_SERVICE_ROLE_KEY
Adding JWT_SECRET...
✅ Added JWT_SECRET

🚀 Step 5: Triggering deployment...
✅ Deployment triggered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SECRETS ADDED TO RENDER!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Secrets added:
  ✅ VITE_SUPABASE_ANON_KEY
  ✅ SUPABASE_SERVICE_ROLE_KEY
  ✅ JWT_SECRET

Your site will be live in ~5 minutes at:
  🌐 https://elevateforhumanity.org
  🗺️  https://elevateforhumanity.org/sitemap.xml
```

---

## 🎉 Success!

Once you see "✅ SECRETS ADDED TO RENDER!", you're done!

Wait 5 minutes and check:
- [https://elevateforhumanity.org](https://elevateforhumanity.org)
- [https://elevateforhumanity.org/sitemap.xml](https://elevateforhumanity.org/sitemap.xml)

Your polished design system will be live! 🚀
