#!/usr/bin/env node

/**
 * Apply Google Configuration Across HTML Files
 * Copyright (c) 2025 Elevate for Humanity
 * Commercial License. No resale, sublicensing, or redistribution allowed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, use process.env directly
    console.log('📝 Note: dotenv not available, using system environment variables');
}

const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';
const GOOGLE_VERIFICATION_CODE = process.env.GOOGLE_VERIFICATION_CODE || 'GOOGLE_VERIFICATION_CODE_HERE';
const SITE_DOMAIN = process.env.CANONICAL_DOMAIN || 'https://www.elevateforhumanity.org';

console.log('🔧 Applying Google Configuration Across HTML Files');
console.log('================================================');
console.log(`📊 GA Measurement ID: ${GA_MEASUREMENT_ID}`);
console.log(`🔍 Verification Code: ${GOOGLE_VERIFICATION_CODE.substring(0, 10)}...`);
console.log(`🌐 Site Domain: ${SITE_DOMAIN}`);
console.log('');

// Google Analytics 4 script template
const GA4_SCRIPT = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
        });
    </script>`;

// Google Search Console verification meta tag
const VERIFICATION_META = `<meta name="google-site-verification" content="${GOOGLE_VERIFICATION_CODE}" />`;

// Find all HTML files (excluding build directories and temporary files)
function findHtmlFiles(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build', '.migration_temp']) {
    const files = [];
    
    function searchDir(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!excludeDirs.some(exclude => item.includes(exclude))) {
                    searchDir(fullPath);
                }
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    
    searchDir(dir);
    return files;
}

// Apply Google configuration to a single HTML file
function applyGoogleConfig(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Add Google verification meta tag if not present
        if (!content.includes('google-site-verification') && !content.includes(GOOGLE_VERIFICATION_CODE)) {
            const headCloseIndex = content.indexOf('</head>');
            if (headCloseIndex !== -1) {
                content = content.substring(0, headCloseIndex) + 
                         '    ' + VERIFICATION_META + '\n' +
                         content.substring(headCloseIndex);
                modified = true;
                console.log(`  ✅ Added verification meta tag to ${filePath}`);
            }
        }
        
        // Add or update Google Analytics if not present or using placeholder
        const hasGA = content.includes('gtag.js') || content.includes('googletagmanager.com');
        const hasPlaceholder = content.includes('GA_MEASUREMENT_ID');
        
        if (!hasGA || hasPlaceholder) {
            // Remove old GA placeholders
            content = content.replace(/<!-- Google tag.*?<\/script>/gs, '');
            content = content.replace(/GA_MEASUREMENT_ID/g, GA_MEASUREMENT_ID);
            
            // Add new GA4 script before closing </head>
            const headCloseIndex = content.indexOf('</head>');
            if (headCloseIndex !== -1) {
                content = content.substring(0, headCloseIndex) + 
                         GA4_SCRIPT + '\n' +
                         content.substring(headCloseIndex);
                modified = true;
                console.log(`  📊 Added/updated Google Analytics in ${filePath}`);
            }
        }
        
        // Update canonical URLs to use correct domain
        content = content.replace(/href="https:\/\/[^"]*replit[^"]*"/g, `href="${SITE_DOMAIN}"`);
        content = content.replace(/content="https:\/\/[^"]*replit[^"]*"/g, `content="${SITE_DOMAIN}"`);
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
        return false;
    }
}

// Main execution
function main() {
    const htmlFiles = findHtmlFiles(process.cwd());
    let processedCount = 0;
    let modifiedCount = 0;
    
    console.log(`📁 Found ${htmlFiles.length} HTML files to process`);
    console.log('');
    
    for (const file of htmlFiles) {
        const relativePath = path.relative(process.cwd(), file);
        
        // Skip certain files
        if (relativePath.includes('READY_FOR_TRANSFER') || 
            relativePath.includes('EMERGENCY') ||
            relativePath.includes('demo-site')) {
            continue;
        }
        
        console.log(`🔄 Processing: ${relativePath}`);
        
        if (applyGoogleConfig(file)) {
            modifiedCount++;
        }
        processedCount++;
    }
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`  • Files processed: ${processedCount}`);
    console.log(`  • Files modified: ${modifiedCount}`);
    console.log('');
    
    // Update google-site-verification.html specifically
    const verificationFile = 'google-site-verification.html';
    if (fs.existsSync(verificationFile)) {
        let content = fs.readFileSync(verificationFile, 'utf8');
        content = content.replace(/GOOGLE_VERIFICATION_CODE_HERE/g, GOOGLE_VERIFICATION_CODE);
        fs.writeFileSync(verificationFile, content);
        console.log(`✅ Updated ${verificationFile} with verification code`);
    }
    
    console.log('');
    console.log('🎉 Google configuration applied successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Verify Google Analytics is tracking in GA4 dashboard');
    console.log('2. Submit verification file to Google Search Console');
    console.log('3. Check that all canonical URLs are correct');
    console.log('4. Test page load speeds with new tracking code');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { applyGoogleConfig, findHtmlFiles };