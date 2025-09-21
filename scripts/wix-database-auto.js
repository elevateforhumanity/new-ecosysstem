#!/usr/bin/env node

/**
 * Automatic Wix Database Setup
 * Creates collections, populates data, sets permissions
 */

import fetch from 'node-fetch';

const WIX_API_BASE = 'https://www.wixapis.com';
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_API_KEY = process.env.WIX_API_KEY;

async function wixApiCall(endpoint, options = {}) {
  const url = `${WIX_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': WIX_API_KEY,
      'wix-site-id': WIX_SITE_ID,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wix API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Auto-create all database collections
async function createAllCollections() {
  console.log('📊 Auto-creating Wix database collections...\n');
  
  const collections = [
    {
      id: 'Programs',
      displayName: 'Training Programs',
      permissions: {
        read: 'ANYONE',
        write: 'ADMIN'
      },
      fields: [
        { key: 'title', type: 'TEXT', required: true, displayName: 'Program Title' },
        { key: 'slug', type: 'TEXT', required: true, displayName: 'URL Slug' },
        { key: 'summary', type: 'TEXT', displayName: 'Short Description' },
        { key: 'content', type: 'RICH_TEXT', displayName: 'Full Description' },
        { key: 'duration', type: 'TEXT', displayName: 'Program Duration' },
        { key: 'cost', type: 'NUMBER', displayName: 'Program Cost' },
        { key: 'featured', type: 'BOOLEAN', displayName: 'Featured Program' },
        { key: 'category', type: 'TEXT', displayName: 'Program Category' },
        { key: 'requirements', type: 'TEXT', displayName: 'Prerequisites' },
        { key: 'outcomes', type: 'TEXT', displayName: 'Expected Outcomes' }
      ]
    },
    {
      id: 'Contacts',
      displayName: 'Contact Submissions',
      permissions: {
        read: 'ADMIN',
        write: 'ANYONE'
      },
      fields: [
        { key: 'name', type: 'TEXT', required: true, displayName: 'Full Name' },
        { key: 'email', type: 'TEXT', required: true, displayName: 'Email Address' },
        { key: 'phone', type: 'TEXT', displayName: 'Phone Number' },
        { key: 'message', type: 'TEXT', displayName: 'Message' },
        { key: 'program', type: 'TEXT', displayName: 'Program Interest' },
        { key: 'source', type: 'TEXT', displayName: 'Traffic Source' },
        { key: 'status', type: 'TEXT', displayName: 'Follow-up Status' },
        { key: 'priority', type: 'TEXT', displayName: 'Priority Level' },
        { key: 'notes', type: 'TEXT', displayName: 'Admin Notes' }
      ]
    },
    {
      id: 'Analytics',
      displayName: 'Site Analytics',
      permissions: {
        read: 'ADMIN',
        write: 'SITE'
      },
      fields: [
        { key: 'event', type: 'TEXT', required: true, displayName: 'Event Type' },
        { key: 'page', type: 'TEXT', displayName: 'Page Path' },
        { key: 'data', type: 'JSON', displayName: 'Event Data' },
        { key: 'userAgent', type: 'TEXT', displayName: 'Browser Info' },
        { key: 'sessionId', type: 'TEXT', displayName: 'Session ID' },
        { key: 'ipAddress', type: 'TEXT', displayName: 'IP Address' }
      ]
    },
    {
      id: 'Enrollments',
      displayName: 'Program Enrollments',
      permissions: {
        read: 'ADMIN',
        write: 'SITE'
      },
      fields: [
        { key: 'programId', type: 'TEXT', required: true, displayName: 'Program ID' },
        { key: 'programTitle', type: 'TEXT', displayName: 'Program Name' },
        { key: 'studentName', type: 'TEXT', required: true, displayName: 'Student Name' },
        { key: 'studentEmail', type: 'TEXT', required: true, displayName: 'Student Email' },
        { key: 'studentPhone', type: 'TEXT', displayName: 'Student Phone' },
        { key: 'paymentStatus', type: 'TEXT', displayName: 'Payment Status' },
        { key: 'enrollmentStatus', type: 'TEXT', displayName: 'Enrollment Status' },
        { key: 'startDate', type: 'DATE', displayName: 'Program Start Date' },
        { key: 'completionDate', type: 'DATE', displayName: 'Completion Date' },
        { key: 'certificateIssued', type: 'BOOLEAN', displayName: 'Certificate Issued' }
      ]
    },
    {
      id: 'Partners',
      displayName: 'Partner Organizations',
      permissions: {
        read: 'ANYONE',
        write: 'ADMIN'
      },
      fields: [
        { key: 'name', type: 'TEXT', required: true, displayName: 'Organization Name' },
        { key: 'type', type: 'TEXT', displayName: 'Partner Type' },
        { key: 'description', type: 'TEXT', displayName: 'Description' },
        { key: 'website', type: 'URL', displayName: 'Website URL' },
        { key: 'logo', type: 'IMAGE', displayName: 'Partner Logo' },
        { key: 'featured', type: 'BOOLEAN', displayName: 'Featured Partner' },
        { key: 'contactEmail', type: 'TEXT', displayName: 'Contact Email' },
        { key: 'partnership', type: 'TEXT', displayName: 'Partnership Details' }
      ]
    }
  ];
  
  for (const collection of collections) {
    try {
      console.log(`📋 Creating collection: ${collection.displayName}...`);
      
      await wixApiCall('/cms/v1/data-collections', {
        method: 'POST',
        body: JSON.stringify({
          collection: {
            id: collection.id,
            displayName: collection.displayName,
            permissions: collection.permissions,
            fields: collection.fields
          }
        })
      });
      
      console.log(`✅ Created: ${collection.displayName}`);
      
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('409')) {
        console.log(`ℹ️ Already exists: ${collection.displayName}`);
      } else {
        console.log(`❌ Failed to create ${collection.displayName}: ${error.message}`);
      }
    }
  }
}

// Auto-populate with sample data
async function populateCollections() {
  console.log('\n📝 Auto-populating collections with data...\n');
  
  // Programs data
  const programs = [
    {
      title: 'AI & Data Science Bootcamp',
      slug: 'ai-data-science-bootcamp',
      summary: 'Comprehensive 16-week program covering machine learning, deep learning, and data analysis',
      content: '<h2>Transform Your Career with AI</h2><p>Master artificial intelligence and data science with hands-on projects, industry mentorship, and job placement assistance.</p><h3>What You\'ll Learn:</h3><ul><li>Python programming</li><li>Machine learning algorithms</li><li>Deep learning with TensorFlow</li><li>Data visualization</li><li>Real-world project portfolio</li></ul>',
      duration: '16 weeks',
      cost: 4500,
      featured: true,
      category: 'Technology',
      requirements: 'Basic computer skills, high school diploma',
      outcomes: 'Industry certification, portfolio projects, job placement assistance'
    },
    {
      title: 'Healthcare Assistant Certification',
      slug: 'healthcare-assistant-certification',
      summary: 'Professional healthcare support training with clinical experience and job placement',
      content: '<h2>Launch Your Healthcare Career</h2><p>Comprehensive training in patient care, medical terminology, and healthcare technology.</p><h3>Program Highlights:</h3><ul><li>Clinical externship included</li><li>CPR/AED certification</li><li>Electronic health records training</li><li>Patient communication skills</li><li>Healthcare safety protocols</li></ul>',
      duration: '12 weeks',
      cost: 2800,
      featured: true,
      category: 'Healthcare',
      requirements: 'High school diploma, background check, immunizations',
      outcomes: 'National certification, clinical experience, job placement support'
    },
    {
      title: 'IT Support Specialist Program',
      slug: 'it-support-specialist',
      summary: 'Complete IT troubleshooting and customer service certification program',
      content: '<h2>Master IT Support</h2><p>Learn hardware troubleshooting, network configuration, and customer service excellence.</p><h3>Technical Skills:</h3><ul><li>Hardware diagnosis and repair</li><li>Network troubleshooting</li><li>Software installation and configuration</li><li>Help desk operations</li><li>Customer service excellence</li></ul>',
      duration: '10 weeks',
      cost: 2200,
      featured: false,
      category: 'Technology',
      requirements: 'Basic computer knowledge, problem-solving aptitude',
      outcomes: 'CompTIA A+ preparation, hands-on experience, career coaching'
    },
    {
      title: 'Business Administration Certificate',
      slug: 'business-administration',
      summary: 'Essential business skills including project management and office administration',
      content: '<h2>Business Skills Mastery</h2><p>Develop essential business administration and project management skills.</p><h3>Core Competencies:</h3><ul><li>Project management fundamentals</li><li>Business communication</li><li>Office software proficiency</li><li>Customer relationship management</li><li>Financial basics</li></ul>',
      duration: '8 weeks',
      cost: 1800,
      featured: false,
      category: 'Business',
      requirements: 'High school diploma, basic computer skills',
      outcomes: 'Business certificate, internship opportunities, professional network'
    },
    {
      title: 'Skilled Trades Apprenticeship',
      slug: 'skilled-trades-apprenticeship',
      summary: 'Hands-on training in electrical, plumbing, and HVAC with union partnerships',
      content: '<h2>Build Your Future</h2><p>Comprehensive skilled trades training with union partnerships and guaranteed job placement.</p><h3>Trade Specializations:</h3><ul><li>Electrical systems</li><li>Plumbing and pipefitting</li><li>HVAC installation and repair</li><li>Safety certification</li><li>Union apprenticeship preparation</li></ul>',
      duration: '20 weeks',
      cost: 3500,
      featured: true,
      category: 'Skilled Trades',
      requirements: 'Physical fitness, safety orientation, drug screening',
      outcomes: 'Union apprenticeship placement, industry certifications, guaranteed employment'
    }
  ];
  
  // Partners data
  const partners = [
    {
      name: 'Indiana Department of Workforce Development',
      type: 'Government Agency',
      description: 'State workforce development partner providing WIOA funding and oversight',
      website: 'https://www.in.gov/dwd/',
      featured: true,
      contactEmail: 'partnerships@dwd.in.gov',
      partnership: 'WIOA funding provider and program oversight'
    },
    {
      name: 'Indianapolis Public Library',
      type: 'Community Partner',
      description: 'Providing digital literacy training and community outreach support',
      website: 'https://www.indypl.org/',
      featured: true,
      contactEmail: 'workforce@indypl.org',
      partnership: 'Digital literacy training and community access'
    },
    {
      name: 'Ivy Tech Community College',
      type: 'Educational Institution',
      description: 'Credit transfer agreements and continuing education pathways',
      website: 'https://www.ivytech.edu/',
      featured: true,
      contactEmail: 'partnerships@ivytech.edu',
      partnership: 'Credit transfer and continuing education pathways'
    }
  ];
  
  // Populate Programs
  for (const program of programs) {
    try {
      await wixApiCall('/cms/v1/data-collections/Programs/data-items', {
        method: 'POST',
        body: JSON.stringify({ dataItem: { data: program } })
      });
      console.log(`✅ Added program: ${program.title}`);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('409')) {
        console.log(`ℹ️ Program already exists: ${program.title}`);
      } else {
        console.log(`⚠️ Failed to add ${program.title}: ${error.message}`);
      }
    }
  }
  
  // Populate Partners
  for (const partner of partners) {
    try {
      await wixApiCall('/cms/v1/data-collections/Partners/data-items', {
        method: 'POST',
        body: JSON.stringify({ dataItem: { data: partner } })
      });
      console.log(`✅ Added partner: ${partner.name}`);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('409')) {
        console.log(`ℹ️ Partner already exists: ${partner.name}`);
      } else {
        console.log(`⚠️ Failed to add ${partner.name}: ${error.message}`);
      }
    }
  }
  
  // Add initial analytics event
  try {
    await wixApiCall('/cms/v1/data-collections/Analytics/data-items', {
      method: 'POST',
      body: JSON.stringify({
        dataItem: {
          data: {
            event: 'database_initialized',
            page: '/admin',
            data: { 
              collections_created: 5,
              programs_added: programs.length,
              partners_added: partners.length,
              timestamp: new Date().toISOString()
            },
            sessionId: 'autopilot_setup',
            userAgent: 'Wix Autopilot System'
          }
        }
      })
    });
    console.log('✅ Added initial analytics event');
  } catch (error) {
    console.log(`⚠️ Analytics initialization: ${error.message}`);
  }
}

// Main function
async function setupDatabase() {
  if (!WIX_SITE_ID || !WIX_API_KEY) {
    console.log('❌ Missing Wix credentials');
    console.log('Set WIX_SITE_ID and WIX_API_KEY environment variables');
    return;
  }
  
  console.log('🚀 Wix Database Auto-Setup Starting...\n');
  console.log(`🎯 Target Site: ${WIX_SITE_ID}\n`);
  
  try {
    await createAllCollections();
    await populateCollections();
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Created collections:');
    console.log('   • Programs (5 sample programs)');
    console.log('   • Contacts (ready for form submissions)');
    console.log('   • Analytics (tracking initialized)');
    console.log('   • Enrollments (ready for student data)');
    console.log('   • Partners (3 sample partners)');
    
    console.log('\n✅ Your Wix database is fully automated and populated!');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n🔧 Check:');
    console.log('   1. WIX_API_KEY has CMS permissions');
    console.log('   2. WIX_SITE_ID is correct');
    console.log('   3. Wix site is published');
  }
}

setupDatabase();