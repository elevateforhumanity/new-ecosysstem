# AI Website Stylist & Brand Asset Generator

## 🎨 Overview

The AI Website Stylist is a complete system for generating branded web pages and marketing assets using Workers AI. It maintains perfect brand consistency across all generated content.

**Brand Identity:**
- **Primary Color:** #E53935 (Red)
- **Secondary Color:** #FF9800 (Orange)
- **Accent Color:** #2196F3 (Blue)
- **Background:** #FFFFFF (White)
- **Text:** #0D0D0D (Dark)
- **Fonts:** Poppins (headings), Inter (body)
- **Tone:** Empowering, professional, energetic, trustworthy

**Cost:** $0/month (Workers AI free tier)

---

## 🏗️ Architecture

```
┌─────────────────────┐
│  React Dashboard    │
│  (AI Page Builder)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  AI Stylist Worker  │
│  (Workers AI)       │
│  - Generate pages   │
│  - Generate assets  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Database  │
│  - generated_pages  │
│  - page_versions    │
│  - generated_assets │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Page Deployer      │
│  (Auto-deploy)      │
│  - R2 Storage       │
│  - Cloudflare Pages │
└─────────────────────┘
```

---

## 📦 Components

### 1. AI Stylist Worker (`workers/stylist/ai-stylist.js`)

Generates branded content using Workers AI (Llama 3.1 8B).

**Endpoints:**
- `POST /generate` - Generate a complete page
- `POST /generate-section` - Generate a single section
- `POST /generate-asset` - Generate marketing asset
- `GET /theme` - Get brand theme
- `GET /templates` - List available templates

**Page Types:**
- `home` - Landing page with hero, features, CTA
- `about` - Organization story and team
- `programs` - Course catalog
- `contact` - Contact form and info
- `enroll` - Enrollment process
- `success` - Student testimonials

**Asset Types:**
- `social_post` - 1080x1080 Instagram/Facebook post
- `story` - 1080x1920 Instagram story
- `flyer` - 8.5x11 printable flyer
- `banner` - 1200x400 website banner
- `email_header` - 600x200 email header

### 2. React Components

**AIPageBuilder.tsx** - Main page generation interface
- Select page type
- Describe content
- Preview generated page
- Save and publish

**PageManager.tsx** - Page management dashboard
- View all pages
- Edit HTML
- Publish/unpublish
- Version history
- Rollback to previous versions

**AssetGenerator.tsx** - Marketing asset creator
- Generate social media posts
- Create flyers and banners
- Export as HTML or image
- Save to library

### 3. Page Deployer Worker (`workers/deployer/page-deployer.js`)

Automatically deploys published pages to R2 storage.

**Features:**
- Automatic deployment on publish
- Cron-based batch deployment
- Full HTML page generation
- Deployment logging
- Supabase webhook integration

### 4. Database Schema (`supabase/migrations/010_ai_generated_pages.sql`)

**Tables:**
- `generated_pages` - All generated pages
- `page_versions` - Version history
- `generated_sections` - Reusable components
- `generated_assets` - Marketing materials
- `page_analytics` - Performance metrics
- `deployment_logs` - Deployment history

---

## 🚀 Deployment

### Step 1: Deploy AI Stylist Worker

```bash
cd workers/stylist

# Set secrets
npx wrangler secret put CF_ACCOUNT_ID
npx wrangler secret put CF_API_TOKEN

# Deploy
npx wrangler deploy ai-stylist.js
```

### Step 2: Deploy Page Deployer Worker

```bash
cd workers/deployer

# Create R2 bucket
npx wrangler r2 bucket create efh-pages

# Set secrets
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_KEY

# Deploy
npx wrangler deploy page-deployer.js
```

### Step 3: Apply Database Migration

Run `010_ai_generated_pages.sql` in Supabase SQL Editor.

### Step 4: Update React App

Add the components to your admin dashboard:

```tsx
import AIPageBuilder from './components/AIPageBuilder';
import PageManager from './components/PageManager';
import AssetGenerator from './components/AssetGenerator';

// In your router
<Route path="/admin/page-builder" element={<AIPageBuilder />} />
<Route path="/admin/pages" element={<PageManager />} />
<Route path="/admin/assets" element={<AssetGenerator />} />
```

### Step 5: Configure Worker URLs

Update the worker URLs in the React components:

```tsx
// In AIPageBuilder.tsx, PageManager.tsx, AssetGenerator.tsx
const STYLIST_URL = 'https://efh-ai-stylist.your-subdomain.workers.dev';
const DEPLOYER_URL = 'https://efh-page-deployer.your-subdomain.workers.dev';
```

---

## 🎯 Usage

### Generate a Page

1. Go to **AI Page Builder** in admin dashboard
2. Select page type (e.g., "Home")
3. Describe the page: "Welcoming homepage highlighting our mission and programs"
4. Click "Generate Page with AI"
5. Preview the generated page
6. Enter page name and slug
7. Click "Save as Draft" or "Publish Live"

### Edit a Page

1. Go to **Page Manager**
2. Select a page from the list
3. Click "Edit HTML"
4. Make changes in the editor
5. Click "Save Changes"
6. Version is automatically created

### Rollback a Page

1. Go to **Page Manager**
2. Select a page
3. Scroll to "Version History"
4. Click "Rollback" on desired version

### Generate Marketing Asset

1. Go to **Asset Generator**
2. Select asset type (e.g., "Social Media Post")
3. Describe content: "Announce new program launch with enrollment CTA"
4. Click "Generate Asset with AI"
5. Preview the asset
6. Click "Save Asset" or "Download HTML"

---

## 📊 Database Schema

### generated_pages

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Page name |
| slug | TEXT | URL slug (unique) |
| page_type | TEXT | Page type |
| description | TEXT | Page description |
| html | TEXT | Generated HTML |
| tailwind_classes | JSONB | Used Tailwind classes |
| sections | JSONB | Section names |
| theme | JSONB | Brand theme |
| status | TEXT | draft/published/archived |
| version | INTEGER | Current version |
| published_at | TIMESTAMPTZ | Publish date |
| created_at | TIMESTAMPTZ | Creation date |

### page_versions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| page_id | UUID | Foreign key to generated_pages |
| version | INTEGER | Version number |
| html | TEXT | HTML at this version |
| created_at | TIMESTAMPTZ | Version creation date |

### generated_assets

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Asset name |
| asset_type | TEXT | Asset type |
| html | TEXT | Generated HTML |
| dimensions | TEXT | Dimensions (e.g., "1080x1080") |
| copy_text | TEXT | Marketing copy |
| summary | TEXT | Asset description |
| file_url | TEXT | Exported file URL |
| created_at | TIMESTAMPTZ | Creation date |

---

## 🎨 Customization

### Add New Page Type

Edit `workers/stylist/ai-stylist.js`:

```javascript
function getPageTemplates() {
  return {
    // ... existing templates
    custom: {
      name: "Custom Page",
      description: "Your custom page type",
      defaultSections: ["hero", "content", "cta"],
      examples: [
        "Example description 1",
        "Example description 2",
      ]
    }
  };
}
```

### Add New Asset Type

Edit `src/components/AssetGenerator.tsx`:

```typescript
const ASSET_TYPES: Record<string, AssetType> = {
  // ... existing types
  custom_asset: {
    id: 'custom_asset',
    name: 'Custom Asset',
    dimensions: '1200x630',
    description: 'Your custom asset type',
    examples: ['Example 1', 'Example 2'],
  },
};
```

### Customize Brand Theme

Edit `workers/stylist/ai-stylist.js`:

```javascript
const BRAND_THEME = {
  colors: {
    primary: "#YOUR_PRIMARY_COLOR",
    secondary: "#YOUR_SECONDARY_COLOR",
    accent: "#YOUR_ACCENT_COLOR",
    background: "#FFFFFF",
    text: "#0D0D0D"
  },
  fonts: {
    heading: "Your Heading Font",
    body: "Your Body Font"
  },
  tone: "Your brand tone",
  organization: "Your Organization Name",
  mission: "Your mission statement"
};
```

---

## 📈 Analytics

Track page performance in the `page_analytics` table:

```sql
SELECT 
  p.name,
  p.slug,
  a.views,
  a.unique_visitors,
  a.avg_time_on_page,
  a.conversion_rate
FROM generated_pages p
JOIN page_analytics a ON p.id = a.page_id
WHERE a.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY a.views DESC;
```

---

## 🔧 API Reference

### Generate Page

```bash
POST https://efh-ai-stylist.your-subdomain.workers.dev/generate

{
  "pageType": "home",
  "description": "Welcoming homepage highlighting our mission",
  "sections": ["hero", "features", "testimonials", "cta"]
}

Response:
{
  "success": true,
  "page": {
    "html": "<section>...</section>",
    "tailwindClasses": ["text-red-600", "bg-orange-500"],
    "summary": "Homepage with hero section and CTA",
    "sections": ["hero", "features", "cta"],
    "pageType": "home",
    "theme": {...},
    "generatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Generate Asset

```bash
POST https://efh-ai-stylist.your-subdomain.workers.dev/generate-asset

{
  "assetType": "social_post",
  "content": "Announce new program launch"
}

Response:
{
  "success": true,
  "asset": {
    "html": "<div>...</div>",
    "dimensions": "1080x1080",
    "summary": "Social media post for program launch",
    "copyText": "Join our new program today!"
  }
}
```

### Deploy Page

```bash
POST https://efh-page-deployer.your-subdomain.workers.dev/deploy

{
  "pageId": "uuid-here",
  "slug": "home",
  "html": "<section>...</section>"
}

Response:
{
  "success": true,
  "result": {
    "pageId": "uuid-here",
    "slug": "home",
    "url": "https://your-domain.com/pages/home",
    "deployedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## 💰 Cost Breakdown

**Free Tier:**
- Workers AI: 10k requests/day
- Cloudflare Workers: 100k requests/day
- R2 Storage: 10GB storage, 1M reads/month
- Supabase: 500MB database

**Estimated Monthly Cost:**
- **100 pages generated:** $0 (within free tier)
- **1000 pages generated:** $0 (within free tier)
- **10,000 pages generated:** ~$5 (Workers AI overage)

**Savings vs Traditional:**
- Designer: $50-200/page
- Developer: $100-500/page
- **AI Stylist: $0/page** ✅

---

## 🎉 Features

✅ **Zero-cost page generation** with Workers AI
✅ **Perfect brand consistency** across all content
✅ **Version control** with automatic history
✅ **One-click rollback** to previous versions
✅ **Auto-deployment** to R2/Cloudflare Pages
✅ **Marketing asset generation** for social media
✅ **Reusable section library** for consistency
✅ **HTML export** for external use
✅ **Analytics tracking** for performance
✅ **Responsive design** mobile-first approach

---

## 🚧 Roadmap

### Phase 1 (Current)
- [x] AI page generation
- [x] Brand asset creation
- [x] Version control
- [x] Auto-deployment

### Phase 2 (Next)
- [ ] Image generation with DALL-E/Stable Diffusion
- [ ] A/B testing for pages
- [ ] SEO optimization suggestions
- [ ] Accessibility audit
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] Video content generation
- [ ] Interactive components
- [ ] E-commerce integration
- [ ] CMS integration
- [ ] White-label solution

---

## 📚 Resources

- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [R2 Storage](https://developers.cloudflare.com/r2/)

---

## 🎯 Success Metrics

Track these KPIs:

1. **Generation Speed** - Time to generate page (target: < 10 seconds)
2. **Brand Consistency** - % of pages using correct colors (target: 100%)
3. **Deployment Success** - % of successful deployments (target: 99%)
4. **User Satisfaction** - Ratings from content creators (target: 4.5/5)
5. **Cost Savings** - vs traditional design/development (target: 95%+)

---

**All code committed and ready to deploy!** 🚀

Generate beautiful, branded pages in seconds with zero design or development costs.
