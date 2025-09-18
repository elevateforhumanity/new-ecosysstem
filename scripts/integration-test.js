#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Complete Integration Tests');
    console.log('=' .repeat(60));

    // Test file structure
    await this.testFileStructure();

    // Test configuration files
    await this.testConfigurationFiles();

    // Test build artifacts
    await this.testBuildArtifacts();

    // Test scripts
    await this.testScripts();

    // Test workflows
    await this.testWorkflows();

    // Display results
    this.displayResults();

    return {
      success: this.results.failed === 0,
      ...this.results
    };
  }

  async testFileStructure() {
    console.log('\n📁 Testing file structure...');

    const requiredFiles = [
      'package.json',
      'netlify.toml',
      '.env.development',
      '.env.staging',
      '.env.production',
      'supabase/config.toml',
      'supabase/schema.sql',
      'scripts/generate-sitemap.js',
      'scripts/sitemap-automation.js',
      'scripts/validate-environment.js',
      'docs/environment-setup.md'
    ];

    const requiredDirectories = [
      'netlify/functions',
      'supabase/functions',
      'vite-react-supabase-app',
      '.github/workflows',
      'data/seeds'
    ];

    for (const file of requiredFiles) {
      await this.testFileExists(file);
    }

    for (const dir of requiredDirectories) {
      await this.testDirectoryExists(dir);
    }
  }

  async testConfigurationFiles() {
    console.log('\n⚙️ Testing configuration files...');

    // Test package.json
    await this.testPackageJson();

    // Test netlify.toml
    await this.testNetlifyConfig();

    // Test Supabase config
    await this.testSupabaseConfig();

    // Test environment files
    await this.testEnvironmentFiles();
  }

  async testBuildArtifacts() {
    console.log('\n🏗️ Testing build artifacts...');

    // Test sitemap generation
    await this.testSitemapGeneration();

    // Test Vite build
    await this.testViteBuild();
  }

  async testScripts() {
    console.log('\n📜 Testing scripts...');

    const scripts = [
      'scripts/generate-sitemap.js',
      'scripts/sitemap-automation.js',
      'scripts/validate-environment.js'
    ];

    for (const script of scripts) {
      await this.testScriptExecutable(script);
    }
  }

  async testWorkflows() {
    console.log('\n🔄 Testing GitHub workflows...');

    const workflows = [
      '.github/workflows/deploy-production.yml',
      '.github/workflows/data-sync.yml',
      '.github/workflows/health-check.yml',
      '.github/workflows/sitemap-generation.yml'
    ];

    for (const workflow of workflows) {
      await this.testWorkflowSyntax(workflow);
    }
  }

  async testFileExists(filePath) {
    try {
      await fs.access(filePath);
      this.pass(`✅ File exists: ${filePath}`);
    } catch (error) {
      this.fail(`❌ File missing: ${filePath}`);
    }
  }

  async testDirectoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      if (stats.isDirectory()) {
        this.pass(`✅ Directory exists: ${dirPath}`);
      } else {
        this.fail(`❌ Path exists but is not a directory: ${dirPath}`);
      }
    } catch (error) {
      this.fail(`❌ Directory missing: ${dirPath}`);
    }
  }

  async testPackageJson() {
    try {
      const content = await fs.readFile('package.json', 'utf8');
      const pkg = JSON.parse(content);

      if (pkg.name) {
        this.pass('✅ package.json has name field');
      } else {
        this.fail('❌ package.json missing name field');
      }

      if (pkg.type === 'module') {
        this.pass('✅ package.json configured as ES module');
      } else {
        this.warn('⚠️ package.json not configured as ES module');
      }

      if (pkg.scripts) {
        this.pass('✅ package.json has scripts');
      } else {
        this.warn('⚠️ package.json missing scripts');
      }

    } catch (error) {
      this.fail(`❌ package.json invalid: ${error.message}`);
    }
  }

  async testNetlifyConfig() {
    try {
      const content = await fs.readFile('netlify.toml', 'utf8');
      
      if (content.includes('[build]')) {
        this.pass('✅ netlify.toml has build configuration');
      } else {
        this.fail('❌ netlify.toml missing build configuration');
      }

      if (content.includes('[[redirects]]')) {
        this.pass('✅ netlify.toml has redirects configuration');
      } else {
        this.warn('⚠️ netlify.toml missing redirects configuration');
      }

      if (content.includes('functions = "netlify/functions"')) {
        this.pass('✅ netlify.toml has functions configuration');
      } else {
        this.warn('⚠️ netlify.toml missing functions configuration');
      }

    } catch (error) {
      this.fail(`❌ netlify.toml invalid: ${error.message}`);
    }
  }

  async testSupabaseConfig() {
    try {
      const content = await fs.readFile('supabase/config.toml', 'utf8');
      
      if (content.includes('project_id')) {
        this.pass('✅ Supabase config has project_id');
      } else {
        this.fail('❌ Supabase config missing project_id');
      }

      if (content.includes('[edge_functions]')) {
        this.pass('✅ Supabase config has edge_functions section');
      } else {
        this.warn('⚠️ Supabase config missing edge_functions section');
      }

    } catch (error) {
      this.fail(`❌ Supabase config invalid: ${error.message}`);
    }
  }

  async testEnvironmentFiles() {
    const envFiles = ['.env.development', '.env.staging', '.env.production'];

    for (const envFile of envFiles) {
      try {
        const content = await fs.readFile(envFile, 'utf8');
        
        if (content.includes('NODE_ENV=')) {
          this.pass(`✅ ${envFile} has NODE_ENV`);
        } else {
          this.fail(`❌ ${envFile} missing NODE_ENV`);
        }

        if (content.includes('BASE_URL=')) {
          this.pass(`✅ ${envFile} has BASE_URL`);
        } else {
          this.fail(`❌ ${envFile} missing BASE_URL`);
        }

      } catch (error) {
        this.fail(`❌ ${envFile} invalid: ${error.message}`);
      }
    }
  }

  async testSitemapGeneration() {
    try {
      // Check if sitemaps were generated
      await fs.access('deploy/sitemap.xml');
      this.pass('✅ Sitemap index generated');

      await fs.access('deploy/sitemap-main.xml');
      this.pass('✅ Main sitemap generated');

      // Check for program sitemaps
      const deployDir = await fs.readdir('deploy');
      const programSitemaps = deployDir.filter(file => file.startsWith('sitemap-programs-'));
      
      if (programSitemaps.length > 0) {
        this.pass(`✅ Program sitemaps generated (${programSitemaps.length})`);
      } else {
        this.warn('⚠️ No program sitemaps found');
      }

    } catch (error) {
      this.fail(`❌ Sitemap generation test failed: ${error.message}`);
    }
  }

  async testViteBuild() {
    try {
      await fs.access('vite-react-supabase-app/dist/index.html');
      this.pass('✅ Vite build output exists');

      const distDir = await fs.readdir('vite-react-supabase-app/dist');
      const hasAssets = distDir.some(file => file.startsWith('assets'));
      
      if (hasAssets) {
        this.pass('✅ Vite build has assets');
      } else {
        this.warn('⚠️ Vite build missing assets directory');
      }

    } catch (error) {
      this.fail(`❌ Vite build test failed: ${error.message}`);
    }
  }

  async testScriptExecutable(scriptPath) {
    try {
      const stats = await fs.stat(scriptPath);
      
      // Check if file is executable (Unix permissions)
      if (stats.mode & parseInt('111', 8)) {
        this.pass(`✅ Script is executable: ${scriptPath}`);
      } else {
        this.warn(`⚠️ Script not executable: ${scriptPath}`);
      }

      // Check if script has proper shebang
      const content = await fs.readFile(scriptPath, 'utf8');
      if (content.startsWith('#!/usr/bin/env node')) {
        this.pass(`✅ Script has proper shebang: ${scriptPath}`);
      } else {
        this.warn(`⚠️ Script missing shebang: ${scriptPath}`);
      }

    } catch (error) {
      this.fail(`❌ Script test failed for ${scriptPath}: ${error.message}`);
    }
  }

  async testWorkflowSyntax(workflowPath) {
    try {
      const content = await fs.readFile(workflowPath, 'utf8');
      
      if (content.includes('name:')) {
        this.pass(`✅ Workflow has name: ${workflowPath}`);
      } else {
        this.fail(`❌ Workflow missing name: ${workflowPath}`);
      }

      if (content.includes('on:')) {
        this.pass(`✅ Workflow has triggers: ${workflowPath}`);
      } else {
        this.fail(`❌ Workflow missing triggers: ${workflowPath}`);
      }

      if (content.includes('jobs:')) {
        this.pass(`✅ Workflow has jobs: ${workflowPath}`);
      } else {
        this.fail(`❌ Workflow missing jobs: ${workflowPath}`);
      }

    } catch (error) {
      this.fail(`❌ Workflow test failed for ${workflowPath}: ${error.message}`);
    }
  }

  pass(message) {
    this.results.passed++;
    this.results.tests.push({ type: 'pass', message });
    console.log(message);
  }

  fail(message) {
    this.results.failed++;
    this.results.tests.push({ type: 'fail', message });
    console.log(message);
  }

  warn(message) {
    this.results.warnings++;
    this.results.tests.push({ type: 'warn', message });
    console.log(message);
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));

    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️ Warnings: ${this.results.warnings}`);
    console.log(`📋 Total: ${this.results.tests.length}`);

    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 All integration tests passed!');
      if (this.results.warnings > 0) {
        console.log(`⚠️ ${this.results.warnings} warning(s) found - review recommended`);
      }
    } else {
      console.log(`💥 ${this.results.failed} test(s) failed - integration incomplete`);
    }
    
    console.log('='.repeat(60));
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new IntegrationTester();
  
  tester.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Integration test failed:', error.message);
      process.exit(1);
    });
}

export default IntegrationTester;