// CSP Violation Reporting Endpoint
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// CSP violation report handler
router.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const violation = req.body;
  const timestamp = new Date().toISOString();
  
  // Log violation to console
  console.warn('CSP Violation:', {
    timestamp,
    violation
  });
  
  // Log violation to file
  const logEntry = {
    timestamp,
    violation,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    referer: req.get('Referer')
  };
  
  const logFile = path.join(__dirname, 'logs', 'csp-violations.log');
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to log file
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  // Send response
  res.status(204).send();
});

// CSP violation dashboard
router.get('/csp-violations', (req, res) => {
  const logFile = path.join(__dirname, 'logs', 'csp-violations.log');
  
  if (!fs.existsSync(logFile)) {
    return res.json({ violations: [] });
  }
  
  const logContent = fs.readFileSync(logFile, 'utf8');
  const violations = logContent
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(-100); // Last 100 violations
  
  res.json({ violations });
});

module.exports = router;