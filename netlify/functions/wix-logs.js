
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
