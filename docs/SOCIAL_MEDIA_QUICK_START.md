# Social Media Automation - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install axios express open
```

### 2. Run OAuth Setup Tool
```bash
node scripts/setup-social-oauth.js
```
This opens a browser interface to get all your tokens.

### 3. Test the System
```bash
node scripts/social-media-automation.js test
```

### 4. Start Automated Posting
```bash
node scripts/social-media-automation.js start
```

---

## 📅 Posting Schedule

| Time | Content Type | Platforms |
|------|-------------|-----------|
| **9:00 AM EST** | Educational/Inspirational | Facebook 1, LinkedIn, YouTube |
| **1:00 PM EST** | Engagement/Interactive | Facebook 2, LinkedIn, Durable Blog |
| **5:00 PM EST** | Call-to-Action | Facebook 1 & 2, LinkedIn |

---

## 🔑 Required Credentials

### Facebook (2 Pages)
- `FACEBOOK_PAGE_1_ID` - Main page ID
- `FACEBOOK_PAGE_1_TOKEN` - Main page access token
- `FACEBOOK_PAGE_2_ID` - Programs page ID
- `FACEBOOK_PAGE_2_TOKEN` - Programs page access token
- `FACEBOOK_APP_ID` - App ID
- `FACEBOOK_APP_SECRET` - App secret

### YouTube
- `YOUTUBE_CHANNEL_ID` - Channel ID
- `YOUTUBE_API_KEY` - API key
- `YOUTUBE_CLIENT_ID` - OAuth client ID
- `YOUTUBE_CLIENT_SECRET` - OAuth client secret
- `YOUTUBE_REFRESH_TOKEN` - OAuth refresh token

### LinkedIn
- `LINKEDIN_COMPANY_ID` - Company page ID
- `LINKEDIN_ACCESS_TOKEN` - Access token
- `LINKEDIN_CLIENT_ID` - OAuth client ID
- `LINKEDIN_CLIENT_SECRET` - OAuth client secret

### Durable.co
- `DURABLE_API_KEY` - API key from Durable dashboard
- `DURABLE_BLOG_URL` - Your blog URL

### Zapier (Optional)
- `ZAPIER_WEBHOOK_URL` - Webhook URL from Zapier

---

## 📊 Commands

```bash
# Test posting to all platforms
node scripts/social-media-automation.js test

# Start automated 3x daily posting
node scripts/social-media-automation.js start

# Generate daily report
node scripts/social-media-automation.js report

# Run as background service
pm2 start scripts/social-media-automation.js --name social -- start
```

---

## 🔗 Platform Links

- **Facebook Main:** https://facebook.com/elevateforhumanity
- **Facebook Programs:** https://facebook.com/elevateforhumanity-programs
- **YouTube:** https://youtube.com/@elevateforhumanity
- **LinkedIn:** https://linkedin.com/company/elevateforhumanity
- **Durable Blog:** https://elevateforhumanity.durable.co/blog

---

## 📈 Zapier Workflows

### Recommended Zaps:
1. **Post Notifications** → Slack channel
2. **Daily Reports** → Email to team
3. **Post Logging** → Google Sheets
4. **Analytics** → Airtable database
5. **Backup** → Google Drive

---

## 🆘 Troubleshooting

### "Invalid OAuth token"
→ Re-run: `node scripts/setup-social-oauth.js`

### "API rate limit exceeded"
→ Wait 15 minutes, tokens reset hourly

### "Permission denied"
→ Check admin access on all pages/channels

### "Webhook not working"
→ Test with: `curl -X POST YOUR_WEBHOOK_URL -d '{"test":"data"}'`

---

## 📞 Support

- **Setup Help:** See `docs/SOCIAL_MEDIA_AUTOMATION_SETUP.md`
- **Technical Issues:** tech@elevateforhumanity.org
- **Content Questions:** marketing@elevateforhumanity.org

---

**Last Updated:** October 15, 2025
