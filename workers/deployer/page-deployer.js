/**
 * Page Deployer Worker
 * 
 * Automatically deploys generated pages to Cloudflare Pages
 * Triggered by Supabase webhooks or cron jobs
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: POST /deploy - Deploy a single page
      if (path === '/deploy' && request.method === 'POST') {
        const { pageId, slug, html } = await request.json();
        
        const result = await deployPage(env, pageId, slug, html);
        
        return new Response(JSON.stringify({
          success: true,
          result,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /deploy-all - Deploy all published pages
      if (path === '/deploy-all' && request.method === 'POST') {
        const results = await deployAllPages(env);
        
        return new Response(JSON.stringify({
          success: true,
          results,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Route: POST /webhook - Supabase webhook handler
      if (path === '/webhook' && request.method === 'POST') {
        const payload = await request.json();
        
        // Handle page publish event
        if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
          const page = payload.record;
          
          if (page.status === 'published') {
            await deployPage(env, page.id, page.slug, page.html);
          }
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'page-deployer',
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Deployer Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // Cron trigger for scheduled deployments
  async scheduled(event, env, ctx) {
    ctx.waitUntil(deployAllPages(env));
  },
};

/**
 * Deploy a single page to R2 storage
 */
async function deployPage(env, pageId, slug, html) {
  // Wrap HTML in full page template
  const fullHtml = generateFullPage(html, slug);
  
  // Store in R2 bucket
  const key = `pages/${slug}.html`;
  await env.PAGES_BUCKET.put(key, fullHtml, {
    httpMetadata: {
      contentType: 'text/html',
    },
    customMetadata: {
      pageId,
      deployedAt: new Date().toISOString(),
    },
  });
  
  // Log deployment
  await logDeployment(env, pageId, slug, 'success');
  
  return {
    pageId,
    slug,
    url: `https://your-domain.com/pages/${slug}`,
    deployedAt: new Date().toISOString(),
  };
}

/**
 * Deploy all published pages
 */
async function deployAllPages(env) {
  // Fetch all published pages from Supabase
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/generated_pages?status=eq.published&select=id,slug,html`,
    {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch pages from Supabase');
  }

  const pages = await response.json();
  const results = [];

  for (const page of pages) {
    try {
      const result = await deployPage(env, page.id, page.slug, page.html);
      results.push({ ...result, status: 'success' });
    } catch (error) {
      results.push({
        pageId: page.id,
        slug: page.slug,
        status: 'failed',
        error: error.message,
      });
      await logDeployment(env, page.id, page.slug, 'failed', error.message);
    }
  }

  return results;
}

/**
 * Generate full HTML page with head, styles, and scripts
 */
function generateFullPage(bodyHtml, slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slug.charAt(0).toUpperCase() + slug.slice(1)} - Elevate for Humanity</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  
  <!-- Custom Styles -->
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Poppins', sans-serif;
    }
    
    /* Brand Colors */
    :root {
      --color-primary: #E53935;
      --color-secondary: #FF9800;
      --color-accent: #2196F3;
    }
  </style>
  
  <!-- Analytics (optional) -->
  <script>
    // Add your analytics code here
  </script>
</head>
<body class="bg-white text-gray-900">
  ${bodyHtml}
  
  <!-- Footer (optional) -->
  <footer class="bg-gray-900 text-white py-8 mt-12">
    <div class="container mx-auto px-4 text-center">
      <p>&copy; ${new Date().getFullYear()} Elevate for Humanity. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Log deployment to Supabase
 */
async function logDeployment(env, pageId, slug, status, error = null) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/deployment_logs`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        page_id: pageId,
        slug,
        status,
        error_message: error,
        deployed_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to log deployment:', error);
  }
}
