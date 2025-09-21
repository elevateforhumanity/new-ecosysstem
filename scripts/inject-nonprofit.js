// scripts/inject-nonprofit.js
// Inject nonprofit organization details with structured data

import fs from "fs";
import path from "path";

const config = {
  outputDir: "dist",
  domain: process.env.DOMAIN || "elevate4humanity.org",
  
  // Organization details from environment variables
  org: {
    name: process.env.ORG_NAME || "Elevate for Humanity",
    legalName: process.env.ORG_LEGAL || "Elevate for Humanity, Inc.",
    type: process.env.ORG_TYPE || "501(c)(3) Nonprofit Organization",
    ein: process.env.ORG_EIN || "",
    email: process.env.ORG_EMAIL || "info@elevate4humanity.org",
    phone: process.env.ORG_PHONE || "",
    address: process.env.ORG_ADDR || "",
    founded: process.env.ORG_FOUNDED || "2020",
    mission: process.env.ORG_MISSION || "Empowering communities through workforce development and career advancement opportunities."
  }
};

/**
 * Generate nonprofit organization block HTML
 */
function generateNonprofitBlockHTML() {
  const baseUrl = `https://${config.domain}`;
  
  return `
<section class="nonprofit-organization">
  <div class="container">
    <div class="nonprofit-header">
      <h2>About ${config.org.name}</h2>
      <p class="nonprofit-subtitle">
        ${config.org.mission}
      </p>
    </div>
    
    <div class="nonprofit-content">
      <div class="org-details-grid">
        <div class="org-info-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"></path>
            </svg>
          </div>
          <h3>Organization Details</h3>
          <ul class="org-details-list">
            <li><strong>Legal Name:</strong> ${config.org.legalName}</li>
            <li><strong>Organization Type:</strong> ${config.org.type}</li>
            ${config.org.ein ? `<li><strong>EIN:</strong> ${config.org.ein}</li>` : ''}
            ${config.org.founded ? `<li><strong>Founded:</strong> ${config.org.founded}</li>` : ''}
          </ul>
        </div>
        
        <div class="org-info-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <h3>Contact Information</h3>
          <ul class="org-details-list">
            ${config.org.email ? `<li><strong>Email:</strong> <a href="mailto:${config.org.email}">${config.org.email}</a></li>` : ''}
            ${config.org.phone ? `<li><strong>Phone:</strong> <a href="tel:${config.org.phone}">${config.org.phone}</a></li>` : ''}
            ${config.org.address ? `<li><strong>Address:</strong> ${config.org.address}</li>` : ''}
            <li><strong>Website:</strong> <a href="${baseUrl}">${config.domain}</a></li>
          </ul>
        </div>
        
        <div class="org-info-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <h3>Certifications & Compliance</h3>
          <ul class="org-details-list">
            <li><strong>IRS Status:</strong> 501(c)(3) Tax-Exempt</li>
            <li><strong>WIOA Approved:</strong> Training Provider</li>
            <li><strong>State Licensed:</strong> Workforce Development</li>
            <li><strong>Compliance:</strong> DOE, DOL, DWD Ready</li>
          </ul>
        </div>
      </div>
      
      <div class="mission-statement">
        <h3>Our Mission</h3>
        <p class="mission-text">
          ${config.org.mission} We are committed to providing high-quality, accessible workforce 
          development programs that meet the evolving needs of both job seekers and employers in 
          today's dynamic economy.
        </p>
        
        <div class="impact-stats">
          <div class="impact-item">
            <div class="impact-number">1000+</div>
            <div class="impact-label">Lives Transformed</div>
          </div>
          <div class="impact-item">
            <div class="impact-number">95%</div>
            <div class="impact-label">Job Placement Rate</div>
          </div>
          <div class="impact-item">
            <div class="impact-number">50+</div>
            <div class="impact-label">Employer Partners</div>
          </div>
          <div class="impact-item">
            <div class="impact-number">24/7</div>
            <div class="impact-label">Student Support</div>
          </div>
        </div>
      </div>
      
      <div class="transparency-section">
        <h3>Transparency & Accountability</h3>
        <div class="transparency-grid">
          <div class="transparency-item">
            <h4>Financial Transparency</h4>
            <p>Annual financial reports and Form 990 filings are available upon request. We maintain the highest standards of fiscal responsibility.</p>
          </div>
          <div class="transparency-item">
            <h4>Program Outcomes</h4>
            <p>We track and report on all program outcomes, including employment rates, wage increases, and participant satisfaction.</p>
          </div>
          <div class="transparency-item">
            <h4>Board Governance</h4>
            <p>Our board of directors provides oversight and strategic guidance, ensuring mission alignment and organizational effectiveness.</p>
          </div>
          <div class="transparency-item">
            <h4>Community Impact</h4>
            <p>Regular community impact assessments demonstrate our commitment to measurable, positive change in the communities we serve.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .nonprofit-organization {
    padding: 4rem 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-top: 1px solid #cbd5e1;
  }
  
  .nonprofit-organization .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .nonprofit-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .nonprofit-header h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .nonprofit-subtitle {
    font-size: 1.2rem;
    color: #64748b;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  .org-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .org-info-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .org-info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 1.5rem;
  }
  
  .org-info-card h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .org-details-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .org-details-list li {
    padding: 0.5rem 0;
    color: #475569;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .org-details-list li:last-child {
    border-bottom: none;
  }
  
  .org-details-list a {
    color: #667eea;
    text-decoration: none;
  }
  
  .org-details-list a:hover {
    text-decoration: underline;
  }
  
  .mission-statement {
    background: white;
    border-radius: 1rem;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    margin-bottom: 2rem;
  }
  
  .mission-statement h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1.5rem;
    text-align: center;
  }
  
  .mission-text {
    font-size: 1.1rem;
    color: #475569;
    line-height: 1.7;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .impact-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    text-align: center;
  }
  
  .impact-item {
    padding: 1rem;
  }
  
  .impact-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #667eea;
    margin-bottom: 0.5rem;
  }
  
  .impact-label {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 600;
  }
  
  .transparency-section {
    background: white;
    border-radius: 1rem;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }
  
  .transparency-section h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 2rem;
    text-align: center;
  }
  
  .transparency-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  
  .transparency-item {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    border-left: 4px solid #667eea;
  }
  
  .transparency-item h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem;
  }
  
  .transparency-item p {
    color: #64748b;
    margin: 0;
    line-height: 1.6;
    font-size: 0.95rem;
  }
  
  @media (max-width: 768px) {
    .nonprofit-organization .container {
      padding: 0 1rem;
    }
    
    .nonprofit-header h2 {
      font-size: 2rem;
    }
    
    .org-details-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .org-info-card {
      padding: 1.5rem;
    }
    
    .mission-statement {
      padding: 1.5rem;
    }
    
    .impact-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .impact-number {
      font-size: 2rem;
    }
    
    .transparency-section {
      padding: 1.5rem;
    }
    
    .transparency-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
`;
}

/**
 * Generate JSON-LD structured data for the organization
 */
function generateOrganizationJSONLD() {
  const baseUrl = `https://${config.domain}`;
  
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.org.name,
    "legalName": config.org.legalName,
    "url": baseUrl,
    "description": config.org.mission,
    "foundingDate": config.org.founded,
    "nonprofitStatus": "https://schema.org/Nonprofit",
    "taxID": config.org.ein || undefined,
    "email": config.org.email || undefined,
    "telephone": config.org.phone || undefined,
    "address": config.org.address ? {
      "@type": "PostalAddress",
      "streetAddress": config.org.address
    } : undefined,
    "sameAs": [
      `${baseUrl}/about`,
      `${baseUrl}/programs`,
      // Add social media URLs if available
    ].filter(Boolean),
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "knowsAbout": [
      "Workforce Development",
      "Career Training",
      "WIOA Programs",
      "Job Placement",
      "Skills Training"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Workforce Development Community"
    }
  };
  
  // Remove undefined values
  Object.keys(jsonLD).forEach(key => {
    if (jsonLD[key] === undefined) {
      delete jsonLD[key];
    }
  });
  
  return `<script type="application/ld+json">
${JSON.stringify(jsonLD, null, 2)}
</script>`;
}

/**
 * Inject nonprofit block into HTML files
 */
export async function injectNonprofitBlock() {
  console.log("🏛️ Injecting nonprofit organization block...");
  
  try {
    // Generate nonprofit HTML
    const nonprofitHTML = generateNonprofitBlockHTML();
    
    // Generate JSON-LD structured data
    const jsonLD = generateOrganizationJSONLD();
    
    // Find HTML files to inject into
    const targetFiles = [
      path.join(config.outputDir, "index.html"),
      path.join(config.outputDir, "about.html")
    ];
    
    let injections = 0;
    let jsonLDInjections = 0;
    
    for (const filePath of targetFiles) {
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      let html = fs.readFileSync(filePath, "utf-8");
      let modified = false;
      
      // Inject nonprofit block
      if (html.includes("<!--NONPROFIT_BLOCK-->")) {
        html = html.replace(/<!--NONPROFIT_BLOCK-->/g, nonprofitHTML);
        injections++;
        modified = true;
        console.log(`✅ Injected nonprofit block into ${path.basename(filePath)}`);
      }
      
      // Inject JSON-LD structured data
      if (html.includes("</head>") && !html.includes('"@type": "Organization"')) {
        html = html.replace("</head>", `${jsonLD}\n</head>`);
        jsonLDInjections++;
        modified = true;
        console.log(`✅ Injected organization JSON-LD into ${path.basename(filePath)}`);
      }
      
      if (modified) {
        fs.writeFileSync(filePath, html);
      }
    }
    
    if (injections === 0) {
      console.log("⚠️ No <!--NONPROFIT_BLOCK--> placeholders found");
      console.log("💡 Add <!--NONPROFIT_BLOCK--> to your HTML where you want the organization information");
    }
    
    console.log(`🎉 Nonprofit block injection complete: ${injections} blocks, ${jsonLDInjections} JSON-LD injections`);
    
    return {
      success: true,
      injections,
      jsonLDInjections,
      organizationName: config.org.name
    };
    
  } catch (error) {
    console.error("💥 Nonprofit block injection failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await injectNonprofitBlock();
}