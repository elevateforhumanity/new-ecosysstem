import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type = 'sitemap', tenant = 'elevate' } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (type === 'sitemap') {
      // Generate XML sitemap
      const { data: programs, error } = await supabase
        .from('programs')
        .select('id, title, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })

      if (error) throw error

      const baseUrl = tenant === 'elevate' 
        ? 'https://www.elevateforhumanity.org'
        : `https://${tenant}.elevateforhumanity.org`

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/programs/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`

      // Add program pages
      for (const program of programs) {
        const slug = program.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        sitemap += `
  <url>
    <loc>${baseUrl}/programs/${slug}-${program.id}</loc>
    <lastmod>${program.updated_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      }

      sitemap += '\n</urlset>'

      return new Response(sitemap, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600'
        },
        status: 200,
      })

    } else if (type === 'index') {
      // Generate sitemap index
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.elevateforhumanity.org/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.elevateforhumanity.org/sitemap-programs.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`

      return new Response(sitemapIndex, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600'
        },
        status: 200,
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type parameter' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})