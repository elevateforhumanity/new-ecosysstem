#!/usr/bin/env node
/**
 * EFH Blog Publisher
 * Publishes blog posts to Wix CMS and triggers social media automation
 */

import fs from 'fs';
import https from 'https';

// Configuration
const BLOG_API_URL = 'https://elevateforhumanity.org/_functions/blog/upsert';
const API_TOKEN = 'efh_blog_api_2024_secure_token_change_this'; // Change this!
const POSTS_FILE = './blog-starter-posts.json';

// Social media automation webhook (optional - for Zapier/Make integration)
const SOCIAL_WEBHOOK = process.env.SOCIAL_AUTOMATION_WEBHOOK;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function publishPost(post) {
  console.log(`📝 Publishing: ${post.title}`);
  
  try {
    const response = await makeRequest(BLOG_API_URL, {
      method: 'POST',
      body: post
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ Published: ${post.title} (${response.data.status})`);
      
      // Trigger social media automation if webhook is configured
      if (SOCIAL_WEBHOOK && response.data.status === 'created') {
        await triggerSocialAutomation(post);
      }
      
      return true;
    } else {
      console.error(`❌ Failed to publish ${post.title}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error publishing ${post.title}:`, error.message);
    return false;
  }
}

async function triggerSocialAutomation(post) {
  try {
    console.log(`📱 Triggering social automation for: ${post.title}`);
    
    const socialData = {
      title: post.title,
      excerpt: post.excerpt,
      url: `https://elevateforhumanity.org/blog/${post.slug}`,
      image: post.coverImage,
      tags: post.tags,
      publishedAt: post.publishedAt
    };
    
    await makeRequest(SOCIAL_WEBHOOK, {
      method: 'POST',
      body: socialData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Social automation triggered`);
  } catch (error) {
    console.warn(`⚠️ Social automation failed:`, error.message);
  }
}

async function publishAllPosts() {
  console.log('🚀 EFH Blog Publisher Starting...');
  
  if (!fs.existsSync(POSTS_FILE)) {
    console.error(`❌ Posts file not found: ${POSTS_FILE}`);
    process.exit(1);
  }
  
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  console.log(`📚 Found ${posts.length} posts to publish`);
  
  let published = 0;
  let failed = 0;
  
  for (const post of posts) {
    const success = await publishPost(post);
    if (success) {
      published++;
    } else {
      failed++;
    }
    
    // Small delay between posts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Publishing Summary:');
  console.log(`✅ Published: ${published}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📱 RSS Feed: https://elevateforhumanity.org/_functions/blog/rss`);
  console.log(`🌐 Blog URL: https://elevateforhumanity.org/blog`);
  
  if (published > 0) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Set up Zapier/Make to monitor the RSS feed');
    console.log('2. Configure auto-posting to Facebook business page');
    console.log('3. Test the blog pages in Wix');
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'single' && process.argv[3]) {
  // Publish a single post by slug
  const slug = process.argv[3];
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  const post = posts.find(p => p.slug === slug);
  
  if (post) {
    publishPost(post);
  } else {
    console.error(`❌ Post not found: ${slug}`);
    process.exit(1);
  }
} else {
  // Publish all posts
  publishAllPosts();
}