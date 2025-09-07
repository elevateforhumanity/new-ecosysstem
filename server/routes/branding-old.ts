/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import express from 'express';
import { logger } from '../../src/logger.js';

const router = express.Router();

// GET /api/branding - Branding configuration
router.get('/', (req: express.Request, res: express.Response) => {
  const correlationId = req.headers['x-request-id'] as string;

  const brandingResponse = {
    timestamp: new Date().toISOString(),
    correlationId,
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    
    logo: {
      favicon: '/api/images/favicon.ico',
      header: '/api/images/logo-header.svg',
      footer: '/api/images/logo-footer.svg',
      requirements: {
        format: 'SVG preferred, PNG backup',
        type: 'LOGO_REQUIRED',
        maxSize: '500KB',
        dimensions: 'flexible',
      },
    },
    
    footerBackground: {
      image: '/api/images/footer-education-bg.jpg',
      alt: 'Education and workforce development background',
      requirements: {
        theme: 'education/workforce development',
        type: 'EDUCATION_BACKGROUND_REQUIRED',
        format: 'JPEG/PNG',
        maxSize: '2MB',
        dimensions: '1920x400 recommended',
      },
    },
    
    colors: {
      primary: '#1e40af',
      secondary: '#7c3aed',
      accent: '#059669',
      neutral: '#6b7280',
      background: '#f8fafc',
      text: '#1f2937',
    },
    
    typography: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Georgia, serif',
      mono: 'Menlo, Monaco, monospace',
    },
    
    social: {
      facebook: 'https://facebook.com/elevateforhumanity',
      twitter: 'https://twitter.com/elevateforhumans',
      linkedin: 'https://linkedin.com/company/elevate-for-humanity',
      youtube: 'https://youtube.com/@elevateforhumanity',
    },
  };

  logger.info({ correlationId }, 'Branding configuration requested');
  res.json(brandingResponse);
});

export default router;