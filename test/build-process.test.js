/**
 * Build Process Tests
 * Tests to verify the build process works correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Build Process', () => {
  const distPath = path.join(__dirname, '..', 'dist');
  
  beforeAll(() => {
    // Clean dist directory
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
    }
  });

  test('should build successfully', () => {
    expect(() => {
      execSync('pnpm build', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    }).not.toThrow();
  });

  test('should create dist directory', () => {
    expect(fs.existsSync(distPath)).toBe(true);
  });

  test('should generate index.html', () => {
    const indexPath = path.join(distPath, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const content = fs.readFileSync(indexPath, 'utf8');
    expect(content).toContain('<!doctype html>');
    expect(content).toContain('Elevate for Humanity');
  });

  test('should generate JavaScript assets', () => {
    const files = fs.readdirSync(path.join(distPath, 'assets'));
    const jsFiles = files.filter(file => file.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  test('should generate CSS assets', () => {
    const files = fs.readdirSync(path.join(distPath, 'assets'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    expect(cssFiles.length).toBeGreaterThan(0);
  });

  test('should handle missing optional files gracefully', () => {
    // Test that build doesn't fail when optional files are missing
    const optionalFiles = ['robots.txt', '_headers', '_redirects'];
    
    optionalFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        // File exists, should be copied to dist
        expect(fs.existsSync(path.join(distPath, file))).toBe(true);
      } else {
        // File doesn't exist, build should still succeed
        expect(fs.existsSync(path.join(distPath, file))).toBe(false);
      }
    });
  });
});