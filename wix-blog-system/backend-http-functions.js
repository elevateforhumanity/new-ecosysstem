// Backend HTTP Functions for Blog API
// Place this in your Wix Editor: Backend > HTTP Functions

import { ok, badRequest, unauthorized, notFound } from 'wix-http-functions';
import wixData from 'wix-data';

const POSTS = 'BlogPosts';
const API_TOKEN = 'efh_blog_api_2024_secure_token_change_this'; // Change this to a secure random token

// Blog post upsert endpoint
// POST /_functions/blog/upsert
export async function post_blog_upsert(request) {
  try {
    // Check authorization
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${API_TOKEN}`) {
      return unauthorized({ body: { error: 'Invalid authorization token' } });
    }

    const body = await request.body.json();
    
    // Validate required fields
    if (!body.title || !body.slug) {
      return badRequest({ 
        body: { error: 'title and slug are required fields' } 
      });
    }

    // Prepare the blog post data
    const payload = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      author: body.author || 'EFH Team',
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      isPublished: body.isPublished !== false // default to true
    };

    // Check if post already exists
    const existing = await wixData.query(POSTS)
      .eq('slug', body.slug)
      .find();

    if (existing.items.length > 0) {
      // Update existing post
      const updated = { ...existing.items[0], ...payload };
      const result = await wixData.update(POSTS, updated);
      
      return ok({ 
        body: { 
          status: 'updated', 
          id: result._id,
          slug: result.slug,
          title: result.title
        } 
      });
    } else {
      // Create new post
      const result = await wixData.insert(POSTS, payload);
      
      return ok({ 
        body: { 
          status: 'created', 
          id: result._id,
          slug: result.slug,
          title: result.title
        } 
      });
    }

  } catch (error) {
    console.error('Blog upsert error:', error);
    return badRequest({ 
      body: { error: `Failed to process blog post: ${error.message}` } 
    });
  }
}

// Get blog posts endpoint
// GET /_functions/blog/posts
export async function get_blog_posts(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const published = url.searchParams.get('published') !== 'false';

    let query = wixData.query(POSTS);
    
    if (published) {
      query = query.eq('isPublished', true);
    }
    
    const result = await query
      .descending('publishedAt')
      .limit(Math.min(limit, 100)) // Cap at 100
      .find();

    return ok({ 
      body: { 
        posts: result.items,
        totalCount: result.totalCount,
        hasNext: result.hasNext()
      } 
    });

  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return badRequest({ 
      body: { error: `Failed to fetch blog posts: ${error.message}` } 
    });
  }
}

// RSS feed endpoint
// GET /_functions/blog/rss
export async function get_blog_rss(request) {
  try {
    const site = 'https://elevateforhumanity.org';
    
    const items = await wixData.query(POSTS)
      .eq('isPublished', true)
      .descending('publishedAt')
      .limit(50)
      .find()
      .then(r => r.items);

    const xmlItems = items.map(post => {
      const pubDate = new Date(post.publishedAt || Date.now()).toUTCString();
      const description = post.excerpt || 
        (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 280) : '');
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${site}/blog/${post.slug}</link>
      <guid>${site}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <author>elevateforhumanity@gmail.com (${post.author || 'EFH Team'})</author>
      ${post.tags && post.tags.length > 0 ? post.tags.map(tag => `<category>${tag}</category>`).join('') : ''}
    </item>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Elevate for Humanity Blog</title>
    <link>${site}/blog</link>
    <description>Workforce development insights, success stories, and career training updates from Elevate for Humanity</description>
    <language>en-us</language>
    <managingEditor>elevateforhumanity@gmail.com (Liz Jae)</managingEditor>
    <webMaster>elevateforhumanity@gmail.com (EFH Team)</webMaster>
    <atom:link href="${site}/_functions/blog/rss" rel="self" type="application/rss+xml" />
    ${xmlItems}
  </channel>
</rss>`;

    return ok({ 
      headers: { 
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }, 
      body: xml 
    });

  } catch (error) {
    console.error('RSS feed error:', error);
    return badRequest({ 
      body: { error: `Failed to generate RSS feed: ${error.message}` } 
    });
  }
}

// Delete blog post endpoint
// DELETE /_functions/blog/delete/{slug}
export async function delete_blog_delete(request) {
  try {
    // Check authorization
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${API_TOKEN}`) {
      return unauthorized({ body: { error: 'Invalid authorization token' } });
    }

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];

    if (!slug) {
      return badRequest({ body: { error: 'Slug is required' } });
    }

    // Find the post
    const existing = await wixData.query(POSTS)
      .eq('slug', slug)
      .find();

    if (existing.items.length === 0) {
      return notFound({ body: { error: 'Blog post not found' } });
    }

    // Delete the post
    await wixData.remove(POSTS, existing.items[0]._id);

    return ok({ 
      body: { 
        status: 'deleted', 
        slug: slug 
      } 
    });

  } catch (error) {
    console.error('Blog delete error:', error);
    return badRequest({ 
      body: { error: `Failed to delete blog post: ${error.message}` } 
    });
  }
}