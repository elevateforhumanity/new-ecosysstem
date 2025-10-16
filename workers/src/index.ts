/**
 * Cloudflare Worker - Main Entry Point
 * Handles edge requests, queues, and cron triggers
 */

export interface Env {
  // Queues
  EMAIL_QUEUE: Queue;
  ANALYTICS_QUEUE: Queue;
  WEBHOOK_QUEUE: Queue;
  
  // KV Namespaces
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  
  // R2 Buckets
  UPLOADS: R2Bucket;
  
  // Durable Objects
  RATE_LIMITER: DurableObjectNamespace;
  SESSION_STORE: DurableObjectNamespace;
  
  // Environment Variables
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_PUBLIC_KEY: string;
  STRIPE_SECRET_KEY: string;
  SENTRY_DSN: string;
  DATABASE_URL: string;
}

/**
 * Main fetch handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Rate limiting
    const rateLimiterId = await getRateLimiterId(request);
    const rateLimiter = env.RATE_LIMITER.get(rateLimiterId);
    const isAllowed = await rateLimiter.fetch(request);
    
    if (!isAllowed.ok) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    
    // Route handling
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, ctx);
    }
    
    if (url.pathname.startsWith('/webhooks/')) {
      return handleWebhook(request, env, ctx);
    }
    
    // Serve static assets
    return handleStatic(request, env, ctx);
  },
  
  /**
   * Queue consumer handler
   */
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await processQueueMessage(message, env);
        message.ack();
      } catch (error) {
        console.error('Error processing queue message:', error);
        message.retry();
      }
    }
  },
  
  /**
   * Scheduled handler (cron triggers)
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    
    switch (cron) {
      case '0 0 * * *': // Daily at midnight
        await cleanupOldData(env);
        break;
      
      case '0 */6 * * *': // Every 6 hours
        await syncAnalytics(env);
        break;
      
      case '*/15 * * * *': // Every 15 minutes
        await processPendingJobs(env);
        break;
    }
  },
};

/**
 * Handle API requests
 */
async function handleAPI(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Add your API routes here
  if (url.pathname === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

/**
 * Handle webhook requests
 */
async function handleWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  
  // Queue webhook for processing
  await env.WEBHOOK_QUEUE.send({
    url: url.pathname,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body: await request.text(),
    timestamp: Date.now(),
  });
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handle static asset requests
 */
async function handleStatic(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // Implement static asset serving logic
  return new Response('Static assets', { status: 200 });
}

/**
 * Process queue messages
 */
async function processQueueMessage(message: Message<any>, env: Env): Promise<void> {
  const { queue, body } = message;
  
  switch (queue) {
    case 'email-queue':
      await sendEmail(body, env);
      break;
    
    case 'analytics-queue':
      await trackAnalytics(body, env);
      break;
    
    case 'webhook-queue':
      await processWebhook(body, env);
      break;
  }
}

/**
 * Send email via queue
 */
async function sendEmail(data: any, env: Env): Promise<void> {
  // Implement email sending logic
  console.log('Sending email:', data);
}

/**
 * Track analytics event
 */
async function trackAnalytics(data: any, env: Env): Promise<void> {
  // Implement analytics tracking
  console.log('Tracking analytics:', data);
}

/**
 * Process webhook
 */
async function processWebhook(data: any, env: Env): Promise<void> {
  // Implement webhook processing
  console.log('Processing webhook:', data);
}

/**
 * Cleanup old data (daily cron)
 */
async function cleanupOldData(env: Env): Promise<void> {
  console.log('Running daily cleanup...');
  // Implement cleanup logic
}

/**
 * Sync analytics (every 6 hours)
 */
async function syncAnalytics(env: Env): Promise<void> {
  console.log('Syncing analytics...');
  // Implement analytics sync
}

/**
 * Process pending jobs (every 15 minutes)
 */
async function processPendingJobs(env: Env): Promise<void> {
  console.log('Processing pending jobs...');
  // Implement job processing
}

/**
 * Get rate limiter ID from request
 */
async function getRateLimiterId(request: Request): Promise<DurableObjectId> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return { name: `rate-limiter-${ip}` } as any;
}

/**
 * Rate Limiter Durable Object
 */
export class RateLimiter {
  state: DurableObjectState;
  
  constructor(state: DurableObjectState) {
    this.state = state;
  }
  
  async fetch(request: Request): Promise<Response> {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100;
    
    const requests = (await this.state.storage.get<number[]>('requests')) || [];
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    
    recentRequests.push(now);
    await this.state.storage.put('requests', recentRequests);
    
    return new Response('OK', { status: 200 });
  }
}

/**
 * Session Store Durable Object
 */
export class SessionStore {
  state: DurableObjectState;
  
  constructor(state: DurableObjectState) {
    this.state = state;
  }
  
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }
    
    if (request.method === 'GET') {
      const session = await this.state.storage.get(sessionId);
      return new Response(JSON.stringify(session), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (request.method === 'POST') {
      const data = await request.json();
      await this.state.storage.put(sessionId, data);
      return new Response('OK', { status: 200 });
    }
    
    if (request.method === 'DELETE') {
      await this.state.storage.delete(sessionId);
      return new Response('OK', { status: 200 });
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
}
