/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

// Alternative entry point for the multi-site ecosystem
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'EFH Multi-Site Ecosystem Running',
    securityStatus: 'XSS vulnerability fixed - using DOMParser'
  });
});

// Sister site routes
const routes = ['hub', 'programs', 'lms', 'connect', 'compliance', 'partners', 'account'];
routes.forEach(route => {
  app.get(`/${route}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${route}.html`));
  });
});

// Early access / sale landing (re-uses emergency Stripe page)
app.get(['/sale', '/buy', '/early-access'], (req, res) => {
  res.sendFile(path.join(__dirname, 'emergency-buy-now.html'));
});

// Health alias (mirror basic info expected by some tooling)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'EFH Multi-Site Ecosystem Running (alias)', domain: process.env.CANONICAL_DOMAIN || 'www.elevateforhumanity.org' });
});

// Lightweight sitemap & robots for this simplified entrypoint (advanced variant exists in simple-server)
app.get('/sitemap.xml', (req, res) => {
  const domain = (process.env.CANONICAL_DOMAIN || `https://${req.get('host')}`).replace(/\/$/, '');
  const pages = ['/', '/programs', '/lms', '/connect', '/compliance', '/hub', '/sale', '/partners', '/account'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    pages.map(p => `\n  <url><loc>${domain}${p}</loc></url>`).join('') + '\n</urlset>';
  res.type('application/xml').send(xml);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml');
});

// Root landing: allow switching to Stripe-focused landing page via env flag
// Set USE_STRIPE_LANDING=1 to serve emergency-buy-now.html instead of React index.html
app.get('/', (req, res) => {
  if (process.env.USE_STRIPE_LANDING === '1') {
    return res.sendFile(path.join(__dirname, 'emergency-buy-now.html'));
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EFH Ecosystem running on http://localhost:${PORT}`);
  console.log('🔒 Security Status: XSS vulnerability fixed in all universal scripts');
  console.log('📄 Sister Sites: /hub /programs /lms /connect /compliance /partners /account /sale');
});

module.exports = app;