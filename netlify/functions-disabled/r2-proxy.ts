import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import type { Handler } from '@netlify/functions'
import { Readable } from 'stream'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

export const handler: Handler = async (event) => {
  const key = (event.path || '').replace(/^\/r2-assets\//, '')
  if (!key) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing asset key' }),
      headers: { 'Content-Type': 'application/json' }
    }
  }

  try {
    const obj = await s3.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key
    }))

    if (!obj.Body) {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ error: 'Asset not found' }),
        headers: { 'Content-Type': 'application/json' }
      }
    }

    const bodyStream = obj.Body as unknown as Readable
    const chunks: Buffer[] = []
    for await (const chunk of bodyStream) {
      chunks.push(Buffer.from(chunk))
    }

    const contentType = obj.ContentType || 'application/octet-stream'
    const isText = contentType.startsWith('text/') || 
                   contentType.includes('json') || 
                   contentType.includes('xml') ||
                   contentType.includes('html')

    const body = Buffer.concat(chunks)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
        'ETag': obj.ETag || '',
        'Last-Modified': obj.LastModified?.toUTCString() || '',
        'Content-Length': body.length.toString()
      },
      body: isText ? body.toString('utf8') : body.toString('base64'),
      isBase64Encoded: !isText
    }
  } catch (error: any) {
    console.error('R2 proxy error:', error)
    
    // Return 404 for missing files
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ error: 'Asset not found' }),
        headers: { 'Content-Type': 'application/json' }
      }
    }

    // Return 500 for other errors
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    }
  }
}