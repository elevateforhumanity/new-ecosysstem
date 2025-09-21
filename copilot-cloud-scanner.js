#!/usr/bin/env node

/**
 * COPILOT CLOUD SCANNER - Deep Platform Analysis
 * Scans all cloud platforms for missing deployments and configurations
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('☁️ COPILOT CLOUD SCANNER - DEEP PLATFORM ANALYSIS');
console.log('==================================================');

class CopilotCloudScanner {
  constructor() {
    this.platforms = {
      netlify: { files: 0, configs: 0, deployments: 0 },
      cloudflare: { files: 0, configs: 0, deployments: 0 },
      supabase: { files: 0, configs: 0, deployments: 0 },
      replit: { files: 0, configs: 0, deployments: 0 },
      github: { files: 0, configs: 0, deployments: 0 }
    };
  }

  async scanAllPlatforms() {
    console.log('🔍 Scanning all cloud platforms for missing components...\n');
    
    await this.scanNetlify();
    await this.scanCloudflare();
    await this.scanSupabase();
    await this.scanReplit();
    await this.scanGitHub();
    
    this.generateCloudReport();
  }

  async scanNetlify() {
    console.log('📡 NETLIFY ANALYSIS:');
    console.log('===================');
    
    // Find Netlify configuration files
    const netlifyConfigs = this.findFiles('*netlify*');
    console.log(`📋 Configuration files: ${netlifyConfigs.length}`);
    netlifyConfigs.forEach(file => console.log(`  • ${file}`));
    
    // Check for deployment artifacts
    const deploymentFiles = this.findFiles('*deploy*');
    console.log(`🚀 Deployment files: ${deploymentFiles.length}`);
    
    // Check for build outputs
    const buildFiles = this.findFiles('dist/*', 'build/*', '.netlify/*');
    console.log(`🔨 Build artifacts: ${buildFiles.length}`);
    
    this.platforms.netlify = {
      files: netlifyConfigs.length,
      configs: netlifyConfigs.filter(f => f.includes('toml') || f.includes('config')).length,
      deployments: deploymentFiles.length
    };
    
    console.log('');
  }

  async scanCloudflare() {
    console.log('⚡ CLOUDFLARE ANALYSIS:');
    console.log('======================');
    
    const cloudflareFiles = this.findFiles('*cloudflare*');
    console.log(`📋 Configuration files: ${cloudflareFiles.length}`);
    cloudflareFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for Workers
    const workerFiles = this.findFiles('*worker*', '*edge*');
    console.log(`⚙️ Worker files: ${workerFiles.length}`);
    
    // Check for Pages config
    const pagesFiles = this.findFiles('*pages*');
    console.log(`📄 Pages files: ${pagesFiles.length}`);
    
    this.platforms.cloudflare = {
      files: cloudflareFiles.length,
      configs: cloudflareFiles.filter(f => f.includes('config') || f.includes('setup')).length,
      deployments: workerFiles.length + pagesFiles.length
    };
    
    console.log('');
  }

  async scanSupabase() {
    console.log('🗄️ SUPABASE ANALYSIS:');
    console.log('=====================');
    
    const supabaseFiles = this.findFiles('*supabase*');
    console.log(`📋 Configuration files: ${supabaseFiles.length}`);
    supabaseFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for functions
    const functionFiles = this.findFiles('supabase/functions/*');
    console.log(`⚡ Edge functions: ${functionFiles.length}`);
    
    // Check for schemas
    const schemaFiles = this.findFiles('*.sql', '*schema*');
    console.log(`🗃️ Database schemas: ${schemaFiles.length}`);
    
    this.platforms.supabase = {
      files: supabaseFiles.length,
      configs: supabaseFiles.filter(f => f.includes('config') || f.includes('toml')).length,
      deployments: functionFiles.length
    };
    
    console.log('');
  }

  async scanReplit() {
    console.log('🔄 REPLIT ANALYSIS:');
    console.log('==================');
    
    const replitFiles = this.findFiles('*replit*', '.replit');
    console.log(`📋 Configuration files: ${replitFiles.length}`);
    replitFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for deployment scripts
    const deployScripts = this.findFiles('*deploy*replit*');
    console.log(`🚀 Deployment scripts: ${deployScripts.length}`);
    
    this.platforms.replit = {
      files: replitFiles.length,
      configs: replitFiles.filter(f => f.includes('.replit') || f.includes('config')).length,
      deployments: deployScripts.length
    };
    
    console.log('');
  }

  async scanGitHub() {
    console.log('🐙 GITHUB ANALYSIS:');
    console.log('===================');
    
    const githubFiles = this.findFiles('.github/*');
    console.log(`📋 GitHub files: ${githubFiles.length}`);
    
    // Check workflows
    const workflowFiles = this.findFiles('.github/workflows/*');
    console.log(`⚙️ Workflows: ${workflowFiles.length}`);
    workflowFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for Actions
    const actionFiles = this.findFiles('.github/actions/*');
    console.log(`🎬 Actions: ${actionFiles.length}`);
    
    this.platforms.github = {
      files: githubFiles.length,
      configs: workflowFiles.length,
      deployments: actionFiles.length
    };
    
    console.log('');
  }

  findFiles(...patterns) {
    const allFiles = [];
    
    for (const pattern of patterns) {
      try {
        const result = execSync(`find . -path "${pattern}" -type f | grep -v node_modules | head -20`, 
          { encoding: 'utf8' });
        const files = result.trim().split('\n').filter(line => line.length > 0);
        allFiles.push(...files);
      } catch (error) {
        // Pattern not found
      }
    }
    
    return [...new Set(allFiles)]; // Remove duplicates
  }

  generateCloudReport() {
    console.log('📊 CLOUD PLATFORM SUMMARY');
    console.log('=========================\n');
    
    let totalFiles = 0;
    let totalConfigs = 0;
    let totalDeployments = 0;
    
    for (const [platform, stats] of Object.entries(this.platforms)) {
      console.log(`${this.getPlatformIcon(platform)} ${platform.toUpperCase()}:`);
      console.log(`  📄 Files: ${stats.files}`);
      console.log(`  ⚙️ Configs: ${stats.configs}`);
      console.log(`  🚀 Deployments: ${stats.deployments}`);
      console.log(`  📊 Total: ${stats.files + stats.configs + stats.deployments}`);
      console.log('');
      
      totalFiles += stats.files;
      totalConfigs += stats.configs;
      totalDeployments += stats.deployments;
    }
    
    console.log('🎯 OVERALL SUMMARY:');
    console.log(`  📄 Total Files: ${totalFiles}`);
    console.log(`  ⚙️ Total Configs: ${totalConfigs}`);
    console.log(`  🚀 Total Deployments: ${totalDeployments}`);
    console.log(`  📊 Grand Total: ${totalFiles + totalConfigs + totalDeployments}`);
    
    this.generateRecommendations();
  }

  getPlatformIcon(platform) {
    const icons = {
      netlify: '📡',
      cloudflare: '⚡',
      supabase: '🗄️',
      replit: '🔄',
      github: '🐙'
    };
    return icons[platform] || '📁';
  }

  generateRecommendations() {
    console.log('\n🎯 COPILOT RECOMMENDATIONS:');
    console.log('===========================');
    
    // Analyze each platform
    for (const [platform, stats] of Object.entries(this.platforms)) {
      if (stats.files < 5) {
        console.log(`⚠️ ${platform.toUpperCase()}: Low file count - may need more configuration`);
      }
      
      if (stats.configs === 0) {
        console.log(`❌ ${platform.toUpperCase()}: Missing configuration files`);
      }
      
      if (stats.deployments === 0) {
        console.log(`🚨 ${platform.toUpperCase()}: No deployment artifacts found`);
      }
    }
    
    console.log('\n🔧 SUGGESTED ACTIONS:');
    console.log('• Run platform-specific setup scripts');
    console.log('• Verify all API keys and credentials');
    console.log('• Check deployment status on each platform');
    console.log('• Merge copilot branches with platform fixes');
    console.log('• Run comprehensive health check');
  }

  async scanForMissingIntegrations() {
    console.log('\n🔗 INTEGRATION ANALYSIS:');
    console.log('========================');
    
    const integrations = {
      'Stripe': this.findFiles('*stripe*').length,
      'OpenAI': this.findFiles('*openai*', '*gpt*').length,
      'Analytics': this.findFiles('*analytics*', '*tracking*').length,
      'Email': this.findFiles('*email*', '*smtp*').length,
      'SMS': this.findFiles('*sms*', '*twilio*').length
    };
    
    for (const [service, count] of Object.entries(integrations)) {
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${service}: ${count} files`);
    }
  }
}

// Run the scanner
async function main() {
  const scanner = new CopilotCloudScanner();
  await scanner.scanAllPlatforms();
  await scanner.scanForMissingIntegrations();
}

main().catch(console.error);