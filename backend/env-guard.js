/**
 * Environment Variable Guard
 * Validates required environment variables are present before starting the server
 */

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'PORT'
];

const missing = required.filter(k => !process.env[k]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(k => console.error(`   - ${k}`));
  console.error('\n💡 Add these to your Render service:');
  console.error('   Render Dashboard → Service → Environment');
  console.error('\n📝 Example values:');
  console.error('   SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_KEY=your-service-key');
  console.error('   JWT_SECRET=your-secret-key');
  console.error('   PORT=8080');
  process.exit(1);
}

console.log('✅ All required environment variables present');
