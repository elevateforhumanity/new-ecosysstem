// scripts/inject-all-pages-index.js
// Generate comprehensive "All Pages" index from collected URLs

import fs from "fs";
import path from "path";

const config = {
  outputDir: "dist",
  urlListFile: "dist/all-urls.txt",
  urlCollectionFile: "dist/url-collection.json",
  domain: process.env.DOMAIN || "elevate4humanity.org"
};

/**
 * Load URLs from collection files
 */
function loadUrls() {
  // Try to load detailed URL collection first
  if (fs.existsSync(config.urlCollectionFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(config.urlCollectionFile, "utf-8"));
      console.log(`📊 Loaded ${data.length} URLs from detailed collection`);
      return data;
    } catch (error) {
      console.log("⚠️ Failed to parse detailed URL collection, falling back to simple list");
    }
  }
  
  // Fallback to simple URL list
  if (fs.existsSync(config.urlListFile)) {
    const urls = fs.readFileSync(config.urlListFile, "utf-8")
      .split("\n")
      .filter(Boolean)
      .map(url => ({
        url,
        source: "unknown",
        priority: "0.5"
      }));
    
    console.log(`📊 Loaded ${urls.length} URLs from simple list`);
    return urls;
  }
  
  console.error("❌ No URL collection found. Run collect-urls.js first");
  return [];
}

/**
 * Group URLs by section/category
 */
function groupUrlsBySection(urls) {
  const groups = {};
  
  for (const urlObj of urls) {
    try {
      const url = typeof urlObj === 'string' ? urlObj : urlObj.url;
      const { pathname } = new URL(url);
      const segments = pathname.split("/").filter(Boolean);
      
      let section = "Home";
      if (segments.length > 0) {
        section = segments[0]
          .replace(/-/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase());
      }
      
      if (!groups[section]) {
        groups[section] = [];
      }
      
      groups[section].push({
        url,
        title: extractPageTitle(pathname),
        priority: urlObj.priority || "0.5",
        source: urlObj.source || "unknown"
      });
      
    } catch (error) {
      console.log(`⚠️ Invalid URL: ${urlObj.url || urlObj}`);
    }
  }
  
  // Sort groups by priority and name
  const sortedGroups = {};
  const sortedSectionNames = Object.keys(groups).sort((a, b) => {
    // Prioritize certain sections
    const priority = { "Home": 0, "Programs": 1, "Blog": 2, "About": 3 };
    const aPriority = priority[a] ?? 99;
    const bPriority = priority[b] ?? 99;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return a.localeCompare(b);
  });
  
  for (const section of sortedSectionNames) {
    // Sort pages within each section by priority then title
    groups[section].sort((a, b) => {
      const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });
    
    sortedGroups[section] = groups[section];
  }
  
  return sortedGroups;
}

/**
 * Extract page title from pathname
 */
function extractPageTitle(pathname) {
  if (pathname === "/" || pathname === "") {
    return "Homepage";
  }
  
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  return lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate All Pages index HTML
 */
function generateAllPagesIndexHTML(groups) {
  const totalPages = Object.values(groups).reduce((sum, pages) => sum + pages.length, 0);
  
  const sectionsHTML = Object.entries(groups).map(([sectionName, pages]) => {
    const pagesHTML = pages.map(page => {
      const displayUrl = page.url.replace(/^https?:\/\/[^\/]+/, "");
      const priorityClass = parseFloat(page.priority) >= 0.8 ? "high-priority" : 
                           parseFloat(page.priority) >= 0.6 ? "medium-priority" : "low-priority";
      
      return `        <li class="page-item ${priorityClass}">
          <a href="${displayUrl}" title="${page.title}">
            <span class="page-title">${page.title}</span>
            <span class="page-url">${displayUrl}</span>
          </a>
        </li>`;
    }).join("\n");
    
    return `      <details class="section-group">
        <summary class="section-header">
          <span class="section-name">${sectionName}</span>
          <span class="section-count">${pages.length} pages</span>
        </summary>
        <ul class="pages-list">
${pagesHTML}
        </ul>
      </details>`;
  }).join("\n");
  
  return `
<section class="all-pages-index">
  <div class="container">
    <div class="section-header-main">
      <h2>Complete Site Index</h2>
      <p class="section-description">
        Comprehensive directory of all ${totalPages} pages across our platform, organized by section for easy navigation.
      </p>
    </div>
    
    <div class="index-controls">
      <button class="btn btn-outline" onclick="toggleAllSections()">Expand All</button>
      <button class="btn btn-outline" onclick="collapseAllSections()">Collapse All</button>
      <input type="text" id="pageSearch" placeholder="Search pages..." class="search-input">
    </div>
    
    <div class="pages-accordion">
${sectionsHTML}
    </div>
    
    <div class="index-footer">
      <p class="stats">
        <strong>${totalPages}</strong> total pages across <strong>${Object.keys(groups).length}</strong> sections
      </p>
      <p class="last-updated">
        Last updated: ${new Date().toLocaleDateString()}
      </p>
    </div>
  </div>
</section>

<style>
  .all-pages-index {
    padding: 4rem 0;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }
  
  .all-pages-index .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .section-header-main {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .section-header-main h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .section-description {
    font-size: 1.1rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .index-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    font-size: 0.875rem;
  }
  
  .btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
  }
  
  .btn-outline:hover {
    background: #667eea;
    color: white;
  }
  
  .search-input {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    min-width: 200px;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .pages-accordion {
    display: grid;
    gap: 1rem;
  }
  
  .section-group {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  
  .section-group:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .section-group[open] {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    cursor: pointer;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #374151;
    transition: background-color 0.2s;
  }
  
  .section-header:hover {
    background: #f1f5f9;
  }
  
  .section-name {
    font-size: 1.1rem;
  }
  
  .section-count {
    font-size: 0.875rem;
    color: #6b7280;
    background: #e5e7eb;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
  }
  
  .pages-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .page-item {
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  
  .page-item:hover {
    background: #f8fafc;
  }
  
  .page-item a {
    display: block;
    padding: 0.75rem;
    text-decoration: none;
    color: inherit;
  }
  
  .page-title {
    display: block;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }
  
  .page-url {
    display: block;
    font-size: 0.875rem;
    color: #64748b;
    font-family: monospace;
  }
  
  .high-priority .page-title {
    color: #059669;
  }
  
  .medium-priority .page-title {
    color: #0891b2;
  }
  
  .low-priority .page-title {
    color: #6b7280;
  }
  
  .index-footer {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .stats {
    font-size: 1.1rem;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .last-updated {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  @media (max-width: 768px) {
    .all-pages-index .container {
      padding: 0 1rem;
    }
    
    .section-header-main h2 {
      font-size: 2rem;
    }
    
    .index-controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-input {
      min-width: auto;
    }
    
    .pages-list {
      grid-template-columns: 1fr;
    }
    
    .section-header {
      padding: 0.75rem 1rem;
    }
  }
</style>

<script>
  function toggleAllSections() {
    const details = document.querySelectorAll('.section-group');
    details.forEach(detail => detail.open = true);
  }
  
  function collapseAllSections() {
    const details = document.querySelectorAll('.section-group');
    details.forEach(detail => detail.open = false);
  }
  
  // Search functionality
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('pageSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const pageItems = document.querySelectorAll('.page-item');
        
        pageItems.forEach(item => {
          const title = item.querySelector('.page-title').textContent.toLowerCase();
          const url = item.querySelector('.page-url').textContent.toLowerCase();
          
          if (title.includes(searchTerm) || url.includes(searchTerm)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
        
        // Show/hide sections based on visible items
        const sections = document.querySelectorAll('.section-group');
        sections.forEach(section => {
          const visibleItems = section.querySelectorAll('.page-item[style="display: block"], .page-item:not([style])');
          const hasVisibleItems = Array.from(visibleItems).some(item => 
            item.style.display !== 'none'
          );
          
          if (searchTerm && hasVisibleItems) {
            section.open = true;
            section.style.display = 'block';
          } else if (searchTerm && !hasVisibleItems) {
            section.style.display = 'none';
          } else {
            section.style.display = 'block';
          }
        });
      });
    }
  });
</script>
`;
}

/**
 * Inject All Pages index into HTML files
 */
export async function injectAllPagesIndex() {
  console.log("📋 Injecting All Pages index...");
  
  try {
    // Load URLs
    const urls = loadUrls();
    if (urls.length === 0) {
      console.log("⚠️ No URLs found, skipping All Pages index injection");
      return { success: false, reason: "No URLs found" };
    }
    
    // Group URLs by section
    const groups = groupUrlsBySection(urls);
    
    // Generate HTML
    const indexHTML = generateAllPagesIndexHTML(groups);
    
    // Find HTML files to inject into
    const targetFiles = [
      path.join(config.outputDir, "index.html"),
      path.join(config.outputDir, "sitemap.html")
    ];
    
    let injections = 0;
    
    for (const filePath of targetFiles) {
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      let html = fs.readFileSync(filePath, "utf-8");
      
      if (html.includes("<!--ALL_PAGES_INDEX-->")) {
        html = html.replace(/<!--ALL_PAGES_INDEX-->/g, indexHTML);
        fs.writeFileSync(filePath, html);
        injections++;
        console.log(`✅ Injected All Pages index into ${path.basename(filePath)}`);
      }
    }
    
    if (injections === 0) {
      console.log("⚠️ No <!--ALL_PAGES_INDEX--> placeholders found");
      console.log("💡 Add <!--ALL_PAGES_INDEX--> to your HTML where you want the index");
    }
    
    const totalPages = Object.values(groups).reduce((sum, pages) => sum + pages.length, 0);
    
    console.log(`🎉 All Pages index injection complete: ${totalPages} pages in ${Object.keys(groups).length} sections`);
    
    return {
      success: true,
      injections,
      totalPages,
      sections: Object.keys(groups).length,
      groups
    };
    
  } catch (error) {
    console.error("💥 All Pages index injection failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await injectAllPagesIndex();
}