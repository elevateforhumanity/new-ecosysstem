# Durable.co Implementation Guide

Step-by-step guide to implement the polished Next.js design on Durable.co.

## Step 1: Build the Next.js Site

```bash
# In Gitpod or locally
bash scripts/setup-polished-site.sh
cd web
npm run build
```

## Step 2: Extract Component HTML

Each component generates clean HTML. Copy from these files:

```
web/src/components/
├── Navbar.tsx    → Header section
├── Hero.tsx      → Hero banner
├── Features.tsx  → Features grid
├── Pricing.tsx   → Pricing cards
├── CTA.tsx       → Call-to-action
└── Footer.tsx    → Footer
```

## Step 3: Durable Page Setup

### Create New Page in Durable

1. Log into Durable.co
2. Create new page or edit existing
3. Add sections in this order:
   - Header (Navbar)
   - Hero
   - Features
   - Pricing
   - CTA
   - Footer

## Step 4: Add Custom CSS

In Durable's **Custom CSS** section:

```css
/* Import Tailwind */
@import url('https://cdn.tailwindcss.com');

/* Custom Styles */
:root {
  --radius: 14px;
}

body {
  background: radial-gradient(1200px 800px at 10% -10%, rgba(14,165,233,.15), transparent 60%), #0b1220;
  color: #e5e7eb;
}

.gradient-text {
  background: linear-gradient(90deg, #22d3ee, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section {
  padding: 96px 0;
}

.card-glass {
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

## Step 5: Update Links

Replace all internal links with your Durable URLs:

### Navigation Links
```html
<!-- Before -->
<a href="#programs">Programs</a>

<!-- After -->
<a href="https://elevateforhumanity.durable.co/programs">Programs</a>
```

### Link Mapping Table

| Component | Link ID | Update To |
|-----------|---------|-----------|
| Navbar | `#programs` | `/programs` |
| Navbar | `#pricing` | `/pricing` |
| Navbar | `#contact` | `/contact` |
| Hero | `#apply` | `/apply` |
| Hero | `#demo` | `/demo` |
| CTA | `mailto:careers@...` | Keep as-is |

## Step 6: Component-by-Component Implementation

### Navbar

1. Add **Header** section in Durable
2. Set background: `rgba(11, 18, 32, 0.8)`
3. Add backdrop blur effect
4. Insert navigation links
5. Make sticky: `position: sticky; top: 0; z-index: 50;`

### Hero

1. Add **Hero** section
2. Use 2-column layout (text left, media right)
3. Add gradient headline
4. Add two buttons (primary + outline)
5. Insert placeholder for video/image

### Features

1. Add **Features** section
2. Use 3-column grid
3. Add icon + title + description per card
4. Apply `.card-glass` class

### Pricing

1. Add **Pricing** section
2. Use 3-column grid
3. Add price + features list + button per card
4. Highlight middle card (Pro)

### CTA

1. Add **CTA** section
2. Center align content
3. Add headline + description + button
4. Apply `.card-glass` to container

### Footer

1. Add **Footer** section
2. Use flex layout (copyright left, contact right)
3. Add border-top
4. Keep minimal

## Step 7: Add Animations (Optional)

In Durable's **Custom JavaScript**:

```javascript
// Fade in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
});

document.querySelectorAll('.section').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});
```

## Step 8: Mobile Optimization

Ensure responsive breakpoints work:

```css
/* Mobile */
@media (max-width: 768px) {
  .section { padding: 48px 0; }
  h1 { font-size: 2rem; }
  .grid { grid-template-columns: 1fr; }
}
```

## Step 9: Test & Publish

1. Preview on mobile & desktop
2. Test all links
3. Check animations
4. Verify forms work
5. Publish to production

## Quick Copy-Paste Sections

### Hero HTML Structure
```html
<section class="section">
  <div class="container grid lg:grid-cols-2 gap-10 items-center">
    <div>
      <h1 class="text-4xl md:text-6xl font-black">
        Workforce, <span class="gradient-text">Apprenticeships</span>, & Real Outcomes
      </h1>
      <p class="mt-5 text-white/70">
        Skill up, get hired, or start a venture—with a design-first platform.
      </p>
      <div class="mt-8 flex gap-3">
        <a href="/apply" class="px-6 py-3 bg-blue-500 text-white rounded-lg">Apply Free</a>
        <a href="/demo" class="px-6 py-3 border border-white/20 text-white rounded-lg">Watch Demo</a>
      </div>
    </div>
    <div class="card-glass p-4">
      <!-- Add your video/image here -->
    </div>
  </div>
</section>
```

### Features HTML Structure
```html
<section class="section">
  <div class="container">
    <h2 class="text-3xl md:text-4xl font-bold mb-8">Built for learners, employers, and founders</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="card-glass p-6">
        <h3 class="font-semibold mb-2">Design-first UX</h3>
        <p class="text-white/70">Modern, fast, accessible.</p>
      </div>
      <!-- Repeat for other features -->
    </div>
  </div>
</section>
```

## Troubleshooting

**Issue**: Tailwind classes not working
- **Fix**: Ensure CDN is loaded: `<script src="https://cdn.tailwindcss.com"></script>`

**Issue**: Animations not smooth
- **Fix**: Add `transition-all duration-300` to elements

**Issue**: Mobile layout broken
- **Fix**: Use Durable's responsive grid system

**Issue**: Links not working
- **Fix**: Use absolute URLs, not hash links

## Support

Need help? Contact: careers@elevateforhumanity.org
