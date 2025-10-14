/**
 * Content Duplication Scanner
 * Compatible with existing military-grade encryption
 * Uses content fingerprinting and external search APIs
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class DuplicationScanner {
  constructor() {
    this.scanHistoryPath = path.join(process.cwd(), '.data/security/scan-history.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    const dir = path.dirname(this.scanHistoryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate content fingerprint using SHA-256
   * @param {string} content - Content to fingerprint
   * @returns {string} Hex fingerprint
   */
  generateFingerprint(content) {
    return crypto
      .createHash('sha256')
      .update(content.trim().toLowerCase())
      .digest('hex');
  }

  /**
   * Generate multiple fingerprints for fuzzy matching
   * @param {string} content - Content to analyze
   * @returns {Object} Multiple fingerprints
   */
  generateFingerprintSet(content) {
    const normalized = content.trim().toLowerCase();
    const words = normalized.split(/\s+/);
    
    return {
      full: this.generateFingerprint(content),
      first100: this.generateFingerprint(words.slice(0, 100).join(' ')),
      first50: this.generateFingerprint(words.slice(0, 50).join(' ')),
      first25: this.generateFingerprint(words.slice(0, 25).join(' ')),
      wordCount: words.length,
      charCount: content.length
    };
  }

  /**
   * Extract key phrases for search
   * @param {string} content - Content to analyze
   * @param {number} count - Number of phrases to extract
   * @returns {Array<string>} Key phrases
   */
  extractKeyPhrases(content, count = 5) {
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200);
    
    // Return unique sentences, prioritizing longer ones
    const unique = [...new Set(sentences)]
      .sort((a, b) => b.length - a.length)
      .slice(0, count);
    
    return unique;
  }

  /**
   * Search DuckDuckGo for content matches (no API key required)
   * @param {string} phrase - Search phrase
   * @returns {Promise<Object>} Search results
   */
  async searchDuckDuckGo(phrase) {
    try {
      // DuckDuckGo Instant Answer API (no auth required)
      const url = new URL('https://api.duckduckgo.com/');
      url.searchParams.set('q', phrase);
      url.searchParams.set('format', 'json');
      url.searchParams.set('no_html', '1');
      url.searchParams.set('skip_disambig', '1');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'ElevateForHumanity-ContentProtection/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        found: !!(data.AbstractText || data.RelatedTopics?.length > 0),
        source: 'duckduckgo',
        abstract: data.AbstractText || '',
        relatedTopics: data.RelatedTopics?.length || 0,
        url: data.AbstractURL || ''
      };
    } catch (error) {
      return {
        found: false,
        source: 'duckduckgo',
        error: error.message
      };
    }
  }

  /**
   * Search using Google Custom Search (requires API key)
   * @param {string} phrase - Search phrase
   * @returns {Promise<Object>} Search results
   */
  async searchGoogle(phrase) {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      return {
        found: false,
        source: 'google',
        error: 'API key or Search Engine ID not configured'
      };
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('cx', searchEngineId);
      url.searchParams.set('q', phrase);
      url.searchParams.set('num', '10');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        found: data.searchInformation?.totalResults > 0,
        source: 'google',
        totalResults: parseInt(data.searchInformation?.totalResults || 0),
        items: data.items?.map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        })) || []
      };
    } catch (error) {
      return {
        found: false,
        source: 'google',
        error: error.message
      };
    }
  }

  /**
   * Scan content for potential duplicates
   * @param {string} content - Content to scan
   * @param {Object} options - Scan options
   * @returns {Promise<Object>} Scan results
   */
  async scanContent(content, options = {}) {
    const {
      searchEngines = ['duckduckgo'],
      maxPhrases = 3,
      saveHistory = true
    } = options;

    const fingerprints = this.generateFingerprintSet(content);
    const keyPhrases = this.extractKeyPhrases(content, maxPhrases);
    
    const searchResults = [];

    // Search each phrase across configured engines
    for (const phrase of keyPhrases) {
      for (const engine of searchEngines) {
        let result;
        
        if (engine === 'duckduckgo') {
          result = await this.searchDuckDuckGo(phrase);
        } else if (engine === 'google') {
          result = await this.searchGoogle(phrase);
        } else {
          continue;
        }

        searchResults.push({
          phrase: phrase.substring(0, 100) + '...',
          engine,
          ...result
        });

        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const scanResult = {
      timestamp: Date.now(),
      fingerprints,
      keyPhrases: keyPhrases.map(p => p.substring(0, 100) + '...'),
      searchResults,
      potentialMatches: searchResults.filter(r => r.found).length,
      riskLevel: this.calculateRiskLevel(searchResults)
    };

    if (saveHistory) {
      this.saveScanHistory(scanResult);
    }

    return scanResult;
  }

  /**
   * Calculate risk level based on search results
   * @param {Array} results - Search results
   * @returns {string} Risk level
   */
  calculateRiskLevel(results) {
    const matches = results.filter(r => r.found).length;
    const total = results.length;
    
    if (total === 0) return 'unknown';
    
    const matchRate = matches / total;
    
    if (matchRate >= 0.7) return 'high';
    if (matchRate >= 0.4) return 'medium';
    if (matchRate >= 0.1) return 'low';
    return 'none';
  }

  /**
   * Save scan history to file
   * @param {Object} scanResult - Scan result to save
   */
  saveScanHistory(scanResult) {
    try {
      this.ensureDataDir();
      const entry = {
        ...scanResult,
        id: crypto.randomBytes(16).toString('hex')
      };
      fs.appendFileSync(
        this.scanHistoryPath,
        JSON.stringify(entry) + '\n',
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save scan history:', error.message);
    }
  }

  /**
   * Get scan history
   * @param {number} limit - Number of entries to return
   * @returns {Array} Scan history
   */
  getScanHistory(limit = 50) {
    try {
      if (!fs.existsSync(this.scanHistoryPath)) {
        return [];
      }

      const lines = fs.readFileSync(this.scanHistoryPath, 'utf8')
        .trim()
        .split('\n')
        .filter(l => l);

      return lines
        .slice(-limit)
        .map(l => JSON.parse(l))
        .reverse();
    } catch (error) {
      console.error('Failed to read scan history:', error.message);
      return [];
    }
  }

  /**
   * Compare two content pieces for similarity
   * @param {string} content1 - First content
   * @param {string} content2 - Second content
   * @returns {Object} Similarity analysis
   */
  compareContent(content1, content2) {
    const fp1 = this.generateFingerprintSet(content1);
    const fp2 = this.generateFingerprintSet(content2);

    const matches = {
      full: fp1.full === fp2.full,
      first100: fp1.first100 === fp2.first100,
      first50: fp1.first50 === fp2.first50,
      first25: fp1.first25 === fp2.first25
    };

    const matchCount = Object.values(matches).filter(Boolean).length;
    const similarity = matchCount / 4;

    return {
      matches,
      similarity: (similarity * 100).toFixed(2) + '%',
      verdict: similarity >= 0.75 ? 'duplicate' : 
               similarity >= 0.5 ? 'similar' : 
               similarity >= 0.25 ? 'partial' : 'unique'
    };
  }

  /**
   * Scan local content directory for duplicates
   * @param {string} dirPath - Directory to scan
   * @returns {Array} Duplicate groups
   */
  scanLocalDirectory(dirPath) {
    const files = this.getMarkdownFiles(dirPath);
    const fingerprints = new Map();
    const duplicates = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fp = this.generateFingerprint(content);

        if (fingerprints.has(fp)) {
          duplicates.push({
            fingerprint: fp,
            files: [fingerprints.get(fp), file]
          });
        } else {
          fingerprints.set(fp, file);
        }
      } catch (error) {
        console.error(`Failed to scan ${file}:`, error.message);
      }
    }

    return duplicates;
  }

  /**
   * Get all markdown files in directory recursively
   * @param {string} dirPath - Directory path
   * @returns {Array<string>} File paths
   */
  getMarkdownFiles(dirPath) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          files.push(...this.getMarkdownFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Failed to read directory ${dirPath}:`, error.message);
    }

    return files;
  }
}

module.exports = new DuplicationScanner();
