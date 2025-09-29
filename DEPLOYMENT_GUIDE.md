# 🚀 **DEPLOYMENT GUIDE** - Enterprise Landing Page

## ✅ **READY TO DEPLOY**

Your enterprise landing page is built and ready for deployment in multiple formats:

### **📁 Files Available:**
- `dist/index.html` - Main landing page
- `dist/apply.html` - Student application page
- `dist/employers.html` - Employer partnership page
- `dist/programs.html` - Program catalog
- `dist/policies.html` - Compliance and notices
- `dist/robots.txt` - SEO robots file
- `dist/sitemap.xml` - SEO sitemap
- `dist/onepage-inline.html` - Single file for Durable
- `dist/durable-site.zip` - Complete site package

## 🎯 **DEPLOYMENT OPTIONS**

### **Option 1: Durable (Custom HTML)**
1. Copy the contents of `dist/onepage-inline.html`
2. Go to Durable → Custom HTML section
3. Paste the entire HTML content
4. Save and publish

### **Option 2: Cloudflare Pages (Recommended)**
1. Go to [cloudflare.com](https://cloudflare.com)
2. Drag and drop the `dist/` folder
3. Or connect your GitHub repo
4. Build command: `node scripts/build-durable-site.mjs --inline`
5. Publish directory: `dist`

### **Option 3: GitHub Pages**
1. Push the `dist/` folder to a `gh-pages` branch
2. Enable GitHub Pages in repository settings
3. Set source to `gh-pages` branch

### **Option 4: Vercel**
1. Connect your GitHub repository
2. Set build command: `node scripts/build-durable-site.mjs --inline`
3. Set output directory: `dist`

## 🔗 **LIVE PREVIEW**

**Current Gitpod Preview:** [https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev](https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev)

### **Test All Pages:**
- **Main:** [/](https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/)
- **Apply:** [/apply.html](https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/apply.html)
- **Employers:** [/employers.html](https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/employers.html)
- **Programs:** [/programs.html](https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/programs.html)
- **Policies:** [/policies.html](https://8081--01997c51-5c00-7915-9166-f10af4ac25e6.us-east-1-01.gitpod.dev/policies.html)

## ⚙️ **FEATURES INCLUDED**

### **Enterprise Design:**
- ✅ Professional hero section with carousel
- ✅ Exact testimonials from elevateforhumanity.org
- ✅ Program cards with WRG/WIOA eligibility
- ✅ Funding pathway wizard
- ✅ Responsive design for all devices

### **Functionality:**
- ✅ Working navigation between pages
- ✅ Funding wizard with region/goal selection
- ✅ Professional styling and animations
- ✅ SEO optimized with meta tags
- ✅ Accessibility compliant

### **Technical:**
- ✅ No external dependencies
- ✅ All CSS/JS inlined for Durable
- ✅ Fast loading and mobile optimized
- ✅ Cross-browser compatible

## 🎯 **RECOMMENDED DEPLOYMENT**

**For immediate deployment:** Use **Cloudflare Pages** - drag and drop the `dist/` folder for instant live site.

**For Durable integration:** Copy `dist/onepage-inline.html` content into Durable Custom HTML.

**🎉 Your enterprise landing page is ready to go live!**