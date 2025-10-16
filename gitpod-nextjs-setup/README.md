# Gitpod One-Click Next.js Setup

Polished Next.js landing page with Tailwind, shadcn/ui, animations, and modern design.

## Quick Start

### Option 1: Gitpod (Recommended)

1. Copy `.gitpod.yml` and `scripts/setup-polished-site.sh` to your repo root
2. Push to GitHub
3. Open in Gitpod: `https://gitpod.io/#YOUR_REPO_URL`
4. Site auto-builds and opens at port 3000

### Option 2: Local Setup

```bash
bash scripts/setup-polished-site.sh
cd web
npm run dev
```

## What's Included

### Tech Stack
- **Next.js 15** with App Router
- **Tailwind CSS** + custom design system
- **shadcn/ui** components
- **Framer Motion** animations
- **Lucide React** icons

### Components
- `Navbar` - Sticky header with navigation
- `Hero` - Animated hero banner with CTAs
- `Features` - 3-column feature grid
- `Pricing` - 3-tier pricing cards
- `CTA` - Call-to-action section
- `Footer` - Contact info

### Design System
- Dark theme with gradient accents
- Glass morphism cards
- Gradient text effects
- Responsive grid layouts
- Smooth animations

## Customization

### Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  brand: { DEFAULT: "#0ea5e9", dark:"#0284c7" },
  bg: "#0b1220"
}
```

### Content
Edit components in `src/components/`:
- `Hero.tsx` - Main headline & CTAs
- `Features.tsx` - Feature cards
- `Pricing.tsx` - Pricing tiers
- `CTA.tsx` - Bottom CTA

### Styling
Edit `src/styles/globals.css` for global styles.

## Durable.co Implementation

### Copy Components to Durable

1. **Extract HTML from components**:
```bash
cd web
npm run build
# Copy HTML from .next/server/app/page.html
```

2. **Copy Tailwind classes** to Durable's custom CSS
3. **Update links** to match Durable's routing
4. **Add animations** via Durable's custom JS

### Component Mapping

| Next.js Component | Durable Section |
|------------------|-----------------|
| `Hero` | Hero Banner |
| `Features` | Features Grid |
| `Pricing` | Pricing Table |
| `CTA` | Call-to-Action |
| `Footer` | Footer |

### Tailwind in Durable

Add to Durable's Custom CSS:
```css
@import url('https://cdn.tailwindcss.com');

.gradient-text {
  background: linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-glass {
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
}
```

## Links Configuration

Update all `href` attributes:

```tsx
// Before (Next.js)
<a href="#programs">Programs</a>

// After (Durable)
<a href="https://elevateforhumanity.org/programs">Programs</a>
```

### Link Mapping

| Section | Durable URL |
|---------|-------------|
| Programs | `/programs` |
| Pricing | `/pricing` |
| Contact | `/contact` |
| Apply | `/apply` |

## Deployment

### Vercel (Next.js)
```bash
cd web
vercel deploy
```

### Durable.co
1. Copy component HTML
2. Paste into Durable page builder
3. Update links to absolute URLs
4. Add custom CSS/JS
5. Publish

## Support

- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Tailwind: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- shadcn/ui: [ui.shadcn.com](https://ui.shadcn.com)
