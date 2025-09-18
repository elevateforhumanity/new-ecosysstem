#!/usr/bin/env node

/**
 * 🕷️ CRAWL HEALTH CHECK TOOL
 * Comprehensive site crawling and health analysis for elevateforhumanity.org
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class CrawlHealthChecker {
    constructor() {
        this.baseUrl = 'https://elevateforhumanity.org';
        this.visited = new Set();
        this.queue = [];
        this.results = {
            timestamp: new Date().toISOString(),
            crawl_summary: {
                pages_crawled: 0,
                total_links: 0,
                internal_links: 0,
                external_links: 0,
                broken_links: 0,
                redirect_chains: 0,
                crawl_errors: 0
            },
            pages: [],
            broken_links: [],
            redirect_chains: [],
            external_links: [],
            seo_issues: [],
            performance_issues: [],
            accessibility_issues: [],
            recommendations: []
        };
        
        this.maxPages = 50; // Limit crawl depth
        this.maxDepth = 3;
        this.requestDelay = 500; // ms between requests
        
        // Starting URLs
        this.seedUrls = [
            '/',
            '/hub.html',
            '/about.html',
            '/programs.html',
            '/connect.html',
            '/student-portal.html',
            '/veterans.html',
            '/impact.html',
            '/calendar.html',
            '/eligibility-check.html',
            '/browser-health-check.html',
            '/seo-health-dashboard.html'
        ];
    }

    async runCrawlHealthCheck() {
        console.log('🕷️ CRAWL HEALTH CHECK STARTING...');
        console.log('============================================================');
        console.log(`🎯 Target: ${this.baseUrl}`);
        console.log(`📊 Max pages: ${this.maxPages}`);
        console.log(`🔍 Max depth: ${this.maxDepth}`);
        console.log('');
        
        try {
            await this.initializeCrawl();
            await this.crawlSite();
            await this.analyzeCrawlResults();
            await this.generateRecommendations();
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Crawl health check failed:', error.message);
            this.results.crawl_summary.crawl_errors++;
        }
        
        console.log('\n🕷️ CRAWL HEALTH CHECK COMPLETE');
        console.log('============================================================');
        this.displaySummary();
    }

    async initializeCrawl() {
        console.log('🚀 Initializing crawl...');
        
        // Add seed URLs to queue
        for (const url of this.seedUrls) {
            this.queue.push({
                url: url,
                fullUrl: url === '/' ? this.baseUrl : `${this.baseUrl}${url}`,
                depth: 0,
                referrer: null
            });
        }
        
        console.log(`  📋 Added ${this.queue.length} seed URLs to crawl queue`);
    }

    async crawlSite() {
        console.log('🔍 Starting site crawl...');
        
        while (this.queue.length > 0 && this.results.crawl_summary.pages_crawled < this.maxPages) {
            const item = this.queue.shift();
            
            if (this.visited.has(item.fullUrl) || item.depth > this.maxDepth) {
                continue;
            }
            
            await this.crawlPage(item);
            await this.delay(this.requestDelay);
        }
        
        console.log(`  ✅ Crawled ${this.results.crawl_summary.pages_crawled} pages`);
    }

    async crawlPage(item) {
        try {
            console.log(`  🔍 Crawling: ${item.url} (depth: ${item.depth})`);
            
            this.visited.add(item.fullUrl);
            const startTime = Date.now();
            
            const response = await this.makeRequest(item.fullUrl, { 
                followRedirects: true,
                maxRedirects: 5 
            });
            
            const loadTime = Date.now() - startTime;
            
            const pageData = {
                url: item.url,
                full_url: item.fullUrl,
                depth: item.depth,
                referrer: item.referrer,
                status_code: response.statusCode,
                load_time: loadTime,
                content_length: response.headers['content-length'] || 0,
                content_type: response.headers['content-type'] || '',
                last_modified: response.headers['last-modified'] || '',
                cache_control: response.headers['cache-control'] || '',
                links_found: [],
                seo_data: {},
                issues: []
            };
            
            // Analyze page content if HTML
            if (response.data && response.headers['content-type']?.includes('text/html')) {
                await this.analyzePage(pageData, response.data, item.depth);
            }
            
            // Check for performance issues
            this.checkPerformance(pageData, loadTime);
            
            this.results.pages.push(pageData);
            this.results.crawl_summary.pages_crawled++;
            
        } catch (error) {
            console.log(`    ❌ Error crawling ${item.url}: ${error.message}`);
            
            this.results.broken_links.push({
                url: item.url,
                full_url: item.fullUrl,
                referrer: item.referrer,
                error: error.message,
                depth: item.depth
            });
            
            this.results.crawl_summary.broken_links++;
            this.results.crawl_summary.crawl_errors++;
        }
    }

    async analyzePage(pageData, html, depth) {
        // Extract and analyze links
        const links = this.extractLinks(html, pageData.full_url);
        pageData.links_found = links;
        
        // Add internal links to crawl queue
        if (depth < this.maxDepth) {
            for (const link of links) {
                if (link.type === 'internal' && !this.visited.has(link.full_url)) {
                    this.queue.push({
                        url: link.url,
                        fullUrl: link.full_url,
                        depth: depth + 1,
                        referrer: pageData.url
                    });
                }
            }
        }
        
        // SEO analysis
        this.analyzeSEO(pageData, html);
        
        // Accessibility analysis
        this.analyzeAccessibility(pageData, html);
        
        // Update link counters
        this.results.crawl_summary.total_links += links.length;
        this.results.crawl_summary.internal_links += links.filter(l => l.type === 'internal').length;
        this.results.crawl_summary.external_links += links.filter(l => l.type === 'external').length;
    }

    extractLinks(html, baseUrl) {
        const links = [];
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
        let match;
        
        while ((match = linkRegex.exec(html)) !== null) {
            const href = match[1];
            
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                continue;
            }
            
            try {
                const url = new URL(href, baseUrl);
                const isInternal = url.hostname === new URL(this.baseUrl).hostname;
                
                const linkData = {
                    url: href,
                    full_url: url.href,
                    type: isInternal ? 'internal' : 'external',
                    text: this.extractLinkText(match[0], html, match.index)
                };
                
                links.push(linkData);
                
                if (!isInternal) {
                    this.results.external_links.push({
                        ...linkData,
                        found_on: baseUrl
                    });
                }
                
            } catch (error) {
                // Invalid URL
                pageData.issues.push(`Invalid link: ${href}`);
            }
        }
        
        return links;
    }

    extractLinkText(linkHtml, fullHtml, index) {
        const closingTagIndex = fullHtml.indexOf('</a>', index);
        if (closingTagIndex === -1) return '';
        
        const linkContent = fullHtml.substring(index + linkHtml.length, closingTagIndex);
        return linkContent.replace(/<[^>]*>/g, '').trim().substring(0, 50);
    }

    analyzeSEO(pageData, html) {
        const seoData = {};
        const issues = [];
        
        // Title tag
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            seoData.title = titleMatch[1].trim();
            if (seoData.title.length < 30) {
                issues.push('Title tag too short (< 30 characters)');
            } else if (seoData.title.length > 60) {
                issues.push('Title tag too long (> 60 characters)');
            }
        } else {
            issues.push('Missing title tag');
        }
        
        // Meta description
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        if (metaDescMatch) {
            seoData.meta_description = metaDescMatch[1].trim();
            if (seoData.meta_description.length < 120) {
                issues.push('Meta description too short (< 120 characters)');
            } else if (seoData.meta_description.length > 160) {
                issues.push('Meta description too long (> 160 characters)');
            }
        } else {
            issues.push('Missing meta description');
        }
        
        // H1 tags
        const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);
        if (h1Matches) {
            seoData.h1_count = h1Matches.length;
            if (h1Matches.length > 1) {
                issues.push('Multiple H1 tags found');
            }
        } else {
            issues.push('Missing H1 tag');
        }
        
        // Canonical URL
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
        if (canonicalMatch) {
            seoData.canonical = canonicalMatch[1];
        } else {
            issues.push('Missing canonical URL');
        }
        
        // Open Graph tags
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        
        seoData.open_graph = {
            title: ogTitleMatch ? ogTitleMatch[1] : null,
            description: ogDescMatch ? ogDescMatch[1] : null,
            image: ogImageMatch ? ogImageMatch[1] : null
        };
        
        if (!ogTitleMatch || !ogDescMatch || !ogImageMatch) {
            issues.push('Incomplete Open Graph tags');
        }
        
        pageData.seo_data = seoData;
        pageData.issues.push(...issues);
        
        // Add to global SEO issues
        issues.forEach(issue => {
            this.results.seo_issues.push({
                page: pageData.url,
                issue: issue
            });
        });
    }

    analyzeAccessibility(pageData, html) {
        const issues = [];
        
        // Check for alt attributes on images
        const imgMatches = html.match(/<img[^>]*>/gi);
        if (imgMatches) {
            imgMatches.forEach(img => {
                if (!img.includes('alt=')) {
                    issues.push('Image missing alt attribute');
                }
            });
        }
        
        // Check for form labels
        const inputMatches = html.match(/<input[^>]*>/gi);
        if (inputMatches) {
            inputMatches.forEach(input => {
                if (input.includes('type="text"') || input.includes('type="email"')) {
                    // This is a simplified check - in reality, you'd need to check for associated labels
                    if (!html.includes('label')) {
                        issues.push('Form input may be missing label');
                    }
                }
            });
        }
        
        // Check for heading hierarchy
        const headings = html.match(/<h[1-6][^>]*>/gi);
        if (headings) {
            const levels = headings.map(h => parseInt(h.match(/h([1-6])/)[1]));
            for (let i = 1; i < levels.length; i++) {
                if (levels[i] > levels[i-1] + 1) {
                    issues.push('Heading hierarchy skip detected');
                    break;
                }
            }
        }
        
        // Add to global accessibility issues
        issues.forEach(issue => {
            this.results.accessibility_issues.push({
                page: pageData.url,
                issue: issue
            });
        });
        
        pageData.issues.push(...issues);
    }

    checkPerformance(pageData, loadTime) {
        const issues = [];
        
        if (loadTime > 3000) {
            issues.push('Slow page load time (> 3 seconds)');
            this.results.performance_issues.push({
                page: pageData.url,
                issue: `Slow load time: ${loadTime}ms`,
                load_time: loadTime
            });
        }
        
        if (pageData.content_length > 1000000) { // 1MB
            issues.push('Large page size (> 1MB)');
            this.results.performance_issues.push({
                page: pageData.url,
                issue: `Large page size: ${Math.round(pageData.content_length / 1024)}KB`,
                size: pageData.content_length
            });
        }
        
        pageData.issues.push(...issues);
    }

    async analyzeCrawlResults() {
        console.log('📊 Analyzing crawl results...');
        
        // Check for redirect chains
        for (const page of this.results.pages) {
            if (page.status_code >= 300 && page.status_code < 400) {
                this.results.redirect_chains.push({
                    url: page.url,
                    status_code: page.status_code,
                    referrer: page.referrer
                });
                this.results.crawl_summary.redirect_chains++;
            }
        }
        
        // Analyze link patterns
        const linkCounts = {};
        for (const page of this.results.pages) {
            for (const link of page.links_found) {
                linkCounts[link.full_url] = (linkCounts[link.full_url] || 0) + 1;
            }
        }
        
        // Find most linked pages
        const popularPages = Object.entries(linkCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        console.log('  📈 Most linked pages:');
        popularPages.forEach(([url, count]) => {
            console.log(`    ${count}x - ${url}`);
        });
    }

    generateRecommendations() {
        console.log('💡 Generating recommendations...');
        
        const recommendations = [];
        
        // SEO recommendations
        if (this.results.seo_issues.length > 0) {
            recommendations.push(`Fix ${this.results.seo_issues.length} SEO issues across crawled pages`);
        }
        
        // Performance recommendations
        if (this.results.performance_issues.length > 0) {
            recommendations.push(`Address ${this.results.performance_issues.length} performance issues`);
        }
        
        // Accessibility recommendations
        if (this.results.accessibility_issues.length > 0) {
            recommendations.push(`Improve accessibility: ${this.results.accessibility_issues.length} issues found`);
        }
        
        // Broken links
        if (this.results.crawl_summary.broken_links > 0) {
            recommendations.push(`Fix ${this.results.crawl_summary.broken_links} broken links`);
        }
        
        // Redirect chains
        if (this.results.crawl_summary.redirect_chains > 0) {
            recommendations.push(`Optimize ${this.results.crawl_summary.redirect_chains} redirect chains`);
        }
        
        // General recommendations
        recommendations.push('Submit updated sitemap to search engines');
        recommendations.push('Monitor crawl errors in Google Search Console');
        recommendations.push('Regular crawl health checks (monthly)');
        recommendations.push('Implement structured data markup');
        recommendations.push('Optimize images with proper alt text');
        
        this.results.recommendations = recommendations;
        
        console.log(`  📋 Generated ${recommendations.length} recommendations`);
    }

    displaySummary() {
        console.log('\n📊 CRAWL HEALTH SUMMARY:');
        console.log('============================================================');
        console.log(`🕷️ Pages Crawled: ${this.results.crawl_summary.pages_crawled}`);
        console.log(`🔗 Total Links: ${this.results.crawl_summary.total_links}`);
        console.log(`🏠 Internal Links: ${this.results.crawl_summary.internal_links}`);
        console.log(`🌐 External Links: ${this.results.crawl_summary.external_links}`);
        console.log(`❌ Broken Links: ${this.results.crawl_summary.broken_links}`);
        console.log(`🔄 Redirect Chains: ${this.results.crawl_summary.redirect_chains}`);
        console.log(`⚠️ Crawl Errors: ${this.results.crawl_summary.crawl_errors}`);
        
        console.log('\n📋 Issue Summary:');
        console.log(`🔍 SEO Issues: ${this.results.seo_issues.length}`);
        console.log(`⚡ Performance Issues: ${this.results.performance_issues.length}`);
        console.log(`♿ Accessibility Issues: ${this.results.accessibility_issues.length}`);
        
        if (this.results.broken_links.length > 0) {
            console.log('\n❌ Broken Links Found:');
            this.results.broken_links.slice(0, 5).forEach(link => {
                console.log(`  - ${link.url} (${link.error})`);
            });
        }
        
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 Top Recommendations:');
            this.results.recommendations.slice(0, 5).forEach(rec => {
                console.log(`  • ${rec}`);
            });
        }
        
        console.log('\n📄 Detailed report saved to: crawl-health-report.json');
    }

    async generateReport() {
        const report = {
            ...this.results,
            generated_by: 'Crawl Health Check Tool v1.0',
            site: 'elevateforhumanity.org',
            crawl_settings: {
                max_pages: this.maxPages,
                max_depth: this.maxDepth,
                request_delay: this.requestDelay
            }
        };
        
        fs.writeFileSync('crawl-health-report.json', JSON.stringify(report, null, 2));
    }

    // Helper methods
    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.request(url, {
                method: 'GET',
                timeout: 15000,
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

// Run crawl health check if called directly
if (require.main === module) {
    const checker = new CrawlHealthChecker();
    checker.runCrawlHealthCheck().catch(console.error);
}

module.exports = CrawlHealthChecker;