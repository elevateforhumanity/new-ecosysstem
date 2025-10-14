#!/usr/bin/env node
/**
 * Autopilot Blog Integration for Wix
 * Automates blog post creation and publishing
 */

const fs = require('fs');
const path = require('path');

const BLOG_TEMPLATES = {
  test: {
    title: 'Test Blog Post',
    content: 'This is a test blog post from the autopilot system.',
    tags: ['test', 'automation']
  },
  successStory: {
    title: 'Student Success Story',
    content: 'Another inspiring success story from our community...',
    tags: ['success', 'student', 'community']
  },
  programUpdate: {
    title: 'Program Update',
    content: 'Latest updates on our training programs...',
    tags: ['programs', 'updates', 'training']
  }
};

function createBlogPost(type) {
  const template = BLOG_TEMPLATES[type];
  
  if (!template) {
    console.error(`❌ Unknown blog type: ${type}`);
    console.log('Available types: test, successStory, programUpdate');
    process.exit(1);
  }
  
  console.log(`📝 Creating ${type} blog post...`);
  console.log(`   Title: ${template.title}`);
  console.log(`   Tags: ${template.tags.join(', ')}`);
  
  const blogPost = {
    ...template,
    date: new Date().toISOString(),
    author: 'EFH Autopilot',
    status: 'draft'
  };
  
  // Save to blog directory
  const blogDir = path.join(process.cwd(), 'sites', 'blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  
  const filename = `${type}-${Date.now()}.json`;
  const filepath = path.join(blogDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(blogPost, null, 2));
  
  console.log(`   ✅ Blog post created: ${filename}`);
  console.log(`   📁 Location: ${filepath}`);
  console.log('\n✨ Blog post ready for review and publishing!');
}

const args = process.argv.slice(2);
const blogType = args[0] || 'test';

createBlogPost(blogType);
