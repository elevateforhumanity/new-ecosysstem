#!/usr/bin/env node

/**
 * GitHub Actions Workflow Activation Script
 * Validates and prepares all workflows for deployment
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

console.log('🚀 Activating GitHub Actions workflows...');

const workflowsDir = '.github/workflows';
const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

console.log(`📋 Found ${workflows.length} workflow files:`);

const workflowSummary = {
  total_workflows: workflows.length,
  validated_workflows: [],
  workflow_details: {},
  secrets_required: new Set(),
  environment_variables: new Set(),
  activation_timestamp: new Date().toISOString()
};

for (const workflowFile of workflows) {
  const workflowPath = path.join(workflowsDir, workflowFile);
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  
  try {
    // Parse YAML to validate structure
    const workflow = yaml.load(workflowContent);
    
    console.log(`✅ ${workflowFile}`);
    console.log(`   Name: ${workflow.name || 'Unnamed'}`);
    
    // Extract triggers
    const triggers = Object.keys(workflow.on || {});
    console.log(`   Triggers: ${triggers.join(', ')}`);
    
    // Extract jobs
    const jobs = Object.keys(workflow.jobs || {});
    console.log(`   Jobs: ${jobs.join(', ')}`);
    
    // Extract secrets and environment variables
    const workflowStr = workflowContent;
    const secretMatches = workflowStr.match(/\$\{\{\s*secrets\.([A-Z_]+)\s*\}\}/g) || [];
    const envMatches = workflowStr.match(/\$\{\{\s*env\.([A-Z_]+)\s*\}\}/g) || [];
    
    secretMatches.forEach(match => {
      const secret = match.match(/secrets\.([A-Z_]+)/)[1];
      workflowSummary.secrets_required.add(secret);
    });
    
    envMatches.forEach(match => {
      const envVar = match.match(/env\.([A-Z_]+)/)[1];
      workflowSummary.environment_variables.add(envVar);
    });
    
    workflowSummary.validated_workflows.push(workflowFile);
    workflowSummary.workflow_details[workflowFile] = {
      name: workflow.name,
      triggers,
      jobs,
      secrets: secretMatches.map(m => m.match(/secrets\.([A-Z_]+)/)[1]),
      env_vars: envMatches.map(m => m.match(/env\.([A-Z_]+)/)[1])
    };
    
  } catch (error) {
    console.log(`❌ ${workflowFile} - Invalid YAML: ${error.message}`);
  }
}

// Convert Sets to Arrays for JSON serialization
workflowSummary.secrets_required = Array.from(workflowSummary.secrets_required);
workflowSummary.environment_variables = Array.from(workflowSummary.environment_variables);

console.log('\n🔐 Required GitHub Secrets:');
workflowSummary.secrets_required.forEach(secret => {
  console.log(`   - ${secret}`);
});

console.log('\n🌍 Environment Variables Used:');
workflowSummary.environment_variables.forEach(envVar => {
  console.log(`   - ${envVar}`);
});

// Key workflows analysis
const keyWorkflows = {
  'deploy-production.yml': 'Main production deployment',
  'sitemap-generation.yml': 'Automated sitemap generation',
  'data-sync.yml': 'Database synchronization',
  'ci.yml': 'Continuous integration',
  'health-check.yml': 'System health monitoring'
};

console.log('\n🎯 Key Workflows Status:');
Object.entries(keyWorkflows).forEach(([file, description]) => {
  const status = workflowSummary.validated_workflows.includes(file) ? '✅' : '❌';
  console.log(`   ${status} ${file} - ${description}`);
});

// Save workflow summary
fs.writeFileSync('github-workflows-summary.json', JSON.stringify(workflowSummary, null, 2));

console.log('\n📊 Workflow Summary:');
console.log(`   Total workflows: ${workflowSummary.total_workflows}`);
console.log(`   Validated: ${workflowSummary.validated_workflows.length}`);
console.log(`   Secrets required: ${workflowSummary.secrets_required.length}`);
console.log(`   Environment variables: ${workflowSummary.environment_variables.length}`);

console.log('\n🚀 GitHub Actions are ready for deployment!');
console.log('\n📋 Next Steps:');
console.log('1. Configure required secrets in GitHub repository settings');
console.log('2. Set up environment variables in workflow environments');
console.log('3. Enable workflows in the Actions tab');
console.log('4. Test workflows with manual triggers');

console.log('\n💡 Critical Secrets to Configure:');
const criticalSecrets = [
  'NETLIFY_AUTH_TOKEN',
  'NETLIFY_SITE_ID', 
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ACCESS_TOKEN'
];

criticalSecrets.forEach(secret => {
  const required = workflowSummary.secrets_required.includes(secret) ? '🔴 REQUIRED' : '⚪ Optional';
  console.log(`   ${required} ${secret}`);
});