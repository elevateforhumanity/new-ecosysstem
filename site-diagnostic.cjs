#!/usr/bin/env node

/**
 * 🔍 SITE DIAGNOSTIC TOOL
 * Quick check to see why the site might not be showing up properly
 */

const https = require('https');

class SiteDiagnostic {
    constructor() {
        this.baseUrl = 'https://elevateforhumanity.org';
        this.issues = [];
        this.checks = [];
    }

    async runDiagnostic() {
        console.log('🔍 SITE DIAGNOSTIC STARTING...');
        console.log('============================================================');
        
        await this.checkMainDomain();
        await this.checkWWWDomain();
        await this.checkKeyPages();
        await this.checkRedirects();
        await this.checkContent();
        
        console.log('\n🔍 SITE DIAGNOSTIC COMPLETE');
        console.log('============================================================');
        this.displayResults();
    }

    async checkMainDomain() {
        console.log('🌐 Checking main domain...');
        
        try {
            const response = await this.makeRequest(this.baseUrl);
            console.log(`  ✅ Main domain responds: ${response.statusCode}`);
            console.log(`  📊 Content length: ${response.headers['content-length']} bytes`);
            console.log(`  🏠 Server: ${response.headers.server}`);
            
            if (response.data.includes('refresh')) {
                const redirectMatch = response.data.match(/url=([^"]+)/);
                if (redirectMatch) {
                    console.log(`  🔄 Auto-redirect detected to: ${redirectMatch[1]}`);
                    this.checks.push(`Homepage redirects to ${redirectMatch[1]}`);
                }
            }
            
        } catch (error) {
            console.log(`  ❌ Main domain error: ${error.message}`);
            this.issues.push(`Main domain not accessible: ${error.message}`);
        }
    }

    async checkWWWDomain() {
        console.log('🌐 Checking www subdomain...');
        
        try {
            const response = await this.makeRequest('https://www.elevateforhumanity.org', { 
                followRedirects: false 
            });
            
            if (response.statusCode >= 300 && response.statusCode < 400) {
                console.log(`  ✅ WWW redirects properly: ${response.statusCode} → ${response.headers.location}`);
                this.checks.push('WWW subdomain redirects correctly');
            } else {
                console.log(`  ⚠️ WWW subdomain status: ${response.statusCode}`);
            }
            
        } catch (error) {
            console.log(`  ❌ WWW subdomain error: ${error.message}`);
            this.issues.push(`WWW subdomain issue: ${error.message}`);
        }
    }

    async checkKeyPages() {
        console.log('📄 Checking key pages...');
        
        const keyPages = [
            '/hub.html',
            '/about.html', 
            '/programs.html',
            '/connect.html'
        ];
        
        for (const page of keyPages) {
            try {
                const response = await this.makeRequest(`${this.baseUrl}${page}`);
                
                if (response.statusCode === 200) {
                    console.log(`  ✅ ${page}: Working (${response.headers['content-length']} bytes)`);
                    this.checks.push(`${page} loads successfully`);
                } else {
                    console.log(`  ❌ ${page}: Status ${response.statusCode}`);
                    this.issues.push(`${page} returns ${response.statusCode}`);
                }
                
            } catch (error) {
                console.log(`  ❌ ${page}: ${error.message}`);
                this.issues.push(`${page} error: ${error.message}`);
            }
        }
    }

    async checkRedirects() {
        console.log('🔄 Checking redirect configuration...');
        
        try {
            // Check if _redirects file is working
            const response = await this.makeRequest(`${this.baseUrl}/index.html`, { 
                followRedirects: false 
            });
            
            if (response.statusCode >= 300 && response.statusCode < 400) {
                console.log(`  ✅ Redirects working: ${response.statusCode}`);
                this.checks.push('Redirect rules are active');
            } else {
                console.log(`  ⚠️ Redirect test: ${response.statusCode}`);
            }
            
        } catch (error) {
            console.log(`  ❌ Redirect check failed: ${error.message}`);
        }
    }

    async checkContent() {
        console.log('📝 Checking content delivery...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/hub.html`);
            
            if (response.data) {
                const hasTitle = response.data.includes('<title>');
                const hasContent = response.data.length > 1000;
                const hasCSS = response.data.includes('style') || response.data.includes('.css');
                const hasJS = response.data.includes('script') || response.data.includes('.js');
                
                console.log(`  ${hasTitle ? '✅' : '❌'} Title tag present`);
                console.log(`  ${hasContent ? '✅' : '❌'} Substantial content (${response.data.length} chars)`);
                console.log(`  ${hasCSS ? '✅' : '❌'} CSS styling`);
                console.log(`  ${hasJS ? '✅' : '❌'} JavaScript functionality`);
                
                if (!hasTitle) this.issues.push('Missing title tag');
                if (!hasContent) this.issues.push('Insufficient content');
                if (!hasCSS) this.issues.push('No CSS styling detected');
                
            } else {
                console.log('  ❌ No content received');
                this.issues.push('Empty response from server');
            }
            
        } catch (error) {
            console.log(`  ❌ Content check failed: ${error.message}`);
            this.issues.push(`Content delivery error: ${error.message}`);
        }
    }

    displayResults() {
        console.log('\n📊 DIAGNOSTIC RESULTS:');
        console.log('============================================================');
        
        console.log(`✅ Successful Checks: ${this.checks.length}`);
        this.checks.forEach(check => {
            console.log(`  • ${check}`);
        });
        
        console.log(`\n❌ Issues Found: ${this.issues.length}`);
        this.issues.forEach(issue => {
            console.log(`  • ${issue}`);
        });
        
        if (this.issues.length === 0) {
            console.log('\n🎉 Site appears to be working correctly!');
            console.log('If you\'re still having issues, try:');
            console.log('  • Clear browser cache');
            console.log('  • Try incognito/private mode');
            console.log('  • Check from different device/network');
        } else {
            console.log('\n🔧 Recommended Actions:');
            console.log('  • Check Netlify deployment logs');
            console.log('  • Verify DNS propagation');
            console.log('  • Test from different locations');
        }
    }

    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, {
                method: 'GET',
                timeout: 10000,
                ...options
            }, (res) => {
                let data = '';
                
                res.on('data', chunk => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data
                    });
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));
            req.end();
        });
    }
}

// Run diagnostic if called directly
if (require.main === module) {
    const diagnostic = new SiteDiagnostic();
    diagnostic.runDiagnostic().catch(console.error);
}

module.exports = SiteDiagnostic;