/**
 * Version Service
 * Handles application versioning and feature flags
 */

const packageJson = require('../package.json');

class VersionService {
  constructor() {
    this.version = packageJson.version || '1.0.0';
    this.buildDate = new Date();
    this.features = new Map();
  }

  getVersion() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  setFeatureFlag(featureName, enabled) {
    this.features.set(featureName, enabled);
  }

  isFeatureEnabled(featureName) {
    return this.features.get(featureName) || false;
  }

  getAllFeatures() {
    return Object.fromEntries(this.features);
  }

  getHealthStatus() {
    return {
      status: 'operational',
      version: this.version,
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }
}

module.exports = new VersionService();
