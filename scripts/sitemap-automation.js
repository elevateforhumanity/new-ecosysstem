#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import SitemapGenerator from './generate-sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SitemapAutomation {
  constructor(config = {}) {
    this.config = {
      scheduleEnabled: config.scheduleEnabled !== false,
      deployAfterGeneration: config.deployAfterGeneration !== false,
      notifyIndexNow: config.notifyIndexNow !== false,
      indexNowKey: config.indexNowKey || process.env.INDEXNOW_KEY,
      baseUrl: config.baseUrl || process.env.BASE_URL || 'https://www.elevateforhumanity.org',
      outputDir: config.outputDir || './deploy',
      logFile: config.logFile || './logs/sitemap-automation.log'
    };
  }

  async run() {
    const startTime = Date.now();
    await this.log('🚀 Starting automated sitemap generation');

    try {
      // Generate sitemaps
      const generator = new SitemapGenerator({
        baseUrl: this.config.baseUrl,
        outputDir: this.config.outputDir
      });

      const result = await generator.generateSitemaps();
      await this.log(`✅ Generated ${result.sitemaps} sitemaps with ${result.totalUrls} URLs`);

      // Deploy if enabled
      if (this.config.deployAfterGeneration) {
        await this.deploySitemaps();
      }

      // Notify search engines if enabled
      if (this.config.notifyIndexNow && this.config.indexNowKey) {
        await this.notifySearchEngines();
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      await this.log(`🎉 Automation completed successfully in ${duration}s`);

      return { success: true, duration, ...result };

    } catch (error) {
      await this.log(`❌ Automation failed: ${error.message}`);
      throw error;
    }
  }

  async deploySitemaps() {
    await this.log('📤 Deploying sitemaps...');

    try {
      // Check if we're in a Netlify environment
      if (process.env.NETLIFY) {
        await this.log('🌐 Detected Netlify environment - sitemaps will be deployed automatically');
        return;
      }

      // Check if deploy script exists
      const deployScript = './deploy-netlify.sh';
      try {
        await fs.access(deployScript);
        await this.execCommand(`chmod +x ${deployScript} && ${deployScript}`);
        await this.log('✅ Sitemaps deployed via deploy script');
      } catch {
        await this.log('⚠️ No deploy script found - manual deployment required');
      }

    } catch (error) {
      await this.log(`❌ Deployment failed: ${error.message}`);
      throw error;
    }
  }

  async notifySearchEngines() {
    await this.log('🔔 Notifying search engines...');

    try {
      const sitemapUrl = `${this.config.baseUrl}/sitemap.xml`;
      
      // IndexNow notification
      if (this.config.indexNowKey) {
        const indexNowUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(sitemapUrl)}&key=${this.config.indexNowKey}`;
        
        try {
          const response = await fetch(indexNowUrl, { method: 'GET' });
          if (response.ok) {
            await this.log('✅ IndexNow notification sent successfully');
          } else {
            await this.log(`⚠️ IndexNow notification failed: ${response.status}`);
          }
        } catch (error) {
          await this.log(`⚠️ IndexNow notification error: ${error.message}`);
        }
      }

      // Google Search Console ping (if configured)
      if (process.env.GOOGLE_SEARCH_CONSOLE_PING) {
        const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        try {
          const response = await fetch(googleUrl, { method: 'GET' });
          await this.log(`📍 Google Search Console pinged: ${response.status}`);
        } catch (error) {
          await this.log(`⚠️ Google ping error: ${error.message}`);
        }
      }

    } catch (error) {
      await this.log(`❌ Search engine notification failed: ${error.message}`);
    }
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}`));
          return;
        }
        resolve({ stdout, stderr });
      });
    });
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    // Write to log file if configured
    if (this.config.logFile) {
      try {
        await fs.mkdir(path.dirname(this.config.logFile), { recursive: true });
        await fs.appendFile(this.config.logFile, logMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  // Schedule automation (for cron jobs)
  static setupCron() {
    console.log('Setting up cron job for sitemap automation...');
    console.log('Add this to your crontab for daily generation at 3 AM UTC:');
    console.log('0 3 * * * cd /path/to/project && node scripts/sitemap-automation.js');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new SitemapAutomation({
    scheduleEnabled: true,
    deployAfterGeneration: process.env.AUTO_DEPLOY !== 'false',
    notifyIndexNow: process.env.NOTIFY_INDEXNOW !== 'false',
    indexNowKey: process.env.INDEXNOW_KEY
  });

  automation.run()
    .then(result => {
      console.log('\n🎉 Automation completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Automation failed:', error.message);
      process.exit(1);
    });
}

export default SitemapAutomation;