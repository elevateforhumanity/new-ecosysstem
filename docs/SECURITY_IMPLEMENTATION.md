# Security Implementation Guide

## Overview

The Elevate for Humanity platform implements **military-grade security** with multiple layers of protection against common threats including scraping, bots, unauthorized access, and data breaches.

## Security Layers

### 1. Security Headers (Helmet.js)

**Location:** `simple-server.cjs`

**Protection:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- X-XSS-Protection

**Configuration:**
```javascript
helmet({
  contentSecurityPolicy: { /* CSP directives */ },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})
```

### 2. CORS Whitelist

**Location:** `simple-server.cjs`

**Protection:** Prevents unauthorized cross-origin requests

**Configuration:**
```bash
# .env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://elevateforhumanity.org
```

**Default Allowed Origins:**
- `http://localhost:3000` (development)
- `http://localhost:5173` (Vite dev server)
- `https://elevateforhumanity.org` (production)

### 3. Rate Limiting

**Location:** `simple-server.cjs`, `middleware/auth.cjs`

**Protection:** Prevents brute force attacks and API abuse

**Limits:**
- **API Endpoints:** 100 requests per 15 minutes per IP
- **Authentication:** 5 attempts per 15 minutes per IP
- **Slow Down:** Adds 500ms delay after 50 requests

**Configuration:**
```bash
# .env
RATE_LIMIT_PER_MIN=100
```

### 4. Bot & Scraper Detection

**Location:** `simple-server.cjs`

**Protection:** Blocks automated scrapers and bots

**Features:**
- User agent parsing
- Bot detection via `express-useragent`
- Blocks requests with no user agent
- Logs all blocked attempts to audit log

**Exceptions:**
- Health check endpoints (`/api/healthz`, `/api/readiness`)

### 5. XSS Protection

**Location:** `simple-server.cjs`

**Protection:** Sanitizes user input to prevent cross-site scripting

**Implementation:** `xss-clean` middleware

### 6. Input Validation

**Location:** `middleware/validation.cjs`

**Protection:** Validates and sanitizes all user input

**Schemas:**
- `createTask` - Task creation validation
- `search` - Search query validation
- `ask` - Question validation
- `lead` - Lead submission validation
- `taskId` - UUID validation

**Usage:**
```javascript
app.post('/api/endpoint', validate(schemas.schemaName), handler);
```

### 7. Military-Grade Encryption

**Location:** `src/crypto/encryption.js`

**Algorithms:**
- **AES-256-GCM** - Symmetric encryption (FIPS 140-2 compliant)
- **RSA-4096** - Asymmetric encryption for key exchange
- **Argon2id** - Password hashing (OWASP recommended)
- **HMAC-SHA256** - Message authentication

**Features:**
- License token generation/verification
- Digital watermarking
- CSRF token generation
- Timing-safe comparison operations

### 8. Authentication & Authorization

**Location:** `middleware/auth.cjs`

**Features:**
- JWT token validation
- Role-based access control (RBAC)
- Permission-based authorization
- Token expiration handling

**Configuration:**
```bash
# .env
JWT_SECRET=change-me-to-random-secret-in-production
```

### 9. API Key Protection

**Location:** `simple-server.cjs`

**Protected Endpoints:**
- `/api/protected/financial/revenue`
- `/api/protected/audit/logs`
- `/api/security/audit`
- `/api/security/shutdown`

**Configuration:**
```bash
# .env
ADMIN_SECRET=change-me-to-random-admin-secret
```

**Usage:**
```bash
curl -H "x-api-key: your-admin-secret" https://api.elevateforhumanity.org/api/security/audit
```

### 10. Security Audit Logging

**Location:** `.data/security/audit.json`

**Logged Events:**
- `SCRAPER_BLOCK` - Bot/scraper blocked
- `NO_UA_BLOCK` - No user agent blocked
- `UNAUTHORIZED_ACCESS` - Failed API key authentication
- `LEAD_SUBMISSION` - Lead form submission
- `SYSTEM_SHUTDOWN` - Kill switch activated

**Access:**
```bash
curl -H "x-api-key: your-admin-secret" https://api.elevateforhumanity.org/api/security/audit
```

### 11. Content Duplication Scanner

**Location:** `services/duplication-scanner.cjs`

**Features:**
- SHA-256 content fingerprinting
- Multi-level fingerprint generation (full, first100, first50, first25 words)
- Key phrase extraction for search
- DuckDuckGo search integration (no API key required)
- Google Custom Search integration (optional, requires API key)
- Content similarity comparison
- Local directory scanning for duplicates
- Scan history tracking

**Algorithms:**
- **SHA-256** for content fingerprinting
- **Fuzzy matching** with multiple fingerprint levels
- **Similarity scoring** based on fingerprint matches

### 12. Content Protection & Watermarking

**Location:** `services/content-protection.cjs`

**Features:**
- Digital watermarking with invisible markers
- Zero-width character encoding for stealth watermarks
- HMAC-SHA256 signature verification
- Content registration and tracking
- Watermark extraction and verification
- Protection registry with audit trail

**Watermark Components:**
- **Invisible Watermark:** Zero-width characters (U+200B, U+200C)
- **Visible Watermark:** Copyright notice and legal disclaimer
- **Content ID:** Unique 16-character identifier
- **HMAC Signature:** Tamper-proof verification

**Legal Protection:**
- Copyright notice embedded in all protected content
- Federal law citations (17 U.S.C. § 506, 18 U.S.C. § 2319)
- License information and contact details

## Security Endpoints

### GET /api/security/status

Returns current security status and active protections.

**Response:**
```json
{
  "ok": true,
  "protections": [
    "helmet",
    "cors-whitelist",
    "rate-limit",
    "slow-down",
    "xss-clean",
    "bot-detection",
    "input-validation"
  ],
  "timestamp": 1234567890
}
```

### GET /api/security/audit

Returns last 100 security audit log entries.

**Authentication:** Requires `x-api-key` header

**Response:**
```json
{
  "entries": [
    {
      "ts": 1234567890,
      "event": "SCRAPER_BLOCK",
      "meta": {
        "ua": "bot-user-agent",
        "ip": "1.2.3.4",
        "path": "/api/endpoint"
      }
    }
  ],
  "total": 150
}
```

### GET /api/security/compliance

Returns compliance and copyright information.

**Response:**
```json
{
  "copyright": "© Elevate for Humanity / Selfish Inc. DBA Rise Forward Foundation",
  "compliance": ["WIOA", "WRG", "DOE", "DOL", "FERPA", "COPPA", "GDPR", "CCPA"],
  "disclaimer": "Unauthorized duplication, scraping, or redistribution is prohibited...",
  "license": "Commercial License - See COMMERCIAL_LICENSE.md",
  "contact": "legal@elevateforhumanity.org"
}
```

### POST /api/security/shutdown

Emergency kill switch to shut down the server.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "reason": "security incident"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Kill switch activated - shutting down"
}
```

---

## Content Protection Endpoints

### POST /api/security/scan/content

Scan content for potential duplicates across the web.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "content": "Your content to scan...",
  "searchEngines": ["duckduckgo"],
  "maxPhrases": 3
}
```

**Response:**
```json
{
  "ok": true,
  "scan": {
    "timestamp": 1234567890,
    "fingerprints": {
      "full": "abc123...",
      "first100": "def456...",
      "wordCount": 150,
      "charCount": 850
    },
    "keyPhrases": ["phrase 1...", "phrase 2..."],
    "searchResults": [
      {
        "phrase": "phrase 1...",
        "engine": "duckduckgo",
        "found": false
      }
    ],
    "potentialMatches": 0,
    "riskLevel": "none"
  }
}
```

**Risk Levels:**
- `none` - No matches found (0-10% match rate)
- `low` - Few matches (10-40% match rate)
- `medium` - Some matches (40-70% match rate)
- `high` - Many matches (70%+ match rate)

### GET /api/security/scan/history

Get scan history.

**Authentication:** Requires `x-api-key` header

**Query Parameters:**
- `limit` - Number of entries (default: 50)

**Response:**
```json
{
  "ok": true,
  "history": [...],
  "total": 50
}
```

### POST /api/security/scan/compare

Compare two content pieces for similarity.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "content1": "First content...",
  "content2": "Second content..."
}
```

**Response:**
```json
{
  "ok": true,
  "comparison": {
    "matches": {
      "full": true,
      "first100": true,
      "first50": true,
      "first25": false
    },
    "similarity": "75.00%",
    "verdict": "similar"
  }
}
```

**Verdicts:**
- `duplicate` - 75%+ similarity
- `similar` - 50-75% similarity
- `partial` - 25-50% similarity
- `unique` - <25% similarity

### POST /api/security/scan/directory

Scan local directory for duplicate files.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "path": "/path/to/directory"
}
```

**Response:**
```json
{
  "ok": true,
  "duplicates": [
    {
      "fingerprint": "abc123...",
      "files": ["/path/file1.md", "/path/file2.md"]
    }
  ],
  "count": 1
}
```

### POST /api/security/protect/watermark

Add digital watermark to content.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "content": "Content to protect...",
  "metadata": {
    "owner": "Elevate for Humanity",
    "type": "educational",
    "author": "John Doe"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "content": "Watermarked content with invisible markers...",
  "contentId": "a89f02391548cbc1",
  "watermark": {
    "id": "a89f02391548cbc1",
    "timestamp": 1234567890,
    "owner": "Elevate for Humanity",
    "copyright": "© Elevate for Humanity...",
    "license": "Commercial License..."
  },
  "signature": "fccd570a3f67516a...",
  "visibleWatermark": "\n---\n**Content Protection Notice**\n..."
}
```

### POST /api/security/protect/verify

Verify content watermark.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "content": "Watermarked content...",
  "signature": "fccd570a3f67516a..."
}
```

**Response:**
```json
{
  "ok": true,
  "verification": {
    "valid": true,
    "contentId": "a89f02391548cbc1",
    "watermark": {...},
    "registered": "2024-01-01T00:00:00.000Z",
    "reason": "Valid watermark"
  }
}
```

### POST /api/security/protect/check

Check if content is protected.

**Authentication:** Requires `x-api-key` header

**Request:**
```json
{
  "content": "Content to check..."
}
```

**Response:**
```json
{
  "ok": true,
  "check": {
    "hasWatermark": true,
    "fingerprint": "abc123...",
    "contentId": "a89f02391548cbc1",
    "registered": true,
    "registrationData": {...}
  }
}
```

### GET /api/security/protect/registry

Get content protection registry.

**Authentication:** Requires `x-api-key` header

**Query Parameters:**
- `limit` - Number of entries (default: 100)

**Response:**
```json
{
  "ok": true,
  "registry": [...],
  "total": 100
}
```

### GET /api/security/protect/report

Get content protection statistics.

**Authentication:** Requires `x-api-key` header

**Response:**
```json
{
  "ok": true,
  "report": {
    "totalProtected": 150,
    "byOwner": {
      "Elevate for Humanity": 145,
      "Other": 5
    },
    "byLicense": {
      "Commercial License": 150
    },
    "oldestProtection": 1234567890,
    "newestProtection": 1234567999
  }
}
```

## Environment Variables

### Required for Production

```bash
# Authentication & Security
JWT_SECRET=<generate-strong-random-secret>
ADMIN_SECRET=<generate-strong-random-secret>
CRYPTO_SECRET=<generate-strong-random-secret>

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://elevateforhumanity.org,https://app.elevateforhumanity.org

# Rate Limiting
RATE_LIMIT_PER_MIN=100
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate ADMIN_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRYPTO_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Compliance Frameworks

The platform implements comprehensive compliance with:

- **FERPA** - Family Educational Rights and Privacy Act
- **COPPA** - Children's Online Privacy Protection Act
- **GDPR** - General Data Protection Regulation
- **CCPA** - California Consumer Privacy Act
- **WIOA** - Workforce Innovation and Opportunity Act

**Documentation:**
- `legal/ferpa-compliance.md`
- `legal/coppa-compliance.md`
- `legal/privacy-policy.md`
- `services/compliance.js`

## Security Checklist

### Before Production Deployment

- [ ] Set all environment variables with strong random secrets
- [ ] Update CORS_ALLOWED_ORIGINS with production domains
- [ ] Review and adjust rate limits for expected traffic
- [ ] Test all protected endpoints with API keys
- [ ] Verify bot detection is working
- [ ] Check audit logging is enabled
- [ ] Review CSP directives for your frontend
- [ ] Enable HTTPS/TLS on all domains
- [ ] Set up security monitoring alerts
- [ ] Conduct penetration testing
- [ ] Review compliance documentation

### Regular Maintenance

- [ ] Review security audit logs weekly
- [ ] Rotate secrets every 90 days
- [ ] Update dependencies monthly
- [ ] Monitor rate limit violations
- [ ] Review blocked bot/scraper attempts
- [ ] Test kill switch functionality quarterly

## Incident Response

### If Security Breach Detected

1. **Activate Kill Switch:**
   ```bash
   curl -X POST -H "x-api-key: your-admin-secret" \
     -H "Content-Type: application/json" \
     -d '{"reason":"security breach"}' \
     https://api.elevateforhumanity.org/api/security/shutdown
   ```

2. **Review Audit Logs:**
   ```bash
   curl -H "x-api-key: your-admin-secret" \
     https://api.elevateforhumanity.org/api/security/audit
   ```

3. **Rotate All Secrets:**
   - Generate new JWT_SECRET
   - Generate new ADMIN_SECRET
   - Generate new CRYPTO_SECRET
   - Update environment variables
   - Restart services

4. **Contact Security Team:**
   - Email: security@elevateforhumanity.org
   - See: `public/.well-known/security.txt`

## Dependencies

### Security Packages

```json
{
  "helmet": "^7.0.0",
  "express-rate-limit": "^7.3.0",
  "express-slow-down": "^1.6.0",
  "cors": "^2.8.5",
  "xss-clean": "^0.1.1",
  "express-useragent": "^1.0.15",
  "joi": "^17.13.3",
  "jsonwebtoken": "^9.0.2"
}
```

### Update Dependencies

```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update all dependencies
npm update
```

## Content Protection Usage Examples

### Protect Educational Content

```bash
# Watermark course material
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your educational content here...",
    "metadata": {
      "owner": "Elevate for Humanity",
      "type": "course-material",
      "course": "Barbering 101",
      "author": "Instructor Name"
    }
  }' \
  https://api.elevateforhumanity.org/api/security/protect/watermark
```

### Scan for Content Theft

```bash
# Scan content for duplicates
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Content to check for theft...",
    "searchEngines": ["duckduckgo"],
    "maxPhrases": 5
  }' \
  https://api.elevateforhumanity.org/api/security/scan/content
```

### Verify Content Ownership

```bash
# Check if content is registered
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Content with watermark..."
  }' \
  https://api.elevateforhumanity.org/api/security/protect/check
```

### Compare Content Versions

```bash
# Compare two versions
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "content1": "Original version...",
    "content2": "Modified version..."
  }' \
  https://api.elevateforhumanity.org/api/security/scan/compare
```

### Scan Repository for Duplicates

```bash
# Scan docs directory
curl -X POST -H "x-api-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "./docs"
  }' \
  https://api.elevateforhumanity.org/api/security/scan/directory
```

## Content Protection Best Practices

### 1. Watermark All Original Content

- Course materials
- Educational resources
- Documentation
- Marketing content
- Blog posts

### 2. Regular Duplication Scans

- Weekly scans of key content
- Monitor for unauthorized use
- Track scan history for patterns
- Investigate high-risk findings

### 3. Content Registry Maintenance

- Review protection registry monthly
- Verify watermark integrity
- Update metadata as needed
- Archive old content records

### 4. Legal Enforcement

When unauthorized use is detected:

1. **Document Evidence:**
   - Save scan results
   - Screenshot infringing content
   - Record URLs and timestamps

2. **Verify Ownership:**
   - Check content registry
   - Verify watermark signature
   - Confirm registration date

3. **Send Cease & Desist:**
   - Reference content ID
   - Cite federal law violations
   - Demand immediate removal

4. **Escalate if Needed:**
   - Contact legal@elevateforhumanity.org
   - Provide all documentation
   - Consider DMCA takedown

### 5. Google Custom Search Setup (Optional)

For enhanced duplication detection:

1. **Create Custom Search Engine:**
   - Visit: https://programmablesearchengine.google.com/
   - Create new search engine
   - Configure to search entire web
   - Get Search Engine ID

2. **Get API Key:**
   - Visit: https://console.cloud.google.com/
   - Enable Custom Search API
   - Create credentials
   - Get API key

3. **Configure Environment:**
   ```bash
   GOOGLE_SEARCH_API_KEY=your-api-key
   GOOGLE_SEARCH_ENGINE_ID=your-engine-id
   ```

4. **Use in Scans:**
   ```json
   {
     "searchEngines": ["duckduckgo", "google"],
     "maxPhrases": 5
   }
   ```

**Note:** Google Custom Search has usage limits and costs. DuckDuckGo is free but less comprehensive.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support

For security questions or to report vulnerabilities:

- **Email:** security@elevateforhumanity.org
- **Security.txt:** `/.well-known/security.txt`
- **Responsible Disclosure:** See `SECURITY.md`
