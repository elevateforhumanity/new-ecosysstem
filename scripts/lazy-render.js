import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Pages that should always be built (critical pages)
const CRITICAL_PAGES = [
  'index.html',
  'hub.html',
  'programs.html',
  'about.html',
  'contact.html',
  'connect.html',
  '404.html',
  'sitemap.xml',
  'robots.txt'
];

// Maximum number of pages to build in one run (to prevent resource exhaustion)
const MAX_PAGES_PER_BUILD = 1000;

let builtPages = [];
let skippedPages = [];
let errors = [];

async function getPageMetadata() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn("⚠️  Supabase credentials not available - using file system scan");
    return scanFileSystem();
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log("📊 Fetching page metadata from Supabase...");
    
    const { data: pages, error } = await supabase
      .from('pages')
      .select('slug, title, updated_at, page_type, priority')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.warn(`⚠️  Supabase query failed: ${error.message} - falling back to file system`);
      return scanFileSystem();
    }
    
    return pages || [];
  } catch (error) {
    console.warn(`⚠️  Supabase not available: ${error.message} - falling back to file system`);
    return scanFileSystem();
  }
}

function scanFileSystem() {
  console.log("📁 Scanning file system for pages...");
  const pages = [];
  
  function scan(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const stats = fs.statSync(fullPath);
        pages.push({
          slug: relativePath.replace('.html', ''),
          title: entry.name.replace('.html', ''),
          updated_at: stats.mtime.toISOString(),
          page_type: 'static',
          priority: CRITICAL_PAGES.includes(entry.name) ? 1 : 5,
          file_path: fullPath
        });
      }
    }
  }
  
  scan('dist');
  return pages;
}

function shouldBuildPage(page, lastDeployTime) {
  // Always build critical pages
  if (CRITICAL_PAGES.includes(path.basename(page.slug + '.html'))) {
    return { build: true, reason: 'critical page' };
  }
  
  // Build high priority pages
  if (page.priority && page.priority <= 2) {
    return { build: true, reason: 'high priority' };
  }
  
  // Build if updated since last deploy
  if (lastDeployTime && page.updated_at) {
    const pageTime = new Date(page.updated_at);
    const deployTime = new Date(lastDeployTime);
    if (pageTime > deployTime) {
      return { build: true, reason: 'updated since last deploy' };
    }
  }
  
  // Build if file doesn't exist
  const filePath = path.join('dist', page.slug + '.html');
  if (!fs.existsSync(filePath)) {
    return { build: true, reason: 'file missing' };
  }
  
  return { build: false, reason: 'not needed' };
}

function createLazyStub(page) {
  const stubContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title || 'Loading...'}</title>
  <meta name="description" content="Loading content...">
  <script>
    // Redirect to dynamic renderer
    window.location.href = '/api/page/' + encodeURIComponent('${page.slug}');
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/api/page/${encodeURIComponent(page.slug)}">
  </noscript>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>Loading...</h1>
    <p>If you are not redirected automatically, <a href="/api/page/${encodeURIComponent(page.slug)}">click here</a>.</p>
  </div>
</body>
</html>`;
  
  const filePath = path.join('dist', page.slug + '.html');
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, stubContent);
  return filePath;
}

function createNetlifyFunction() {
  const functionDir = 'netlify/functions';
  if (!fs.existsSync(functionDir)) {
    fs.mkdirSync(functionDir, { recursive: true });
  }
  
  const functionCode = `import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler(event) {
  const slug = event.path.replace("/api/page/", "").replace(/\\.html$/, "");
  
  try {
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !page) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "text/html" },
        body: \`<!DOCTYPE html>
<html><head><title>Page Not Found</title></head>
<body><h1>404 - Page Not Found</h1><p>The page "\${slug}" could not be found.</p></body></html>\`
      };
    }
    
    // Generate HTML from page data
    const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${page.title || 'Elevate for Humanity'}</title>
  <meta name="description" content="\${page.description || ''}">
  \${page.meta_tags || ''}
</head>
<body>
  \${page.html_content || '<h1>' + page.title + '</h1><p>Content coming soon...</p>'}
</body>
</html>\`;
    
    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=3600"
      },
      body: html
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html" },
      body: \`<!DOCTYPE html>
<html><head><title>Server Error</title></head>
<body><h1>500 - Server Error</h1><p>An error occurred while loading this page.</p></body></html>\`
    };
  }
}`;
  
  fs.writeFileSync(path.join(functionDir, 'page.js'), functionCode);
  console.log("✅ Created Netlify function for lazy rendering");
}

async function lazyRender() {
  console.log("🚀 Starting lazy render process...");
  
  // Get last deploy time
  let lastDeployTime = null;
  try {
    if (fs.existsSync('dist/last-deploy.txt')) {
      lastDeployTime = fs.readFileSync('dist/last-deploy.txt', 'utf8').trim();
    }
  } catch (error) {
    console.log("📝 No last deploy time found - building all critical pages");
  }
  
  // Get page metadata
  const pages = await getPageMetadata();
  console.log(`📊 Found ${pages.length} pages to evaluate`);
  
  // Determine which pages to build
  let pagesToBuild = [];
  let pagesBuilt = 0;
  
  for (const page of pages) {
    const decision = shouldBuildPage(page, lastDeployTime);
    
    if (decision.build && pagesBuilt < MAX_PAGES_PER_BUILD) {
      pagesToBuild.push({ ...page, reason: decision.reason });
      pagesBuilt++;
    } else if (!decision.build) {
      // Create lazy stub for pages we're not building
      try {
        const stubPath = createLazyStub(page);
        skippedPages.push({ ...page, stubPath, reason: decision.reason });
      } catch (error) {
        errors.push(`Failed to create stub for ${page.slug}: ${error.message}`);
      }
    }
  }
  
  console.log(`📋 Building ${pagesToBuild.length} pages, creating ${skippedPages.length} lazy stubs`);
  
  // Create Netlify function for lazy rendering
  createNetlifyFunction();
  
  // Update last deploy time
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  fs.writeFileSync('dist/last-deploy.txt', new Date().toISOString());
  
  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    totalPages: pages.length,
    pagesBuilt: pagesToBuild.length,
    pagesSkipped: skippedPages.length,
    errors: errors.length,
    builtPages: pagesToBuild.map(p => ({ slug: p.slug, reason: p.reason })),
    skippedPages: skippedPages.map(p => ({ slug: p.slug, reason: p.reason })),
    errors
  };
  
  fs.writeFileSync('dist/lazy-render-report.json', JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Lazy Render Summary:`);
  console.log(`   Total pages: ${pages.length}`);
  console.log(`   Pages built: ${pagesToBuild.length}`);
  console.log(`   Lazy stubs created: ${skippedPages.length}`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.error(`\n❌ Errors occurred:`);
    errors.forEach(error => console.error(`   ${error}`));
  }
  
  console.log(`\n✅ Lazy render process complete`);
  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  lazyRender().catch(error => {
    console.error(`❌ Lazy render failed: ${error.message}`);
    process.exit(1);
  });
}

export { lazyRender };