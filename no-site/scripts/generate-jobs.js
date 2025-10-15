#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const outputDir = process.env.OUTPUT_DIR || '.autopilot_out';
const jobPostsDir = path.join(outputDir, 'job_posts');

// Ensure output directory exists
if (!fs.existsSync(jobPostsDir)) {
  fs.mkdirSync(jobPostsDir, { recursive: true });
}

const orgName = process.env.ORG_NAME || 'Elevate for Humanity';
const orgLocation = process.env.ORG_LOCATION || 'Indianapolis, IN';
const orgWebsite = process.env.ORG_WEBSITE || 'https://elevateforhumanity.org';
const orgEmail = process.env.ORG_EMAIL || 'hiring@elevateforhumanity.org';

// Job posting templates based on the 12-week plan
const jobTemplates = [
  {
    title: 'Full-Stack Developer',
    department: 'Engineering',
    type: 'Full-Time',
    location: 'Remote (US)',
    salary: '$80,000 - $120,000',
    description: `We're seeking a talented Full-Stack Developer to help build our workforce development platform that serves thousands of students across the country.`,
    responsibilities: [
      'Develop and maintain React-based frontend applications',
      'Build scalable Node.js/Express backend APIs',
      'Integrate with Supabase, Cloudflare Workers, and third-party services',
      'Implement responsive designs with Tailwind CSS',
      'Write clean, maintainable, and well-tested code',
      'Collaborate with team members on architecture decisions',
      'Participate in code reviews and technical discussions',
    ],
    requirements: [
      '3+ years of professional web development experience',
      'Strong proficiency in JavaScript/TypeScript, React, and Node.js',
      'Experience with modern web technologies (Vite, Next.js, etc.)',
      'Familiarity with SQL databases and ORMs',
      'Understanding of RESTful API design',
      'Git version control experience',
      'Excellent problem-solving and communication skills',
    ],
    niceToHave: [
      'Experience with Supabase or similar BaaS platforms',
      'Cloudflare Workers or serverless architecture experience',
      'Background in education technology or workforce development',
      'Open source contributions',
      'Experience with CI/CD pipelines',
    ],
    benefits: [
      'Competitive salary and equity options',
      'Health, dental, and vision insurance',
      'Flexible remote work',
      '401(k) with company match',
      'Professional development budget',
      'Unlimited PTO',
      'Make a real impact on workforce development',
    ],
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    type: 'Full-Time',
    location: 'Remote (US)',
    salary: '$90,000 - $130,000',
    description: `Join our team as a DevOps Engineer to build and maintain the infrastructure that powers our mission-critical workforce development platform.`,
    responsibilities: [
      'Manage and optimize Cloudflare infrastructure (Pages, Workers, R2, KV)',
      'Implement CI/CD pipelines with GitHub Actions',
      'Monitor system performance and reliability',
      'Automate deployment and infrastructure provisioning',
      'Ensure security best practices across all systems',
      'Manage database backups and disaster recovery',
      'Collaborate with developers on infrastructure needs',
    ],
    requirements: [
      '3+ years of DevOps or infrastructure engineering experience',
      'Strong knowledge of cloud platforms (Cloudflare, AWS, or similar)',
      'Experience with containerization (Docker) and orchestration',
      'Proficiency in scripting (Bash, Python, or Node.js)',
      'Understanding of networking, DNS, and CDN concepts',
      'Experience with monitoring tools (Sentry, Datadog, etc.)',
      'Strong troubleshooting and problem-solving skills',
    ],
    niceToHave: [
      'Cloudflare Workers and Pages experience',
      'Terraform or Infrastructure as Code experience',
      'Experience with Supabase or PostgreSQL',
      'Security certifications (AWS Security, etc.)',
      'Experience in education or government sectors',
    ],
    benefits: [
      'Competitive salary and equity options',
      'Health, dental, and vision insurance',
      'Flexible remote work',
      '401(k) with company match',
      'Professional development budget',
      'Unlimited PTO',
      'Work on meaningful infrastructure',
    ],
  },
  {
    title: 'Product Manager',
    department: 'Product',
    type: 'Full-Time',
    location: 'Remote (US) or Indianapolis, IN',
    salary: '$90,000 - $130,000',
    description: `We're looking for an experienced Product Manager to drive the vision and execution of our workforce development platform.`,
    responsibilities: [
      'Define product strategy and roadmap',
      'Gather and prioritize product requirements',
      'Work closely with engineering, design, and stakeholders',
      'Conduct user research and analyze feedback',
      'Define and track key product metrics',
      'Manage product launches and releases',
      'Communicate product vision to the team and stakeholders',
    ],
    requirements: [
      '3+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Experience with agile development methodologies',
      'Excellent communication and presentation skills',
      'Data-driven decision-making approach',
      'Ability to work with technical and non-technical stakeholders',
      'Bachelor\'s degree in relevant field',
    ],
    niceToHave: [
      'Experience in education technology or workforce development',
      'Technical background or engineering degree',
      'Experience with government contracts or compliance',
      'Familiarity with LMS platforms',
      'MBA or advanced degree',
    ],
    benefits: [
      'Competitive salary and equity options',
      'Health, dental, and vision insurance',
      'Flexible remote work',
      '401(k) with company match',
      'Professional development budget',
      'Unlimited PTO',
      'Shape the future of workforce development',
    ],
  },
  {
    title: 'UX/UI Designer',
    department: 'Design',
    type: 'Full-Time',
    location: 'Remote (US)',
    salary: '$70,000 - $100,000',
    description: `Join our team as a UX/UI Designer to create intuitive and accessible experiences for students and administrators.`,
    responsibilities: [
      'Design user interfaces for web and mobile applications',
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Develop and maintain design systems',
      'Collaborate with developers to ensure design implementation',
      'Ensure accessibility compliance (WCAG 2.1 AA)',
      'Iterate on designs based on user feedback and data',
    ],
    requirements: [
      '2+ years of UX/UI design experience',
      'Proficiency in Figma or similar design tools',
      'Strong portfolio demonstrating design process',
      'Understanding of responsive and mobile-first design',
      'Knowledge of accessibility standards',
      'Excellent visual design skills',
      'Strong communication and collaboration skills',
    ],
    niceToHave: [
      'Experience designing for education platforms',
      'Front-end development skills (HTML/CSS)',
      'Experience with design systems',
      'Motion design or animation skills',
      'User research experience',
    ],
    benefits: [
      'Competitive salary and equity options',
      'Health, dental, and vision insurance',
      'Flexible remote work',
      '401(k) with company match',
      'Professional development budget',
      'Unlimited PTO',
      'Design products that change lives',
    ],
  },
];

function generateJobPost(job) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  return `# ${job.title}

**${orgName}** | ${job.location} | ${job.type}

---

## About ${orgName}

${orgName} is a workforce development organization dedicated to empowering individuals through education and training. We provide 100% FREE certification programs and apprenticeships, helping thousands of students launch successful careers.

Visit us at: ${orgWebsite}

---

## Position Overview

${job.description}

**Department:** ${job.department}  
**Employment Type:** ${job.type}  
**Location:** ${job.location}  
**Salary Range:** ${job.salary}

---

## Responsibilities

${job.responsibilities.map(r => `- ${r}`).join('\n')}

---

## Requirements

${job.requirements.map(r => `- ${r}`).join('\n')}

---

## Nice to Have

${job.niceToHave.map(r => `- ${r}`).join('\n')}

---

## Benefits

${job.benefits.map(b => `- ${b}`).join('\n')}

---

## How to Apply

Send your resume and a brief cover letter to: **${orgEmail}**

Please include "${job.title}" in the subject line.

We're an equal opportunity employer and value diversity. All qualified applicants will receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, disability status, protected veteran status, or any other characteristic protected by law.

---

*Generated: ${timestamp}*
*This is a draft. Review and customize before posting.*
`;
}

async function generateAllJobs() {
  const spinner = ora('Generating job post drafts...').start();
  
  try {
    let generated = 0;
    
    for (const job of jobTemplates) {
      const filename = `${job.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      const filepath = path.join(jobPostsDir, filename);
      const content = generateJobPost(job);
      
      fs.writeFileSync(filepath, content, 'utf8');
      generated++;
    }
    
    spinner.succeed(chalk.green(`Generated ${generated} job post drafts`));
    
    console.log(chalk.cyan('\n📁 Output location:'), jobPostsDir);
    console.log(chalk.gray('\nGenerated files:'));
    jobTemplates.forEach(job => {
      const filename = `${job.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      console.log(chalk.gray(`  • ${filename}`));
    });
    
    console.log(chalk.yellow('\n⚠️  These are drafts. Review and customize before posting!'));
    console.log(chalk.gray('   You can now copy these to LinkedIn, Indeed, or other platforms.\n'));
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate job posts'));
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

// Run the generator
generateAllJobs();
