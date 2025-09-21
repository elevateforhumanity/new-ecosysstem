import fs from "fs";
import path from "path";

const DIST = "dist";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET) {
  console.warn("⚠️  STRIPE_SECRET_KEY not set - skipping Stripe verification");
  process.exit(0);
}

// Import Stripe dynamically to handle missing dependency gracefully
let stripe;
try {
  const Stripe = await import('stripe');
  stripe = new Stripe.default(STRIPE_SECRET);
} catch (error) {
  console.warn("⚠️  Stripe package not installed - skipping Stripe verification");
  console.warn("   Run: npm install stripe");
  process.exit(0);
}

let errors = [];
let priceIds = new Set();
let productIds = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.isFile() && p.endsWith(".html")) extractStripeIds(p);
  }
}

function extractStripeIds(file) {
  const html = fs.readFileSync(file, "utf-8");
  
  // Look for Stripe price IDs (price_xxxxx)
  const priceMatches = html.match(/price_[a-zA-Z0-9]+/g) || [];
  priceMatches.forEach(id => priceIds.add(id));
  
  // Look for Stripe product IDs (prod_xxxxx)
  const productMatches = html.match(/prod_[a-zA-Z0-9]+/g) || [];
  productMatches.forEach(id => productIds.add(id));
  
  // Look for data attributes
  const dataPrice = html.match(/data-price-id\s*=\s*["']([^"']+)["']/gi) || [];
  dataPrice.forEach(match => {
    const id = match.match(/["']([^"']+)["']/)[1];
    if (id.startsWith('price_')) priceIds.add(id);
  });
  
  const dataProduct = html.match(/data-product-id\s*=\s*["']([^"']+)["']/gi) || [];
  dataProduct.forEach(match => {
    const id = match.match(/["']([^"']+)["']/)[1];
    if (id.startsWith('prod_')) productIds.add(id);
  });
}

async function verifyStripeIds() {
  console.log(`🔍 Verifying ${priceIds.size} price IDs and ${productIds.size} product IDs...`);
  
  // Verify price IDs
  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log(`✅ Price ID valid: ${priceId} (${price.nickname || 'No nickname'})`);
    } catch (error) {
      errors.push(`❌ Invalid price ID: ${priceId} - ${error.message}`);
    }
  }
  
  // Verify product IDs
  for (const productId of productIds) {
    try {
      const product = await stripe.products.retrieve(productId);
      console.log(`✅ Product ID valid: ${productId} (${product.name})`);
    } catch (error) {
      errors.push(`❌ Invalid product ID: ${productId} - ${error.message}`);
    }
  }
}

if (!fs.existsSync(DIST)) {
  throw new Error("dist/ not found — build first.");
}

walk(DIST);

if (priceIds.size === 0 && productIds.size === 0) {
  console.log("ℹ️  No Stripe IDs found in HTML - skipping verification");
  process.exit(0);
}

try {
  await verifyStripeIds();
  
  if (errors.length > 0) {
    console.error(`\n❌ STRIPE VERIFICATION FAILED:`);
    errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }
  
  console.log(`\n✅ All Stripe IDs verified successfully`);
} catch (error) {
  console.error(`❌ Stripe verification failed: ${error.message}`);
  process.exit(1);
}