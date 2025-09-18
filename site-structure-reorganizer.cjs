#!/usr/bin/env node

/**
 * SITE STRUCTURE REORGANIZER
 * Creates clean, logical site structure
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  SITE STRUCTURE REORGANIZER STARTING...');
console.log('='.repeat(60));

let reorganizeCount = 0;
const reorganizeLog = [];

// Define the clean site structure
const cleanStructure = {
  'core-pages': [
    'index.html',
    'hub.html',
    'about.html',
    'programs.html',
    'veterans.html',
    'connect.html',
    'student-portal.html',
    'lms-integration.html',
    'impact.html',
    'calendar.html',
    'eligibility-check.html'
  ],
  'compliance-pages': [
    'policies/eo.html',
    'policies/grievance.html',
    'policies/veterans.html',
    'policies/accessibility.html'
  ],
  'admin-pages': [
    'admin-dashboard.html',
    'admin-approvals-dashboard.html'
  ],
  'remove-directories': [
    'sites/',
    'deploy/',
    'durable-deploy/',
    'data/samples/',
    'docs/examples/',
    'tests/e2e/'
  ],
  'remove-files': [
    'blog.html',
    'partner-marketplace.html',
    'sister-sites.html',
    'kingdom-konnect.html',
    'rise-forward.html',
    'serene-comfort-care.html',
    'urban-build-crew.html'
  ]
};

// Remove unnecessary directories
function removeUnnecessaryDirectories() {
  console.log('🗑️  Removing unnecessary directories...');
  
  cleanStructure['remove-directories'].forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        reorganizeCount++;
        reorganizeLog.push(`✅ Removed directory: ${dir}`);
      } catch (error) {
        reorganizeLog.push(`❌ Failed to remove directory ${dir}: ${error.message}`);
      }
    }
  });
}

// Remove unnecessary files
function removeUnnecessaryFiles() {
  console.log('🗑️  Removing unnecessary files...');
  
  cleanStructure['remove-files'].forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        reorganizeCount++;
        reorganizeLog.push(`✅ Removed file: ${file}`);
      } catch (error) {
        reorganizeLog.push(`❌ Failed to remove file ${file}: ${error.message}`);
      }
    }
  });
}

// Create proper navigation structure
function createNavigationStructure() {
  console.log('🧭 Creating proper navigation structure...');
  
  const navigationConfig = {
    mainNav: [
      { name: 'Home', url: '/hub.html' },
      { name: 'Programs', url: '/programs.html' },
      { name: 'Veterans', url: '/veterans.html' },
      { name: 'About', url: '/about.html' },
      { name: 'Impact', url: '/impact.html' },
      { name: 'Contact', url: '/connect.html' }
    ],
    studentNav: [
      { name: 'Student Portal', url: '/student-portal.html' },
      { name: 'Learning Management', url: '/lms-integration.html' },
      { name: 'Program Calendar', url: '/calendar.html' },
      { name: 'Check Eligibility', url: '/eligibility-check.html' }
    ],
    complianceNav: [
      { name: 'Equal Opportunity', url: '/policies/eo.html' },
      { name: 'Grievance Procedures', url: '/policies/grievance.html' },
      { name: 'Veterans Priority', url: '/policies/veterans.html' },
      { name: 'Accessibility', url: '/policies/accessibility.html' }
    ]
  };
  
  fs.writeFileSync('navigation-config.json', JSON.stringify(navigationConfig, null, 2));
  reorganizeCount++;
  reorganizeLog.push(`✅ Created navigation configuration`);
}

// Update unified navigation
function updateUnifiedNavigation() {
  console.log('🔗 Updating unified navigation...');
  
  const unifiedNavContent = `
// Unified Navigation System v3.0
// Clean, WIOA-focused navigation structure

const navigationConfig = {
  brand: {
    name: "Elevate for Humanity",
    logo: "/images/efh-logo.png",
    url: "/hub.html"
  },
  mainNav: [
    { name: "Home", url: "/hub.html" },
    { name: "Programs", url: "/programs.html" },
    { name: "Veterans", url: "/veterans.html" },
    { name: "About", url: "/about.html" },
    { name: "Impact", url: "/impact.html" },
    { name: "Contact", url: "/connect.html" }
  ],
  ctaButton: {
    text: "Check Eligibility",
    url: "/eligibility-check.html",
    style: "primary"
  },
  footer: {
    sections: [
      {
        title: "Quick Links",
        links: [
          { name: "Student Portal", url: "/student-portal.html" },
          { name: "Learning Management", url: "/lms-integration.html" },
          { name: "Program Calendar", url: "/calendar.html" },
          { name: "Veterans Services", url: "/veterans.html" }
        ]
      },
      {
        title: "Compliance",
        links: [
          { name: "Equal Opportunity", url: "/policies/eo.html" },
          { name: "Grievance Procedures", url: "/policies/grievance.html" },
          { name: "Veterans Priority", url: "/policies/veterans.html" },
          { name: "Accessibility", url: "/policies/accessibility.html" }
        ]
      },
      {
        title: "Contact",
        content: [
          "Phone: (317) 555-WORK",
          "Email: info@elevateforhumanity.org",
          "Address: 7009 E 56th St, Indianapolis, IN 46226"
        ]
      }
    ]
  }
};

// Generate navigation HTML
function generateNavigation() {
  return \`
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <a href="\${navigationConfig.brand.url}" class="flex items-center">
              <img src="\${navigationConfig.brand.logo}" alt="\${navigationConfig.brand.name}" class="h-10 w-auto">
              <span class="ml-2 text-xl font-bold text-gray-900">\${navigationConfig.brand.name}</span>
            </a>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            \${navigationConfig.mainNav.map(item => 
              \`<a href="\${item.url}" class="text-gray-700 hover:text-blue-600 font-medium">\${item.name}</a>\`
            ).join('')}
          </div>
          <div>
            <a href="\${navigationConfig.ctaButton.url}" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              \${navigationConfig.ctaButton.text}
            </a>
          </div>
        </div>
      </div>
    </nav>
  \`;
}

// Generate footer HTML
function generateFooter() {
  return \`
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8">
          \${navigationConfig.footer.sections.map(section => \`
            <div>
              <h3 class="text-lg font-semibold mb-4">\${section.title}</h3>
              \${section.links ? 
                section.links.map(link => \`<a href="\${link.url}" class="block text-gray-300 hover:text-white mb-2">\${link.name}</a>\`).join('') :
                section.content.map(item => \`<p class="text-gray-300 mb-2">\${item}</p>\`).join('')
              }
            </div>
          \`).join('')}
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center">
          <p class="text-gray-300">© 2025 Elevate for Humanity. All rights reserved. WIOA Provider ID: 10000680</p>
        </div>
      </div>
    </footer>
  \`;
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', function() {
  const navContainer = document.getElementById('shared-nav');
  const footerContainer = document.getElementById('shared-footer');
  
  if (navContainer) {
    navContainer.innerHTML = generateNavigation();
  }
  
  if (footerContainer) {
    footerContainer.innerHTML = generateFooter();
  }
});
`;
  
  // Ensure js directory exists
  if (!fs.existsSync('js')) {
    fs.mkdirSync('js');
  }
  
  fs.writeFileSync('js/unified-navigation.js', unifiedNavContent);
  reorganizeCount++;
  reorganizeLog.push(`✅ Updated unified navigation system`);
}

// Create site map
function createSiteMap() {
  console.log('🗺️  Creating site map...');
  
  const siteMap = {
    "Core Pages": cleanStructure['core-pages'],
    "Compliance Pages": cleanStructure['compliance-pages'],
    "Admin Pages": cleanStructure['admin-pages'],
    "Production Deploy": [
      "production-deploy/public/index.html",
      "production-deploy/public/login.html",
      "production-deploy/public/portal/index.html",
      "production-deploy/public/lms/index.html",
      "production-deploy/public/enroll/index.html"
    ]
  };
  
  fs.writeFileSync('site-structure-map.json', JSON.stringify(siteMap, null, 2));
  reorganizeCount++;
  reorganizeLog.push(`✅ Created site structure map`);
}

// Run reorganization
console.log('🔧 Starting site structure reorganization...\n');

removeUnnecessaryDirectories();
removeUnnecessaryFiles();
createNavigationStructure();
updateUnifiedNavigation();
createSiteMap();

console.log('\n' + '='.repeat(60));
console.log('🎯 SITE STRUCTURE REORGANIZATION RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Total Changes: ${reorganizeCount}`);

console.log('\n📋 Reorganization Log:');
reorganizeLog.forEach(log => console.log(`  ${log}`));

// Save reorganization report
const reorganizeReport = {
  timestamp: new Date().toISOString(),
  totalChanges: reorganizeCount,
  reorganizeLog: reorganizeLog,
  cleanStructure: cleanStructure,
  status: 'SITE STRUCTURE REORGANIZED'
};

fs.writeFileSync('site-reorganization-report.json', JSON.stringify(reorganizeReport, null, 2));
console.log('\n📄 Reorganization report saved to: site-reorganization-report.json');

console.log('\n🏗️  SITE STRUCTURE REORGANIZATION COMPLETE');
console.log('='.repeat(60));