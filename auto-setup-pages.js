#!/usr/bin/env node

/**
 * 🚀 Automated GitHub Pages Setup Script
 * This script attempts to configure GitHub Pages automatically
 */

const https = require('https');
const fs = require('fs');

// Configuration
const CONFIG = {
    owner: 'elevateforhumanity',
    repo: 'new-ecosysstem',
    customDomain: 'hubs.elevateforhumanity.org',
    branch: 'main',
    path: '/hub-pages'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function checkGitHubPagesStatus() {
    log('🔍 Checking current GitHub Pages status...', 'blue');
    
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${CONFIG.owner}/${CONFIG.repo}/pages`,
        method: 'GET',
        headers: {
            'User-Agent': 'EFH-Setup-Script',
            'Accept': 'application/vnd.github+json'
        }
    };

    try {
        const response = await makeRequest(options);
        
        if (response.status === 200) {
            log('✅ GitHub Pages is already configured!', 'green');
            log(`📄 Current URL: ${response.data.html_url}`, 'cyan');
            log(`🌐 Custom domain: ${response.data.custom_domain || 'Not set'}`, 'cyan');
            return true;
        } else if (response.status === 404) {
            log('❌ GitHub Pages is not configured yet', 'yellow');
            return false;
        } else {
            log(`⚠️  Unexpected response: ${response.status}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ Error checking Pages status: ${error.message}`, 'red');
        return false;
    }
}

async function enableGitHubPages() {
    log('🚀 Attempting to enable GitHub Pages...', 'blue');
    
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${CONFIG.owner}/${CONFIG.repo}/pages`,
        method: 'POST',
        headers: {
            'User-Agent': 'EFH-Setup-Script',
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        }
    };

    const data = {
        source: {
            branch: CONFIG.branch,
            path: CONFIG.path
        },
        custom_domain: CONFIG.customDomain,
        https_enforced: true
    };

    try {
        const response = await makeRequest(options, data);
        
        if (response.status === 201) {
            log('✅ GitHub Pages enabled successfully!', 'green');
            log(`📄 Pages URL: ${response.data.html_url}`, 'cyan');
            return true;
        } else {
            log(`❌ Failed to enable Pages: ${response.status}`, 'red');
            log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ Error enabling Pages: ${error.message}`, 'red');
        return false;
    }
}

async function triggerWorkflow() {
    log('🔄 Triggering hub pages deployment workflow...', 'blue');
    
    const options = {
        hostname: 'api.github.com',
        path: `/repos/${CONFIG.owner}/${CONFIG.repo}/actions/workflows/hub-pages-simple.yml/dispatches`,
        method: 'POST',
        headers: {
            'User-Agent': 'EFH-Setup-Script',
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        }
    };

    const data = {
        ref: CONFIG.branch
    };

    try {
        const response = await makeRequest(options, data);
        
        if (response.status === 204) {
            log('✅ Workflow triggered successfully!', 'green');
            return true;
        } else {
            log(`⚠️  Workflow trigger response: ${response.status}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ Error triggering workflow: ${error.message}`, 'red');
        return false;
    }
}

function checkLocalFiles() {
    log('📁 Checking local hub pages files...', 'blue');
    
    const hubPagesDir = './hub-pages';
    const requiredFiles = [
        'student-hub.html',
        'business-hub.html',
        'community-hub.html',
        'educator-hub.html',
        'index.html',
        'CNAME'
    ];

    if (!fs.existsSync(hubPagesDir)) {
        log('❌ hub-pages directory not found!', 'red');
        return false;
    }

    let allFilesExist = true;
    requiredFiles.forEach(file => {
        const filePath = `${hubPagesDir}/${file}`;
        if (fs.existsSync(filePath)) {
            log(`✅ ${file}`, 'green');
        } else {
            log(`❌ ${file} - MISSING`, 'red');
            allFilesExist = false;
        }
    });

    return allFilesExist;
}

function printManualInstructions() {
    log('\n📋 MANUAL SETUP INSTRUCTIONS', 'magenta');
    log('================================', 'magenta');
    log('If automated setup failed, please complete these steps manually:\n', 'yellow');
    
    log('🔧 Step 1: GitHub Pages Configuration', 'blue');
    log(`   Go to: https://github.com/${CONFIG.owner}/${CONFIG.repo}/settings/pages`, 'cyan');
    log('   - Set Source to: "GitHub Actions"', 'cyan');
    log(`   - Set Custom domain to: "${CONFIG.customDomain}"`, 'cyan');
    log('   - Check "Enforce HTTPS"', 'cyan');
    log('   - Click "Save"\n', 'cyan');
    
    log('🌐 Step 2: DNS Configuration', 'blue');
    log('   Go to: https://dash.cloudflare.com', 'cyan');
    log('   - Select domain: elevateforhumanity.org', 'cyan');
    log('   - Click "DNS"', 'cyan');
    log('   - Add CNAME record:', 'cyan');
    log('     Type: CNAME', 'cyan');
    log('     Name: hubs', 'cyan');
    log('     Target: elevateforhumanity.github.io', 'cyan');
    log('     Proxy: DNS only (gray cloud)', 'cyan');
    
    log('\n🎯 Expected Results:', 'blue');
    log(`   https://${CONFIG.customDomain}/student-hub.html`, 'green');
    log(`   https://${CONFIG.customDomain}/business-hub.html`, 'green');
    log(`   https://${CONFIG.customDomain}/community-hub.html`, 'green');
    log(`   https://${CONFIG.customDomain}/educator-hub.html`, 'green');
}

async function main() {
    log('🚀 Elevate for Humanity - Hub Pages Auto Setup', 'magenta');
    log('===============================================\n', 'magenta');
    
    // Check local files first
    if (!checkLocalFiles()) {
        log('❌ Required files are missing. Please ensure all hub pages are created.', 'red');
        return;
    }
    
    // Check current status
    const pagesEnabled = await checkGitHubPagesStatus();
    
    if (!pagesEnabled) {
        // Try to enable GitHub Pages
        const enabled = await enableGitHubPages();
        
        if (!enabled) {
            log('❌ Automated setup failed. Manual configuration required.', 'red');
            printManualInstructions();
            return;
        }
    }
    
    // Trigger workflow
    await triggerWorkflow();
    
    log('\n🎉 Setup process completed!', 'green');
    log('⏰ Timeline:', 'blue');
    log('   - GitHub Pages activation: 2-5 minutes', 'cyan');
    log('   - DNS propagation: 5-15 minutes (if DNS is configured)', 'cyan');
    log('   - SSL certificate: 5-10 minutes', 'cyan');
    log('   - Full functionality: 15-30 minutes', 'cyan');
    
    log('\n🧪 Verification:', 'blue');
    log(`   Check deployment: https://github.com/${CONFIG.owner}/${CONFIG.repo}/actions`, 'cyan');
    log(`   Test DNS: nslookup ${CONFIG.customDomain}`, 'cyan');
    log(`   Test site: curl -I https://${CONFIG.customDomain}`, 'cyan');
    
    if (!pagesEnabled) {
        log('\n⚠️  Note: DNS configuration is still required in Cloudflare!', 'yellow');
        printManualInstructions();
    }
}

// Run the script
main().catch(error => {
    log(`💥 Script failed: ${error.message}`, 'red');
    process.exit(1);
});