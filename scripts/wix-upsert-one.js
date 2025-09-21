// scripts/wix-upsert-one.js
import { upsertProgram } from "./wix-client.js";

// Get slug from command line argument
const slug = process.argv[2];
const title = process.argv[3];

if (!slug) {
  console.error("❌ Usage: npm run wix:single -- <slug> [title]");
  console.error("   Example: npm run wix:single -- demo-program 'Demo Program Title'");
  process.exit(1);
}

// Template program with customizable fields
const program = {
  slug: slug,
  title: title || `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Program`,
  summary: `Professional training program for ${slug.replace(/-/g, ' ')} with industry-recognized certification and job placement assistance.`,
  content: `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Program Overview</h2>
      <p>This comprehensive training program is designed to prepare students for immediate employment in the ${slug.replace(/-/g, ' ')} field. Our curriculum combines theoretical knowledge with hands-on practical experience.</p>
      
      <h3 style="color: #3498db; margin: 30px 0 15px 0;">What You'll Learn</h3>
      <ul style="margin-bottom: 25px;">
        <li><strong>Industry Fundamentals:</strong> Core concepts and best practices</li>
        <li><strong>Practical Skills:</strong> Hands-on training with real-world applications</li>
        <li><strong>Safety & Compliance:</strong> Industry standards and regulations</li>
        <li><strong>Professional Development:</strong> Career readiness and soft skills</li>
        <li><strong>Certification Prep:</strong> Preparation for industry certifications</li>
      </ul>
      
      <h3 style="color: #3498db; margin: 30px 0 15px 0;">Career Opportunities</h3>
      <p>Graduates are prepared for entry-level positions in various ${slug.replace(/-/g, ' ')} roles with competitive starting salaries and advancement opportunities.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="color: #2c3e50; margin-bottom: 10px;">Program Details</h4>
        <p><strong>Duration:</strong> 12-16 weeks (flexible scheduling available)</p>
        <p><strong>Schedule:</strong> Full-time and part-time options</p>
        <p><strong>Expected Salary:</strong> Competitive industry rates</p>
        <p><strong>Job Placement Rate:</strong> High placement success</p>
      </div>
      
      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; font-weight: bold; color: #2d5a2d;">✓ WIOA Approved - Eligible for government funding assistance</p>
      </div>
    </div>
  `,
  ctaText: "Apply Now",
  ctaUrl: `https://calendly.com/elevate4humanity/${slug}`,
  embedHtml: `<iframe src="https://calendly.com/elevate4humanity/${slug}" width="100%" height="700" frameborder="0" style="border-radius: 8px;"></iframe>`,
  heroImageUrl: "" // Leave empty for default or add specific image URL
};

// Allow customization via environment variables
if (process.env.PROGRAM_SUMMARY) {
  program.summary = process.env.PROGRAM_SUMMARY;
}

if (process.env.PROGRAM_CTA_TEXT) {
  program.ctaText = process.env.PROGRAM_CTA_TEXT;
}

if (process.env.PROGRAM_CTA_URL) {
  program.ctaUrl = process.env.PROGRAM_CTA_URL;
}

if (process.env.PROGRAM_EMBED_HTML) {
  program.embedHtml = process.env.PROGRAM_EMBED_HTML;
}

if (process.env.PROGRAM_HERO_IMAGE) {
  program.heroImageUrl = process.env.PROGRAM_HERO_IMAGE;
}

(async () => {
  try {
    console.log(`🚀 Creating/updating program: ${program.slug}`);
    console.log(`📝 Title: ${program.title}`);
    console.log(`📄 Summary: ${program.summary.substring(0, 100)}...`);
    
    const result = await upsertProgram(program);
    const itemId = result?.dataItem?._id || "unknown";
    
    console.log("");
    console.log(`✅ Successfully upserted program: ${program.slug}`);
    console.log(`🆔 Item ID: ${itemId}`);
    console.log(`🌐 Live page: https://elevate4humanity.org/programs/${program.slug}`);
    console.log("");
    console.log("📝 Program details:");
    console.log(`   Title: ${program.title}`);
    console.log(`   CTA: ${program.ctaText} → ${program.ctaUrl}`);
    console.log(`   Has embed: ${program.embedHtml ? 'Yes' : 'No'}`);
    console.log(`   Has hero image: ${program.heroImageUrl ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error(`❌ Failed to upsert program ${program.slug}:`, error.message);
    process.exit(1);
  }
})();

// Export for testing
export { program };