#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SitemapGenerator {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://www.elevateforhumanity.org';
    this.outputDir = config.outputDir || './deploy';
    this.dataFile = config.dataFile || './data/seeds/all-programs.json';
    this.maxUrlsPerSitemap = config.maxUrlsPerSitemap || 50000;
    this.priority = {
      home: '1.0',
      main: '0.9',
      programs: '0.8',
      other: '0.7'
    };
    this.changefreq = {
      home: 'daily',
      main: 'daily', 
      programs: 'weekly',
      other: 'monthly'
    };
  }

  async generateSitemaps() {
    console.log('🚀 Starting sitemap generation...');
    
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Load program data
      const programs = await this.loadPrograms();
      console.log(`📊 Loaded ${programs.length} programs`);

      // Generate main sitemap
      await this.generateMainSitemap();
      
      // Generate program sitemaps (chunked)
      const programSitemaps = await this.generateProgramSitemaps(programs);
      
      // Generate sitemap index
      await this.generateSitemapIndex(programSitemaps);
      
      console.log('✅ Sitemap generation completed successfully');
      
      return {
        success: true,
        sitemaps: programSitemaps.length + 1, // +1 for main sitemap
        totalUrls: programs.length + this.getStaticUrls().length,
        outputDir: this.outputDir
      };

    } catch (error) {
      console.error('❌ Sitemap generation failed:', error);
      throw error;
    }
  }

  async loadPrograms() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Handle different data structures
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.programs && Array.isArray(parsed.programs)) {
        return parsed.programs;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
      
      throw new Error('Invalid program data structure');
    } catch (error) {
      console.error('Failed to load programs:', error);
      return [];
    }
  }

  getStaticUrls() {
    return [
      { url: '/', priority: this.priority.home, changefreq: this.changefreq.home },
      { url: '/programs/', priority: this.priority.main, changefreq: this.changefreq.main },
      { url: '/about/', priority: this.priority.other, changefreq: this.changefreq.other },
      { url: '/contact/', priority: this.priority.other, changefreq: this.changefreq.other },
      { url: '/students/', priority: this.priority.main, changefreq: this.changefreq.main },
      { url: '/contracts/', priority: this.priority.main, changefreq: this.changefreq.main }
    ];
  }

  async generateMainSitemap() {
    const urls = this.getStaticUrls();
    const xml = this.buildSitemapXml(urls);
    
    const filename = path.join(this.outputDir, 'sitemap-main.xml');
    await fs.writeFile(filename, xml);
    console.log(`📄 Generated main sitemap: ${filename}`);
  }

  async generateProgramSitemaps(programs) {
    const chunks = this.chunkArray(programs, this.maxUrlsPerSitemap);
    const sitemapFiles = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const urls = chunk.map(program => ({
        url: `/programs/${this.generateSlug(program.title || program.name)}-${program.id || i}`,
        priority: this.priority.programs,
        changefreq: this.changefreq.programs,
        lastmod: program.updated_at || program.lastModified || new Date().toISOString()
      }));

      const xml = this.buildSitemapXml(urls);
      const filename = `sitemap-programs-${i + 1}.xml`;
      const filepath = path.join(this.outputDir, filename);
      
      await fs.writeFile(filepath, xml);
      sitemapFiles.push(filename);
      
      console.log(`📄 Generated program sitemap ${i + 1}/${chunks.length}: ${filename} (${urls.length} URLs)`);
    }

    return sitemapFiles;
  }

  async generateSitemapIndex(programSitemaps) {
    const lastmod = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.baseUrl}/sitemap-main.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;

    for (const sitemapFile of programSitemaps) {
      xml += `
  <sitemap>
    <loc>${this.baseUrl}/${sitemapFile}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    }

    xml += '\n</sitemapindex>';

    const filename = path.join(this.outputDir, 'sitemap.xml');
    await fs.writeFile(filename, xml);
    console.log(`📄 Generated sitemap index: ${filename}`);
  }

  buildSitemapXml(urls) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const urlData of urls) {
      const lastmod = urlData.lastmod ? urlData.lastmod.split('T')[0] : new Date().toISOString().split('T')[0];
      
      xml += `
  <url>
    <loc>${this.baseUrl}${urlData.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${urlData.changefreq}</changefreq>
    <priority>${urlData.priority}</priority>
  </url>`;
    }

    xml += '\n</urlset>';
    return xml;
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100); // Limit length
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = {
    baseUrl: process.env.BASE_URL || 'https://www.elevateforhumanity.org',
    outputDir: process.env.OUTPUT_DIR || './deploy',
    dataFile: process.env.DATA_FILE || './data/seeds/all-programs.json'
  };

  const generator = new SitemapGenerator(config);
  
  generator.generateSitemaps()
    .then(result => {
      console.log('\n🎉 Sitemap generation summary:');
      console.log(`   Sitemaps created: ${result.sitemaps}`);
      console.log(`   Total URLs: ${result.totalUrls}`);
      console.log(`   Output directory: ${result.outputDir}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Generation failed:', error.message);
      process.exit(1);
    });
}

export default SitemapGenerator;