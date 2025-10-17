#!/usr/bin/env node
/**
 * Remove console.log statements from production build
 * Keeps console.error for critical error logging
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('src/**/*.{jsx,tsx,js,ts}', {
  ignore: 'node_modules/**',
});

let totalRemoved = 0;

files.forEach((file) => {
  let content = readFileSync(file, 'utf8');
  const original = content;

  // Remove console.log statements (keep console.error and console.warn)
  content = content.replace(/console\.log\([^)]*\);?\n?/g, '');

  // Remove standalone console.log in if statements
  content = content.replace(/if\s*\([^)]*\)\s*console\.log\([^)]*\);?\n?/g, '');

  if (content !== original) {
    writeFileSync(file, content, 'utf8');
    const removed = (original.match(/console\.log/g) || []).length;
    totalRemoved += removed;
    console.log(`✅ ${file}: Removed ${removed} console.log statement(s)`);
  }
});

console.log(`\n🎉 Total removed: ${totalRemoved} console.log statements`);
