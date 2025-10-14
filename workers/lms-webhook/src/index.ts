/**
 * LMS Webhook Handler - Cloudflare Worker
 * Receives LMS events and enqueues them for sync to Google Classroom
 */

import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WEBHOOK_SECRET?: string; // Optional: for webhook authentication
}

interface LMSEvent {
  type: 'course.upsert' | 'topic.upsert' | 'work.upsert' | 'roster.upsert';
  source: string; // 'canvas', 'moodle', 'blackboard', etc.
  data: {
    id: string;
    [key: string]: any;
  };
  timestamp?: string;
  idempotency_key?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Signature',
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      // Parse request body
      const body: LMSEvent = await request.json();

      // Validate required fields
      if (!body.type || !body.source || !body.data || !body.data.id) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid payload', 
            required: ['type', 'source', 'data.id'] 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Verify webhook signature if secret is configured
      if (env.WEBHOOK_SECRET) {
        const signature = request.headers.get('X-Webhook-Signature');
        if (!signature || !await verifySignature(body, signature, env.WEBHOOK_SECRET)) {
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }

      // Initialize Supabase client
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Generate idempotency key
      const idempotencyKey = body.idempotency_key || 
        `${body.source}:${body.type}:${body.data.id}:${body.timestamp || Date.now()}`;

      // Enqueue event for sync
      const { data, error } = await supabase.rpc('enqueue_lms_sync', {
        p_event_type: body.type,
        p_event_source: body.source,
        p_payload: body.data,
        p_idempotency_key: idempotencyKey,
      });

      if (error) {
        console.error('Failed to enqueue sync:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to enqueue sync', 
            details: error.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          queue_id: data,
          idempotency_key: idempotencyKey,
          message: 'Event queued for sync' 
        }),
        { 
          status: 202, // Accepted
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (error: any) {
      console.error('Webhook error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error', 
          message: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  },
};

/**
 * Verify webhook signature using HMAC
 */
async function verifySignature(
  payload: any, 
  signature: string, 
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}
