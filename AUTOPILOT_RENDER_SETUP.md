# 🚀 Autopilot Render Deployment System

Complete autopilot system for Render deployments with automatic failure detection, logging, and GitHub Issue creation.

## 🎯 What This Fixes

### 1. CodeQL Duplicate SARIF Upload ✅
- **Problem**: `only one run of the codeql/analyze or codeql/upload-sarif`
- **Solution**: Removed duplicate upload-sarif step, using unique category
- **File**: `.github/workflows/codeql.yml`

### 2. Backend Build Failures ✅
- **Problem**: `MODULE_NOT_FOUND: Cannot find module 'backend/dist/index.js'`
- **Solution**: Backend is JavaScript (server.js), no TypeScript build needed
- **Files**: `backend/package.json`, `backend/env-guard.js`

### 3. Missing Environment Variables ✅
- **Problem**: Missing `SUPABASE_URL`, `JWT_SECRET`, etc.
- **Solution**: Environment guards that fail fast with clear messages
- **Files**: `backend/env-guard.js`, `src/env-guard.ts`

### 4. Deployment Monitoring ✅
- **Problem**: No visibility into Render deployment failures
- **Solution**: Autopilot watcher that creates GitHub Issues
- **Files**: `scripts/render/poll-render.js`, `.github/workflows/autopilot-render.yml`

## 🔧 Setup Instructions

### Step 1: Add GitHub Secrets

**Settings → Secrets and variables → Actions → New repository secret**

```
RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxxx
RENDER_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Configure Render Environment Variables

**Render Dashboard → Service → Environment**:

```bash
SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
JWT_SECRET=your-jwt-secret-minimum-32-chars
PORT=8080
NODE_ENV=production
```

### Step 3: Update Render Build Settings

```bash
Build Command: pnpm install --frozen-lockfile=false && pnpm run build
Start Command: pnpm start
```

## 🚀 Usage

### Automatic: Push with tag
```bash
git commit -m "Fix backend API [watch-render]"
git push
```

### Manual: GitHub Actions
1. Actions → Autopilot Render Watcher → Run workflow

## 📊 On Failure

Creates GitHub Issue with:
- Error details
- Suggested fixes
- Links to Render dashboard
- Service logs

## 🔗 Links

- [Render Dashboard](https://dashboard.render.com)
- [GitHub Actions](https://github.com/elevateforhumanity/fix2/actions)
