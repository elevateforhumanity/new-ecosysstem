# Google Classroom Autopilot - Complete Setup Guide

## Prerequisites

- ✅ Google Workspace nonprofit account (completed)
- ✅ Node.js 20+ installed
- ✅ Supabase project with service role key
- ⏳ Google Cloud Console access
- ⏳ OAuth credentials

## Step-by-Step Setup

### Phase 1: Google Cloud Console Setup (15 minutes)

#### 1.1 Enable Google Classroom API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new one)
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Classroom API"
5. Click **Enable**

#### 1.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **Internal** (for Workspace) or **External**
   - App name: "EFH Classroom Autopilot"
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add these scopes:
     - `https://www.googleapis.com/auth/classroom.courses`
     - `https://www.googleapis.com/auth/classroom.rosters`
     - `https://www.googleapis.com/auth/classroom.coursework.students`
     - `https://www.googleapis.com/auth/classroom.guardianlinks.students`
4. Back to **Create OAuth client ID**:
   - Application type: **Desktop app** or **Web application**
   - Name: "EFH Classroom Autopilot"
   - Authorized redirect URIs (if Web): `http://localhost:53682/callback`
5. Click **Create**
6. **Download JSON** or copy:
   - Client ID
   - Client Secret

### Phase 2: Supabase Setup (5 minutes)

#### 2.1 Create Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run `sql/01_tokens.sql` (creates `user_tokens` table)
4. Run `sql/02_tasks.sql` (creates `tasks` and `audit_logs` tables)

#### 2.2 Verify Tables

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_tokens', 'tasks', 'audit_logs');
```

### Phase 3: Environment Configuration (5 minutes)

#### 3.1 Set Environment Variables

**Option A: Gitpod (recommended)**

```bash
gp env SUPABASE_URL=https://your-project.supabase.co
gp env SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
gp env GOOGLE_OAUTH_CLIENT_ID=123456789.apps.googleusercontent.com
gp env GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
gp env GOOGLE_OAUTH_REDIRECT=http://localhost:53682/callback
```

**Option B: Local .env file**

```bash
cd google-classroom-autopilot
cp .env.example .env
# Edit .env with your actual values
```

#### 3.2 Install Dependencies

```bash
cd google-classroom-autopilot
npm install
```

### Phase 4: OAuth Authorization (5 minutes)

#### 4.1 Start OAuth Flow

```bash
npx tsx src/index.ts auth --email teacher@school.org
```

This will:
1. Generate an authorization URL
2. Print it to console
3. Start a local server on port 53682

#### 4.2 Complete Authorization

1. Open the printed URL in your browser
2. Sign in with your Google Workspace account
3. Grant permissions
4. You'll be redirected to `http://localhost:53682/callback?code=...`
5. Copy the `code` parameter value

#### 4.3 Redeem Authorization Code

```bash
npx tsx src/index.ts auth:redeem --email teacher@school.org --code 4/0AY0e-g7...
```

This will:
1. Exchange code for tokens
2. Store refresh token in Supabase
3. Confirm successful authorization

### Phase 5: Testing (5 minutes)

#### 5.1 List Courses

```bash
npx tsx src/index.ts courses:list --email teacher@school.org
```

Expected output:
```
📚 Courses for teacher@school.org:
  - CNA Training Fall 2025 (id: 123456789)
  - Medical Assistant Program (id: 987654321)
```

#### 5.2 Queue a Test Task

```sql
-- In Supabase SQL Editor
INSERT INTO public.tasks(kind, payload, priority)
VALUES (
  'gc_create_announcement',
  jsonb_build_object(
    'courseId', '123456789',
    'text', 'Welcome to the course! 🎉'
  ),
  5
);
```

#### 5.3 Run Autopilot

```bash
npx tsx src/index.ts autopilot:run --email teacher@school.org
```

Expected output:
```
🤖 Running autopilot for teacher@school.org...
✅ Processed 1 task(s)
  - gc_create_announcement: Success
```

### Phase 6: Integration with EFH Platform (10 minutes)

#### 6.1 Add to Main Package

```bash
cd /workspaces/tiny-new
npm install ./google-classroom-autopilot
```

#### 6.2 Create Automation Script

Create `scripts/classroom-autopilot.sh`:

```bash
#!/bin/bash
cd google-classroom-autopilot
npx tsx src/index.ts autopilot:run --email $TEACHER_EMAIL
```

#### 6.3 Add to Gitpod Tasks

Edit `.gitpod.yml`:

```yaml
tasks:
  - name: Classroom Autopilot
    command: |
      cd google-classroom-autopilot
      npm install
      # Run every 5 minutes
      while true; do
        npx tsx src/index.ts autopilot:run --email teacher@school.org
        sleep 300
      done
```

## Troubleshooting

### Error: "Invalid grant"
- Your authorization code expired (valid for 10 minutes)
- Run `auth` command again to get a new code

### Error: "Token has been expired or revoked"
- Refresh token was revoked
- Run `auth` flow again to re-authorize

### Error: "Insufficient permissions"
- Check OAuth scopes in Google Cloud Console
- Re-authorize with correct scopes

### Error: "Course not found"
- Verify courseId in task payload
- Check user has access to the course

## Next Steps

1. ✅ **Domain-Wide Delegation**: Switch to service account for automated workflows
2. ✅ **Pub/Sub Integration**: Real-time event processing with Cloudflare Workers
3. ✅ **Batch Operations**: Process multiple tasks in parallel
4. ✅ **Error Handling**: Retry logic and dead letter queue
5. ✅ **Monitoring**: Dashboard for task status and metrics

## Support

Questions? Contact: info@elevateforhumanity.org

## Security Checklist

- [ ] Tokens stored in Supabase with RLS enabled
- [ ] Service role key not exposed in frontend
- [ ] OAuth redirect URI matches exactly
- [ ] Scopes limited to minimum required
- [ ] Regular token rotation enabled
- [ ] Audit logs monitored for suspicious activity
