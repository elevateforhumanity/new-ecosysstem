# Brand Colors Quick Start

> **TL;DR:** Use `bg-brand-primary` instead of `bg-blue-600`. Use `var(--brand-text)` instead of `#000000`.

## Why This Matters

Imagine you're building a house. Would you:
- **Option A:** Let every worker pick their own shade of paint? (Chaos! 🎨💥)
- **Option B:** Give everyone the same paint cans with clear labels? (Harmony! ✨)

We chose Option B. Here's how to use it.

## The 3 Ways to Use Brand Colors

### 1. Tailwind Classes (Easiest)

```jsx
// ❌ Don't do this
<button className="bg-blue-600 text-white">

// ✅ Do this instead
<button className="bg-brand-primary text-white">
```

**Common patterns:**
```jsx
// Backgrounds
bg-brand-primary        // Main brand color
bg-brand-surface        // Cards, panels
bg-brand-success        // Success states

// Text
text-brand-text         // Primary text
text-brand-text-muted   // Secondary text
text-brand-info         // Links, info

// Borders
border-brand-border     // Default borders

// Hover states
hover:bg-brand-primary-hover
hover:text-brand-info
```

### 2. CSS Variables (For CSS files)

```css
/* ❌ Don't do this */
.my-card {
  background: #f8fafc;
  color: #1f2937;
}

/* ✅ Do this instead */
.my-card {
  background: var(--brand-surface);
  color: var(--brand-text);
}
```

### 3. Inline Styles (When you must)

```jsx
// ❌ Don't do this
<div style={{ color: '#6b7280' }}>

// ✅ Do this instead
<div style={{ color: 'var(--brand-text-muted)' }}>
```

## The Color Palette (Cheat Sheet)

### Main Colors
| Token | Use For | Example |
|-------|---------|---------|
| `brand-primary` | Main brand color, primary buttons | "Apply Now" button |
| `brand-secondary` | Secondary actions | "Learn More" button |
| `brand-success` | Success messages, positive actions | "Enrolled!" badge |
| `brand-info` | Links, informational content | "Read more" link |
| `brand-warning` | Warnings, caution states | "Payment due" alert |
| `brand-danger` | Errors, destructive actions | "Delete" button |

### Text Colors
| Token | Use For | Example |
|-------|---------|---------|
| `brand-text` | Main content text | Paragraphs, headings |
| `brand-text-muted` | Secondary text | Descriptions, metadata |
| `brand-text-light` | Tertiary text | Timestamps, footnotes |

### Backgrounds
| Token | Use For | Example |
|-------|---------|---------|
| `brand-bg` | Page background | Main body |
| `brand-surface` | Cards, panels | Course cards |
| `brand-surface-dark` | Hover states on surfaces | Card hover |

### Interactive States
| Token | Use For | Example |
|-------|---------|---------|
| `brand-hover` | Hover states | Button hover |
| `brand-active` | Active/pressed states | Button click |
| `brand-focus` | Focus rings | Input focus |

### Borders
| Token | Use For | Example |
|-------|---------|---------|
| `brand-border` | Default borders | Input borders |
| `brand-border-dark` | Emphasized borders | Active tab |

## Real Examples

### Example 1: A Button

```jsx
function ApplyButton() {
  return (
    <button className="
      bg-brand-primary 
      hover:bg-brand-primary-hover 
      active:bg-brand-primary-active
      text-white 
      px-6 py-3 
      rounded-lg
      font-semibold
    ">
      Apply Now
    </button>
  );
}
```

### Example 2: A Card

```jsx
function CourseCard({ title, description }) {
  return (
    <div className="
      bg-brand-surface 
      border border-brand-border 
      rounded-lg 
      p-6
      hover:bg-brand-surface-dark
      transition-colors
    ">
      <h3 className="text-brand-text text-xl font-bold mb-2">
        {title}
      </h3>
      <p className="text-brand-text-muted">
        {description}
      </p>
    </div>
  );
}
```

### Example 3: A Status Badge

```jsx
function StatusBadge({ status }) {
  const colors = {
    active: 'bg-brand-surface text-brand-success',
    pending: 'bg-brand-surface text-brand-warning',
    inactive: 'bg-brand-surface text-brand-text-muted',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
```

### Example 4: A Form Input

```jsx
function TextInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-brand-text font-medium mb-2">
        {label}
      </label>
      <input
        className="
          w-full
          px-4 py-2
          border border-brand-border
          rounded-lg
          text-brand-text
          focus:border-brand-primary
          focus:ring-2 focus:ring-brand-focus
          transition-colors
        "
        {...props}
      />
    </div>
  );
}
```

## Common Mistakes (And How to Fix Them)

### Mistake 1: Using Random Colors

```jsx
// ❌ Bad - What is #3b82f6? Why this specific blue?
<div className="bg-blue-500 text-white">

// ✅ Good - Clear intent, consistent with brand
<div className="bg-brand-info text-white">
```

### Mistake 2: Hardcoding Grays

```jsx
// ❌ Bad - Which gray? Why this one?
<p style={{ color: '#6b7280' }}>

// ✅ Good - Semantic name, easy to understand
<p className="text-brand-text-muted">
```

### Mistake 3: Inconsistent Hover States

```jsx
// ❌ Bad - Different hover colors everywhere
<button className="bg-blue-600 hover:bg-blue-800">
<button className="bg-blue-500 hover:bg-blue-600">

// ✅ Good - Consistent hover behavior
<button className="bg-brand-primary hover:bg-brand-primary-hover">
```

### Mistake 4: Not Using Semantic Names

```jsx
// ❌ Bad - What does this color mean?
<span className="text-green-600">Success!</span>

// ✅ Good - Clear meaning
<span className="text-brand-success">Success!</span>
```

## Tools to Help You

### Check for violations
```bash
npm run lint:brand
```
This shows you all the places using hardcoded colors.

### Auto-fix common issues
```bash
npm run fix:brand:dry    # Preview changes
npm run fix:brand        # Apply changes
```
This automatically converts many hardcoded colors to brand tokens.

### See what would change
```bash
npm run fix:brand:dry
```
Safe to run - won't modify any files.

## When You Need a New Color

**Don't just add it to your component!** Follow this process:

1. **Check if it exists:** Look in `src/styles/brand.css`
2. **Ask yourself:** "Is this a one-off or will others need it?"
3. **If others need it:** Add it to `brand.css` with a semantic name
4. **If it's truly unique:** Document why in a comment

```css
/* In brand.css */
:root {
  /* Add new token with clear name */
  --brand-highlight: #ffd700;  /* Special promotional highlight */
}
```

Then use it:
```jsx
<div style={{ background: 'var(--brand-highlight)' }}>
```

## Testing Your Changes

After using brand colors:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Check for violations:**
   ```bash
   npm run lint:brand
   ```

3. **Visual check:**
   - Start dev server: `npm run dev`
   - Check your component looks correct
   - Test hover/focus states

## Getting Help

**Questions?**
- Read the full docs: `docs/BRAND_SYSTEM.md`
- Check the brand tokens: `src/styles/brand.css`
- Ask in team chat: "Which brand color should I use for X?"

**Found a bug?**
- Check if it's a known issue
- Report with screenshots
- Include the component code

## Quick Reference Card

Print this and keep it handy! 📋

```
BRAND COLORS CHEAT SHEET
========================

Tailwind Classes:
  bg-brand-primary          Main brand color
  bg-brand-success          Green (success)
  bg-brand-info             Blue (info)
  bg-brand-warning          Amber (warning)
  bg-brand-danger           Red (error)
  
  text-brand-text           Black (main text)
  text-brand-text-muted     Gray (secondary)
  text-brand-text-light     Light gray (tertiary)
  
  border-brand-border       Default borders
  
CSS Variables:
  var(--brand-primary)
  var(--brand-success)
  var(--brand-info)
  var(--brand-warning)
  var(--brand-danger)
  var(--brand-text)
  var(--brand-text-muted)
  var(--brand-border)

Commands:
  npm run lint:brand        Check violations
  npm run fix:brand:dry     Preview fixes
  npm run fix:brand         Apply fixes
```

## Remember

- **Use brand tokens, not hardcoded colors**
- **Semantic names over hex codes**
- **Consistency over creativity**
- **When in doubt, ask!**

---

**Welcome to the brand system! 🎨**

*Making your code more maintainable, one color at a time.*
