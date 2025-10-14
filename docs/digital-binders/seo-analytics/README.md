# SEO & Google Analytics Guide

## Overview

This guide provides comprehensive information about Search Engine Optimization (SEO) and Google Analytics implementation for all digital binder pages and website content.

---

## Table of Contents

1. [SEO Best Practices](#seo-best-practices)
2. [Meta Tags Implementation](#meta-tags-implementation)
3. [Google Analytics Setup](#google-analytics-setup)
4. [Page-Specific SEO](#page-specific-seo)
5. [Performance Monitoring](#performance-monitoring)
6. [Accessibility & SEO](#accessibility--seo)

---

## SEO Best Practices

### On-Page SEO

#### **Title Tags**
```html
<!-- Format: Primary Keyword | Secondary Keyword | Brand -->
<title>Clinical Informatics Training | Healthcare IT Certification | Elevate for Humanity</title>

<!-- Best Practices -->
- Length: 50-60 characters
- Include primary keyword
- Include brand name
- Unique for each page
- Compelling and descriptive
```

#### **Meta Descriptions**
```html
<meta name="description" content="Get FREE Clinical Informatics training with industry certifications. Earn while you learn through OJT programs. 82% job placement rate. Start your healthcare IT career today!">

<!-- Best Practices -->
- Length: 150-160 characters
- Include primary keyword
- Include call-to-action
- Unique for each page
- Compelling and informative
```

#### **Header Tags (H1-H6)**
```html
<!-- One H1 per page -->
<h1>Clinical Informatics Training Programs</h1>

<!-- H2 for main sections -->
<h2>Earn-to-Learn Programs</h2>

<!-- H3 for subsections -->
<h3>On-the-Job Training (OJT)</h3>

<!-- Best Practices -->
- One H1 per page with primary keyword
- Logical hierarchy (H1 > H2 > H3)
- Include keywords naturally
- Descriptive and clear
```

### Content Optimization

#### **Keyword Strategy**
**Primary Keywords:**
- Clinical Informatics training
- Healthcare IT certification
- Medical coding classes
- EHR training
- Health information technology
- Workforce development programs
- Free job training Indiana
- Earn while you learn

**Long-Tail Keywords:**
- Free clinical informatics training Indianapolis
- Get paid to learn healthcare IT
- RHIT certification program Indiana
- Epic EHR training near me
- On-the-job training healthcare
- Workforce Ready Grant programs

#### **Content Guidelines**
- **Keyword Density**: 1-2% (natural usage)
- **Content Length**: 1,000+ words for main pages
- **Readability**: 8th-grade reading level
- **Structure**: Short paragraphs, bullet points, headings
- **Internal Links**: 3-5 per page
- **External Links**: 2-3 authoritative sources

### Technical SEO

#### **URL Structure**
```
Good URLs:
✅ /programs/clinical-informatics
✅ /earn-to-learn/ojt-programs
✅ /financial-aid/workforce-ready-grant

Bad URLs:
❌ /page?id=123
❌ /programs/clinical_informatics_training_program_2025
❌ /p/ci
```

#### **Canonical Tags**
```html
<link rel="canonical" href="https://www.example.com/programs/clinical-informatics">
```

#### **Robots Meta Tag**
```html
<!-- Allow indexing (default) -->
<meta name="robots" content="index, follow">

<!-- Prevent indexing (for duplicate or private pages) -->
<meta name="robots" content="noindex, nofollow">
```

#### **XML Sitemap**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com/</loc>
    <lastmod>2025-10-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.example.com/programs/clinical-informatics</loc>
    <lastmod>2025-10-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Meta Tags Implementation

### Essential Meta Tags

#### **Complete Meta Tags Template**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Character Encoding -->
  <meta charset="UTF-8">
  
  <!-- Viewport for Mobile -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Title -->
  <title>Clinical Informatics Training | Healthcare IT Certification | Elevate for Humanity</title>
  
  <!-- Meta Description -->
  <meta name="description" content="Get FREE Clinical Informatics training with industry certifications. Earn while you learn through OJT programs. 82% job placement rate. Start your healthcare IT career today!">
  
  <!-- Keywords (less important but still useful) -->
  <meta name="keywords" content="clinical informatics, healthcare IT, medical coding, EHR training, RHIT certification, Epic training, free job training, Indiana workforce development">
  
  <!-- Author -->
  <meta name="author" content="Elevate for Humanity">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://www.example.com/programs/clinical-informatics">
  
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="Clinical Informatics Training | Healthcare IT Certification">
  <meta property="og:description" content="Get FREE Clinical Informatics training with industry certifications. Earn while you learn through OJT programs.">
  <meta property="og:image" content="https://www.example.com/images/clinical-informatics-og.jpg">
  <meta property="og:url" content="https://www.example.com/programs/clinical-informatics">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Elevate for Humanity">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Clinical Informatics Training | Healthcare IT Certification">
  <meta name="twitter:description" content="Get FREE Clinical Informatics training with industry certifications. Earn while you learn through OJT programs.">
  <meta name="twitter:image" content="https://www.example.com/images/clinical-informatics-twitter.jpg">
  <meta name="twitter:site" content="@ElevateForHumanity">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  
  <!-- Theme Color (for mobile browsers) -->
  <meta name="theme-color" content="#0066cc">
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

### Page-Specific Meta Tags

#### **Homepage**
```html
<title>Elevate for Humanity | Free Workforce Development & Job Training</title>
<meta name="description" content="Free job training programs in healthcare IT, clinical informatics, and more. Earn while you learn with OJT programs. 82% job placement rate. Start your career today!">
```

#### **Clinical Informatics Page**
```html
<title>Clinical Informatics Training | FREE Certification Programs</title>
<meta name="description" content="FREE Clinical Informatics training with RHIT, Epic, and Cerner certifications. Earn $18-22/hour while learning. 82% job placement. Apply today!">
```

#### **Earn-to-Learn Page**
```html
<title>Earn While You Learn | Paid OJT & Internship Programs</title>
<meta name="description" content="Get paid while you train! OJT programs starting at $18/hour. FREE certifications included. No student debt. 82% job placement. Start earning today!">
```

#### **VR Services Page**
```html
<title>Vocational Rehabilitation Services | VR-Funded Training Programs</title>
<meta name="description" content="VR-funded training programs for individuals with disabilities. Full accommodations and support. 85% job placement rate. Partner with Indiana VR today!">
```

---

## Google Analytics Setup

### Google Analytics 4 (GA4) Implementation

#### **Step 1: Create GA4 Property**
1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Admin" (gear icon)
3. Click "Create Property"
4. Enter property details
5. Click "Create"
6. Get Measurement ID (G-XXXXXXXXXX)

#### **Step 2: Install GA4 Tracking Code**
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,  // GDPR compliance
    'cookie_flags': 'SameSite=None;Secure'  // Cookie security
  });
</script>
```

#### **Step 3: Set Up Google Tag Manager (Recommended)**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Event Tracking

#### **Custom Events**
```javascript
// Application Started
gtag('event', 'application_started', {
  'program_name': 'Clinical Informatics',
  'application_type': 'online'
});

// Application Completed
gtag('event', 'application_completed', {
  'program_name': 'Clinical Informatics',
  'application_id': '12345'
});

// Download Brochure
gtag('event', 'download', {
  'file_name': 'clinical-informatics-brochure.pdf',
  'file_type': 'pdf'
});

// Contact Form Submission
gtag('event', 'form_submission', {
  'form_name': 'contact_form',
  'form_location': 'homepage'
});

// Chat Initiated
gtag('event', 'chat_initiated', {
  'page_location': window.location.pathname
});

// Video Play
gtag('event', 'video_play', {
  'video_title': 'Clinical Informatics Overview',
  'video_duration': '3:45'
});

// Outbound Link Click
gtag('event', 'click', {
  'event_category': 'outbound',
  'event_label': 'Indiana Connect',
  'transport_type': 'beacon'
});
```

### Conversion Tracking

#### **Goal Setup**
```javascript
// Application Submission (Conversion)
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXXXXXX/XXXXXXXXXXXXXX',
  'value': 1.0,
  'currency': 'USD',
  'transaction_id': ''
});

// Phone Call (Conversion)
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXXXXXX/XXXXXXXXXXXXXX',
  'value': 1.0,
  'currency': 'USD'
});

// Chat Conversion
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXXXXXX/XXXXXXXXXXXXXX',
  'value': 1.0,
  'currency': 'USD'
});
```

---

## Page-Specific SEO

### Homepage SEO

```html
<title>Elevate for Humanity | Free Workforce Development & Job Training Programs</title>
<meta name="description" content="Transform your career with FREE job training in healthcare IT, clinical informatics, and more. Earn while you learn. 82% job placement rate. Start today!">

<!-- Schema.org Markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Elevate for Humanity",
  "description": "Workforce development and job training programs",
  "url": "https://www.example.com",
  "logo": "https://www.example.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "Indianapolis",
    "addressRegion": "IN",
    "postalCode": "46204",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-XXX-XXXX",
    "contactType": "Admissions",
    "areaServed": "US",
    "availableLanguage": ["English", "Spanish"]
  },
  "sameAs": [
    "https://www.facebook.com/elevateforhumanity",
    "https://www.twitter.com/elevate4humanity",
    "https://www.linkedin.com/company/elevateforhumanity"
  ]
}
</script>
```

### Program Pages SEO

```html
<!-- Clinical Informatics Page -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Clinical Informatics Certificate Program",
  "description": "6-month certificate program in clinical informatics with industry certifications",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "Elevate for Humanity",
    "sameAs": "https://www.example.com"
  },
  "offers": {
    "@type": "Offer",
    "category": "Paid",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Blended",
    "duration": "P6M",
    "courseWorkload": "PT30H"
  },
  "educationalCredentialAwarded": "Certificate",
  "occupationalCredentialAwarded": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "Certificate",
    "recognizedBy": {
      "@type": "Organization",
      "name": "AHIMA"
    }
  }
}
</script>
```

---

## Performance Monitoring

### Key Metrics to Track

#### **Traffic Metrics**
- **Users**: Total unique visitors
- **Sessions**: Total visits
- **Pageviews**: Total pages viewed
- **Bounce Rate**: % of single-page sessions
- **Average Session Duration**: Time on site
- **Pages per Session**: Engagement level

#### **Acquisition Metrics**
- **Traffic Sources**: Organic, Direct, Referral, Social, Paid
- **Top Landing Pages**: Entry points
- **Top Exit Pages**: Where users leave
- **Conversion Rate**: % completing goals

#### **Behavior Metrics**
- **Most Viewed Pages**: Popular content
- **Site Search**: What users search for
- **Events**: Button clicks, downloads, video plays
- **Scroll Depth**: How far users scroll

#### **Conversion Metrics**
- **Applications Started**: Form initiations
- **Applications Completed**: Form submissions
- **Phone Calls**: Click-to-call events
- **Chat Conversations**: Chat initiations
- **Downloads**: Brochure/resource downloads

### Google Search Console

#### **Setup & Monitoring**
1. Verify site ownership
2. Submit XML sitemap
3. Monitor search performance
4. Fix crawl errors
5. Review mobile usability
6. Check Core Web Vitals

#### **Key Reports**
- **Performance**: Clicks, impressions, CTR, position
- **Coverage**: Indexed pages, errors, warnings
- **Enhancements**: Mobile usability, Core Web Vitals
- **Links**: Internal and external links

---

## Accessibility & SEO

### Accessible SEO Best Practices

#### **Alt Text for Images**
```html
<!-- Good Alt Text -->
<img src="clinical-informatics-training.jpg" 
     alt="Students learning clinical informatics in computer lab with instructor">

<!-- Bad Alt Text -->
<img src="image1.jpg" alt="image">
```

#### **Descriptive Link Text**
```html
<!-- Good Link Text -->
<a href="/programs/clinical-informatics">Learn more about our Clinical Informatics program</a>

<!-- Bad Link Text -->
<a href="/programs/clinical-informatics">Click here</a>
```

#### **Semantic HTML**
```html
<!-- Use semantic elements -->
<header>
  <nav aria-label="Main navigation">
    <!-- Navigation links -->
  </nav>
</header>

<main>
  <article>
    <h1>Page Title</h1>
    <!-- Content -->
  </article>
</main>

<footer>
  <!-- Footer content -->
</footer>
```

---

## Document Control

- **Version**: 1.0
- **Last Updated**: October 10, 2025
- **Next Review**: January 10, 2026
- **Owner**: Marketing & Technology Department
- **Classification**: Internal Use

---

*Optimizing for search engines and user experience to reach more people who need our services.*
