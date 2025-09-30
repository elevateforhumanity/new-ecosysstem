#!/usr/bin/env node
/**
 * Build Performance Monitor
 * Tracks build times and provides optimization suggestions
 */

import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (color, ...args) => console.log(color + args.join(' ') + colors.reset);

function formatTime(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < sizes.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${sizes[i]}`;
}

function checkDependencies() {
  log(colors.cyan, '📦 Checking dependencies...');
  
  const checks = [
    { name: 'node_modules', path: 'node_modules', type: 'dir' },
    { name: 'package-lock.json', path: 'package-lock.json', type: 'file' },
    { name: 'vite.config.js', path: 'vite.config.js', type: 'file' },
    { name: '.vite cache', path: 'node_modules/.vite', type: 'dir' }
  ];

  for (const check of checks) {
    if (existsSync(check.path)) {
      const stats = statSync(check.path);
      const size = check.type === 'dir' ? 'dir' : formatSize(stats.size);
      log(colors.green, `✅ ${check.name} (${size})`);
    } else {
      log(colors.yellow, `⚠️  ${check.name} missing`);
    }
  }
}

function runBuild() {
  log(colors.cyan, '\n🏗️  Running build...');
  
  const start = performance.now();
  
  try {
    const output = execSync('npm run build', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const end = performance.now();
    const buildTime = end - start;
    
    log(colors.green, `✅ Build completed in ${formatTime(buildTime)}`);
    
    // Parse build output for insights
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('dist/')) {
        console.log(`  ${line}`);
      }
    });
    
    return { success: true, time: buildTime, output };
  } catch (error) {
    const end = performance.now();
    const buildTime = end - start;
    
    log(colors.red, `❌ Build failed in ${formatTime(buildTime)}`);
    console.error(error.stdout);
    return { success: false, time: buildTime, error: error.stderr };
  }
}

function analyzeDistSize() {
  if (!existsSync('dist')) {
    log(colors.yellow, '⚠️  No dist folder found');
    return;
  }

  log(colors.cyan, '\n📊 Analyzing bundle size...');
  
  try {
    const output = execSync('du -sh dist/*', { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    
    lines.forEach(line => {
      const [size, path] = line.split('\t');
      const filename = path.split('/').pop();
      
      if (filename.endsWith('.js')) {
        const sizeNum = parseFloat(size);
        const unit = size.replace(/[0-9.]/g, '');
        
        if ((unit === 'M' && sizeNum > 1) || (unit === 'K' && sizeNum > 500)) {
          log(colors.yellow, `⚠️  Large bundle: ${filename} (${size})`);
        } else {
          log(colors.green, `✅ ${filename} (${size})`);
        }
      } else {
        log(colors.cyan, `📄 ${filename} (${size})`);
      }
    });
  } catch (error) {
    log(colors.yellow, '⚠️  Could not analyze bundle sizes');
  }
}

function provideSuggestions(buildResult) {
  log(colors.cyan, '\n💡 Performance Suggestions:');
  
  const suggestions = [];
  
  if (buildResult.time > 5000) {
    suggestions.push('Consider using npm ci instead of npm install for faster dependency resolution');
    suggestions.push('Enable Vite build cache with persistent node_modules/.vite');
  }
  
  if (buildResult.time > 10000) {
    suggestions.push('Consider using esbuild for faster minification (already configured)');
    suggestions.push('Split large dependencies into separate chunks');
  }
  
  if (!existsSync('node_modules/.vite')) {
    suggestions.push('Vite cache directory missing - first builds are slower');
  }
  
  if (!existsSync('package-lock.json')) {
    suggestions.push('Use package-lock.json for consistent, faster installs');
  }
  
  // Always show current optimizations
  suggestions.push('✅ Using esbuild for fast minification');
  suggestions.push('✅ Manual chunk splitting configured');
  suggestions.push('✅ ES2022 target for modern browsers');
  
  suggestions.forEach(suggestion => {
    if (suggestion.startsWith('✅')) {
      log(colors.green, suggestion);
    } else {
      log(colors.yellow, `• ${suggestion}`);
    }
  });
}

function main() {
  console.log('🚀 Build Performance Monitor\n');
  
  checkDependencies();
  const buildResult = runBuild();
  
  if (buildResult.success) {
    analyzeDistSize();
  }
  
  provideSuggestions(buildResult);
  
  // Summary
  log(colors.cyan, `\n📈 Summary:`);
  log(buildResult.success ? colors.green : colors.red, 
    `Build: ${buildResult.success ? 'SUCCESS' : 'FAILED'} in ${formatTime(buildResult.time)}`);
  
  if (buildResult.time < 2000) {
    log(colors.green, '🔥 Excellent build performance!');
  } else if (buildResult.time < 5000) {
    log(colors.yellow, '⚡ Good build performance');
  } else {
    log(colors.red, '🐌 Build could be faster');
  }
}

main();