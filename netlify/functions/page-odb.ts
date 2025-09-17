import { builder, Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  const path = (event.path || '/').replace(/^\/page\//, '') || 'index'
  
  try {
    // Ask Supabase (or your Edge Function) to render HTML for this path
    const rsp = await fetch(process.env.SUPABASE_URL + '/functions/v1/render', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path })
    })

    if (!rsp.ok) {
      // Fallback to basic template if Supabase render fails
      const fallbackHtml = generateFallbackPage(path)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=86400'
        },
        body: fallbackHtml
      }
    }

    const html = await rsp.text()
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // CDN cache + client cache; adjust as you prefer
        'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=86400'
      },
      body: html
    }
  } catch (error) {
    console.error('Page ODB error:', error)
    
    // Generate fallback page
    const fallbackHtml = generateFallbackPage(path)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      },
      body: fallbackHtml
    }
  }
}

function generateFallbackPage(path: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${path} | Elevate for Humanity</title>
    <meta name="description" content="Career training and workforce development programs">
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 2rem; }
        .content { line-height: 1.6; }
        .cta { background: #3b82f6; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Elevate for Humanity</h1>
        <p>Career Training & Workforce Development</p>
    </div>
    <div class="content">
        <h2>Page: ${path}</h2>
        <p>This page is part of our comprehensive career training platform. We offer WIOA-approved programs in technology, healthcare, and skilled trades.</p>
        <p>Our programs include:</p>
        <ul>
            <li>Cybersecurity Training</li>
            <li>Cloud Computing</li>
            <li>Healthcare (CNA/HHA)</li>
            <li>Electrical Trades</li>
            <li>Construction</li>
            <li>Cosmetology</li>
        </ul>
        <a href="/programs" class="cta">View All Programs</a>
        <a href="/contact" class="cta">Contact Us</a>
    </div>
</body>
</html>`
}

// Persist result on first request → next requests are instant from Netlify CDN
export const handler = builder(handler)