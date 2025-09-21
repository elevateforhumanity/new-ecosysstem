# Elevate4Humanity Complete Autopilot 🚀

**Near-complete automation** for your entire stack: Wix CMS content, Netlify deploys, Cloudflare DNS/SSL, Supabase sync, SEO, performance gates, and backups.

## 🎯 What the Autopilot CAN Do

### ✅ Fully Automated
- **Wix CMS**: Create/update/delete programs, events, partners via API
- **Dynamic Pages**: Auto-generate pages at `/programs/{slug}` when CMS items change
- **Media Management**: Upload images from URLs to Wix Media Manager
- **Netlify Deploys**: Trigger builds, attach domains, provision SSL
- **Cloudflare DNS**: Set CNAMEs, enable security features, manage SSL
- **Supabase Sync**: Bi-directional sync between Supabase and Wix
- **SEO**: Generate sitemaps, ping search engines, performance audits
- **Quality Gates**: Block deploys on accessibility/performance failures
- **Backups**: Automated Supabase dumps to cloud storage
- **Monitoring**: Uptime checks, broken link detection, error alerts

### ❌ Wix Limitations (Manual Setup Required)
- **Visual Editor**: Cannot drag/drop sections or modify layouts
- **Theme Changes**: Cannot change colors, fonts, or design via API
- **Page Templates**: Cannot create new page types or modify existing templates
- **Domain Hosting**: Cannot manage Wix-hosted domains (use Cloudflare instead)

## 🔐 Permissions & Secrets Setup

### Required Environment Variables

Set these in Gitpod Settings → Variables:

```bash
# Wix (Headless Admin API Key)
WIX_API_KEY=your-admin-api-key-here
WIX_SITE_ID=your-site-id-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Netlify
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-personal-access-token
NETLIFY_BUILD_HOOK=your-build-hook-id

# Cloudflare
CF_API_TOKEN=your-api-token
CF_ZONE_ID=your-zone-id

# Domain
DOMAIN=elevate4humanity.org

# SEO & Analytics
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=your-google-verification-code
BING_SITE_VERIFICATION=your-bing-verification-code

# Optional Integrations
STRIPE_SECRET_KEY=sk_live_...
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_NUMBER=+1234567890
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Backup Storage (Optional)
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=elevate4humanity-backups
```

### Permission Requirements

**Wix Admin API Key needs:**
- CMS: Read/Write data items and query collections
- Media: Upload files and images
- Stores: Read/Write products (if using Wix Stores)

**Netlify Token needs:**
- Sites: Read/Write site configuration
- Deploys: Trigger builds and deployments
- DNS: Manage domain settings

**Cloudflare Token needs:**
- Zone: DNS Edit permissions
- Zone: SSL/TLS Read permissions
- Zone: Security settings

## 🚀 Quick Start

### 1. One-Time Wix Setup

Create CMS Collection called `programs` with these exact fields:

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

Create Dynamic Page:
1. In Wix Editor → Add → Page → Dynamic Page
2. Connect to `programs` collection
3. Set URL pattern: `/programs/{slug}`
4. Bind fields in your template

### 2. Install Dependencies

```bash
npm install
```

### 3. Test Connection

```bash
npm run wix:test
```

### 4. Run Complete Autopilot

```bash
# Test first with dry run
npm run autopilot:dry

# Then run full automation
npm run autopilot:full
```

## 📋 Available Commands

### Wix CMS Operations
```bash
npm run wix:test          # Test API connection
npm run wix:upsert        # Bulk create/update programs
npm run wix:single -- healthcare-assistant "Healthcare Assistant Program"
npm run wix:delete -- program-slug
npm run wix:delete -- --list
```

### Content Synchronization
```bash
npm run content:sync      # Supabase → Wix sync
npm run content:reverse   # Wix → Supabase sync
npm run content:audit     # Fix duplicate/missing slugs
```

### Infrastructure Automation
```bash
npm run auto:sync         # Nightly Supabase → Wix sync
npm run auto:sitemaps     # Generate and ping sitemaps
npm run auto:performance  # Lighthouse performance audit
npm run auto:security     # Cloudflare security hardening
npm run auto:backup       # Backup Supabase to cloud storage
npm run auto:links        # Check for broken links
npm run auto:a11y         # Accessibility scan
npm run auto:all          # Run all automations
```

### SEO & Search Engine Optimization
```bash
npm run seo:sitemap       # Generate sitemap from Supabase
npm run seo:meta          # Generate meta tags for all programs
npm run seo:ga4           # Inject Google Analytics 4
npm run seo:ping          # Ping Google & Bing with sitemap
npm run seo:all           # Complete SEO optimization
```

### Cache Management
```bash
npm run cache:purge       # Emergency cache purge (everything)
npm run cache:smart       # Smart cache purge based on changes
npm run cache:verify      # Verify cache purge effectiveness
```

### Hero Video Generation
```bash
./scripts/install-video-deps.sh  # One-time: Install video dependencies
npm run video:hero               # Generate professional hero video
npm run video:replace            # Replace homepage video
npm run video:verify             # Verify video replacement
```

### Complete Autopilot
```bash
npm run autopilot:full    # Complete automation: sync → SEO → video → deploy → cache → ping
npm run autopilot:dry     # Dry run mode (test without changes)
```

### Deployment & DNS
```bash
./scripts/cf-netlify-domain-autopilot.sh  # DNS + SSL setup
./scripts/netlify-deploy-trigger.sh       # Force deploy
./scripts/blue-green-switch.sh            # Zero-downtime switch
```

## 🔄 Automation Workflows

### Daily Automation (Cron)
```bash
# Run complete autopilot at 2 AM daily
0 2 * * * cd /workspace/new-ecosysstem && npm run autopilot:full

# Alternative: Run individual components
0 2 * * * cd /workspace/new-ecosysstem && npm run auto:sync
0 3 * * * cd /workspace/new-ecosysstem && npm run seo:all
0 4 * * * cd /workspace/new-ecosysstem && npm run cache:smart
```

### Pre-Deploy Quality Gates
```bash
npm run auto:performance  # Must pass 90+ scores
npm run auto:a11y        # Must have 0 WCAG violations
npm run auto:links       # Must have no broken links
npm run seo:all          # Generate fresh SEO assets
```

### Content Publishing Workflow
1. Update content in Supabase
2. Run `npm run autopilot:full` (complete pipeline)
3. Verify at `https://elevate4humanity.org/programs/{slug}`
4. Check Google Search Console for indexing

### Manual Content Publishing
1. Update content in Supabase
2. Run `npm run content:sync`
3. Run `npm run seo:all`
4. Run `npm run cache:smart`
5. Verify changes live

## 🛠️ Advanced Features

### Blue/Green Deployments
```bash
# Switch www subdomain between two Netlify sites
./scripts/blue-green-switch.sh site-id-blue site-id-green
```

### Bulk Media Upload
```bash
# Upload images from URLs to Wix Media Manager
npm run wix:media -- "https://example.com/image.jpg"
```

### Smart Embed Processing
Automatically optimizes embed codes for:
- Calendly (responsive sizing)
- YouTube (lazy loading)
- Google Forms (proper dimensions)
- Typeform (mobile-friendly)

### Slug Management
```bash
# Auto-generate slugs from titles
# Fix duplicate slugs
# Validate URL-safe formatting
npm run content:audit
```

## 📊 Monitoring & Alerts

### Slack Notifications
Set `SLACK_WEBHOOK_URL` to receive alerts for:
- Deployment successes/failures
- Quality gate violations
- Sync errors
- Performance degradation

### Health Checks
```bash
# Check site availability
curl -f https://elevate4humanity.org/health

# Check API endpoints
npm run auto:links
```

## 🔧 Troubleshooting

### "Programs collection not found"
Create the CMS collection in Wix with exact field names above.

### "API connection failed"
- Verify `WIX_API_KEY` and `WIX_SITE_ID`
- Check API key has CMS permissions
- Ensure Wix site is published

### "Dynamic pages not working"
- Create dynamic page template in Wix Editor
- Set URL pattern to `/programs/{slug}`
- Bind all fields correctly

### "Embeds not showing"
- Use Rich Text field type for `embedHtml`
- Bind to HTML component in dynamic page
- Test with simple HTML first

### "DNS/SSL issues"
- Verify Cloudflare API token permissions
- Check zone ID is correct
- Allow 24-48 hours for DNS propagation

## 📁 File Structure

```
scripts/
├── wix-client.js                 # Shared Wix API client
├── wix-upsert-programs.js        # Bulk program creation
├── wix-upsert-one.js            # Single program creation
├── wix-delete-by-slug.js        # Program deletion
├── wix-test-connection.js       # Connection testing
├── content-sync-engine.js       # Advanced sync logic
├── automation-suite.js          # Orchestration engine
├── netlify-deploy-hooks.js      # Deployment automation
├── cf-netlify-domain-autopilot.sh # DNS/SSL setup
├── cf-security-rules.json       # Cloudflare security config
└── backup-supabase.sh           # Database backups

.gitpod.yml                      # Gitpod task configuration
package.json                     # NPM scripts and dependencies
README-WIX-AUTOPILOT.md         # Wix-specific documentation
```

## 🎯 Expected Supabase Schema

For full automation, create this table structure:

```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  summary TEXT,
  content_html TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_url TEXT,
  embed_html TEXT,
  hero_image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## 🚀 Next Steps

1. **Set environment variables** in Gitpod
2. **Create Wix CMS collection** with required fields
3. **Set up dynamic page template** in Wix Editor
4. **Run initial sync**: `npm run wix:upsert`
5. **Configure daily automation**: Add cron job
6. **Set up monitoring**: Configure Slack webhooks
7. **Test quality gates**: Run `npm run auto:all`

## 🔄 Rollback Procedures

### Revert Content Changes
```bash
# Restore from Supabase backup
psql $SUPABASE_DB_URL < backups/supabase-YYYY-MM-DD.sql

# Re-sync to Wix
npm run content:sync
```

### Revert Deployment
```bash
# Switch back to previous Netlify site
./scripts/blue-green-switch.sh $PREVIOUS_SITE_ID $CURRENT_SITE_ID
```

### Emergency Stop
```bash
# Disable all automations
export AUTOPILOT_DISABLED=true

# Manual intervention required for:
# - Wix visual editor changes
# - Domain hosting changes
# - Theme modifications
```

---

**🎉 Your autopilot can now handle 95% of your stack operations automatically!**

The remaining 5% (visual design, layout changes) requires manual work in Wix Editor, but all content, deployments, DNS, monitoring, and maintenance are fully automated.