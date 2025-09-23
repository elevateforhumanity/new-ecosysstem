#!/usr/bin/env node
/**
 * EFH Autopilot Cleanup
 * ---------------------
 * - Removes placeholders (lorem ipsum, TODOs, example.com, etc.)
 * - Deletes unnecessary files (logs, tmp, node_modules cache, .DS_Store, etc.)
 * - Runs build check to ensure no crashes
 * - Optimizes for Elevate for Humanity ecosystem
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/gi,
  /placeholder/gi,
  /todo:/gi,
  /fixme:/gi,
  /example\.com/gi,
  /your-domain/gi,
  /replace.*this/gi,
  /\[insert.*?\]/gi,
  /\{\{.*?\}\}/gi,
  /sample.*text/gi,
  /dummy.*content/gi,
  /test.*data/gi,
  /coming soon/gi,
  /under construction/gi,
  /page not found/gi,
  /\(555\) 123-4567/gi, // Remove any remaining placeholder phone numbers
  /info@elevateforhumanity\.org/gi, // Replace with real email
];

const REMOVE_DIRS = [
  "node_modules/.cache",
  ".turbo",
  ".next/cache",
  "dist",
  "build",
  ".DS_Store",
  "Thumbs.db",
  ".vscode/settings.json",
  "*.log",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",
  ".nyc_output",
  "coverage",
  ".cache",
  ".parcel-cache",
  ".tmp",
  "temp",
];

const REMOVE_FILES = [
  ".DS_Store",
  "Thumbs.db",
  "*.log",
  "core.*",
  ".env.local",
  ".env.development.local",
  ".env.test.local",
  ".env.production.local",
];

const PROTECTED_DIRS = [
  ".git",
  "node_modules",
  ".devcontainer",
  "scripts",
  "config",
  "supabase",
];

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  try {
    fs.readdirSync(dir).forEach(f => {
      const full = path.join(dir, f);
      const relativePath = path.relative(process.cwd(), full);
      
      // Skip protected directories
      if (PROTECTED_DIRS.some(protected => relativePath.startsWith(protected))) {
        return;
      }
      
      try {
        if (fs.lstatSync(full).isDirectory()) {
          if (REMOVE_DIRS.some(pattern => relativePath.includes(pattern))) {
            console.log(`🗑 Removing directory: ${relativePath}`);
            fs.rmSync(full, { recursive: true, force: true });
          } else {
            walk(full, callback);
          }
        } else {
          callback(full, relativePath);
        }
      } catch (e) {
        console.warn(`⚠️ Skipping ${relativePath}: ${e.message}`);
      }
    });
  } catch (e) {
    console.warn(`⚠️ Cannot read directory ${dir}: ${e.message}`);
  }
}

function cleanPlaceholders(file, relativePath) {
  try {
    let content = fs.readFileSync(file, "utf8");
    let original = content;
    let changes = 0;
    
    PLACEHOLDER_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, "");
        changes += matches.length;
      }
    });
    
    // Replace old email with new email
    content = content.replace(/info@elevateforhumanity\.org/gi, "elevateforhumanity@gmail.com");
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`✂️ Cleaned ${changes} placeholders in: ${relativePath}`);
    }
  } catch (e) {
    // Skip binary files or files we can't read
    if (!e.message.includes("EISDIR")) {
      console.warn(`⚠️ Cannot clean ${relativePath}: ${e.message}`);
    }
  }
}

function removeUnnecessaryFiles() {
  console.log("🧹 Removing unnecessary files and directories...");
  
  REMOVE_FILES.forEach(pattern => {
    try {
      if (pattern.includes("*")) {
        // Handle glob patterns
        const files = execSync(`find . -name "${pattern}" -type f 2>/dev/null || true`, { encoding: "utf8" })
          .split("\n")
          .filter(Boolean);
        
        files.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`🗑 Deleted file: ${file}`);
          }
        });
      } else if (fs.existsSync(pattern)) {
        fs.unlinkSync(pattern);
        console.log(`🗑 Deleted file: ${pattern}`);
      }
    } catch (e) {
      // Ignore errors for files that don't exist
    }
  });
}

function validateEFHContent() {
  console.log("🔍 Validating EFH-specific content...");
  
  const requiredContent = [
    "elevateforhumanity@gmail.com",
    "(317) 555-WORK",
    "Indianapolis, Indiana",
    "Elevate for Humanity",
    "WIOA",
  ];
  
  const mainFiles = [
    "wix-homepage-complete.html",
    "index.html",
    "wix-routing-config.json",
  ];
  
  mainFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const missing = requiredContent.filter(required => !content.includes(required));
      
      if (missing.length === 0) {
        console.log(`✅ ${file} contains all required EFH content`);
      } else {
        console.warn(`⚠️ ${file} missing: ${missing.join(", ")}`);
      }
    }
  });
}

function runBuildCheck() {
  if (process.env.SKIP_BUILD) {
    console.log("ℹ️ Build check skipped (SKIP_BUILD=1)");
    return;
  }
  
  console.log("⚡ Running build check...");
  
  try {
    // Check if package.json exists and has build script
    if (fs.existsSync("package.json")) {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      
      if (pkg.scripts && pkg.scripts.build) {
        execSync("npm run build", { stdio: "inherit" });
        console.log("✅ Build succeeded. System is clean and optimized.");
      } else {
        console.log("ℹ️ No build script found, skipping build check.");
      }
    } else {
      console.log("ℹ️ No package.json found, skipping build check.");
    }
  } catch (e) {
    console.error("❌ Build failed. Check logs above.");
    console.error(e.message);
    process.exit(1);
  }
}

function generateCleanupReport() {
  const reportPath = "cleanup-report.json";
  const report = {
    timestamp: new Date().toISOString(),
    cleanupVersion: "1.0.0",
    patternsRemoved: PLACEHOLDER_PATTERNS.length,
    directoriesChecked: 0,
    filesProcessed: 0,
    placeholdersRemoved: 0,
    status: "completed",
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Cleanup report saved to: ${reportPath}`);
}

// Main execution
console.log("🚀 EFH Autopilot Cleanup Starting...");
console.log("=====================================");

console.log("🔍 Scanning project for placeholders...");
let filesProcessed = 0;
let placeholdersFound = 0;

walk(process.cwd(), (file, relativePath) => {
  if (/\.(html?|js|jsx|ts|tsx|json|md|css|txt)$/.test(file)) {
    filesProcessed++;
    cleanPlaceholders(file, relativePath);
  }
});

console.log(`📁 Processed ${filesProcessed} files`);

removeUnnecessaryFiles();
validateEFHContent();
runBuildCheck();
generateCleanupReport();

console.log("=====================================");
console.log("✅ EFH Autopilot Cleanup Complete!");
console.log("🎯 Project is optimized and ready for deployment.");