#!/usr/bin/env node

/**
 * PRODUCTION BUILD SCRIPT
 * Prepares code for production deployment with security measures
 */

const fs = require('fs');
const path = require('path');
const { obfuscateProductionFiles } = require('./obfuscate-code');

console.log('🏗️  Starting production build...');

// Remove development files
function removeDevFiles() {
  const devFiles = [
    'csp-test.html',
    'test.html',
    'demo-site.html',
    '*.log',
    '*.bak',
    '*.backup',
    '*.old',
    '*.map'
  ];
  
  devFiles.forEach(pattern => {
    if (pattern.includes('*')) {
      // Handle glob patterns
      const regex = new RegExp(pattern.replace('*', '.*'));
      fs.readdirSync('.').forEach(file => {
        if (regex.test(file)) {
          fs.unlinkSync(file);
          console.log(`🗑️  Removed: ${file}`);
        }
      });
    } else if (fs.existsSync(pattern)) {
      fs.unlinkSync(pattern);
      console.log(`🗑️  Removed: ${pattern}`);
    }
  });
}

// Minify CSS files
function minifyCSS() {
  const cssFiles = ['css/styles.css', 'animations.css'];
  
  cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let css = fs.readFileSync(file, 'utf8');
      
      // Simple CSS minification
      css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
      css = css.replace(/\s+/g, ' '); // Collapse whitespace
      css = css.replace(/;\s*}/g, ';}'); // Remove space before closing brace
      css = css.replace(/{\s*/g, '{'); // Remove space after opening brace
      css = css.replace(/}\s*/g, '}'); // Remove space after closing brace
      css = css.replace(/;\s*/g, ';'); // Remove space after semicolon
      css = css.trim();
      
      fs.writeFileSync(file, css);
      console.log(`✅ Minified: ${file}`);
    }
  });
}

// Remove source map references
function removeSourceMapReferences() {
  function processFile(filePath) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/\/\/# sourceMappingURL=.*$/gm, '');
      fs.writeFileSync(filePath, content);
      console.log(`✅ Removed source map references: ${filePath}`);
    }
  }
  
  const jsFiles = ['js/unified-navigation.js', 'app.js', 'main.js'];
  jsFiles.forEach(processFile);
}

// Add production headers
function addProductionHeaders() {
  const productionHeaders = `/*
  Production Build - ${new Date().toISOString()}
  Copyright (c) 2025 Elevate for Humanity
  All rights reserved. Unauthorized copying prohibited.
*/`;

  const filesToHeader = ['index.html', 'hub.html', 'js/unified-navigation.js'];
  
  filesToHeader.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const newContent = file.endsWith('.html') 
        ? `<!-- ${productionHeaders} -->\n${content}`
        : `${productionHeaders}\n${content}`;
      
      fs.writeFileSync(file, newContent);
      console.log(`✅ Added production header: ${file}`);
    }
  });
}

// Run production build
function runProductionBuild() {
  console.log('1. Removing development files...');
  removeDevFiles();
  
  console.log('2. Obfuscating JavaScript...');
  obfuscateProductionFiles();
  
  console.log('3. Minifying CSS...');
  minifyCSS();
  
  console.log('4. Removing source map references...');
  removeSourceMapReferences();
  
  console.log('5. Adding production headers...');
  addProductionHeaders();
  
  console.log('🎉 Production build complete!');
}

if (require.main === module) {
  runProductionBuild();
}

module.exports = { runProductionBuild };