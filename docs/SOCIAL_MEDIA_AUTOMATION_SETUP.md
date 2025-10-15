# Social Media Automation Setup Guide

Complete guide to setting up automated 3x daily posting to Facebook (2 pages), YouTube, LinkedIn, and Durable.co blog with Zapier integration.

## 📋 Overview

**Posting Schedule:**
- 🌅 Morning (9:00 AM EST): Educational/Inspirational content
- 🌞 Afternoon (1:00 PM EST): Engagement/Interactive content  
- 🌆 Evening (5:00 PM EST): Call-to-Action content

**Platforms:**
- ✅ Facebook Page 1 (Main)
- ✅ Facebook Page 2 (Programs)
- ✅ YouTube Community Tab
- ✅ LinkedIn Company Page
- ✅ Durable.co Blog
- ✅ Zapier Automation Workflows

---

## 1️⃣ Facebook Pages Setup

### Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" type
4. Fill in app details:
   - App Name: "Elevate Social Automation"
   - Contact Email: your-email@elevateforhumanity.org
5. Click "Create App"

### Get Page Access Tokens
1. In your app dashboard, go to "Tools" → "Graph API Explorer"
2. Select your app from dropdown
3. Click "Generate Access Token"
4. Grant permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
5. Copy the access token
6. **Convert to Long-Lived Token:**
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

### Get Page IDs
1. Go to your Facebook Page
2. Click "About" → "Page Transparency"
3. Copy the Page ID

### Add to .env
```bash
FACEBOOK_PAGE_1_ID=123456789012345
FACEBOOK_PAGE_1_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_PAGE_2_ID=987654321098765
FACEBOOK_PAGE_2_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

---

## 2️⃣ YouTube Setup

### Enable YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Elevate Social Automation"
3. Enable "YouTube Data API v3"
4. Create credentials:
   - API Key (for read operations)
   - OAuth 2.0 Client ID (for posting)

### Get Channel ID
1. Go to your YouTube channel
2. Click your profile → "Settings" → "Advanced settings"
3. Copy your Channel ID

### OAuth Setup for Posting
1. In Google Cloud Console, create OAuth 2.0 credentials
2. Add authorized redirect URI: `http://localhost:3000/oauth/youtube/callback`
3. Download credentials JSON
4. Run OAuth flow to get refresh token:
   ```bash
   node scripts/youtube-oauth-setup.js
   ```

### Add to .env
```bash
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxx
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token
```

---

## 3️⃣ LinkedIn Setup

### Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in details:
   - App Name: "Elevate Social Automation"
   - LinkedIn Page: Select your company page
   - App Logo: Upload logo
4. Click "Create App"

### Request API Access
1. In app settings, go to "Products"
2. Request access to:
   - "Share on LinkedIn"
   - "Marketing Developer Platform"
3. Wait for approval (usually 24-48 hours)

### Get Access Token
1. Go to "Auth" tab
2. Add redirect URL: `http://localhost:3000/oauth/linkedin/callback`
3. Copy Client ID and Client Secret
4. Run OAuth flow:
   ```bash
   node scripts/linkedin-oauth-setup.js
   ```

### Get Company ID
1. Go to your LinkedIn company page
2. URL format: `linkedin.com/company/YOUR-COMPANY-NAME`
3. Use LinkedIn API to get numeric ID:
   ```bash
   curl -X GET "https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=YOUR-COMPANY-NAME" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Add to .env
```bash
LINKEDIN_COMPANY_ID=12345678
LINKEDIN_COMPANY_URL=https://www.linkedin.com/company/elevateforhumanity
LINKEDIN_ACCESS_TOKEN=AQVxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

---

## 4️⃣ Durable.co Blog Setup

### Get API Key
1. Log in to [Durable.co](https://durable.co/)
2. Go to Settings → API
3. Generate new API key
4. Copy the key

### Test API Access
```bash
curl -X GET "https://api.durable.co/v1/blogs/elevateforhumanity/posts" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Add to .env
```bash
DURABLE_API_KEY=durable_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DURABLE_BLOG_URL=https://elevateforhumanity.durable.co/blog
```

---

## 5️⃣ Zapier Integration Setup

### Create Zapier Account
1. Sign up at [Zapier.com](https://zapier.com/)
2. Choose Pro plan (required for webhooks)

### Create Webhook Trigger
1. Click "Create Zap"
2. Choose trigger: "Webhooks by Zapier"
3. Select "Catch Hook"
4. Copy the webhook URL
5. Add to .env:
   ```bash
   ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/12345/abcdef
   ```

### Recommended Zap Workflows

#### Zap 1: Post Notification to Slack
- **Trigger:** Webhook (from our automation)
- **Action:** Send message to Slack channel
- **Message:** "✅ Posted to {platforms}: {content_title}"

#### Zap 2: Log to Google Sheets
- **Trigger:** Webhook
- **Action:** Add row to Google Sheets
- **Columns:** Timestamp, Platform, Content Type, Status, URL

#### Zap 3: Email Daily Report
- **Trigger:** Schedule (Daily at 6 PM)
- **Action:** Send email with daily posting summary
- **To:** team@elevateforhumanity.org

#### Zap 4: Backup to Airtable
- **Trigger:** Webhook
- **Action:** Create record in Airtable
- **Base:** Social Media Posts
- **Fields:** Date, Platform, Content, Engagement

#### Zap 5: Analytics to Data Studio
- **Trigger:** Webhook
- **Action:** Send to Google Data Studio
- **Dashboard:** Social Media Performance

---

## 6️⃣ Running the Automation

### Test Mode
Test posting to all platforms:
```bash
node scripts/social-media-automation.js test
```

### Start Scheduler
Start automated 3x daily posting:
```bash
node scripts/social-media-automation.js start
```

### Generate Report
View daily posting report:
```bash
node scripts/social-media-automation.js report
```

### Run as Background Service
Using PM2:
```bash
npm install -g pm2
pm2 start scripts/social-media-automation.js --name "social-automation" -- start
pm2 save
pm2 startup
```

---

## 7️⃣ Content Customization

### Edit Content Templates
Edit `scripts/social-media-automation.js`:

```javascript
getContentTemplate(type) {
  const templates = {
    program_highlight: {
      title: '🎓 Your Custom Title',
      body: 'Your custom content...',
      hashtags: ['#YourHashtag'],
      cta: 'Your CTA'
    }
  };
}
```

### Add Custom Content Types
```javascript
generateDailyContent() {
  content.push({
    time: '09:00',
    type: 'your_custom_type',
    platforms: ['facebook_1', 'linkedin'],
    content: this.getContentTemplate('your_custom_type'),
    media: { type: 'image', url: '/path/to/image.jpg' }
  });
}
```

---

## 8️⃣ Monitoring & Analytics

### View Post History
```bash
cat .autopilot_out/social-media-history.json
```

### Check Platform Status
```bash
curl http://localhost:3000/api/social/config
```

### View Analytics
```bash
curl http://localhost:3000/api/social/analytics
```

---

## 9️⃣ Troubleshooting

### Facebook: "Invalid OAuth access token"
- Token expired - regenerate long-lived token
- Check app permissions are granted

### YouTube: "Insufficient permissions"
- Re-run OAuth flow
- Ensure "YouTube Data API v3" is enabled

### LinkedIn: "Not authorized"
- Check company page admin access
- Verify API product access is approved

### Durable: "API key invalid"
- Regenerate API key in Durable dashboard
- Check API key format in .env

### Zapier: "Webhook not receiving data"
- Test webhook URL with curl:
  ```bash
  curl -X POST https://hooks.zapier.com/hooks/catch/YOUR_ID \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
  ```

---

## 🔟 Best Practices

### Content Strategy
- ✅ Mix educational, inspirational, and promotional content
- ✅ Use high-quality images and videos
- ✅ Include clear calls-to-action
- ✅ Respond to comments within 24 hours
- ✅ Track engagement metrics weekly

### Posting Schedule
- ✅ Maintain consistent 3x daily schedule
- ✅ Adjust times based on audience analytics
- ✅ Avoid posting on major holidays
- ✅ Schedule extra posts for special events

### Platform-Specific Tips
- **Facebook:** Use native video, ask questions, run polls
- **YouTube:** Post community updates, behind-the-scenes content
- **LinkedIn:** Share industry insights, professional achievements
- **Durable Blog:** Long-form content, SEO-optimized articles

### Compliance
- ✅ Follow platform posting guidelines
- ✅ Respect rate limits (avoid spam)
- ✅ Include required disclosures
- ✅ Obtain rights for all media used

---

## 📊 Success Metrics

Track these KPIs weekly:
- Total posts published
- Engagement rate (likes, comments, shares)
- Reach and impressions
- Click-through rate to website
- Follower growth
- Conversion rate (enrollments from social)

---

## 🆘 Support

Need help? Contact:
- **Technical Issues:** tech@elevateforhumanity.org
- **Content Questions:** marketing@elevateforhumanity.org
- **API Support:** See platform-specific documentation

---

## 📚 Additional Resources

- [Facebook Marketing API Docs](https://developers.facebook.com/docs/marketing-api)
- [YouTube Data API Docs](https://developers.google.com/youtube/v3)
- [LinkedIn Marketing API Docs](https://docs.microsoft.com/en-us/linkedin/marketing/)
- [Durable API Docs](https://durable.co/docs/api)
- [Zapier Webhooks Guide](https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0  
**Maintained by:** Elevate for Humanity Tech Team
