# Domain-Wide Delegation Setup Guide

This guide walks you through setting up **Service Account with Domain-Wide Delegation** for Google Classroom Autopilot. This allows the autopilot to impersonate teachers and perform actions on their behalf without requiring individual OAuth consent.

## Prerequisites

- ✅ Google Workspace account with **Super Admin** access
- ✅ Google Cloud Console project
- ✅ Google Classroom API enabled

## Part 1: Google Cloud Console Setup (10 minutes)

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **+ CREATE SERVICE ACCOUNT**
5. Fill in details:
   - **Name**: `classroom-autopilot`
   - **Description**: `Service account for EFH Classroom Autopilot with domain-wide delegation`
6. Click **CREATE AND CONTINUE**
7. Skip role assignment (click **CONTINUE**)
8. Click **DONE**

### Step 2: Enable Domain-Wide Delegation

1. Find your new service account in the list
2. Click on it to open details
3. Go to **DETAILS** tab
4. Under **Advanced settings**, find **Domain-wide delegation**
5. Click **ENABLE DOMAIN-WIDE DELEGATION**
6. **Client ID** will appear - **COPY THIS** (you'll need it for Admin Console)
7. Click **SAVE**

### Step 3: Create Service Account Key

1. Go to **KEYS** tab
2. Click **ADD KEY** → **Create new key**
3. Select **JSON** format
4. Click **CREATE**
5. Key file will download automatically
6. **IMPORTANT**: Keep this file secure! Never commit to git!

### Step 4: Encode Key for GitHub Secrets

```bash
# Base64 encode the key file
cat classroom-autopilot-key.json | base64 -w 0 > key-base64.txt

# Copy the contents of key-base64.txt
cat key-base64.txt
```

## Part 2: Google Workspace Admin Console Setup (5 minutes)

### Step 1: Access Admin Console

1. Go to [Google Admin Console](https://admin.google.com)
2. Sign in with your **Super Admin** account

### Step 2: Configure API Access

1. Navigate to **Security** → **Access and data control** → **API controls**
2. Click **MANAGE DOMAIN WIDE DELEGATION**
3. Click **Add new**

### Step 3: Add Service Account

1. **Client ID**: Paste the Client ID from Step 2 above
2. **OAuth Scopes**: Add these scopes (comma-separated):

```
https://www.googleapis.com/auth/classroom.courses,
https://www.googleapis.com/auth/classroom.rosters,
https://www.googleapis.com/auth/classroom.coursework.students,
https://www.googleapis.com/auth/classroom.guardianlinks.students,
https://www.googleapis.com/auth/classroom.announcements,
https://www.googleapis.com/auth/classroom.profile.emails,
https://www.googleapis.com/auth/classroom.profile.photos
```

3. Click **AUTHORIZE**

### Step 4: Verify Authorization

1. You should see your service account listed
2. Verify all scopes are present
3. Status should show as **Authorized**

## Part 3: Configure Secrets (5 minutes)

### GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GOOGLE_SA_JSON_B64` | Base64-encoded service account JSON | From Part 1, Step 4 |
| `GOOGLE_IMPERSONATE_EMAIL` | `teacher@school.org` | Teacher email to impersonate |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase service role key |

### Gitpod Environment Variables

```bash
# Set in Gitpod
gp env GOOGLE_SA_JSON_B64="<base64-encoded-json>"
gp env GOOGLE_IMPERSONATE_EMAIL="teacher@school.org"
gp env SUPABASE_URL="https://xxx.supabase.co"
gp env SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

### Local .env File

```bash
cd google-classroom-autopilot
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GOOGLE_SA_JSON_B64=<base64-encoded-json>
GOOGLE_IMPERSONATE_EMAIL=teacher@school.org
```

## Part 4: Testing (5 minutes)

### Test 1: List Courses

```bash
cd google-classroom-autopilot
npx tsx src/index.ts courses:list
```

Expected output:
```
🔐 Using Domain-Wide Delegation
👤 Impersonating: teacher@school.org
📚 Courses:
  - CNA Training Fall 2025 (id: 123456789)
  - Medical Assistant Program (id: 987654321)
```

### Test 2: Run Autopilot

```bash
npx tsx src/index.ts autopilot:run:dwd
```

Expected output:
```
🤖 Running autopilot with Domain-Wide Delegation...
👤 Impersonating: teacher@school.org
✅ Processed 3 task(s)
  - gc_create_course: Success
  - gc_invite_student: Success
  - gc_sync_roster: Success
```

### Test 3: Queue Auto-Sync Jobs

```bash
npx tsx src/auto-sync-jobs.ts queue
```

Expected output:
```
🔄 Queueing auto-sync jobs...
✅ Queueing job: Nightly Roster Sync
✅ Queueing job: Grade Export
```

## Part 5: GitHub Actions Setup (2 minutes)

The workflow is already configured in `.github/workflows/classroom-autopilot.yml`.

### Verify Workflow

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. You should see "Google Classroom Autopilot" workflow
4. It runs automatically every 10 minutes
5. You can also trigger it manually with **Run workflow**

### Monitor Workflow

1. Click on a workflow run to see details
2. Check logs for any errors
3. Verify tasks are being processed

## Troubleshooting

### Error: "Invalid grant"

**Cause**: Service account key is invalid or expired

**Solution**:
1. Generate a new service account key
2. Re-encode to base64
3. Update `GOOGLE_SA_JSON_B64` secret

### Error: "Insufficient permissions"

**Cause**: Scopes not authorized in Admin Console

**Solution**:
1. Go to Admin Console → API controls
2. Verify all required scopes are listed
3. Re-authorize if needed

### Error: "User not found"

**Cause**: Impersonation email doesn't exist or isn't a Workspace user

**Solution**:
1. Verify email is correct
2. Ensure user exists in Google Workspace
3. Check user has Classroom access

### Error: "Domain-wide delegation not enabled"

**Cause**: Domain-wide delegation not enabled for service account

**Solution**:
1. Go to Service Account details in Cloud Console
2. Enable domain-wide delegation
3. Wait 5-10 minutes for propagation

## Security Best Practices

### ✅ DO:
- Store service account keys securely
- Use GitHub Secrets for CI/CD
- Rotate keys every 90 days
- Monitor audit logs regularly
- Limit scopes to minimum required
- Use separate service accounts for different environments

### ❌ DON'T:
- Commit service account keys to git
- Share keys via email or chat
- Use production keys in development
- Grant unnecessary scopes
- Ignore security alerts

## Scope Reference

| Scope | Purpose | Required |
|-------|---------|----------|
| `classroom.courses` | Create, read, update courses | ✅ Yes |
| `classroom.rosters` | Manage student/teacher rosters | ✅ Yes |
| `classroom.coursework.students` | Create assignments, grade submissions | ✅ Yes |
| `classroom.guardianlinks.students` | Manage guardian invitations | ⚠️ Optional |
| `classroom.announcements` | Post announcements | ⚠️ Optional |
| `classroom.profile.emails` | Read user emails | ⚠️ Optional |
| `classroom.profile.photos` | Read user photos | ❌ No |

## Next Steps

1. ✅ **Monitor First Run**: Watch the first autopilot run in GitHub Actions
2. ✅ **Configure Auto-Sync**: Enable/disable auto-sync jobs as needed
3. ✅ **Set Up Alerts**: Configure notifications for failed tasks
4. ✅ **Build Admin UI**: Use the ClassroomAdminPanel component
5. ✅ **Add Pub/Sub**: Set up real-time event processing

## Support

Questions? Contact: info@elevateforhumanity.org

## Appendix: Service Account JSON Structure

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "classroom-autopilot@your-project.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

The `client_id` field is what you need for Admin Console authorization.
