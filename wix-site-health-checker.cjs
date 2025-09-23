#!/usr/bin/env node
/* EFH Wix Site Health Checker
   - Validates all links and content
   - Checks for placeholder/generic information
   - Verifies sister sites and ecosystem links
   - Tests LMS and codebase store accessibility
   - Ensures compliance and contact information is correct
*/

const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

// Color output helpers
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    header: (msg) => console.log(`${colors.bright}${colors.cyan}\n=== ${msg} ===${colors.reset}`),
    dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`)
};

// Configuration
const config = {
    mainDomain: 'elevateforhumanity.org',
    redirectDomain: 'elevate4humanity.org',
    timeout: 10000,
    userAgent: 'EFH-HealthChecker/1.0',
    expectedContact: {
        phone: '(317) 555-WORK',
        email: 'elevateforhumanity@gmail.com',
        address: 'Indianapolis, Indiana'
    },
    sisterSites: [
        'learn.elevateforhumanity.org',
        'serenecomfortcare.com',
        'connect.elevateforhumanity.org',
        'gov.elevateforhumanity.org',
        'store.elevateforhumanity.org',
        'rise.elevateforhumanity.org'
    ],
    requiredPages: [
        '/',
        '/programs',
        '/programs/healthcare',
        '/programs/technology',
        '/programs/trades',
        '/programs/business',
        '/success-stories',
        '/employers',
        '/about',
        '/contact',
        '/apply',
        '/eligibility-check',
        '/student-portal',
        '/financial-aid',
        '/career-services'
    ],
    placeholderPatterns: [
        /lorem ipsum/i,
        /placeholder/i,
        /example\.com/i,
        /your-domain/i,
        /replace.*this/i,
        /todo:/i,
        /fixme:/i,
        /\[.*\]/g, // Markdown-style placeholders
        /{{.*}}/g, // Template placeholders
        /sample.*text/i,
        /dummy.*content/i,
        /test.*data/i
    ],
    requiredContent: [
        'WIOA',
        'workforce development',
        'job placement',
        'free training',
        'Equal Opportunity',
        'Veterans Priority',
        'elevateforhumanity.org',
        'Indiana'
    ]
};

// HTTP request helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': config.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                ...options.headers
            },
            timeout: config.timeout
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    url: url
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.setTimeout(config.timeout);
        req.end();
    });
}

// Extract links from HTML
function extractLinks(html, baseUrl) {
    const links = new Set();
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
        try {
            const href = match[1];
            if (href.startsWith('http')) {
                links.add(href);
            } else if (href.startsWith('/')) {
                links.add(new URL(href, baseUrl).toString());
            } else if (!href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                links.add(new URL(href, baseUrl).toString());
            }
        } catch (e) {
            // Invalid URL, skip
        }
    }
    
    return Array.from(links);
}

// Check for placeholder content
function checkPlaceholders(content, url) {
    const issues = [];
    
    config.placeholderPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            issues.push(`Placeholder pattern found: ${matches[0]}`);
        }
    });
    
    return issues;
}

// Check for required content
function checkRequiredContent(content, url) {
    const missing = [];
    
    config.requiredContent.forEach(required => {
        if (!content.toLowerCase().includes(required.toLowerCase())) {
            missing.push(required);
        }
    });
    
    return missing;
}

// Validate contact information
function validateContactInfo(content) {
    const issues = [];
    
    if (!content.includes(config.expectedContact.phone)) {
        issues.push(`Expected phone number ${config.expectedContact.phone} not found`);
    }
    
    if (!content.includes(config.expectedContact.email)) {
        issues.push(`Expected email ${config.expectedContact.email} not found`);
    }
    
    if (!content.includes(config.expectedContact.address)) {
        issues.push(`Expected address reference ${config.expectedContact.address} not found`);
    }
    
    return issues;
}

// Check SSL certificate
async function checkSSL(domain) {
    try {
        const response = await makeRequest(`https://${domain}/`);
        return {
            valid: response.statusCode < 400,
            statusCode: response.statusCode
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}

// Main health check function
async function runHealthCheck() {
    log.header('EFH Wix Site Health Check Starting');
    
    const results = {
        domains: {},
        pages: {},
        links: {},
        sisterSites: {},
        content: {},
        overall: { passed: 0, failed: 0, warnings: 0 }
    };

    // 1. Check main domains
    log.header('Domain Health Check');
    
    for (const domain of [config.mainDomain, config.redirectDomain]) {
        log.info(`Checking domain: ${domain}`);
        
        try {
            const sslCheck = await checkSSL(domain);
            const response = await makeRequest(`https://${domain}/`);
            
            results.domains[domain] = {
                ssl: sslCheck.valid,
                statusCode: response.statusCode,
                accessible: response.statusCode < 400,
                responseTime: Date.now()
            };
            
            if (sslCheck.valid && response.statusCode < 400) {
                log.success(`${domain} - SSL valid, HTTP ${response.statusCode}`);
                results.overall.passed++;
            } else {
                log.error(`${domain} - SSL: ${sslCheck.valid}, HTTP: ${response.statusCode}`);
                results.overall.failed++;
            }
        } catch (error) {
            log.error(`${domain} - ${error.message}`);
            results.domains[domain] = { error: error.message };
            results.overall.failed++;
        }
    }

    // 2. Check required pages
    log.header('Page Content Validation');
    
    for (const page of config.requiredPages) {
        const url = `https://${config.mainDomain}${page}`;
        log.info(`Checking page: ${page}`);
        
        try {
            const response = await makeRequest(url);
            const content = response.body;
            
            // Check for placeholders
            const placeholderIssues = checkPlaceholders(content, url);
            
            // Check for required content
            const missingContent = checkRequiredContent(content, url);
            
            // Check contact info on contact page
            const contactIssues = page === '/contact' ? validateContactInfo(content) : [];
            
            results.pages[page] = {
                statusCode: response.statusCode,
                accessible: response.statusCode < 400,
                placeholderIssues,
                missingContent,
                contactIssues,
                contentLength: content.length
            };
            
            if (response.statusCode < 400 && placeholderIssues.length === 0 && missingContent.length === 0 && contactIssues.length === 0) {
                log.success(`${page} - Content validated`);
                results.overall.passed++;
            } else {
                if (response.statusCode >= 400) {
                    log.error(`${page} - HTTP ${response.statusCode}`);
                    results.overall.failed++;
                } else {
                    log.warning(`${page} - Content issues found`);
                    results.overall.warnings++;
                    
                    placeholderIssues.forEach(issue => log.dim(`  • ${issue}`));
                    missingContent.forEach(missing => log.dim(`  • Missing: ${missing}`));
                    contactIssues.forEach(issue => log.dim(`  • Contact: ${issue}`));
                }
            }
        } catch (error) {
            log.error(`${page} - ${error.message}`);
            results.pages[page] = { error: error.message };
            results.overall.failed++;
        }
    }

    // 3. Check sister sites
    log.header('Sister Sites Health Check');
    
    for (const site of config.sisterSites) {
        log.info(`Checking sister site: ${site}`);
        
        try {
            const response = await makeRequest(`https://${site}/`);
            
            results.sisterSites[site] = {
                statusCode: response.statusCode,
                accessible: response.statusCode < 400
            };
            
            if (response.statusCode < 400) {
                log.success(`${site} - Accessible`);
                results.overall.passed++;
            } else {
                log.warning(`${site} - HTTP ${response.statusCode} (may be under development)`);
                results.overall.warnings++;
            }
        } catch (error) {
            log.warning(`${site} - ${error.message} (may be under development)`);
            results.sisterSites[site] = { error: error.message };
            results.overall.warnings++;
        }
    }

    // 4. Check internal links on homepage
    log.header('Internal Links Validation');
    
    try {
        const homepageResponse = await makeRequest(`https://${config.mainDomain}/`);
        const links = extractLinks(homepageResponse.body, `https://${config.mainDomain}`);
        const internalLinks = links.filter(link => link.includes(config.mainDomain));
        
        log.info(`Found ${internalLinks.length} internal links to check`);
        
        for (const link of internalLinks.slice(0, 20)) { // Limit to first 20 links
            try {
                const response = await makeRequest(link);
                
                results.links[link] = {
                    statusCode: response.statusCode,
                    accessible: response.statusCode < 400
                };
                
                if (response.statusCode < 400) {
                    log.success(`Link OK: ${link}`);
                    results.overall.passed++;
                } else {
                    log.error(`Link broken: ${link} - HTTP ${response.statusCode}`);
                    results.overall.failed++;
                }
            } catch (error) {
                log.error(`Link error: ${link} - ${error.message}`);
                results.links[link] = { error: error.message };
                results.overall.failed++;
            }
        }
    } catch (error) {
        log.error(`Could not check internal links: ${error.message}`);
        results.overall.failed++;
    }

    // 5. Generate summary report
    log.header('Health Check Summary');
    
    const total = results.overall.passed + results.overall.failed + results.overall.warnings;
    const passRate = total > 0 ? Math.round((results.overall.passed / total) * 100) : 0;
    
    log.info(`Total Checks: ${total}`);
    log.success(`Passed: ${results.overall.passed}`);
    log.warning(`Warnings: ${results.overall.warnings}`);
    log.error(`Failed: ${results.overall.failed}`);
    log.info(`Pass Rate: ${passRate}%`);
    
    // Overall health status
    if (results.overall.failed === 0 && results.overall.warnings <= 2) {
        log.success('🎉 Site health is EXCELLENT - Ready for production!');
    } else if (results.overall.failed <= 2 && passRate >= 80) {
        log.warning('⚠️  Site health is GOOD - Minor issues to address');
    } else {
        log.error('🚨 Site health needs ATTENTION - Critical issues found');
    }

    // Save detailed report
    const reportPath = './wix-health-check-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log.info(`Detailed report saved to: ${reportPath}`);
    
    return results;
}

// Specific content validation checks
async function validateSpecificContent() {
    log.header('Specific Content Validation');
    
    const checks = [
        {
            name: 'WIOA Compliance Language',
            url: `https://${config.mainDomain}/`,
            required: ['Equal Opportunity Is the Law', 'Veterans Priority', 'WIOA']
        },
        {
            name: 'Contact Information',
            url: `https://${config.mainDomain}/contact`,
            required: [config.expectedContact.phone, config.expectedContact.email]
        },
        {
            name: 'Program Information',
            url: `https://${config.mainDomain}/programs`,
            required: ['Healthcare Training', 'Technology Bootcamp', 'Skilled Trades', 'Business']
        },
        {
            name: 'Success Metrics',
            url: `https://${config.mainDomain}/`,
            required: ['98%', 'job placement', '10,000+', 'graduates']
        }
    ];
    
    for (const check of checks) {
        log.info(`Validating: ${check.name}`);
        
        try {
            const response = await makeRequest(check.url);
            const content = response.body.toLowerCase();
            
            const missing = check.required.filter(item => !content.includes(item.toLowerCase()));
            
            if (missing.length === 0) {
                log.success(`${check.name} - All required content found`);
            } else {
                log.error(`${check.name} - Missing: ${missing.join(', ')}`);
            }
        } catch (error) {
            log.error(`${check.name} - Could not validate: ${error.message}`);
        }
    }
}

// Run the health check
async function main() {
    try {
        await runHealthCheck();
        await validateSpecificContent();
        
        log.header('Health Check Complete');
        log.info('Review the detailed report for specific issues and recommendations.');
        
    } catch (error) {
        log.error(`Health check failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module or run directly
if (require.main === module) {
    main();
}

module.exports = { runHealthCheck, validateSpecificContent, config };