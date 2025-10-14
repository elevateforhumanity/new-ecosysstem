/**
 * Route Validator Service
 * Validates and auto-fixes routing configuration
 */

const fs = require('fs');
const path = require('path');

class RouteValidator {
  constructor() {
    this.rootDir = process.cwd();
    this.pagesDir = path.join(this.rootDir, 'src/pages');
    this.appFile = path.join(this.rootDir, 'src/App.jsx');
    this.routesConfig = path.join(this.rootDir, 'routes.config.mjs');
    this.logDir = path.join(this.rootDir, '.data/routing');
    
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Scan pages directory for components
   * @returns {Array} List of page components
   */
  scanPages() {
    const pages = [];
    
    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && /\.(jsx|tsx)$/.test(entry.name)) {
          const relativePath = path.relative(this.pagesDir, fullPath);
          const componentName = path.basename(entry.name, path.extname(entry.name));
          
          pages.push({
            name: componentName,
            file: fullPath,
            relativePath,
            route: this.componentToRoute(componentName)
          });
        }
      }
    };
    
    if (fs.existsSync(this.pagesDir)) {
      scanDir(this.pagesDir);
    }
    
    return pages;
  }

  /**
   * Convert component name to route path
   * @param {string} componentName - Component name
   * @returns {string} Route path
   */
  componentToRoute(componentName) {
    // Special cases
    if (componentName === 'HomePage' || componentName === 'Home') {
      return '/';
    }
    
    if (componentName === 'NotFound') {
      return '*';
    }
    
    // Convert PascalCase to kebab-case
    const kebab = componentName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    
    return `/${kebab}`;
  }

  /**
   * Parse App.jsx for imports and routes
   * @returns {Object} Parsed imports and routes
   */
  parseAppFile() {
    if (!fs.existsSync(this.appFile)) {
      return { imports: [], routes: [] };
    }

    const content = fs.readFileSync(this.appFile, 'utf8');
    const imports = [];
    const routes = [];

    // Extract lazy imports
    const lazyImportRegex = /const\s+(\w+)\s+=\s+lazy\(\s*\(\)\s*=>\s*import\(['"](.*?)['"]\)/g;
    let match;
    
    while ((match = lazyImportRegex.exec(content)) !== null) {
      imports.push({
        name: match[1],
        path: match[2]
      });
    }

    // Extract regular imports
    const importRegex = /import\s+(\w+)\s+from\s+['"](.*?)['"]/g;
    while ((match = importRegex.exec(content)) !== null) {
      if (!match[2].startsWith('./components')) {
        imports.push({
          name: match[1],
          path: match[2]
        });
      }
    }

    // Extract routes
    const routeRegex = /<Route\s+path=["']([^"']+)["']\s+element={<(\w+)/g;
    while ((match = routeRegex.exec(content)) !== null) {
      routes.push({
        path: match[1],
        component: match[2]
      });
    }

    return { imports, routes };
  }

  /**
   * Validate routing configuration
   * @returns {Object} Validation results
   */
  validate() {
    const pages = this.scanPages();
    const { imports, routes } = this.parseAppFile();
    
    const results = {
      totalPages: pages.length,
      totalImports: imports.length,
      totalRoutes: routes.length,
      missingImports: [],
      missingRoutes: [],
      unusedImports: [],
      issues: []
    };

    // Check for missing imports
    for (const page of pages) {
      const hasImport = imports.some(imp => imp.name === page.name);
      if (!hasImport) {
        results.missingImports.push(page);
        results.issues.push({
          type: 'missing_import',
          component: page.name,
          file: page.file
        });
      }
    }

    // Check for missing routes
    for (const page of pages) {
      const hasRoute = routes.some(route => 
        route.path === page.route && route.component === page.name
      );
      if (!hasRoute && page.route !== '*') {
        results.missingRoutes.push(page);
        results.issues.push({
          type: 'missing_route',
          component: page.name,
          route: page.route
        });
      }
    }

    // Check for unused imports
    for (const imp of imports) {
      const hasRoute = routes.some(route => route.component === imp.name);
      const isComponent = imp.path.includes('./components');
      if (!hasRoute && !isComponent) {
        results.unusedImports.push(imp);
        results.issues.push({
          type: 'unused_import',
          component: imp.name,
          path: imp.path
        });
      }
    }

    return results;
  }

  /**
   * Generate import statement for component
   * @param {Object} page - Page component info
   * @returns {string} Import statement
   */
  generateImport(page) {
    const relativePath = page.relativePath.replace(/\\/g, '/').replace(/\.(jsx|tsx)$/, '');
    return `const ${page.name} = lazy(() => import("./pages/${relativePath}"));`;
  }

  /**
   * Generate route element for component
   * @param {Object} page - Page component info
   * @returns {string} Route element
   */
  generateRoute(page) {
    return `        <Route path="${page.route}" element={<${page.name} />} />`;
  }

  /**
   * Auto-fix routing issues
   * @param {Object} validation - Validation results
   * @returns {Object} Fix results
   */
  autoFix(validation) {
    const results = {
      importsAdded: 0,
      routesAdded: 0,
      success: false,
      error: null
    };

    try {
      if (!fs.existsSync(this.appFile)) {
        throw new Error('App.jsx not found');
      }

      let content = fs.readFileSync(this.appFile, 'utf8');
      let modified = false;

      // Add missing imports
      if (validation.missingImports.length > 0) {
        // Find the last lazy import
        const lastLazyImportMatch = content.match(/const\s+\w+\s+=\s+lazy\([^)]+\);(?:\s*\n)/g);
        if (lastLazyImportMatch) {
          const lastImport = lastLazyImportMatch[lastLazyImportMatch.length - 1];
          const insertPos = content.lastIndexOf(lastImport) + lastImport.length;
          
          const newImports = validation.missingImports
            .map(page => this.generateImport(page))
            .join('\n');
          
          content = content.slice(0, insertPos) + newImports + '\n' + content.slice(insertPos);
          results.importsAdded = validation.missingImports.length;
          modified = true;
        }
      }

      // Add missing routes
      if (validation.missingRoutes.length > 0) {
        // Find the NotFound route (usually last)
        const notFoundMatch = content.match(/<Route\s+path="\*"[^>]*>/);
        if (notFoundMatch) {
          const insertPos = content.indexOf(notFoundMatch[0]);
          
          const newRoutes = validation.missingRoutes
            .map(page => this.generateRoute(page))
            .join('\n');
          
          content = content.slice(0, insertPos) + newRoutes + '\n        ' + content.slice(insertPos);
          results.routesAdded = validation.missingRoutes.length;
          modified = true;
        }
      }

      if (modified) {
        // Backup original file
        const backupPath = `${this.appFile}.bak.${Date.now()}`;
        fs.copyFileSync(this.appFile, backupPath);
        
        // Write updated content
        fs.writeFileSync(this.appFile, content, 'utf8');
        results.success = true;
      }

    } catch (error) {
      results.error = error.message;
    }

    return results;
  }

  /**
   * Update routes.config.mjs
   * @param {Array} pages - Page components
   * @returns {boolean} Success
   */
  updateRoutesConfig(pages) {
    try {
      // Read existing routes
      let existingRoutes = [];
      if (fs.existsSync(this.routesConfig)) {
        const content = fs.readFileSync(this.routesConfig, 'utf8');
        const match = content.match(/export\s+const\s+routes\s+=\s+\[([\s\S]*?)\]/);
        if (match) {
          existingRoutes = match[1]
            .split(',')
            .map(r => r.trim().replace(/['"]/g, ''))
            .filter(r => r);
        }
      }

      // Add page routes
      const allRoutes = new Set(existingRoutes);
      for (const page of pages) {
        if (page.route !== '*') {
          allRoutes.add(page.route);
        }
      }

      // Write updated config
      const routesArray = Array.from(allRoutes).sort();
      const content = `export const routes = [\n  ${routesArray.map(r => `'${r}'`).join(',\n  ')}\n];\n`;
      
      // Backup existing file
      if (fs.existsSync(this.routesConfig)) {
        const backupPath = `${this.routesConfig}.bak.${Date.now()}`;
        fs.copyFileSync(this.routesConfig, backupPath);
      }
      
      fs.writeFileSync(this.routesConfig, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to update routes.config.mjs:', error.message);
      return false;
    }
  }

  /**
   * Generate validation report
   * @param {Object} validation - Validation results
   * @returns {string} Report path
   */
  generateReport(validation) {
    const reportPath = path.join(this.logDir, 'validation-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      ...validation
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    return reportPath;
  }

  /**
   * Run full validation and auto-fix
   * @param {boolean} autoFix - Whether to auto-fix issues
   * @returns {Object} Results
   */
  run(autoFix = false) {
    const pages = this.scanPages();
    const validation = this.validate();
    
    let fixResults = null;
    if (autoFix && validation.issues.length > 0) {
      fixResults = this.autoFix(validation);
      
      // Update routes.config.mjs
      this.updateRoutesConfig(pages);
    }

    const reportPath = this.generateReport(validation);

    return {
      validation,
      fixResults,
      reportPath,
      pages
    };
  }
}

module.exports = new RouteValidator();
