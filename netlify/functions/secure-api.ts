import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)

export const handler: Handler = async (event) => {
  // Verify JWT token from Supabase Auth
  const authHeader = event.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Missing or invalid authorization header' }),
      headers: { 'Content-Type': 'application/json' }
    }
  }

  const token = authHeader.substring(7)
  
  try {
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
        headers: { 'Content-Type': 'application/json' }
      }
    }

    // Handle different API endpoints
    const path = event.path?.replace('/.netlify/functions/secure-api', '') || ''
    const method = event.httpMethod

    switch (path) {
      case '/profile':
        if (method === 'GET') {
          return {
            statusCode: 200,
            body: JSON.stringify({
              user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email
              }
            }),
            headers: { 'Content-Type': 'application/json' }
          }
        }
        break

      case '/enrollment':
        if (method === 'POST') {
          const body = JSON.parse(event.body || '{}')
          
          // Store enrollment data
          const { data, error } = await supabase
            .from('enrollments')
            .insert({
              user_id: user.id,
              program: body.program,
              status: 'pending',
              created_at: new Date().toISOString()
            })

          if (error) {
            return {
              statusCode: 500,
              body: JSON.stringify({ error: 'Failed to create enrollment' }),
              headers: { 'Content-Type': 'application/json' }
            }
          }

          return {
            statusCode: 200,
            body: JSON.stringify({ success: true, enrollment: data }),
            headers: { 'Content-Type': 'application/json' }
          }
        }
        break

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Endpoint not found' }),
          headers: { 'Content-Type': 'application/json' }
        }
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' }
    }

  } catch (error: any) {
    console.error('Secure API error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    }
  }
}