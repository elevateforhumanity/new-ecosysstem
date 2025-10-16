/**
 * EFH AI Agent - Cloudflare Worker
 * Emergent-style autopilot for EFH ecosystem
 * 
 * Architecture:
 * 1. Receives user prompt from admin dashboard
 * 2. Validates JWT and checks role permissions
 * 3. Calls OpenAI GPT-4 to interpret command into structured JSON
 * 4. Validates action against command catalog
 * 5. Routes to Supabase Edge Function for secure execution
 * 6. Logs all actions to agent_events audit table
 * 
 * Deployment:
 * npx wrangler deploy workers/agent/agent-worker.js --name efh-agent
 */

// Command catalog - import from commands.json at build time
// In production, load from KV for dynamic updates
const COMMANDS = {
  "commands": [
    {"name":"createProgram","rolesAllowed":["admin","staff"]},
    {"name":"updateTuition","rolesAllowed":["admin","staff"]},
    {"name":"createAffiliate","rolesAllowed":["admin"]},
    {"name":"createReferral","rolesAllowed":["admin","staff","affiliate"]},
    {"name":"calculateCommission","rolesAllowed":["admin","staff"]},
    {"name":"runPayoutBatch","rolesAllowed":["admin"]},
    {"name":"getETPLReport","rolesAllowed":["admin","staff"]},
    {"name":"addStudent","rolesAllowed":["admin","staff"]},
    {"name":"updateEnrollment","rolesAllowed":["admin","staff"]},
    {"name":"getStats","rolesAllowed":["admin","staff"]}
  ]
};

const commandsByName = new Map(COMMANDS.commands.map(c => [c.name, c]));

/**
 * Check if user role is allowed for action
 */
function isRoleAllowed(actionName, userRoles) {
  const command = commandsByName.get(actionName);
  if (!command) return false;
  return command.rolesAllowed.some(r => userRoles.includes(r));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for admin dashboard
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: Stripe Checkout
    if (request.method === 'POST' && url.pathname === '/api/agent/stripe/checkout') {
      return createStripeCheckout(request, env, corsHeaders);
    }

    // Route: Stripe Webhook
    if (request.method === 'POST' && url.pathname === '/webhooks/stripe') {
      return handleStripeWebhook(request, env);
    }

    // Route: File Upload
    if (request.method === 'POST' && url.pathname === '/files/upload') {
      return uploadFile(request, env, corsHeaders);
    }

    // Route: File Download
    if (request.method === 'GET' && url.pathname === '/files/download') {
      return downloadFile(request, env, corsHeaders);
    }

    // Route: Stripe Connect - Create Account
    if (request.method === 'POST' && url.pathname === '/connect/create-account') {
      return createConnectAccount(request, env, corsHeaders);
    }

    // Route: Stripe Connect - Onboard Link
    if (request.method === 'POST' && url.pathname === '/connect/onboard-link') {
      return connectOnboardLink(request, env, corsHeaders);
    }

    // Route: Stripe Connect - Payout
    if (request.method === 'POST' && url.pathname === '/connect/payout') {
      return connectPayout(request, env, corsHeaders);
    }

    // Route: AI Agent (original)
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      // Parse request
      const { prompt } = await request.json();

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Missing prompt' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify JWT and extract roles
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.substring(7);
      
      // Get user roles from header (set by your auth middleware)
      // In production, decode JWT and extract roles
      const rolesHeader = request.headers.get('x-user-roles') || 'admin';
      const userRoles = rolesHeader.split(',').map(r => r.trim());

      // Call OpenAI to interpret the prompt into structured JSON
      const actionData = await interpretPrompt(prompt, env);

      // Validate action exists in catalog
      if (!commandsByName.has(actionData.action)) {
        return new Response(
          JSON.stringify({ error: `Unknown action: ${actionData.action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check role permissions
      if (!isRoleAllowed(actionData.action, userRoles)) {
        return new Response(
          JSON.stringify({ error: `Forbidden: Your role(s) [${userRoles.join(', ')}] cannot execute ${actionData.action}` }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Forward to Supabase Edge Function for secure execution
      const supabaseResponse = await fetch(
        `${env.SUPABASE_FUNCTION_URL}/executeAction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify(actionData),
        }
      );

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();
        throw new Error(`Edge function failed: ${errorText}`);
      }

      const result = await supabaseResponse.json();

      return new Response(
        JSON.stringify({ success: true, action: actionData.action, result }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Agent error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};

/**
 * Create Stripe Checkout Session
 */
async function createStripeCheckout(request, env, corsHeaders) {
  try {
    const body = await request.json();
    
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build line items
    const line_items = body.lineItems.map(li =>
      li.price 
        ? { price: li.price, quantity: li.quantity ?? 1 }
        : {
            price_data: {
              currency: li.currency ?? 'usd',
              unit_amount: li.amount,
              product_data: { name: li.name ?? 'EFH Item' }
            },
            quantity: li.quantity ?? 1
          }
    );

    // Call Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': body.mode,
        'success_url': body.successUrl,
        'cancel_url': body.cancelUrl,
        ...Object.entries(line_items).reduce((acc, [idx, item], i) => {
          if (item.price) {
            acc[`line_items[${i}][price]`] = item.price;
            acc[`line_items[${i}][quantity]`] = item.quantity;
          } else {
            acc[`line_items[${i}][price_data][currency]`] = item.price_data.currency;
            acc[`line_items[${i}][price_data][unit_amount]`] = item.price_data.unit_amount;
            acc[`line_items[${i}][price_data][product_data][name]`] = item.price_data.product_data.name;
            acc[`line_items[${i}][quantity]`] = item.quantity;
          }
          return acc;
        }, {}),
        ...Object.entries(body.meta || {}).reduce((acc, [key, value], i) => {
          acc[`metadata[${key}]`] = value;
          return acc;
        }, {}),
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Checkout failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle Stripe Webhook
 */
async function handleStripeWebhook(request, env) {
  try {
    const sig = request.headers.get('stripe-signature');
    const rawBody = await request.text();

    // Verify webhook signature
    // Note: Full verification requires stripe library, this is simplified
    if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Route to Supabase Edge Function based on event type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await fetch(`${env.SUPABASE_FUNCTION_URL}/executeAction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'postStripeCheckout',
            params: { session }
          })
        });
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        await fetch(`${env.SUPABASE_FUNCTION_URL}/executeAction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'postPayment',
            params: { payment_intent: pi }
          })
        });
        break;
      }
    }

    return new Response('ok', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}

/**
 * Upload file to R2
 */
async function uploadFile(request, env, corsHeaders) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Expected multipart/form-data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const org_id = formData.get('org_id');
    const owner_id = formData.get('owner_id');
    const purpose = formData.get('purpose') || 'intake';

    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const key = `org=${org_id}/owner=${owner_id}/${purpose}/${timestamp}-${random}`;

    // Upload to R2
    await env.EFH_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream'
      }
    });

    // Record in database
    await fetch(`${env.SUPABASE_FUNCTION_URL}/executeAction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: 'recordFile',
        params: {
          org_id,
          owner_id,
          purpose,
          storage_key: key,
          size: file.size,
          mime: file.type
        }
      })
    });

    return new Response(
      JSON.stringify({ key, size: file.size }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Upload failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Download file from R2
 */
async function downloadFile(request, env, corsHeaders) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response('Missing key parameter', { status: 400 });
    }

    // TODO: Verify user has permission to access this file via DB check

    const object = await env.EFH_BUCKET.get(key);

    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Length': object.size.toString(),
        'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download failed', { status: 500 });
  }
}

/**
 * Create Stripe Connect Account for Affiliate
 */
async function createConnectAccount(request, env, corsHeaders) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, affiliate_id } = await request.json();

    // Create Stripe Connect Express account
    const stripeResponse = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'type': 'express',
        'email': email,
        'capabilities[transfers][requested]': 'true',
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const account = await stripeResponse.json();

    // Link account to affiliate in database
    await fetch(`${env.SUPABASE_FUNCTION_URL}/executeAction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: 'linkStripeAccount',
        params: { affiliate_id, stripe_account_id: account.id }
      })
    });

    return new Response(
      JSON.stringify({ accountId: account.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Connect account creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Account creation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Create Stripe Connect Onboarding Link
 */
async function connectOnboardLink(request, env, corsHeaders) {
  try {
    const { accountId, refresh_url, return_url } = await request.json();

    const stripeResponse = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'account': accountId,
        'refresh_url': refresh_url,
        'return_url': return_url,
        'type': 'account_onboarding',
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const link = await stripeResponse.json();

    return new Response(
      JSON.stringify({ url: link.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Onboard link error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Link creation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Process Stripe Connect Payout to Affiliate
 */
async function connectPayout(request, env, corsHeaders) {
  try {
    // Verify auth (admin only)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { affiliate_id, amount_cents } = await request.json();

    // Get affiliate's Stripe account ID
    const accountResponse = await fetch(`${env.SUPABASE_FUNCTION_URL}/executeAction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: 'getAffiliateAccount',
        params: { affiliate_id }
      })
    });

    const accountData = await accountResponse.json();
    const stripe_account_id = accountData.data?.stripe_account_id;

    if (!stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Affiliate not onboarded to Stripe Connect' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe transfer
    const stripeResponse = await fetch('https://api.stripe.com/v1/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'amount': amount_cents.toString(),
        'currency': 'usd',
        'destination': stripe_account_id,
        'description': 'Affiliate commission payout',
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      throw new Error(`Stripe transfer error: ${error}`);
    }

    const transfer = await stripeResponse.json();

    // Record transfer in database
    await fetch(`${env.SUPABASE_FUNCTION_URL}/executeAction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: 'recordTransfer',
        params: {
          affiliate_id,
          amount: amount_cents / 100,
          stripe_account_id,
          stripe_transfer_id: transfer.id
        }
      })
    });

    return new Response(
      JSON.stringify({ success: true, transfer_id: transfer.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Payout failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Use Cloudflare Workers AI to interpret natural language into structured command
 * NO OPENAI COSTS - Uses open-source Llama 3 model
 * Returns: { action: string, params: object }
 */
async function interpretPrompt(prompt, env) {
  const systemPrompt = `You are the EFH Autopilot Agent. Respond ONLY in valid JSON format: { "action": "string", "params": {} }

Available actions:
- createProgram: Create new training program (params: title, tuition, hours, cip_code)
- updateTuition: Update program tuition (params: id, amount)
- createAffiliate: Add affiliate partner (params: user_id, tier)
- addStudent: Enroll student (params: student_id, program_id)
- generateReport: Generate ETPL/compliance report (params: type)
- createReferral: Create referral (params: affiliate_id, client_name, source)
- calculateCommission: Calculate commission (params: referral_id, basis_amount, percent)
- runPayoutBatch: Process payouts (params: cutoff_date)
- updateEnrollment: Modify enrollment (params: enrollment_id, status)
- getStats: Get dashboard stats (params: {})

Examples:
User: "Create a new Tax Prep Training program for $2500 tuition"
Response: {"action":"createProgram","params":{"title":"Tax Prep Training","tuition":2500,"hours":120,"cip_code":"52.0302"}}

User: "Update tuition for program abc123 to $3000"
Response: {"action":"updateTuition","params":{"id":"abc123","amount":3000}}

User: "Generate ETPL report"
Response: {"action":"generateReport","params":{"type":"etpl"}}

IMPORTANT: Respond with ONLY the JSON object, no other text.`;

  // Use Cloudflare Workers AI (Llama 3.1 8B Instruct)
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 512,
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Workers AI error: ${error}`);
  }

  const data = await response.json();
  const content = data.result?.response || '';
  
  // Extract JSON from response (model might add extra text)
  let jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in model response');
  }

  let actionData;
  try {
    actionData = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Bad JSON from model: ${content}`);
  }

  // Validate structure
  if (!actionData.action || !actionData.params) {
    throw new Error('Invalid action structure from model');
  }

  return actionData;
}
