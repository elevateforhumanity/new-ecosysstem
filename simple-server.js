const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve index.html for all routes (SPA)
  let filePath = path.join(__dirname, 'index.html');
  
  if (req.url !== '/' && req.url !== '/index.html') {
    // Try to serve static file first
    const staticPath = path.join(__dirname, req.url);
    if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
      filePath = staticPath;
    }
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';

    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('File not found');
  }
});

const PORT = process.env.PORT || 8012;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Accessible via Gitpod URL`);
});
