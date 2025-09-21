import fs from "fs";
import path from "path";

const DIST = "dist";

// Required state and federal workforce development programs
const requiredPrograms = [
  {
    term: "WIOA",
    fullName: "Workforce Innovation and Opportunity Act",
    description: "Federal workforce development program"
  },
  {
    term: "WRG",
    fullName: "Workforce Ready Grant",
    description: "Indiana state workforce grant program"
  },
  {
    term: "JRI",
    fullName: "Justice Reinvestment Initiative",
    description: "Reentry workforce development program"
  },
  {
    term: "WEX",
    fullName: "Work Experience",
    description: "Paid work experience program"
  },
  {
    term: "OJT",
    fullName: "On-the-Job Training",
    description: "Employer-based training program"
  },
  {
    term: "Apprenticeship",
    fullName: "Registered Apprenticeship",
    description: "Earn-while-you-learn training program"
  },
  {
    term: "WorkOne",
    fullName: "WorkOne Career Centers",
    description: "Indiana's workforce development system"
  },
  {
    term: "SNAP E&T",
    fullName: "SNAP Employment and Training",
    description: "Employment services for SNAP recipients"
  },
  {
    term: "TANF",
    fullName: "Temporary Assistance for Needy Families",
    description: "Work-focused assistance program"
  }
];

// Additional terms that should be present
const additionalTerms = [
  "Indiana Connect",
  "Career Services",
  "Job Training",
  "Skills Training",
  "Career Counseling",
  "Employment Services",
  "Workforce Development",
  "Career Pathways",
  "Supportive Services",
  "Equal Opportunity"
];

let errors = [];
let warnings = [];
let foundPrograms = new Set();
let foundTerms = new Set();

function checkProgramsPage() {
  const programsPath = path.join(DIST, 'programs.html');
  const programsIndexPath = path.join(DIST, 'programs', 'index.html');
  
  let programsHtml = '';
  
  if (fs.existsSync(programsPath)) {
    programsHtml = fs.readFileSync(programsPath, 'utf-8');
    console.log("✅ Found programs.html");
  } else if (fs.existsSync(programsIndexPath)) {
    programsHtml = fs.readFileSync(programsIndexPath, 'utf-8');
    console.log("✅ Found programs/index.html");
  } else {
    errors.push("❌ No programs page found (programs.html or programs/index.html)");
    return;
  }
  
  // Check for required programs
  for (const program of requiredPrograms) {
    const termFound = programsHtml.includes(program.term);
    const fullNameFound = programsHtml.includes(program.fullName);
    
    if (termFound || fullNameFound) {
      foundPrograms.add(program.term);
      console.log(`✅ Found program: ${program.term}`);
    } else {
      errors.push(`❌ Missing required program: ${program.term} (${program.fullName})`);
    }
  }
  
  // Check for additional terms
  for (const term of additionalTerms) {
    if (programsHtml.toLowerCase().includes(term.toLowerCase())) {
      foundTerms.add(term);
      console.log(`✅ Found term: ${term}`);
    } else {
      warnings.push(`⚠️  Missing recommended term: ${term}`);
    }
  }
}

function checkSiteWidePrograms() {
  console.log("\n🔍 Checking for program mentions across all pages...");
  
  let siteWidePrograms = new Set();
  let totalPages = 0;
  
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && p.endsWith(".html")) {
        totalPages++;
        const html = fs.readFileSync(p, 'utf-8');
        
        for (const program of requiredPrograms) {
          if (html.includes(program.term) || html.includes(program.fullName)) {
            siteWidePrograms.add(program.term);
          }
        }
      }
    }
  }
  
  walk(DIST);
  
  console.log(`📊 Scanned ${totalPages} pages for program mentions`);
  console.log(`📊 Found ${siteWidePrograms.size}/${requiredPrograms.length} programs mentioned site-wide`);
  
  // Check if critical programs are mentioned anywhere on the site
  const criticalPrograms = ['WIOA', 'WorkOne', 'WRG'];
  for (const program of criticalPrograms) {
    if (!siteWidePrograms.has(program)) {
      errors.push(`❌ Critical program '${program}' not found anywhere on site`);
    }
  }
}

function checkIndianaConnectIntegration() {
  console.log("\n🔍 Checking Indiana Connect integration...");
  
  let hasIndianaConnect = false;
  let hasGetStarted = false;
  
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && p.endsWith(".html")) {
        const html = fs.readFileSync(p, 'utf-8');
        
        if (html.toLowerCase().includes('indiana') && 
            (html.toLowerCase().includes('connect') || html.toLowerCase().includes('career'))) {
          hasIndianaConnect = true;
        }
        
        if (html.toLowerCase().includes('get started') || 
            html.toLowerCase().includes('apply now') ||
            html.toLowerCase().includes('start here')) {
          hasGetStarted = true;
        }
      }
    }
  }
  
  walk(DIST);
  
  if (!hasIndianaConnect) {
    warnings.push("⚠️  No Indiana Connect integration found");
  } else {
    console.log("✅ Indiana Connect integration found");
  }
  
  if (!hasGetStarted) {
    warnings.push("⚠️  No 'Get Started' CTA found");
  } else {
    console.log("✅ 'Get Started' CTA found");
  }
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ not found — build first.");
}

console.log("🔍 Verifying state and federal program listings...");

checkProgramsPage();
checkSiteWidePrograms();
checkIndianaConnectIntegration();

console.log(`\n📊 Program Verification Results:`);
console.log(`   Required programs found: ${foundPrograms.size}/${requiredPrograms.length}`);
console.log(`   Additional terms found: ${foundTerms.size}/${additionalTerms.length}`);

if (errors.length > 0) {
  console.error(`\n❌ PROGRAM ERRORS (${errors.length}):`);
  errors.forEach(error => console.error(`   ${error}`));
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  PROGRAM WARNINGS (${warnings.length}):`);
  warnings.forEach(warning => console.warn(`   ${warning}`));
}

if (errors.length > 0) {
  console.error(`\n❌ Program verification failed with ${errors.length} errors`);
  process.exit(1);
}

console.log(`\n✅ Program verification passed (${warnings.length} warnings)`);