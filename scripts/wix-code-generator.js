#!/usr/bin/env node

/**
 * Wix Code Generator - Creates ready-to-paste code for Wix Dev Mode
 * Generates backend functions, page code, and database setup
 */

import fs from 'fs';
import path from 'path';

console.log('🎯 Generating Code for Wix Dev Mode\n');

// Create output directory
const outputDir = 'wix-ready-code';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Backend HTTP Functions (goes in Wix Backend)
const backendCode = `// PASTE THIS INTO WIX BACKEND → http-functions.js
import { ok, serverError, badRequest } from 'wix-http-functions';
import wixData from 'wix-data';

// Get all programs
export function get_programs(request) {
  return wixData.query("Programs")
    .find()
    .then((results) => {
      return ok({
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "programs": results.items,
          "total": results.totalCount
        }
      });
    })
    .catch((error) => {
      return serverError({
        "body": { "error": "Failed to load programs" }
      });
    });
}

// Submit contact form
export function post_contact(request) {
  const { name, email, phone, message, program } = request.body;
  
  if (!name || !email) {
    return badRequest({
      "body": { "error": "Name and email required" }
    });
  }
  
  return wixData.save("Contacts", {
    "name": name,
    "email": email,
    "phone": phone || "",
    "message": message || "",
    "program": program || "",
    "submittedAt": new Date(),
    "status": "new"
  })
  .then(() => {
    return ok({
      "body": { 
        "success": true, 
        "message": "Thank you! We'll contact you soon." 
      }
    });
  })
  .catch((error) => {
    return serverError({
      "body": { "error": "Submission failed. Please try again." }
    });
  });
}

// Track analytics
export function post_analytics(request) {
  const { event, page, data } = request.body;
  
  return wixData.save("Analytics", {
    "event": event,
    "page": page,
    "data": data,
    "timestamp": new Date()
  })
  .then(() => {
    return ok({ "body": { "tracked": true } });
  })
  .catch(() => {
    return ok({ "body": { "tracked": false } });
  });
}`;

fs.writeFileSync(path.join(outputDir, 'backend-functions.js'), backendCode);
console.log('✅ Generated: backend-functions.js (for Wix Backend)');

// 2. Page Code (goes in Wix Page Code)
const pageCode = `// PASTE THIS INTO WIX PAGE CODE
import { fetch } from 'wix-fetch';
import wixLocation from 'wix-location';

$w.onReady(function () {
  // Load programs when page loads
  loadPrograms();
  
  // Setup contact form
  setupContactForm();
  
  // Track page view
  trackPageView();
});

// Load and display programs
async function loadPrograms() {
  try {
    const response = await fetch('/programs');
    const data = await response.json();
    
    if (data.programs && data.programs.length > 0) {
      displayPrograms(data.programs);
    }
  } catch (error) {
    console.error('Failed to load programs:', error);
  }
}

// Display programs in repeater
function displayPrograms(programs) {
  if ($w('#programsRepeater')) {
    $w('#programsRepeater').data = programs;
    
    $w('#programsRepeater').onItemReady(($item, itemData) => {
      $item('#programTitle').text = itemData.title;
      $item('#programSummary').text = itemData.summary;
      
      $item('#learnMoreButton').onClick(() => {
        wixLocation.to(\`/programs/\${itemData.slug}\`);
      });
    });
  }
}

// Setup contact form
function setupContactForm() {
  if ($w('#submitButton')) {
    $w('#submitButton').onClick(async () => {
      const formData = {
        name: $w('#nameInput').value,
        email: $w('#emailInput').value,
        phone: $w('#phoneInput').value,
        message: $w('#messageInput').value,
        program: $w('#programSelect').value
      };
      
      // Validate
      if (!formData.name || !formData.email) {
        $w('#errorMessage').text = 'Name and email are required';
        $w('#errorMessage').show();
        return;
      }
      
      try {
        $w('#submitButton').disable();
        $w('#submitButton').label = 'Submitting...';
        
        const response = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          $w('#successMessage').text = result.message;
          $w('#successMessage').show();
          $w('#contactForm').hide();
        } else {
          $w('#errorMessage').text = result.error;
          $w('#errorMessage').show();
        }
      } catch (error) {
        $w('#errorMessage').text = 'Network error. Please try again.';
        $w('#errorMessage').show();
      } finally {
        $w('#submitButton').enable();
        $w('#submitButton').label = 'Submit';
      }
    });
  }
}

// Track page views
async function trackPageView() {
  try {
    await fetch('/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        page: wixLocation.path,
        data: { url: wixLocation.url }
      })
    });
  } catch (error) {
    console.error('Analytics failed:', error);
  }
}`;

fs.writeFileSync(path.join(outputDir, 'page-code.js'), pageCode);
console.log('✅ Generated: page-code.js (for Wix Page Code)');

// 3. Database Collections Setup
const databaseSetup = `# DATABASE COLLECTIONS SETUP
# Create these collections in Wix Content Manager

## 1. Programs Collection
Name: Programs
Permissions: Read: Anyone, Write: Admin

Fields:
- title (Text, Required)
- slug (Text, Required, Unique)  
- summary (Text)
- content (Rich Text)
- duration (Text)
- cost (Number)
- featured (Boolean)
- category (Text)

Sample Data:
{
  "title": "Healthcare Assistant Training",
  "slug": "healthcare-assistant",
  "summary": "Professional healthcare support certification",
  "content": "Learn essential healthcare skills...",
  "duration": "12 weeks",
  "cost": 2500,
  "featured": true,
  "category": "Healthcare"
}

## 2. Contacts Collection  
Name: Contacts
Permissions: Read: Admin, Write: Anyone

Fields:
- name (Text, Required)
- email (Text, Required)
- phone (Text)
- message (Text)
- program (Text)
- submittedAt (Date)
- status (Text)

## 3. Analytics Collection
Name: Analytics
Permissions: Read: Admin, Write: Site

Fields:
- event (Text, Required)
- page (Text)
- data (JSON)
- timestamp (Date)`;

fs.writeFileSync(path.join(outputDir, 'database-setup.md'), databaseSetup);
console.log('✅ Generated: database-setup.md (Database structure)');

// 4. Step-by-step deployment guide
const deployGuide = `# 🚀 DEPLOY TO WIX - STEP BY STEP

## STEP 1: Enable Dev Mode
1. Open your Wix site in Editor
2. Go to Settings → Advanced → Developer Tools  
3. Click "Enable Dev Mode"
4. Site will reload with dev capabilities

## STEP 2: Add Backend Code
1. In Wix Editor, click "Backend" in left sidebar
2. Click "+" to create new file
3. Name it: "http-functions.js"
4. Copy ALL code from: backend-functions.js
5. Paste into the file
6. Click "Save"

## STEP 3: Add Page Code
1. Go to the page where you want the functionality
2. Click "Code" button in top toolbar
3. Copy code from: page-code.js
4. Paste into the page code editor
5. Click "Save"

## STEP 4: Create Database Collections
1. Go to Content Manager in Wix Dashboard
2. Create collections as described in: database-setup.md
3. Add sample data to test

## STEP 5: Add Page Elements
Your page needs these elements (with exact IDs):

### For Programs Display:
- Repeater: #programsRepeater
  - Text: #programTitle
  - Text: #programSummary  
  - Button: #learnMoreButton

### For Contact Form:
- Input: #nameInput
- Input: #emailInput
- Input: #phoneInput
- Text Area: #messageInput
- Dropdown: #programSelect
- Button: #submitButton
- Text: #errorMessage (hidden)
- Text: #successMessage (hidden)
- Container: #contactForm

## STEP 6: Test & Publish
1. Click "Preview" to test
2. Try submitting contact form
3. Check if programs load
4. When working, click "Publish"

## 🎯 What You Get:
✅ Dynamic program loading from database
✅ Working contact form with validation
✅ Analytics tracking
✅ Professional error handling
✅ Mobile responsive

## 🆘 Troubleshooting:
- Check browser console for errors
- Verify element IDs match exactly
- Ensure database collections exist
- Test API endpoints work

## 🎉 Your Wix Site Is Now Automated!`;

fs.writeFileSync(path.join(outputDir, 'DEPLOY-GUIDE.md'), deployGuide);
console.log('✅ Generated: DEPLOY-GUIDE.md (Step-by-step instructions)');

// 5. Sample page elements HTML
const pageElements = `<!-- SAMPLE PAGE ELEMENTS FOR WIX -->
<!-- Copy these element structures into your Wix page -->

<!-- PROGRAMS SECTION -->
<div id="programsSection">
  <h2>Our Programs</h2>
  
  <!-- This will be populated by code -->
  <div id="programsRepeater">
    <!-- Repeater items will have: -->
    <!-- Text element: #programTitle -->
    <!-- Text element: #programSummary -->
    <!-- Button element: #learnMoreButton -->
  </div>
</div>

<!-- CONTACT FORM SECTION -->
<div id="contactForm">
  <h2>Contact Us</h2>
  
  <input id="nameInput" placeholder="Your Name" />
  <input id="emailInput" placeholder="Your Email" />
  <input id="phoneInput" placeholder="Your Phone" />
  <textarea id="messageInput" placeholder="Your Message"></textarea>
  
  <select id="programSelect">
    <option value="">Select a Program</option>
    <option value="healthcare">Healthcare Assistant</option>
    <option value="it-support">IT Support</option>
  </select>
  
  <button id="submitButton">Submit Application</button>
  
  <!-- Hidden messages -->
  <div id="errorMessage" style="display:none; color:red;"></div>
  <div id="successMessage" style="display:none; color:green;"></div>
</div>`;

fs.writeFileSync(path.join(outputDir, 'page-elements.html'), pageElements);
console.log('✅ Generated: page-elements.html (Sample page structure)');

console.log('\n🎉 Wix Dev Mode Code Ready!');
console.log('\n📁 Files in wix-ready-code/:');
console.log('   📄 backend-functions.js - Copy to Wix Backend');
console.log('   📄 page-code.js - Copy to Wix Page Code');
console.log('   📄 database-setup.md - Database collections');
console.log('   📄 DEPLOY-GUIDE.md - Step-by-step instructions');
console.log('   📄 page-elements.html - Sample page structure');
console.log('\n🚀 Follow DEPLOY-GUIDE.md to deploy to your Wix site!');
console.log('💡 All code is ready to copy-paste directly into Wix!');