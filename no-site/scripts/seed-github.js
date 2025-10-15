#!/usr/bin/env node

import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import ora from 'ora';

const isDryRun = process.env.DRY_RUN !== 'false';
const owner = process.env.GITHUB_OWNER || 'elevateforhumanity';
const repo = process.env.GITHUB_REPO || 'ecosystem2';

if (!process.env.GITHUB_TOKEN) {
  console.error(chalk.red('❌ GITHUB_TOKEN not set in .env'));
  console.log(chalk.yellow('   Create a token at: https://github.com/settings/tokens?type=beta'));
  process.exit(1);
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Labels to create
const labels = [
  { name: 'hiring', color: '0E8A16', description: 'Hiring and recruitment tasks' },
  { name: 'week-1', color: 'D93F0B', description: 'Week 1 tasks' },
  { name: 'week-2', color: 'FBCA04', description: 'Week 2 tasks' },
  { name: 'week-3', color: '0052CC', description: 'Week 3 tasks' },
  { name: 'week-4', color: '5319E7', description: 'Week 4 tasks' },
  { name: 'priority-high', color: 'B60205', description: 'High priority' },
  { name: 'priority-medium', color: 'FBCA04', description: 'Medium priority' },
  { name: 'priority-low', color: '0E8A16', description: 'Low priority' },
  { name: 'infrastructure', color: '1D76DB', description: 'Infrastructure and DevOps' },
  { name: 'frontend', color: 'C5DEF5', description: 'Frontend development' },
  { name: 'backend', color: '006B75', description: 'Backend development' },
  { name: 'documentation', color: '0075CA', description: 'Documentation' },
  { name: 'automation', color: '7057FF', description: 'Automation and CI/CD' },
];

// Issues to create based on 12-week plan
const issues = [
  {
    title: 'Week 1 Day 1: Set up infrastructure and deployment pipeline',
    body: `## Tasks
- [ ] Configure Cloudflare Pages deployment
- [ ] Set up GitHub Actions CI/CD
- [ ] Configure Supabase database
- [ ] Set up monitoring (Sentry)
- [ ] Create deployment documentation

## Success Criteria
- Automated deployments working
- Database migrations running
- Monitoring active
- Documentation complete`,
    labels: ['week-1', 'infrastructure', 'priority-high'],
  },
  {
    title: 'Week 1 Day 2: Begin hiring process for key positions',
    body: `## Tasks
- [ ] Post Full-Stack Developer position
- [ ] Post DevOps Engineer position
- [ ] Set up applicant tracking in Supabase
- [ ] Create interview rubrics
- [ ] Schedule initial screening calls

## Success Criteria
- Job posts live on LinkedIn and Indeed
- ATS configured
- Interview process documented
- First candidates screened`,
    labels: ['week-1', 'hiring', 'priority-high'],
  },
  {
    title: 'Week 1 Day 3: Technical setup and API integration',
    body: `## Tasks
- [ ] Set up Supabase authentication
- [ ] Configure API routes
- [ ] Implement error handling
- [ ] Set up logging
- [ ] Create API documentation

## Success Criteria
- Auth working end-to-end
- APIs documented
- Error tracking active
- Logs centralized`,
    labels: ['week-1', 'backend', 'priority-high'],
  },
  {
    title: 'Week 1 Day 4: Quick wins and marketing setup',
    body: `## Tasks
- [ ] Optimize homepage performance
- [ ] Set up Google Analytics
- [ ] Configure SEO metadata
- [ ] Create social media templates
- [ ] Launch initial marketing campaign

## Success Criteria
- Page load < 2s
- Analytics tracking
- SEO score > 90
- Social presence established`,
    labels: ['week-1', 'frontend', 'priority-medium'],
  },
  {
    title: 'Week 1 Day 5: Review hiring pipeline and make decisions',
    body: `## Tasks
- [ ] Review all applications received
- [ ] Conduct technical screens
- [ ] Make first-round decisions
- [ ] Send rejection/advancement emails
- [ ] Schedule second-round interviews

## Success Criteria
- All applications reviewed
- Top candidates identified
- Interviews scheduled
- Communication sent`,
    labels: ['week-1', 'hiring', 'priority-high'],
  },
  {
    title: 'Week 2: Scale infrastructure and onboard first hires',
    body: `## Tasks
- [ ] Onboard new team members
- [ ] Scale Cloudflare Workers
- [ ] Implement caching strategy
- [ ] Set up team collaboration tools
- [ ] Create onboarding documentation

## Success Criteria
- New hires productive
- Infrastructure scaled
- Performance improved
- Team processes established`,
    labels: ['week-2', 'infrastructure', 'hiring', 'priority-high'],
  },
  {
    title: 'Week 3: Feature development and testing',
    body: `## Tasks
- [ ] Implement new LMS features
- [ ] Build admin dashboard
- [ ] Create automated tests
- [ ] Conduct user testing
- [ ] Fix critical bugs

## Success Criteria
- Features deployed
- Test coverage > 80%
- User feedback positive
- No critical bugs`,
    labels: ['week-3', 'frontend', 'backend', 'priority-high'],
  },
  {
    title: 'Week 4: Optimization and documentation',
    body: `## Tasks
- [ ] Optimize database queries
- [ ] Improve frontend performance
- [ ] Complete API documentation
- [ ] Create user guides
- [ ] Conduct security audit

## Success Criteria
- Performance improved 30%
- Documentation complete
- Security issues resolved
- User guides published`,
    labels: ['week-4', 'documentation', 'priority-medium'],
  },
  {
    title: 'Continuous: Automation and monitoring improvements',
    body: `## Tasks
- [ ] Enhance CI/CD pipeline
- [ ] Improve monitoring dashboards
- [ ] Automate routine tasks
- [ ] Set up alerting
- [ ] Create runbooks

## Success Criteria
- Deployment time reduced
- Monitoring comprehensive
- Alerts configured
- Runbooks complete`,
    labels: ['automation', 'infrastructure', 'priority-medium'],
  },
];

async function createLabels() {
  const spinner = ora('Creating GitHub labels...').start();
  
  try {
    let created = 0;
    let skipped = 0;
    
    for (const label of labels) {
      if (isDryRun) {
        spinner.text = `[DRY RUN] Would create label: ${label.name}`;
        created++;
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        try {
          await octokit.issues.createLabel({
            owner,
            repo,
            name: label.name,
            color: label.color,
            description: label.description,
          });
          spinner.text = `Created label: ${label.name}`;
          created++;
        } catch (error) {
          if (error.status === 422) {
            // Label already exists
            skipped++;
          } else {
            throw error;
          }
        }
      }
    }
    
    spinner.succeed(chalk.green(`Labels: ${created} created, ${skipped} skipped`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create labels'));
    throw error;
  }
}

async function createIssues() {
  const spinner = ora('Creating GitHub issues...').start();
  
  try {
    let created = 0;
    
    for (const issue of issues) {
      if (isDryRun) {
        spinner.text = `[DRY RUN] Would create issue: ${issue.title}`;
        created++;
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        await octokit.issues.create({
          owner,
          repo,
          title: issue.title,
          body: issue.body,
          labels: issue.labels,
        });
        spinner.text = `Created issue: ${issue.title}`;
        created++;
      }
    }
    
    spinner.succeed(chalk.green(`Created ${created} issues`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create issues'));
    throw error;
  }
}

async function seedGitHub() {
  console.log(chalk.bold.blue('\n🐙 GitHub Seeding\n'));
  console.log(chalk.cyan('Repository:'), `${owner}/${repo}`);
  
  if (isDryRun) {
    console.log(chalk.yellow('Mode:'), 'DRY RUN (no actual changes)');
  } else {
    console.log(chalk.red('Mode:'), 'LIVE (will create labels and issues)');
  }
  
  console.log('');
  
  try {
    await createLabels();
    await createIssues();
    
    console.log(chalk.green('\n✅ GitHub seeding complete!\n'));
    
    if (isDryRun) {
      console.log(chalk.yellow('⚠️  This was a dry run. Set DRY_RUN=false to actually create items.'));
    } else {
      console.log(chalk.cyan('View issues at:'), `https://github.com/${owner}/${repo}/issues`);
    }
    
    console.log('');
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    if (error.status === 401) {
      console.log(chalk.yellow('\nYour GitHub token may be invalid or expired.'));
      console.log(chalk.gray('Create a new token at: https://github.com/settings/tokens?type=beta'));
    }
    process.exit(1);
  }
}

// Run the seeder
seedGitHub();
