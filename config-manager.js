#!/usr/bin/env node

/**
 * Secure Configuration Manager for EFH Platform
 * Safely accesses environment variables without exposing secrets
 */

import { config } from 'dotenv';

// Load environment variables
config();

class ConfigManager {
  constructor() {
    this.requiredSecrets = [
      'DATABASE_URL',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    this.optionalSecrets = [
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'SENDGRID_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN'
    ];
  }

  // Check if required secrets are available
  validateSecrets() {
    console.log('🔐 Checking required configuration...');
    
    const missing = [];
    const available = [];
    
    this.requiredSecrets.forEach(secret => {
      if (process.env[secret]) {
        available.push(secret);
        console.log(`✅ ${secret}: Available`);
      } else {
        missing.push(secret);
        console.log(`❌ ${secret}: Missing`);
      }
    });
    
    console.log('\n📋 Optional configuration:');
    this.optionalSecrets.forEach(secret => {
      if (process.env[secret]) {
        console.log(`✅ ${secret}: Available`);
        available.push(secret);
      } else {
        console.log(`⚪ ${secret}: Not configured`);
      }
    });
    
    return {
      valid: missing.length === 0,
      missing,
      available,
      total: available.length
    };
  }

  // Get configuration safely (never logs actual values)
  getConfig() {
    return {
      database: {
        hasUrl: !!process.env.DATABASE_URL,
        connectionType: process.env.DATABASE_URL ? 'Supabase' : 'None'
      },
      supabase: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY
      },
      stripe: {
        hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY
      },
      sendgrid: {
        hasApiKey: !!process.env.SENDGRID_API_KEY
      },
      twilio: {
        hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN
      }
    };
  }

  // Get database connection string securely
  getDatabaseUrl() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    return process.env.DATABASE_URL;
  }

  // Get Supabase config securely
  getSupabaseConfig() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration incomplete');
    }
    
    return {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY
    };
  }

  // Display configuration summary (safe for logging)
  displayConfigSummary() {
    const config = this.getConfig();
    
    console.log('\n🏗️ EFH Platform Configuration Summary:');
    console.log('='.repeat(50));
    
    console.log('\n📊 Database:');
    console.log(`  Connection: ${config.database.connectionType}`);
    console.log(`  Status: ${config.database.hasUrl ? '✅ Ready' : '❌ Not configured'}`);
    
    console.log('\n🗄️ Supabase:');
    console.log(`  URL: ${config.supabase.hasUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`  Anonymous Key: ${config.supabase.hasAnonKey ? '✅ Set' : '❌ Missing'}`);
    
    console.log('\n💳 Stripe (Payments):');
    console.log(`  Publishable Key: ${config.stripe.hasPublishableKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`  Secret Key: ${config.stripe.hasSecretKey ? '✅ Set' : '❌ Missing'}`);
    
    console.log('\n📧 SendGrid (Email):');
    console.log(`  API Key: ${config.sendgrid.hasApiKey ? '✅ Set' : '❌ Missing'}`);
    
    console.log('\n📱 Twilio (SMS):');
    console.log(`  Account SID: ${config.twilio.hasAccountSid ? '✅ Set' : '❌ Missing'}`);
    console.log(`  Auth Token: ${config.twilio.hasAuthToken ? '✅ Set' : '❌ Missing'}`);
  }

  // Generate environment template (for documentation)
  generateEnvTemplate() {
    console.log('\n📋 Environment Variables Template:');
    console.log('='.repeat(50));
    console.log(`
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase Configuration  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Stripe Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_key
STRIPE_SECRET_KEY=sk_live_or_test_key

# SendGrid Email Service
SENDGRID_API_KEY=SG.your-api-key

# Twilio SMS Service
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
`);
  }
}

// Main execution
async function main() {
  console.log('🚀 EFH Platform - Secure Configuration Manager\n');
  
  try {
    const configManager = new ConfigManager();
    
    // Validate secrets
    const validation = configManager.validateSecrets();
    
    if (!validation.valid) {
      console.log(`\n⚠️ Missing ${validation.missing.length} required secrets:`);
      validation.missing.forEach(secret => {
        console.log(`  • ${secret}`);
      });
      console.log('\nPlease configure these secrets in your Replit environment.');
    } else {
      console.log('\n✅ All required secrets are configured!');
    }
    
    console.log(`\n📊 Total configured secrets: ${validation.total}`);
    
    // Display summary
    configManager.displayConfigSummary();
    
    // Show template
    configManager.generateEnvTemplate();
    
  } catch (error) {
    console.error('\n❌ Configuration check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ConfigManager };