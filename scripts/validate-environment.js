#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentValidator {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  async validate() {
    console.log(`🔍 Validating environment: ${this.environment}`);
    console.log('=' .repeat(50));

    // Load environment file
    this.loadEnvironmentFile();

    // Validate core settings
    this.validateCoreSettings();

    // Validate platform configurations
    this.validateNetlify();
    this.validateSupabase();
    this.validateCloudflareR2();

    // Validate external services
    this.validateStripe();
    this.validateSendGrid();
    this.validateAIServices();

    // Validate security settings
    this.validateSecurity();

    // Validate feature flags
    this.validateFeatureFlags();

    // Display results
    this.displayResults();

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info
    };
  }

  loadEnvironmentFile() {
    const envFile = `.env.${this.environment}`;
    
    if (fs.existsSync(envFile)) {
      this.info.push(`✅ Environment file found: ${envFile}`);
      
      // Load environment variables from file
      const envContent = fs.readFileSync(envFile, 'utf8');
      const envVars = envContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            acc[key.trim()] = valueParts.join('=').trim();
          }
          return acc;
        }, {});

      // Merge with process.env (process.env takes precedence)
      Object.keys(envVars).forEach(key => {
        if (!process.env[key]) {
          process.env[key] = envVars[key];
        }
      });
    } else {
      this.warnings.push(`⚠️ Environment file not found: ${envFile}`);
    }
  }

  validateCoreSettings() {
    this.info.push('\n📋 Validating core settings...');

    const required = [
      'NODE_ENV',
      'BASE_URL',
      'API_BASE_URL'
    ];

    required.forEach(key => {
      if (!process.env[key]) {
        this.errors.push(`❌ Missing required variable: ${key}`);
      } else {
        this.info.push(`✅ ${key}: ${process.env[key]}`);
      }
    });

    // Validate URLs
    if (process.env.BASE_URL && !this.isValidUrl(process.env.BASE_URL)) {
      this.errors.push(`❌ Invalid BASE_URL format: ${process.env.BASE_URL}`);
    }

    if (process.env.API_BASE_URL && !this.isValidUrl(process.env.API_BASE_URL)) {
      this.errors.push(`❌ Invalid API_BASE_URL format: ${process.env.API_BASE_URL}`);
    }
  }

  validateNetlify() {
    this.info.push('\n🌐 Validating Netlify configuration...');

    const required = [
      'NETLIFY_SITE_ID',
      'NETLIFY_AUTH_TOKEN'
    ];

    const optional = [
      'NETLIFY_BUILD_HOOK',
      'NETLIFY_STAGING_SITE_ID'
    ];

    required.forEach(key => {
      if (!process.env[key]) {
        this.errors.push(`❌ Missing required Netlify variable: ${key}`);
      } else {
        this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
      }
    });

    optional.forEach(key => {
      if (process.env[key]) {
        this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
      } else {
        this.warnings.push(`⚠️ Optional Netlify variable not set: ${key}`);
      }
    });
  }

  validateSupabase() {
    this.info.push('\n🗄️ Validating Supabase configuration...');

    const required = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_PROJECT_REF'
    ];

    required.forEach(key => {
      if (!process.env[key]) {
        this.errors.push(`❌ Missing required Supabase variable: ${key}`);
      } else {
        if (key === 'SUPABASE_URL') {
          if (!this.isValidUrl(process.env[key])) {
            this.errors.push(`❌ Invalid SUPABASE_URL format: ${process.env[key]}`);
          } else {
            this.info.push(`✅ ${key}: ${process.env[key]}`);
          }
        } else {
          this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
        }
      }
    });
  }

  validateCloudflareR2() {
    this.info.push('\n☁️ Validating Cloudflare R2 configuration...');

    const required = [
      'CLOUDFLARE_R2_ACCOUNT_ID',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_BUCKET_NAME'
    ];

    let hasAnyR2Config = required.some(key => process.env[key]);

    if (hasAnyR2Config) {
      required.forEach(key => {
        if (!process.env[key]) {
          this.errors.push(`❌ Missing required R2 variable: ${key}`);
        } else {
          this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
        }
      });
    } else {
      this.warnings.push('⚠️ Cloudflare R2 not configured (optional)');
    }
  }

  validateStripe() {
    this.info.push('\n💳 Validating Stripe configuration...');

    const required = [
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY'
    ];

    const optional = [
      'STRIPE_WEBHOOK_SECRET'
    ];

    let hasAnyStripeConfig = required.some(key => process.env[key]);

    if (hasAnyStripeConfig) {
      required.forEach(key => {
        if (!process.env[key]) {
          this.errors.push(`❌ Missing required Stripe variable: ${key}`);
        } else {
          // Validate key format
          if (key === 'STRIPE_PUBLISHABLE_KEY' && !process.env[key].startsWith('pk_')) {
            this.errors.push(`❌ Invalid Stripe publishable key format: ${key}`);
          } else if (key === 'STRIPE_SECRET_KEY' && !process.env[key].startsWith('sk_')) {
            this.errors.push(`❌ Invalid Stripe secret key format: ${key}`);
          } else {
            this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
          }
        }
      });

      optional.forEach(key => {
        if (process.env[key]) {
          this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
        } else {
          this.warnings.push(`⚠️ Optional Stripe variable not set: ${key}`);
        }
      });

      // Check environment consistency
      if (this.environment === 'production') {
        if (process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.includes('live')) {
          this.warnings.push('⚠️ Using test Stripe keys in production environment');
        }
      }
    } else {
      this.warnings.push('⚠️ Stripe not configured (optional)');
    }
  }

  validateSendGrid() {
    this.info.push('\n📧 Validating SendGrid configuration...');

    const required = [
      'SENDGRID_API_KEY',
      'SENDGRID_FROM_EMAIL'
    ];

    const optional = [
      'SENDGRID_FROM_NAME'
    ];

    let hasAnyEmailConfig = required.some(key => process.env[key]);

    if (hasAnyEmailConfig) {
      required.forEach(key => {
        if (!process.env[key]) {
          this.errors.push(`❌ Missing required SendGrid variable: ${key}`);
        } else {
          if (key === 'SENDGRID_FROM_EMAIL' && !this.isValidEmail(process.env[key])) {
            this.errors.push(`❌ Invalid email format: ${process.env[key]}`);
          } else {
            this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
          }
        }
      });

      optional.forEach(key => {
        if (process.env[key]) {
          this.info.push(`✅ ${key}: ${process.env[key]}`);
        }
      });
    } else {
      this.warnings.push('⚠️ SendGrid not configured (optional)');
    }
  }

  validateAIServices() {
    this.info.push('\n🤖 Validating AI services configuration...');

    const aiServices = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY'
    ];

    let hasAnyAIConfig = aiServices.some(key => process.env[key]);

    if (hasAnyAIConfig) {
      aiServices.forEach(key => {
        if (process.env[key]) {
          this.info.push(`✅ ${key}: ${this.maskSecret(process.env[key])}`);
        }
      });
    } else {
      this.warnings.push('⚠️ AI services not configured (optional)');
    }
  }

  validateSecurity() {
    this.info.push('\n🔒 Validating security configuration...');

    const securityVars = [
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'SESSION_SECRET'
    ];

    securityVars.forEach(key => {
      if (!process.env[key]) {
        this.errors.push(`❌ Missing security variable: ${key}`);
      } else {
        const value = process.env[key];
        
        // Check minimum length
        if (value.length < 32) {
          this.warnings.push(`⚠️ ${key} should be at least 32 characters long`);
        }
        
        // Check for common weak values
        if (['secret', 'password', '123456', 'changeme'].includes(value.toLowerCase())) {
          this.errors.push(`❌ ${key} uses a weak/default value`);
        } else {
          this.info.push(`✅ ${key}: ${this.maskSecret(value)}`);
        }
      }
    });
  }

  validateFeatureFlags() {
    this.info.push('\n🚩 Validating feature flags...');

    const featureFlags = [
      'ENABLE_AI_FEATURES',
      'ENABLE_ADVANCED_ANALYTICS',
      'ENABLE_MULTI_TENANT',
      'ENABLE_CACHING'
    ];

    featureFlags.forEach(key => {
      if (process.env[key]) {
        const value = process.env[key].toLowerCase();
        if (['true', 'false'].includes(value)) {
          this.info.push(`✅ ${key}: ${value}`);
        } else {
          this.warnings.push(`⚠️ ${key} should be 'true' or 'false', got: ${value}`);
        }
      }
    });
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  maskSecret(value) {
    if (!value || value.length < 8) return '***';
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  }

  displayResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION RESULTS');
    console.log('='.repeat(50));

    if (this.info.length > 0) {
      console.log('\n📋 Information:');
      this.info.forEach(msg => console.log(msg));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(msg => console.log(msg));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(msg => console.log(msg));
    }

    console.log('\n' + '='.repeat(50));
    
    if (this.errors.length === 0) {
      console.log('✅ Environment validation passed!');
      if (this.warnings.length > 0) {
        console.log(`⚠️ ${this.warnings.length} warning(s) found`);
      }
    } else {
      console.log(`❌ Environment validation failed with ${this.errors.length} error(s)`);
    }
    
    console.log('='.repeat(50));
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EnvironmentValidator();
  
  validator.validate()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Validation failed:', error.message);
      process.exit(1);
    });
}

export default EnvironmentValidator;