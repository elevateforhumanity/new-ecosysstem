# Deploy LMS Backend to Render

## Quick Deploy (5 minutes)

### Step 1: Apply Database Migrations

Run these SQL files in Supabase:

1. Go to: https://supabase.com/dashboard
2. Open your project: `cuxzzpsyufcewtmicszk`
3. Click **SQL Editor** in sidebar
4. Run each migration:

**Migration 1: LMS Schema**
```sql
-- Copy contents of supabase/migrations/002_lms_schema.sql
-- Paste and click "Run"
```

**Migration 2: Seed Data**
```sql
-- Copy contents of supabase/migrations/003_lms_seed_data.sql
-- Paste and click "Run"
```

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `elevateforhumanity/fix2`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: efh-lms-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   
   ```
   SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://efh-lms-backend.onrender.com`

### Step 3: Test Backend

```bash
# Test health endpoint
curl https://efh-lms-backend.onrender.com/health

# Test courses endpoint
curl https://efh-lms-backend.onrender.com/api/courses
```

### Step 4: Update Frontend

Add backend URL to `.env`:
```bash
VITE_API_URL=https://efh-lms-backend.onrender.com
```

---

## API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course with modules

### Enrollments
- `GET /api/enrollments/:userId` - Get user enrollments
- `POST /api/enrollments` - Enroll in course
  ```json
  {
    "user_id": "uuid",
    "course_id": "uuid"
  }
  ```

### Progress
- `GET /api/progress/:enrollmentId` - Get module progress
- `PUT /api/progress/:progressId` - Update progress
  ```json
  {
    "completed": true,
    "time_spent_minutes": 45
  }
  ```

### Certificates
- `GET /api/certificates/:userId` - Get user certificates

### Dashboard
- `GET /api/dashboard/:userId` - Get dashboard stats

---

## Database Schema

### Tables Created
- ✅ `courses` - Course catalog
- ✅ `modules` - Course lessons/modules
- ✅ `enrollments` - Student enrollments
- ✅ `module_progress` - Progress tracking
- ✅ `certificates` - Issued certificates
- ✅ `assignments` - Course assignments
- ✅ `submissions` - Assignment submissions

### Sample Data
- ✅ 5 courses (Digital Drawing, AI, Data Science, Cybersecurity, Google Analytics)
- ✅ 17 modules across courses
- ✅ Ready for user enrollment

---

## Troubleshooting

### "Module not found" error
```bash
cd backend
npm install
```

### "Cannot connect to Supabase"
- Check environment variables are set
- Verify Supabase URL and key are correct
- Test Supabase connection: https://cuxzzpsyufcewtmicszk.supabase.co

### "Port already in use"
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Render deployment fails
- Check build logs in Render dashboard
- Verify `backend/package.json` exists
- Ensure Node version >= 18

---

## Local Development

```bash
# Install dependencies
cd backend
npm install

# Set environment variables
export SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
export SUPABASE_ANON_KEY=eyJhbGci...

# Start server
npm run dev

# Test
curl http://localhost:3001/health
curl http://localhost:3001/api/courses
```

---

## Next Steps

After backend is deployed:

1. ✅ Update frontend to use backend API
2. ✅ Add authentication (Supabase Auth)
3. ✅ Create user dashboard
4. ✅ Build course enrollment flow
5. ✅ Add progress tracking UI

---

**Deployment Time:** ~5 minutes  
**Cost:** $0 (Render Free Tier)  
**Uptime:** Backend sleeps after 15 min inactivity (free tier)
