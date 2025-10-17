#!/usr/bin/env node

/**
 * Tailwind CSS Autopilot Diagnostic
 * Comprehensive check of Tailwind configuration and build process
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TAILWIND CSS AUTOPILOT DIAGNOSTIC\n');
console.log('='.repeat(60));

// 1. Check Tailwind Config
console.log('\n📋 1. TAILWIND CONFIGURATION');
console.log('-'.repeat(60));

try {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  console.log('✅ tailwind.config.js exists');

  // Check content paths
  if (tailwindConfig.includes('./src/**/*.{js,jsx}')) {
    console.log('✅ Content paths include src/**/*.{js,jsx}');
  } else {
    console.log('❌ Content paths may be incorrect');
  }

  // Check for plugins
  if (tailwindConfig.includes('tailwindcss-animate')) {
    console.log('✅ tailwindcss-animate plugin configured');
  }

  // Check for custom theme
  if (tailwindConfig.includes('extend:')) {
    console.log('✅ Custom theme extensions found');
  }
} catch (err) {
  console.log('❌ tailwind.config.js not found or unreadable');
}

// 2. Check PostCSS Config
console.log('\n📋 2. POSTCSS CONFIGURATION');
console.log('-'.repeat(60));

try {
  const postcssConfig = fs.readFileSync('postcss.config.js', 'utf8');
  console.log('✅ postcss.config.js exists');

  if (postcssConfig.includes('tailwindcss')) {
    console.log('✅ Tailwind CSS plugin configured');
  } else {
    console.log('❌ Tailwind CSS plugin missing');
  }

  if (postcssConfig.includes('autoprefixer')) {
    console.log('✅ Autoprefixer plugin configured');
  }
} catch (err) {
  console.log('❌ postcss.config.js not found');
}

// 3. Check CSS Entry Point
console.log('\n📋 3. CSS ENTRY POINT');
console.log('-'.repeat(60));

try {
  const indexCSS = fs.readFileSync('src/index.css', 'utf8');
  console.log('✅ src/index.css exists');

  const directives = [
    '@tailwind base',
    '@tailwind components',
    '@tailwind utilities',
  ];
  directives.forEach((directive) => {
    if (indexCSS.includes(directive)) {
      console.log(`✅ ${directive} directive found`);
    } else {
      console.log(`❌ ${directive} directive missing`);
    }
  });

  // Check for duplicate directives
  const directiveCount = (indexCSS.match(/@tailwind/g) || []).length;
  if (directiveCount === 3) {
    console.log('✅ Correct number of @tailwind directives (3)');
  } else {
    console.log(
      `⚠️  Found ${directiveCount} @tailwind directives (expected 3)`
    );
  }
} catch (err) {
  console.log('❌ src/index.css not found');
}

// 4. Check for duplicate CSS files
console.log('\n📋 4. CSS FILES CHECK');
console.log('-'.repeat(60));

const cssFiles = [
  'src/index.css',
  'src/styles/shadcn.css',
  'src/styles/global.css',
  'src/styles/theme.css',
];

cssFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasTailwindDirectives = content.includes('@tailwind');
    console.log(
      `${hasTailwindDirectives ? '⚠️ ' : '✅'} ${file} ${hasTailwindDirectives ? '(has @tailwind directives)' : '(no directives)'}`
    );
  }
});

// 5. Check main.jsx imports
console.log('\n📋 5. MAIN ENTRY POINT');
console.log('-'.repeat(60));

try {
  const mainJsx = fs.readFileSync('src/main.jsx', 'utf8');
  console.log('✅ src/main.jsx exists');

  if (mainJsx.includes("import './index.css'")) {
    console.log('✅ index.css is imported');
  } else {
    console.log('❌ index.css import missing');
  }

  // Check for duplicate CSS imports
  const cssImports = mainJsx.match(/import.*\.css/g) || [];
  console.log(`📊 Found ${cssImports.length} CSS import(s):`);
  cssImports.forEach((imp) => console.log(`   - ${imp}`));
} catch (err) {
  console.log('❌ src/main.jsx not found');
}

// 6. Check package.json dependencies
console.log('\n📋 6. DEPENDENCIES');
console.log('-'.repeat(60));

try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const required = {
    tailwindcss: deps.tailwindcss,
    postcss: deps.postcss,
    autoprefixer: deps.autoprefixer,
    'tailwindcss-animate': deps['tailwindcss-animate'],
  };

  Object.entries(required).forEach(([name, version]) => {
    if (version) {
      console.log(`✅ ${name}: ${version}`);
    } else {
      console.log(`❌ ${name}: NOT INSTALLED`);
    }
  });
} catch (err) {
  console.log('❌ package.json not found');
}

// 7. Check Vite config
console.log('\n📋 7. VITE CONFIGURATION');
console.log('-'.repeat(60));

try {
  const viteConfig = fs.readFileSync('vite.config.js', 'utf8');
  console.log('✅ vite.config.js exists');

  if (viteConfig.includes('@vitejs/plugin-react')) {
    console.log('✅ React plugin configured');
  }

  if (viteConfig.includes('build:')) {
    console.log('✅ Build configuration found');
  }
} catch (err) {
  console.log('❌ vite.config.js not found');
}

// 8. Check build output
console.log('\n📋 8. BUILD OUTPUT CHECK');
console.log('-'.repeat(60));

if (fs.existsSync('dist')) {
  console.log('✅ dist/ directory exists');

  // Find CSS files
  const cssFiles = [];
  const findCSS = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findCSS(fullPath);
      } else if (file.endsWith('.css')) {
        cssFiles.push(fullPath);
      }
    });
  };

  findCSS('dist');

  if (cssFiles.length > 0) {
    console.log(`✅ Found ${cssFiles.length} CSS file(s) in dist/`);

    cssFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const size = (content.length / 1024).toFixed(2);

      // Check if CSS is compiled
      const hasRawDirectives = content.includes('@tailwind');
      const hasCompiledClasses =
        content.includes('.flex{') || content.includes('.grid{');

      console.log(`\n   📄 ${file}`);
      console.log(`      Size: ${size} KB`);

      if (hasRawDirectives) {
        console.log('      ❌ Contains uncompiled @tailwind directives');
      } else if (hasCompiledClasses) {
        console.log('      ✅ CSS is properly compiled');
      } else {
        console.log('      ⚠️  CSS may be incomplete');
      }
    });
  } else {
    console.log('❌ No CSS files found in dist/');
  }
} else {
  console.log('⚠️  dist/ directory not found (run build first)');
}

// 9. Check index.html
console.log('\n📋 9. INDEX.HTML CHECK');
console.log('-'.repeat(60));

try {
  const indexHTML = fs.readFileSync('index.html', 'utf8');
  console.log('✅ index.html exists');

  if (indexHTML.includes('src/main.jsx')) {
    console.log('✅ References src/main.jsx');
  } else if (indexHTML.includes('src/main.tsx')) {
    console.log('⚠️  References src/main.tsx (should be .jsx)');
  } else {
    console.log('❌ Main entry point reference not found');
  }

  // Check for CDN Tailwind (should not be present)
  if (indexHTML.includes('cdn.tailwindcss.com')) {
    console.log('❌ CDN Tailwind detected (should be removed)');
  } else {
    console.log('✅ No CDN Tailwind (good)');
  }
} catch (err) {
  console.log('❌ index.html not found');
}

// 10. Summary
console.log('\n📋 10. DIAGNOSTIC SUMMARY');
console.log('='.repeat(60));

console.log('\n🔧 RECOMMENDED ACTIONS:');
console.log('1. Ensure all @tailwind directives are ONLY in src/index.css');
console.log('2. Remove any duplicate CSS imports from src/main.jsx');
console.log('3. Run: pnpm run build');
console.log('4. Check dist/assets/*.css for compiled Tailwind classes');
console.log('5. Deploy to Netlify with "Clear cache and deploy"');

console.log('\n✨ Diagnostic complete!\n');
