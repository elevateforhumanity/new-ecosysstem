// scripts/seo-engine.js
// Complete SEO automation: sitemaps, meta tags, verification, analytics

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const config = {
  domain: process.env.DOMAIN || 'elevate4humanity.org',
  ga4Id: process.env.GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  googleVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
  bingVerification: process.env.BING_SITE_VERIFICATION || '',
  outputDir: 'dist',
  baseUrl: `https://${process.env.DOMAIN || 'elevate4humanity.org'}`
};

/**
 * Generate comprehensive sitemap from Supabase data
 */
export async function generateSitemap() {
  console.log("🗺️ Generating sitemap from Supabase...");
  
  try {
    // Fetch published programs
    const { data: programs, error } = await supabase
      .from('programs')
      .select('slug, title, summary, updated_at, created_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: 'about', priority: '0.8', changefreq: 'monthly' },
      { url: 'contact', priority: '0.7', changefreq: 'monthly' },
      { url: 'programs', priority: '0.9', changefreq: 'daily' },
      { url: 'apply', priority: '0.8', changefreq: 'weekly' }
    ];
    
    // Generate XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
    
    // Add static pages
    for (const page of staticPages) {
      const url = page.url ? `${config.baseUrl}/${page.url}` : config.baseUrl;
      sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }
    
    // Add program pages
    for (const program of programs || []) {
      const lastmod = new Date(program.updated_at || program.created_at).toISOString();
      sitemap += `  <url>
    <loc>${config.baseUrl}/programs/${program.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
    
    sitemap += '</urlset>';
    
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Write sitemap
    const sitemapPath = path.join(config.outputDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    
    console.log(`✅ Sitemap generated: ${sitemapPath}`);
    console.log(`📊 Pages included: ${staticPages.length} static + ${programs?.length || 0} programs`);
    
    return { success: true, pages: staticPages.length + (programs?.length || 0) };
    
  } catch (error) {
    console.error("❌ Sitemap generation failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate robots.txt with sitemap reference
 */
export function generateRobotsTxt() {
  console.log("🤖 Generating robots.txt...");
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${config.baseUrl}/sitemap.xml

# Block admin areas (if any)
Disallow: /admin/
Disallow: /_netlify/
Disallow: /api/

# Allow search engines to crawl all content
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Crawl delay for respectful crawling
Crawl-delay: 1
`;
  
  const robotsPath = path.join(config.outputDir, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);
  
  console.log(`✅ Robots.txt generated: ${robotsPath}`);
  return { success: true };
}

/**
 * Generate verification files for search engines
 */
export function generateVerificationFiles() {
  console.log("🔍 Generating search engine verification files...");
  
  const files = [];
  
  // Google verification file
  if (config.googleVerification) {
    const googleFile = `google-site-verification: ${config.googleVerification}`;
    const googlePath = path.join(config.outputDir, `google${config.googleVerification}.html`);
    fs.writeFileSync(googlePath, googleFile);
    files.push(`google${config.googleVerification}.html`);
    console.log(`✅ Google verification file: ${googlePath}`);
  }
  
  // Bing verification file
  if (config.bingVerification) {
    const bingXml = `<?xml version="1.0"?>
<users>
  <user>${config.bingVerification}</user>
</users>`;
    const bingPath = path.join(config.outputDir, 'BingSiteAuth.xml');
    fs.writeFileSync(bingPath, bingXml);
    files.push('BingSiteAuth.xml');
    console.log(`✅ Bing verification file: ${bingPath}`);
  }
  
  return { success: true, files };
}

/**
 * Generate meta tags for each program page
 */
export async function generateProgramMeta() {
  console.log("📝 Generating meta tags for program pages...");
  
  try {
    const { data: programs, error } = await supabase
      .from('programs')
      .select('slug, title, summary, hero_image_url')
      .eq('published', true);
    
    if (error) throw error;
    
    const metaDir = path.join(config.outputDir, 'meta');
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true });
    }
    
    for (const program of programs || []) {
      const meta = generateMetaTags({
        title: `${program.title} | Elevate for Humanity`,
        description: program.summary || `Professional training program: ${program.title}`,
        url: `${config.baseUrl}/programs/${program.slug}`,
        image: program.hero_image_url || `${config.baseUrl}/images/default-program.jpg`,
        keywords: [
          'workforce training',
          'WIOA approved',
          'career development',
          'professional certification',
          program.title.toLowerCase(),
          'Elevate for Humanity',
          'job training',
          'apprenticeship',
          'skills development'
        ].join(', ')
      });
      
      const metaPath = path.join(metaDir, `${program.slug}.html`);
      fs.writeFileSync(metaPath, meta);
    }
    
    console.log(`✅ Meta tags generated for ${programs?.length || 0} programs`);
    return { success: true, count: programs?.length || 0 };
    
  } catch (error) {
    console.error("❌ Meta generation failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate comprehensive meta tags
 */
function generateMetaTags({ title, description, url, image, keywords }) {
  return `<!-- SEO Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="Elevate for Humanity">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:site_name" content="Elevate for Humanity">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${image}">

<!-- Additional SEO -->
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
<link rel="canonical" href="${url}">

<!-- Verification -->
${config.googleVerification ? `<meta name="google-site-verification" content="${config.googleVerification}">` : ''}
${config.bingVerification ? `<meta name="msvalidate.01" content="${config.bingVerification}">` : ''}
`;
}

/**
 * Inject Google Analytics 4
 */
export function injectGA4() {
  console.log("📊 Injecting Google Analytics 4...");
  
  if (!config.ga4Id || config.ga4Id === 'G-XXXXXXXXXX') {
    console.log("⚠️ GA4 Measurement ID not configured, skipping");
    return { success: false, reason: 'No GA4 ID configured' };
  }
  
  const ga4Script = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.ga4Id}', {
    page_title: document.title,
    page_location: window.location.href
  });
</script>`;
  
  // Try to inject into index.html if it exists
  const indexPath = path.join(config.outputDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    if (!html.includes('gtag.js')) {
      html = html.replace('</head>', `${ga4Script}\n</head>`);
      fs.writeFileSync(indexPath, html);
      console.log("✅ GA4 injected into index.html");
    } else {
      console.log("✅ GA4 already present in index.html");
    }
  }
  
  // Also create standalone GA4 snippet for dynamic injection
  const ga4Path = path.join(config.outputDir, 'ga4-snippet.html');
  fs.writeFileSync(ga4Path, ga4Script);
  
  return { success: true };
}

/**
 * Ping search engines with updated sitemap
 */
export async function pingSearchEngines() {
  console.log("📡 Pinging search engines...");
  
  const sitemapUrl = `${config.baseUrl}/sitemap.xml`;
  const results = {};
  
  // Google
  try {
    const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    await fetch(googleUrl);
    results.google = 'success';
    console.log("✅ Google pinged successfully");
  } catch (error) {
    results.google = 'failed';
    console.log("⚠️ Google ping failed:", error.message);
  }
  
  // Bing
  try {
    const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    await fetch(bingUrl);
    results.bing = 'success';
    console.log("✅ Bing pinged successfully");
  } catch (error) {
    results.bing = 'failed';
    console.log("⚠️ Bing ping failed:", error.message);
  }
  
  return results;
}

/**
 * Generate structured data (JSON-LD) for programs
 */
export async function generateStructuredData() {
  console.log("🏗️ Generating structured data...");
  
  try {
    const { data: programs, error } = await supabase
      .from('programs')
      .select('slug, title, summary, cta_url, hero_image_url')
      .eq('published', true);
    
    if (error) throw error;
    
    const structuredDataDir = path.join(config.outputDir, 'structured-data');
    if (!fs.existsSync(structuredDataDir)) {
      fs.mkdirSync(structuredDataDir, { recursive: true });
    }
    
    for (const program of programs || []) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": program.title,
        "description": program.summary,
        "url": `${config.baseUrl}/programs/${program.slug}`,
        "image": program.hero_image_url,
        "provider": {
          "@type": "Organization",
          "name": "Elevate for Humanity",
          "url": config.baseUrl
        },
        "courseMode": "blended",
        "educationalCredentialAwarded": "Professional Certificate",
        "audience": {
          "@type": "EducationalAudience",
          "educationalRole": "student"
        }
      };
      
      const jsonPath = path.join(structuredDataDir, `${program.slug}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(structuredData, null, 2));
    }
    
    console.log(`✅ Structured data generated for ${programs?.length || 0} programs`);
    return { success: true, count: programs?.length || 0 };
    
  } catch (error) {
    console.error("❌ Structured data generation failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run complete SEO engine
 */
export async function runSEOEngine() {
  console.log("🚀 Starting complete SEO engine...");
  
  const results = {
    timestamp: new Date().toISOString(),
    domain: config.domain,
    baseUrl: config.baseUrl
  };
  
  // Run all SEO tasks
  results.sitemap = await generateSitemap();
  results.robots = generateRobotsTxt();
  results.verification = generateVerificationFiles();
  results.meta = await generateProgramMeta();
  results.ga4 = injectGA4();
  results.structuredData = await generateStructuredData();
  results.searchEnginePing = await pingSearchEngines();
  
  // Summary
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length - 3; // Exclude metadata fields
  
  console.log(`\n📊 SEO Engine Summary: ${successful}/${total} tasks successful`);
  
  return results;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'sitemap':
      await generateSitemap();
      break;
    case 'robots':
      generateRobotsTxt();
      break;
    case 'verification':
      generateVerificationFiles();
      break;
    case 'meta':
      await generateProgramMeta();
      break;
    case 'ga4':
      injectGA4();
      break;
    case 'structured-data':
      await generateStructuredData();
      break;
    case 'ping':
      await pingSearchEngines();
      break;
    case 'all':
      await runSEOEngine();
      break;
    default:
      console.log("Usage: node seo-engine.js [sitemap|robots|verification|meta|ga4|structured-data|ping|all]");
  }
}