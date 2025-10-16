/**
 * AI Employee Planner
 * 
 * This worker acts as an intelligent task router that:
 * 1. Receives requests from email webhooks, forms, or manual triggers
 * 2. Uses Workers AI to understand intent and plan actions
 * 3. Routes to appropriate tools via executeAction Edge Function
 * 4. Logs all activity for audit and monitoring
 * 
 * Example flows:
 * - Email: "I want to enroll in the program" → triage lead → send follow-up → create checkout
 * - Webhook: New form submission → extract data → enroll student → send welcome email
 * - Manual: "Send follow-up to all pending leads" → query DB → send emails
 */

import { TOOL_REGISTRY, getTool, validateToolParams, generateToolDocs, getToolStats } from './tool-registry.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: POST /webhooks/inbound - Postmark inbound email webhook
      if (path === '/webhooks/inbound' && request.method === 'POST') {
        const bodyText = await request.text();
        
        // Verify Postmark signature
        if (!verifyPostmarkSignature(request, env, bodyText)) {
          return new Response('Unauthorized', { status: 401 });
        }
        
        const payload = JSON.parse(bodyText);
        
        // Process the inbound email
        const result = await handlePostmarkInbound(env, payload);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /plan - Main AI planner endpoint
      if (path === '/plan' && request.method === 'POST') {
        const { task, context } = await request.json();
        
        // Use Workers AI to plan the task
        const plan = await planTask(env, task, context);
        
        // Execute the plan
        const results = await executePlan(env, plan, context);
        
        // Log the activity
        await logActivity(env, {
          task,
          plan,
          results,
          timestamp: new Date().toISOString(),
        });
        
        return new Response(JSON.stringify({
          success: true,
          plan,
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /email-webhook - Generic email handler
      if (path === '/email-webhook' && request.method === 'POST') {
        const email = await request.json();
        
        // Triage the email
        const triage = await triageEmail(env, email);
        
        // Execute appropriate actions
        const results = await handleEmailTriage(env, triage, email);
        
        return new Response(JSON.stringify({
          success: true,
          triage,
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /form-webhook - Form submission handler
      if (path === '/form-webhook' && request.method === 'POST') {
        const formData = await request.json();
        
        // Process form submission
        const results = await handleFormSubmission(env, formData);
        
        return new Response(JSON.stringify({
          success: true,
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /tasks - List recent AI employee tasks
      if (path === '/tasks' && request.method === 'GET') {
        const tasks = await getRecentTasks(env);
        
        return new Response(JSON.stringify({
          success: true,
          tasks,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /templates - Get email templates
      if (path === '/templates' && request.method === 'GET') {
        const templates = getEmailTemplates();
        
        return new Response(JSON.stringify({
          success: true,
          templates,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /tools - List all available tools
      if (path === '/tools' && request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          tools: TOOL_REGISTRY,
          stats: getToolStats(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /tools/:name - Get specific tool details
      if (path.startsWith('/tools/') && request.method === 'GET') {
        const toolName = path.split('/')[2];
        const tool = getTool(toolName);
        
        if (!tool) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Tool not found',
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          tool: { name: toolName, ...tool },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: GET /tools-docs - Generate markdown documentation
      if (path === '/tools-docs' && request.method === 'GET') {
        const docs = generateToolDocs();
        
        return new Response(docs, {
          headers: { ...corsHeaders, 'Content-Type': 'text/markdown' },
        });
      }

      // Route: POST /validate-tool - Validate tool parameters
      if (path === '/validate-tool' && request.method === 'POST') {
        const { tool, params } = await request.json();
        const validation = validateToolParams(tool, params);
        
        return new Response(JSON.stringify({
          success: validation.valid,
          validation,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'ai-employee',
          timestamp: new Date().toISOString(),
          toolsAvailable: Object.keys(TOOL_REGISTRY).length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('AI Employee Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

/**
 * Verify Postmark webhook signature using HMAC-SHA256
 */
async function verifyPostmarkSignature(request, env, bodyText) {
  const signature = request.headers.get('X-Postmark-Webhook-Signature');
  
  if (!signature || !env.POSTMARK_INBOUND_TOKEN) {
    console.warn('Missing signature or token');
    return false;
  }
  
  try {
    // Encode the secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.POSTMARK_INBOUND_TOKEN);
    const messageData = encoder.encode(bodyText);
    
    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Generate signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = btoa(String.fromCharCode(...signatureArray));
    
    // Compare signatures (constant-time comparison would be better in production)
    return signature === computedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Handle Postmark inbound webhook
 */
async function handlePostmarkInbound(env, payload) {
  // Extract email details
  const from = payload.FromFull?.Email || payload.From;
  const fromName = payload.FromFull?.Name || payload.FromName || '';
  const subject = payload.Subject || '';
  const textBody = payload.TextBody || '';
  const htmlBody = payload.HtmlBody || '';
  const attachments = payload.Attachments || [];
  
  // Build condensed email for AI processing
  const emailSummary = [
    `From: ${fromName} <${from}>`,
    `Subject: ${subject}`,
    `Body: ${textBody.slice(0, 4000) || htmlBody.slice(0, 4000)}`,
    attachments.length ? `Attachments: ${attachments.map(a => a.Name).join(', ')}` : ''
  ].filter(Boolean).join('\n\n');
  
  // Use AI to determine action
  const systemPrompt = `You are an AI email assistant for Elevate for Humanity (EFH).

Analyze this email and respond with ONE action as JSON:

AVAILABLE ACTIONS:
1. makeCheckout - Create enrollment/donation checkout link
   {"action":"makeCheckout","params":{"type":"enrollment|donation","amount_cents":19900,"email":"...","name":"...","meta":{"program":"..."}}}

2. uploadIntakeDoc - Upload attached documents
   {"action":"uploadIntakeDoc","params":{"owner_email":"...","purpose":"intake","files":[{"name":"...","content_b64":"...","mime":"..."}]}}

3. createLead - Create new lead in CRM
   {"action":"createLead","params":{"email":"...","name":"...","source":"email","notes":"..."}}

4. sendFollowupEmail - Send templated response
   {"action":"sendFollowupEmail","params":{"to":"...","template":"enrollment_inquiry|payment_question|general","vars":{"subject":"...","name":"..."}}}

5. createAffiliate - Set up affiliate account
   {"action":"createAffiliate","params":{"email":"...","name":"...","commission_rate":0.10}}

EMAIL:
${emailSummary}

Respond ONLY with valid JSON. Choose the most appropriate action.`;

  let actionPlan;
  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: emailSummary },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });
    
    const text = response.response || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      actionPlan = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON in response');
    }
  } catch (error) {
    console.error('AI planning error:', error);
    // Fallback: create lead and send generic follow-up
    actionPlan = {
      action: 'createLead',
      params: {
        email: from,
        name: fromName,
        source: 'email',
        notes: `Subject: ${subject}\n\n${textBody.slice(0, 500)}`,
      },
    };
  }
  
  // Handle attachments if present
  if (attachments.length > 0 && actionPlan.action !== 'uploadIntakeDoc') {
    // Store attachments separately
    for (const attachment of attachments) {
      try {
        await executeAction(env, 'uploadIntakeDoc', {
          owner_email: from,
          purpose: 'email_attachment',
          files: [{
            name: attachment.Name,
            content_b64: attachment.Content,
            mime: attachment.ContentType,
          }],
        }, { userId: 'ai-employee' });
      } catch (error) {
        console.error('Attachment upload error:', error);
      }
    }
  }
  
  // Execute the planned action
  let actionResult;
  try {
    actionResult = await executeAction(env, actionPlan.action, actionPlan.params, { userId: 'ai-employee' });
  } catch (error) {
    console.error('Action execution error:', error);
    actionResult = { success: false, error: error.message };
  }
  
  // Log the event
  await executeAction(env, 'logAgentEvent', {
    source: 'email',
    from,
    subject,
    plan: actionPlan,
    result: actionResult,
  }, { userId: 'ai-employee' });
  
  // Log to KV for quick retrieval
  await logActivity(env, {
    type: 'email_inbound',
    from,
    subject,
    plan: actionPlan,
    result: actionResult,
    timestamp: new Date().toISOString(),
  });
  
  return {
    success: true,
    from,
    subject,
    action: actionPlan.action,
    result: actionResult,
  };
}

/**
 * Use Workers AI to plan a task
 */
async function planTask(env, task, context) {
  // Build tool descriptions from registry
  const toolDescriptions = Object.entries(TOOL_REGISTRY)
    .filter(([_, tool]) => !tool.requiresApproval || context.approved)
    .map(([name, tool]) => {
      const params = Object.entries(tool.parameters)
        .map(([pName, pDef]) => `${pName}: ${pDef.description}`)
        .join(', ');
      return `- ${name}: ${tool.description}\n  Parameters: ${params}\n  Risk: ${tool.riskLevel}`;
    })
    .join('\n');

  const systemPrompt = `You are an AI employee assistant for Elevate for Humanity (EFH), a nonprofit education platform.

Your job is to understand user requests and create an action plan using these available tools:

AVAILABLE TOOLS:
${toolDescriptions}

CONTEXT:
${JSON.stringify(context, null, 2)}

USER REQUEST: ${task}

Respond with a JSON action plan in this format:
{
  "intent": "brief description of what user wants",
  "actions": [
    {
      "tool": "toolName",
      "params": { "key": "value" },
      "reason": "why this action is needed"
    }
  ],
  "confidence": 0.95
}

IMPORTANT:
- Only use tools that are necessary
- Be efficient - prefer single actions over multiple when possible
- Always validate email addresses and required fields
- For high-risk actions, ensure all required parameters are present

Respond ONLY with valid JSON.`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  // Parse the AI response
  const text = response.response || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  // Fallback if AI doesn't return valid JSON
  return {
    intent: task,
    actions: [],
    confidence: 0.5,
    error: 'Could not parse AI response',
  };
}

/**
 * Execute a plan by calling the appropriate tools
 */
async function executePlan(env, plan, context) {
  const results = [];
  
  for (const action of plan.actions || []) {
    try {
      const result = await executeAction(env, action.tool, action.params, context);
      results.push({
        action: action.tool,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        action: action.tool,
        success: false,
        error: error.message,
      });
    }
  }
  
  return results;
}

/**
 * Execute a single action via the Edge Function
 */
async function executeAction(env, tool, params, context) {
  // Validate tool exists in registry
  const toolDef = getTool(tool);
  if (!toolDef) {
    throw new Error(`Unknown tool: ${tool}`);
  }
  
  // Validate parameters
  const validation = validateToolParams(tool, params);
  if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }
  
  // Check if approval is required
  if (toolDef.requiresApproval && !context.approved) {
    throw new Error(`Tool ${tool} requires manual approval (risk level: ${toolDef.riskLevel})`);
  }
  
  // Map tool name to action name (most are 1:1)
  const actionMap = {
    sendFollowupEmail: 'sendFollowupEmail',
    makeCheckout: 'makeCheckout',
    enrollStudent: 'enrollStudent',
    uploadIntakeDoc: 'uploadIntakeDoc',
    createLead: 'createLead',
    updateLead: 'updateLead',
    scheduleTask: 'scheduleTask',
    getStats: 'getStats',
    createAffiliate: 'createAffiliate',
    logAgentEvent: 'logAgentEvent',
  };
  
  const actionName = actionMap[tool] || tool;
  
  // Call the executeAction Edge Function
  const response = await fetch(`${env.SUPABASE_URL}/functions/v1/executeAction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      action: actionName,
      params,
      userId: context.userId || 'ai-employee',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Action failed: ${error}`);
  }
  
  return await response.json();
}

/**
 * Triage an incoming email
 */
async function triageEmail(env, email) {
  const systemPrompt = `You are an email triage assistant for Elevate for Humanity (EFH).

Analyze this email and categorize it:

CATEGORIES:
- enrollment_inquiry: Someone asking about programs
- payment_question: Questions about tuition/payments
- technical_support: Platform issues
- affiliate_inquiry: Questions about affiliate program
- general_question: General inquiries
- spam: Spam or irrelevant

PRIORITY:
- high: Urgent, time-sensitive
- medium: Normal inquiry
- low: Can wait

EMAIL:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Respond with JSON:
{
  "category": "enrollment_inquiry",
  "priority": "high",
  "intent": "brief summary of what they want",
  "suggestedActions": ["sendFollowupEmail", "makeCheckout"],
  "confidence": 0.9
}`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Triage this email: ${JSON.stringify(email)}` },
    ],
    temperature: 0.2,
    max_tokens: 500,
  });

  const text = response.response || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return {
    category: 'general_question',
    priority: 'medium',
    intent: 'Unknown',
    suggestedActions: [],
    confidence: 0.5,
  };
}

/**
 * Handle email triage results
 */
async function handleEmailTriage(env, triage, email) {
  const results = [];
  
  // Always log the lead
  try {
    await executeAction(env, 'triageLead', {
      email: email.from,
      category: triage.category,
      priority: triage.priority,
      source: 'email',
      notes: `${email.subject}\n\n${email.body}`,
    }, { userId: 'ai-employee' });
    
    results.push({ action: 'triageLead', success: true });
  } catch (error) {
    results.push({ action: 'triageLead', success: false, error: error.message });
  }
  
  // Send appropriate follow-up
  if (triage.category === 'enrollment_inquiry') {
    try {
      await executeAction(env, 'sendFollowupEmail', {
        to: email.from,
        template: 'enrollment_inquiry',
        data: {
          subject: email.subject,
        },
      }, { userId: 'ai-employee' });
      
      results.push({ action: 'sendFollowupEmail', success: true });
    } catch (error) {
      results.push({ action: 'sendFollowupEmail', success: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * Handle form submissions
 */
async function handleFormSubmission(env, formData) {
  const results = [];
  
  // If it's an enrollment form, create checkout
  if (formData.type === 'enrollment') {
    try {
      const checkout = await executeAction(env, 'makeCheckout', {
        programId: formData.programId,
        email: formData.email,
        name: formData.name,
      }, { userId: 'ai-employee' });
      
      results.push({ action: 'makeCheckout', success: true, data: checkout });
      
      // Send email with checkout link
      await executeAction(env, 'sendFollowupEmail', {
        to: formData.email,
        template: 'enrollment_checkout',
        data: {
          name: formData.name,
          checkoutUrl: checkout.url,
        },
      }, { userId: 'ai-employee' });
      
      results.push({ action: 'sendFollowupEmail', success: true });
    } catch (error) {
      results.push({ action: 'makeCheckout', success: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * Log AI employee activity
 */
async function logActivity(env, activity) {
  // Store in KV for quick retrieval (if available)
  if (env.AI_EMPLOYEE_LOGS) {
    try {
      const key = `activity:${Date.now()}`;
      await env.AI_EMPLOYEE_LOGS.put(key, JSON.stringify(activity), {
        expirationTtl: 60 * 60 * 24 * 30, // 30 days
      });
    } catch (error) {
      console.warn('KV logging failed:', error);
    }
  }
}

/**
 * Get recent AI employee tasks
 */
async function getRecentTasks(env) {
  if (!env.AI_EMPLOYEE_LOGS) {
    return [];
  }
  
  try {
    const list = await env.AI_EMPLOYEE_LOGS.list({ limit: 50 });
    const tasks = [];
    
    for (const key of list.keys) {
      const value = await env.AI_EMPLOYEE_LOGS.get(key.name);
      if (value) {
        tasks.push(JSON.parse(value));
      }
    }
    
    return tasks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.warn('Failed to get tasks from KV:', error);
    return [];
  }
}

/**
 * Email templates
 */
function getEmailTemplates() {
  return {
    enrollment_inquiry: {
      subject: 'Welcome to Elevate for Humanity!',
      body: `Hi there!

Thank you for your interest in Elevate for Humanity's programs. We're excited to help you on your educational journey.

Our programs are designed to provide accessible, high-quality education with flexible payment options. Here's what you can expect:

✅ Expert-led courses
✅ Flexible scheduling
✅ Affordable tuition with payment plans
✅ Supportive community

Would you like to schedule a call to discuss which program is right for you? Or I can send you a link to enroll directly.

Looking forward to hearing from you!

Best regards,
The EFH Team`,
    },
    enrollment_checkout: {
      subject: 'Your Enrollment Link - Elevate for Humanity',
      body: `Hi {{name}},

Great news! Your enrollment link is ready.

Click here to complete your enrollment:
{{checkoutUrl}}

If you have any questions, just reply to this email.

Best regards,
The EFH Team`,
    },
    payment_reminder: {
      subject: 'Payment Reminder - Elevate for Humanity',
      body: `Hi {{name}},

This is a friendly reminder that your payment of ${{amount}} is due on {{dueDate}}.

You can make your payment here:
{{paymentUrl}}

If you've already paid, please disregard this message.

Best regards,
The EFH Team`,
    },
    welcome_enrolled: {
      subject: 'Welcome to Your Program!',
      body: `Hi {{name}},

Congratulations! You're officially enrolled in {{programName}}.

Here's what happens next:
1. You'll receive access to your course materials within 24 hours
2. Check your email for login credentials
3. Join our community forum to connect with other students

We're thrilled to have you with us!

Best regards,
The EFH Team`,
    },
  };
}
