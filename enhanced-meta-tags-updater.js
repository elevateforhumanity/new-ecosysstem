/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/


const fs = require('fs');

// Enhanced Meta Tags for All Pages
const siteConfig = {
    domain: 'https://www.elevateforhumanity.org',
    siteName: 'Elevate for Humanity',
    defaultImage: '/branding/icons/workforce-icons.png',
    googleVerification: process.env.GOOGLE_VERIFICATION_CODE || 'EFH-workforce-development-2025',
    bingVerification: process.env.BING_VERIFICATION_CODE || 'YOUR_BING_VERIFICATION_CODE',
    gaId: process.env.GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID'
};

const pageConfigs = {
    'index.html': {
        title: 'Elevate for Humanity | Indiana Workforce Training That Pays for Itself',
        description: 'Transform your career with federally-funded workforce training in Indiana. Get paid while you learn with WEX, OJT, WRG/ETPL, JRI programs and registered apprenticeships. 89% job placement rate with full employer support.',
        keywords: 'Indiana workforce training, WEX programs, OJT training, WRG ETPL, JRI programs, registered apprenticeships, federal funding, paid training, career development, job placement, employer partnerships, workforce development',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Elevate for Humanity",
            "description": "Federally-funded Indiana workforce training programs with 89% job placement rate"
        }
    },
    'programs.html': {
        title: 'Training Programs & Certifications | Elevate for Humanity',
        description: 'Explore federally-funded training programs including WEX, OJT, WRG/ETPL, JRI and registered apprenticeships. High-demand skills training with guaranteed job placement support.',
        keywords: 'training programs, workforce certifications, WEX programs, OJT training, apprenticeships, skills training, federal funding, career programs',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Workforce Development Training Programs"
        }
    },
    'hub.html': {
        title: 'Workforce Development Hub | Federal Training Resources',
        description: 'Access comprehensive workforce development resources, federal funding information, and career advancement tools. Connect with employers and training partners across Indiana.',
        keywords: 'workforce development, federal training programs, career resources, employer partnerships, job training hub, workforce funding',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Workforce Development Hub"
        }
    },
    'public/employers.html': {
        title: 'Employer Solutions | Reduce Training Costs with Federal Funding',
        description: 'Cut training and wage costs with federal workforce programs. WEX covers 100% wages, OJT provides 50-75% reimbursement. Partner with Elevate for Humanity today.',
        keywords: 'employer solutions, training cost reduction, WEX employer benefits, OJT reimbursement, federal workforce funding, talent acquisition',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Employer Workforce Solutions"
        }
    },
    'public/apply.html': {
        title: 'Apply for Training Programs | Start Your Career Today',
        description: 'Apply for federally-funded training programs. Check eligibility, submit applications, and start your career transformation with guaranteed job placement support.',
        keywords: 'apply training programs, workforce application, federal funding application, career training enrollment, job placement program',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Training Program Application"
        }
    }
};

function generateMetaTags(config, pageConfig) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${pageConfig.title}</title>
    <meta name="title" content="${pageConfig.title}">
    <meta name="description" content="${pageConfig.description}">
    <meta name="keywords" content="${pageConfig.keywords}">
    <meta name="author" content="${config.siteName}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta name="googlebot" content="index, follow">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${config.domain}${pageConfig.canonical || ''}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${config.domain}">
    <meta property="og:title" content="${pageConfig.title}">
    <meta property="og:description" content="${pageConfig.description}">
    <meta property="og:image" content="${config.domain}${config.defaultImage}">
    <meta property="og:site_name" content="${config.siteName}">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${config.domain}">
    <meta property="twitter:title" content="${pageConfig.title}">
    <meta property="twitter:description" content="${pageConfig.description}">
    <meta property="twitter:image" content="${config.domain}${config.defaultImage}">
    
    <!-- Verification Tags -->
    <meta name="google-site-verification" content="${config.googleVerification}">
    <meta name="msvalidate.01" content="${config.bingVerification}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/images/Elevate_for_Humanity_logo_81bf0fab.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/Elevate_for_Humanity_logo_81bf0fab.png">
    
    <!-- Security Headers -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${config.gaId}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.gaId}', {
            page_title: '${pageConfig.title}',
            page_location: window.location.href
        });
    </script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(pageConfig.structuredData, null, 2)}
    </script>
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://www.googletagmanager.com">
    
    <script src="https://cdn.tailwindcss.com"></script>`;
}

// Update meta tags for all configured pages
Object.entries(pageConfigs).forEach(([filename, pageConfig]) => {
    try {
        let content = fs.readFileSync(filename, 'utf8');
        
        // Find the closing </head> tag and insert before it
        const headCloseIndex = content.indexOf('</head>');
        if (headCloseIndex !== -1) {
            // Extract existing body content
            const bodyStart = content.indexOf('<body');
            const bodyContent = content.substring(bodyStart);
            
            // Generate new head with enhanced meta tags
            const newHead = generateMetaTags(siteConfig, pageConfig);
            const newContent = newHead + '\n</head>\n' + bodyContent;
            
            fs.writeFileSync(filename, newContent);
            console.log(`✅ Enhanced meta tags added to ${filename}`);
        }
    } catch (error) {
        console.log(`❌ Error updating ${filename}: ${error.message}`);
    }
});

console.log('\n🎉 Meta tags update complete!');
console.log('\n📋 Next Steps:');
console.log('1. Replace GA_MEASUREMENT_ID with your Google Analytics ID');
console.log('2. Replace YOUR_BING_VERIFICATION_CODE with Bing verification code');
console.log('3. Submit updated sitemap to Google Search Console');
console.log('4. Verify meta tags with Google Rich Results Test');
