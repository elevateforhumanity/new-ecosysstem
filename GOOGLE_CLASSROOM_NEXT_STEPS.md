# 🎯 Google Classroom - Next Steps

## ✅ Autopilot Completed

The autopilot has prepared everything. Now complete these 4 quick steps:

---

## Step 1: Enable Google Classroom API (2 minutes)

**Click this link**: [Enable API](https://console.cloud.google.com/apis/library/classroom.googleapis.com?project=magnetic-clone-436521-n9)

1. Click the blue **"ENABLE"** button
2. Wait for confirmation
3. ✅ Done!

---

## Step 2: Create OAuth Credentials (3 minutes)

**Click this link**: [Create Credentials](https://console.cloud.google.com/apis/credentials?project=magnetic-clone-436521-n9)

1. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"**

2. If prompted about consent screen, click **"CONFIGURE CONSENT SCREEN"** (go to Step 3 first, then come back)

3. Application type: **"Web application"**

4. Name: `Elevate for Humanity LMS`

5. **Authorized redirect URIs** - Add BOTH:
   ```
   https://elevateforhumanity.pages.dev/auth/callback
   http://localhost:5173/auth/callback
   ```

6. Click **"CREATE"**

7. **COPY** the Client ID and Client Secret (you'll need these!)

---

## Step 3: Configure OAuth Consent Screen (3 minutes)

**Click this link**: [Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=magnetic-clone-436521-n9)

### Page 1: OAuth consent screen
- User Type: **"External"**
- Click **"CREATE"**

### Page 2: App information
- App name: `Elevate for Humanity`
- User support email: `your-email@elevateforhumanity.org`
- App logo: (optional)
- App domain: `elevateforhumanity.pages.dev`
- Developer contact: `your-email@elevateforhumanity.org`
- Click **"SAVE AND CONTINUE"**

### Page 3: Scopes
- Click **"ADD OR REMOVE SCOPES"**
- Search and add these scopes:
  - ✅ `.../auth/classroom.courses`
  - ✅ `.../auth/classroom.coursework.students`
  - ✅ `.../auth/classroom.rosters`
  - ✅ `.../auth/classroom.topics`
- Click **"UPDATE"**
- Click **"SAVE AND CONTINUE"**

### Page 4: Test users (if in Testing mode)
- Add your email as a test user
- Click **"SAVE AND CONTINUE"**

### Page 5: Summary
- Review and click **"BACK TO DASHBOARD"**

---

## Step 4: Add to Cloudflare Pages (2 minutes)

**Click this link**: [Cloudflare Dashboard](https://dash.cloudflare.com)

1. Navigate to: **Pages** → **elevateforhumanity** → **Settings** → **Environment Variables**

2. Click **"Add variable"** and add these THREE:

   **Variable 1:**
   ```
   Name: GOOGLE_OAUTH_CLIENT_ID
   Value: [paste your Client ID from Step 2]
   ```

   **Variable 2:**
   ```
   Name: GOOGLE_OAUTH_CLIENT_SECRET
   Value: [paste your Client Secret from Step 2]
   ```

   **Variable 3:**
   ```
   Name: GOOGLE_CLOUD_PROJECT
   Value: magnetic-clone-436521-n9
   ```

3. Click **"Save"**

4. **Redeploy** your site (Cloudflare will prompt you)

---

## ✅ Test Your Setup

Once Cloudflare redeploys (2-3 minutes):

1. Go to: https://elevateforhumanity.pages.dev/admin/classroom

2. Click **"Connect Google Classroom"**

3. Sign in with your Google account

4. Authorize the app

5. You should see the admin dashboard!

---

## 🎉 You're Done!

**Total Time**: ~10 minutes

**What You Can Now Do**:
- ✅ Create Google Classroom courses
- ✅ Sync student rosters
- ✅ Create and grade assignments
- ✅ Post announcements
- ✅ Track student progress
- ✅ Export grades to your LMS

---

## 📚 Additional Resources

- **Full Documentation**: `GOOGLE_CLOUD_SETUP.md`
- **Feature List**: `google-classroom-autopilot/COMPLETE_FEATURE_LIST.md`
- **Setup Guide**: `google-classroom-autopilot/SETUP_GUIDE.md`
- **Integration Guide**: `google-classroom-autopilot/INTEGRATION_GUIDE.md`

---

## 🆘 Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure OAuth consent screen is fully configured
- Check redirect URIs match exactly
- If app is in "Testing" mode, add your email as a test user

### "API not enabled"
- Go back to Step 1 and enable the API
- Wait 1-2 minutes for it to propagate

### "Invalid client"
- Double-check Client ID and Secret in Cloudflare
- Make sure there are no extra spaces
- Verify you're using credentials from the correct project

---

## 📊 Quick Reference

| Item | Value |
|------|-------|
| Project ID | `magnetic-clone-436521-n9` |
| Website | `https://elevateforhumanity.pages.dev` |
| Redirect URI | `https://elevateforhumanity.pages.dev/auth/callback` |
| Admin Panel | `https://elevateforhumanity.pages.dev/admin/classroom` |

---

**Ready to start?** Open the links above and follow the steps! 🚀
