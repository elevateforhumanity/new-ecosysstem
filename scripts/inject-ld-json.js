// scripts/inject-ld-json.js
// Inject JSON-LD structured data for better search engine understanding

import fs from "fs";
import path from "path";

const config = {
  domain: process.env.DOMAIN || "elevate4humanity.org",
  outputDir: "dist",
  organizationName: "Elevate for Humanity",
  organizationDescription: "Workforce development and training programs focused on WIOA-approved certifications and career advancement."
};

/**
 * Generate organization JSON-LD
 */
function generateOrganizationLD() {
  const baseUrl = `https://${config.domain}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.organizationName,
    "description": config.organizationDescription,
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
    "image": `${baseUrl}/images/og-image.jpg`,
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-ELEVATE",
      "contactType": "customer service",
      "email": "info@elevate4humanity.org"
    },
    "sameAs": [
      "https://www.facebook.com/elevateforhumanity",
      "https://www.linkedin.com/company/elevateforhumanity",
      "https://www.instagram.com/elevateforhumanity",
      "https://twitter.com/elevate4humanity"
    ],
    "keywords": [
      "workforce development",
      "WIOA training",
      "career advancement",
      "professional certification",
      "job training programs",
      "apprenticeships"
    ]
  };
}

/**
 * Generate website JSON-LD
 */
function generateWebsiteLD() {
  const baseUrl = `https://${config.domain}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.organizationName,
    "url": baseUrl,
    "description": config.organizationDescription,
    "publisher": {
      "@type": "Organization",
      "name": config.organizationName
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Training Programs",
      "description": "WIOA-approved workforce training programs",
      "url": `${baseUrl}/programs`
    }
  };
}

/**
 * Generate educational organization JSON-LD
 */
function generateEducationalOrganizationLD() {
  const baseUrl = `https://${config.domain}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": config.organizationName,
    "description": "Providing WIOA-approved workforce training and career development programs",
    "url": baseUrl,
    "educationalCredentialAwarded": [
      "Professional Certificates",
      "Industry Certifications",
      "WIOA Credentials"
    ],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "WIOA Approved Training Provider",
      "description": "Authorized to provide workforce training under the Workforce Innovation and Opportunity Act"
    },
    "offers": {
      "@type": "Course",
      "name": "Workforce Development Programs",
      "description": "Comprehensive training programs for career advancement",
      "provider": {
        "@type": "Organization",
        "name": config.organizationName
      }
    }
  };
}

/**
 * Generate breadcrumb JSON-LD for specific pages
 */
function generateBreadcrumbLD(breadcrumbs) {
  const baseUrl = `https://${config.domain}`;
  
  const itemListElements = breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
  }));
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElements
  };
}

/**
 * Inject JSON-LD into HTML file
 */
function injectJSONLD(filePath, jsonLdObjects) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return false;
  }
  
  let html = fs.readFileSync(filePath, "utf-8");
  
  // Check if JSON-LD already exists
  if (html.includes('application/ld+json')) {
    console.log(`✅ JSON-LD already present in ${path.basename(filePath)}`);
    return true;
  }
  
  // Generate script tags for each JSON-LD object
  const scriptTags = jsonLdObjects.map(obj => 
    `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`
  ).join('\n');
  
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${scriptTags}\n</head>`);
    fs.writeFileSync(filePath, html);
    console.log(`✅ JSON-LD injected into ${path.basename(filePath)} (${jsonLdObjects.length} objects)`);
    return true;
  } else {
    console.log(`⚠️ No </head> tag found in ${path.basename(filePath)}`);
    return false;
  }
}

/**
 * Inject JSON-LD into homepage
 */
export function injectHomepageJSONLD() {
  console.log("🏗️ Injecting homepage JSON-LD...");
  
  const indexPath = path.join(config.outputDir, "index.html");
  
  const jsonLdObjects = [
    generateOrganizationLD(),
    generateWebsiteLD(),
    generateEducationalOrganizationLD()
  ];
  
  const success = injectJSONLD(indexPath, jsonLdObjects);
  return { success, objects: jsonLdObjects.length };
}

/**
 * Inject JSON-LD into programs page
 */
export function injectProgramsJSONLD() {
  console.log("📚 Injecting programs page JSON-LD...");
  
  const programsPath = path.join(config.outputDir, "programs.html");
  if (!fs.existsSync(programsPath)) {
    console.log("⚠️ Programs page not found, skipping");
    return { success: false, reason: "Programs page not found" };
  }
  
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Programs", url: "/programs" }
  ];
  
  const jsonLdObjects = [
    generateBreadcrumbLD(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Training Programs",
      "description": "WIOA-approved workforce training and certification programs",
      "url": `https://${config.domain}/programs`,
      "mainEntity": {
        "@type": "ItemList",
        "name": "Available Programs",
        "description": "List of available training programs"
      }
    }
  ];
  
  const success = injectJSONLD(programsPath, jsonLdObjects);
  return { success, objects: jsonLdObjects.length };
}

/**
 * Inject JSON-LD into about page
 */
export function injectAboutJSONLD() {
  console.log("ℹ️ Injecting about page JSON-LD...");
  
  const aboutPath = path.join(config.outputDir, "about.html");
  if (!fs.existsSync(aboutPath)) {
    console.log("⚠️ About page not found, skipping");
    return { success: false, reason: "About page not found" };
  }
  
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" }
  ];
  
  const jsonLdObjects = [
    generateBreadcrumbLD(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": `About ${config.organizationName}`,
      "description": config.organizationDescription,
      "url": `https://${config.domain}/about`,
      "mainEntity": {
        "@type": "Organization",
        "name": config.organizationName
      }
    }
  ];
  
  const success = injectJSONLD(aboutPath, jsonLdObjects);
  return { success, objects: jsonLdObjects.length };
}

/**
 * Inject JSON-LD into all pages
 */
export async function injectAllJSONLD() {
  console.log("🏗️ Injecting JSON-LD into all pages...");
  
  const results = {};
  
  // Homepage
  results.homepage = injectHomepageJSONLD();
  
  // Programs page
  results.programs = injectProgramsJSONLD();
  
  // About page
  results.about = injectAboutJSONLD();
  
  // Summary
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`📊 JSON-LD injection: ${successful}/${total} pages processed`);
  
  return { success: successful > 0, results };
}

/**
 * Generate standalone JSON-LD files
 */
export function generateStandaloneJSONLD() {
  console.log("📄 Generating standalone JSON-LD files...");
  
  const jsonLdDir = path.join(config.outputDir, "structured-data");
  if (!fs.existsSync(jsonLdDir)) {
    fs.mkdirSync(jsonLdDir, { recursive: true });
  }
  
  const files = [
    { name: "organization.json", data: generateOrganizationLD() },
    { name: "website.json", data: generateWebsiteLD() },
    { name: "educational-organization.json", data: generateEducationalOrganizationLD() }
  ];
  
  files.forEach(file => {
    const filePath = path.join(jsonLdDir, file.name);
    fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
    console.log(`✅ Generated ${file.name}`);
  });
  
  return { success: true, files: files.length };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case "homepage":
      injectHomepageJSONLD();
      break;
    case "programs":
      injectProgramsJSONLD();
      break;
    case "about":
      injectAboutJSONLD();
      break;
    case "standalone":
      generateStandaloneJSONLD();
      break;
    case "all":
    default:
      await injectAllJSONLD();
      break;
  }
}