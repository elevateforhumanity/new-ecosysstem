import fetch from "node-fetch";
import fs from "fs";

const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
const SITE_URL = process.env.SITE_URL || "https://www.elevate4humanity.org";

if (!NETLIFY_SITE_ID || !NETLIFY_AUTH_TOKEN) {
  console.warn("⚠️ Netlify credentials not set - skipping deploy check");
  process.exit(0);
}

async function checkNetlifyDeploy() {
  try {
    console.log("🔍 Checking Netlify deploy status...");
    
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys`, {
      headers: {
        Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Netlify API error: ${response.status} ${response.statusText}`);
    }
    
    const deploys = await response.json();
    const [latest] = deploys;
    
    if (!latest) {
      throw new Error("No deploys found");
    }
    
    console.log(`📊 Latest deploy: ${latest.id}`);
    console.log(`📊 State: ${latest.state}`);
    console.log(`📊 Created: ${latest.created_at}`);
    console.log(`📊 URL: ${latest.deploy_ssl_url || latest.deploy_url}`);
    
    // Check deploy state
    if (latest.state === "ready") {
      console.log("✅ Deploy is healthy and ready");
      
      // Additional health checks
      await checkSiteHealth(latest.deploy_ssl_url || latest.deploy_url);
      
      // Save deploy info
      const deployInfo = {
        id: latest.id,
        state: latest.state,
        url: latest.deploy_ssl_url || latest.deploy_url,
        created_at: latest.created_at,
        commit_sha: latest.commit_sha,
        branch: latest.branch,
        context: latest.context,
        health_check_passed: true,
        checked_at: new Date().toISOString()
      };
      
      fs.writeFileSync("dist/deploy-status.json", JSON.stringify(deployInfo, null, 2));
      return true;
    } else if (latest.state === "building") {
      console.log("⏳ Deploy is still building...");
      return false;
    } else if (latest.state === "error") {
      console.error("❌ Deploy failed with error");
      console.error(`Error: ${latest.error_message || 'Unknown error'}`);
      return false;
    } else {
      console.warn(`⚠️ Deploy in unexpected state: ${latest.state}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Failed to check deploy status: ${error.message}`);
    return false;
  }
}

async function checkSiteHealth(deployUrl) {
  console.log("🔍 Running site health checks...");
  
  const checks = [
    { name: "Homepage", path: "/" },
    { name: "Sitemap", path: "/sitemap.xml" },
    { name: "Robots", path: "/robots.txt" },
    { name: "Programs", path: "/programs.html" }
  ];
  
  let healthyChecks = 0;
  
  for (const check of checks) {
    try {
      const url = `${deployUrl}${check.path}`;
      const response = await fetch(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'EFH-HealthCheck/1.0'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${check.name}: OK (${response.status})`);
        healthyChecks++;
      } else {
        console.warn(`⚠️ ${check.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`⚠️ ${check.name}: ${error.message}`);
    }
  }
  
  const healthPercentage = (healthyChecks / checks.length) * 100;
  console.log(`📊 Health score: ${healthPercentage}% (${healthyChecks}/${checks.length})`);
  
  if (healthPercentage < 75) {
    throw new Error(`Site health check failed: ${healthPercentage}% healthy`);
  }
  
  return true;
}

async function main() {
  const isHealthy = await checkNetlifyDeploy();
  
  if (!isHealthy) {
    console.error("❌ Deploy health check failed");
    process.exit(1);
  }
  
  console.log("✅ Deploy health check passed");
}

main().catch(error => {
  console.error(`💥 Health check crashed: ${error.message}`);
  process.exit(1);
});