import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const DIST = "dist";
let errors = [];
let warnings = [];
let totalPages = 0;
let totalLinks = 0;
let internalLinks = [];
let externalLinks = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && p.endsWith(".html")) checkLinks(p);
  }
}

function checkLinks(file) {
  totalPages++;
  const html = fs.readFileSync(file, "utf-8");
  
  // Find all links and buttons
  const linkMatches = html.match(/<a[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi) || [];
  const buttonMatches = html.match(/<button[^>]*>/gi) || [];
  
  totalLinks += linkMatches.length + buttonMatches.length;
  
  // Check links
  for (const linkMatch of linkMatches) {
    const hrefMatch = linkMatch.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    
    const href = hrefMatch[1];
    
    // Skip valid external protocols and fragments
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
      continue;
    }
    
    // Check for placeholder links
    if (href === '#' || href === '' || href === 'javascript:void(0)') {
      warnings.push(`${file}: Placeholder link found: ${href}`);
      continue;
    }
    
    // Categorize links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      externalLinks.push({ file, href });
    } else {
      // Internal link - check if file exists
      let targetPath = href;
      
      // Handle relative paths
      if (targetPath.startsWith('./')) {
        targetPath = targetPath.substring(2);
      } else if (targetPath.startsWith('/')) {
        targetPath = targetPath.substring(1);
      }
      
      // Remove query params and fragments
      targetPath = targetPath.split('?')[0].split('#')[0];
      
      // Add .html if no extension
      if (!targetPath.includes('.') && !targetPath.endsWith('/')) {
        targetPath += '.html';
      }
      
      // Handle directory index
      if (targetPath.endsWith('/')) {
        targetPath += 'index.html';
      }
      
      const fullPath = path.join(DIST, targetPath);
      
      if (!fs.existsSync(fullPath)) {
        errors.push(`${file}: Broken internal link: ${href} -> ${fullPath}`);
      }
      
      internalLinks.push({ file, href, targetPath });
    }
  }
  
  // Check buttons for missing onclick or form actions
  for (const buttonMatch of buttonMatches) {
    if (!buttonMatch.includes('onclick=') && 
        !buttonMatch.includes('type="submit"') && 
        !buttonMatch.includes('formaction=') &&
        !html.includes('<form')) {
      warnings.push(`${file}: Button without action: ${buttonMatch.substring(0, 100)}...`);
    }
  }
  
  // Check for "Get Started" CTA
  const hasGetStarted = html.toLowerCase().includes('get started') || 
                       html.toLowerCase().includes('apply now') ||
                       html.toLowerCase().includes('start here');
  
  if (file.includes('index.html') || file.includes('hub.html')) {
    if (!hasGetStarted) {
      warnings.push(`${file}: Missing "Get Started" or similar CTA on main page`);
    }
  }
}

function checkExternalLinks() {
  // For now, just validate that external links have proper protocols
  for (const link of externalLinks) {
    if (!link.href.startsWith('https://') && !link.href.startsWith('http://')) {
      errors.push(`${link.file}: Invalid external link protocol: ${link.href}`);
    }
  }
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ not found — build first.");
}

walk(DIST);
checkExternalLinks();

console.log(`📊 Link Health Check Results:`);
console.log(`   Pages scanned: ${totalPages}`);
console.log(`   Total links: ${totalLinks}`);
console.log(`   Internal links: ${internalLinks.length}`);
console.log(`   External links: ${externalLinks.length}`);

if (errors.length > 0) {
  console.error(`\n❌ LINK ERRORS (${errors.length}):`);
  errors.slice(0, 15).forEach(error => console.error(`   ${error}`));
  if (errors.length > 15) {
    console.error(`   ... and ${errors.length - 15} more errors`);
  }
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  LINK WARNINGS (${warnings.length}):`);
  warnings.slice(0, 10).forEach(warning => console.warn(`   ${warning}`));
  if (warnings.length > 10) {
    console.warn(`   ... and ${warnings.length - 10} more warnings`);
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Link check failed with ${errors.length} errors`);
  process.exit(1);
}

console.log(`\n✅ Link check passed (${warnings.length} warnings)`);