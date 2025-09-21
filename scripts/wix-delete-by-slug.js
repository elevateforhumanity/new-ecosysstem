// scripts/wix-delete-by-slug.js
import { deleteBySlug, findProgramBySlug, listPrograms } from "./wix-client.js";

const slug = process.argv[2];
const command = process.argv[2];

// Handle special commands
if (command === "--list" || command === "-l") {
  console.log("📋 Listing all programs...");
  try {
    const programs = await listPrograms();
    if (programs.length === 0) {
      console.log("📭 No programs found in the collection");
    } else {
      console.log(`📊 Found ${programs.length} programs:`);
      console.log("");
      programs.forEach((program, index) => {
        const data = program.data;
        console.log(`${index + 1}. ${data.title || 'Untitled'}`);
        console.log(`   Slug: ${data.slug || 'no-slug'}`);
        console.log(`   ID: ${program._id}`);
        console.log(`   URL: https://elevate4humanity.org/programs/${data.slug}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Failed to list programs:", error.message);
    process.exit(1);
  }
  process.exit(0);
}

if (command === "--help" || command === "-h" || !slug) {
  console.log("🗑️ Wix Program Deletion Tool");
  console.log("");
  console.log("Usage:");
  console.log("  npm run wix:delete -- <slug>     Delete program by slug");
  console.log("  npm run wix:delete -- --list     List all programs");
  console.log("  npm run wix:delete -- --help     Show this help");
  console.log("");
  console.log("Examples:");
  console.log("  npm run wix:delete -- healthcare-assistant");
  console.log("  npm run wix:delete -- demo-program");
  console.log("  npm run wix:delete -- --list");
  process.exit(0);
}

// Validate slug format
if (slug.includes(' ') || slug.includes('/') || slug.includes('?')) {
  console.error("❌ Invalid slug format. Use lowercase letters, numbers, and hyphens only.");
  console.error("   Example: healthcare-assistant");
  process.exit(1);
}

(async () => {
  try {
    console.log(`🔍 Looking for program: ${slug}`);
    
    // First, check if the program exists
    const existing = await findProgramBySlug(slug);
    
    if (!existing) {
      console.log(`❌ Program not found: ${slug}`);
      console.log("");
      console.log("💡 Available programs:");
      
      try {
        const allPrograms = await listPrograms();
        if (allPrograms.length === 0) {
          console.log("   (No programs found)");
        } else {
          allPrograms.forEach(program => {
            console.log(`   - ${program.data.slug} (${program.data.title})`);
          });
        }
      } catch (listError) {
        console.log("   (Could not retrieve program list)");
      }
      
      process.exit(1);
    }
    
    // Show program details before deletion
    console.log(`📄 Found program:`);
    console.log(`   Title: ${existing.data.title}`);
    console.log(`   Slug: ${existing.data.slug}`);
    console.log(`   ID: ${existing._id}`);
    console.log(`   URL: https://elevate4humanity.org/programs/${existing.data.slug}`);
    console.log("");
    
    // Confirm deletion (in production, you might want to add a confirmation prompt)
    console.log(`🗑️ Deleting program: ${slug}`);
    
    const success = await deleteBySlug(slug);
    
    if (success) {
      console.log(`✅ Successfully deleted program: ${slug}`);
      console.log(`🌐 Page https://elevate4humanity.org/programs/${slug} will return 404`);
    } else {
      console.log(`❌ Failed to delete program: ${slug}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`💥 Deletion failed:`, error.message);
    process.exit(1);
  }
})();