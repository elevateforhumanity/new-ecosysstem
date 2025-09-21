// scripts/replace-home-hero-video.js
// Replace homepage hero video with newly generated video

import fs from "fs";
import path from "path";

const config = {
  outputDir: "dist",
  indexFile: "dist/index.html",
  urlFile: "dist/hero-video-url.txt"
};

/**
 * Get the new video URL
 */
function getNewVideoUrl() {
  if (!fs.existsSync(config.urlFile)) {
    console.error(`❌ Video URL file not found: ${config.urlFile}`);
    console.error("Run make-hero-video.js first");
    return null;
  }
  
  const url = fs.readFileSync(config.urlFile, "utf-8").trim();
  if (!url) {
    console.error("❌ Video URL file is empty");
    return null;
  }
  
  console.log(`📹 New video URL: ${url}`);
  return url;
}

/**
 * Replace video URL in HTML content
 */
function replaceVideoInHTML(html, newVideoUrl) {
  let updatedHtml = html;
  let replacements = 0;
  
  // Strategy 1: Replace placeholder comment
  if (updatedHtml.includes("<!--HERO_VIDEO_URL-->")) {
    updatedHtml = updatedHtml.replace(/<!--HERO_VIDEO_URL-->/g, newVideoUrl);
    replacements++;
    console.log("✅ Replaced <!--HERO_VIDEO_URL--> placeholder");
  }
  
  // Strategy 2: Replace video element with id="heroVideo"
  const heroVideoRegex = /(<video[^>]*id=["']heroVideo["'][^>]*src=["'])[^"']*(["'][^>]*>)/gi;
  if (heroVideoRegex.test(html)) {
    updatedHtml = updatedHtml.replace(heroVideoRegex, `$1${newVideoUrl}$2`);
    replacements++;
    console.log("✅ Replaced <video id=\"heroVideo\"> src attribute");
  }
  
  // Strategy 3: Replace video element with class="hero-video"
  const heroClassRegex = /(<video[^>]*class=["'][^"']*hero-video[^"']*["'][^>]*src=["'])[^"']*(["'][^>]*>)/gi;
  if (heroClassRegex.test(html)) {
    updatedHtml = updatedHtml.replace(heroClassRegex, `$1${newVideoUrl}$2`);
    replacements++;
    console.log("✅ Replaced <video class=\"hero-video\"> src attribute");
  }
  
  // Strategy 4: Replace source element inside video
  const sourceRegex = /(<source[^>]*src=["'])[^"']*(["'][^>]*type=["']video\/[^"']*["'][^>]*>)/gi;
  if (sourceRegex.test(html)) {
    updatedHtml = updatedHtml.replace(sourceRegex, `$1${newVideoUrl}$2`);
    replacements++;
    console.log("✅ Replaced <source> src attribute");
  }
  
  // Strategy 5: Replace data-src attributes (for lazy loading)
  const dataSrcRegex = /(<video[^>]*data-src=["'])[^"']*(["'][^>]*>)/gi;
  if (dataSrcRegex.test(html)) {
    updatedHtml = updatedHtml.replace(dataSrcRegex, `$1${newVideoUrl}$2`);
    replacements++;
    console.log("✅ Replaced data-src attribute");
  }
  
  // Strategy 6: Replace in JavaScript/JSON configurations
  const jsVideoRegex = /(["']videoUrl["']\s*:\s*["'])[^"']*(["'])/gi;
  if (jsVideoRegex.test(html)) {
    updatedHtml = updatedHtml.replace(jsVideoRegex, `$1${newVideoUrl}$2`);
    replacements++;
    console.log("✅ Replaced JavaScript videoUrl configuration");
  }
  
  return { html: updatedHtml, replacements };
}

/**
 * Add video preload and optimization attributes
 */
function optimizeVideoElement(html) {
  let optimizedHtml = html;
  
  // Add preload="metadata" if not present
  const videoWithoutPreload = /<video([^>]*(?!preload)[^>]*)>/gi;
  optimizedHtml = optimizedHtml.replace(videoWithoutPreload, '<video$1 preload="metadata">');
  
  // Add muted attribute for autoplay compatibility
  const videoWithoutMuted = /<video([^>]*(?!muted)[^>]*)>/gi;
  optimizedHtml = optimizedHtml.replace(videoWithoutMuted, '<video$1 muted>');
  
  // Add playsinline for mobile compatibility
  const videoWithoutPlaysinline = /<video([^>]*(?!playsinline)[^>]*)>/gi;
  optimizedHtml = optimizedHtml.replace(videoWithoutPlaysinline, '<video$1 playsinline>');
  
  return optimizedHtml;
}

/**
 * Replace homepage hero video
 */
export function replaceHomepageHeroVideo() {
  console.log("🔄 Replacing homepage hero video...");
  
  // Check if index.html exists
  if (!fs.existsSync(config.indexFile)) {
    console.error(`❌ Homepage not found: ${config.indexFile}`);
    return { success: false, reason: "Homepage not found" };
  }
  
  // Get new video URL
  const newVideoUrl = getNewVideoUrl();
  if (!newVideoUrl) {
    return { success: false, reason: "No video URL available" };
  }
  
  // Read current HTML
  const originalHtml = fs.readFileSync(config.indexFile, "utf-8");
  
  // Replace video URLs
  const { html: updatedHtml, replacements } = replaceVideoInHTML(originalHtml, newVideoUrl);
  
  if (replacements === 0) {
    console.log("⚠️ No video elements found to replace");
    console.log("💡 Add one of these to your homepage HTML:");
    console.log("   - <!--HERO_VIDEO_URL--> (placeholder)");
    console.log("   - <video id=\"heroVideo\" src=\"...\"> (with ID)");
    console.log("   - <video class=\"hero-video\" src=\"...\"> (with class)");
    
    return { 
      success: false, 
      reason: "No video elements found",
      suggestions: [
        "Add <!--HERO_VIDEO_URL--> placeholder",
        "Add <video id=\"heroVideo\"> element",
        "Add <video class=\"hero-video\"> element"
      ]
    };
  }
  
  // Optimize video element
  const optimizedHtml = optimizeVideoElement(updatedHtml);
  
  // Write updated HTML
  fs.writeFileSync(config.indexFile, optimizedHtml);
  
  console.log(`✅ Homepage hero video updated (${replacements} replacements)`);
  console.log(`🎬 New video URL: ${newVideoUrl}`);
  
  return {
    success: true,
    videoUrl: newVideoUrl,
    replacements,
    optimized: true
  };
}

/**
 * Verify video replacement
 */
export function verifyVideoReplacement() {
  console.log("🔍 Verifying video replacement...");
  
  if (!fs.existsSync(config.indexFile)) {
    return { success: false, reason: "Homepage not found" };
  }
  
  const html = fs.readFileSync(config.indexFile, "utf-8");
  const newVideoUrl = getNewVideoUrl();
  
  if (!newVideoUrl) {
    return { success: false, reason: "No video URL to verify" };
  }
  
  // Check if new URL is present in HTML
  const urlPresent = html.includes(newVideoUrl);
  
  // Count video elements
  const videoElements = (html.match(/<video[^>]*>/gi) || []).length;
  const sourceElements = (html.match(/<source[^>]*>/gi) || []).length;
  
  // Check for optimization attributes
  const hasPreload = html.includes('preload="metadata"');
  const hasMuted = html.includes('muted');
  const hasPlaysinline = html.includes('playsinline');
  
  console.log(`📊 Verification results:`);
  console.log(`   Video URL present: ${urlPresent ? '✅' : '❌'}`);
  console.log(`   Video elements: ${videoElements}`);
  console.log(`   Source elements: ${sourceElements}`);
  console.log(`   Optimized attributes: ${hasPreload && hasMuted && hasPlaysinline ? '✅' : '⚠️'}`);
  
  return {
    success: urlPresent,
    urlPresent,
    videoElements,
    sourceElements,
    optimized: hasPreload && hasMuted && hasPlaysinline,
    newVideoUrl
  };
}

/**
 * Create backup of original homepage
 */
export function createHomepageBackup() {
  console.log("💾 Creating homepage backup...");
  
  if (!fs.existsSync(config.indexFile)) {
    return { success: false, reason: "Homepage not found" };
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = `${config.indexFile}.backup-${timestamp}`;
  
  fs.copyFileSync(config.indexFile, backupFile);
  
  console.log(`✅ Backup created: ${path.basename(backupFile)}`);
  return { success: true, backupFile };
}

/**
 * Restore homepage from backup
 */
export function restoreHomepageBackup(backupFile) {
  console.log(`🔄 Restoring homepage from backup: ${backupFile}`);
  
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    return { success: false, reason: "Backup file not found" };
  }
  
  fs.copyFileSync(backupFile, config.indexFile);
  
  console.log("✅ Homepage restored from backup");
  return { success: true };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case "backup":
      createHomepageBackup();
      break;
    case "restore":
      if (!arg) {
        console.error("Usage: node replace-home-hero-video.js restore <backup-file>");
        process.exit(1);
      }
      restoreHomepageBackup(arg);
      break;
    case "verify":
      verifyVideoReplacement();
      break;
    case "replace":
    default:
      replaceHomepageHeroVideo();
      break;
  }
}