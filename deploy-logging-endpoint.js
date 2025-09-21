#!/usr/bin/env node

/**
 * Deploy Wix Logging Endpoint to Netlify
 * Creates a serverless function for receiving Wix logs
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Wix logging endpoint for Netlify...\n');

// Create netlify functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
    console.log('📁 Created netlify/functions directory');
}

// Netlify function for Wix logs
const netlifyFunction = `
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Handle GET requests (health check)
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                service: 'Wix Logging Endpoint',
                status: 'healthy',
                timestamp: new Date().toISOString(),
                endpoint: 'POST /wix-logs',
                instructions: 'Use this URL in Wix third-party logging configuration'
            })
        };
    }

    // Handle POST requests (log data)
    if (event.httpMethod === 'POST') {
        try {
            const logData = JSON.parse(event.body || '{}');
            
            // Create log entry
            const logEntry = {
                timestamp: new Date().toISOString(),
                source: 'wix',
                data: logData,
                headers: event.headers,
                ip: event.headers['x-forwarded-for'] || event.headers['client-ip']
            };

            // Log to console (visible in Netlify function logs)
            console.log('📊 Wix log received:', {
                timestamp: logEntry.timestamp,
                dataSize: JSON.stringify(logData).length,
                userAgent: event.headers['user-agent']
            });

            // In a real implementation, you might want to:
            // - Send to external logging service (LogDNA, Datadog, etc.)
            // - Store in database
            // - Send to analytics platform
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'success',
                    message: 'Logs received and processed',
                    timestamp: new Date().toISOString()
                })
            };

        } catch (error) {
            console.error('❌ Error processing Wix logs:', error);
            
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    message: 'Failed to process logs',
                    error: error.message
                })
            };
        }
    }

    // Method not allowed
    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
            error: 'Method not allowed',
            allowed: ['GET', 'POST', 'OPTIONS']
        })
    };
};
`;

// Write the Netlify function
const functionPath = path.join(functionsDir, 'wix-logs.js');
fs.writeFileSync(functionPath, netlifyFunction);
console.log('✅ Created Netlify function: netlify/functions/wix-logs.js');

// Update netlify.toml to include function
const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
let netlifyConfig = '';

if (fs.existsSync(netlifyTomlPath)) {
    netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
}

// Add functions configuration if not present
if (!netlifyConfig.includes('[functions]')) {
    const functionsConfig = `

# Netlify Functions Configuration
[functions]
  directory = "netlify/functions"

# Function-specific settings
[[functions]]
  path = "/wix-logs"
  included_files = ["netlify/functions/wix-logs.js"]

`;
    
    netlifyConfig += functionsConfig;
    fs.writeFileSync(netlifyTomlPath, netlifyConfig);
    console.log('✅ Updated netlify.toml with functions configuration');
}

// Create package.json for functions if needed
const functionPackageJson = {
    "name": "wix-logging-functions",
    "version": "1.0.0",
    "description": "Netlify functions for Wix logging",
    "dependencies": {}
};

const functionPackagePath = path.join(functionsDir, 'package.json');
if (!fs.existsSync(functionPackagePath)) {
    fs.writeFileSync(functionPackagePath, JSON.stringify(functionPackageJson, null, 2));
    console.log('✅ Created package.json for functions');
}

console.log('\n🎯 DEPLOYMENT READY!');
console.log('📡 Your Wix logging endpoint will be available at:');
console.log('   https://your-netlify-site.netlify.app/.netlify/functions/wix-logs');
console.log('\n📋 Next steps:');
console.log('1. Deploy to Netlify (git push)');
console.log('2. Get your Netlify site URL');
console.log('3. Use this URL in Wix logging configuration:');
console.log('   https://your-site.netlify.app/.netlify/functions/wix-logs');

// Create deployment script
const deployScript = `#!/bin/bash

echo "🚀 Deploying Wix logging endpoint..."

# Build and deploy
npm run build
git add .
git commit -m "Add Wix logging endpoint"
git push origin main

echo "✅ Deployment complete!"
echo "📡 Your endpoint will be available at:"
echo "   https://your-netlify-site.netlify.app/.netlify/functions/wix-logs"

`;

fs.writeFileSync(path.join(__dirname, 'deploy-wix-logging.sh'), deployScript);
fs.chmodSync(path.join(__dirname, 'deploy-wix-logging.sh'), '755');
console.log('✅ Created deployment script: deploy-wix-logging.sh');

console.log('\n🔗 READY FOR WIX CONFIGURATION!');