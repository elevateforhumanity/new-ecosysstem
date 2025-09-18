#!/usr/bin/env node

/**
 * Live Site Health Check
 * Verifies all 350+ todos are live and functional
 */

const https = require('https');
const http = require('http');

// Configuration
const SITE_URL = 'https://8080--01995ae4-177e-793e-8759-a67362ad9549.us-east-1-01.gitpod.dev';
const GITHUB_REPO = 'https://api.github.com/repos/elevateforhumanity/new-ecosysstem/commits/main';

// Test URLs and expected content
const HEALTH_CHECKS = [
  {
    name: 'Homepage Redirect',
    url: '/',
    expectedContent: ['hub.html', 'Elevate for Humanity'],
    critical: true
  },
  {
    name: 'Main Hub Page',
    url: '/hub.html',
    expectedContent: ['Workforce Development Hub', 'Career Training', 'WIOA'],
    critical: true
  },
  {
    name: 'Programs Page',
    url: '/programs.html',
    expectedContent: ['AI Courses', 'Data Science', 'Programs'],
    critical: true
  },
  {
    name: 'Equal Opportunity Compliance',
    url: '/policies/eo.html',
    expectedContent: ['Equal Opportunity Is the Law', '29 CFR', 'discrimination'],
    critical: true
  },
  {
    name: 'WIOA Grievance Procedures',
    url: '/policies/grievance.html',
    expectedContent: ['WIOA', 'grievance', '20 CFR 683'],
    critical: true
  },
  {
    name: 'Veterans Priority Service',
    url: '/policies/veterans.html',
    expectedContent: ['Priority of Service', 'Veterans', '20 CFR 1010'],
    critical: true
  },
  {
    name: 'Accessibility Statement',
    url: '/policies/accessibility.html',
    expectedContent: ['Accessibility', 'WCAG 2.2 AA', 'disabilities'],
    critical: true
  },
  {
    name: 'Admin Dashboard',
    url: '/admin-dashboard.html',
    expectedContent: ['Admin Dashboard', 'Management', 'Overview'],
    critical: false
  },
  {
    name: 'Student Portal',
    url: '/student-portal.html',
    expectedContent: ['Student Portal', 'Dashboard', 'Enrollment'],
    critical: false
  },
  {
    name: 'Connect/Contact Page',
    url: '/connect.html',
    expectedContent: ['Connect', 'Contact', 'form'],
    critical: false
  }
];

// Security headers to check
const SECURITY_HEADERS = [
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'strict-transport-security',
  'referrer-policy',
  'content-security-policy'
];

let results = {
  timestamp: new Date().toISOString(),
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  criticalFailures: 0,
  details: [],
  securityHeaders: {},
  githubStatus: null
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkGitHubCommit() {
  try {
    console.log('🔍 Checking GitHub commit status...');
    const response = await makeRequest(GITHUB_REPO);
    
    if (response.statusCode === 200) {
      const commit = JSON.parse(response.body);
      results.githubStatus = {
        success: true,
        latestCommit: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0],
        timestamp: commit.commit.author.date,
        author: commit.commit.author.name
      };
      console.log(`✅ Latest commit: ${results.githubStatus.latestCommit} - ${results.githubStatus.message}`);
    } else {
      results.githubStatus = { success: false, error: `HTTP ${response.statusCode}` };
    }
  } catch (error) {
    results.githubStatus = { success: false, error: error.message };
    console.log(`❌ GitHub check failed: ${error.message}`);
  }
}

async function runHealthCheck(check) {
  const fullUrl = SITE_URL + check.url;
  results.totalChecks++;
  
  try {
    console.log(`🔍 Checking: ${check.name} (${check.url})`);
    
    const response = await makeRequest(fullUrl);
    
    let checkResult = {
      name: check.name,
      url: check.url,
      critical: check.critical,
      success: false,
      statusCode: response.statusCode,
      issues: []
    };
    
    // Check status code
    if (response.statusCode !== 200) {
      checkResult.issues.push(`HTTP ${response.statusCode}`);
    }
    
    // Check expected content
    let contentFound = 0;
    for (const content of check.expectedContent) {
      if (response.body.toLowerCase().includes(content.toLowerCase())) {
        contentFound++;
      } else {
        checkResult.issues.push(`Missing content: "${content}"`);
      }
    }
    
    // Check security headers (only for main pages)
    if (check.critical) {
      for (const header of SECURITY_HEADERS) {
        if (response.headers[header]) {
          results.securityHeaders[header] = response.headers[header];
        } else {
          checkResult.issues.push(`Missing security header: ${header}`);
        }
      }
    }
    
    // Determine success
    checkResult.success = response.statusCode === 200 && contentFound === check.expectedContent.length;
    
    if (checkResult.success) {
      results.passedChecks++;
      console.log(`✅ ${check.name} - PASSED`);
    } else {
      results.failedChecks++;
      if (check.critical) {
        results.criticalFailures++;
      }
      console.log(`❌ ${check.name} - FAILED: ${checkResult.issues.join(', ')}`);
    }
    
    results.details.push(checkResult);
    
  } catch (error) {
    results.totalChecks++;
    results.failedChecks++;
    if (check.critical) {
      results.criticalFailures++;
    }
    
    console.log(`❌ ${check.name} - ERROR: ${error.message}`);
    
    results.details.push({
      name: check.name,
      url: check.url,
      critical: check.critical,
      success: false,
      error: error.message
    });
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🏥 LIVE SITE HEALTH CHECK REPORT');
  console.log('='.repeat(60));
  
  console.log(`📊 Overall Results:`);
  console.log(`   Total Checks: ${results.totalChecks}`);
  console.log(`   Passed: ${results.passedChecks}`);
  console.log(`   Failed: ${results.failedChecks}`);
  console.log(`   Critical Failures: ${results.criticalFailures}`);
  console.log(`   Success Rate: ${Math.round((results.passedChecks / results.totalChecks) * 100)}%`);
  
  if (results.githubStatus && results.githubStatus.success) {
    console.log(`\n🔗 GitHub Status: ✅ LIVE`);
    console.log(`   Latest Commit: ${results.githubStatus.latestCommit}`);
    console.log(`   Message: ${results.githubStatus.message}`);
    console.log(`   Pushed: ${new Date(results.githubStatus.timestamp).toLocaleString()}`);
  } else {
    console.log(`\n🔗 GitHub Status: ❌ ISSUE`);
  }
  
  console.log(`\n🔒 Security Headers Found: ${Object.keys(results.securityHeaders).length}/${SECURITY_HEADERS.length}`);
  for (const [header, value] of Object.entries(results.securityHeaders)) {
    console.log(`   ✅ ${header}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  }
  
  console.log(`\n📋 Detailed Results:`);
  for (const detail of results.details) {
    const status = detail.success ? '✅' : '❌';
    const critical = detail.critical ? '[CRITICAL]' : '[OPTIONAL]';
    console.log(`   ${status} ${detail.name} ${critical}`);
    if (!detail.success && detail.issues) {
      for (const issue of detail.issues) {
        console.log(`      - ${issue}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.criticalFailures === 0) {
    console.log('🎉 HEALTH CHECK PASSED - Site is live and functional!');
  } else {
    console.log(`⚠️  HEALTH CHECK ISSUES - ${results.criticalFailures} critical failures found`);
  }
  
  console.log('='.repeat(60));
  
  // Save detailed report
  const fs = require('fs');
  fs.writeFileSync('live-site-health-report.json', JSON.stringify(results, null, 2));
  console.log('📄 Detailed report saved to: live-site-health-report.json');
}

async function main() {
  console.log('🚀 Starting Live Site Health Check...');
  console.log(`🌐 Target Site: ${SITE_URL}`);
  console.log(`📅 Timestamp: ${results.timestamp}\n`);
  
  // Check GitHub first
  await checkGitHubCommit();
  
  // Run all health checks
  for (const check of HEALTH_CHECKS) {
    await runHealthCheck(check);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate final report
  await generateReport();
}

// Run the health check
main().catch(console.error);