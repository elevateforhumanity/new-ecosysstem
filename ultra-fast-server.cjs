
console.warn('⚠️  DEPRECATED: ultra-fast-server.cjs is deprecated. Use simple-server.cjs instead.');
console.warn('   This file will be removed in a future version.');

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Ultra-fast static serving with aggressive caching
app.use(express.static('.', { 
  maxAge: '24h',
  etag: false,
  lastModified: false 
}));

// Minimal JSON parsing
app.use(express.json({ limit: '1mb' }));

// Basic health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Serve React build if available, fallback to root
app.get('*', (req, res) => {
  const reactIndex = path.join(__dirname, 'client', 'dist', 'index.html');
  if (require('fs').existsSync(reactIndex)) {
    res.sendFile(reactIndex);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ultra-fast server running on port ${PORT}`);
});
