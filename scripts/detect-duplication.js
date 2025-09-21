import fs from "fs";
import fetch from "node-fetch";

const BING_API_KEY = process.env.BING_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const SITE_URL = process.env.SITE_URL || "https://www.elevate4humanity.org";

// Extract watermarks from our content
function extractWatermarks() {
  const watermarks = new Set();
  const dist = "dist";
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Look for our watermark pattern
      const watermarkMatches = content.match(/EFH-WATERMARK: siteID=efh-main build=\w+ hash=\w+/g);
      if (watermarkMatches) {
        watermarkMatches.forEach(mark => watermarks.add(mark));
      }
      
      // Look for unique content phrases
      const uniquePhrases = [
        "Elevate for Humanity workforce development",
        "EFH-WATERMARK",
        "elevateforhumanity.org",
        "Licensed for workforce training & non-profit use"
      ];
      
      uniquePhrases.forEach(phrase => {
        if (content.includes(phrase)) {
          watermarks.add(phrase);
        }
      });
      
    } catch (error) {
      console.warn(`⚠️ Failed to scan ${filePath}: ${error.message}`);
    }
  }
  
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = `${dir}/${entry.name}`;
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        scanFile(fullPath);
      }
    }
  }
  
  walk(dist);
  return Array.from(watermarks);
}

async function searchBing(query) {
  if (!BING_API_KEY) {
    console.warn("⚠️ BING_API_KEY not set, skipping Bing search");
    return [];
  }
  
  try {
    const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY,
        'User-Agent': 'EFH-DuplicationDetector/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bing API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.webPages?.value || [];
    
  } catch (error) {
    console.warn(`⚠️ Bing search failed: ${error.message}`);
    return [];
  }
}

async function searchGoogle(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    console.warn("⚠️ Google API credentials not set, skipping Google search");
    return [];
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
    
  } catch (error) {
    console.warn(`⚠️ Google search failed: ${error.message}`);
    return [];
  }
}

function isOurDomain(url) {
  try {
    const domain = new URL(url).hostname;
    const ourDomain = new URL(SITE_URL).hostname;
    return domain === ourDomain || domain === `www.${ourDomain}`;
  } catch (error) {
    return false;
  }
}

async function detectDuplication() {
  console.log("🔍 Detecting content duplication...");
  
  const watermarks = extractWatermarks();
  console.log(`📊 Found ${watermarks.length} unique watermarks/phrases to search for`);
  
  const duplications = [];
  const searchResults = [];
  
  // Search for each watermark/phrase
  for (const watermark of watermarks.slice(0, 10)) { // Limit to avoid API quota
    console.log(`🔍 Searching for: "${watermark.substring(0, 50)}..."`);
    
    // Search Bing
    const bingResults = await searchBing(`"${watermark}"`);
    searchResults.push(...bingResults.map(r => ({ ...r, source: 'bing', query: watermark })));
    
    // Search Google
    const googleResults = await searchGoogle(`"${watermark}"`);
    searchResults.push(...googleResults.map(r => ({ ...r, source: 'google', query: watermark })));
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Filter out our own domain and analyze results
  const externalResults = searchResults.filter(result => {
    const url = result.url || result.link;
    return url && !isOurDomain(url);
  });
  
  console.log(`📊 Found ${externalResults.length} external results`);
  
  // Group by domain
  const domainGroups = {};
  externalResults.forEach(result => {
    try {
      const url = result.url || result.link;
      const domain = new URL(url).hostname;
      
      if (!domainGroups[domain]) {
        domainGroups[domain] = [];
      }
      
      domainGroups[domain].push({
        url,
        title: result.name || result.title,
        snippet: result.snippet,
        query: result.query,
        source: result.source
      });
    } catch (error) {
      console.warn(`⚠️ Failed to parse URL: ${result.url || result.link}`);
    }
  });
  
  // Identify potential duplications
  for (const [domain, results] of Object.entries(domainGroups)) {
    if (results.length >= 2) { // Multiple matches on same domain = likely duplication
      duplications.push({
        domain,
        match_count: results.length,
        urls: results.map(r => r.url),
        evidence: results,
        severity: results.length >= 5 ? 'high' : results.length >= 3 ? 'medium' : 'low'
      });
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    watermarks_searched: watermarks.length,
    total_search_results: searchResults.length,
    external_results: externalResults.length,
    suspected_duplications: duplications.length,
    duplications,
    all_external_results: externalResults
  };
}

async function generateDMCATakedown(duplication) {
  const template = `
DMCA TAKEDOWN NOTICE

To: Abuse Department / DMCA Agent
From: Elevate for Humanity
Date: ${new Date().toLocaleDateString()}

NOTICE OF CLAIMED INFRINGEMENT

Dear Sir or Madam:

I am writing to notify you of intellectual property infringement occurring on your platform/website.

1. IDENTIFICATION OF COPYRIGHTED WORK:
The copyrighted work is original content created by and belonging to Elevate for Humanity, specifically workforce development educational materials, program descriptions, and related content published at https://elevateforhumanity.org.

2. IDENTIFICATION OF INFRINGING MATERIAL:
The following URLs contain unauthorized copies of our copyrighted content:

${duplication.urls.map(url => `- ${url}`).join('\n')}

Evidence of infringement:
${duplication.evidence.map(e => `- Found watermarked content: "${e.query.substring(0, 100)}..."`).join('\n')}

3. CONTACT INFORMATION:
Elevate for Humanity
Email: copyright@elevateforhumanity.org
Website: https://elevateforhumanity.org

4. GOOD FAITH STATEMENT:
I have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

5. ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the copyright owner.

6. SIGNATURE:
/s/ Elevate for Humanity DMCA Agent

Please remove the infringing content immediately and confirm removal by replying to this email.

Thank you for your prompt attention to this matter.

Sincerely,
Elevate for Humanity DMCA Agent
copyright@elevateforhumanity.org
`;

  return template;
}

async function main() {
  console.log("🕵️ Starting duplication detection scan...");
  
  const results = await detectDuplication();
  
  // Save results
  fs.writeFileSync('dist/duplication-report.json', JSON.stringify(results, null, 2));
  
  console.log(`📊 Duplication Detection Results:`);
  console.log(`   Watermarks searched: ${results.watermarks_searched}`);
  console.log(`   Total search results: ${results.total_search_results}`);
  console.log(`   External results: ${results.external_results}`);
  console.log(`   Suspected duplications: ${results.suspected_duplications}`);
  
  if (results.suspected_duplications > 0) {
    console.warn(`⚠️ Found ${results.suspected_duplications} suspected duplications:`);
    
    // Generate DMCA takedown notices
    const dmcaDir = 'dist/dmca-notices';
    if (!fs.existsSync(dmcaDir)) {
      fs.mkdirSync(dmcaDir, { recursive: true });
    }
    
    for (const [index, duplication] of results.duplications.entries()) {
      console.warn(`   - ${duplication.domain} (${duplication.match_count} matches, ${duplication.severity} severity)`);
      
      // Generate DMCA notice
      const dmcaNotice = await generateDMCATakedown(duplication);
      const filename = `dmca-${duplication.domain.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.txt`;
      fs.writeFileSync(`${dmcaDir}/${filename}`, dmcaNotice);
      
      console.log(`   📄 Generated DMCA notice: ${dmcaDir}/${filename}`);
    }
    
    // Send notification if webhook available
    if (process.env.SLACK_WEBHOOK_URL) {
      const payload = {
        text: "🚨 Content Duplication Detected",
        attachments: [{
          color: "danger",
          fields: [
            { title: "Suspected Duplications", value: results.suspected_duplications.toString(), short: true },
            { title: "Domains Affected", value: results.duplications.map(d => d.domain).join(', '), short: false },
            { title: "DMCA Notices", value: `Generated ${results.duplications.length} takedown notices`, short: true }
          ]
        }]
      };
      
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log("📩 Sent Slack notification");
      } catch (error) {
        console.warn(`⚠️ Failed to send Slack notification: ${error.message}`);
      }
    }
    
  } else {
    console.log("✅ No content duplication detected");
  }
  
  console.log("📄 Report saved to: dist/duplication-report.json");
}

main().catch(error => {
  console.error(`💥 Duplication detection failed: ${error.message}`);
  process.exit(1);
});