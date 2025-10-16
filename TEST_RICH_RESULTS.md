# Test Rich Results - Step by Step

## After Deployment, Test These URLs:

### 1. Google Rich Results Test
**Test Homepage:**
https://search.google.com/test/rich-results?url=https://elevateforhumanity.pages.dev/

**What to Check:**
- ✅ Organization schema detected
- ✅ LocalBusiness schema detected
- ✅ FAQPage schema detected
- ✅ No errors or warnings

**Test Programs Page:**
https://search.google.com/test/rich-results?url=https://elevateforhumanity.pages.dev/programs/

**What to Check:**
- ✅ BreadcrumbList schema detected
- ✅ ItemList schema detected
- ✅ Course schemas detected
- ✅ No errors or warnings

### 2. Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/

**Enter URL:** https://elevateforhumanity.pages.dev/

**What to Check:**
- ✅ Image shows (og-image.svg)
- ✅ Title: "Elevate for Humanity - 106+ Workforce Certifications"
- ✅ Description shows correctly
- ✅ No warnings

**Click "Scrape Again"** if you don't see the image

### 3. LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/

**Enter URL:** https://elevateforhumanity.pages.dev/

**What to Check:**
- ✅ Preview image appears
- ✅ Title and description correct
- ✅ No errors

### 4. Schema Markup Validator
https://validator.schema.org/

**Paste the HTML** from https://elevateforhumanity.pages.dev/

**What to Check:**
- ✅ All schemas validate
- ✅ No errors
- ⚠️ Warnings are OK (they're suggestions)

### 5. Google Search Console
https://search.google.com/search-console

**Steps:**
1. Go to URL Inspection
2. Enter: https://elevateforhumanity.pages.dev/
3. Click "Test Live URL"
4. Wait for results

**What to Check:**
- ✅ Page is indexable
- ✅ Mobile-friendly
- ✅ No errors
- ✅ Structured data detected

**Then:**
1. Click "Request Indexing"
2. Wait 1-2 weeks for rich results to appear

## Expected Results Timeline

### Immediate (After Deployment):
- ✅ Validators show schemas are correct
- ✅ Social media debuggers show images
- ✅ No errors in testing tools

### Week 1-2:
- ✅ Google re-crawls your site
- ✅ Search Console shows structured data
- ✅ Social shares show images

### Week 3-4:
- ✅ Rich snippets start appearing in search
- ✅ Star ratings show (if you have reviews)
- ✅ Course details show in results

### Month 2-3:
- ✅ Knowledge panel may appear
- ✅ Site links under main result
- ✅ Full rich snippet coverage

## Common Issues & Fixes

### Issue: "Image not found"
**Fix:** Make sure og-image.svg is in public/ folder and deployed

### Issue: "Schema not detected"
**Fix:** Check that JSON-LD is valid (no syntax errors)

### Issue: "Facebook shows old image"
**Fix:** Use Facebook Debugger and click "Scrape Again"

### Issue: "No rich results in Google"
**Fix:** Wait 2-4 weeks. Google needs time to re-crawl and trust your site

## Manual Testing Checklist

After deployment, check these:

```
Homepage (https://elevateforhumanity.pages.dev/):
[ ] View source shows Organization schema
[ ] View source shows LocalBusiness schema
[ ] View source shows FAQ schema
[ ] og:image meta tag points to og-image.svg
[ ] No console errors

Programs Page (https://elevateforhumanity.pages.dev/programs/):
[ ] View source shows Breadcrumb schema
[ ] View source shows ItemList schema
[ ] View source shows Course schemas
[ ] No console errors

Social Sharing:
[ ] Facebook preview shows image
[ ] LinkedIn preview shows image
[ ] Title and description correct
[ ] No broken images

Google Tools:
[ ] Rich Results Test passes
[ ] Schema Validator passes
[ ] Search Console shows no errors
[ ] Mobile-Friendly Test passes
```

## Quick Test Commands

```bash
# Test if schemas are in the HTML
curl -s https://elevateforhumanity.pages.dev/ | grep -o '@type":"[^"]*"' | sort | uniq

# Expected output:
# @type":"AggregateRating"
# @type":"Answer"
# @type":"ContactPoint"
# @type":"EducationalOrganization"
# @type":"FAQPage"
# @type":"LocalBusiness"
# @type":"OpeningHoursSpecification"
# @type":"PostalAddress"
# @type":"Question"
# @type":"QuantitativeValue"

# Test if og-image exists
curl -I https://elevateforhumanity.pages.dev/og-image.svg

# Expected: HTTP/2 200
```

## What Success Looks Like

### Before (Plain Search Result):
```
Elevate for Humanity
Indianapolis-based ETPL provider and DOL apprenticeship sponsor...
elevateforhumanity.pages.dev
```

### After (Rich Snippet):
```
Elevate for Humanity ⭐⭐⭐⭐⭐ 4.8 (247 reviews)
106+ Certification Programs | FREE | 92% Job Placement
📍 Indianapolis, IN | 📞 317-314-3757
Programs: Healthcare • IT • Construction • Business
elevateforhumanity.pages.dev
  › Programs  › Get Started  › About  › Contact
```

## Need Help?

If any tests fail, check:
1. Is the site deployed?
2. Is the HTML valid?
3. Are the JSON-LD scripts valid JSON?
4. Did you wait long enough? (Google needs 1-4 weeks)

Run the tests and let me know what you see!
