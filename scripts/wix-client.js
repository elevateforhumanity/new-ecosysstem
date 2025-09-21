// scripts/wix-client.js
import fetch from "node-fetch";

const WIX_API = "https://www.wixapis.com";
const { WIX_API_KEY, WIX_SITE_ID } = process.env;

if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.error("❌ Missing required environment variables:");
  console.error("   WIX_API_KEY - Get from Wix Dashboard > Settings > Headless > Admin API Key");
  console.error("   WIX_SITE_ID - Your Wix site ID");
  process.exit(1);
}

/**
 * Generic Wix API fetch wrapper with error handling
 */
export async function wixFetch(path, opts = {}) {
  const url = `${WIX_API}${path}`;
  console.log(`🔗 ${opts.method || 'GET'} ${path}`);
  
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: WIX_API_KEY,
      "wix-site-id": WIX_SITE_ID,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wix API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Upload image from URL to Wix Media Manager
 */
export async function uploadImageFromUrl(imageUrl) {
  if (!imageUrl) return null;
  
  try {
    console.log(`📸 Uploading image: ${imageUrl}`);
    const upload = await wixFetch("/media/v1/uploads/url", {
      method: "POST",
      body: JSON.stringify({
        uploadUrl: imageUrl,
        mediaType: "IMAGE"
      })
    });
    
    const mediaId = upload?.uploadedItems?.[0]?.mediaId;
    if (mediaId) {
      console.log(`✅ Image uploaded: ${mediaId}`);
      return mediaId;
    }
    return null;
  } catch (error) {
    console.warn(`⚠️ Image upload failed: ${error.message}`);
    return null;
  }
}

/**
 * Find existing program by slug
 */
export async function findProgramBySlug(slug) {
  const query = await wixFetch("/cms/v1/data-collections/programs/data-items/query", {
    method: "POST",
    body: JSON.stringify({
      query: {
        filter: { "data.slug": slug },
        paging: { offset: 0, limit: 1 }
      }
    })
  });
  
  return query?.dataItems?.[0] || null;
}

/**
 * Create or update a training program in Wix CMS
 * @param {Object} item - Program data
 * @param {string} item.slug - Unique identifier for the program
 * @param {string} item.title - Program title
 * @param {string} item.summary - Short description
 * @param {string} item.content - Full HTML content
 * @param {string} item.ctaText - Call-to-action button text
 * @param {string} item.ctaUrl - Call-to-action URL
 * @param {string} item.embedHtml - HTML embed code (Calendly, YouTube, etc.)
 * @param {string} item.heroImageUrl - Hero image URL
 */
export async function upsertProgram(item) {
  console.log(`🔄 Upserting program: ${item.slug}`);
  
  // Upload hero image if provided
  let heroRef = null;
  if (item.heroImageUrl) {
    const mediaId = await uploadImageFromUrl(item.heroImageUrl);
    if (mediaId) {
      heroRef = { mediaId };
    }
  }

  // Check if program already exists
  const existing = await findProgramBySlug(item.slug);

  // Prepare data object
  const data = {
    title: item.title || "Untitled Program",
    slug: item.slug,
    summary: item.summary || "",
    content: item.content || "",
    ctaText: item.ctaText || "Learn More",
    ctaUrl: item.ctaUrl || "",
    embedHtml: item.embedHtml || "",
    ...(heroRef ? { heroImage: heroRef } : {})
  };

  if (existing) {
    // Update existing program
    console.log(`📝 Updating existing program: ${item.slug}`);
    const id = existing._id;
    return wixFetch(`/cms/v1/data-collections/programs/data-items/${id}`, {
      method: "PUT",
      body: JSON.stringify({ dataItem: { _id: id, data } })
    });
  } else {
    // Create new program
    console.log(`✨ Creating new program: ${item.slug}`);
    return wixFetch(`/cms/v1/data-collections/programs/data-items`, {
      method: "POST",
      body: JSON.stringify({ dataItem: { data } })
    });
  }
}

/**
 * Delete program by slug
 */
export async function deleteBySlug(slug) {
  console.log(`🗑️ Deleting program: ${slug}`);
  
  const item = await findProgramBySlug(slug);
  if (!item) {
    console.log(`❌ Program not found: ${slug}`);
    return false;
  }
  
  await wixFetch(`/cms/v1/data-collections/programs/data-items/${item._id}`, { 
    method: "DELETE" 
  });
  
  console.log(`✅ Deleted program: ${slug}`);
  return true;
}

/**
 * Test API connection
 */
export async function testConnection() {
  try {
    console.log("🧪 Testing Wix API connection...");
    
    // Test basic API access
    const collections = await wixFetch("/cms/v1/data-collections");
    console.log(`✅ API connection successful`);
    console.log(`📊 Found ${collections.dataCollections?.length || 0} collections`);
    
    // Check if programs collection exists
    const programsCollection = collections.dataCollections?.find(
      c => c.id === "programs"
    );
    
    if (programsCollection) {
      console.log("✅ Programs collection found");
    } else {
      console.log("⚠️ Programs collection not found - you need to create it in Wix");
    }
    
    return true;
  } catch (error) {
    console.error("❌ API connection failed:", error.message);
    return false;
  }
}

/**
 * List all programs
 */
export async function listPrograms() {
  const query = await wixFetch("/cms/v1/data-collections/programs/data-items/query", {
    method: "POST",
    body: JSON.stringify({
      query: {
        paging: { offset: 0, limit: 100 }
      }
    })
  });
  
  return query?.dataItems || [];
}