import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const DIST = "dist";

let allPages = new Set();
let sitemapPages = new Set();
let navLinkedPages = new Set();
let orphanedPages = [];

function scanAllPages() {
  console.log("📁 Scanning all generated pages...");
  
  function walk(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        walk(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const pagePath = relativePath.replace(/\\/g, '/');
        allPages.add(pagePath);
      }
    }
  }
  
  walk(DIST);
  console.log(`📊 Found ${allPages.size} total pages`);
}

function scanSitemapPages() {
  console.log("🗺️ Scanning sitemap for indexed pages...");
  
  const sitemapPaths = [
    path.join(DIST, 'sitemap.xml'),
    path.join(DIST, 'sitemap_index.xml')
  ];
  
  for (const sitemapPath of sitemapPaths) {
    if (fs.existsSync(sitemapPath)) {
      try {
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
        
        // Extract URLs from sitemap
        const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
        
        for (const match of urlMatches) {
          const url = match.replace(/<\/?loc>/g, '');
          const urlPath = new URL(url).pathname;
          
          // Convert URL path to file path
          let filePath = urlPath === '/' ? 'index.html' : urlPath.substring(1);
          if (!filePath.endsWith('.html') && !filePath.includes('.')) {
            filePath += '.html';
          }
          
          sitemapPages.add(filePath);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse ${sitemapPath}: ${error.message}`);
      }
    }
  }
  
  console.log(`📊 Found ${sitemapPages.size} pages in sitemap`);
}

function scanNavigationLinks() {
  console.log("🧭 Scanning navigation links...");
  
  const indexPath = path.join(DIST, 'index.html');
  const hubPath = path.join(DIST, 'hub.html');
  
  const pagesToScan = [indexPath, hubPath].filter(p => fs.existsSync(p));
  
  for (const pagePath of pagesToScan) {
    try {
      const html = fs.readFileSync(pagePath, 'utf-8');
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Find all internal links
      const links = document.querySelectorAll('a[href]');
      
      for (const link of links) {
        const href = link.getAttribute('href');
        
        // Skip external links, fragments, and special protocols
        if (!href || href.startsWith('http') || href.startsWith('#') || 
            href.startsWith('mailto:') || href.startsWith('tel:')) {
          continue;
        }
        
        // Convert href to file path
        let filePath = href.startsWith('/') ? href.substring(1) : href;
        if (filePath === '' || filePath === '/') {
          filePath = 'index.html';
        } else if (!filePath.endsWith('.html') && !filePath.includes('.')) {
          filePath += '.html';
        }
        
        navLinkedPages.add(filePath);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse navigation in ${pagePath}: ${error.message}`);
    }
  }
  
  console.log(`📊 Found ${navLinkedPages.size} pages linked in navigation`);
}

function findOrphanedPages() {
  console.log("🔍 Identifying orphaned pages...");
  
  for (const page of allPages) {
    const isInSitemap = sitemapPages.has(page);
    const isInNav = navLinkedPages.has(page);
    
    // Skip certain system files
    const systemFiles = ['404.html', 'robots.txt', 'sitemap.xml', 'sitemap_index.xml'];
    if (systemFiles.some(file => page.endsWith(file))) {
      continue;
    }
    
    if (!isInSitemap && !isInNav) {
      orphanedPages.push({
        path: page,
        inSitemap: isInSitemap,
        inNavigation: isInNav,
        fullPath: path.join(DIST, page)
      });
    }
  }
  
  console.log(`📊 Found ${orphanedPages.length} orphaned pages`);
}

function generateAllPagesIndex() {
  if (orphanedPages.length === 0) {
    console.log("✅ No orphaned pages found");
    return;
  }
  
  console.log("📝 Generating all pages index...");
  
  // Group pages by directory
  const pagesByDir = {};
  
  for (const page of allPages) {
    const dir = path.dirname(page.path || page);
    if (!pagesByDir[dir]) {
      pagesByDir[dir] = [];
    }
    pagesByDir[dir].push(page);
  }
  
  // Generate HTML for all pages index
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Pages - Elevate for Humanity</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .directory { margin-bottom: 30px; }
    .directory h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .page-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .page-item { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .page-item.orphaned { border-color: #f59e0b; background-color: #fffbeb; }
    .page-link { color: #2563eb; text-decoration: none; font-weight: 500; }
    .page-link:hover { text-decoration: underline; }
    .page-status { font-size: 12px; color: #6b7280; margin-top: 5px; }
    .orphaned-badge { background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
  </style>
</head>
<body>
  <h1>All Pages - Elevate for Humanity</h1>
  <p>Complete index of all pages on this site. Pages marked as "orphaned" are not linked in navigation or sitemap.</p>
  
  <div class="stats">
    <p><strong>Total Pages:</strong> ${allPages.size}</p>
    <p><strong>In Sitemap:</strong> ${sitemapPages.size}</p>
    <p><strong>In Navigation:</strong> ${navLinkedPages.size}</p>
    <p><strong>Orphaned:</strong> ${orphanedPages.length}</p>
  </div>
`;
  
  // Add pages by directory
  for (const [dir, pages] of Object.entries(pagesByDir)) {
    const dirName = dir === '.' ? 'Root' : dir;
    html += `
  <div class="directory">
    <h2>${dirName}</h2>
    <div class="page-list">`;
    
    for (const page of pages) {
      const pagePath = typeof page === 'string' ? page : page.path;
      const isOrphaned = orphanedPages.some(op => op.path === pagePath);
      const pageUrl = pagePath === 'index.html' ? '/' : `/${pagePath}`;
      const pageTitle = path.basename(pagePath, '.html').replace(/[-_]/g, ' ');
      
      html += `
      <div class="page-item ${isOrphaned ? 'orphaned' : ''}">
        <a href="${pageUrl}" class="page-link">${pageTitle}</a>
        <div class="page-status">
          ${isOrphaned ? '<span class="orphaned-badge">ORPHANED</span>' : ''}
          ${sitemapPages.has(pagePath) ? '📍 In Sitemap' : ''}
          ${navLinkedPages.has(pagePath) ? '🧭 In Navigation' : ''}
        </div>
      </div>`;
    }
    
    html += `
    </div>
  </div>`;
  }
  
  html += `
</body>
</html>`;
  
  // Write the all pages index
  fs.writeFileSync(path.join(DIST, 'all-pages.html'), html);
  console.log("✅ Created all-pages.html");
  
  // Update navigation to include all pages link
  updateNavigationWithAllPages();
}

function updateNavigationWithAllPages() {
  console.log("🧭 Adding all pages link to navigation...");
  
  const pagesToUpdate = [
    path.join(DIST, 'index.html'),
    path.join(DIST, 'hub.html')
  ].filter(p => fs.existsSync(p));
  
  for (const pagePath of pagesToUpdate) {
    try {
      let html = fs.readFileSync(pagePath, 'utf-8');
      
      // Add all pages link if not already present
      if (!html.includes('/all-pages.html') && !html.includes('All Pages')) {
        // Try to find navigation and add link
        const navPatterns = [
          /<nav[^>]*>(.*?)<\/nav>/s,
          /<ul[^>]*class="[^"]*nav[^"]*"[^>]*>(.*?)<\/ul>/s,
          /<div[^>]*class="[^"]*nav[^"]*"[^>]*>(.*?)<\/div>/s
        ];
        
        for (const pattern of navPatterns) {
          if (pattern.test(html)) {
            html = html.replace(pattern, (match) => {
              return match.replace(/<\/nav>|<\/ul>|<\/div>/, 
                `  <a href="/all-pages.html" class="nav-link">All Pages</a>\n$&`);
            });
            break;
          }
        }
        
        fs.writeFileSync(pagePath, html);
        console.log(`✅ Updated navigation in ${path.basename(pagePath)}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to update navigation in ${pagePath}: ${error.message}`);
    }
  }
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_pages: allPages.size,
      sitemap_pages: sitemapPages.size,
      navigation_pages: navLinkedPages.size,
      orphaned_pages: orphanedPages.length
    },
    orphaned_pages: orphanedPages,
    all_pages: Array.from(allPages),
    sitemap_pages: Array.from(sitemapPages),
    navigation_pages: Array.from(navLinkedPages)
  };
  
  fs.writeFileSync(path.join(DIST, 'orphaned-pages-report.json'), JSON.stringify(report, null, 2));
  console.log("📊 Generated orphaned pages report");
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("❌ dist/ directory not found");
    process.exit(1);
  }
  
  console.log("🔍 Detecting orphaned pages...");
  
  scanAllPages();
  scanSitemapPages();
  scanNavigationLinks();
  findOrphanedPages();
  generateAllPagesIndex();
  generateReport();
  
  if (orphanedPages.length > 0) {
    console.warn(`⚠️ Found ${orphanedPages.length} orphaned pages`);
    console.warn("These pages are not linked in navigation or sitemap:");
    orphanedPages.forEach(page => console.warn(`  - ${page.path}`));
    console.log("✅ Created all-pages.html to make them discoverable");
  } else {
    console.log("✅ No orphaned pages found");
  }
}

main().catch(error => {
  console.error(`💥 Orphaned page detection failed: ${error.message}`);
  process.exit(1);
});