
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
  return `
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <a href="${navigationConfig.brand.url}" class="flex items-center">
              <img src="${navigationConfig.brand.logo}" alt="${navigationConfig.brand.name}" class="h-10 w-auto">
              <span class="ml-2 text-xl font-bold text-gray-900">${navigationConfig.brand.name}</span>
            </a>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            ${navigationConfig.mainNav.map(item => 
              `<a href="${item.url}" class="text-gray-700 hover:text-blue-600 font-medium">${item.name}</a>`
            ).join('')}
          </div>
          <div>
            <a href="${navigationConfig.ctaButton.url}" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              ${navigationConfig.ctaButton.text}
            </a>
          </div>
        </div>
      </div>
    </nav>
  `;
}

// Generate footer HTML
function generateFooter() {
  return `
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8">
          ${navigationConfig.footer.sections.map(section => `
            <div>
              <h3 class="text-lg font-semibold mb-4">${section.title}</h3>
              ${section.links ? 
                section.links.map(link => `<a href="${link.url}" class="block text-gray-300 hover:text-white mb-2">${link.name}</a>`).join('') :
                section.content.map(item => `<p class="text-gray-300 mb-2">${item}</p>`).join('')
              }
            </div>
          `).join('')}
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center">
          <p class="text-gray-300">© 2025 Elevate for Humanity. All rights reserved. WIOA Provider ID: 10000680</p>
        </div>
      </div>
    </footer>
  `;
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
