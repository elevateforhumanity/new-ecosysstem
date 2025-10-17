#!/usr/bin/env node
/**
 * Autopilot Cleanup Script
 * Cleans up temporary files, logs, and artifacts from autopilot runs
 */

import { promises as fs } from 'fs';
import path from 'path';

const CLEANUP_PATHS = [
  '.turbo',
  '.next/cache',
  'dist',
  'build',
  'coverage',
  '.cache',
  'tmp',
  '*.log',
  '.autopilot-cache',
];

async function cleanup() {
  console.log('🧹 Starting autopilot cleanup...\n');

  for (const cleanPath of CLEANUP_PATHS) {
    try {
      const fullPath = path.resolve(process.cwd(), cleanPath);
      const stats = await fs.stat(fullPath).catch(() => null);

      if (stats) {
        if (stats.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
          console.log(`   ✅ Removed directory: ${cleanPath}`);
        } else {
          await fs.unlink(fullPath);
          console.log(`   ✅ Removed file: ${cleanPath}`);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`   ⚠️  Could not remove ${cleanPath}: ${error.message}`);
      }
    }
  }

  console.log('\n✨ Cleanup complete!');
}

cleanup().catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
