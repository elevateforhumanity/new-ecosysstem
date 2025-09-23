#!/usr/bin/env node
/**
 * EFH Autopilot Blog Integration
 * Integrates blog publishing with your existing autopilot system
 */

import fs from 'fs';
import { execSync } from 'child_process';

// Blog API configuration
const BLOG_API_URL = 'https://elevateforhumanity.org/_functions/blog/upsert';
const API_TOKEN = process.env.BLOG_API_TOKEN || 'efh_blog_api_2024_secure_token_change_this';

// Auto-generate blog posts from system events
const AUTO_POSTS = {
  // Success story template
  successStory: (data) => ({
    title: `Success Story: ${data.studentName} Achieves ${data.achievement}`,
    slug: `success-${data.studentName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    excerpt: `Meet ${data.studentName}, who transformed their career through our ${data.program} program.`,
    content: generateSuccessStoryContent(data),
    tags: ['success-story', data.program.toLowerCase(), 'career-change'],
    author: 'Liz Jae',
    coverImage: data.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop'
  }),

  // Program update template
  programUpdate: (data) => ({
    title: `New ${data.programName} Program Now Available`,
    slug: `new-${data.programName.toLowerCase().replace(/\s+/g, '-')}-program`,
    excerpt: `We're excited to announce our new ${data.programName} program with industry-leading curriculum.`,
    content: generateProgramUpdateContent(data),
    tags: ['programs', data.category.toLowerCase(), 'announcement'],
    author: 'EFH Team',
    coverImage: data.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop'
  }),

  // Industry insight template
  industryInsight: (data) => ({
    title: data.title,
    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    excerpt: data.excerpt,
    content: data.content,
    tags: ['industry', 'insights', 'workforce-development'],
    author: data.author || 'Liz Jae',
    coverImage: data.image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
  })
};

function generateSuccessStoryContent(data) {
  return `
<h2>${data.studentName}'s Journey: A Testament to Determination</h2>
<p>When ${data.studentName} enrolled in our ${data.program} program ${data.timeframe || 'several months'} ago, ${data.initialSituation || 'they were looking for a career change'}. Today, ${data.currentSituation || 'they have achieved their career goals'}.</p>

<blockquote>
<p>"${data.quote || 'The training was comprehensive and the job placement support was incredible.'}"</p>
<cite>- ${data.studentName}, ${data.jobTitle || 'Program Graduate'}</cite>
</blockquote>

<h3>The Program That Changed Everything</h3>
<p>${data.studentName} completed our comprehensive ${data.program} program, which includes:</p>
<ul>
${(data.programFeatures || []).map(feature => `<li>${feature}</li>`).join('\n')}
</ul>

<h3>Beyond the Classroom</h3>
<p>What set ${data.studentName}'s experience apart was our holistic support system:</p>
<ul>
<li><strong>Career Counseling:</strong> One-on-one guidance throughout the program</li>
<li><strong>Resume Building:</strong> Professional resume and interview preparation</li>
<li><strong>Job Placement:</strong> Direct connections with hiring partners</li>
<li><strong>Ongoing Support:</strong> Continued mentorship after graduation</li>
</ul>

<h3>The Impact</h3>
<p>${data.studentName}'s success represents more than just a career change—it's a life transformation. ${data.impact || 'They now have stable income, benefits, and a clear career advancement path.'}</p>

<p>Stories like ${data.studentName}'s remind us why we do this work. Every graduate represents a life changed, a family supported, and a community strengthened.</p>

<p><em>Ready to start your own transformation? <a href="/apply">Apply today</a> and take the first step toward your new career.</em></p>
`;
}

function generateProgramUpdateContent(data) {
  return `
<h2>Introducing Our New ${data.programName} Program</h2>
<p>We're excited to announce the launch of our ${data.programName} program, designed to meet the growing demand in ${data.industry || 'the industry'}.</p>

<h3>What You'll Learn</h3>
<ul>
${(data.curriculum || []).map(item => `<li>${item}</li>`).join('\n')}
</ul>

<h3>Program Highlights</h3>
<ul>
<li><strong>Duration:</strong> ${data.duration || 'Flexible scheduling available'}</li>
<li><strong>Certification:</strong> ${data.certification || 'Industry-recognized certification included'}</li>
<li><strong>Job Placement:</strong> 98% placement rate with our employer partners</li>
<li><strong>WIOA Approved:</strong> Free for eligible participants</li>
</ul>

<h3>Career Opportunities</h3>
<p>Graduates of our ${data.programName} program can pursue careers such as:</p>
<ul>
${(data.careerPaths || []).map(path => `<li>${path}</li>`).join('\n')}
</ul>

<h3>Get Started Today</h3>
<p>Ready to launch your career in ${data.industry || 'this exciting field'}? Our next cohort starts ${data.startDate || 'soon'}.</p>

<p><a href="/apply">Apply now</a> or <a href="/contact">contact us</a> to learn more about this exciting opportunity.</p>
`;
}

// Integration with autopilot system
async function publishAutopilotPost(type, data) {
  if (!AUTO_POSTS[type]) {
    console.error(`Unknown post type: ${type}`);
    return false;
  }

  const post = AUTO_POSTS[type](data);
  
  try {
    const response = await fetch(BLOG_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Published blog post: ${post.title} (${result.status})`);
      
      // Trigger social media automation
      if (process.env.SOCIAL_WEBHOOK) {
        await triggerSocialAutomation(post);
      }
      
      return true;
    } else {
      console.error(`❌ Failed to publish blog post: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error publishing blog post: ${error.message}`);
    return false;
  }
}

async function triggerSocialAutomation(post) {
  try {
    await fetch(process.env.SOCIAL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: post.title,
        excerpt: post.excerpt,
        url: `https://elevateforhumanity.org/blog/${post.slug}`,
        image: post.coverImage,
        tags: post.tags
      })
    });
    console.log('📱 Social automation triggered');
  } catch (error) {
    console.warn('⚠️ Social automation failed:', error.message);
  }
}

// CLI interface
const command = process.argv[2];
const dataFile = process.argv[3];

if (command && dataFile) {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    publishAutopilotPost(command, data);
  } catch (error) {
    console.error(`Error reading data file: ${error.message}`);
    process.exit(1);
  }
} else if (command === 'test') {
  // Test with sample data
  const testData = {
    studentName: 'Sarah Johnson',
    program: 'Medical Assistant',
    achievement: '$65K Healthcare Career',
    timeframe: '8 months',
    initialSituation: 'she was unemployed and struggling to support her family',
    currentSituation: 'she\'s a certified Medical Assistant at Cleveland Clinic, earning $65,000 annually',
    quote: 'From unemployed to earning $65K as a Medical Assistant in just 8 months. The training was comprehensive and the job placement support was incredible.',
    jobTitle: 'Medical Assistant, Cleveland Clinic',
    programFeatures: [
      'Clinical skills training',
      'Administrative procedures', 
      'Electronic health records',
      'Patient communication',
      'Hands-on externship experience'
    ],
    impact: 'She now has stable income, health benefits, and a clear career advancement path.'
  };
  
  publishAutopilotPost('successStory', testData);
} else {
  console.log(`
EFH Autopilot Blog Integration

Usage:
  node autopilot-blog-integration.js <type> <data.json>
  node autopilot-blog-integration.js test

Types:
  successStory    - Generate success story post
  programUpdate   - Generate program announcement
  industryInsight - Generate industry insight post

Environment Variables:
  BLOG_API_TOKEN    - API token for blog publishing
  SOCIAL_WEBHOOK    - Webhook URL for social automation

Examples:
  node autopilot-blog-integration.js successStory sarah-data.json
  node autopilot-blog-integration.js programUpdate new-program.json
  node autopilot-blog-integration.js test
`);
}

export { publishAutopilotPost, AUTO_POSTS };