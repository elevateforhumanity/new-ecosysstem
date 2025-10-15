# 🚀 Deploy LMS Backend NOW - 3 Steps

## Step 1: Apply Database Migrations (2 minutes)

### 1.1 Open Supabase SQL Editor
**[Click here → Supabase SQL Editor](https://supabase.com/dashboard/project/cuxzzpsyufcewtmicszk/sql/new)**

### 1.2 Run Migration 1 - Schema
1. Copy ALL content from: `supabase/migrations/002_lms_schema.sql`
2. Paste into SQL Editor
3. Click **"Run"** button
4. Wait for "Success" message

### 1.3 Run Migration 2 - Seed Data
1. Copy ALL content from: `supabase/migrations/003_lms_seed_data.sql`
2. Paste into SQL Editor
3. Click **"Run"** button
4. Wait for "Success" message

✅ **Done!** You now have 5 courses and 17 modules in your database.

---

## Step 2: Deploy Backend to Render (3 minutes)

### 2.1 Open Render Dashboard
**[Click here → Create Web Service](https://dashboard.render.com/create?type=web)**

### 2.2 Connect GitHub
1. Click **"Connect account"** if not connected
2. Select repository: **elevateforhumanity/fix2**
3. Click **"Connect"**

### 2.3 Configure Service
Fill in these exact values:

```
Name: efh-lms-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 2.4 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these 3 variables:

**Variable 1:**
```
Key: SUPABASE_URL
Value: https://cuxzzpsyufcewtmicszk.supabase.co
```

**Variable 2:**
```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
```

**Variable 3:**
```
Key: NODE_ENV
Value: production
```

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Copy your backend URL (looks like: `https://efh-lms-backend.onrender.com`)

✅ **Done!** Your backend is live.

---

## Step 3: Test Backend (1 minute)

### 3.1 Test Health Endpoint
Replace `YOUR-URL` with your Render URL:

```bash
curl https://YOUR-URL.onrender.com/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2025-10-15T..."}
```

### 3.2 Test Courses API
```bash
curl https://YOUR-URL.onrender.com/api/courses
```

**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Digital Drawing & Illustration Specialist",
      ...
    }
  ]
}
```

✅ **Done!** Your LMS backend is working.

---

## 🎉 Success!

Your backend is now deployed at: `https://YOUR-URL.onrender.com`

### What You Have Now:

✅ **Database:** 5 courses, 17 modules  
✅ **Backend API:** 10+ endpoints  
✅ **Deployment:** Free tier on Render  
✅ **Auto-scaling:** Wakes on request  

### API Endpoints Available:

- `GET /health` - Health check
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/:userId` - User enrollments
- `GET /api/progress/:enrollmentId` - Module progress
- `PUT /api/progress/:progressId` - Update progress
- `GET /api/certificates/:userId` - User certificates
- `GET /api/dashboard/:userId` - Dashboard stats

---

## Next: Connect Frontend

After deployment, tell me your Render URL and I'll:
1. Update frontend configuration
2. Add GitHub secrets
3. Deploy updated frontend
4. Test full stack integration

**Your Render URL:** `https://________________.onrender.com`

Paste it here and I'll complete the setup! 🚀
