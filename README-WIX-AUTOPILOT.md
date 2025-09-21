# Wix CMS Autopilot 🚀

Automated Wix CMS page creation system that creates dynamic pages with embeds for training programs.

## 🎯 What This Does

- **Creates pages automatically** when you add items to Wix CMS
- **Embeds Calendly, YouTube, forms** directly into pages
- **Manages WIOA-approved training programs** with rich content
- **Runs from Gitpod** or any CI/CD environment
- **Syncs with Supabase** (optional) for external data management

## 🏗️ One-Time Wix Setup

### 1. Create CMS Collection

In your Wix site, create a **CMS Collection** called `programs` with these fields:

| Field Name | Type | Required | Unique |
|------------|------|----------|--------|
| `title` | Text | ✅ | ❌ |
| `slug` | Text | ✅ | ✅ |
| `summary` | Text | ❌ | ❌ |
| `content` | Rich Text | ❌ | ❌ |
| `heroImage` | Image | ❌ | ❌ |
| `ctaText` | Text | ❌ | ❌ |
| `ctaUrl` | URL | ❌ | ❌ |
| `embedHtml` | Rich Text | ❌ | ❌ |

### 2. Create Dynamic Page

1. In Wix Editor, create a **Dynamic Page**
2. Connect it to the `programs` collection
3. Set URL pattern: `/programs/{slug}`
4. Bind the fields in your page template:
   - Title → `title`
   - Content → `content`
   - Button → `ctaText` + `ctaUrl`
   - HTML Embed → `embedHtml`
   - Hero Image → `heroImage`

### 3. Get API Credentials

1. Go to **Wix Dashboard** → **Settings** → **Headless**
2. Create an **Admin API Key**
3. Copy your **Site ID** from the URL or dashboard

## 🔧 Environment Setup

Set these environment variables in Gitpod:

```bash
# Required
export WIX_API_KEY="your-admin-api-key"
export WIX_SITE_ID="your-site-id"

# Optional (for Supabase integration)
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## 🚀 Usage

### Test Connection
```bash
npm run wix:test
```

### Create All Training Programs
```bash
npm run wix:upsert
```

### Create Single Program
```bash
npm run wix:single -- healthcare-assistant "Healthcare Assistant Program"
```

### Delete Program
```bash
npm run wix:delete -- healthcare-assistant
```

### List All Programs
```bash
npm run wix:delete -- --list
```

## 📊 Built-in Training Programs

The system includes 4 WIOA-approved programs:

1. **Healthcare Assistant** (`healthcare-assistant`)
   - 12 weeks, $35k-45k salary
   - Calendly embed for enrollment

2. **IT Support Specialist** (`it-support-specialist`)
   - 16 weeks, $42k-55k salary
   - YouTube video embed

3. **Construction Trades** (`construction-trades`)
   - 14 weeks, $38k-52k salary
   - Calendly embed for consultation

4. **Medical Administrative Assistant** (`medical-administrative-assistant`)
   - 10 weeks, $32k-42k salary
   - Calendly embed for enrollment

## 🔗 Result

After running the scripts, you'll have:

- **Dynamic pages** at `https://elevate4humanity.org/programs/{slug}`
- **Embedded Calendly/YouTube** on each page
- **Professional content** with WIOA compliance badges
- **Automatic page creation** when you add new CMS items

## 🛠️ Customization

### Add Custom Program

```bash
# Set custom fields via environment variables
export PROGRAM_SUMMARY="Custom program description"
export PROGRAM_CTA_TEXT="Enroll Today"
export PROGRAM_CTA_URL="https://your-checkout.com"
export PROGRAM_EMBED_HTML="<iframe src='...'></iframe>"
export PROGRAM_HERO_IMAGE="https://your-image.jpg"

npm run wix:single -- custom-program "Custom Program Title"
```

### Use Supabase Data Source

Uncomment the Supabase integration in `scripts/wix-upsert-programs.js` and set the environment variables.

## 🔍 Troubleshooting

### "Programs collection not found"
Create the CMS collection in Wix with the exact field names listed above.

### "API connection failed"
- Check your `WIX_API_KEY` and `WIX_SITE_ID`
- Verify API key has CMS permissions
- Ensure your Wix site is published

### "Dynamic pages not working"
- Create the dynamic page template in Wix Editor
- Bind all fields correctly
- Set URL pattern to `/programs/{slug}`

### "Embeds not showing"
- Use the Rich Text field type for `embedHtml`
- Bind to an HTML component in your dynamic page
- Test with simple HTML first

## 📁 File Structure

```
scripts/
├── wix-client.js           # API client and helpers
├── wix-upsert-programs.js  # Bulk program creation
├── wix-upsert-one.js       # Single program creation
├── wix-delete-by-slug.js   # Program deletion
└── wix-test-connection.js  # Connection testing
```

## 🎯 Alternative: Astro Static Site

If you prefer not to use Wix, this same pattern works with **Astro** on Netlify:
- Generate static pages from Supabase/JSON
- Embed HTML goes directly into page templates
- Deploy to Netlify with automatic rebuilds

Let me know if you want the Astro variant!