#!/usr/bin/env node

/**
 * 🗺️ SITEMAP HEALTH CHECK TOOL
 * Comprehensive sitemap and SEO analysis for elevateforhumanity.org
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class SitemapHealthChecker {
    constructor() {
        this.baseUrl = 'https://elevateforhumanity.org';
        this.results = {
            timestamp: new Date().toISOString(),
            sitemap_status: 'UNKNOWN',
            robots_status: 'UNKNOWN',
            pages_found: [],
            pages_missing: [],
            seo_issues: [],
            recommendations: [],
            summary: {
                total_pages: 0,
                accessible_pages: 0,
                broken_links: 0,
                seo_score: 0
            }
        };
        
        // Core pages that should be in sitemap
        this.expectedPages = [
            '/',
            '/hub.html',
            '/about.html',
            '/programs.html',
            '/connect.html',
            '/student-portal.html',
            '/veterans.html',
            '/impact.html',
            '/calendar.html',
            '/eligibility-check.html'
        ];
    }

    async runHealthCheck() {
        console.log('🗺️ SITEMAP HEALTH CHECK STARTING...');
        console.log('============================================================');
        
        try {
            await this.checkSitemapExists();
            await this.checkRobotsExists();
            await this.analyzeSitemap();
            await this.checkPageAccessibility();
            await this.checkSEOElements();
            await this.generateRecommendations();
            
            this.calculateSEOScore();
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Sitemap health check failed:', error.message);
            this.results.sitemap_status = 'CRITICAL_ERROR';
        }
        
        console.log('\n🗺️ SITEMAP HEALTH CHECK COMPLETE');
        console.log('============================================================');
        this.displaySummary();
    }

    async checkSitemapExists() {
        console.log('📄 Checking sitemap.xml...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/sitemap.xml`);
            
            if (response.statusCode === 200) {
                this.results.sitemap_status = 'EXISTS';
                console.log('  ✅ sitemap.xml found and accessible');
                
                // Check if it's valid XML
                if (response.data && response.data.includes('<urlset')) {
                    console.log('  ✅ Valid XML sitemap format');
                } else {
                    console.log('  ⚠️ Sitemap exists but may not be valid XML');
                    this.results.seo_issues.push('Sitemap may not be valid XML format');
                }
                
            } else {
                this.results.sitemap_status = 'MISSING';
                console.log('  ❌ sitemap.xml not found or not accessible');
                this.results.seo_issues.push('Sitemap.xml is missing or inaccessible');
            }
            
        } catch (error) {
            this.results.sitemap_status = 'ERROR';
            console.log(`  ❌ Error checking sitemap: ${error.message}`);
            this.results.seo_issues.push(`Sitemap check failed: ${error.message}`);
        }
    }

    async checkRobotsExists() {
        console.log('🤖 Checking robots.txt...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/robots.txt`);
            
            if (response.statusCode === 200) {
                this.results.robots_status = 'EXISTS';
                console.log('  ✅ robots.txt found and accessible');
                
                // Check if it references sitemap
                if (response.data && response.data.toLowerCase().includes('sitemap:')) {
                    console.log('  ✅ robots.txt references sitemap');
                } else {
                    console.log('  ⚠️ robots.txt does not reference sitemap');
                    this.results.seo_issues.push('robots.txt should reference sitemap location');
                }
                
            } else {
                this.results.robots_status = 'MISSING';
                console.log('  ❌ robots.txt not found');
                this.results.seo_issues.push('robots.txt is missing');
            }
            
        } catch (error) {
            this.results.robots_status = 'ERROR';
            console.log(`  ❌ Error checking robots.txt: ${error.message}`);
        }
    }

    async analyzeSitemap() {
        console.log('🔍 Analyzing sitemap content...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/sitemap.xml`);
            
            if (response.statusCode === 200 && response.data) {
                // Extract URLs from sitemap
                const urlMatches = response.data.match(/<loc>(.*?)<\/loc>/g);
                
                if (urlMatches) {
                    const sitemapUrls = urlMatches.map(match => 
                        match.replace('<loc>', '').replace('</loc>', '')
                    );
                    
                    this.results.summary.total_pages = sitemapUrls.length;
                    console.log(`  📊 Found ${sitemapUrls.length} URLs in sitemap`);
                    
                    // Check for expected pages
                    for (const expectedPage of this.expectedPages) {
                        const fullUrl = `${this.baseUrl}${expectedPage}`;
                        const normalizedUrl = expectedPage === '/' ? `${this.baseUrl}/` : fullUrl;
                        
                        if (sitemapUrls.some(url => url === normalizedUrl || url === fullUrl)) {
                            this.results.pages_found.push(expectedPage);
                            console.log(`    ✅ ${expectedPage} - Found in sitemap`);
                        } else {
                            this.results.pages_missing.push(expectedPage);
                            console.log(`    ❌ ${expectedPage} - Missing from sitemap`);
                        }
                    }
                    
                    // Check for duplicate URLs
                    const duplicates = sitemapUrls.filter((url, index) => 
                        sitemapUrls.indexOf(url) !== index
                    );
                    
                    if (duplicates.length > 0) {
                        console.log(`  ⚠️ Found ${duplicates.length} duplicate URLs`);
                        this.results.seo_issues.push(`Sitemap contains ${duplicates.length} duplicate URLs`);
                    }
                    
                } else {
                    console.log('  ❌ No URLs found in sitemap');
                    this.results.seo_issues.push('Sitemap contains no URLs');
                }
            }
            
        } catch (error) {
            console.log(`  ❌ Error analyzing sitemap: ${error.message}`);
        }
    }

    async checkPageAccessibility() {
        console.log('🌐 Checking page accessibility...');
        
        const pagesToCheck = [
            ...this.expectedPages,
            '/browser-health-check.html', // New health check page
            '/sitemap.html' // If exists
        ];
        
        for (const page of pagesToCheck) {
            const fullUrl = page === '/' ? this.baseUrl : `${this.baseUrl}${page}`;
            
            try {
                const response = await this.makeRequest(fullUrl);
                
                if (response.statusCode === 200) {
                    this.results.summary.accessible_pages++;
                    console.log(`  ✅ ${page} - Accessible (${response.statusCode})`);
                    
                    // Basic SEO checks
                    if (response.data) {
                        this.checkBasicSEO(page, response.data);
                    }
                    
                } else if (response.statusCode >= 300 && response.statusCode < 400) {
                    console.log(`  🔄 ${page} - Redirects (${response.statusCode})`);
                } else {
                    this.results.summary.broken_links++;
                    console.log(`  ❌ ${page} - Error (${response.statusCode})`);
                    this.results.seo_issues.push(`Page ${page} returns ${response.statusCode}`);
                }
                
            } catch (error) {
                this.results.summary.broken_links++;
                console.log(`  ❌ ${page} - Failed: ${error.message}`);
                this.results.seo_issues.push(`Page ${page} failed to load: ${error.message}`);
            }
            
            // Small delay between requests
            await this.delay(200);
        }
    }

    checkBasicSEO(page, html) {
        // Check for title tag
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (!titleMatch || !titleMatch[1].trim()) {
            this.results.seo_issues.push(`Page ${page} missing or empty title tag`);
        }
        
        // Check for meta description
        const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']*)["\'][^>]*>/i);
        if (!metaDescMatch || !metaDescMatch[1].trim()) {
            this.results.seo_issues.push(`Page ${page} missing meta description`);
        }
        
        // Check for h1 tag
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (!h1Match || !h1Match[1].trim()) {
            this.results.seo_issues.push(`Page ${page} missing or empty h1 tag`);
        }
        
        // Check for canonical URL
        const canonicalMatch = html.match(/<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"']*)["\'][^>]*>/i);
        if (!canonicalMatch) {
            this.results.seo_issues.push(`Page ${page} missing canonical URL`);
        }
    }

    async checkSEOElements() {
        console.log('🔍 Checking SEO elements...');
        
        // Check for sitemap in robots.txt
        try {
            const robotsResponse = await this.makeRequest(`${this.baseUrl}/robots.txt`);
            if (robotsResponse.statusCode === 200 && robotsResponse.data) {
                if (!robotsResponse.data.toLowerCase().includes('sitemap:')) {
                    this.results.seo_issues.push('robots.txt should include sitemap reference');
                }
            }
        } catch (error) {
            // Already handled in checkRobotsExists
        }
        
        // Check for Google Search Console verification
        try {
            const homeResponse = await this.makeRequest(this.baseUrl);
            if (homeResponse.statusCode === 200 && homeResponse.data) {
                if (homeResponse.data.includes('google-site-verification')) {
                    console.log('  ✅ Google Search Console verification found');
                } else {
                    console.log('  ⚠️ Google Search Console verification not found');
                    this.results.seo_issues.push('Consider adding Google Search Console verification');
                }
            }
        } catch (error) {
            console.log('  ❌ Could not check for Google verification');
        }
    }

    generateRecommendations() {
        console.log('💡 Generating recommendations...');
        
        // Sitemap recommendations
        if (this.results.sitemap_status === 'MISSING') {
            this.results.recommendations.push('Create and deploy sitemap.xml');
        }
        
        if (this.results.pages_missing.length > 0) {
            this.results.recommendations.push(`Add missing pages to sitemap: ${this.results.pages_missing.join(', ')}`);
        }
        
        // Robots.txt recommendations
        if (this.results.robots_status === 'MISSING') {
            this.results.recommendations.push('Create robots.txt file');
        }
        
        // SEO recommendations
        if (this.results.seo_issues.length > 5) {
            this.results.recommendations.push('Address critical SEO issues for better search visibility');
        }
        
        if (this.results.summary.broken_links > 0) {
            this.results.recommendations.push('Fix broken links to improve user experience');
        }
        
        // Performance recommendations
        this.results.recommendations.push('Submit sitemap to Google Search Console');
        this.results.recommendations.push('Monitor sitemap status regularly');
        this.results.recommendations.push('Update sitemap when adding new pages');
        
        console.log(`  📋 Generated ${this.results.recommendations.length} recommendations`);
    }

    calculateSEOScore() {
        let score = 100;
        
        // Deduct points for issues
        if (this.results.sitemap_status === 'MISSING') score -= 20;
        if (this.results.robots_status === 'MISSING') score -= 10;
        score -= this.results.pages_missing.length * 5;
        score -= this.results.summary.broken_links * 10;
        score -= Math.min(this.results.seo_issues.length * 2, 30);
        
        this.results.summary.seo_score = Math.max(score, 0);
    }

    displaySummary() {
        console.log('\n📊 SITEMAP HEALTH SUMMARY:');
        console.log('============================================================');
        console.log(`🎯 SEO Score: ${this.results.summary.seo_score}/100`);
        console.log(`📄 Sitemap Status: ${this.results.sitemap_status}`);
        console.log(`🤖 Robots.txt Status: ${this.results.robots_status}`);
        console.log(`📊 Total Pages: ${this.results.summary.total_pages}`);
        console.log(`✅ Accessible Pages: ${this.results.summary.accessible_pages}`);
        console.log(`❌ Broken Links: ${this.results.summary.broken_links}`);
        console.log(`⚠️ SEO Issues: ${this.results.seo_issues.length}`);
        
        if (this.results.pages_missing.length > 0) {
            console.log(`\n📋 Missing from Sitemap:`);
            this.results.pages_missing.forEach(page => {
                console.log(`  - ${page}`);
            });
        }
        
        if (this.results.recommendations.length > 0) {
            console.log(`\n💡 Top Recommendations:`);
            this.results.recommendations.slice(0, 5).forEach(rec => {
                console.log(`  • ${rec}`);
            });
        }
        
        console.log('\n📄 Detailed report saved to: sitemap-health-report.json');
    }

    async generateReport() {
        const report = {
            ...this.results,
            generated_by: 'Sitemap Health Check Tool v1.0',
            site: 'elevateforhumanity.org'
        };
        
        fs.writeFileSync('sitemap-health-report.json', JSON.stringify(report, null, 2));
    }

    // Helper methods
    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.request(url, {
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run health check if called directly
if (require.main === module) {
    const checker = new SitemapHealthChecker();
    checker.runHealthCheck().catch(console.error);
}

module.exports = SitemapHealthChecker;