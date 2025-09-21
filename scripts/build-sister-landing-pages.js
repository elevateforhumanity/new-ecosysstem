// scripts/build-sister-landing-pages.js
// Generate landing pages for sister sites from Supabase data

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const config = {
  domain: process.env.DOMAIN || "elevate4humanity.org",
  outputDir: "dist",
  sistersDir: "sisters",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

/**
 * Fetch sister sites from Supabase
 */
async function fetchSisterSites() {
  console.log("📊 Fetching sister sites from Supabase...");
  
  try {
    const { data, error } = await supabase
      .from("sister_sites")
      .select("*")
      .eq("published", true)
      .order("name");
    
    if (error) {
      console.log("⚠️ Sister sites table not found or error:", error.message);
      return [];
    }
    
    console.log(`✅ Found ${data?.length || 0} published sister sites`);
    return data || [];
    
  } catch (error) {
    console.error("❌ Failed to fetch sister sites:", error.message);
    return [];
  }
}

/**
 * Generate slug from site name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate landing page HTML for a sister site
 */
function generateLandingPageHTML(site) {
  const slug = site.slug || generateSlug(site.name);
  const baseUrl = `https://${config.domain}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.name} | Elevate for Humanity Sister Site</title>
  <meta name="description" content="${site.blurb || `Learn more about ${site.name}, a sister organization of Elevate for Humanity.`}">
  <meta name="keywords" content="Elevate for Humanity, ${site.name}, workforce development, training, sister organization">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${site.name} | Elevate for Humanity">
  <meta property="og:description" content="${site.blurb || `Learn more about ${site.name}`}">
  <meta property="og:url" content="${baseUrl}/sisters/${slug}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Elevate for Humanity">
  ${site.logo_url ? `<meta property="og:image" content="${site.logo_url}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${site.name} | Elevate for Humanity">
  <meta name="twitter:description" content="${site.blurb || `Learn more about ${site.name}`}">
  ${site.logo_url ? `<meta name="twitter:image" content="${site.logo_url}">` : ''}
  
  <!-- Canonical -->
  <link rel="canonical" href="${baseUrl}/sisters/${slug}/">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico">
  
  <!-- Styles -->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 2rem;
      border: 4px solid #667eea;
    }
    
    .logo-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    
    .subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    
    .description {
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
      color: #555;
      line-height: 1.8;
    }
    
    .buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      display: inline-block;
      padding: 1rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    
    .btn-secondary {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }
    
    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }
    
    .back-link {
      position: absolute;
      top: 2rem;
      left: 2rem;
      color: white;
      text-decoration: none;
      font-weight: 500;
      opacity: 0.9;
    }
    
    .back-link:hover {
      opacity: 1;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .card {
        padding: 2rem;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 300px;
      }
    }
  </style>
</head>
<body>
  <a href="/" class="back-link">← Back to Elevate for Humanity</a>
  
  <div class="container">
    <div class="card">
      ${site.logo_url ? 
        `<img src="${site.logo_url}" alt="${site.name} Logo" class="logo">` :
        `<div class="logo-placeholder">${site.name.charAt(0)}</div>`
      }
      
      <h1>${site.name}</h1>
      <p class="subtitle">Sister Organization of Elevate for Humanity</p>
      
      ${site.blurb ? `<p class="description">${site.blurb}</p>` : ''}
      
      <div class="buttons">
        ${site.url ? `<a href="${site.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit ${site.name}</a>` : ''}
        <a href="/" class="btn btn-secondary">Back to Elevate for Humanity</a>
      </div>
    </div>
  </div>
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "${site.name}",
    "description": "${site.blurb || `Sister organization of Elevate for Humanity`}",
    "url": "${site.url || `${baseUrl}/sisters/${slug}/`}",
    ${site.logo_url ? `"logo": "${site.logo_url}",` : ''}
    "parentOrganization": {
      "@type": "Organization",
      "name": "Elevate for Humanity",
      "url": "${baseUrl}"
    }
  }
  </script>
</body>
</html>`;
}

/**
 * Build all sister site landing pages
 */
export async function buildSisterLandingPages() {
  console.log("🏗️ Building sister site landing pages...");
  
  try {
    // Fetch sister sites
    const sisterSites = await fetchSisterSites();
    
    if (sisterSites.length === 0) {
      console.log("ℹ️ No sister sites found, skipping landing page generation");
      return { success: true, pages: 0 };
    }
    
    // Create sisters directory
    const sistersPath = path.join(config.outputDir, config.sistersDir);
    if (!fs.existsSync(sistersPath)) {
      fs.mkdirSync(sistersPath, { recursive: true });
    }
    
    const generatedPages = [];
    
    // Generate landing page for each sister site
    for (const site of sisterSites) {
      const slug = site.slug || generateSlug(site.name);
      const sitePath = path.join(sistersPath, slug);
      
      // Create site directory
      if (!fs.existsSync(sitePath)) {
        fs.mkdirSync(sitePath, { recursive: true });
      }
      
      // Generate HTML
      const html = generateLandingPageHTML(site);
      const indexPath = path.join(sitePath, "index.html");
      
      fs.writeFileSync(indexPath, html);
      
      generatedPages.push({
        name: site.name,
        slug,
        url: `https://${config.domain}/sisters/${slug}/`,
        path: `/sisters/${slug}/`
      });
      
      console.log(`✅ Generated landing page: ${site.name} → /sisters/${slug}/`);
    }
    
    // Generate sister sites index page
    const indexHTML = generateSisterSitesIndex(generatedPages);
    const indexPath = path.join(sistersPath, "index.html");
    fs.writeFileSync(indexPath, indexHTML);
    
    console.log(`✅ Generated sister sites index: /sisters/`);
    
    // Save metadata for navigation injection
    const metadataPath = path.join(config.outputDir, "sister-sites-metadata.json");
    fs.writeFileSync(metadataPath, JSON.stringify(generatedPages, null, 2));
    
    console.log(`🎉 Sister site landing pages complete: ${generatedPages.length} pages`);
    
    return {
      success: true,
      pages: generatedPages.length,
      generatedPages
    };
    
  } catch (error) {
    console.error("💥 Sister site landing page generation failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate sister sites index page
 */
function generateSisterSitesIndex(pages) {
  const baseUrl = `https://${config.domain}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sister Organizations | Elevate for Humanity</title>
  <meta name="description" content="Explore our network of sister organizations working together to advance workforce development and community empowerment.">
  <link rel="canonical" href="${baseUrl}/sisters/">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8f9fa;
      margin: 0;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 3rem;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .card {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .card h2 {
      margin-bottom: 1rem;
      color: #667eea;
    }
    
    .card a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .card a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sister Organizations</h1>
    <div class="grid">
      ${pages.map(page => `
        <div class="card">
          <h2><a href="${page.path}">${page.name}</a></h2>
          <p>Learn more about ${page.name} and their mission.</p>
          <a href="${page.path}">Visit Page →</a>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await buildSisterLandingPages();
}