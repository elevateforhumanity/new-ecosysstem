# Sitemap Configuration Guide

## Overview

The EFH platform uses an optimized sitemap structure with URLs grouped in sets of 50 for efficient crawling by search engines.

---

## Current Structure

### Sitemap Index
- **Location:** `/sitemap.xml`
- **Purpose:** Points to all individual sitemaps
- **Format:** XML Sitemap Index

### Individual Sitemaps
- **Location:** `/sitemaps/sitemap-{n}.xml`
- **URLs per file:** 50 (maximum)
- **Total files:** 3
- **Total URLs:** 102

```
/sitemap.xml (index)
├── /sitemaps/sitemap-1.xml (50 URLs)
├── /sitemaps/sitemap-2.xml (50 URLs)
└── /sitemaps/sitemap-3.xml (2 URLs)
```

---

## URL Priority Levels

### Priority 1.0 (Highest)
- Homepage (`/`)

### Priority 0.9 (Very High)
- Main sections: `/programs`, `/lms`, `/about`, `/contact`, `/get-started`

### Priority 0.8 (High)
- Student/Instructor portals: `/student`, `/instructor`, `/courses`

### Priority 0.7 (Normal)
- All other pages

### Priority 0.5 (Low)
- Legal pages: `/privacy-policy`, `/terms-of-service`, `/refund-policy`, `/accessibility`

---

## Change Frequency

### Daily
- Homepage
- Blog/News pages

### Weekly
- Programs
- Courses
- LMS pages

### Monthly
- Most content pages

### Yearly
- Legal pages
- Static content

---

## Generation Process

### Automatic Generation

Sitemaps are automatically generated during build:

```bash
npm run build
# Runs: node scripts/generate-sitemap-complete.mjs
```

### Manual Generation

```bash
npm run sitemap:generate
```

### Verification

```bash
npm run sitemap:verify
```

### Crawlability Test

```bash
npm run sitemap:test
```

---

## Robots.txt Configuration

### Location
`/robots.txt`

### Content
```
User-agent: *
Allow: /

# Disallow private areas
Disallow: /api/
Disallow: /admin/
Disallow: /admin-console
Disallow: /_next/
Disallow: /private/

# Sitemap
Sitemap: https://elevateforhumanity.org/sitemap.xml

# Crawl-delay
Crawl-delay: 1
```

---

## Search Engine Submission

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to **Sitemaps** in the left menu
4. Enter: `https://elevateforhumanity.org/sitemap.xml`
5. Click **Submit**

**Or use ping URL:**
```
https://www.google.com/ping?sitemap=https://elevateforhumanity.org/sitemap.xml
```

### Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Select your site
3. Go to **Sitemaps**
4. Enter: `https://elevateforhumanity.org/sitemap.xml`
5. Click **Submit**

**Or use ping URL:**
```
https://www.bing.com/ping?sitemap=https://elevateforhumanity.org/sitemap.xml
```

---

## Monitoring

### Check Sitemap Status

**Google Search Console:**
1. Go to **Sitemaps**
2. View submitted sitemaps
3. Check for errors

**Bing Webmaster Tools:**
1. Go to **Sitemaps**
2. View sitemap status
3. Check crawl stats

### Common Issues

#### Sitemap Not Found (404)
- Verify file exists at `/sitemap.xml`
- Check deployment included sitemaps
- Verify URL in robots.txt

#### URLs Not Indexed
- Check robots.txt isn't blocking
- Verify URLs are accessible
- Check for redirect chains
- Ensure HTTPS is working

#### Duplicate URLs
- Run `npm run sitemap:verify`
- Check for multiple routes to same content
- Verify canonical tags

---

## Best Practices

### URL Structure
✅ **Good:**
- `https://elevateforhumanity.org/programs`
- `https://elevateforhumanity.org/courses/web-development`

❌ **Avoid:**
- Query parameters: `?page=1`
- Fragments: `#section`
- Session IDs: `?sid=123`
- Tracking parameters: `?utm_source=...`

### Update Frequency

**Update sitemaps when:**
- Adding new pages
- Removing pages
- Changing URL structure
- Major content updates

**Don't update for:**
- Minor text changes
- Style updates
- Small bug fixes

### File Size Limits

**Per sitemap file:**
- Max URLs: 50,000 (we use 50 for better organization)
- Max file size: 50MB uncompressed
- Max file size: 10MB compressed

**Sitemap index:**
- Max sitemaps: 50,000
- Max file size: 50MB uncompressed

---

## Troubleshooting

### Verify Sitemap Validity

```bash
# Check XML syntax
xmllint --noout dist/sitemap.xml

# Verify all sitemaps
npm run sitemap:verify
```

### Test Crawlability

```bash
npm run sitemap:test
```

### Check Robots.txt

```bash
curl https://elevateforhumanity.org/robots.txt
```

### Validate URLs

```bash
# Check a specific URL
curl -I https://elevateforhumanity.org/programs

# Should return: HTTP/2 200
```

---

## Advanced Configuration

### Custom Priority Rules

Edit `scripts/generate-sitemap-complete.mjs`:

```javascript
function getPriority(url) {
  if (url === '/') return '1.0';
  if (url.match(/^\/(programs|lms)/)) return '0.9';
  // Add custom rules here
  return '0.7';
}
```

### Custom Change Frequency

```javascript
function getChangeFreq(url) {
  if (url === '/') return 'daily';
  if (url.match(/^\/blog/)) return 'daily';
  // Add custom rules here
  return 'monthly';
}
```

### Exclude URLs

```javascript
// In generate-sitemap-complete.mjs
const excludePatterns = [
  /^\/admin/,
  /^\/api/,
  /^\/private/,
  /\.json$/,
];

const urls = allUrls.filter(url => {
  return !excludePatterns.some(pattern => pattern.test(url));
});
```

---

## Automation

### GitHub Actions

Sitemaps are automatically generated on every deployment via the `postbuild` script.

### Manual Trigger

```bash
# Generate sitemaps
npm run sitemap:generate

# Verify
npm run sitemap:verify

# Test crawlability
npm run sitemap:test
```

---

## Performance Impact

### Benefits
- **Faster indexing** - Search engines discover pages quickly
- **Better crawl budget** - Organized structure helps crawlers
- **Improved SEO** - All pages are discoverable
- **Priority signals** - Important pages indexed first

### Metrics
- **Generation time:** < 1 second
- **File size:** ~15KB total (uncompressed)
- **URLs indexed:** 102
- **Update frequency:** On every build

---

## Checklist

### Initial Setup
- [x] Sitemap generator created
- [x] Robots.txt configured
- [x] URLs grouped in sets of 50
- [x] Priority levels assigned
- [x] Change frequencies set
- [ ] Submitted to Google Search Console
- [ ] Submitted to Bing Webmaster Tools

### Ongoing Maintenance
- [ ] Monitor crawl stats weekly
- [ ] Check for errors monthly
- [ ] Update after major changes
- [ ] Verify new pages are included
- [ ] Remove deleted pages

---

## Resources

- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Bing Sitemap Guidelines](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

---

## Support

For sitemap issues:
1. Run verification: `npm run sitemap:verify`
2. Test crawlability: `npm run sitemap:test`
3. Check search console for errors
4. Contact: tech@elevateforhumanity.org

---

*Last updated: 2025-10-15*
