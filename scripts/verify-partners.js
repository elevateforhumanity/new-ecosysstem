import fs from "fs";
import path from "path";

const DIST = "dist";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("⚠️  Supabase credentials not set - skipping partner verification");
  console.warn("   Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables");
  process.exit(0);
}

// Import Supabase dynamically to handle missing dependency gracefully
let supabase;
try {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} catch (error) {
  console.warn("⚠️  Supabase package not installed - skipping partner verification");
  console.warn("   Run: npm install @supabase/supabase-js");
  process.exit(0);
}

let errors = [];
let warnings = [];

async function checkUrl(url, description) {
  try {
    // Use dynamic import for fetch if not available
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'ElevateForHumanity-Bot/1.0'
      }
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyPartners() {
  console.log("🔍 Fetching partner data from Supabase...");
  
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, name, website_url, logo_url, status, description');
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    if (!partners || partners.length === 0) {
      console.log("ℹ️  No partners found in database");
      return;
    }
    
    console.log(`📊 Verifying ${partners.length} partners...`);
    
    for (const partner of partners) {
      console.log(`\n🔍 Checking partner: ${partner.name}`);
      
      // Check required fields
      if (!partner.name || !partner.website_url) {
        errors.push(`❌ Partner ${partner.id}: Missing required fields (name or website_url)`);
        continue;
      }
      
      // Check website URL
      if (partner.website_url) {
        const websiteCheck = await checkUrl(partner.website_url, 'website');
        if (websiteCheck.success) {
          console.log(`   ✅ Website reachable: ${partner.website_url}`);
        } else {
          errors.push(`❌ Partner ${partner.name}: Website unreachable - ${websiteCheck.error}`);
        }
      }
      
      // Check logo URL if present
      if (partner.logo_url) {
        const logoCheck = await checkUrl(partner.logo_url, 'logo');
        if (logoCheck.success) {
          console.log(`   ✅ Logo reachable: ${partner.logo_url}`);
        } else {
          warnings.push(`⚠️  Partner ${partner.name}: Logo unreachable - ${logoCheck.error}`);
        }
      } else {
        warnings.push(`⚠️  Partner ${partner.name}: No logo URL provided`);
      }
      
      // Check status
      if (partner.status && partner.status !== 'active') {
        warnings.push(`⚠️  Partner ${partner.name}: Status is '${partner.status}' (not active)`);
      }
      
      // Check description
      if (!partner.description || partner.description.length < 10) {
        warnings.push(`⚠️  Partner ${partner.name}: Missing or short description`);
      }
    }
    
  } catch (error) {
    errors.push(`❌ Failed to verify partners: ${error.message}`);
  }
}

async function checkPartnerPageExists() {
  const partnerPagePath = path.join(DIST, 'partners.html');
  const partnersPagePath = path.join(DIST, 'partners', 'index.html');
  
  if (!fs.existsSync(partnerPagePath) && !fs.existsSync(partnersPagePath)) {
    warnings.push("⚠️  No partners page found (partners.html or partners/index.html)");
  } else {
    console.log("✅ Partners page exists");
  }
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ not found — build first.");
}

try {
  await checkPartnerPageExists();
  await verifyPartners();
  
  console.log(`\n📊 Partner Verification Results:`);
  
  if (errors.length > 0) {
    console.error(`\n❌ PARTNER ERRORS (${errors.length}):`);
    errors.forEach(error => console.error(`   ${error}`));
  }
  
  if (warnings.length > 0) {
    console.warn(`\n⚠️  PARTNER WARNINGS (${warnings.length}):`);
    warnings.forEach(warning => console.warn(`   ${warning}`));
  }
  
  if (errors.length > 0) {
    console.error(`\n❌ Partner verification failed with ${errors.length} errors`);
    process.exit(1);
  }
  
  console.log(`\n✅ Partner verification passed (${warnings.length} warnings)`);
  
} catch (error) {
  console.error(`❌ Partner verification failed: ${error.message}`);
  process.exit(1);
}