// scripts/inject-funders.js
// Inject funders and philanthropy information from Supabase

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const config = {
  outputDir: "dist",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  organizationName: process.env.ORG_NAME || "Elevate for Humanity"
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

/**
 * Fetch funders from Supabase
 */
async function fetchFunders() {
  console.log("💰 Fetching funders from Supabase...");
  
  try {
    const { data, error } = await supabase
      .from("funders")
      .select("*")
      .eq("published", true)
      .order("priority", { ascending: true });
    
    if (error) {
      console.log("⚠️ Funders table not found or error:", error.message);
      return [];
    }
    
    console.log(`✅ Found ${data?.length || 0} published funders`);
    return data || [];
    
  } catch (error) {
    console.error("❌ Failed to fetch funders:", error.message);
    return [];
  }
}

/**
 * Get default funders if none in database
 */
function getDefaultFunders() {
  return [
    {
      name: "Department of Labor",
      url: "https://www.dol.gov/",
      logo_url: "/images/funders/dol-logo.png",
      blurb: "Federal workforce development funding through WIOA and other programs",
      category: "Federal"
    },
    {
      name: "Department of Education",
      url: "https://www.ed.gov/",
      logo_url: "/images/funders/doe-logo.png", 
      blurb: "Educational grants and workforce training support",
      category: "Federal"
    },
    {
      name: "State Workforce Development",
      url: "#",
      logo_url: "/images/funders/state-logo.png",
      blurb: "State-level workforce development and training funding",
      category: "State"
    },
    {
      name: "Private Foundation Partners",
      url: "#",
      logo_url: "/images/funders/foundation-logo.png",
      blurb: "Community foundation and philanthropic support",
      category: "Private"
    }
  ];
}

/**
 * Generate funders block HTML
 */
function generateFundersBlockHTML(funders) {
  const hasFunders = funders && funders.length > 0;
  const fundersToShow = hasFunders ? funders : getDefaultFunders();
  
  // Group funders by category
  const groupedFunders = {};
  fundersToShow.forEach(funder => {
    const category = funder.category || "Partners";
    if (!groupedFunders[category]) {
      groupedFunders[category] = [];
    }
    groupedFunders[category].push(funder);
  });
  
  const fundersHTML = Object.entries(groupedFunders).map(([category, categoryFunders]) => {
    const fundersGrid = categoryFunders.map(funder => `
      <div class="funder-card">
        ${funder.logo_url ? `
          <div class="funder-logo">
            <img src="${funder.logo_url}" alt="${funder.name} Logo" onerror="this.style.display='none'">
          </div>
        ` : `
          <div class="funder-logo-placeholder">
            ${funder.name.charAt(0)}
          </div>
        `}
        <div class="funder-content">
          <h4 class="funder-name">
            ${funder.url && funder.url !== '#' ? 
              `<a href="${funder.url}" target="_blank" rel="noopener noreferrer">${funder.name}</a>` : 
              funder.name
            }
          </h4>
          ${funder.blurb ? `<p class="funder-description">${funder.blurb}</p>` : ''}
        </div>
      </div>
    `).join('');
    
    return `
      <div class="funder-category">
        <h3 class="category-title">${category}</h3>
        <div class="funders-grid">
          ${fundersGrid}
        </div>
      </div>
    `;
  }).join('');
  
  return `
<section class="funders-philanthropy">
  <div class="container">
    <div class="funders-header">
      <h2>Funders & Philanthropy</h2>
      <p class="funders-subtitle">
        ${config.organizationName} is supported by a network of federal agencies, state organizations, 
        and philanthropic partners committed to workforce development and community empowerment.
      </p>
    </div>
    
    <div class="funders-content">
      ${fundersHTML}
    </div>
    
    <div class="funding-info">
      <div class="funding-stats">
        <div class="stat-item">
          <div class="stat-number">${fundersToShow.length}+</div>
          <div class="stat-label">Funding Partners</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">100%</div>
          <div class="stat-label">Transparent Use</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">WIOA</div>
          <div class="stat-label">Compliant</div>
        </div>
      </div>
      
      <div class="funding-details">
        <h3>Funding Transparency</h3>
        <p>
          All funding received by ${config.organizationName} is used directly for program delivery, 
          participant support, and organizational sustainability. We maintain detailed financial 
          records and provide regular reporting to all funding partners.
        </p>
        <div class="funding-contact">
          <strong>Partnership Inquiries:</strong> 
          <a href="mailto:partnerships@elevate4humanity.org">partnerships@elevate4humanity.org</a>
        </div>
      </div>
    </div>
    
    ${!hasFunders ? `
    <div class="funders-note">
      <p><em>Funder information is representative. Actual partnerships may vary.</em></p>
    </div>
    ` : ''}
  </div>
</section>

<style>
  .funders-philanthropy {
    padding: 4rem 0;
    background: white;
    border-top: 1px solid #e2e8f0;
  }
  
  .funders-philanthropy .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .funders-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .funders-header h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .funders-subtitle {
    font-size: 1.1rem;
    color: #64748b;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
  }
  
  .funders-content {
    margin-bottom: 3rem;
  }
  
  .funder-category {
    margin-bottom: 2.5rem;
  }
  
  .category-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #374151;
    margin: 0 0 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .funders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .funder-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    transition: all 0.2s;
  }
  
  .funder-card:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
  
  .funder-logo {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }
  
  .funder-logo img {
    max-width: 50px;
    max-height: 50px;
    object-fit: contain;
  }
  
  .funder-logo-placeholder {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 0.5rem;
  }
  
  .funder-content {
    flex: 1;
  }
  
  .funder-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem;
  }
  
  .funder-name a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .funder-name a:hover {
    color: #667eea;
  }
  
  .funder-description {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }
  
  .funding-info {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 1rem;
    padding: 2.5rem;
    border: 1px solid #e2e8f0;
  }
  
  .funding-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    color: #667eea;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 600;
  }
  
  .funding-details h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem;
  }
  
  .funding-details p {
    color: #475569;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  
  .funding-contact {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #667eea;
  }
  
  .funding-contact a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }
  
  .funding-contact a:hover {
    text-decoration: underline;
  }
  
  .funders-note {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .funders-note p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .funders-philanthropy .container {
      padding: 0 1rem;
    }
    
    .funders-header h2 {
      font-size: 2rem;
    }
    
    .funders-grid {
      grid-template-columns: 1fr;
    }
    
    .funder-card {
      padding: 1rem;
    }
    
    .funding-info {
      padding: 1.5rem;
    }
    
    .funding-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    
    .stat-number {
      font-size: 1.5rem;
    }
  }
</style>
`;
}

/**
 * Inject funders block into HTML files
 */
export async function injectFundersBlock() {
  console.log("💰 Injecting funders and philanthropy block...");
  
  try {
    // Fetch funders from Supabase
    const funders = await fetchFunders();
    
    // Generate funders HTML
    const fundersHTML = generateFundersBlockHTML(funders);
    
    // Find HTML files to inject into
    const targetFiles = [
      path.join(config.outputDir, "index.html"),
      path.join(config.outputDir, "about.html"),
      path.join(config.outputDir, "funders.html")
    ];
    
    let injections = 0;
    
    for (const filePath of targetFiles) {
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      let html = fs.readFileSync(filePath, "utf-8");
      
      if (html.includes("<!--FUNDERS_BLOCK-->")) {
        html = html.replace(/<!--FUNDERS_BLOCK-->/g, fundersHTML);
        fs.writeFileSync(filePath, html);
        injections++;
        console.log(`✅ Injected funders block into ${path.basename(filePath)}`);
      }
    }
    
    if (injections === 0) {
      console.log("⚠️ No <!--FUNDERS_BLOCK--> placeholders found");
      console.log("💡 Add <!--FUNDERS_BLOCK--> to your HTML where you want the funders information");
    }
    
    console.log(`🎉 Funders block injection complete: ${injections} files updated, ${funders.length} funders displayed`);
    
    return {
      success: true,
      injections,
      fundersCount: funders.length
    };
    
  } catch (error) {
    console.error("💥 Funders block injection failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await injectFundersBlock();
}