#!/usr/bin/env bash
# Complete SEO, Analytics, Sitemaps, Routes, Index, Crawls Setup

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   SEO + ANALYTICS + SITEMAPS + ROUTES + CRAWLS SETUP     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# STEP 1: Create robots.txt
# ============================================
log_info "STEP 1: Creating robots.txt..."

cat > public/robots.txt << 'EOF'
# Elevate for Humanity - Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://lms.elevateforhumanity.org/sitemap.xml
Sitemap: https://lms.elevateforhumanity.org/sitemap-pages.xml
Sitemap: https://lms.elevateforhumanity.org/sitemap-courses.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /settings/

# Allow public pages
Allow: /courses
Allow: /programs
Allow: /partners
Allow: /about
Allow: /contact
Allow: /donate

# Crawl delay
Crawl-delay: 1
EOF

log_success "Created public/robots.txt"

# ============================================
# STEP 2: Create Dynamic Sitemap Generator
# ============================================
log_info "STEP 2: Creating dynamic sitemap generator..."

mkdir -p public/sitemaps

cat > scripts/generate-sitemap-dynamic.js << 'EOF'
/**
 * Dynamic Sitemap Generator
 * Generates sitemaps for all pages, courses, and dynamic content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://lms.elevateforhumanity.org';
const OUTPUT_DIR = path.join(__dirname, '../public');

// Static pages
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/courses', priority: 0.9, changefreq: 'daily' },
  { url: '/programs', priority: 0.9, changefreq: 'weekly' },
  { url: '/lms', priority: 0.9, changefreq: 'daily' },
  { url: '/get-started', priority: 0.8, changefreq: 'weekly' },
  { url: '/partners', priority: 0.8, changefreq: 'weekly' },
  { url: '/ecosystem', priority: 0.7, changefreq: 'weekly' },
  { url: '/donate', priority: 0.7, changefreq: 'monthly' },
  { url: '/about', priority: 0.6, changefreq: 'monthly' },
  { url: '/support', priority: 0.6, changefreq: 'monthly' },
  { url: '/login', priority: 0.5, changefreq: 'monthly' },
  { url: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { url: '/terms-of-service', priority: 0.4, changefreq: 'yearly' },
];

// Dynamic pages (will be fetched from API in production)
const dynamicPages = {
  courses: [
    // These would come from API: /api/courses
    // Example: { id: '123', slug: 'web-development', updated: '2024-01-15' }
  ],
  programs: [
    // These would come from API: /api/programs
  ],
  partners: [
    // These would come from API: /api/partners
  ]
};

function generateSitemapXML(pages, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), xml);
  console.log(`✅ Generated ${filename}`);
}

function generateSitemapIndex() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-courses.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml);
  console.log('✅ Generated sitemap.xml (index)');
}

// Generate sitemaps
console.log('🗺️  Generating sitemaps...\n');

// Static pages sitemap
generateSitemapXML(staticPages, 'sitemap-pages.xml');

// Courses sitemap (placeholder - will be dynamic in production)
const coursesPages = [
  { url: '/courses', priority: 0.9, changefreq: 'daily' },
  { url: '/courses/catalog', priority: 0.8, changefreq: 'daily' },
];
generateSitemapXML(coursesPages, 'sitemap-courses.xml');

// Main sitemap index
generateSitemapIndex();

console.log('\n✅ All sitemaps generated successfully!');
EOF

log_success "Created scripts/generate-sitemap-dynamic.js"

# ============================================
# STEP 3: Create SEO Meta Tags Component
# ============================================
log_info "STEP 3: Creating SEO meta tags component..."

cat > src/components/SEO.jsx << 'EOF'
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'Elevate for Humanity - Workforce Development & Learning Platform',
  description = 'Transform your career with our comprehensive workforce development programs. Access courses, certifications, and career support.',
  keywords = 'workforce development, online learning, career training, professional development, LMS',
  image = 'https://lms.elevateforhumanity.org/og-image.jpg',
  url = 'https://lms.elevateforhumanity.org',
  type = 'website'
}) {
  const fullTitle = title.includes('Elevate for Humanity') ? title : `${title} | Elevate for Humanity`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Elevate for Humanity" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Elevate for Humanity" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Schema.org markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Elevate for Humanity",
          "description": description,
          "url": url,
          "logo": "https://lms.elevateforhumanity.org/logo.png",
          "sameAs": [
            "https://www.facebook.com/elevateforhumanity",
            "https://twitter.com/elevate4humanity",
            "https://www.linkedin.com/company/elevate-for-humanity"
          ]
        })}
      </script>
    </Helmet>
  );
}
EOF

log_success "Created src/components/SEO.jsx"

# ============================================
# STEP 4: Create Google Analytics Component
# ============================================
log_info "STEP 4: Creating Google Analytics component..."

cat > src/components/GoogleAnalytics.jsx << 'EOF'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function GoogleAnalytics() {
  const location = useLocation();
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window.gtag === 'undefined') {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);
    }
  }, []);

  useEffect(() => {
    // Track page views on route change
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
EOF

log_success "Created src/components/GoogleAnalytics.jsx"

# ============================================
# STEP 5: Create Routes Configuration
# ============================================
log_info "STEP 5: Creating routes configuration..."

cat > src/routes-config.json << 'EOF'
{
  "routes": [
    {
      "path": "/",
      "name": "Home",
      "component": "HomePage",
      "public": true,
      "seo": {
        "title": "Home - Elevate for Humanity",
        "description": "Transform your career with comprehensive workforce development programs",
        "priority": 1.0
      }
    },
    {
      "path": "/courses",
      "name": "Courses",
      "component": "CourseCatalog",
      "public": true,
      "seo": {
        "title": "Browse Courses",
        "description": "Explore our comprehensive catalog of professional development courses",
        "priority": 0.9
      }
    },
    {
      "path": "/courses/:id",
      "name": "Course Detail",
      "component": "CourseDetail",
      "public": true,
      "dynamic": true
    },
    {
      "path": "/programs",
      "name": "Programs",
      "component": "Programs",
      "public": true,
      "seo": {
        "title": "Workforce Development Programs",
        "description": "Comprehensive training programs for career advancement",
        "priority": 0.9
      }
    },
    {
      "path": "/lms",
      "name": "Learning Management System",
      "component": "LMS",
      "public": true,
      "seo": {
        "title": "Learning Platform",
        "description": "Access your courses and track your progress",
        "priority": 0.9
      }
    },
    {
      "path": "/dashboard",
      "name": "Dashboard",
      "component": "StudentDashboard",
      "protected": true
    },
    {
      "path": "/login",
      "name": "Login",
      "component": "Login",
      "public": true,
      "seo": {
        "title": "Login",
        "description": "Sign in to your account",
        "priority": 0.5
      }
    },
    {
      "path": "/partners",
      "name": "Partners",
      "component": "Partners",
      "public": true,
      "seo": {
        "title": "Partner With Us",
        "description": "Join our ecosystem of organizations making a difference",
        "priority": 0.8
      }
    },
    {
      "path": "/donate",
      "name": "Donate",
      "component": "Donate",
      "public": true,
      "seo": {
        "title": "Support Our Mission",
        "description": "Help us provide education and training to those in need",
        "priority": 0.7
      }
    }
  ]
}
EOF

log_success "Created src/routes-config.json"

# ============================================
# STEP 6: Update index.html with SEO
# ============================================
log_info "STEP 6: Updating index.html with SEO tags..."

cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Meta Tags -->
    <title>Elevate for Humanity - Workforce Development & Learning Platform</title>
    <meta name="title" content="Elevate for Humanity - Workforce Development & Learning Platform" />
    <meta name="description" content="Transform your career with our comprehensive workforce development programs. Access courses, certifications, and career support." />
    <meta name="keywords" content="workforce development, online learning, career training, professional development, LMS, education" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://lms.elevateforhumanity.org/" />
    <meta property="og:title" content="Elevate for Humanity - Workforce Development & Learning Platform" />
    <meta property="og:description" content="Transform your career with our comprehensive workforce development programs." />
    <meta property="og:image" content="https://lms.elevateforhumanity.org/og-image.jpg" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://lms.elevateforhumanity.org/" />
    <meta property="twitter:title" content="Elevate for Humanity - Workforce Development & Learning Platform" />
    <meta property="twitter:description" content="Transform your career with our comprehensive workforce development programs." />
    <meta property="twitter:image" content="https://lms.elevateforhumanity.org/og-image.jpg" />
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="author" content="Elevate for Humanity" />
    <link rel="canonical" href="https://lms.elevateforhumanity.org/" />
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://api.elevateforhumanity.org" />
    <link rel="preconnect" href="https://cuxzzpsyufcewtmicszk.supabase.co" />
    
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    
    <!-- Schema.org markup for Google -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Elevate for Humanity",
      "description": "Workforce development and professional training programs",
      "url": "https://lms.elevateforhumanity.org",
      "logo": "https://lms.elevateforhumanity.org/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-317-314-3757",
        "contactType": "Customer Service",
        "email": "info@elevateforhumanity.org"
      },
      "sameAs": [
        "https://www.facebook.com/elevateforhumanity",
        "https://twitter.com/elevate4humanity",
        "https://www.linkedin.com/company/elevate-for-humanity"
      ]
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

log_success "Updated index.html with SEO tags"

# ============================================
# STEP 7: Create Crawl Configuration
# ============================================
log_info "STEP 7: Creating crawl configuration..."

cat > public/.well-known/security.txt << 'EOF'
Contact: mailto:security@elevateforhumanity.org
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://lms.elevateforhumanity.org/.well-known/security.txt
EOF

mkdir -p public/.well-known

log_success "Created security.txt"

# ============================================
# STEP 8: Add Analytics to package.json
# ============================================
log_info "STEP 8: Adding sitemap generation to package.json..."

# Check if sitemap script exists
if ! grep -q "sitemap:generate" package.json; then
  log_info "Adding sitemap generation script..."
  # This would need to be done manually or with a JSON parser
  log_warning "Manually add to package.json scripts:"
  echo '  "sitemap:generate": "node scripts/generate-sitemap-dynamic.js"'
fi

# ============================================
# STEP 9: Create .env.example with Analytics
# ============================================
log_info "STEP 9: Updating .env.example with analytics..."

if ! grep -q "VITE_GA_MEASUREMENT_ID" .env.example; then
  cat >> .env.example << 'EOF'

# ============================================
# ANALYTICS & SEO
# ============================================
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
VITE_FACEBOOK_PIXEL_ID=
VITE_HOTJAR_ID=
EOF
  log_success "Added analytics variables to .env.example"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE! 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_success "Created Files:"
echo "  ✅ public/robots.txt"
echo "  ✅ scripts/generate-sitemap-dynamic.js"
echo "  ✅ src/components/SEO.jsx"
echo "  ✅ src/components/GoogleAnalytics.jsx"
echo "  ✅ src/routes-config.json"
echo "  ✅ index.html (updated)"
echo "  ✅ public/.well-known/security.txt"
echo ""

log_info "Next Steps:"
echo "  1. Generate sitemaps: node scripts/generate-sitemap-dynamic.js"
echo "  2. Add Google Analytics ID to .env:"
echo "     VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
echo "  3. Import SEO component in pages:"
echo "     import SEO from '../components/SEO';"
echo "  4. Import GoogleAnalytics in App.jsx"
echo "  5. Submit sitemap to Google Search Console:"
echo "     https://search.google.com/search-console"
echo "  6. Test robots.txt:"
echo "     https://lms.elevateforhumanity.org/robots.txt"
echo ""

log_success "SEO, Analytics, Sitemaps, Routes, and Crawls are now configured!"
