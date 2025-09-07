/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import express from 'express';
import { logger } from '../../src/logger.js';

const router = express.Router();

// GET /api/widgets/hero-content - Hero section content
router.get('/hero-content', (req: express.Request, res: express.Response) => {
  const correlationId = req.headers['x-request-id'] as string;

  const heroContent = {
    widget: 'hero-content',
    timestamp: new Date().toISOString(),
    correlationId,
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    
    hero: {
      headline: 'Launch Your AI & Data Science Career',
      subheadline: 'Federal workforce development programs designed to get you job-ready in emerging tech fields',
      ctaText: 'Explore Programs',
      ctaUrl: '/programs',
    },
    
    stats: {
      studentsEnrolled: 2847,
      graduatesPlaced: 1923,
      averageSalaryIncrease: 73,
      partnerEmployers: 156,
    },
    
    branding: {
      logo: {
        requirements: {
          type: 'LOGO_REQUIRED',
          format: 'SVG preferred',
        },
      },
      footerBackground: {
        requirements: {
          type: 'EDUCATION_BACKGROUND_REQUIRED',
          theme: 'workforce development',
        },
      },
    },
  };

  logger.info({ correlationId }, 'Hero content requested');
  res.json(heroContent);
});

// GET /api/widgets/program-carousel - Program carousel content
router.get('/program-carousel', (req: express.Request, res: express.Response) => {
  const correlationId = req.headers['x-request-id'] as string;

  const programCarousel = {
    widget: 'program-carousel',
    timestamp: new Date().toISOString(),
    correlationId,
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    
    programs: [
      {
        id: 'ai-fundamentals',
        title: 'AI Fundamentals',
        description: 'Learn the basics of artificial intelligence',
        duration: '12 weeks',
        price: 1997,
        featured: true,
      },
      {
        id: 'data-science-bootcamp',
        title: 'Data Science Bootcamp',
        description: 'Comprehensive data science training',
        duration: '16 weeks',
        price: 2997,
        featured: true,
      },
      {
        id: 'machine-learning-advanced',
        title: 'Advanced Machine Learning',
        description: 'Advanced ML techniques and applications',
        duration: '20 weeks',
        price: 3997,
        featured: false,
      },
    ],
  };

  logger.info({ correlationId }, 'Program carousel requested');
  res.json(programCarousel);
});

// GET /api/widgets/integration.js - JavaScript integration script
router.get('/integration.js', (req: express.Request, res: express.Response) => {
  const correlationId = req.headers['x-request-id'] as string;

  const integrationScript = `
// Elevate for Humanity Brain Integration Script
// Version: 1.0
// Generated: ${new Date().toISOString()}

(function() {
  'use strict';
  
  // Brain integration namespace
  window.ElevateForHumanityBrain = window.ElevateForHumanityBrain || {};
  
  const Brain = window.ElevateForHumanityBrain;
  Brain.correlationId = '${correlationId}';
  Brain.version = '1.0';
  Brain.baseUrl = window.location.origin;
  
  // Widget initialization
  Brain.init = function() {
    console.log('EFH Brain initialized', { correlationId: Brain.correlationId });
    
    // Load hero stats
    Brain.loadWidget('hero-stats', '/api/widgets/hero-content');
    
    // Load program carousel
    Brain.loadWidget('program-carousel', '/api/widgets/program-carousel');
    
    // Additional widgets can be loaded here
  };
  
  // Generic widget loader
  Brain.loadWidget = function(containerId, endpoint) {
    const container = document.getElementById('efh-' + containerId);
    if (!container) {
      console.warn('EFH Brain: Container not found:', 'efh-' + containerId);
      return;
    }
    
    fetch(Brain.baseUrl + endpoint)
      .then(response => response.json())
      .then(data => {
        Brain.renderWidget(container, data);
      })
      .catch(error => {
        console.error('EFH Brain: Failed to load widget', containerId, error);
        container.innerHTML = '<div class="efh-error">Failed to load content</div>';
      });
  };
  
  // Basic widget renderer
  Brain.renderWidget = function(container, data) {
    if (data.widget === 'hero-content') {
      container.innerHTML = \`
        <div class="efh-hero-stats">
          <h3>\${data.hero.headline}</h3>
          <div class="efh-stats">
            <div class="stat">
              <span class="number">\${data.stats.studentsEnrolled}</span>
              <span class="label">Students Enrolled</span>
            </div>
            <div class="stat">
              <span class="number">\${data.stats.graduatesPlaced}</span>
              <span class="label">Graduates Placed</span>
            </div>
          </div>
        </div>
      \`;
    } else if (data.widget === 'program-carousel') {
      const programs = data.programs.map(program => \`
        <div class="efh-program">
          <h4>\${program.title}</h4>
          <p>\${program.description}</p>
          <span class="price">$\${program.price}</span>
        </div>
      \`).join('');
      
      container.innerHTML = \`<div class="efh-programs">\${programs}</div>\`;
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Brain.init);
  } else {
    Brain.init();
  }
  
})();
`;

  logger.info({ correlationId }, 'Integration script requested');
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(integrationScript);
});

export default router;