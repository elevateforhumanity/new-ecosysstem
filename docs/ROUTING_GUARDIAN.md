# Routing Guardian Documentation

## Overview

The Routing Guardian is an automated system that ensures all React components in `src/pages` are properly imported and routed in your application. It prevents 404 errors, maintains routing consistency, and auto-fixes common routing issues.

## Features

### 🔍 Automatic Discovery
- Scans `src/pages` directory for all `.jsx` and `.tsx` files
- Converts component names to route paths automatically
- Detects missing imports and routes

### 🔧 Auto-Fix Capabilities
- Adds missing imports to `App.jsx`
- Generates route elements automatically
- Updates `routes.config.mjs` with new routes
- Creates backups before making changes

### 📊 Validation & Reporting
- Comprehensive validation reports
- JSON output for automation
- Detailed issue tracking
- Build verification

### 🛡️ Compatibility Checks
- Node.js version validation (requires v20)
- Package manager detection (pnpm/npm/yarn)
- Lockfile conflict resolution
- ESM module compatibility

## Installation

The Routing Guardian is already installed. No additional setup required.

## Usage

### Quick Commands

```bash
# Check routing configuration
npm run routes:check

# Auto-fix routing issues
npm run routes:fix

# List all pages and routes
npm run routes:list

# Scan pages directory
npm run routes:scan

# Run full guardian (with build verification)
npm run routes:guardian

# Dry run (no changes)
npm run routes:guardian:dry
```

### Command Details

#### `npm run routes:check`

Validates routing configuration and reports issues.

**Output:**
```
🔍 Checking routing configuration...

📊 Validation Results:
  Total Pages:    108
  Total Imports:  33
  Total Routes:   32
  Issues Found:   75

⚠️  Missing Imports:
  - AITutor (/workspaces/ecosystem2/src/pages/AITutor.jsx)
  - AdminDashboard (/workspaces/ecosystem2/src/pages/AdminDashboard.jsx)
  ...

⚠️  Missing Routes:
  - /a-i-tutor → AITutor
  - /admin-dashboard → AdminDashboard
  ...

📄 Full report: .data/routing/validation-report.json
```

**Exit Codes:**
- `0` - No issues found
- `1` - Issues found

#### `npm run routes:fix`

Automatically fixes routing issues.

**What it does:**
1. Scans for missing imports and routes
2. Backs up `App.jsx` and `routes.config.mjs`
3. Adds missing imports (lazy-loaded)
4. Adds missing route elements
5. Updates routes configuration

**Output:**
```
🔧 Auto-fixing routing issues...

✅ Auto-fix completed:
  Imports Added: 75
  Routes Added:  75

📝 Changes made to:
  - src/App.jsx (backed up)
  - routes.config.mjs (backed up)

⚠️  Please review the changes and test your application
```

**Important:** Always review changes before committing!

#### `npm run routes:list`

Lists all pages with their routing status.

**Output:**
```
📋 Listing all pages and routes...

Found 108 page components:

✅ HomePage
   Route: /
   File:  HomePage.jsx
   Import: Yes
   Routed: Yes

⚠️  AITutor
   Route: /a-i-tutor
   File:  AITutor.jsx
   Import: No
   Routed: No

❌ AdminDashboard
   Route: /admin-dashboard
   File:  AdminDashboard.jsx
   Import: No
   Routed: No
```

**Status Icons:**
- ✅ - Fully configured (imported and routed)
- ⚠️  - Partially configured (imported but not routed, or vice versa)
- ❌ - Not configured (missing import and route)

#### `npm run routes:scan`

Scans pages directory and shows organization.

**Output:**
```
🔍 Scanning pages directory...

Found 108 page components:

📁 root/
   - HomePage → /
   - About → /about
   - Donate → /donate
   ...

📁 sisters/
   - Mentorship → /sisters/mentorship
   - Volunteer → /sisters/volunteer
   ...
```

#### `npm run routes:guardian`

Runs full routing guardian with build verification.

**What it does:**
1. Checks Node.js version and package manager
2. Scans all pages
3. Validates routing configuration
4. Updates `routes.config.mjs`
5. Generates sitemap entries
6. Validates sister sites
7. Runs build verification
8. Generates comprehensive report

**Output:**
```
== Elevate Autopilot: Dynamic Routing Guardian ==
[2025-10-03 22:00:00] Checking Node.js environment...
[2025-10-03 22:00:00] ✅ Node version: v20.19.4
[2025-10-03 22:00:00] ✅ Package manager: pnpm
[2025-10-03 22:00:01] Scanning src/pages for React components...
[2025-10-03 22:00:01] Found 108 page components
[2025-10-03 22:00:02] Checking routes in App.jsx...
[2025-10-03 22:00:02] ⚠️  Found 75 missing imports and 75 missing routes
[2025-10-03 22:00:03] Updating routes.config.mjs...
[2025-10-03 22:00:03] ✅ Updated routes.config.mjs with 75 new routes
[2025-10-03 22:00:04] Generating sitemap entries...
[2025-10-03 22:00:04] ✅ Generated sitemap: sitemaps/sitemap-pages.xml
[2025-10-03 22:00:05] Checking sister site configurations...
[2025-10-03 22:00:05] ✅ Sister site route exists: /landing/elevateforhumanity.org
[2025-10-03 22:00:06] Running build verification...
[2025-10-03 22:00:30] ✅ Build successful
[2025-10-03 22:00:31] Generating routing report...
[2025-10-03 22:00:31] ✅ Routing report saved: .data/routing/routing-report.json

==========================================
Routing Guardian Summary
==========================================
Total Pages:       108
Total Routes:      108
Missing Imports:   0
Missing Routes:    0
New Routes Added:  75
Sister Sites:      3
==========================================

✅ All routes configured correctly
```

## How It Works

### Component Name to Route Conversion

The guardian automatically converts PascalCase component names to kebab-case routes:

| Component Name | Route Path |
|----------------|------------|
| `HomePage` | `/` |
| `About` | `/about` |
| `AdminDashboard` | `/admin-dashboard` |
| `AITutor` | `/a-i-tutor` |
| `NotFound` | `*` (catch-all) |

### Directory Structure

```
src/pages/
├── HomePage.jsx              → /
├── About.jsx                 → /about
├── AdminDashboard.jsx        → /admin-dashboard
├── sisters/
│   ├── Mentorship.jsx        → /sisters/mentorship
│   └── Volunteer.jsx         → /sisters/volunteer
└── __tests__/
    └── Quiz.test.jsx         → /quiz.test (excluded from routes)
```

### Import Generation

For each missing component, the guardian generates a lazy import:

```javascript
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
```

### Route Generation

For each missing route, the guardian generates a route element:

```javascript
<Route path="/admin-dashboard" element={<AdminDashboard />} />
```

### Routes Configuration

Updates `routes.config.mjs` with all discovered routes:

```javascript
export const routes = [
  '/',
  '/about',
  '/admin-dashboard',
  '/a-i-tutor',
  // ... all other routes
];
```

## Sister Sites

The guardian ensures each sister site has a landing page route:

- `elevateforhumanity.org` → `/landing/elevateforhumanity.org`
- `selfishinc.org` → `/landing/selfishinc.org`
- `curvaturebodysculpting.com` → `/landing/curvaturebodysculpting.com`

## Validation Report

The guardian generates a detailed JSON report at `.data/routing/validation-report.json`:

```json
{
  "timestamp": "2025-10-03T22:00:00.000Z",
  "totalPages": 108,
  "totalImports": 33,
  "totalRoutes": 32,
  "missingImports": [
    {
      "name": "AITutor",
      "file": "/workspaces/ecosystem2/src/pages/AITutor.jsx",
      "relativePath": "AITutor.jsx",
      "route": "/a-i-tutor"
    }
  ],
  "missingRoutes": [
    {
      "name": "AITutor",
      "route": "/a-i-tutor"
    }
  ],
  "unusedImports": [],
  "issues": [
    {
      "type": "missing_import",
      "component": "AITutor",
      "file": "/workspaces/ecosystem2/src/pages/AITutor.jsx"
    },
    {
      "type": "missing_route",
      "component": "AITutor",
      "route": "/a-i-tutor"
    }
  ]
}
```

## Sitemap Generation

The guardian automatically generates sitemap entries for all routes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://elevateforhumanity.org/</loc>
    <lastmod>2025-10-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://elevateforhumanity.org/about</loc>
    <lastmod>2025-10-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... all other routes -->
</urlset>
```

**Location:** `sitemaps/sitemap-pages.xml`

## Compatibility

### Node.js Version

**Required:** Node.js v20.x

The guardian checks your Node.js version and warns if it doesn't match:

```
⚠️  Node version mismatch: v18.19.0 (required: v20)
```

### Package Managers

Supports:
- **pnpm** (preferred)
- **npm**
- **yarn**

The guardian automatically detects your package manager based on lockfiles.

### Lockfile Conflicts

If multiple lockfiles are detected, the guardian keeps the primary one:

```
⚠️  Multiple lockfiles detected, keeping pnpm
```

### Module System

Compatible with:
- ✅ ESM modules (`"type": "module"` in package.json)
- ✅ CommonJS modules (`.cjs` files)
- ✅ Mixed module systems

## Best Practices

### 1. Run Before Committing

Always check routing before committing:

```bash
npm run routes:check
```

### 2. Review Auto-Fixes

After running `npm run routes:fix`, review changes:

```bash
git diff src/App.jsx routes.config.mjs
```

### 3. Test After Changes

Run build and tests after auto-fixing:

```bash
npm run build
npm test
```

### 4. Keep Backups

The guardian creates backups automatically:

```
src/App.jsx.bak.1696348800
routes.config.mjs.bak.1696348800
```

Keep these until you verify changes work correctly.

### 5. Exclude Test Files

Test files in `__tests__` directories are scanned but should not be routed. Manually exclude them if needed.

### 6. Use Consistent Naming

Follow PascalCase for component names:
- ✅ `AdminDashboard.jsx`
- ❌ `admin-dashboard.jsx`
- ❌ `adminDashboard.jsx`

### 7. Organize by Feature

Use subdirectories for related pages:

```
src/pages/
├── admin/
│   ├── Dashboard.jsx
│   └── Users.jsx
├── student/
│   ├── Dashboard.jsx
│   └── Courses.jsx
└── sisters/
    ├── Mentorship.jsx
    └── Volunteer.jsx
```

## Troubleshooting

### Issue: "Build failed"

**Solution:**
1. Check build log: `.data/routing/build.log`
2. Install dependencies: `npm install`
3. Run build manually: `npm run build`

### Issue: "Routes not updating"

**Solution:**
1. Clear cache: `npm run clean:fast`
2. Reinstall: `npm install`
3. Run guardian: `npm run routes:guardian`

### Issue: "Duplicate routes"

**Solution:**
1. Check for duplicate files in `src/pages`
2. Remove duplicates
3. Run `npm run routes:scan` to verify

### Issue: "Import path incorrect"

**Solution:**
1. Check component file location
2. Verify file extension (`.jsx` or `.tsx`)
3. Manually fix import in `App.jsx`

### Issue: "Sister site routes missing"

**Solution:**
1. Create landing page components:
   ```
   src/pages/landing/elevateforhumanity-org.jsx
   src/pages/landing/selfishinc-org.jsx
   src/pages/landing/curvaturebodysculpting-com.jsx
   ```
2. Run `npm run routes:guardian`

## Integration with CI/CD

### GitHub Actions

```yaml
name: Routing Check

on: [push, pull_request]

jobs:
  routing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run routes:check
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

npm run routes:check
if [ $? -ne 0 ]; then
  echo "❌ Routing check failed. Run 'npm run routes:fix' to auto-fix."
  exit 1
fi
```

## API Reference

### RouteValidator Class

**Location:** `services/route-validator.cjs`

#### Methods

##### `scanPages()`

Scans `src/pages` directory for components.

**Returns:** `Array<Object>`

```javascript
[
  {
    name: "AdminDashboard",
    file: "/path/to/AdminDashboard.jsx",
    relativePath: "AdminDashboard.jsx",
    route: "/admin-dashboard"
  }
]
```

##### `validate()`

Validates routing configuration.

**Returns:** `Object`

```javascript
{
  totalPages: 108,
  totalImports: 33,
  totalRoutes: 32,
  missingImports: [...],
  missingRoutes: [...],
  unusedImports: [...],
  issues: [...]
}
```

##### `autoFix(validation)`

Auto-fixes routing issues.

**Parameters:**
- `validation` - Validation results from `validate()`

**Returns:** `Object`

```javascript
{
  importsAdded: 75,
  routesAdded: 75,
  success: true,
  error: null
}
```

##### `run(autoFix)`

Runs full validation and optional auto-fix.

**Parameters:**
- `autoFix` - Boolean, whether to auto-fix issues

**Returns:** `Object`

```javascript
{
  validation: {...},
  fixResults: {...},
  reportPath: ".data/routing/validation-report.json",
  pages: [...]
}
```

## Files

### Scripts

- `scripts/routing-guardian.sh` - Main guardian script
- `scripts/routes-cli.cjs` - CLI tool for route management

### Services

- `services/route-validator.cjs` - Route validation service

### Configuration

- `routes.config.mjs` - Routes configuration (auto-updated)

### Output

- `.data/routing/guardian.log` - Guardian execution log
- `.data/routing/validation-report.json` - Validation report
- `.data/routing/routing-report.json` - Full routing report
- `.data/routing/build.log` - Build verification log
- `sitemaps/sitemap-pages.xml` - Generated sitemap

## Support

For issues or questions:

1. Check this documentation
2. Review validation report: `.data/routing/validation-report.json`
3. Check guardian log: `.data/routing/guardian.log`
4. Contact: support@elevateforhumanity.org

---

**© Elevate for Humanity / Selfish Inc. DBA Rise Forward Foundation**

Routing Guardian is part of the Elevate Autopilot system.
