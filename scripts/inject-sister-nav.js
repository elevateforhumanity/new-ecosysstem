// scripts/inject-sister-nav.js
// Inject sister site navigation into homepage and other pages

import fs from "fs";
import path from "path";
import { glob } from "glob";

const config = {
  outputDir: "dist",
  metadataFile: "dist/sister-sites-metadata.json"
};

/**
 * Load sister sites metadata
 */
function loadSisterSitesMetadata() {
  if (!fs.existsSync(config.metadataFile)) {
    console.log("⚠️ Sister sites metadata not found, run build-sister-landing-pages.js first");
    return [];
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(config.metadataFile, "utf-8"));
    console.log(`📊 Loaded ${data.length} sister sites for navigation`);
    return data;
  } catch (error) {
    console.error("❌ Failed to parse sister sites metadata:", error.message);
    return [];
  }
}

/**
 * Generate navigation HTML for sister sites
 */
function generateSisterNavigation(sisterSites) {
  if (sisterSites.length === 0) {
    return "<!-- No sister sites available -->";
  }
  
  const navItems = sisterSites.map(site => 
    `        <li><a href="${site.path}" title="Visit ${site.name}">${site.name}</a></li>`
  ).join("\n");
  
  return `      <li class="dropdown">
        <a href="/sisters/" class="dropdown-toggle">Sister Organizations</a>
        <ul class="dropdown-menu">
${navItems}
          <li class="divider"></li>
          <li><a href="/sisters/">View All Sister Sites</a></li>
        </ul>
      </li>`;
}

/**
 * Generate mobile-friendly navigation
 */
function generateMobileSisterNav(sisterSites) {
  if (sisterSites.length === 0) {
    return "<!-- No sister sites available -->";
  }
  
  const navItems = sisterSites.map(site => 
    `    <li><a href="${site.path}">${site.name}</a></li>`
  ).join("\n");
  
  return `  <li class="has-submenu">
    <a href="/sisters/">Sister Organizations</a>
    <ul class="submenu">
${navItems}
    </ul>
  </li>`;
}

/**
 * Generate footer links for sister sites
 */
function generateSisterFooterLinks(sisterSites) {
  if (sisterSites.length === 0) {
    return "<!-- No sister sites available -->";
  }
  
  const footerLinks = sisterSites.slice(0, 5).map(site => 
    `      <li><a href="${site.path}">${site.name}</a></li>`
  ).join("\n");
  
  return `    <div class="footer-section">
      <h4>Sister Organizations</h4>
      <ul>
${footerLinks}
        ${sisterSites.length > 5 ? '        <li><a href="/sisters/">View All</a></li>' : ''}
      </ul>
    </div>`;
}

/**
 * Inject navigation into HTML file
 */
function injectNavigationIntoFile(filePath, sisterSites) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  let html = fs.readFileSync(filePath, "utf-8");
  let injections = 0;
  
  // Main navigation injection
  if (html.includes("<!--SISTER_NAV-->")) {
    const navHtml = generateSisterNavigation(sisterSites);
    html = html.replace(/<!--SISTER_NAV-->/g, navHtml);
    injections++;
    console.log(`✅ Injected main navigation into ${path.basename(filePath)}`);
  }
  
  // Mobile navigation injection
  if (html.includes("<!--SISTER_MOBILE_NAV-->")) {
    const mobileNavHtml = generateMobileSisterNav(sisterSites);
    html = html.replace(/<!--SISTER_MOBILE_NAV-->/g, mobileNavHtml);
    injections++;
    console.log(`✅ Injected mobile navigation into ${path.basename(filePath)}`);
  }
  
  // Footer links injection
  if (html.includes("<!--SISTER_FOOTER-->")) {
    const footerHtml = generateSisterFooterLinks(sisterSites);
    html = html.replace(/<!--SISTER_FOOTER-->/g, footerHtml);
    injections++;
    console.log(`✅ Injected footer links into ${path.basename(filePath)}`);
  }
  
  // Generic sister sites placeholder
  if (html.includes("<!--SISTER_SITES-->")) {
    const genericHtml = generateSisterSitesBlock(sisterSites);
    html = html.replace(/<!--SISTER_SITES-->/g, genericHtml);
    injections++;
    console.log(`✅ Injected sister sites block into ${path.basename(filePath)}`);
  }
  
  if (injections > 0) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  
  return false;
}

/**
 * Generate generic sister sites block
 */
function generateSisterSitesBlock(sisterSites) {
  if (sisterSites.length === 0) {
    return "<!-- No sister sites available -->";
  }
  
  const siteCards = sisterSites.map(site => `
    <div class="sister-site-card">
      <h3><a href="${site.path}">${site.name}</a></h3>
      <p>Learn more about ${site.name} and their mission.</p>
      <a href="${site.path}" class="btn btn-outline">Visit Site</a>
    </div>
  `).join("");
  
  return `
  <section class="sister-sites-section">
    <div class="container">
      <h2>Our Sister Organizations</h2>
      <p>Explore our network of partner organizations working together to advance workforce development.</p>
      <div class="sister-sites-grid">
        ${siteCards}
      </div>
      <div class="text-center">
        <a href="/sisters/" class="btn btn-primary">View All Sister Sites</a>
      </div>
    </div>
  </section>
  
  <style>
    .sister-sites-section {
      padding: 4rem 0;
      background: #f8f9fa;
    }
    
    .sister-sites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .sister-site-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .sister-site-card h3 {
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    
    .sister-site-card h3 a {
      text-decoration: none;
      color: inherit;
    }
    
    .sister-site-card h3 a:hover {
      color: #667eea;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-outline {
      border: 2px solid #667eea;
      color: #667eea;
      background: transparent;
    }
    
    .btn:hover {
      transform: translateY(-2px);
    }
    
    .text-center {
      text-align: center;
      margin-top: 2rem;
    }
  </style>
  `;
}

/**
 * Inject sister site navigation into all relevant files
 */
export async function injectSisterNavigation() {
  console.log("🔗 Injecting sister site navigation...");
  
  try {
    // Load sister sites metadata
    const sisterSites = loadSisterSitesMetadata();
    
    if (sisterSites.length === 0) {
      console.log("ℹ️ No sister sites found, skipping navigation injection");
      return { success: true, injections: 0 };
    }
    
    // Find HTML files to inject navigation into
    const htmlFiles = await glob(`${config.outputDir}/**/*.html`);
    let totalInjections = 0;
    
    for (const filePath of htmlFiles) {
      // Skip sister site pages themselves
      if (filePath.includes("/sisters/")) {
        continue;
      }
      
      const injected = injectNavigationIntoFile(filePath, sisterSites);
      if (injected) {
        totalInjections++;
      }
    }
    
    console.log(`🎉 Sister site navigation injection complete: ${totalInjections} files updated`);
    
    return {
      success: true,
      injections: totalInjections,
      sisterSites: sisterSites.length
    };
    
  } catch (error) {
    console.error("💥 Sister site navigation injection failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate CSS for dropdown navigation
 */
export function generateNavigationCSS() {
  return `
/* Sister Sites Navigation Styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  cursor: pointer;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: inherit;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 5px;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu li {
  border-bottom: 1px solid #eee;
}

.dropdown-menu li:last-child {
  border-bottom: none;
}

.dropdown-menu li.divider {
  border-bottom: 2px solid #ddd;
  margin: 0.5rem 0;
}

.dropdown-menu a {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s ease;
}

.dropdown-menu a:hover {
  background-color: #f8f9fa;
  color: #667eea;
}

/* Mobile Navigation */
@media (max-width: 768px) {
  .dropdown-menu {
    position: static;
    display: block;
    box-shadow: none;
    background: transparent;
  }
  
  .has-submenu .submenu {
    display: none;
    padding-left: 1rem;
  }
  
  .has-submenu.active .submenu {
    display: block;
  }
}
`;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case "css":
      console.log(generateNavigationCSS());
      break;
    case "inject":
    default:
      await injectSisterNavigation();
      break;
  }
}