/**
 * GitHub Workflow Validation Tests
 * Tests to verify GitHub workflows are properly configured
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('GitHub Workflows', () => {
  const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
  
  test('workflows directory exists', () => {
    expect(fs.existsSync(workflowsDir)).toBe(true);
  });

  const criticalWorkflows = [
    'auto-deploy.yml',
    'deploy-production.yml',
    'cloudflare.yml',
    'enterprise-deploy.yml',
    'multitenant-deploy.yml',
    'seo-deploy.yml',
    'site-ci.yml'
  ];

  criticalWorkflows.forEach(workflowFile => {
    describe(`${workflowFile}`, () => {
      const workflowPath = path.join(workflowsDir, workflowFile);
      
      test('should exist', () => {
        expect(fs.existsSync(workflowPath)).toBe(true);
      });

      test('should be valid YAML', () => {
        const content = fs.readFileSync(workflowPath, 'utf8');
        expect(() => yaml.load(content)).not.toThrow();
      });

      test('should use pnpm build instead of manual file copying', () => {
        const content = fs.readFileSync(workflowPath, 'utf8');
        
        // Should contain pnpm build
        expect(content).toMatch(/pnpm build/);
        
        // Should NOT contain the old manual copying pattern
        expect(content).not.toMatch(/mkdir -p dist/);
        expect(content).not.toMatch(/cp \*\.html dist\//);
        expect(content).not.toMatch(/cp -r assets dist\//);
      });

      test('should have proper Node.js setup', () => {
        const content = fs.readFileSync(workflowPath, 'utf8');
        const workflow = yaml.load(content);
        
        const deployJob = workflow.jobs.deploy;
        expect(deployJob).toBeDefined();
        
        const steps = deployJob.steps;
        const nodeSetup = steps.find(step => step.name === 'Setup Node.js');
        expect(nodeSetup).toBeDefined();
        expect(nodeSetup.with['node-version']).toBe('20');
      });

      test('should have pnpm setup', () => {
        const content = fs.readFileSync(workflowPath, 'utf8');
        const workflow = yaml.load(content);
        
        const deployJob = workflow.jobs.deploy;
        const steps = deployJob.steps;
        const pnpmSetup = steps.find(step => step.name === 'Setup pnpm');
        expect(pnpmSetup).toBeDefined();
        expect(pnpmSetup.with.version).toBe('9.7.0');
      });
    });
  });
});