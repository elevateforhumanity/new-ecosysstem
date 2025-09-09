# 🚀 Vercel Deployment Checklist for Elevate for Humanity

## ✅ Pre-Deployment Checklist

### 1. Build Verification
- [ ] Run `npm run build` locally
- [ ] Confirm `dist/` folder is created
- [ ] Verify `dist/index.html` exists
- [ ] Test build locally: `npx serve dist` or `cd dist && python -m http.server 3000`

### 2. Vercel Configuration
- [ ] `vercel.json` exists in project root
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework: `vite`
- [ ] Rewrites configured for SPA routing
- [ ] Security headers configured
- [ ] Domain redirects set up

### 3. Environment Variables (if needed)
- [ ] Check if any environment variables are required
- [ ] Set them in Vercel dashboard if needed
- [ ] Common ones: `NODE_ENV`, `API_KEYS`, `STRIPE_SECRET_KEY`, etc.

## 🚀 Deployment Steps

### Step 1: Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `elevateforhumanity/new-ecosysstem`
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Deploy Preview
1. Click "Deploy"
2. Wait for build to complete
3. Check the preview URL to ensure everything works
4. Test navigation (should not get 404s)

### Step 3: Promote to Production
1. In Vercel dashboard, go to your project
2. Click "Deployments" tab
3. Find the latest successful deployment
4. Click "Promote to Production"

## 🌐 DNS Configuration

### For www.elevateforhumanity.org
1. Go to your DNS provider (Cloudflare/Google Domains/etc.)
2. Add CNAME record:
   - **Name**: `www`
   - **Type**: `CNAME`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `Auto` or `3600`

### For elevateforhumanity.org (root domain)
1. Add A record:
   - **Name**: `@` (or leave blank)
   - **Type**: `A`
   - **Value**: `76.76.21.21` (Vercel's A record)
   - **TTL**: `Auto` or `3600`

## 🔍 Testing Checklist

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Navigation works (no 404s)
- [ ] All links work
- [ ] Forms submit properly
- [ ] Mobile responsive

### Content Verification
- [ ] Employer savings information visible (WEX, OJT, JRI, WRG, ETPL, Apprenticeship)
- [ ] Student benefits displayed (free tuition, certifications)
- [ ] Partnership CTA visible (Schedule a Team Meeting / Call 317-760-7908)
- [ ] Contact information correct

### Performance Tests
- [ ] Page loads within 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] HTTPS enabled

## 📞 Outreach Alignment

### Email Campaign Consistency
- [ ] Site messaging matches email blasts
- [ ] Contact info matches (317-760-7908)
- [ ] Value propositions align
- [ ] Call-to-action buttons work

### Target Audience Features
- [ ] Workforce Boards can find relevant info
- [ ] Chambers of Commerce see partnership benefits
- [ ] Employers see savings opportunities
- [ ] Students see program benefits

## 🐛 Troubleshooting

### Common Issues & Solutions

**404 Errors on Navigation:**
- ✅ Check `vercel.json` has rewrites
- ✅ Verify build output in `dist/`
- ✅ Confirm Vercel output directory is set to `dist`

**Blank Page:**
- ✅ Check if `dist/index.html` exists
- ✅ Verify build command works locally
- ✅ Check Vercel build logs for errors

**DNS Issues:**
- ✅ Wait 24-48 hours for DNS propagation
- ✅ Check DNS records are correct
- ✅ Verify domain is connected in Vercel

**Build Failures:**
- ✅ Check package.json scripts
- ✅ Verify dependencies are installed
- ✅ Check for build errors in logs

## 📊 Post-Deployment Monitoring

### Analytics Setup
- [ ] Google Analytics installed
- [ ] Conversion tracking set up
- [ ] Email campaign attribution tracking

### Performance Monitoring
- [ ] Core Web Vitals monitoring
- [ ] Page load times
- [ ] Error tracking

## 🎯 Success Metrics

- [ ] Site loads within 3 seconds
- [ ] Mobile-friendly (Google Mobile-Friendly Test)
- [ ] HTTPS enabled
- [ ] No broken links
- [ ] Contact form submissions working
- [ ] Phone number clicks tracked

---

## 📞 Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Domain Support**: Contact your DNS provider
- **Development Support**: Check build logs in Vercel dashboard

---

*Last Updated: September 9, 2025*
*For Elevate for Humanity - Workforce Development Platform*
