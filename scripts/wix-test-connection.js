// scripts/wix-test-connection.js
import { testConnection, listPrograms } from "./wix-client.js";

console.log("🧪 Wix API Connection Test");
console.log("========================");
console.log("");

(async () => {
  try {
    // Test basic connection
    const connectionOk = await testConnection();
    
    if (!connectionOk) {
      console.log("");
      console.log("🔧 Troubleshooting:");
      console.log("   1. Check your WIX_API_KEY environment variable");
      console.log("   2. Check your WIX_SITE_ID environment variable");
      console.log("   3. Verify API key has proper permissions");
      console.log("   4. Ensure your Wix site is published");
      process.exit(1);
    }
    
    console.log("");
    console.log("📊 Testing CMS operations...");
    
    // Test listing programs
    try {
      const programs = await listPrograms();
      console.log(`✅ CMS query successful - found ${programs.length} programs`);
      
      if (programs.length > 0) {
        console.log("");
        console.log("📋 Existing programs:");
        programs.forEach((program, index) => {
          const data = program.data;
          console.log(`   ${index + 1}. ${data.title || 'Untitled'} (${data.slug || 'no-slug'})`);
        });
      }
    } catch (cmsError) {
      console.log("⚠️ CMS operations failed - programs collection may not exist");
      console.log("   Create the 'programs' collection in your Wix CMS first");
    }
    
    console.log("");
    console.log("🎉 Connection test complete!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. If programs collection doesn't exist, create it in Wix CMS");
    console.log("   2. Run: npm run wix:upsert to create training programs");
    console.log("   3. Set up dynamic pages in Wix Editor");
    
  } catch (error) {
    console.error("💥 Connection test failed:", error.message);
    console.log("");
    console.log("🔧 Common issues:");
    console.log("   - Invalid API key or site ID");
    console.log("   - API key doesn't have CMS permissions");
    console.log("   - Network connectivity issues");
    console.log("   - Wix site not properly configured");
    process.exit(1);
  }
})();