#!/usr/bin/env node

/**
 * Wix Third-Party Logging Endpoint
 * Receives JSON logs from Wix and processes them
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'wix-logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const getLogFile = () => {
    const date = new Date().toISOString().split('T')[0];
    return path.join(logsDir, `wix-logs-${date}.json`);
};

// Logging endpoint for Wix
app.post('/wix-logs', (req, res) => {
    try {
        console.log('📊 Received Wix logs:', new Date().toISOString());
        
        // Log the incoming data
        const logEntry = {
            timestamp: new Date().toISOString(),
            source: 'wix',
            data: req.body,
            headers: req.headers,
            ip: req.ip || req.connection.remoteAddress
        };
        
        // Write to file
        const logFile = getLogFile();
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFileSync(logFile, logLine);
        
        // Console output for debugging
        console.log('📝 Log entry saved:', {
            timestamp: logEntry.timestamp,
            dataSize: JSON.stringify(req.body).length,
            userAgent: req.headers['user-agent']
        });
        
        // Respond with success
        res.status(200).json({
            status: 'success',
            message: 'Logs received and processed',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error processing logs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process logs',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'wix-logging-endpoint',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint with instructions
app.get('/', (req, res) => {
    res.json({
        service: 'Wix Logging Endpoint',
        endpoints: {
            logs: '/wix-logs (POST)',
            health: '/health (GET)',
            status: '/status (GET)'
        },
        instructions: {
            wix_setup: 'Use this URL in Wix logging configuration',
            endpoint_url: `${req.protocol}://${req.get('host')}/wix-logs`,
            method: 'POST',
            content_type: 'application/json'
        }
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    try {
        const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.json'));
        const totalLogs = logFiles.reduce((count, file) => {
            const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
            return count + content.split('\n').filter(line => line.trim()).length;
        }, 0);
        
        res.json({
            status: 'operational',
            logs_received: totalLogs,
            log_files: logFiles.length,
            last_activity: logFiles.length > 0 ? fs.statSync(path.join(logsDir, logFiles[logFiles.length - 1])).mtime : null
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Wix Logging Endpoint started');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 Endpoint URL: http://localhost:${PORT}/wix-logs`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📁 Logs directory: ${logsDir}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
});

module.exports = app;