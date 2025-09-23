# EFH Blog System - Complete Setup Guide

## 🎯 Overview
This blog system automatically publishes content to your Wix site and triggers social media automation to your **business Facebook page only**.

## 📁 Files Included

### Frontend (Wix Editor)
- `blog-list.js` - Blog listing page code (`/blog`)
- `blog-item.js` - Individual blog post page code (`/blog/{slug}`)

### Backend (Wix Editor)
- `backend-http-functions.js` - API endpoints for blog management

### Content & Automation
- `blog-starter-posts.json` - 4 sample blog posts to get started
- `push-blog.mjs` - Script to publish posts to Wix
- `social-automation-setup.md` - Complete social media automation guide

## 🚀 Quick Setup (5 minutes)

### 1. Wix CMS Collection
Create a collection called `BlogPosts` with these fields:
- `title` (Text, required)
- `slug` (Text, required, unique)
- `excerpt` (Text)
- `content` (Rich Text)
- `coverImage` (Image)
- `tags` (Tags)
- `author` (Text)
- `publishedAt` (Date/Time)
- `isPublished` (Boolean, default true)

### 2. Dynamic Pages
- **List Page**: `/blog` bound to BlogPosts collection
- **Item Page**: `/blog/{slug}` bound to BlogPosts collection

### 3. Page Elements
**Blog List Page (`/blog`):**
- `#blogRepeater` (Repeater)
  - `#cardTitle` (Text)
  - `#cardExcerpt` (Text)
  - `#cardImage` (Image)
  - `#cardLink` (Button)
  - `#cardMeta` (Text, optional)

**Blog Post Page (`/blog/{slug}`):**
- `#dataset1` (Dataset bound to BlogPosts)
- `#postTitle` (Text)
- `#postContent` (Rich Text)
- `#postImage` (Image)
- `#postMeta` (Text)
- `#backToBlog` (Button, optional)

### 4. Add Code
1. Copy `blog-list.js` to your blog list page code
2. Copy `blog-item.js` to your blog post page code
3. Copy `backend-http-functions.js` to Backend > HTTP Functions

### 5. Publish Sample Posts
```bash
# Make script executable
chmod +x wix-blog-system/push-blog.mjs

# Update API token in push-blog.mjs first!
# Then publish all sample posts
node wix-blog-system/push-blog.mjs
```

## 🔧 Configuration

### API Security
1. Open `push-blog.mjs`
2. Change `API_TOKEN` to a secure random string
3. Update the same token in `backend-http-functions.js`

### Social Media Automation
1. Follow `social-automation-setup.md`
2. Set up Zapier or Make.com to monitor RSS feed
3. Configure auto-posting to Facebook business page only

## 📱 Social Media Strategy

### Business Pages Only:
- ✅ Facebook: elevateforhumanity
- ✅ LinkedIn: company/elevate-for-humanity
- ✅ Instagram: elevateforhumanity
- ✅ YouTube: @elevateforhumanity

### Privacy Protected:
- ❌ No personal social media access
- ❌ No personal Facebook integration
- ❌ Business content only

## 🎨 Content Types

### 1. Success Stories
```json
{
  "title": "Success Story: From Unemployment to $65K Healthcare Career",
  "tags": ["success-story", "healthcare", "career-change"],
  "author": "Liz Jae"
}
```

### 2. Program Updates
```json
{
  "title": "New Cybersecurity Certification Program Launched",
  "tags": ["programs", "cybersecurity", "certification"],
  "author": "EFH Team"
}
```

### 3. Industry Insights
```json
{
  "title": "The Future of Workforce Development in 2024",
  "tags": ["industry", "trends", "workforce-development"],
  "author": "Liz Jae"
}
```

## 🔗 URLs & Endpoints

### Public URLs:
- Blog List: `https://elevateforhumanity.org/blog`
- RSS Feed: `https://elevateforhumanity.org/_functions/blog/rss`
- Individual Posts: `https://elevateforhumanity.org/blog/{slug}`

### API Endpoints:
- Publish Post: `POST /_functions/blog/upsert`
- Get Posts: `GET /_functions/blog/posts`
- Delete Post: `DELETE /_functions/blog/delete/{slug}`

## 📊 Analytics & Monitoring

### Track Performance:
1. **Wix Analytics** - Blog page views, time on page
2. **Facebook Insights** - Business page engagement
3. **Google Analytics** - Traffic sources, conversions
4. **RSS Subscribers** - Feed monitoring tools

### Key Metrics:
- Blog post views
- Social media clicks to blog
- Application conversions from blog traffic
- Email signups from blog content

## 🛠️ Maintenance

### Weekly Tasks:
- Publish 2-3 new blog posts
- Review social media automation logs
- Check RSS feed functionality
- Monitor blog performance metrics

### Monthly Tasks:
- Analyze top-performing content
- Update content strategy based on metrics
- Review and update automation settings
- Archive or update outdated posts

## 🆘 Troubleshooting

### Common Issues:

**Blog posts not appearing:**
- Check `isPublished` field is true
- Verify CMS collection permissions
- Check dynamic page binding

**Social automation not working:**
- Verify RSS feed is updating
- Check Zapier/Make connection status
- Confirm Facebook page permissions

**API errors:**
- Verify API token matches in both files
- Check HTTP Functions are published
- Review browser console for errors

### Support Resources:
- Wix Developer Docs: dev.wix.com
- Zapier Help: help.zapier.com
- Make.com Support: make.com/en/help

## 🎯 Next Steps

1. **Set up the Wix CMS collection and pages**
2. **Add the code to your Wix editor**
3. **Configure API security tokens**
4. **Publish sample blog posts**
5. **Set up social media automation**
6. **Test the complete workflow**
7. **Start creating regular content**

Your blog system will now automatically:
- ✅ Display posts on your website
- ✅ Generate RSS feeds for automation
- ✅ Post to business social media only
- ✅ Provide rich social media previews
- ✅ Track performance and engagement