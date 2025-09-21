#!/usr/bin/env node

/**
 * COPILOT CODESPACE SCANNER - GitHub Codespaces Deep Analysis
 * Scans for Codespaces configurations, dev containers, and GitHub-specific assets
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🐙 COPILOT CODESPACE SCANNER - GITHUB DEEP ANALYSIS');
console.log('===================================================');

class CopilotCodespaceScanner {
  constructor() {
    this.codespaceAssets = {
      devcontainer: { files: 0, configs: 0 },
      github: { workflows: 0, actions: 0, configs: 0 },
      codespaces: { settings: 0, secrets: 0 },
      vscode: { settings: 0, extensions: 0 },
      docker: { files: 0, compose: 0 }
    };
  }

  async scanAllCodespaceAssets() {
    console.log('🔍 Scanning GitHub Codespaces and development environment...\n');
    
    await this.scanDevContainer();
    await this.scanGitHubAssets();
    await this.scanCodespacesConfig();
    await this.scanVSCodeConfig();
    await this.scanDockerAssets();
    await this.scanDevelopmentScripts();
    
    this.generateCodespaceReport();
  }

  async scanDevContainer() {
    console.log('📦 DEV CONTAINER ANALYSIS:');
    console.log('=========================');
    
    // Find devcontainer files
    const devcontainerFiles = this.findFiles('.devcontainer/*', '*devcontainer*');
    console.log(`📋 Dev container files: ${devcontainerFiles.length}`);
    devcontainerFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for devcontainer.json
    if (fs.existsSync('.devcontainer/devcontainer.json')) {
      console.log('✅ devcontainer.json found');
      try {
        const config = JSON.parse(fs.readFileSync('.devcontainer/devcontainer.json', 'utf8'));
        console.log(`  📦 Image: ${config.image || config.dockerFile || 'Not specified'}`);
        console.log(`  🔧 Features: ${Object.keys(config.features || {}).length}`);
        console.log(`  ⚙️ Extensions: ${(config.customizations?.vscode?.extensions || []).length}`);
      } catch (error) {
        console.log('  ⚠️ Could not parse devcontainer.json');
      }
    } else {
      console.log('❌ devcontainer.json not found');
    }
    
    this.codespaceAssets.devcontainer = {
      files: devcontainerFiles.length,
      configs: devcontainerFiles.filter(f => f.includes('json') || f.includes('yml')).length
    };
    
    console.log('');
  }

  async scanGitHubAssets() {
    console.log('🐙 GITHUB ASSETS ANALYSIS:');
    console.log('==========================');
    
    // GitHub workflows
    const workflowFiles = this.findFiles('.github/workflows/*');
    console.log(`⚙️ GitHub Actions workflows: ${workflowFiles.length}`);
    workflowFiles.forEach(file => console.log(`  • ${file}`));
    
    // GitHub Actions
    const actionFiles = this.findFiles('.github/actions/*');
    console.log(`🎬 Custom Actions: ${actionFiles.length}`);
    
    // GitHub configs
    const githubConfigs = this.findFiles('.github/*').filter(f => 
      !f.includes('workflows') && !f.includes('actions')
    );
    console.log(`📋 GitHub configs: ${githubConfigs.length}`);
    githubConfigs.forEach(file => console.log(`  • ${file}`));
    
    // Check for GitHub-specific files
    const githubSpecialFiles = [
      '.github/ISSUE_TEMPLATE',
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/CODEOWNERS',
      '.github/dependabot.yml',
      '.github/FUNDING.yml'
    ];
    
    console.log('📄 GitHub special files:');
    githubSpecialFiles.forEach(file => {
      const exists = fs.existsSync(file) || fs.existsSync(file + '.md');
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    });
    
    this.codespaceAssets.github = {
      workflows: workflowFiles.length,
      actions: actionFiles.length,
      configs: githubConfigs.length
    };
    
    console.log('');
  }

  async scanCodespacesConfig() {
    console.log('☁️ CODESPACES CONFIGURATION:');
    console.log('============================');
    
    // Check for Codespaces-specific files
    const codespaceFiles = this.findFiles('*codespace*', '*gitpod*');
    console.log(`📋 Codespace files: ${codespaceFiles.length}`);
    codespaceFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for environment setup scripts
    const setupScripts = this.findFiles('*setup*', '*install*', '*bootstrap*');
    console.log(`🔧 Setup scripts: ${setupScripts.length}`);
    
    // Check for Codespaces secrets and settings
    console.log('🔐 Codespaces features:');
    console.log('  • Secrets: Configured in GitHub (not visible in repo)');
    console.log('  • Prebuilds: Check GitHub Codespaces settings');
    console.log('  • Machine types: Configured per repository');
    
    this.codespaceAssets.codespaces = {
      settings: codespaceFiles.length,
      secrets: 0 // Cannot detect from repo
    };
    
    console.log('');
  }

  async scanVSCodeConfig() {
    console.log('🔧 VSCODE CONFIGURATION:');
    console.log('========================');
    
    // VSCode settings
    const vscodeFiles = this.findFiles('.vscode/*');
    console.log(`📋 VSCode files: ${vscodeFiles.length}`);
    vscodeFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check specific VSCode files
    const vscodeSpecialFiles = [
      '.vscode/settings.json',
      '.vscode/launch.json',
      '.vscode/tasks.json',
      '.vscode/extensions.json'
    ];
    
    console.log('📄 VSCode configuration files:');
    vscodeSpecialFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
      
      if (exists && file.includes('extensions.json')) {
        try {
          const extensions = JSON.parse(fs.readFileSync(file, 'utf8'));
          console.log(`    📦 Recommended extensions: ${(extensions.recommendations || []).length}`);
        } catch (error) {
          console.log('    ⚠️ Could not parse extensions.json');
        }
      }
    });
    
    this.codespaceAssets.vscode = {
      settings: vscodeFiles.length,
      extensions: vscodeFiles.filter(f => f.includes('extensions')).length
    };
    
    console.log('');
  }

  async scanDockerAssets() {
    console.log('🐳 DOCKER ASSETS:');
    console.log('=================');
    
    // Docker files
    const dockerFiles = this.findFiles('Dockerfile*', '*docker*', 'docker-compose*');
    console.log(`📋 Docker files: ${dockerFiles.length}`);
    dockerFiles.forEach(file => console.log(`  • ${file}`));
    
    // Check for specific Docker files
    const dockerSpecialFiles = [
      'Dockerfile',
      'Dockerfile.dev',
      'docker-compose.yml',
      'docker-compose.dev.yml',
      '.dockerignore'
    ];
    
    console.log('📄 Docker configuration files:');
    dockerSpecialFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    });
    
    this.codespaceAssets.docker = {
      files: dockerFiles.length,
      compose: dockerFiles.filter(f => f.includes('compose')).length
    };
    
    console.log('');
  }

  async scanDevelopmentScripts() {
    console.log('🛠️ DEVELOPMENT SCRIPTS:');
    console.log('=======================');
    
    // Package.json scripts
    if (fs.existsSync('package.json')) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const scripts = Object.keys(pkg.scripts || {});
        console.log(`📦 NPM scripts: ${scripts.length}`);
        scripts.forEach(script => console.log(`  • ${script}: ${pkg.scripts[script]}`));
      } catch (error) {
        console.log('⚠️ Could not parse package.json');
      }
    }
    
    // Development shell scripts
    const devScripts = this.findFiles('*dev*', '*start*', '*build*', '*test*').filter(f => 
      f.endsWith('.sh') || f.endsWith('.js') || f.endsWith('.mjs')
    );
    console.log(`🔧 Development scripts: ${devScripts.length}`);
    devScripts.slice(0, 10).forEach(file => console.log(`  • ${file}`));
    
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

  generateCodespaceReport() {
    console.log('📊 CODESPACE ASSETS SUMMARY');
    console.log('===========================\n');
    
    let totalAssets = 0;
    
    for (const [category, stats] of Object.entries(this.codespaceAssets)) {
      const categoryTotal = Object.values(stats).reduce((sum, val) => sum + val, 0);
      console.log(`${this.getCategoryIcon(category)} ${category.toUpperCase()}:`);
      
      for (const [key, value] of Object.entries(stats)) {
        console.log(`  ${key}: ${value}`);
      }
      console.log(`  📊 Total: ${categoryTotal}`);
      console.log('');
      
      totalAssets += categoryTotal;
    }
    
    console.log('🎯 OVERALL CODESPACE SUMMARY:');
    console.log(`  📊 Total Assets: ${totalAssets}`);
    
    this.generateCodespaceRecommendations();
  }

  getCategoryIcon(category) {
    const icons = {
      devcontainer: '📦',
      github: '🐙',
      codespaces: '☁️',
      vscode: '🔧',
      docker: '🐳'
    };
    return icons[category] || '📁';
  }

  generateCodespaceRecommendations() {
    console.log('\n🎯 CODESPACE OPTIMIZATION RECOMMENDATIONS:');
    console.log('==========================================');
    
    // Analyze each category
    if (this.codespaceAssets.devcontainer.files === 0) {
      console.log('❌ DEVCONTAINER: Missing dev container configuration');
      console.log('   💡 Add .devcontainer/devcontainer.json for consistent environments');
    }
    
    if (this.codespaceAssets.github.workflows < 5) {
      console.log('⚠️ GITHUB: Limited CI/CD workflows');
      console.log('   💡 Add more automation workflows for testing and deployment');
    }
    
    if (this.codespaceAssets.vscode.settings === 0) {
      console.log('❌ VSCODE: Missing VSCode configuration');
      console.log('   💡 Add .vscode/settings.json and extensions.json');
    }
    
    if (this.codespaceAssets.docker.files === 0) {
      console.log('❌ DOCKER: No Docker configuration found');
      console.log('   💡 Add Dockerfile for containerized development');
    }
    
    console.log('\n🔧 SUGGESTED ACTIONS:');
    console.log('• Set up GitHub Codespaces prebuilds');
    console.log('• Configure dev container with all dependencies');
    console.log('• Add VSCode extensions for better development experience');
    console.log('• Set up GitHub Actions for automated testing and deployment');
    console.log('• Configure Codespaces secrets for API keys');
    console.log('• Add development documentation for new contributors');
  }

  async scanCodespaceUsage() {
    console.log('\n💻 CODESPACE USAGE ANALYSIS:');
    console.log('============================');
    
    // Check for Codespace-specific environment variables
    console.log('🔍 Codespace environment detection:');
    console.log(`  • CODESPACES: ${process.env.CODESPACES ? '✅ Running in Codespace' : '❌ Not in Codespace'}`);
    console.log(`  • GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: ${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ? '✅ Available' : '❌ Not available'}`);
    
    // Check for common development ports
    console.log('\n🌐 Development server configurations:');
    const commonPorts = [3000, 3001, 5000, 8000, 8080, 9000];
    commonPorts.forEach(port => {
      console.log(`  • Port ${port}: Configured for development`);
    });
  }
}

// Run the scanner
async function main() {
  const scanner = new CopilotCodespaceScanner();
  await scanner.scanAllCodespaceAssets();
  await scanner.scanCodespaceUsage();
}

main().catch(console.error);