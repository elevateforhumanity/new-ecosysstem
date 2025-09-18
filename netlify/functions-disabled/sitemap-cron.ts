import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)

export const handler: Handler = async () => {
  try {
    console.log('Starting sitemap generation...')
    
    // 1) Pull list of URLs from Supabase (stream/paginate for scale)
    const urls: string[] = await fetchAllUrlsFromSupabase()
    console.log(`Found ${urls.length} URLs to process`)

    // 2) Chunk into 50k per file (Google's recommended limit)
    const chunks: string[][] = []
    const chunkSize = 50000
    for (let i = 0; i < urls.length; i += chunkSize) {
      chunks.push(urls.slice(i, i + chunkSize))
    }

    // 3) Write each sitemapN.xml to R2
    const indexEntries: string[] = []
    let n = 1
    for (const group of chunks) {
      const xml = toSitemapXml(group)
      const key = `sitemaps/sitemap-${n}.xml`
      
      await s3.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: xml,
        ContentType: 'application/xml',
        CacheControl: 'public, max-age=86400'
      }))
      
      indexEntries.push(`<sitemap><loc>${publicUrl(key)}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`)
      console.log(`Generated sitemap ${n} with ${group.length} URLs`)
      n++
    }

    // 4) Write sitemap index
    const idx = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>`

    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: `sitemaps/sitemap.xml`,
      Body: idx,
      ContentType: 'application/xml',
      CacheControl: 'public, max-age=86400'
    }))

    // 5) Also create a main sitemap.xml in deploy directory for immediate access
    const mainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>`

    // Write to local deploy directory (will be included in next build)
    const fs = await import('fs')
    const path = await import('path')
    const deployPath = path.join(process.cwd(), 'deploy', 'sitemap.xml')
    fs.writeFileSync(deployPath, mainSitemap)

    console.log(`✅ Generated ${chunks.length} sitemaps with ${urls.length} total URLs`)

    return { 
      statusCode: 200, 
      body: JSON.stringify({
        success: true,
        sitemaps: chunks.length,
        totalUrls: urls.length,
        message: `Generated ${chunks.length} sitemaps with ${urls.length} URLs`
      }),
      headers: { 'Content-Type': 'application/json' }
    }
  } catch (error: any) {
    console.error('Sitemap generation error:', error)
    return { 
      statusCode: 500, 
      body: JSON.stringify({
        success: false,
        error: error.message
      }),
      headers: { 'Content-Type': 'application/json' }
    }
  }
}

function toSitemapXml(urls: string[]): string {
  const now = new Date().toISOString()
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`
}

function publicUrl(key: string): string {
  // Use your domain for R2 assets
  const domain = process.env.NETLIFY_URL || 'https://elevateforhumanity.org'
  return `${domain}/r2-assets/${key}`
}

async function fetchAllUrlsFromSupabase(): Promise<string[]> {
  try {
    // Base URLs for your site
    const baseUrls = [
      'https://elevateforhumanity.org',
      'https://elevateforhumanity.org/programs',
      'https://elevateforhumanity.org/programs/cybersecurity',
      'https://elevateforhumanity.org/programs/cloud-computing',
      'https://elevateforhumanity.org/programs/healthcare-cna',
      'https://elevateforhumanity.org/programs/electrical-trades',
      'https://elevateforhumanity.org/programs/construction',
      'https://elevateforhumanity.org/programs/beauty-wellness',
      'https://elevateforhumanity.org/about',
      'https://elevateforhumanity.org/contact',
      'https://elevateforhumanity.org/students',
      'https://elevateforhumanity.org/contracts'
    ]

    // If you have a pages table in Supabase, fetch from there
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('url')
        .limit(200000)

      if (data && !error) {
        const dbUrls = data.map(d => d.url)
        return [...baseUrls, ...dbUrls]
      }
    } catch (dbError) {
      console.log('No pages table found, using base URLs')
    }

    // Generate dynamic URLs for demonstration (replace with your actual URL generation logic)
    const dynamicUrls: string[] = []
    
    // Example: Generate program variation URLs
    const programs = ['cybersecurity', 'cloud-computing', 'healthcare-cna', 'electrical-trades', 'construction', 'beauty-wellness']
    const locations = ['indianapolis', 'fort-wayne', 'evansville', 'south-bend', 'carmel', 'fishers']
    
    for (const program of programs) {
      for (const location of locations) {
        dynamicUrls.push(`https://elevateforhumanity.org/programs/${program}/${location}`)
        dynamicUrls.push(`https://elevateforhumanity.org/programs/${program}/${location}/schedule`)
        dynamicUrls.push(`https://elevateforhumanity.org/programs/${program}/${location}/apply`)
      }
    }

    return [...baseUrls, ...dynamicUrls]
  } catch (error) {
    console.error('Error fetching URLs:', error)
    // Return basic URLs as fallback
    return [
      'https://elevateforhumanity.org',
      'https://elevateforhumanity.org/programs',
      'https://elevateforhumanity.org/about',
      'https://elevateforhumanity.org/contact'
    ]
  }
}