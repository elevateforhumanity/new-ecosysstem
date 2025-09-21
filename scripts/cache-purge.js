// scripts/cache-purge.js
// Complete cache purging for Cloudflare and Netlify

import fetch from 'node-fetch';

const config = {
  cloudflareApi: 'https://api.cloudflare.com/client/v4',
  netlifyApi: 'https://api.netlify.com/api/v1',
  cfToken: process.env.CF_API_TOKEN,
  cfZoneId: process.env.CF_ZONE_ID,
  netlifyToken: process.env.NETLIFY_AUTH_TOKEN,
  netlifySiteId: process.env.NETLIFY_SITE_ID,
  domain: process.env.DOMAIN || 'elevate4humanity.org'
};

/**
 * Purge Cloudflare cache
 */
export async function purgeCloudflareCache(options = {}) {
  const { selective = false, urls = [] } = options;
  
  console.log(`🌩️ Purging Cloudflare cache (${selective ? 'selective' : 'everything'})...`);
  
  if (!config.cfToken || !config.cfZoneId) {
    console.log("⚠️ Cloudflare credentials not configured, skipping");
    return { success: false, reason: 'Missing credentials' };
  }
  
  try {
    const headers = {
      'Authorization': `Bearer ${config.cfToken}`,
      'Content-Type': 'application/json'
    };
    
    let body;
    if (selective && urls.length > 0) {
      // Purge specific URLs
      body = JSON.stringify({ files: urls });
      console.log(`📋 Purging ${urls.length} specific URLs`);
    } else {
      // Purge everything
      body = JSON.stringify({ purge_everything: true });
      console.log("🧹 Purging all cached content");
    }
    
    const response = await fetch(
      `${config.cloudflareApi}/zones/${config.cfZoneId}/purge_cache`,
      {
        method: 'POST',
        headers,
        body
      }
    );
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log("✅ Cloudflare cache purged successfully");
      return { success: true, result };
    } else {
      throw new Error(result.errors?.[0]?.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error("❌ Cloudflare cache purge failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Purge Netlify cache by triggering rebuild
 */
export async function purgeNetlifyCache() {
  console.log("🌐 Purging Netlify cache via rebuild...");
  
  if (!config.netlifyToken || !config.netlifySiteId) {
    console.log("⚠️ Netlify credentials not configured, skipping");
    return { success: false, reason: 'Missing credentials' };
  }
  
  try {
    const response = await fetch(
      `${config.netlifyApi}/sites/${config.netlifySiteId}/builds`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.netlifyToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Netlify rebuild triggered: ${result.id}`);
      return { success: true, buildId: result.id };
    } else {
      throw new Error(result.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error("❌ Netlify cache purge failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Purge browser cache by updating cache-busting parameters
 */
export async function generateCacheBustingManifest() {
  console.log("🔄 Generating cache-busting manifest...");
  
  const timestamp = Date.now();
  const version = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const manifest = {
    version,
    timestamp,
    assets: {
      css: `?v=${timestamp}`,
      js: `?v=${timestamp}`,
      images: `?v=${timestamp}`
    },
    urls: {
      sitemap: `https://${config.domain}/sitemap.xml?v=${timestamp}`,
      robots: `https://${config.domain}/robots.txt?v=${timestamp}`
    }
  };
  
  // Write manifest for use by frontend
  const fs = await import('fs');
  const path = await import('path');
  
  const manifestPath = path.join('dist', 'cache-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Cache-busting manifest generated: ${manifestPath}`);
  return { success: true, manifest };
}

/**
 * Purge specific program pages
 */
export async function purgePrograms(slugs = []) {
  console.log(`🎯 Purging specific program pages...`);
  
  if (slugs.length === 0) {
    // Get all program slugs from Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      
      const { data, error } = await supabase
        .from('programs')
        .select('slug')
        .eq('published', true);
      
      if (error) throw error;
      slugs = data.map(p => p.slug);
    } catch (error) {
      console.error("Failed to fetch program slugs:", error.message);
      return { success: false, error: error.message };
    }
  }
  
  // Generate URLs to purge
  const urls = slugs.flatMap(slug => [
    `https://${config.domain}/programs/${slug}`,
    `https://www.${config.domain}/programs/${slug}`
  ]);
  
  // Add related URLs
  urls.push(
    `https://${config.domain}/programs`,
    `https://www.${config.domain}/programs`,
    `https://${config.domain}/sitemap.xml`,
    `https://www.${config.domain}/sitemap.xml`
  );
  
  console.log(`📋 Purging ${urls.length} program-related URLs`);
  
  return await purgeCloudflareCache({ selective: true, urls });
}

/**
 * Smart cache purge based on content changes
 */
export async function smartCachePurge(changes = {}) {
  console.log("🧠 Running smart cache purge...");
  
  const results = {};
  
  // Always purge sitemap and robots.txt
  const corePurgeUrls = [
    `https://${config.domain}/sitemap.xml`,
    `https://www.${config.domain}/sitemap.xml`,
    `https://${config.domain}/robots.txt`,
    `https://www.${config.domain}/robots.txt`
  ];
  
  // If programs changed, purge program pages
  if (changes.programs) {
    console.log("📚 Programs changed, purging program pages");
    results.programs = await purgePrograms(changes.programs);
    
    // Also purge program listing page
    corePurgeUrls.push(
      `https://${config.domain}/programs`,
      `https://www.${config.domain}/programs`
    );
  }
  
  // If homepage content changed, purge homepage
  if (changes.homepage) {
    console.log("🏠 Homepage changed, purging homepage");
    corePurgeUrls.push(
      `https://${config.domain}/`,
      `https://www.${config.domain}/`
    );
  }
  
  // Purge core URLs
  results.core = await purgeCloudflareCache({ selective: true, urls: corePurgeUrls });
  
  // Generate new cache-busting manifest
  results.cacheBusting = await generateCacheBustingManifest();
  
  // Trigger Netlify rebuild if major changes
  if (changes.rebuild) {
    console.log("🔄 Major changes detected, triggering full rebuild");
    results.netlify = await purgeNetlifyCache();
  }
  
  return results;
}

/**
 * Emergency cache purge (everything)
 */
export async function emergencyCachePurge() {
  console.log("🚨 Emergency cache purge - clearing everything!");
  
  const results = {};
  
  // Purge Cloudflare completely
  results.cloudflare = await purgeCloudflareCache();
  
  // Trigger Netlify rebuild
  results.netlify = await purgeNetlifyCache();
  
  // Generate new cache manifest
  results.cacheBusting = await generateCacheBustingManifest();
  
  // Send notification if configured
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Emergency cache purge executed for ${config.domain}`,
          username: 'Cache Purge Bot'
        })
      });
    } catch (error) {
      console.log("Failed to send Slack notification:", error.message);
    }
  }
  
  return results;
}

/**
 * Verify cache purge effectiveness
 */
export async function verifyCachePurge(urls = []) {
  console.log("🔍 Verifying cache purge effectiveness...");
  
  if (urls.length === 0) {
    urls = [
      `https://${config.domain}/`,
      `https://${config.domain}/sitemap.xml`,
      `https://${config.domain}/programs`
    ];
  }
  
  const results = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const cacheStatus = response.headers.get('cf-cache-status') || 'unknown';
      const age = response.headers.get('age') || '0';
      
      results.push({
        url,
        status: response.status,
        cacheStatus,
        age: parseInt(age),
        fresh: parseInt(age) < 60 // Consider fresh if less than 1 minute old
      });
      
      console.log(`   ${url}: ${response.status} (cache: ${cacheStatus}, age: ${age}s)`);
      
    } catch (error) {
      results.push({
        url,
        error: error.message
      });
      console.log(`   ${url}: Error - ${error.message}`);
    }
  }
  
  const freshCount = results.filter(r => r.fresh).length;
  console.log(`✅ Cache verification: ${freshCount}/${results.length} URLs are fresh`);
  
  return { results, freshCount, total: results.length };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'cloudflare':
      await purgeCloudflareCache();
      break;
    case 'netlify':
      await purgeNetlifyCache();
      break;
    case 'programs':
      const slugs = arg ? arg.split(',') : [];
      await purgePrograms(slugs);
      break;
    case 'smart':
      const changes = arg ? JSON.parse(arg) : {};
      await smartCachePurge(changes);
      break;
    case 'emergency':
      await emergencyCachePurge();
      break;
    case 'verify':
      const urls = arg ? arg.split(',') : [];
      await verifyCachePurge(urls);
      break;
    case 'manifest':
      await generateCacheBustingManifest();
      break;
    default:
      console.log("Usage: node cache-purge.js [cloudflare|netlify|programs|smart|emergency|verify|manifest]");
      console.log("Examples:");
      console.log("  node cache-purge.js programs healthcare-assistant,it-support");
      console.log("  node cache-purge.js smart '{\"programs\":[\"new-program\"],\"rebuild\":true}'");
      console.log("  node cache-purge.js verify 'https://example.com,https://example.com/about'");
  }
}