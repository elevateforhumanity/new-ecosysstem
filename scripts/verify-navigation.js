import fs from "fs";
import path from "path";

const DIST = "dist";

// Required navigation elements
const requiredNavItems = [
  { text: "Home", variations: ["home", "hub", "main"] },
  { text: "Programs", variations: ["programs", "services", "training"] },
  { text: "About", variations: ["about", "about us", "who we are"] },
  { text: "Contact", variations: ["contact", "connect", "get in touch"] }
];

// Required CTA elements
const requiredCTAs = [
  { text: "Get Started", variations: ["get started", "start here", "begin", "apply now"] },
  { text: "Apply", variations: ["apply", "apply now", "enroll", "register"] },
  { text: "Learn More", variations: ["learn more", "read more", "find out more", "discover"] }
];

let errors = [];
let warnings = [];
let navigationIssues = [];
let ctaIssues = [];

function checkNavigation(file, html) {
  const fileName = path.basename(file);
  let hasNav = false;
  let foundNavItems = new Set();
  
  // Check for navigation structure
  if (html.includes('<nav') || html.includes('role="navigation"') || 
      html.includes('class="nav') || html.includes('id="nav')) {
    hasNav = true;
  }
  
  if (!hasNav) {
    navigationIssues.push(`${fileName}: No navigation structure found`);
  }
  
  // Check for required navigation items
  for (const navItem of requiredNavItems) {
    let found = false;
    for (const variation of navItem.variations) {
      if (html.toLowerCase().includes(variation)) {
        found = true;
        foundNavItems.add(navItem.text);
        break;
      }
    }
    
    if (!found) {
      navigationIssues.push(`${fileName}: Missing navigation item: ${navItem.text}`);
    }
  }
  
  return { hasNav, foundNavItems: foundNavItems.size };
}

function checkCTAs(file, html) {
  const fileName = path.basename(file);
  let foundCTAs = new Set();
  let ctaElements = [];
  
  // Look for button elements
  const buttonMatches = html.match(/<button[^>]*>([^<]*)<\/button>/gi) || [];
  buttonMatches.forEach(button => {
    const text = button.replace(/<[^>]*>/g, '').trim().toLowerCase();
    ctaElements.push({ type: 'button', text });
  });
  
  // Look for link elements that look like CTAs
  const linkMatches = html.match(/<a[^>]*class="[^"]*btn[^"]*"[^>]*>([^<]*)<\/a>/gi) || [];
  linkMatches.forEach(link => {
    const text = link.replace(/<[^>]*>/g, '').trim().toLowerCase();
    ctaElements.push({ type: 'link-button', text });
  });
  
  // Look for any prominent links
  const prominentLinks = html.match(/<a[^>]*class="[^"]*(?:cta|call-to-action|primary|btn-primary)[^"]*"[^>]*>([^<]*)<\/a>/gi) || [];
  prominentLinks.forEach(link => {
    const text = link.replace(/<[^>]*>/g, '').trim().toLowerCase();
    ctaElements.push({ type: 'cta-link', text });
  });
  
  // Check against required CTAs
  for (const cta of requiredCTAs) {
    let found = false;
    for (const element of ctaElements) {
      for (const variation of cta.variations) {
        if (element.text.includes(variation)) {
          found = true;
          foundCTAs.add(cta.text);
          break;
        }
      }
      if (found) break;
    }
  }
  
  // Special checks for main pages
  if (fileName.includes('index.html') || fileName.includes('hub.html')) {
    let hasMainCTA = false;
    for (const element of ctaElements) {
      if (element.text.includes('get started') || 
          element.text.includes('apply') || 
          element.text.includes('begin')) {
        hasMainCTA = true;
        break;
      }
    }
    
    if (!hasMainCTA) {
      ctaIssues.push(`${fileName}: Main page missing primary CTA`);
    }
  }
  
  return { foundCTAs: foundCTAs.size, totalCTAs: ctaElements.length };
}

function checkAccessibility(file, html) {
  const fileName = path.basename(file);
  let accessibilityIssues = [];
  
  // Check for skip links
  if (!html.includes('skip') || !html.includes('main')) {
    accessibilityIssues.push(`${fileName}: Missing skip to main content link`);
  }
  
  // Check for proper heading structure
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 0) {
    accessibilityIssues.push(`${fileName}: Missing H1 heading`);
  } else if (h1Count > 1) {
    accessibilityIssues.push(`${fileName}: Multiple H1 headings found`);
  }
  
  // Check for aria-labels on buttons without text
  const buttonMatches = html.match(/<button[^>]*>([^<]*)<\/button>/gi) || [];
  buttonMatches.forEach(button => {
    const text = button.replace(/<[^>]*>/g, '').trim();
    if (!text && !button.includes('aria-label')) {
      accessibilityIssues.push(`${fileName}: Button without text or aria-label`);
    }
  });
  
  return accessibilityIssues;
}

function analyzePages() {
  let totalPages = 0;
  let pagesWithNav = 0;
  let pagesWithCTAs = 0;
  let allAccessibilityIssues = [];
  
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && p.endsWith(".html")) {
        totalPages++;
        const html = fs.readFileSync(p, 'utf-8');
        
        // Check navigation
        const navResults = checkNavigation(p, html);
        if (navResults.hasNav) pagesWithNav++;
        
        // Check CTAs
        const ctaResults = checkCTAs(p, html);
        if (ctaResults.totalCTAs > 0) pagesWithCTAs++;
        
        // Check accessibility
        const accessibilityIssues = checkAccessibility(p, html);
        allAccessibilityIssues.push(...accessibilityIssues);
      }
    }
  }
  
  walk(DIST);
  
  return {
    totalPages,
    pagesWithNav,
    pagesWithCTAs,
    accessibilityIssues: allAccessibilityIssues
  };
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ not found — build first.");
}

console.log("🔍 Verifying navigation and CTAs...");

const results = analyzePages();

console.log(`\n📊 Navigation & CTA Analysis:`);
console.log(`   Total pages: ${results.totalPages}`);
console.log(`   Pages with navigation: ${results.pagesWithNav}/${results.totalPages}`);
console.log(`   Pages with CTAs: ${results.pagesWithCTAs}/${results.totalPages}`);

// Report navigation issues
if (navigationIssues.length > 0) {
  console.warn(`\n⚠️  NAVIGATION ISSUES (${navigationIssues.length}):`);
  navigationIssues.slice(0, 10).forEach(issue => console.warn(`   ${issue}`));
  if (navigationIssues.length > 10) {
    console.warn(`   ... and ${navigationIssues.length - 10} more issues`);
  }
}

// Report CTA issues
if (ctaIssues.length > 0) {
  console.error(`\n❌ CTA ERRORS (${ctaIssues.length}):`);
  ctaIssues.forEach(issue => console.error(`   ${issue}`));
  errors.push(...ctaIssues);
}

// Report accessibility issues
if (results.accessibilityIssues.length > 0) {
  console.warn(`\n⚠️  ACCESSIBILITY WARNINGS (${results.accessibilityIssues.length}):`);
  results.accessibilityIssues.slice(0, 10).forEach(issue => console.warn(`   ${issue}`));
  if (results.accessibilityIssues.length > 10) {
    console.warn(`   ... and ${results.accessibilityIssues.length - 10} more issues`);
  }
}

// Check coverage thresholds
if (results.pagesWithNav / results.totalPages < 0.8) {
  warnings.push(`⚠️  Low navigation coverage: ${Math.round(results.pagesWithNav / results.totalPages * 100)}%`);
}

if (results.pagesWithCTAs / results.totalPages < 0.5) {
  warnings.push(`⚠️  Low CTA coverage: ${Math.round(results.pagesWithCTAs / results.totalPages * 100)}%`);
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  COVERAGE WARNINGS:`);
  warnings.forEach(warning => console.warn(`   ${warning}`));
}

if (errors.length > 0) {
  console.error(`\n❌ Navigation verification failed with ${errors.length} errors`);
  process.exit(1);
}

console.log(`\n✅ Navigation verification passed`);