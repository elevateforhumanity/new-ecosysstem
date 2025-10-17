# Deployment Guide

## Required Environment Variables

Before deploying, you must configure these environment variables in your deployment platform:

### Supabase Configuration

```bash
VITE_SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA
```

## Netlify Deployment

### 1. Configure Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2. Build Settings

The `netlify.toml` file is already configured:

```toml
[build]
  command = "pnpm install && pnpm run build"
  publish = "dist"
```

### 3. Deploy

Push to main branch or trigger manual deploy:

```bash
git push origin main
```

## Cloudflare Pages Deployment

### 1. Configure Environment Variables

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → Your project → **Settings** → **Environment variables**
3. Add for **Production** environment:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2. Build Configuration

- **Build command**: `pnpm install && pnpm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: `20`

### 3. Deploy

Connect your GitHub repository or use Wrangler CLI:

```bash
pnpm install -g wrangler
wrangler pages deploy dist --project-name=elevateforhumanity
```

## Local Development

For local development, the `.env` file is already configured. Just run:

```bash
pnpm install
pnpm run dev
```

## Troubleshooting

### Build fails with "Missing environment variables"

Make sure you've added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your deployment platform's environment variables.

### Styling not showing

1. Clear browser cache
2. Check that the CSS file is being loaded in the Network tab
3. Verify the build output includes `dist/assets/*.css`

### 404 errors on page refresh

Make sure your deployment platform is configured to redirect all routes to `index.html`:

**Netlify**: Already configured in `netlify.toml`
**Cloudflare Pages**: Automatically handled

## Build Verification

Test the build locally:

```bash
pnpm run build
pnpm run preview
```

Visit [http://localhost:8080](http://localhost:8080) to verify.
