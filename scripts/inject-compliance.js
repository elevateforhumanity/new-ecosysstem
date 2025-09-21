// scripts/inject-compliance.js
// Inject compliance and contracts information for DOE/DOL/DWD readiness

import fs from "fs";
import path from "path";

const config = {
  outputDir: "dist",
  organizationName: process.env.ORG_NAME || "Elevate for Humanity"
};

/**
 * Generate compliance block HTML
 */
function generateComplianceBlockHTML() {
  return `
<section class="compliance-contracts">
  <div class="container">
    <div class="compliance-header">
      <h2>Compliance & Contracts</h2>
      <p class="compliance-subtitle">
        ${config.organizationName} maintains comprehensive compliance standards for federal and state workforce development programs.
      </p>
    </div>
    
    <div class="compliance-grid">
      <div class="compliance-card">
        <div class="compliance-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <h3>DOE Ready</h3>
        <ul class="compliance-features">
          <li>Education data patterns & reporting</li>
          <li>Student outcome tracking</li>
          <li>Audit-ready export capabilities</li>
          <li>FERPA compliance protocols</li>
        </ul>
      </div>
      
      <div class="compliance-card">
        <div class="compliance-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <h3>DOL Ready</h3>
        <ul class="compliance-features">
          <li>Apprenticeship program tracking</li>
          <li>On-the-Job Training (OJT) compliance</li>
          <li>WIOA performance metrics</li>
          <li>Labor standards documentation</li>
        </ul>
      </div>
      
      <div class="compliance-card">
        <div class="compliance-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"></path>
          </svg>
        </div>
        <h3>DWD Ready</h3>
        <ul class="compliance-features">
          <li>State workforce development reporting</li>
          <li>Employment outcome verification</li>
          <li>Participant tracking systems</li>
          <li>Performance accountability measures</li>
        </ul>
      </div>
    </div>
    
    <div class="compliance-details">
      <div class="compliance-section">
        <h3>Audit & Reporting Capabilities</h3>
        <div class="feature-grid">
          <div class="feature-item">
            <strong>Exportable Reports:</strong> CSV, PDF, and Excel formats for all data points
          </div>
          <div class="feature-item">
            <strong>Audit Logs:</strong> Comprehensive activity tracking with timestamps and user attribution
          </div>
          <div class="feature-item">
            <strong>Role-Based Access:</strong> Granular permissions for staff, administrators, and auditors
          </div>
          <div class="feature-item">
            <strong>Data Retention:</strong> Configurable retention windows meeting federal requirements
          </div>
          <div class="feature-item">
            <strong>Security Standards:</strong> SOC 2 Type II compliance with encrypted data transmission
          </div>
          <div class="feature-item">
            <strong>Integration Ready:</strong> API endpoints for state and federal reporting systems
          </div>
        </div>
      </div>
      
      <div class="compliance-section">
        <h3>Supported Program Types</h3>
        <div class="program-badges">
          <span class="program-badge">WIOA Title I</span>
          <span class="program-badge">Wagner-Peyser</span>
          <span class="program-badge">Trade Adjustment Assistance</span>
          <span class="program-badge">Job Corps</span>
          <span class="program-badge">Apprenticeship Programs</span>
          <span class="program-badge">Work Experience (WEX)</span>
          <span class="program-badge">On-the-Job Training (OJT)</span>
          <span class="program-badge">Job Readiness Initiative (JRI)</span>
          <span class="program-badge">Incumbent Worker Training</span>
          <span class="program-badge">Dislocated Worker Programs</span>
        </div>
      </div>
      
      <div class="compliance-section">
        <h3>Contract & Partnership Information</h3>
        <p class="compliance-note">
          Our workflows align with common federal and state requirements across multiple funding streams. 
          We maintain documentation standards that support agency reviews, performance monitoring, and 
          compliance audits. All systems are designed to facilitate seamless data sharing with oversight 
          bodies while protecting participant privacy and maintaining data security.
        </p>
        <div class="contact-compliance">
          <strong>For compliance inquiries:</strong> 
          <a href="mailto:compliance@elevate4humanity.org">compliance@elevate4humanity.org</a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .compliance-contracts {
    padding: 4rem 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-top: 1px solid #cbd5e1;
  }
  
  .compliance-contracts .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .compliance-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .compliance-header h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .compliance-subtitle {
    font-size: 1.1rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .compliance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .compliance-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .compliance-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .compliance-icon {
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
  
  .compliance-card h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .compliance-features {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .compliance-features li {
    padding: 0.5rem 0;
    color: #475569;
    position: relative;
    padding-left: 1.5rem;
  }
  
  .compliance-features li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #059669;
    font-weight: bold;
  }
  
  .compliance-details {
    background: white;
    border-radius: 1rem;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }
  
  .compliance-section {
    margin-bottom: 2.5rem;
  }
  
  .compliance-section:last-child {
    margin-bottom: 0;
  }
  
  .compliance-section h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .feature-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border-left: 4px solid #667eea;
  }
  
  .feature-item strong {
    color: #374151;
  }
  
  .program-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .program-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .compliance-note {
    color: #475569;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }
  
  .contact-compliance {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #3b82f6;
  }
  
  .contact-compliance a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
  }
  
  .contact-compliance a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .compliance-contracts .container {
      padding: 0 1rem;
    }
    
    .compliance-header h2 {
      font-size: 2rem;
    }
    
    .compliance-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .compliance-card {
      padding: 1.5rem;
    }
    
    .compliance-details {
      padding: 1.5rem;
    }
    
    .feature-grid {
      grid-template-columns: 1fr;
    }
    
    .program-badges {
      justify-content: center;
    }
  }
</style>
`;
}

/**
 * Inject compliance block into HTML files
 */
export async function injectComplianceBlock() {
  console.log("📋 Injecting compliance and contracts block...");
  
  try {
    // Generate compliance HTML
    const complianceHTML = generateComplianceBlockHTML();
    
    // Find HTML files to inject into
    const targetFiles = [
      path.join(config.outputDir, "index.html"),
      path.join(config.outputDir, "about.html"),
      path.join(config.outputDir, "compliance.html")
    ];
    
    let injections = 0;
    
    for (const filePath of targetFiles) {
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      let html = fs.readFileSync(filePath, "utf-8");
      
      if (html.includes("<!--COMPLIANCE_BLOCK-->")) {
        html = html.replace(/<!--COMPLIANCE_BLOCK-->/g, complianceHTML);
        fs.writeFileSync(filePath, html);
        injections++;
        console.log(`✅ Injected compliance block into ${path.basename(filePath)}`);
      }
    }
    
    if (injections === 0) {
      console.log("⚠️ No <!--COMPLIANCE_BLOCK--> placeholders found");
      console.log("💡 Add <!--COMPLIANCE_BLOCK--> to your HTML where you want the compliance information");
    }
    
    console.log(`🎉 Compliance block injection complete: ${injections} files updated`);
    
    return {
      success: true,
      injections
    };
    
  } catch (error) {
    console.error("💥 Compliance block injection failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await injectComplianceBlock();
}