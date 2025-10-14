/**
 * Application Configuration
 */

export const config = {
  app: {
    name: 'Elevate for Humanity',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 30000
  },
  features: {
    analytics: true,
    seo: true,
    monitoring: true
  }
};

export default config;