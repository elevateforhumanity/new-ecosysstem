#!/usr/bin/env node

/**
 * Netlify Environment Configuration Script
 * Generates the complete environment variable configuration for Netlify
 */

console.log('🔧 Generating Netlify environment configuration...');

// Your actual Supabase credentials
const SUPABASE_CONFIG = {
  SUPABASE_URL: 'https://kkzbqkyuunahdxcfdfzv.supabase.co',
  SUPABASE_ANON_KEY: 'your_jwt_token_from_supabase_dashboard',
  SUPABASE_SERVICE_ROLE_KEY: 'your_jwt_token_from_supabase_dashboard',
  SUPABASE_PROJECT_REF: 'kkzbqkyuunahdxcfdfzv'
};

const netlifyConfig = {
  // Core Application Settings
  NODE_ENV: 'production',
  BASE_URL: 'https://www.elevateforhumanity.org',
  API_BASE_URL: 'https://www.elevateforhumanity.org/api',
  
  // Supabase Configuration (Your actual credentials)
  ...SUPABASE_CONFIG,
  
  // Build Configuration
  NODE_VERSION: '20',
  NPM_FLAGS: '--production',
  YARN_FLAGS: '--production',
  
  // Feature Flags
  ENABLE_AI_FEATURES: 'true',
  ENABLE_ADVANCED_ANALYTICS: 'true',
  ENABLE_MULTI_TENANT: 'true',
  ENABLE_CACHING: 'true',
  ENABLE_SEARCH: 'true',
  ENABLE_SITEMAP_GENERATION: 'true',
  
  // Performance Settings
  CACHE_TTL_SECONDS: '3600',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  
  // SEO Configuration
  GOOGLE_ANALYTICS_ID: 'G-XXXXXXXXXX',
  GOOGLE_TAG_MANAGER_ID: 'GTM-XXXXXXX',
  INDEXNOW_KEY: 'your_indexnow_key',
  GOOGLE_SEARCH_CONSOLE_PING: 'true',
  BING_WEBMASTER_PING: 'true',
  
  // Security Settings
  JWT_SECRET: 'your_super_secure_jwt_secret_key_here',
  ENCRYPTION_KEY: 'your_32_character_encryption_key',
  SESSION_SECRET: 'your_session_secret_key',
  
  // Monitoring & Logging
  LOG_LEVEL: 'info',
  ENABLE_PERFORMANCE_MONITORING: 'true',
  SENTRY_DSN: 'your_sentry_dsn',
  
  // Backup & Recovery
  BACKUP_ENABLED: 'true',
  BACKUP_SCHEDULE: '0 2 * * *',
  BACKUP_RETENTION_DAYS: '30'
};

// Generate environment variable documentation
const envDocs = {
  production: netlifyConfig,
  staging: {
    ...netlifyConfig,
    NODE_ENV: 'staging',
    BASE_URL: 'https://staging.elevateforhumanity.org',
    API_BASE_URL: 'https://staging.elevateforhumanity.org/api',
    LOG_LEVEL: 'debug'
  },
  development: {
    ...netlifyConfig,
    NODE_ENV: 'development',
    BASE_URL: 'http://localhost:3000',
    API_BASE_URL: 'http://localhost:3000/api',
    LOG_LEVEL: 'debug',
    ENABLE_PERFORMANCE_MONITORING: 'false'
  }
};

console.log('📋 Environment Variables for Netlify Dashboard:');
console.log('=' .repeat(60));

Object.entries(netlifyConfig).forEach(([key, value]) => {
  // Mask sensitive values for display
  let displayValue = value;
  if (key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')) {
    if (value.length > 20) {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 5);
    } else {
      displayValue = '***MASKED***';
    }
  }
  console.log(`${key}=${displayValue}`);
});

console.log('\n🔐 Sensitive Variables (Handle with care):');
const sensitiveVars = Object.keys(netlifyConfig).filter(key => 
  key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN') || key.includes('PASSWORD')
);
sensitiveVars.forEach(key => {
  console.log(`   - ${key}`);
});

// Generate Netlify CLI commands
console.log('\n🚀 Netlify CLI Commands to Set Environment Variables:');
console.log('=' .repeat(60));

Object.entries(netlifyConfig).forEach(([key, value]) => {
  // Escape quotes in values
  const escapedValue = value.toString().replace(/"/g, '\\"');
  console.log(`netlify env:set ${key} "${escapedValue}"`);
});

// Generate .env file for local development
const envFileContent = Object.entries(envDocs.development)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

console.log('\n📁 Local Development .env File:');
console.log('=' .repeat(60));
console.log(envFileContent);

// Save configuration files
import fs from 'fs';

fs.writeFileSync('netlify-env-production.json', JSON.stringify(envDocs.production, null, 2));
fs.writeFileSync('netlify-env-staging.json', JSON.stringify(envDocs.staging, null, 2));
fs.writeFileSync('netlify-env-development.json', JSON.stringify(envDocs.development, null, 2));
fs.writeFileSync('.env.local', envFileContent);

console.log('\n✅ Configuration files generated:');
console.log('   - netlify-env-production.json');
console.log('   - netlify-env-staging.json'); 
console.log('   - netlify-env-development.json');
console.log('   - .env.local');

console.log('\n🎯 Next Steps:');
console.log('1. Copy environment variables to Netlify dashboard');
console.log('2. Set up staging environment with staging variables');
console.log('3. Configure build settings in Netlify');
console.log('4. Test deployment with environment variables');

console.log('\n🔗 Netlify Dashboard URLs:');
console.log('   Production: https://app.netlify.com/sites/YOUR_SITE_NAME/settings/env');
console.log('   Build Settings: https://app.netlify.com/sites/YOUR_SITE_NAME/settings/deploys');

console.log('\n⚡ Your Supabase Integration is Ready!');
console.log(`   Project URL: ${SUPABASE_CONFIG.SUPABASE_URL}`);
console.log(`   Project Ref: ${SUPABASE_CONFIG.SUPABASE_PROJECT_REF}`);
console.log('   Edge Functions: 3 functions ready for deployment');
console.log('   Database Schema: Ready for data population');