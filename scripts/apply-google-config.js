#!/usr/bin/env node
/**
 * Apply Google configuration across HTML files
 * Replaces placeholders with actual values from environment variables
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ROOT = process.cwd();

// Configuration from environment variables
const config = {
    gaId: process.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID',
    googleVerification: process.env.GOOGLE_SITE_VERIFICATION || 'GOOGLE_VERIFICATION_CODE_HERE',
    bingVerification: process.env.BING_SITE_VERIFICATION || 'YOUR_BING_VERIFICATION_CODE',
    canonicalDomain: process.env.CANONICAL_DOMAIN || 'https://example.com'
};

// Placeholder mappings
const placeholders = {
    'GA_MEASUREMENT_ID': config.gaId,
    'GOOGLE_VERIFICATION_CODE_HERE': config.googleVerification,
    'YOUR_BING_VERIFICATION_CODE': config.bingVerification
};

/**
 * Replace placeholders in file content
 */
function replacePlaceholders(content) {
    let updatedContent = content;
    Object.entries(placeholders).forEach(([placeholder, value]) => {
        const regex = new RegExp(placeholder, 'g');
        updatedContent = updatedContent.replace(regex, value);
    });
    return updatedContent;
}

/**
 * Process HTML files recursively
 */
function processHtmlFiles(dir = ROOT) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            // Skip node_modules and .git directories
            if (!['node_modules', '.git', '.migration_temp_20250906-112655', '.migration_temp_20250906-112840'].includes(entry.name)) {
                processHtmlFiles(fullPath);
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const updatedContent = replacePlaceholders(content);
                
                if (content !== updatedContent) {
                    fs.writeFileSync(fullPath, updatedContent, 'utf8');
                    console.log(`✅ Updated placeholders in ${path.relative(ROOT, fullPath)}`);
                }
            } catch (error) {
                console.error(`❌ Error processing ${fullPath}: ${error.message}`);
            }
        }
    });
}

/**
 * Main execution
 */
function main() {
    console.log('🔧 Applying Google configuration across HTML files...\n');
    
    // Display current configuration
    console.log('Configuration:');
    Object.entries(config).forEach(([key, value]) => {
        const displayValue = value === placeholders[Object.keys(placeholders).find(p => placeholders[p] === value)] 
            ? value 
            : value.replace(/./g, '*'); // Mask actual values for security
        console.log(`  ${key}: ${displayValue}`);
    });
    console.log('');
    
    // Process files
    processHtmlFiles();
    
    console.log('\n🎉 Google configuration application complete!');
    
    // Provide guidance
    if (config.gaId === 'GA_MEASUREMENT_ID') {
        console.log('\n⚠️  Warning: GA_MEASUREMENT_ID placeholder detected.');
        console.log('   Set VITE_GA_MEASUREMENT_ID environment variable with your Google Analytics ID.');
    }
    
    if (config.googleVerification === 'GOOGLE_VERIFICATION_CODE_HERE') {
        console.log('\n⚠️  Warning: GOOGLE_VERIFICATION_CODE_HERE placeholder detected.');
        console.log('   Set GOOGLE_SITE_VERIFICATION environment variable with your Search Console verification code.');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Set environment variables in .env file');
    console.log('2. Run this script again to apply actual values');
    console.log('3. Verify meta tags with Google Rich Results Test');
    console.log('4. Submit sitemap to Google Search Console');
}

if (require.main === module) {
    main();
}

module.exports = { replacePlaceholders, config };