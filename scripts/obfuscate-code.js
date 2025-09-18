#!/usr/bin/env node

/**
 * CODE OBFUSCATION SCRIPT
 * Obfuscates JavaScript files for production
 */

const fs = require('fs');
const path = require('path');

// Simple obfuscation function (for demonstration)
function obfuscateCode(code) {
  // Remove comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  code = code.replace(/\/\/.*$/gm, '');
  
  // Remove extra whitespace
  code = code.replace(/\s+/g, ' ');
  code = code.replace(/;\s*}/g, ';}');
  code = code.replace(/{\s*/g, '{');
  code = code.replace(/}\s*/g, '}');
  
  // Simple variable name obfuscation
  const varMap = new Map();
  let varCounter = 0;
  
  code = code.replace(/\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g, (match, keyword, varName) => {
    if (!varMap.has(varName)) {
      varMap.set(varName, `_${varCounter.toString(36)}`);
      varCounter++;
    }
    return `${keyword} ${varMap.get(varName)}`;
  });
  
  // Replace variable references
  varMap.forEach((obfuscated, original) => {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    code = code.replace(regex, obfuscated);
  });
  
  return code;
}

// Obfuscate production files
function obfuscateProductionFiles() {
  const filesToObfuscate = [
    'js/unified-navigation.js',
    'js/auth.js',
    'js/api.js'
  ];
  
  filesToObfuscate.forEach(file => {
    if (fs.existsSync(file)) {
      const originalCode = fs.readFileSync(file, 'utf8');
      const obfuscatedCode = obfuscateCode(originalCode);
      
      // Create backup
      fs.writeFileSync(`${file}.original`, originalCode);
      
      // Write obfuscated version
      fs.writeFileSync(file, obfuscatedCode);
      
      console.log(`✅ Obfuscated: ${file}`);
    }
  });
}

// Run obfuscation
if (require.main === module) {
  obfuscateProductionFiles();
}

module.exports = { obfuscateCode, obfuscateProductionFiles };