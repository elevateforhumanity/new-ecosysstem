# 🚀 Render Complete Setup Guide

**Complete guide to set up, configure, and enable auto-deploy on Render**

---

## 📋 Prerequisites

1. **Render Account**: https://dashboard.render.com
2. **GitHub Repository**: https://github.com/elevateforhumanity/fix2
3. **Render API Key**: Get from Account Settings → API Keys

---

## 🎯 Quick Start

### Step 1: Get Your Render API Key

1. Go to https://dashboard.render.com
2. Click your profile (top right) → **Account Settings**
3. Scroll to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `rnd_`)
6. Export it:
   ```bash
   export RENDER_API_KEY=rnd_xxxxxxxxxxxxx
   ```

### Step 2: Check Your Services

```bash
./scripts/render/activate-services.sh
```

**If you have NO services**, continue to Step 3.  
**If you have services**, skip to Step 4.

### Step 3: Create a New Service

#### Option A: Via Dashboard (Recommended)

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub repository: `elevateforhumanity/fix2`
4. Configure:

   **Basic Settings:**
   - Name: `elevateforhumanity`
   - Branch: `main`
   - Root Directory: (leave empty)

   **Build & Deploy:**
   - Build Command: 
     ```bash
     pnpm install --frozen-lockfile=false && pnpm run build:frontend
     ```
   - Start Command:
     ```bash
     pnpm start
     ```

   **Environment Variables:**
   ```
   NODE_ENV=production
   VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
   ```

5. Click **Create Web Service**
6. Wait for initial deployment (3-5 minutes)

#### Option B: Via Blueprint (render.yaml)

Your repository already has `render.yaml` configured!

1. Go to https://dashboard.render.com
2. Click **New +** → **Blueprint**
3. Connect repository: `elevateforhumanity/fix2`
4. Render will read `render.yaml` automatically
5. Click **Apply**

### Step 4: Get Your Service ID

After creating the service:

```bash
./scripts/render/activate-services.sh
```

This will show your service ID (e.g., `srv-xxxxx`) and save it to `.render-service-id`.

Load it:
```bash
source .render-service-id
```

Or manually:
```bash
export RENDER_SERVICE_ID=srv-xxxxxxxxxxxxx
```

### Step 5: Enable Auto-Deploy

```bash
./scripts/render/enable-auto-deploy.sh
```

This will guide you through enabling auto-deploy in the dashboard.

**Manual Steps:**
1. Go to https://dashboard.render.com/web/YOUR_SERVICE_ID/settings
2. Scroll to **Build & Deploy** section
3. Find **Auto-Deploy** setting
4. Change to: **Yes**
5. Click **Save Changes**

---

## ✅ Verification

### Check Service Status

```bash
./scripts/render/activate-services.sh
```

Should show:
```
✅ All services are active!
Auto-deploy: yes
```

### Check Deployment

```bash
./check-deployment-status.sh
```

Should show:
```
✅ NEW BUILD DEPLOYED!
Title: <title>Elevate for Humanity - Workforce Development & Learning Platform</title>
```

### Full Setup Verification

```bash
./scripts/verify-full-setup.sh
```

Should show:
```
✅ Perfect! All checks passed!
```

---

## 🔄 Deployment Workflow

### Automatic (After Auto-Deploy Enabled)

1. Make changes to your code
2. Commit: `git commit -m "Your changes"`
3. Push: `git push origin main`
4. Render automatically deploys! 🎉

### Manual Trigger

```bash
# Using the helper script
./.render-manual-deploy.sh

# Or using the API directly
curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"clear"}' \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys"
```

### Via GitHub Actions

The repository has `.github/workflows/autopilot-render.yml` configured.

**To trigger:**
1. Add `[watch-render]` to your commit message
2. Push to main
3. GitHub Actions will monitor the deployment

---

## 🛠️ Configuration Files

### render.yaml (Blueprint)

Located at: `render.yaml`

Key settings:
- ✅ Build command: `pnpm install && pnpm run build`
- ✅ Start command: `node serve-static.cjs`
- ✅ Environment variables configured
- ✅ Routes configured for SPA
- ✅ Headers configured for security/CORS

### Environment Variables

Required in Render Dashboard:
```bash
NODE_ENV=production
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Optional:
```bash
VITE_API_URL=https://elevateforhumanity.onrender.com
```

---

## 🔍 Troubleshooting

### "No active services found"

**Solution:**
1. Check if service exists: https://dashboard.render.com
2. If suspended, click "Resume Service"
3. If none exist, create one (Step 3 above)

### "Auto-deploy not working"

**Check:**
1. Auto-deploy enabled in dashboard?
2. Correct branch configured? (should be `main`)
3. GitHub connected properly?

**Fix:**
1. Go to Settings → Build & Deploy
2. Verify Auto-Deploy: Yes
3. Verify Branch: main
4. Save changes

### "Build failing"

**Check:**
1. Build logs in Render Dashboard
2. Environment variables set correctly?
3. Build command correct?

**Fix:**
```bash
# Verify local build works
./scripts/autopilot-build-web.sh

# If local works, check Render settings match
```

### "Service suspended"

**Solution:**
1. Go to https://dashboard.render.com
2. Click on service
3. Click "Resume Service"
4. Wait for service to start

---

## 📊 Monitoring

### Check Deployment Status

```bash
./check-deployment-status.sh
```

### Monitor Live Deployment

```bash
./monitor-deployment.sh
```

### Watch with Autopilot

```bash
# Set up environment
export RENDER_API_KEY=rnd_xxxxx
export RENDER_SERVICE_ID=srv_xxxxx
export GITHUB_TOKEN=ghp_xxxxx

# Run watcher
node scripts/render/poll-render.js
```

---

## 🎯 Complete Deployment Checklist

- [ ] Render account created
- [ ] API key obtained and exported
- [ ] Service created (via dashboard or blueprint)
- [ ] Service ID obtained and exported
- [ ] Environment variables configured
- [ ] Auto-deploy enabled
- [ ] GitHub connected
- [ ] Initial deployment successful
- [ ] Service responding (200 OK)
- [ ] Correct title showing
- [ ] All routes working

---

## 🔗 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Service Settings**: https://dashboard.render.com/web/YOUR_SERVICE_ID/settings
- **Service Logs**: https://dashboard.render.com/web/YOUR_SERVICE_ID/logs
- **GitHub Repo**: https://github.com/elevateforhumanity/fix2
- **GitHub Actions**: https://github.com/elevateforhumanity/fix2/actions

---

## 📝 Helper Scripts

| Script | Purpose |
|--------|---------|
| `scripts/render/activate-services.sh` | Check service status |
| `scripts/render/enable-auto-deploy.sh` | Enable auto-deploy |
| `scripts/render/audit-and-cleanup.sh` | Full audit |
| `scripts/verify-full-setup.sh` | Verify configuration |
| `scripts/master-deploy.sh` | Complete deployment |
| `.render-manual-deploy.sh` | Manual deploy trigger |

---

## 🎉 Success!

Once auto-deploy is enabled:

1. ✅ Push to main → Automatic deployment
2. ✅ No manual triggers needed
3. ✅ Deployments monitored automatically
4. ✅ GitHub Issues created on failure

**Your deployment pipeline is now fully automated!** 🚀
