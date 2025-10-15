#!/usr/bin/env node

import 'dotenv/config';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isDryRun = process.env.DRY_RUN !== 'false';

console.clear();
console.log(chalk.bold.blue('\n🤖 EFH Autopilot CLI\n'));
console.log(chalk.gray('Hiring automation for Elevate for Humanity\n'));

if (isDryRun) {
  console.log(chalk.yellow('⚠️  DRY RUN MODE: No actual changes will be made'));
  console.log(chalk.gray('   Set DRY_RUN=false in .env to enable writes\n'));
}

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log(chalk.red('❌ No .env file found!'));
  console.log(chalk.yellow('   Run: cp .env.example .env'));
  console.log(chalk.gray('   Then edit .env with your credentials\n'));
  process.exit(1);
}

// Ensure output directory exists
const outputDir = process.env.OUTPUT_DIR || '.autopilot_out';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function main() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📝 Generate Job Post Drafts', value: 'generate-jobs' },
        { name: '🐙 Seed GitHub (Labels + Issues)', value: 'seed-github' },
        { name: '📊 Export Candidates to CSV', value: 'export-candidates' },
        { name: '📅 Create Interview Invite (ICS)', value: 'create-invite' },
        { name: '💬 Test Slack Integration', value: 'test-slack' },
        { name: '⚙️  View Configuration', value: 'view-config' },
        { name: '📖 View Documentation', value: 'view-docs' },
        new inquirer.Separator(),
        { name: '🚪 Exit', value: 'exit' },
      ],
    },
  ]);

  console.log('');

  switch (action) {
    case 'generate-jobs':
      execSync('npm run generate:jobs', { stdio: 'inherit' });
      break;
    case 'seed-github':
      execSync('npm run seed:github', { stdio: 'inherit' });
      break;
    case 'export-candidates':
      execSync('npm run export:candidates', { stdio: 'inherit' });
      break;
    case 'create-invite':
      execSync('npm run create:invite', { stdio: 'inherit' });
      break;
    case 'test-slack':
      execSync('npm run test:slack', { stdio: 'inherit' });
      break;
    case 'view-config':
      viewConfig();
      break;
    case 'view-docs':
      viewDocs();
      break;
    case 'exit':
      console.log(chalk.green('👋 Goodbye!\n'));
      process.exit(0);
  }

  // Ask if they want to do something else
  console.log('');
  const { again } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'again',
      message: 'Do something else?',
      default: true,
    },
  ]);

  if (again) {
    console.log('');
    await main();
  } else {
    console.log(chalk.green('\n👋 Goodbye!\n'));
  }
}

function viewConfig() {
  console.log(chalk.bold('Current Configuration:\n'));
  
  const config = {
    'Dry Run': isDryRun ? chalk.yellow('ENABLED') : chalk.red('DISABLED'),
    'Environment': process.env.NODE_ENV || 'development',
    'GitHub Owner': process.env.GITHUB_OWNER || chalk.gray('not set'),
    'GitHub Repo': process.env.GITHUB_REPO || chalk.gray('not set'),
    'GitHub Token': process.env.GITHUB_TOKEN ? chalk.green('✓ set') : chalk.red('✗ not set'),
    'Supabase URL': process.env.SUPABASE_URL ? chalk.green('✓ set') : chalk.gray('not set'),
    'Slack Token': process.env.SLACK_BOT_TOKEN ? chalk.green('✓ set') : chalk.gray('not set'),
    'Output Directory': outputDir,
  };

  Object.entries(config).forEach(([key, value]) => {
    console.log(`  ${chalk.cyan(key.padEnd(20))}: ${value}`);
  });
  
  console.log('');
}

function viewDocs() {
  console.log(chalk.bold('📖 EFH Autopilot CLI Documentation\n'));
  
  console.log(chalk.cyan('Available Commands:'));
  console.log('  npm start                 - Interactive menu (this)');
  console.log('  npm run generate:jobs     - Generate job post Markdown files');
  console.log('  npm run seed:github       - Create GitHub labels and issues');
  console.log('  npm run export:candidates - Export candidates to CSV');
  console.log('  npm run test:slack        - Test Slack integration\n');
  
  console.log(chalk.cyan('Safety Features:'));
  console.log('  • DRY_RUN mode prevents actual writes');
  console.log('  • No spending or paid job postings');
  console.log('  • No production deployments without explicit flag');
  console.log('  • All outputs saved locally first\n');
  
  console.log(chalk.cyan('Output Locations:'));
  console.log(`  • Job posts: ${outputDir}/job_posts/`);
  console.log(`  • Candidates: ${outputDir}/candidates.csv`);
  console.log(`  • Logs: ${outputDir}/logs/\n`);
  
  console.log(chalk.cyan('Documentation:'));
  console.log('  • README: ./README.md');
  console.log('  • GitHub: https://github.com/elevateforhumanity/fix2\n');
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
