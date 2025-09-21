#!/usr/bin/env node

/**
 * Setup Wix Logging Endpoint for Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Wix logging endpoint...\n');

// Create netlify functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
    console.log('📁 Created netlify/functions directory');
}

// Netlify function for Wix logs
const netlifyFunction = `
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
                endpoint: 'POST for logs, GET for health',
                instructions: 'Use this URL in Wix third-party logging configuration'
            })
        };
    }

    // Handle POST requests (log data from Wix)
    if (event.httpMethod === 'POST') {
        try {
            const logData = JSON.parse(event.body || '{}');
            
            // Create log entry
            const logEntry = {
                timestamp: new Date().toISOString(),
                source: 'wix',
                site: 'selfishincsupport.org',
                data: logData,
                headers: event.headers,
                ip: event.headers['x-forwarded-for'] || event.headers['client-ip']
            };

            // Log to console (visible in Netlify function logs)
            console.log('📊 Wix log received:', {
                timestamp: logEntry.timestamp,
                dataSize: JSON.stringify(logData).length,
                userAgent: event.headers['user-agent'],
                referer: event.headers['referer']
            });

            // Log the actual data for debugging
            console.log('📝 Log data:', JSON.stringify(logData, null, 2));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'success',
                    message: 'Wix logs received and processed',
                    timestamp: new Date().toISOString(),
                    received_data_size: JSON.stringify(logData).length
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

// Update netlify.toml
const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
let netlifyConfig = '';

if (fs.existsSync(netlifyTomlPath)) {
    netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
}

// Add functions configuration if not present
if (!netlifyConfig.includes('directory = "netlify/functions"')) {
    const functionsConfig = `

# Wix Logging Functions
[functions]
  directory = "netlify/functions"

`;
    
    netlifyConfig += functionsConfig;
    fs.writeFileSync(netlifyTomlPath, netlifyConfig);
    console.log('✅ Updated netlify.toml with functions configuration');
}

console.log('\n🎯 WIX LOGGING ENDPOINT READY!');
console.log('\n📡 After deployment, your endpoint will be:');
console.log('   https://your-netlify-site.netlify.app/.netlify/functions/wix-logs');
console.log('\n📋 FOR WIX CONFIGURATION:');
console.log('1. Go to Wix Dashboard → Analytics & Reports → Logs');
console.log('2. Select "Third party logging tool"');
console.log('3. Enter endpoint URL:');
console.log('   https://elevateforhumanity.netlify.app/.netlify/functions/wix-logs');
console.log('4. Save configuration');

console.log('\n🚀 DEPLOYING NOW...');

// Deploy to Netlify
const { execSync } = require('child_process');

try {
    console.log('📦 Adding files to git...');
    execSync('git add netlify/', { stdio: 'inherit' });
    
    console.log('💾 Committing changes...');
    execSync('git commit -m "Add Wix logging endpoint for domain connection"', { stdio: 'inherit' });
    
    console.log('🚀 Pushing to Netlify...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n✅ DEPLOYMENT COMPLETE!');
    console.log('🔗 Your Wix logging endpoint is now live!');
    
} catch (error) {
    console.log('\n⚠️  Manual deployment needed:');
    console.log('   git add netlify/');
    console.log('   git commit -m "Add Wix logging endpoint"');
    console.log('   git push origin main');
}

console.log('\n🎯 NEXT: Configure in Wix with this URL:');
console.log('   https://elevateforhumanity.netlify.app/.netlify/functions/wix-logs');