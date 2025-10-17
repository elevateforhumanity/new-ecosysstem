# EFH Brand Polish & Enforcement System

## What This Does

Automatically enforces brand consistency, accessibility, and code quality across your entire codebase.

### The Problem It Solves

- ❌ Developers hardcoding colors (`#3b82f6` instead of `bg-brand-primary`)
- ❌ Accessibility violations (low contrast text)
- ❌ Inconsistent styling across pages
- ❌ Performance regressions
- ❌ No automated quality checks

### The Solution

✅ **Automated enforcement** - Blocks bad code before it reaches production  
✅ **Contrast checking** - WCAG AA/AAA compliance guaranteed  
✅ **Visual regression** - Catch unintended UI changes  
✅ **Performance audits** - Lighthouse CI on every build  
✅ **Pre-commit hooks** - Quality checks before code lands

---

## Quick Start

### 1. Install the System

```bash
bash polish-styling.sh
```

This installs:

- Prettier (code formatting)
- ESLint (JavaScript linting)
- Stylelint (CSS linting)
- Playwright (visual regression)
- Lighthouse CI (performance audits)
- Brand guard (contrast checking)

### 2. Run Quality Checks

```bash
# Check everything
npm run polish:check

# Auto-fix what can be fixed
npm run polish:fix

# Individual checks
npm run brand:guard      # WCAG contrast compliance
npm run lint:brand       # Find hardcoded colors
npm run fix:brand        # Auto-fix colors
```

### 3. Integrate with CI/CD

Add to your `.github/workflows/ci.yml`:

```yaml
- name: Brand Polish Checks
  run: npm run polish:check

- name: Visual Regression
  run: npm run test:ui

- name: Lighthouse Audit
  run: npm run audit:lighthouse
```

---

## Available Commands

### Formatting

```bash
npm run format           # Auto-format all code
npm run format:check     # Check formatting (CI)
```

### Linting

```bash
npm run lint:js          # Lint JavaScript/TypeScript
npm run lint:css         # Lint CSS files
npm run lint:brand       # Find hardcoded colors
npm run lint:all         # Run all linters
```

### Brand Enforcement

```bash
npm run brand:guard      # Check WCAG contrast
npm run fix:brand        # Auto-fix colors
npm run fix:brand:dry    # Preview fixes
```

### Testing

```bash
npm run test:ui          # Visual regression tests
npm run test:ui:update   # Update snapshots
```

### Audits

```bash
npm run audit:lighthouse # Performance & accessibility
```

### Combined

```bash
npm run polish:check     # All checks
npm run polish:fix       # All auto-fixes
npm run ci:polish        # Full CI suite
```

---

## How It Works

### 1. Brand Guard (Contrast Checking)

**File:** `tools/brand-guard.cjs`  
**Config:** `autopilot-brand.json`

Checks all critical color pairs for WCAG compliance:

```bash
npm run brand:guard
```

Output:

```
🎨 Brand Contrast Guard

✅ Body text on background: 21.00:1 (AAA compliant)
✅ Text on primary buttons: 8.83:1 (AAA compliant)
⚠️  Text on secondary buttons: 5.68:1 (AA pass, AAA fail)
❌ Text on success elements: 3.77:1 (FAIL - below AA 4.5:1)

❌ Brand guard FAILED: 1 pair below WCAG AA (4.5:1)
```

**What it checks:**

- Text on backgrounds
- Button text on button colors
- All semantic color pairs (success, info, warning, danger)

**Thresholds:**

- WCAG AA: 4.5:1 (minimum for body text)
- WCAG AAA: 7.0:1 (enhanced contrast)

### 2. Color Enforcement (ESLint + Stylelint)

**Blocks hardcoded colors in code:**

```javascript
// ❌ This will fail linting
const button = <div style={{ color: '#3b82f6' }}>Click</div>;

// ✅ This passes
const button = <div className="text-brand-primary">Click</div>;
```

**Blocks hardcoded colors in CSS:**

```css
/* ❌ This will fail linting */
.button {
  background: #3b82f6;
}

/* ✅ This passes */
.button {
  background: var(--brand-primary);
}
```

### 3. Visual Regression (Playwright)

**File:** `tests/ui.spec.ts`

Takes screenshots of key pages and compares them:

```bash
npm run test:ui
```

**What it does:**

- Screenshots home, programs, LMS, apply pages
- Compares to baseline snapshots
- Fails if differences exceed threshold (200 pixels)
- Catches unintended visual changes

**Update snapshots:**

```bash
npm run test:ui:update
```

### 4. Performance Audits (Lighthouse CI)

**File:** `.lighthouserc.json`

Runs Lighthouse on key pages:

```bash
npm run audit:lighthouse
```

**Checks:**

- Performance ≥ 85
- Accessibility ≥ 90
- Best Practices ≥ 85
- SEO ≥ 90

### 5. Pre-commit Hooks

**File:** `.husky/pre-commit`

Runs before every commit:

```bash
npm run brand:guard
npm run lint:js
npm run lint:css
```

**Blocks commits that:**

- Have contrast violations
- Use hardcoded colors
- Have linting errors

---

## Configuration Files

### `autopilot-brand.json`

Defines your brand colors and contrast requirements:

```json
{
  "colors": {
    "primary": "#4D4B37",
    "onPrimary": "#FFFFFF",
    "success": "#047857",
    "onSuccess": "#FFFFFF"
  },
  "contrast": {
    "minAA": 4.5,
    "minAAA": 7.0
  }
}
```

### `.eslintrc.cjs`

Blocks hardcoded colors in JavaScript:

```javascript
rules: {
  "no-restricted-syntax": [
    "error",
    {
      "selector": "Literal[value=/^#([0-9a-fA-F]{3,8})$/]",
      "message": "Use brand tokens instead"
    }
  ]
}
```

### `.stylelintrc.cjs`

Blocks hardcoded colors in CSS:

```javascript
rules: {
  "declaration-property-value-disallowed-list": {
    "/^(background|color|border)$/": [
      "/^#(?!fff|ffffff|000|000000)/i",
      "/^rgb/",
      "/^hsl/"
    ]
  }
}
```

### `tailwind.config.js`

Safelist ensures brand classes aren't purged:

```javascript
safelist: [{ pattern: /(bg|text|border)-(brand)-(primary|secondary|success)/ }];
```

---

## Workflow Integration

### Local Development

```bash
# Before committing
npm run polish:check

# Auto-fix issues
npm run polish:fix

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add new feature"
```

### CI/CD Pipeline

```yaml
name: Quality Checks

on: [push, pull_request]

jobs:
  polish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run polish:check
      - run: npm run test:ui
      - run: npm run audit:lighthouse
```

### Pre-deployment

```bash
# Full suite before deploying
npm run ci:polish
```

---

## Customization

### Add New Color Pairs

Edit `autopilot-brand.json`:

```json
{
  "colors": {
    "myNewColor": "#123456",
    "onMyNewColor": "#FFFFFF"
  }
}
```

Update `tools/brand-guard.cjs`:

```javascript
const pairs = [
  // ... existing pairs
  { bg: 'myNewColor', text: 'onMyNewColor', name: 'Text on my new color' },
];
```

### Adjust Contrast Thresholds

Edit `autopilot-brand.json`:

```json
{
  "contrast": {
    "minAA": 4.5, // Stricter: 4.5, Looser: 3.0
    "minAAA": 7.0 // Stricter: 7.0, Looser: 4.5
  }
}
```

### Add More Visual Tests

Edit `tests/ui.spec.ts`:

```typescript
const pages = [
  { route: '/', name: 'home' },
  { route: '/my-new-page', name: 'my-new-page' },
];
```

### Customize Lighthouse Thresholds

Edit `.lighthouserc.json`:

```json
{
  "assertions": {
    "categories:performance": ["error", { "minScore": 0.95 }]
  }
}
```

---

## Troubleshooting

### Brand Guard Fails

**Problem:** Contrast ratio below 4.5:1

**Solution:**

1. Check `autopilot-brand.json` for the failing pair
2. Adjust colors to increase contrast
3. Use a contrast checker: https://webaim.org/resources/contrastchecker/
4. Re-run: `npm run brand:guard`

### ESLint Blocks Hardcoded Color

**Problem:** `Use brand tokens instead of #3b82f6`

**Solution:**

```javascript
// ❌ Before
<div style={{ color: '#3b82f6' }}>

// ✅ After
<div className="text-brand-primary">
// or
<div style={{ color: 'var(--brand-primary)' }}>
```

### Visual Test Fails

**Problem:** Screenshot differs from baseline

**Solution:**

1. Review the diff in `test-results/`
2. If change is intentional: `npm run test:ui:update`
3. If change is unintended: fix the code

### Lighthouse Fails

**Problem:** Performance score below 85

**Solution:**

1. Check Lighthouse report in `lighthouseci/`
2. Optimize images, reduce bundle size
3. Lazy load components
4. Re-run: `npm run audit:lighthouse`

---

## Best Practices

### 1. Run Checks Frequently

```bash
# Before committing
npm run polish:check

# After pulling changes
npm run test:ui
```

### 2. Update Snapshots Carefully

Only update visual snapshots when changes are intentional:

```bash
# Review changes first
npm run test:ui

# If intentional
npm run test:ui:update
```

### 3. Fix Violations Immediately

Don't let violations accumulate:

```bash
# Auto-fix what you can
npm run polish:fix

# Manually fix the rest
npm run polish:check
```

### 4. Document Exceptions

If you must use a hardcoded color, document why:

```javascript
// Exception: Third-party library requires specific color
// eslint-disable-next-line no-restricted-syntax
const color = '#3b82f6';
```

---

## Metrics to Track

### Brand Consistency

- Hardcoded color violations: **Target < 100**
- Brand token usage: **Target > 95%**

### Accessibility

- WCAG AA compliance: **Target 100%**
- WCAG AAA compliance: **Target > 80%**

### Performance

- Lighthouse Performance: **Target ≥ 90**
- Lighthouse Accessibility: **Target ≥ 95**

### Quality

- ESLint errors: **Target 0**
- Stylelint errors: **Target 0**
- Visual regression failures: **Target 0**

---

## Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Lighthouse Docs:** https://developers.google.com/web/tools/lighthouse
- **Playwright Docs:** https://playwright.dev/
- **ESLint Rules:** https://eslint.org/docs/rules/

---

## Summary

The Polish & Enforcement System:

✅ **Prevents** hardcoded colors from entering codebase  
✅ **Guarantees** WCAG accessibility compliance  
✅ **Catches** visual regressions automatically  
✅ **Maintains** performance standards  
✅ **Enforces** quality before code lands

**Result:** Consistent, accessible, high-quality UI across all pages.

---

**Questions?** Check the main brand docs: `docs/BRAND_SYSTEM.md`
