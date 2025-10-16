/**
 * Content Protection Service
 * Integrates with military-grade encryption for content fingerprinting and watermarking
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ContentProtection {
  constructor() {
    this.registryPath = path.join(process.cwd(), '.data/security/content-registry.json');
    this.ensureDataDir();
  }

  ensureDataDir() {
    const dir = path.dirname(this.registryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate unique content ID
   * @param {string} content - Content to identify
   * @returns {string} Unique content ID
   */
  generateContentId(content) {
    return crypto
      .createHash('sha256')
      .update(content + Date.now())
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Create digital watermark for content
   * @param {string} content - Content to watermark
   * @param {Object} metadata - Watermark metadata
   * @returns {Object} Watermarked content with signature
   */
  watermarkContent(content, metadata = {}) {
    const contentId = this.generateContentId(content);
    const timestamp = Date.now();
    
    const watermark = {
      id: contentId,
      timestamp,
      owner: metadata.owner || 'Elevate for Humanity',
      copyright: '© Elevate for Humanity / Selfish Inc. DBA Rise Forward Foundation',
      license: 'Commercial License - Unauthorized use prohibited',
      ...metadata
    };

    // Create HMAC signature for watermark
    const signature = crypto
      .createHmac('sha256', process.env.CRYPTO_SECRET || 'efh-secret')
      .update(JSON.stringify(watermark))
      .digest('hex');

    // Embed invisible watermark (zero-width characters)
    const invisibleWatermark = this.createInvisibleWatermark(contentId);
    const watermarkedContent = content + invisibleWatermark;

    // Register content
    this.registerContent({
      contentId,
      fingerprint: this.generateFingerprint(content),
      watermark,
      signature,
      timestamp
    });

    return {
      content: watermarkedContent,
      contentId,
      watermark,
      signature,
      visibleWatermark: this.createVisibleWatermark(watermark)
    };
  }

  /**
   * Create invisible watermark using zero-width characters
   * @param {string} contentId - Content ID to embed
   * @returns {string} Invisible watermark
   */
  createInvisibleWatermark(contentId) {
    // Convert content ID to binary
    const binary = contentId
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    // Use zero-width characters to encode binary
    // U+200B (zero-width space) = 0
    // U+200C (zero-width non-joiner) = 1
    const watermark = binary
      .split('')
      .map(bit => bit === '0' ? '\u200B' : '\u200C')
      .join('');

    return '\n\n' + watermark;
  }

  /**
   * Extract invisible watermark from content
   * @param {string} content - Content with watermark
   * @returns {string|null} Extracted content ID
   */
  extractInvisibleWatermark(content) {
    try {
      // Extract zero-width characters
      const zwChars = content.match(/[\u200B\u200C]+/g);
      if (!zwChars || zwChars.length === 0) return null;

      // Convert back to binary
      const binary = zwChars[zwChars.length - 1]
        .split('')
        .map(char => char === '\u200B' ? '0' : '1')
        .join('');

      // Convert binary to content ID
      const contentId = binary
        .match(/.{8}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 2)))
        .join('');

      return contentId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create visible watermark text
   * @param {Object} watermark - Watermark metadata
   * @returns {string} Visible watermark
   */
  createVisibleWatermark(watermark) {
    return `

---
**Content Protection Notice**

Content ID: ${watermark.id}
${watermark.copyright}
License: ${watermark.license}
Generated: ${new Date(watermark.timestamp).toISOString()}

This content is protected by digital watermarking and fingerprinting technology.
Unauthorized duplication, scraping, or redistribution is prohibited under federal and state law.
Violators are subject to prosecution under 17 U.S.C. § 506 and 18 U.S.C. § 2319.

For licensing inquiries: legal@elevateforhumanity.org
---
`;
  }

  /**
   * Generate content fingerprint
   * @param {string} content - Content to fingerprint
   * @returns {string} Fingerprint hash
   */
  generateFingerprint(content) {
    return crypto
      .createHash('sha256')
      .update(content.trim().toLowerCase())
      .digest('hex');
  }

  /**
   * Verify content watermark
   * @param {string} content - Content to verify
   * @param {string} signature - Expected signature
   * @returns {Object} Verification result
   */
  verifyWatermark(content, signature) {
    const contentId = this.extractInvisibleWatermark(content);
    
    if (!contentId) {
      return {
        valid: false,
        reason: 'No watermark found'
      };
    }

    const registered = this.getRegisteredContent(contentId);
    
    if (!registered) {
      return {
        valid: false,
        reason: 'Content not registered',
        contentId
      };
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.CRYPTO_SECRET || 'efh-secret')
      .update(JSON.stringify(registered.watermark))
      .digest('hex');

    const valid = signature === expectedSignature;

    return {
      valid,
      contentId,
      watermark: registered.watermark,
      registered: new Date(registered.timestamp).toISOString(),
      reason: valid ? 'Valid watermark' : 'Invalid signature'
    };
  }

  /**
   * Register content in protection registry
   * @param {Object} contentData - Content registration data
   */
  registerContent(contentData) {
    try {
      this.ensureDataDir();
      const entry = {
        ...contentData,
        registeredAt: Date.now()
      };
      fs.appendFileSync(
        this.registryPath,
        JSON.stringify(entry) + '\n',
        'utf8'
      );
    } catch (error) {
      console.error('Failed to register content:', error.message);
    }
  }

  /**
   * Get registered content by ID
   * @param {string} contentId - Content ID
   * @returns {Object|null} Registered content data
   */
  getRegisteredContent(contentId) {
    try {
      if (!fs.existsSync(this.registryPath)) {
        return null;
      }

      const lines = fs.readFileSync(this.registryPath, 'utf8')
        .trim()
        .split('\n')
        .filter(l => l);

      for (const line of lines.reverse()) {
        const entry = JSON.parse(line);
        if (entry.contentId === contentId) {
          return entry;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get registered content:', error.message);
      return null;
    }
  }

  /**
   * Get all registered content
   * @param {number} limit - Number of entries to return
   * @returns {Array} Registered content
   */
  getAllRegisteredContent(limit = 100) {
    try {
      if (!fs.existsSync(this.registryPath)) {
        return [];
      }

      const lines = fs.readFileSync(this.registryPath, 'utf8')
        .trim()
        .split('\n')
        .filter(l => l);

      return lines
        .slice(-limit)
        .map(l => JSON.parse(l))
        .reverse();
    } catch (error) {
      console.error('Failed to get registered content:', error.message);
      return [];
    }
  }

  /**
   * Check if content is registered
   * @param {string} content - Content to check
   * @returns {Object} Check result
   */
  checkContent(content) {
    const fingerprint = this.generateFingerprint(content);
    const contentId = this.extractInvisibleWatermark(content);

    const result = {
      hasWatermark: !!contentId,
      fingerprint,
      contentId
    };

    if (contentId) {
      const registered = this.getRegisteredContent(contentId);
      result.registered = !!registered;
      result.registrationData = registered;
    }

    return result;
  }

  /**
   * Generate content protection report
   * @returns {Object} Protection statistics
   */
  generateReport() {
    const allContent = this.getAllRegisteredContent(1000);
    
    const byOwner = {};
    const byLicense = {};
    
    for (const entry of allContent) {
      const owner = entry.watermark?.owner || 'Unknown';
      const license = entry.watermark?.license || 'Unknown';
      
      byOwner[owner] = (byOwner[owner] || 0) + 1;
      byLicense[license] = (byLicense[license] || 0) + 1;
    }

    return {
      totalProtected: allContent.length,
      byOwner,
      byLicense,
      oldestProtection: allContent[allContent.length - 1]?.timestamp,
      newestProtection: allContent[0]?.timestamp
    };
  }
}

module.exports = new ContentProtection();
