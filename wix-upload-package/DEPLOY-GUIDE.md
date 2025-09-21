# 🚀 DEPLOY TO WIX - STEP BY STEP

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

## 🎉 Your Wix Site Is Now Automated!