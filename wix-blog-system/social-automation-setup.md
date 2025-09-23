# Social Media Automation Setup for EFH Blog

## Overview
This setup automatically posts new blog content to your **business Facebook page only** (elevateforhumanity) when new posts are published.

## RSS Feed Integration

### Your RSS Feed URL:
```
https://elevateforhumanity.org/_functions/blog/rss
```

## Zapier Setup (Recommended)

### 1. Create New Zap
1. **Trigger**: RSS by Zapier
   - Feed URL: `https://elevateforhumanity.org/_functions/blog/rss`
   - Trigger: New Item in Feed

### 2. Add Facebook Pages Action
1. **Action**: Facebook Pages by Zapier
   - Action: Create Page Post
   - Page: Select "Elevate for Humanity" business page
   - Message: 
     ```
     📖 New Blog Post: {{title}}
     
     {{description}}
     
     Read more: {{link}}
     
     #WorkforceDevelopment #CareerTraining #ElevateForHumanity
     ```

### 3. Optional: Add LinkedIn Company Page
1. **Action**: LinkedIn by Zapier
   - Action: Share Update
   - Company Page: elevate-for-humanity
   - Message: Same format as Facebook

### 4. Optional: Add Instagram Business
1. **Action**: Instagram for Business by Zapier
   - Action: Create Media Object
   - Caption: Shortened version with hashtags

## Make.com Setup (Alternative)

### 1. RSS Module
- Module: RSS > Watch RSS feed items
- URL: `https://elevateforhumanity.org/_functions/blog/rss`

### 2. Facebook Pages Module
- Module: Facebook Pages > Create a Post
- Page: Elevate for Humanity
- Message: Use RSS title and description

## Manual Facebook Business Page Posting

### Post Template:
```
📖 New Blog Post: [TITLE]

[EXCERPT]

Learn more about [TOPIC] and how it can help your career development.

Read the full article: [BLOG_URL]

#WorkforceDevelopment #CareerTraining #WIOA #JobTraining #ElevateForHumanity #Indianapolis #Indiana
```

### Recommended Hashtags:
- #WorkforceDevelopment
- #CareerTraining
- #WIOA
- #JobTraining
- #ElevateForHumanity
- #Indianapolis
- #Indiana
- #SkillsTraining
- #CareerChange
- #SuccessStory (for success story posts)

## Content Strategy

### Post Types:
1. **Success Stories** - Graduate achievements and career transformations
2. **Program Updates** - New courses, certifications, partnerships
3. **Industry Insights** - Workforce trends, job market updates
4. **Tips & Advice** - Career development, interview prep, resume tips
5. **Behind the Scenes** - Team updates, facility tours, events

### Posting Schedule:
- **Blog Posts**: 2-3 times per week
- **Facebook**: Auto-post when blog publishes + 1-2 additional posts
- **LinkedIn**: Professional content focus
- **Instagram**: Visual content with stories

## Privacy & Security

### ✅ What's Included:
- Business Facebook page (elevateforhumanity)
- Business LinkedIn company page
- Business Instagram account
- Public blog content only

### ❌ What's NOT Included:
- Personal Facebook profiles
- Personal social media accounts
- Private/internal content
- Student personal information

## Testing the Setup

### 1. Publish Test Post:
```bash
node wix-blog-system/push-blog.mjs single welcome-to-efh
```

### 2. Check RSS Feed:
Visit: `https://elevateforhumanity.org/_functions/blog/rss`

### 3. Verify Automation:
- Check Zapier/Make logs
- Confirm Facebook business page post
- Test social media links

## Monitoring & Analytics

### Track Performance:
1. **Facebook Insights** - Reach, engagement, clicks
2. **Google Analytics** - Blog traffic from social
3. **Zapier/Make Logs** - Automation success rate
4. **RSS Feed Stats** - Subscriber count

### Monthly Review:
- Top performing posts
- Social media engagement rates
- Blog traffic sources
- Conversion from social to applications

## Troubleshooting

### Common Issues:
1. **RSS not updating**: Check blog publication status
2. **Facebook not posting**: Verify page permissions
3. **Automation failing**: Check Zapier/Make connection
4. **Poor engagement**: Review content strategy and timing

### Support:
- Zapier: help.zapier.com
- Make.com: make.com/en/help
- Facebook Business: business.facebook.com/help