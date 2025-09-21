// scripts/build-blog.js
// Generate blog pages from Supabase blog_posts table

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const config = {
  domain: process.env.DOMAIN || "elevate4humanity.org",
  outputDir: "dist",
  blogDir: "blog",
  postsPerPage: 10,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

/**
 * Fetch blog posts from Supabase
 */
async function fetchBlogPosts() {
  console.log("📰 Fetching blog posts from Supabase...");
  
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.log("⚠️ Blog posts table not found or error:", error.message);
      return [];
    }
    
    console.log(`✅ Found ${data?.length || 0} published blog posts`);
    return data || [];
    
  } catch (error) {
    console.error("❌ Failed to fetch blog posts:", error.message);
    return [];
  }
}

/**
 * Generate slug from title if not provided
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/**
 * Generate blog post HTML
 */
function generateBlogPostHTML(post) {
  const slug = post.slug || generateSlug(post.title);
  const baseUrl = `https://${config.domain}`;
  const publishDate = formatDate(post.created_at);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | Elevate for Humanity Blog</title>
  <meta name="description" content="${post.excerpt || post.title}">
  <meta name="keywords" content="Elevate for Humanity, workforce development, training, ${post.tags || 'blog'}">
  <meta name="author" content="${post.author || 'Elevate for Humanity'}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt || post.title}">
  <meta property="og:url" content="${baseUrl}/blog/${slug}/">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Elevate for Humanity">
  <meta property="article:published_time" content="${post.created_at}">
  <meta property="article:author" content="${post.author || 'Elevate for Humanity'}">
  ${post.featured_image ? `<meta property="og:image" content="${post.featured_image}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.excerpt || post.title}">
  ${post.featured_image ? `<meta name="twitter:image" content="${post.featured_image}">` : ''}
  
  <!-- Canonical -->
  <link rel="canonical" href="${baseUrl}/blog/${slug}/">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico">
  
  <!-- Styles -->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      text-align: center;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
    }
    
    .back-link:hover {
      color: white;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .meta {
      opacity: 0.9;
      font-size: 1.1rem;
    }
    
    .featured-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 10px;
      margin: 2rem 0;
    }
    
    .content {
      padding: 2rem 0;
    }
    
    .content h2 {
      color: #2c3e50;
      margin: 2rem 0 1rem;
    }
    
    .content h3 {
      color: #34495e;
      margin: 1.5rem 0 0.75rem;
    }
    
    .content p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      line-height: 1.8;
    }
    
    .content ul, .content ol {
      margin-bottom: 1.5rem;
      padding-left: 2rem;
    }
    
    .content li {
      margin-bottom: 0.5rem;
    }
    
    .content blockquote {
      border-left: 4px solid #667eea;
      padding-left: 1.5rem;
      margin: 2rem 0;
      font-style: italic;
      color: #555;
    }
    
    .tags {
      margin: 2rem 0;
      padding: 1rem 0;
      border-top: 1px solid #eee;
    }
    
    .tag {
      display: inline-block;
      background: #f8f9fa;
      color: #667eea;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.9rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 2rem 0;
      text-align: center;
      margin-top: 3rem;
    }
    
    .btn {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 1rem 2rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }
    
    .btn:hover {
      background: #5a6fd8;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .content p {
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <a href="/blog/" class="back-link">← Back to Blog</a>
      <h1>${post.title}</h1>
      <div class="meta">
        Published ${publishDate}${post.author ? ` by ${post.author}` : ''}
      </div>
    </div>
  </header>
  
  <main class="container">
    ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="featured-image">` : ''}
    
    <div class="content">
      ${post.content || post.excerpt || '<p>Content coming soon...</p>'}
    </div>
    
    ${post.tags ? `
    <div class="tags">
      ${post.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
    </div>
    ` : ''}
  </main>
  
  <footer class="footer">
    <div class="container">
      <a href="/blog/" class="btn">Read More Posts</a>
    </div>
  </footer>
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.excerpt || post.title}",
    "url": "${baseUrl}/blog/${slug}/",
    "datePublished": "${post.created_at}",
    "dateModified": "${post.updated_at || post.created_at}",
    "author": {
      "@type": "Person",
      "name": "${post.author || 'Elevate for Humanity'}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Elevate for Humanity",
      "url": "${baseUrl}"
    }${post.featured_image ? `,
    "image": "${post.featured_image}"` : ''}
  }
  </script>
</body>
</html>`;
}

/**
 * Generate blog index HTML
 */
function generateBlogIndexHTML(posts, page = 1) {
  const baseUrl = `https://${config.domain}`;
  const startIndex = (page - 1) * config.postsPerPage;
  const endIndex = startIndex + config.postsPerPage;
  const pagePosts = posts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(posts.length / config.postsPerPage);
  
  const postsHTML = pagePosts.map(post => {
    const slug = post.slug || generateSlug(post.title);
    const publishDate = formatDate(post.created_at);
    
    return `
    <article class="post-card">
      ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="post-image">` : ''}
      <div class="post-content">
        <h2><a href="/blog/${slug}/">${post.title}</a></h2>
        <div class="post-meta">
          <span class="date">${publishDate}</span>
          ${post.author ? `<span class="author">by ${post.author}</span>` : ''}
        </div>
        <p class="excerpt">${post.excerpt || 'Read more about this topic...'}</p>
        <a href="/blog/${slug}/" class="read-more">Read More →</a>
      </div>
    </article>
    `;
  }).join('');
  
  const paginationHTML = totalPages > 1 ? `
    <div class="pagination">
      ${page > 1 ? `<a href="/blog/${page > 2 ? `page-${page - 1}/` : ''}" class="btn btn-outline">← Previous</a>` : ''}
      <span class="page-info">Page ${page} of ${totalPages}</span>
      ${page < totalPages ? `<a href="/blog/page-${page + 1}/" class="btn btn-outline">Next →</a>` : ''}
    </div>
  ` : '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page > 1 ? `Blog - Page ${page} | ` : ''}Elevate for Humanity Blog</title>
  <meta name="description" content="Latest news, updates, and insights from Elevate for Humanity's workforce development programs.">
  <link rel="canonical" href="${baseUrl}/blog/${page > 1 ? `page-${page}/` : ''}">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8f9fa;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 0;
      text-align: center;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .main {
      padding: 3rem 0;
    }
    
    .posts-grid {
      display: grid;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .post-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    
    .post-card:hover {
      transform: translateY(-5px);
    }
    
    .post-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .post-content {
      padding: 2rem;
    }
    
    .post-content h2 {
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    
    .post-content h2 a {
      text-decoration: none;
      color: inherit;
    }
    
    .post-content h2 a:hover {
      color: #667eea;
    }
    
    .post-meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    
    .post-meta .author {
      margin-left: 1rem;
    }
    
    .excerpt {
      margin-bottom: 1.5rem;
      color: #555;
    }
    
    .read-more {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .read-more:hover {
      text-decoration: underline;
    }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 0;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .btn-outline {
      border: 2px solid #667eea;
      color: #667eea;
      background: transparent;
    }
    
    .btn-outline:hover {
      background: #667eea;
      color: white;
    }
    
    .page-info {
      color: #666;
    }
    
    .no-posts {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .post-content {
        padding: 1.5rem;
      }
      
      .pagination {
        flex-direction: column;
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>Elevate for Humanity Blog</h1>
      <p class="subtitle">Latest news, updates, and insights from our workforce development programs</p>
    </div>
  </header>
  
  <main class="main">
    <div class="container">
      ${posts.length > 0 ? `
        <div class="posts-grid">
          ${postsHTML}
        </div>
        ${paginationHTML}
      ` : `
        <div class="no-posts">
          <h2>No blog posts yet</h2>
          <p>Check back soon for updates and insights from Elevate for Humanity.</p>
        </div>
      `}
    </div>
  </main>
</body>
</html>`;
}

/**
 * Build individual blog post pages
 */
async function buildBlogPostPages(posts) {
  console.log("📝 Building individual blog post pages...");
  
  const blogPath = path.join(config.outputDir, config.blogDir);
  let builtPages = 0;
  
  for (const post of posts) {
    const slug = post.slug || generateSlug(post.title);
    const postPath = path.join(blogPath, slug);
    
    // Create post directory
    if (!fs.existsSync(postPath)) {
      fs.mkdirSync(postPath, { recursive: true });
    }
    
    // Generate HTML
    const html = generateBlogPostHTML(post);
    const indexPath = path.join(postPath, "index.html");
    
    fs.writeFileSync(indexPath, html);
    builtPages++;
    
    console.log(`✅ Built blog post: ${post.title} → /blog/${slug}/`);
  }
  
  return builtPages;
}

/**
 * Build blog index and pagination pages
 */
async function buildBlogIndexPages(posts) {
  console.log("📋 Building blog index and pagination pages...");
  
  const blogPath = path.join(config.outputDir, config.blogDir);
  const totalPages = Math.ceil(posts.length / config.postsPerPage);
  
  // Build main index page
  const indexHTML = generateBlogIndexHTML(posts, 1);
  fs.writeFileSync(path.join(blogPath, "index.html"), indexHTML);
  console.log("✅ Built blog index: /blog/");
  
  // Build pagination pages
  for (let page = 2; page <= totalPages; page++) {
    const pageHTML = generateBlogIndexHTML(posts, page);
    const pagePath = path.join(blogPath, `page-${page}`);
    
    if (!fs.existsSync(pagePath)) {
      fs.mkdirSync(pagePath, { recursive: true });
    }
    
    fs.writeFileSync(path.join(pagePath, "index.html"), pageHTML);
    console.log(`✅ Built blog page: /blog/page-${page}/`);
  }
  
  return totalPages;
}

/**
 * Main blog building function
 */
export async function buildBlog() {
  console.log("📰 Starting blog build...");
  
  try {
    // Create blog directory
    const blogPath = path.join(config.outputDir, config.blogDir);
    if (!fs.existsSync(blogPath)) {
      fs.mkdirSync(blogPath, { recursive: true });
    }
    
    // Fetch blog posts
    const posts = await fetchBlogPosts();
    
    if (posts.length === 0) {
      console.log("ℹ️ No blog posts found, creating empty blog page");
      const emptyHTML = generateBlogIndexHTML([], 1);
      fs.writeFileSync(path.join(blogPath, "index.html"), emptyHTML);
      
      return {
        success: true,
        posts: 0,
        pages: 1
      };
    }
    
    // Build individual post pages
    const builtPosts = await buildBlogPostPages(posts);
    
    // Build index and pagination pages
    const totalPages = await buildBlogIndexPages(posts);
    
    console.log(`🎉 Blog build complete: ${builtPosts} posts, ${totalPages} index pages`);
    
    return {
      success: true,
      posts: builtPosts,
      pages: totalPages,
      totalPosts: posts.length
    };
    
  } catch (error) {
    console.error("💥 Blog build failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  await buildBlog();
}