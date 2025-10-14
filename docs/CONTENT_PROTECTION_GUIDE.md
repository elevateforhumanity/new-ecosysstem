# Content Protection Quick Reference

## Overview

The Elevate for Humanity platform includes comprehensive content protection features to prevent unauthorized duplication, scraping, and redistribution of educational materials.

## Features

### 🔍 Duplication Scanner
- **Content Fingerprinting:** SHA-256 based unique identifiers
- **Web Search:** DuckDuckGo (free) and Google Custom Search (optional)
- **Similarity Detection:** Compare content versions
- **Local Scanning:** Find duplicates in your repository
- **Risk Assessment:** Automatic risk level calculation

### 🔐 Digital Watermarking
- **Invisible Watermarks:** Zero-width character encoding
- **Visible Notices:** Copyright and legal disclaimers
- **HMAC Signatures:** Tamper-proof verification
- **Content Registry:** Centralized tracking system
- **Legal Protection:** Federal law citations embedded

## Quick Start

### 1. Protect Your Content

```bash
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your educational content...",
    "metadata": {
      "owner": "Elevate for Humanity",
      "type": "course-material"
    }
  }' \
  http://localhost:3000/api/security/protect/watermark
```

**Response includes:**
- Watermarked content with invisible markers
- Unique content ID
- HMAC signature for verification
- Visible copyright notice

### 2. Scan for Duplicates

```bash
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Content to check...",
    "searchEngines": ["duckduckgo"],
    "maxPhrases": 3
  }' \
  http://localhost:3000/api/security/scan/content
```

**Risk Levels:**
- `none` - No matches found ✅
- `low` - Few matches ⚠️
- `medium` - Some matches ⚠️⚠️
- `high` - Many matches ❌

### 3. Verify Ownership

```bash
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Content with watermark..."
  }' \
  http://localhost:3000/api/security/protect/check
```

## API Endpoints

### Content Protection

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/security/protect/watermark` | POST | Add watermark to content |
| `/api/security/protect/verify` | POST | Verify watermark signature |
| `/api/security/protect/check` | POST | Check protection status |
| `/api/security/protect/registry` | GET | View protected content |
| `/api/security/protect/report` | GET | Protection statistics |

### Duplication Scanner

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/security/scan/content` | POST | Scan for web duplicates |
| `/api/security/scan/compare` | POST | Compare two contents |
| `/api/security/scan/directory` | POST | Scan local directory |
| `/api/security/scan/history` | GET | View scan history |

## How It Works

### Digital Watermarking

1. **Content Analysis:**
   - Generate SHA-256 fingerprint
   - Create unique content ID
   - Extract metadata

2. **Watermark Creation:**
   - Embed invisible markers (zero-width chars)
   - Add visible copyright notice
   - Generate HMAC signature

3. **Registration:**
   - Store in content registry
   - Track timestamp and owner
   - Create audit trail

4. **Verification:**
   - Extract invisible watermark
   - Verify HMAC signature
   - Check registry for ownership

### Duplication Detection

1. **Fingerprinting:**
   - Generate multiple fingerprint levels
   - Extract key phrases
   - Calculate content metrics

2. **Web Search:**
   - Search DuckDuckGo (free, no API key)
   - Optional: Google Custom Search
   - Rate-limited to prevent abuse

3. **Analysis:**
   - Count potential matches
   - Calculate risk level
   - Generate detailed report

4. **History:**
   - Save all scan results
   - Track patterns over time
   - Enable trend analysis

## Watermark Structure

### Invisible Watermark

Encoded using zero-width Unicode characters:
- `U+200B` (zero-width space) = binary 0
- `U+200C` (zero-width non-joiner) = binary 1

**Example:**
```
Content ID: a89f02391548cbc1
Binary: 01100001 10001001 11110000...
Encoded: ​‌​‌‌​​‌​‌‌‌​‌‌​...
```

### Visible Watermark

```markdown
---
**Content Protection Notice**

Content ID: a89f02391548cbc1
© Elevate for Humanity / Selfish Inc. DBA Rise Forward Foundation
License: Commercial License - Unauthorized use prohibited
Generated: 2024-01-01T00:00:00.000Z

This content is protected by digital watermarking and fingerprinting technology.
Unauthorized duplication, scraping, or redistribution is prohibited under federal and state law.
Violators are subject to prosecution under 17 U.S.C. § 506 and 18 U.S.C. § 2319.

For licensing inquiries: legal@elevateforhumanity.org
---
```

## Content Fingerprinting

### Multi-Level Fingerprints

```javascript
{
  "full": "sha256 of entire content",
  "first100": "sha256 of first 100 words",
  "first50": "sha256 of first 50 words",
  "first25": "sha256 of first 25 words",
  "wordCount": 150,
  "charCount": 850
}
```

### Similarity Scoring

| Match Level | Similarity | Verdict |
|-------------|-----------|---------|
| 4/4 matches | 100% | duplicate |
| 3/4 matches | 75% | similar |
| 2/4 matches | 50% | partial |
| 1/4 matches | 25% | unique |
| 0/4 matches | 0% | unique |

## Use Cases

### 1. Course Material Protection

**Scenario:** Protect all course content from unauthorized distribution

```bash
# Watermark each lesson
for file in lessons/*.md; do
  content=$(cat "$file")
  curl -X POST -H "x-api-key: $ADMIN_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"$content\", \"metadata\": {\"type\": \"lesson\"}}" \
    http://localhost:3000/api/security/protect/watermark \
    > "${file}.protected"
done
```

### 2. Plagiarism Detection

**Scenario:** Check if student submissions are original

```bash
# Compare student work with course materials
curl -X POST -H "x-api-key: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "content1": "Course material...",
    "content2": "Student submission..."
  }' \
  http://localhost:3000/api/security/scan/compare
```

### 3. Content Theft Monitoring

**Scenario:** Weekly scans for unauthorized use

```bash
# Scan key content weekly
curl -X POST -H "x-api-key: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Proprietary content...",
    "searchEngines": ["duckduckgo", "google"],
    "maxPhrases": 5
  }' \
  http://localhost:3000/api/security/scan/content
```

### 4. Repository Cleanup

**Scenario:** Find and remove duplicate files

```bash
# Scan for duplicates
curl -X POST -H "x-api-key: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"path": "./docs"}' \
  http://localhost:3000/api/security/scan/directory
```

## Legal Framework

### Federal Law Protection

**17 U.S.C. § 506 - Criminal Infringement:**
- Willful copyright infringement for commercial advantage
- Penalties: Up to 5 years imprisonment, fines

**18 U.S.C. § 2319 - Criminal Infringement of Copyright:**
- Reproduction or distribution of copyrighted works
- Penalties: Up to 10 years imprisonment, fines

### Enforcement Process

1. **Detection:** Automated scanning identifies unauthorized use
2. **Documentation:** Content ID, watermark, and scan results
3. **Verification:** Registry confirms ownership and timestamp
4. **Notice:** Cease & desist with legal citations
5. **Escalation:** DMCA takedown or legal action

### DMCA Takedown

When unauthorized content is found online:

1. **Identify Infringement:**
   - URL of infringing content
   - Content ID from registry
   - Watermark verification

2. **Contact Platform:**
   - Submit DMCA notice
   - Include content ID and proof
   - Request immediate removal

3. **Follow Up:**
   - Monitor for compliance
   - Document response
   - Escalate if needed

## Configuration

### Environment Variables

```bash
# Required
ADMIN_SECRET=your-admin-secret
CRYPTO_SECRET=your-crypto-secret

# Optional (for enhanced scanning)
GOOGLE_SEARCH_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### Data Storage

```
.data/security/
├── audit.json              # Security event log
├── scan-history.json       # Duplication scan results
└── content-registry.json   # Protected content registry
```

## Best Practices

### ✅ Do

- Watermark all original content before publication
- Run weekly duplication scans on key content
- Keep content registry backed up
- Document all infringement cases
- Update metadata regularly

### ❌ Don't

- Share ADMIN_SECRET or CRYPTO_SECRET
- Skip watermarking for "small" content
- Ignore medium/high risk scan results
- Delete content registry without backup
- Modify watermarked content without re-watermarking

## Troubleshooting

### Watermark Not Detected

**Problem:** `extractInvisibleWatermark()` returns null

**Solutions:**
1. Check if content was modified after watermarking
2. Verify zero-width characters weren't stripped
3. Ensure content wasn't converted to plain text
4. Re-watermark if necessary

### Scan Returns No Results

**Problem:** DuckDuckGo returns no matches for known content

**Solutions:**
1. Content may not be indexed yet (wait 24-48 hours)
2. Try different key phrases
3. Use Google Custom Search for better coverage
4. Check if content is behind authentication

### High False Positive Rate

**Problem:** Scans report duplicates for unique content

**Solutions:**
1. Increase `maxPhrases` for more specific searches
2. Use longer, more unique phrases
3. Filter common phrases before scanning
4. Adjust similarity threshold

## Support

### Documentation
- Full guide: `docs/SECURITY_IMPLEMENTATION.md`
- API reference: See endpoint documentation above

### Contact
- **Security:** security@elevateforhumanity.org
- **Legal:** legal@elevateforhumanity.org
- **Support:** support@elevateforhumanity.org

### Reporting Infringement
- Email: legal@elevateforhumanity.org
- Include: Content ID, URL, screenshots
- Subject: "Content Infringement Report"

---

**© Elevate for Humanity / Selfish Inc. DBA Rise Forward Foundation**

All content protection features are proprietary and protected under federal copyright law.
