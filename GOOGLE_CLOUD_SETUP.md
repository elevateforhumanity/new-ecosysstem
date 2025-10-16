# Google Cloud Projects Configuration

## Your Existing Projects

| Project Name | Project ID | Status | Use For |
|--------------|------------|--------|---------|
| My First Project | `magnetic-clone-436521-n9` | ✅ CURRENT | **RECOMMENDED for Elevate for Humanity** |
| My Project 13779 | `sinuous-grove-475110-c4` | Available | Alternative |
| My Project 91830 | `molten-topic-436521-k5` | Available | Alternative |

## Recommended Setup

**Use Project**: `magnetic-clone-436521-n9` (My First Project)

This is your current/active project, making it the easiest to configure.

## Quick Setup Guide

### 1. Enable Google Classroom API

**Direct Link**: [Enable Classroom API](https://console.cloud.google.com/apis/library/classroom.googleapis.com?project=magnetic-clone-436521-n9)

Or manually:
1. Go to Google Cloud Console
2. Select project: `magnetic-clone-436521-n9`
3. Navigate to: APIs & Services → Library
4. Search: "Google Classroom API"
5. Click: ENABLE

### 2. Create OAuth 2.0 Credentials

**Direct Link**: [Create Credentials](https://console.cloud.google.com/apis/credentials?project=magnetic-clone-436521-n9)

Steps:
1. Click "CREATE CREDENTIALS"
2. Select "OAuth client ID"
3. Application type: "Web application"
4. Name: `Elevate for Humanity LMS`
5. Authorized redirect URIs:
   ```
   https://elevateforhumanity.pages.dev/auth/callback
   http://localhost:5173/auth/callback
   ```
6. Click CREATE
7. **Save the Client ID and Client Secret**

### 3. Configure OAuth Consent Screen

**Direct Link**: [OAuth Consent](https://console.cloud.google.com/apis/credentials/consent?project=magnetic-clone-436521-n9)

Configuration:
- **User Type**: External (or Internal if you have Google Workspace)
- **App name**: Elevate for Humanity
- **User support email**: your-email@elevateforhumanity.org
- **Developer contact**: your-email@elevateforhumanity.org
- **App domain**: https://elevateforhumanity.pages.dev
- **Authorized domains**: elevateforhumanity.pages.dev

**Scopes to add**:
```
https://www.googleapis.com/auth/classroom.courses
https://www.googleapis.com/auth/classroom.coursework.students
https://www.googleapis.com/auth/classroom.rosters
https://www.googleapis.com/auth/classroom.topics
https://www.googleapis.com/auth/classroom.announcements
https://www.googleapis.com/auth/classroom.profile.emails
```

### 4. Add to Cloudflare Pages

Go to: [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → elevateforhumanity → Settings → Environment Variables

Add these variables:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id-from-step-2
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-from-step-2
GOOGLE_CLOUD_PROJECT=magnetic-clone-436521-n9
```

### 5. Add to Local .env (for development)

```bash
# Add to /workspaces/fix2/.env
GOOGLE_OAUTH_CLIENT_ID=your-client-id-from-step-2
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-from-step-2
GOOGLE_CLOUD_PROJECT=magnetic-clone-436521-n9
GOOGLE_IMPERSONATE_EMAIL=admin@yourdomain.com
```

## Testing

### Test OAuth Flow
1. Go to: https://elevateforhumanity.pages.dev/admin/classroom
2. Click "Connect Google Classroom"
3. Authorize the app
4. Should redirect back successfully

### Test API Access
Once configured, you can:
- Create courses
- Sync student rosters
- Create assignments
- Grade submissions
- Send announcements

## Advanced: Domain-Wide Delegation (Optional)

For automated sync without user interaction:

1. Create Service Account
2. Enable Domain-Wide Delegation
3. Add scopes in Google Workspace Admin
4. Use service account for automation

See: `google-classroom-autopilot/DOMAIN_WIDE_DELEGATION_SETUP.md`

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Check OAuth consent screen is configured
- Verify redirect URIs match exactly
- Make sure app is not in "Testing" mode (or add test users)

### "API not enabled"
- Go back to Step 1 and enable the API
- Wait 1-2 minutes for propagation

### "Invalid client"
- Double-check Client ID and Secret
- Make sure they're from the correct project
- Verify no extra spaces when copying

## Security Notes

✅ **Safe to use**:
- OAuth Client ID (public)
- Project ID (public)

❌ **Keep secret**:
- OAuth Client Secret
- Service Account JSON
- Any API keys

## Status Checklist

- [ ] Google Classroom API enabled
- [ ] OAuth credentials created
- [ ] OAuth consent screen configured
- [ ] Credentials added to Cloudflare Pages
- [ ] Credentials added to local .env
- [ ] Tested OAuth flow
- [ ] Tested API access

## Support

- **Google Cloud Console**: https://console.cloud.google.com
- **Project Dashboard**: https://console.cloud.google.com/home/dashboard?project=magnetic-clone-436521-n9
- **API Library**: https://console.cloud.google.com/apis/library?project=magnetic-clone-436521-n9
- **Credentials**: https://console.cloud.google.com/apis/credentials?project=magnetic-clone-436521-n9

## Documentation

- `google-classroom-autopilot/README.md` - Overview
- `google-classroom-autopilot/SETUP_GUIDE.md` - Detailed setup
- `google-classroom-autopilot/INTEGRATION_GUIDE.md` - Integration details
- `google-classroom-autopilot/DOMAIN_WIDE_DELEGATION_SETUP.md` - Advanced setup

---

**Project**: magnetic-clone-436521-n9  
**Status**: Ready to configure  
**Estimated Setup Time**: 15-20 minutes  
