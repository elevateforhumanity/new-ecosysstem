import fs from "fs";
import path from "path";

const DIST = "dist";
const requiredDisclaimer = "Equal Opportunity Is the Law";
const requiredAltText = true;
let errors = [];
let warnings = [];
let totalPages = 0;
let totalImages = 0;
let imagesWithoutAlt = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && p.endsWith(".html")) checkCompliance(p);
  }
}

function checkCompliance(file) {
  totalPages++;
  const html = fs.readFileSync(file, "utf-8");
  
  // Check for required DOE/DOL/DWD disclaimer
  if (!html.includes(requiredDisclaimer)) {
    errors.push(`${file}: Missing required disclaimer "${requiredDisclaimer}"`);
  }
  
  // Check for alt text on images
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  totalImages += imgMatches.length;
  
  for (const img of imgMatches) {
    if (!img.includes('alt=')) {
      imagesWithoutAlt++;
      warnings.push(`${file}: Image without alt attribute: ${img.substring(0, 100)}...`);
    } else if (img.includes('alt=""') || img.includes("alt=''")) {
      warnings.push(`${file}: Image with empty alt attribute: ${img.substring(0, 100)}...`);
    }
  }
  
  // Check for basic accessibility structure
  if (!html.includes('<main') && !html.includes('role="main"')) {
    warnings.push(`${file}: Missing main content landmark`);
  }
  
  if (!html.includes('<nav') && !html.includes('role="navigation"')) {
    warnings.push(`${file}: Missing navigation landmark`);
  }
  
  // Check for language attribute
  if (!html.includes('lang=')) {
    warnings.push(`${file}: Missing language attribute on html element`);
  }
  
  // Check for page title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    errors.push(`${file}: Missing or empty page title`);
  }
}

walk(DIST);

console.log(`📊 Compliance Check Results:`);
console.log(`   Pages scanned: ${totalPages}`);
console.log(`   Images scanned: ${totalImages}`);
console.log(`   Images without alt: ${imagesWithoutAlt}`);

if (errors.length > 0) {
  console.error(`\n❌ COMPLIANCE ERRORS (${errors.length}):`);
  errors.slice(0, 10).forEach(error => console.error(`   ${error}`));
  if (errors.length > 10) {
    console.error(`   ... and ${errors.length - 10} more errors`);
  }
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  ACCESSIBILITY WARNINGS (${warnings.length}):`);
  warnings.slice(0, 10).forEach(warning => console.warn(`   ${warning}`));
  if (warnings.length > 10) {
    console.warn(`   ... and ${warnings.length - 10} more warnings`);
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Compliance check failed with ${errors.length} errors`);
  process.exit(1);
}

console.log(`\n✅ Compliance check passed (${warnings.length} warnings)`);