#!/usr/bin/env node
/* Wix Content Validator
   - Validates the created Wix homepage content
   - Checks for placeholder text and generic information
   - Ensures all required information is present
   - Validates sister sites and ecosystem links
*/

const fs = require('fs');
const path = require('path');

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

// Validation configuration
const validation = {
    requiredContent: [
        'Elevate for Humanity',
        'WIOA',
        'workforce development',
        'job placement',
        'free training',
        'Equal Opportunity',
        'Veterans Priority',
        'elevateforhumanity.org',
        'Indiana',
        '98%',
        '10,000+',
        '$75K',
        'Healthcare Training',
        'Technology Bootcamp',
        'Skilled Trades',
        'Business & Leadership',
        '(317) 555-WORK',
        'elevateforhumanity@gmail.com'
    ],
    sisterSites: [
        'learn.elevateforhumanity.org',
        'serenecomfortcare.com',
        'connect.elevateforhumanity.org',
        'gov.elevateforhumanity.org',
        'store.elevateforhumanity.org',
        'rise.elevateforhumanity.org'
    ],
    placeholderPatterns: [
        /lorem ipsum/i,
        /placeholder/i,
        /example\.com/i,
        /your-domain/i,
        /replace.*this/i,
        /todo:/i,
        /fixme:/i,
        /\[.*\]/g,
        /{{.*}}/g,
        /sample.*text/i,
        /dummy.*content/i,
        /test.*data/i,
        /coming soon/i,
        /under construction/i,
        /page not found/i
    ],
    requiredSections: [
        'hero',
        'programs',
        'success-stories',
        'sister-sites',
        'cta-section',
        'footer',
        'compliance'
    ],
    requiredLinks: [
        '/programs',
        '/success-stories',
        '/employers',
        '/about',
        '/contact',
        '/apply',
        '/eligibility-check',
        '/student-portal'
    ],
    lmsFeatures: [
        '24/7 AI Tutor',
        'Federal Compliance Tracking',
        '87% completion rate',
        '98% job placement',
        'LearnWorlds'
    ],
    codebaseStoreFeatures: [
        '$500K-$2M',
        'Enterprise licensing',
        'DRM Protection',
        'Multi-Tier Licensing',
        'API integration'
    ]
};

// Read and validate HTML file
function validateHTMLFile(filePath) {
    log.header(`Validating HTML File: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        log.error(`File not found: ${filePath}`);
        return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
        passed: 0,
        failed: 0,
        warnings: 0,
        issues: []
    };
    
    // Check for required content
    log.info('Checking required content...');
    validation.requiredContent.forEach(required => {
        if (content.includes(required)) {
            log.success(`Found: ${required}`);
            results.passed++;
        } else {
            log.error(`Missing: ${required}`);
            results.failed++;
            results.issues.push(`Missing required content: ${required}`);
        }
    });
    
    // Check for placeholder patterns
    log.info('Checking for placeholder content...');
    let placeholderFound = false;
    validation.placeholderPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            log.error(`Placeholder found: ${matches[0]}`);
            results.failed++;
            results.issues.push(`Placeholder content: ${matches[0]}`);
            placeholderFound = true;
        }
    });
    
    if (!placeholderFound) {
        log.success('No placeholder content found');
        results.passed++;
    }
    
    // Check for sister sites
    log.info('Checking sister sites integration...');
    validation.sisterSites.forEach(site => {
        if (content.includes(site)) {
            log.success(`Sister site linked: ${site}`);
            results.passed++;
        } else {
            log.warning(`Sister site not found: ${site}`);
            results.warnings++;
        }
    });
    
    // Check for required sections
    log.info('Checking required sections...');
    validation.requiredSections.forEach(section => {
        if (content.includes(section) || content.includes(section.replace('-', '_'))) {
            log.success(`Section found: ${section}`);
            results.passed++;
        } else {
            log.warning(`Section missing: ${section}`);
            results.warnings++;
        }
    });
    
    // Check for LMS features
    log.info('Checking LMS features...');
    validation.lmsFeatures.forEach(feature => {
        if (content.includes(feature)) {
            log.success(`LMS feature: ${feature}`);
            results.passed++;
        } else {
            log.warning(`LMS feature missing: ${feature}`);
            results.warnings++;
        }
    });
    
    // Check for codebase store features
    log.info('Checking codebase store features...');
    validation.codebaseStoreFeatures.forEach(feature => {
        if (content.includes(feature)) {
            log.success(`Codebase feature: ${feature}`);
            results.passed++;
        } else {
            log.warning(`Codebase feature missing: ${feature}`);
            results.warnings++;
        }
    });
    
    // Check HTML structure
    log.info('Checking HTML structure...');
    const structureChecks = [
        { name: 'DOCTYPE', pattern: /<!DOCTYPE html>/i },
        { name: 'HTML lang', pattern: /<html lang="en">/i },
        { name: 'Meta charset', pattern: /<meta charset="UTF-8">/i },
        { name: 'Meta viewport', pattern: /<meta name="viewport"/i },
        { name: 'Title tag', pattern: /<title>.*<\/title>/i },
        { name: 'Meta description', pattern: /<meta name="description"/i },
        { name: 'Structured data', pattern: /<script type="application\/ld\+json">/i }
    ];
    
    structureChecks.forEach(check => {
        if (content.match(check.pattern)) {
            log.success(`HTML structure: ${check.name}`);
            results.passed++;
        } else {
            log.error(`HTML structure missing: ${check.name}`);
            results.failed++;
            results.issues.push(`Missing HTML structure: ${check.name}`);
        }
    });
    
    return results;
}

// Validate routing configuration
function validateRoutingConfig() {
    log.header('Validating Routing Configuration');
    
    const configPath = './wix-routing-config.json';
    if (!fs.existsSync(configPath)) {
        log.error('Routing configuration file not found');
        return false;
    }
    
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Check main configuration
        if (config.siteConfig && config.siteConfig.primaryDomain === 'elevateforhumanity.org') {
            log.success('Primary domain configured correctly');
        } else {
            log.error('Primary domain configuration issue');
        }
        
        // Check sister sites
        if (config.sisterSites && Object.keys(config.sisterSites).length >= 6) {
            log.success(`Sister sites configured: ${Object.keys(config.sisterSites).length}`);
        } else {
            log.error('Sister sites configuration incomplete');
        }
        
        // Check LMS configuration
        if (config.sisterSites.learningPortal && config.sisterSites.learningPortal.features.length >= 8) {
            log.success('LMS configuration complete');
        } else {
            log.error('LMS configuration incomplete');
        }
        
        // Check codebase store
        if (config.sisterSites.codebaseStore && config.sisterSites.codebaseStore.valuation === '$500K-$2M') {
            log.success('Codebase store valuation configured');
        } else {
            log.error('Codebase store configuration incomplete');
        }
        
        return true;
    } catch (error) {
        log.error(`Error reading routing config: ${error.message}`);
        return false;
    }
}

// Validate integration guide
function validateIntegrationGuide() {
    log.header('Validating Integration Guide');
    
    const guidePath = './wix-integration-guide.md';
    if (!fs.existsSync(guidePath)) {
        log.error('Integration guide not found');
        return false;
    }
    
    const content = fs.readFileSync(guidePath, 'utf8');
    
    const requiredSections = [
        'Sister Sites Integration',
        'EFH Learning Portal',
        'Serene Comfort Care',
        'Community Connect',
        'Government Services Hub',
        'Codebase Store',
        'Rise Foundation Platform',
        'Federal Compliance Requirements',
        'SEO Optimization',
        'Conversion Optimization'
    ];
    
    let allSectionsFound = true;
    requiredSections.forEach(section => {
        if (content.includes(section)) {
            log.success(`Guide section: ${section}`);
        } else {
            log.error(`Guide section missing: ${section}`);
            allSectionsFound = false;
        }
    });
    
    return allSectionsFound;
}

// Main validation function
function runValidation() {
    log.header('Wix Content Validation Starting');
    
    const results = {
        htmlValidation: null,
        routingConfig: false,
        integrationGuide: false,
        overall: { passed: 0, failed: 0, warnings: 0 }
    };
    
    // Validate HTML file
    results.htmlValidation = validateHTMLFile('./wix-homepage-complete.html');
    if (results.htmlValidation) {
        results.overall.passed += results.htmlValidation.passed;
        results.overall.failed += results.htmlValidation.failed;
        results.overall.warnings += results.htmlValidation.warnings;
    }
    
    // Validate routing configuration
    results.routingConfig = validateRoutingConfig();
    if (results.routingConfig) {
        results.overall.passed += 5;
    } else {
        results.overall.failed += 5;
    }
    
    // Validate integration guide
    results.integrationGuide = validateIntegrationGuide();
    if (results.integrationGuide) {
        results.overall.passed += 5;
    } else {
        results.overall.failed += 5;
    }
    
    // Generate summary
    log.header('Validation Summary');
    
    const total = results.overall.passed + results.overall.failed + results.overall.warnings;
    const passRate = total > 0 ? Math.round((results.overall.passed / total) * 100) : 0;
    
    log.info(`Total Checks: ${total}`);
    log.success(`Passed: ${results.overall.passed}`);
    log.warning(`Warnings: ${results.overall.warnings}`);
    log.error(`Failed: ${results.overall.failed}`);
    log.info(`Pass Rate: ${passRate}%`);
    
    // Overall assessment
    if (results.overall.failed === 0 && results.overall.warnings <= 5) {
        log.success('🎉 Content validation PASSED - Ready for Wix implementation!');
    } else if (results.overall.failed <= 3 && passRate >= 85) {
        log.warning('⚠️  Content validation mostly PASSED - Minor issues to address');
    } else {
        log.error('🚨 Content validation FAILED - Critical issues need attention');
    }
    
    // Save detailed report
    const reportPath = './wix-content-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log.info(`Detailed report saved to: ${reportPath}`);
    
    // List specific issues if any
    if (results.htmlValidation && results.htmlValidation.issues.length > 0) {
        log.header('Issues to Address');
        results.htmlValidation.issues.forEach(issue => {
            log.dim(`• ${issue}`);
        });
    }
    
    return results;
}

// Run validation
if (require.main === module) {
    runValidation();
}

module.exports = { runValidation, validateHTMLFile, validateRoutingConfig, validateIntegrationGuide };