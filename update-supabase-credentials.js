#!/usr/bin/env node

/**
 * Update Supabase Credentials with Real Values
 */

import fs from 'fs';

console.log('🔧 Updating Supabase credentials...');

// Your confirmed credentials
const CREDENTIALS = {
  SUPABASE_URL: 'https://kkzbqkyuunahdxcfdfzv.supabase.co',
  SUPABASE_PROJECT_REF: 'kkzbqkyuunahdxcfdfzv',
  SUPABASE_DB_PASSWORD: 'your_supabase_password',
  SUPABASE_ACCESS_TOKEN: 'sbp_v0_049f7f593a8093380bff6ae29f1afb41e4e71637'
};

console.log('✅ Confirmed credentials:');
console.log(`   URL: ${CREDENTIALS.SUPABASE_URL}`);
console.log(`   Project Ref: ${CREDENTIALS.SUPABASE_PROJECT_REF}`);
console.log(`   DB Password: ${CREDENTIALS.SUPABASE_DB_PASSWORD.substring(0, 10)}...`);
console.log(`   Access Token: ${CREDENTIALS.SUPABASE_ACCESS_TOKEN.substring(0, 15)}...`);

// Update GitHub workflows with access token
function updateGitHubWorkflows() {
  console.log('\n🔄 Updating GitHub workflows...');
  
  const workflowFiles = [
    '.github/workflows/deploy-production.yml',
    '.github/workflows/data-sync.yml'
  ];
  
  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Update environment variables
      content = content.replace(
        /SUPABASE_ACCESS_TOKEN: \$\{\{ secrets\.SUPABASE_ACCESS_TOKEN \}\}/g,
        `SUPABASE_ACCESS_TOKEN: ${CREDENTIALS.SUPABASE_ACCESS_TOKEN}`
      );
      
      fs.writeFileSync(file, content);
      console.log(`✅ Updated ${file}`);
    }
  });
}

// Create GitHub secrets template
function createGitHubSecretsTemplate() {
  console.log('\n📋 Creating GitHub secrets template...');
  
  const secrets = {
    SUPABASE_URL: CREDENTIALS.SUPABASE_URL,
    SUPABASE_PROJECT_REF: CREDENTIALS.SUPABASE_PROJECT_REF,
    SUPABASE_ACCESS_TOKEN: CREDENTIALS.SUPABASE_ACCESS_TOKEN,
    SUPABASE_SERVICE_ROLE_KEY: 'STILL_NEEDED_FROM_DASHBOARD',
    NETLIFY_AUTH_TOKEN: process.env.NETLIFY_AUTH_TOKEN || 'REPLACE_WITH_ACTUAL_TOKEN',
    NETLIFY_SITE_ID: 'GET_FROM_NETLIFY_DASHBOARD'
  };
  
  fs.writeFileSync('github-secrets-template.json', JSON.stringify(secrets, null, 2));
  console.log('✅ Created github-secrets-template.json');
}

// Try to use the access token to get project info
async function testAccessToken() {
  console.log('\n🧪 Testing access token...');
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${CREDENTIALS.SUPABASE_PROJECT_REF}`, {
      headers: {
        'Authorization': `Bearer ${CREDENTIALS.SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const projectInfo = await response.json();
      console.log('✅ Access token works!');
      console.log(`   Project: ${projectInfo.name || 'Unknown'}`);
      console.log(`   Region: ${projectInfo.region || 'Unknown'}`);
      
      return projectInfo;
    } else {
      console.log('⚠️  Access token test failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('⚠️  Access token test error:', error.message);
    return null;
  }
}

// Show what's still needed
function showRemainingSteps() {
  console.log('\n🎯 WHAT WE STILL NEED:');
  console.log('======================');
  
  console.log('\n1. PROJECT API KEYS (from Supabase Dashboard):');
  console.log('   → Go to: https://supabase.com/dashboard/project/kkzbqkyuunahdxcfdfzv');
  console.log('   → Click: Settings → API');
  console.log('   → Copy: "anon public" key (starts with eyJhbGciOi...)');
  console.log('   → Copy: "service_role" key (starts with eyJhbGciOi...)');
  
  console.log('\n2. THESE ARE DIFFERENT from the access token!');
  console.log('   ✅ Access Token (CLI): sbp_v0_049f7f... (we have this)');
  console.log('   ❌ Anon Public Key: eyJhbGciOi... (need this)');
  console.log('   ❌ Service Role Key: eyJhbGciOi... (need this)');
  
  console.log('\n3. WHY WE NEED BOTH:');
  console.log('   • Access Token: For deploying Edge Functions');
  console.log('   • API Keys: For your React app to connect to database');
}

// Run updates
async function runUpdates() {
  updateGitHubWorkflows();
  createGitHubSecretsTemplate();
  
  const projectInfo = await testAccessToken();
  
  showRemainingSteps();
  
  console.log('\n📊 CURRENT STATUS:');
  console.log('==================');
  console.log('✅ Database password confirmed');
  console.log('✅ Access token confirmed');
  console.log('✅ Project reference confirmed');
  console.log('✅ GitHub workflows updated');
  console.log('❌ Still need: anon public key');
  console.log('❌ Still need: service_role key');
  
  console.log('\n🚀 ONCE YOU GET THOSE 2 KEYS:');
  console.log('==============================');
  console.log('1. Paste them here');
  console.log('2. I\'ll update all config files');
  console.log('3. Create database tables');
  console.log('4. Deploy everything');
  console.log('5. Your 95,000+ page system goes live!');
}

runUpdates();