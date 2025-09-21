// scripts/wix-upsert-programs.js
import { upsertProgram } from "./wix-client.js";

// WIOA-Approved Training Programs with embeds
const programs = [
  {
    slug: "healthcare-assistant",
    title: "Healthcare Assistant Certification",
    summary: "WIOA-approved program preparing students for immediate employment in healthcare facilities with comprehensive patient care training.",
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Program Overview</h2>
        <p>Our Healthcare Assistant Certification program is designed to prepare students for entry-level positions in hospitals, clinics, nursing homes, and other healthcare facilities. This comprehensive 12-week program combines theoretical knowledge with hands-on practical experience.</p>
        
        <h3 style="color: #27ae60; margin: 30px 0 15px 0;">What You'll Learn</h3>
        <ul style="margin-bottom: 25px;">
          <li><strong>Medical Terminology:</strong> Essential healthcare vocabulary and communication</li>
          <li><strong>Patient Care:</strong> Basic nursing skills, vital signs, and patient safety</li>
          <li><strong>Electronic Health Records:</strong> Modern healthcare documentation systems</li>
          <li><strong>Clinical Procedures:</strong> Infection control, medication assistance, and emergency response</li>
          <li><strong>Professional Development:</strong> Healthcare ethics, teamwork, and career readiness</li>
        </ul>
        
        <h3 style="color: #27ae60; margin: 30px 0 15px 0;">Career Opportunities</h3>
        <p>Graduates are prepared for positions including:</p>
        <ul style="margin-bottom: 25px;">
          <li>Certified Nursing Assistant (CNA)</li>
          <li>Medical Assistant</li>
          <li>Patient Care Technician</li>
          <li>Home Health Aide</li>
        </ul>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #2c3e50; margin-bottom: 10px;">Program Details</h4>
          <p><strong>Duration:</strong> 12 weeks (480 hours total)</p>
          <p><strong>Schedule:</strong> Monday-Friday, 8:00 AM - 4:00 PM</p>
          <p><strong>Expected Salary:</strong> $35,000 - $45,000 annually</p>
          <p><strong>Job Placement Rate:</strong> 92% within 6 months</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-weight: bold; color: #2d5a2d;">✓ WIOA Approved - Eligible for government funding assistance</p>
        </div>
      </div>
    `,
    ctaText: "Apply Now",
    ctaUrl: "https://calendly.com/elevate4humanity/healthcare-assistant",
    embedHtml: '<iframe src="https://calendly.com/elevate4humanity/healthcare-assistant" width="100%" height="700" frameborder="0" style="border-radius: 8px;"></iframe>',
    heroImageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop"
  },
  
  {
    slug: "it-support-specialist",
    title: "IT Support Specialist Program",
    summary: "Comprehensive 16-week WIOA-approved program covering network troubleshooting, cybersecurity, and industry certifications for high-demand tech careers.",
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Program Overview</h2>
        <p>The IT Support Specialist program prepares students for entry-level positions in information technology support. This 16-week intensive program covers essential technical skills, problem-solving methodologies, and industry best practices.</p>
        
        <h3 style="color: #3498db; margin: 30px 0 15px 0;">Core Curriculum</h3>
        <ul style="margin-bottom: 25px;">
          <li><strong>Network Fundamentals:</strong> TCP/IP, routing, switching, and wireless technologies</li>
          <li><strong>Operating Systems:</strong> Windows, macOS, and Linux administration</li>
          <li><strong>Hardware Troubleshooting:</strong> Computer assembly, diagnostics, and repair</li>
          <li><strong>Cybersecurity Basics:</strong> Threat detection, prevention, and incident response</li>
          <li><strong>Cloud Technologies:</strong> AWS, Azure, and Google Cloud fundamentals</li>
          <li><strong>Help Desk Operations:</strong> Customer service, ticketing systems, and documentation</li>
        </ul>
        
        <h3 style="color: #3498db; margin: 30px 0 15px 0;">Industry Certifications</h3>
        <p>Students prepare for valuable industry certifications including:</p>
        <ul style="margin-bottom: 25px;">
          <li>CompTIA A+ (Hardware and Software)</li>
          <li>CompTIA Network+</li>
          <li>CompTIA Security+</li>
          <li>Microsoft 365 Fundamentals</li>
        </ul>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #2c3e50; margin-bottom: 10px;">Program Details</h4>
          <p><strong>Duration:</strong> 16 weeks (640 hours total)</p>
          <p><strong>Schedule:</strong> Monday-Friday, 9:00 AM - 5:00 PM</p>
          <p><strong>Expected Salary:</strong> $42,000 - $55,000 annually</p>
          <p><strong>Job Placement Rate:</strong> 89% within 6 months</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-weight: bold; color: #2d5a2d;">✓ WIOA Approved - Eligible for government funding assistance</p>
        </div>
      </div>
    `,
    ctaText: "Enroll Today",
    ctaUrl: "https://calendly.com/elevate4humanity/it-support",
    embedHtml: '<iframe width="100%" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen style="border-radius: 8px; margin: 20px 0;"></iframe>',
    heroImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop"
  },
  
  {
    slug: "construction-trades",
    title: "Construction Trades Foundation",
    summary: "14-week WIOA-approved program covering electrical, plumbing, and general construction skills with direct pathways to apprenticeships and union jobs.",
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Program Overview</h2>
        <p>The Construction Trades Foundation program provides comprehensive training in essential construction skills. This 14-week program combines classroom instruction with hands-on workshop experience, preparing students for immediate employment or apprenticeship opportunities.</p>
        
        <h3 style="color: #e67e22; margin: 30px 0 15px 0;">Trade Specializations</h3>
        <ul style="margin-bottom: 25px;">
          <li><strong>Electrical Fundamentals:</strong> Wiring, circuits, electrical codes, and safety protocols</li>
          <li><strong>Plumbing Basics:</strong> Pipe fitting, water systems, and drainage installation</li>
          <li><strong>Carpentry Skills:</strong> Framing, finishing, and blueprint reading</li>
          <li><strong>HVAC Introduction:</strong> Heating, ventilation, and air conditioning systems</li>
          <li><strong>Masonry & Concrete:</strong> Foundation work and structural elements</li>
        </ul>
        
        <h3 style="color: #e67e22; margin: 30px 0 15px 0;">Safety & Compliance</h3>
        <ul style="margin-bottom: 25px;">
          <li>OSHA 10-Hour Construction Safety Certification</li>
          <li>Personal Protective Equipment (PPE) training</li>
          <li>Hazard identification and prevention</li>
          <li>Emergency response procedures</li>
        </ul>
        
        <h3 style="color: #e67e22; margin: 30px 0 15px 0;">Career Pathways</h3>
        <p>Graduates can pursue careers as:</p>
        <ul style="margin-bottom: 25px;">
          <li>Construction Laborer</li>
          <li>Apprentice Electrician</li>
          <li>Apprentice Plumber</li>
          <li>Carpenter Helper</li>
          <li>Maintenance Technician</li>
        </ul>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #2c3e50; margin-bottom: 10px;">Program Details</h4>
          <p><strong>Duration:</strong> 14 weeks (560 hours total)</p>
          <p><strong>Schedule:</strong> Monday-Friday, 7:00 AM - 3:30 PM</p>
          <p><strong>Expected Salary:</strong> $38,000 - $52,000 annually</p>
          <p><strong>Apprenticeship Placement:</strong> 85% within 3 months</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-weight: bold; color: #2d5a2d;">✓ WIOA Approved - Eligible for government funding assistance</p>
        </div>
      </div>
    `,
    ctaText: "Start Your Trade Career",
    ctaUrl: "https://calendly.com/elevate4humanity/construction-trades",
    embedHtml: '<iframe src="https://calendly.com/elevate4humanity/construction-trades" width="100%" height="700" frameborder="0" style="border-radius: 8px;"></iframe>',
    heroImageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop"
  },
  
  {
    slug: "medical-administrative-assistant",
    title: "Medical Administrative Assistant",
    summary: "10-week WIOA-approved program focusing on healthcare administration, medical billing, and electronic health records management.",
    content: `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Program Overview</h2>
        <p>The Medical Administrative Assistant program prepares students for administrative roles in healthcare settings. This 10-week program focuses on the business side of healthcare, combining medical knowledge with administrative skills.</p>
        
        <h3 style="color: #9b59b6; margin: 30px 0 15px 0;">Core Skills</h3>
        <ul style="margin-bottom: 25px;">
          <li><strong>Medical Billing & Coding:</strong> ICD-10, CPT codes, and insurance processing</li>
          <li><strong>Electronic Health Records:</strong> Epic, Cerner, and other EHR systems</li>
          <li><strong>Medical Terminology:</strong> Healthcare vocabulary and documentation</li>
          <li><strong>Patient Scheduling:</strong> Appointment management and coordination</li>
          <li><strong>Insurance Verification:</strong> Benefits verification and prior authorizations</li>
          <li><strong>HIPAA Compliance:</strong> Patient privacy and data security</li>
        </ul>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #2c3e50; margin-bottom: 10px;">Program Details</h4>
          <p><strong>Duration:</strong> 10 weeks (400 hours total)</p>
          <p><strong>Schedule:</strong> Monday-Friday, 9:00 AM - 1:00 PM</p>
          <p><strong>Expected Salary:</strong> $32,000 - $42,000 annually</p>
          <p><strong>Job Placement Rate:</strong> 94% within 6 months</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-weight: bold; color: #2d5a2d;">✓ WIOA Approved - Eligible for government funding assistance</p>
        </div>
      </div>
    `,
    ctaText: "Apply Now",
    ctaUrl: "https://calendly.com/elevate4humanity/medical-admin",
    embedHtml: '<iframe src="https://calendly.com/elevate4humanity/medical-admin" width="100%" height="700" frameborder="0" style="border-radius: 8px;"></iframe>',
    heroImageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop"
  }
];

// Optional: Import from Supabase instead of hard-coded data
// Uncomment the following lines if you want to use Supabase as data source:
/*
import { createClient } from "@supabase/supabase-js";

async function loadFromSupabase() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("📝 Using hard-coded programs (Supabase env vars not set)");
    return programs;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase
    .from("programs")
    .select("slug,title,summary,content,ctaText,ctaUrl,embedHtml,heroImageUrl")
    .neq("slug", null);

  if (error) {
    console.error("❌ Supabase error:", error);
    console.log("📝 Falling back to hard-coded programs");
    return programs;
  }
  
  console.log(`📊 Loaded ${data.length} programs from Supabase`);
  return data;
}
*/

(async () => {
  try {
    console.log("🚀 Starting bulk program upsert...");
    
    // Use hard-coded programs or load from Supabase
    // const programsToUpsert = await loadFromSupabase();
    const programsToUpsert = programs;
    
    console.log(`📊 Processing ${programsToUpsert.length} programs...`);
    
    for (const program of programsToUpsert) {
      try {
        const result = await upsertProgram(program);
        const itemId = result?.dataItem?._id || "unknown";
        console.log(`✅ Upserted: ${program.slug} (ID: ${itemId})`);
      } catch (error) {
        console.error(`❌ Failed to upsert ${program.slug}:`, error.message);
      }
    }
    
    console.log("");
    console.log("🎉 Bulk upsert complete!");
    console.log("🌐 Dynamic pages should now be live at:");
    programsToUpsert.forEach(p => {
      console.log(`   https://elevate4humanity.org/programs/${p.slug}`);
    });
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. Check your Wix CMS to verify the programs were created");
    console.log("   2. Test the dynamic pages in your browser");
    console.log("   3. Customize the dynamic page template if needed");
    
  } catch (error) {
    console.error("💥 Bulk upsert failed:", error.message);
    process.exit(1);
  }
})();