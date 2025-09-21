// scripts/make-hero-video.js
// Auto-generate homepage hero video from Supabase content

import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

const config = {
  outputDir: "dist/assets",
  videoOutput: "dist/assets/hero.mp4",
  hasR2: !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
  hasPolly: !!(process.env.AWS_ACCESS_KEY_ID && process.env.POLLY_VOICE),
  domain: process.env.DOMAIN || "elevate4humanity.org",
  
  // Video settings
  width: 1920,
  height: 1080,
  fps: 30,
  slideDuration: 4, // seconds per slide
  
  // Design settings
  backgroundColor: "#0f172a",
  gradientColor: "#1f2937",
  textColor: "#ffffff",
  accentColor: "#3b82f6",
  fontSize: 72,
  fontFamily: "Arial" // Fallback font
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Setup fonts (try to register better fonts if available)
 */
function setupFonts() {
  try {
    // Try to register system fonts
    const fontPaths = [
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
      "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
      "/System/Library/Fonts/Arial.ttf", // macOS
      "C:\\Windows\\Fonts\\arial.ttf" // Windows
    ];
    
    for (const fontPath of fontPaths) {
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: "CustomFont" });
        config.fontFamily = "CustomFont";
        console.log(`✅ Registered font: ${fontPath}`);
        break;
      }
    }
  } catch (error) {
    console.log("⚠️ Using fallback font (Arial)");
  }
}

/**
 * Get professional overview content lines
 */
async function getOverviewContentLines() {
  console.log("📝 Using professional overview content...");
  
  // Professional, branded content focused on funding routes and programs
  const lines = [
    "Elevate for Humanity Career & Training Institute",
    "Free & Funded Programs Available",
    "Job Readiness Initiative (JRI)",
    "Work Experience (WEX)",
    "On-the-Job Training (OJT)",
    "Registered Apprenticeships",
    "Empowering Communities, Building Careers",
    "Enroll Today at elevate4humanity.org"
  ];
  
  console.log(`✅ Professional overview: ${lines.length} slides`);
  return lines;
}

/**
 * Wrap text to fit within canvas width
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Center the text block vertically
  const totalHeight = lines.length * lineHeight;
  const startY = y - (totalHeight / 2) + (lineHeight / 2);
  
  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + (index * lineHeight));
  });
  
  return lines.length;
}

/**
 * Generate slide image
 */
function generateSlide(text, slideIndex, totalSlides) {
  const canvas = createCanvas(config.width, config.height);
  const ctx = canvas.getContext("2d");
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
  gradient.addColorStop(0, config.backgroundColor);
  gradient.addColorStop(1, config.gradientColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, config.width, config.height);
  
  // Add subtle pattern or texture
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * config.width;
    const y = Math.random() * config.height;
    const size = Math.random() * 3 + 1;
    ctx.fillRect(x, y, size, size);
  }
  
  // Main text
  ctx.fillStyle = config.textColor;
  ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  const maxWidth = config.width * 0.8;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  
  wrapText(ctx, text, centerX, centerY, maxWidth, config.fontSize * 1.2);
  
  // Progress indicator
  const progressWidth = config.width * 0.6;
  const progressHeight = 4;
  const progressX = (config.width - progressWidth) / 2;
  const progressY = config.height - 100;
  
  // Progress background
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
  
  // Progress fill
  const fillWidth = (progressWidth * (slideIndex + 1)) / totalSlides;
  ctx.fillStyle = config.accentColor;
  ctx.fillRect(progressX, progressY, fillWidth, progressHeight);
  
  // Slide number
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `24px ${config.fontFamily}`;
  ctx.textAlign = "center";
  ctx.fillText(`${slideIndex + 1} / ${totalSlides}`, centerX, progressY + 40);
  
  return canvas.toBuffer("image/png");
}

/**
 * Generate all slide images
 */
async function generateSlides(contentLines) {
  console.log("🎨 Generating slide images...");
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  const slidePaths = [];
  
  for (let i = 0; i < contentLines.length; i++) {
    const slideBuffer = generateSlide(contentLines[i], i, contentLines.length);
    const slidePath = path.join(config.outputDir, `slide-${i + 1}.png`);
    
    fs.writeFileSync(slidePath, slideBuffer);
    slidePaths.push(slidePath);
    
    console.log(`✅ Generated slide ${i + 1}: ${contentLines[i].substring(0, 30)}...`);
  }
  
  return slidePaths;
}

/**
 * Create video from slides using ffmpeg
 */
function createVideoFromSlides(slidePaths) {
  console.log("🎬 Creating video from slides...");
  
  // Create ffmpeg input list
  const listFile = path.join(config.outputDir, "slides.txt");
  const listContent = slidePaths.map(slidePath => 
    `file '${path.resolve(slidePath)}'\nduration ${config.slideDuration}`
  ).join("\n") + `\nfile '${path.resolve(slidePaths[slidePaths.length - 1])}'`;
  
  fs.writeFileSync(listFile, listContent);
  
  // Build video with ffmpeg
  const ffmpegCmd = [
    "ffmpeg", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listFile,
    "-vf", `format=yuv420p,scale=${config.width}:${config.height}`,
    "-pix_fmt", "yuv420p",
    "-r", config.fps.toString(),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "23",
    config.videoOutput
  ].join(" ");
  
  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
    console.log(`✅ Video created: ${config.videoOutput}`);
    return true;
  } catch (error) {
    console.error("❌ Video creation failed:", error.message);
    return false;
  }
}

/**
 * Add professional voiceover using AWS Polly (optional)
 */
async function addVoiceover(contentLines) {
  if (!config.hasPolly) {
    console.log("⚠️ AWS Polly not configured, skipping voiceover");
    return false;
  }
  
  console.log("🎤 Adding professional voiceover with AWS Polly...");
  
  try {
    // Create professional narration script
    const narrationScript = `
      Elevate for Humanity Career and Training Institute offers free and funded workforce development programs. 
      Our comprehensive training includes Job Readiness Initiative, Work Experience programs, On-the-Job Training, and Registered Apprenticeships. 
      We're empowering communities and building careers through WIOA-approved certifications. 
      Start your career transformation today at elevate4humanity.org.
    `.trim();
    
    const narrationFile = path.join(config.outputDir, "narration.txt");
    fs.writeFileSync(narrationFile, narrationScript);
    
    // Synthesize speech with professional settings
    const audioFile = path.join(config.outputDir, "narration.mp3");
    const pollyCmd = [
      "aws", "polly", "synthesize-speech",
      "--output-format", "mp3",
      "--text", `file://${narrationFile}`,
      "--voice-id", process.env.POLLY_VOICE || "Joanna",
      "--region", process.env.AWS_REGION || "us-east-1",
      "--engine", "neural", // Use neural engine for better quality
      audioFile
    ].join(" ");
    
    execSync(pollyCmd, { stdio: "inherit" });
    
    // Mix audio with video, ensuring proper timing
    const videoWithAudio = path.join(config.outputDir, "hero-with-audio.mp4");
    const mixCmd = [
      "ffmpeg", "-y",
      "-i", config.videoOutput,
      "-i", audioFile,
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "128k", // Good audio quality
      "-shortest", // Match shortest stream duration
      "-af", "volume=0.8", // Slightly lower volume for professional feel
      videoWithAudio
    ].join(" ");
    
    execSync(mixCmd, { stdio: "inherit" });
    
    // Replace original video
    fs.renameSync(videoWithAudio, config.videoOutput);
    
    console.log("✅ Professional voiceover added successfully");
    return true;
    
  } catch (error) {
    console.error("⚠️ Voiceover failed:", error.message);
    console.log("Continuing with silent video...");
    return false;
  }
}

/**
 * Upload video to Cloudflare R2 (optional)
 */
async function uploadToR2() {
  if (!config.hasR2) {
    console.log("⚠️ R2 credentials not configured, using local video");
    return `/assets/hero.mp4`;
  }
  
  console.log("☁️ Uploading video to Cloudflare R2...");
  
  try {
    const timestamp = Date.now();
    const key = `videos/hero-${timestamp}.mp4`;
    
    const uploadCmd = [
      "AWS_ACCESS_KEY_ID=" + process.env.R2_ACCESS_KEY_ID,
      "AWS_SECRET_ACCESS_KEY=" + process.env.R2_SECRET_ACCESS_KEY,
      "aws", "s3", "cp",
      config.videoOutput,
      `s3://${process.env.R2_BUCKET}/${key}`,
      "--endpoint-url", process.env.R2_ENDPOINT,
      "--acl", "public-read"
    ].join(" ");
    
    execSync(uploadCmd, { stdio: "inherit" });
    
    const publicBase = process.env.R2_PUBLIC_BASE?.replace(/\/$/, "") || "";
    const publicUrl = `${publicBase}/${key}`;
    
    console.log(`✅ Video uploaded to R2: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error("⚠️ R2 upload failed:", error.message);
    console.log("Using local video instead...");
    return `/assets/hero.mp4`;
  }
}

/**
 * Cleanup temporary files
 */
function cleanup() {
  console.log("🧹 Cleaning up temporary files...");
  
  const tempFiles = [
    path.join(config.outputDir, "slides.txt"),
    path.join(config.outputDir, "narration.txt"),
    path.join(config.outputDir, "narration.mp3")
  ];
  
  // Remove slide images
  for (let i = 1; i <= 10; i++) {
    tempFiles.push(path.join(config.outputDir, `slide-${i}.png`));
  }
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
  
  console.log("✅ Cleanup complete");
}

/**
 * Main function to create hero video
 */
export async function createHeroVideo() {
  console.log("🎬 Starting hero video creation...");
  
  try {
    // Setup
    setupFonts();
    
    // Get professional overview content
    const contentLines = await getOverviewContentLines();
    
    // Generate slides
    const slidePaths = await generateSlides(contentLines);
    
    // Create video
    const videoSuccess = createVideoFromSlides(slidePaths);
    if (!videoSuccess) {
      throw new Error("Video creation failed");
    }
    
    // Add voiceover (optional)
    await addVoiceover(contentLines);
    
    // Upload to R2 (optional)
    const publicUrl = await uploadToR2();
    
    // Save public URL for homepage replacement
    const urlFile = path.join("dist", "hero-video-url.txt");
    fs.writeFileSync(urlFile, publicUrl);
    
    // Cleanup
    cleanup();
    
    console.log("🎉 Hero video creation complete!");
    console.log(`📹 Video URL: ${publicUrl}`);
    
    return {
      success: true,
      videoUrl: publicUrl,
      localPath: config.videoOutput,
      slides: contentLines.length
    };
    
  } catch (error) {
    console.error("💥 Hero video creation failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await createHeroVideo();
}