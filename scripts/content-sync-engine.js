// scripts/content-sync-engine.js
// Advanced content synchronization between Supabase, Wix, and static sites

import { createClient } from '@supabase/supabase-js';
import { upsertProgram, listPrograms } from './wix-client.js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * SMART SLUG GENERATOR
 * Generates SEO-friendly slugs and handles duplicates
 */
export function generateSlug(title, existingSlugs = []) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * BULK EMBED PROCESSOR
 * Processes and validates embed codes for various platforms
 */
export function processEmbedCode(embedHtml, platform = 'auto') {
  if (!embedHtml) return '';
  
  // Auto-detect platform
  if (platform === 'auto') {
    if (embedHtml.includes('calendly.com')) platform = 'calendly';
    else if (embedHtml.includes('youtube.com') || embedHtml.includes('youtu.be')) platform = 'youtube';
    else if (embedHtml.includes('forms.gle') || embedHtml.includes('docs.google.com/forms')) platform = 'google-forms';
    else if (embedHtml.includes('typeform.com')) platform = 'typeform';
  }
  
  // Platform-specific processing
  switch (platform) {
    case 'calendly':
      return processCalendlyEmbed(embedHtml);
    case 'youtube':
      return processYouTubeEmbed(embedHtml);
    case 'google-forms':
      return processGoogleFormsEmbed(embedHtml);
    case 'typeform':
      return processTypeformEmbed(embedHtml);
    default:
      return sanitizeGenericEmbed(embedHtml);
  }
}

function processCalendlyEmbed(embedHtml) {
  // Ensure responsive Calendly embed
  const calendlyMatch = embedHtml.match(/src="([^"]*calendly[^"]*)"/);
  if (calendlyMatch) {
    const src = calendlyMatch[1];
    return `<iframe src="${src}" width="100%" height="700" frameborder="0" style="border-radius: 8px; min-height: 700px;"></iframe>`;
  }
  return embedHtml;
}

function processYouTubeEmbed(embedHtml) {
  // Extract video ID and create responsive embed
  const youtubeMatch = embedHtml.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
      <iframe src="https://www.youtube.com/embed/${videoId}" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;" 
              frameborder="0" allowfullscreen loading="lazy"></iframe>
    </div>`;
  }
  return embedHtml;
}

function processGoogleFormsEmbed(embedHtml) {
  // Ensure responsive Google Forms embed
  const formsMatch = embedHtml.match(/src="([^"]*forms\.gle[^"]*)"/);
  if (formsMatch) {
    const src = formsMatch[1];
    return `<iframe src="${src}" width="100%" height="800" frameborder="0" style="border-radius: 8px;"></iframe>`;
  }
  return embedHtml;
}

function processTypeformEmbed(embedHtml) {
  // Process Typeform embeds
  const typeformMatch = embedHtml.match(/src="([^"]*typeform[^"]*)"/);
  if (typeformMatch) {
    const src = typeformMatch[1];
    return `<iframe src="${src}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`;
  }
  return embedHtml;
}

function sanitizeGenericEmbed(embedHtml) {
  // Basic sanitization for generic embeds
  return embedHtml
    .replace(/style="[^"]*"/g, 'style="border-radius: 8px; max-width: 100%;"')
    .replace(/width="\d+"/g, 'width="100%"');
}

/**
 * SUPABASE TO WIX SYNC ENGINE
 * Intelligent sync with conflict resolution and change detection
 */
export async function syncSupabaseToWix(options = {}) {
  const {
    dryRun = false,
    forceUpdate = false,
    batchSize = 10
  } = options;
  
  console.log(`🔄 Starting Supabase → Wix sync (${dryRun ? 'DRY RUN' : 'LIVE'})`);
  
  try {
    // Fetch programs from Supabase
    const { data: supabasePrograms, error } = await supabase
      .from('programs')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      throw new Error(`Supabase fetch failed: ${error.message}`);
    }
    
    console.log(`📊 Found ${supabasePrograms.length} programs in Supabase`);
    
    // Fetch existing programs from Wix
    const wixPrograms = await listPrograms();
    const wixProgramsMap = new Map(
      wixPrograms.map(p => [p.data.slug, p])
    );
    
    console.log(`📊 Found ${wixPrograms.length} programs in Wix`);
    
    // Process programs in batches
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    
    for (let i = 0; i < supabasePrograms.length; i += batchSize) {
      const batch = supabasePrograms.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(supabasePrograms.length / batchSize)}`);
      
      for (const program of batch) {
        try {
          const result = await syncSingleProgram(program, wixProgramsMap, { dryRun, forceUpdate });
          results[result.action]++;
          results.details.push(result);
          
          if (!dryRun && result.action !== 'skipped') {
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (error) {
          console.error(`❌ Failed to sync ${program.slug}:`, error.message);
          results.errors++;
          results.details.push({
            slug: program.slug,
            action: 'error',
            error: error.message
          });
        }
      }
    }
    
    // Summary
    console.log(`\n📊 Sync Summary:`);
    console.log(`   Created: ${results.created}`);
    console.log(`   Updated: ${results.updated}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Errors: ${results.errors}`);
    
    return results;
    
  } catch (error) {
    console.error("💥 Sync failed:", error.message);
    throw error;
  }
}

async function syncSingleProgram(supabaseProgram, wixProgramsMap, options) {
  const { dryRun, forceUpdate } = options;
  const existingWixProgram = wixProgramsMap.get(supabaseProgram.slug);
  
  // Generate slug if missing
  if (!supabaseProgram.slug) {
    const existingSlugs = Array.from(wixProgramsMap.keys());
    supabaseProgram.slug = generateSlug(supabaseProgram.title, existingSlugs);
  }
  
  // Process embed code
  const processedEmbedHtml = processEmbedCode(supabaseProgram.embed_html);
  
  // Prepare program data for Wix
  const wixProgramData = {
    slug: supabaseProgram.slug,
    title: supabaseProgram.title,
    summary: supabaseProgram.summary || '',
    content: supabaseProgram.content || '',
    ctaText: supabaseProgram.cta_text || 'Learn More',
    ctaUrl: supabaseProgram.cta_url || '',
    embedHtml: processedEmbedHtml,
    heroImageUrl: supabaseProgram.hero_image_url || ''
  };
  
  // Determine action needed
  if (!existingWixProgram) {
    // Create new program
    console.log(`✨ Creating new program: ${supabaseProgram.slug}`);
    
    if (!dryRun) {
      await upsertProgram(wixProgramData);
    }
    
    return {
      slug: supabaseProgram.slug,
      action: 'created',
      title: supabaseProgram.title
    };
    
  } else {
    // Check if update is needed
    const needsUpdate = forceUpdate || hasChanges(supabaseProgram, existingWixProgram.data);
    
    if (needsUpdate) {
      console.log(`📝 Updating program: ${supabaseProgram.slug}`);
      
      if (!dryRun) {
        await upsertProgram(wixProgramData);
      }
      
      return {
        slug: supabaseProgram.slug,
        action: 'updated',
        title: supabaseProgram.title
      };
      
    } else {
      console.log(`⏭️ Skipping unchanged program: ${supabaseProgram.slug}`);
      
      return {
        slug: supabaseProgram.slug,
        action: 'skipped',
        title: supabaseProgram.title
      };
    }
  }
}

function hasChanges(supabaseProgram, wixProgram) {
  const fields = ['title', 'summary', 'content', 'cta_text', 'cta_url'];
  
  for (const field of fields) {
    const supabaseValue = supabaseProgram[field] || '';
    const wixField = field === 'cta_text' ? 'ctaText' : field === 'cta_url' ? 'ctaUrl' : field;
    const wixValue = wixProgram[wixField] || '';
    
    if (supabaseValue !== wixValue) {
      return true;
    }
  }
  
  return false;
}

/**
 * REVERSE SYNC: WIX TO SUPABASE
 * Sync changes made in Wix back to Supabase
 */
export async function syncWixToSupabase() {
  console.log("🔄 Starting Wix → Supabase reverse sync...");
  
  try {
    const wixPrograms = await listPrograms();
    const results = { updated: 0, created: 0, errors: 0 };
    
    for (const wixProgram of wixPrograms) {
      try {
        const data = wixProgram.data;
        
        // Check if program exists in Supabase
        const { data: existing, error } = await supabase
          .from('programs')
          .select('*')
          .eq('slug', data.slug)
          .single();
        
        const programData = {
          slug: data.slug,
          title: data.title,
          summary: data.summary || '',
          content: data.content || '',
          cta_text: data.ctaText || 'Learn More',
          cta_url: data.ctaUrl || '',
          embed_html: data.embedHtml || '',
          hero_image_url: data.heroImage?.url || '',
          updated_at: new Date().toISOString()
        };
        
        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from('programs')
            .update(programData)
            .eq('slug', data.slug);
          
          if (updateError) throw updateError;
          results.updated++;
          console.log(`📝 Updated in Supabase: ${data.slug}`);
          
        } else {
          // Create new
          const { error: insertError } = await supabase
            .from('programs')
            .insert(programData);
          
          if (insertError) throw insertError;
          results.created++;
          console.log(`✨ Created in Supabase: ${data.slug}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to sync ${wixProgram.data.slug} to Supabase:`, error.message);
        results.errors++;
      }
    }
    
    console.log(`📊 Reverse sync complete: ${results.created} created, ${results.updated} updated, ${results.errors} errors`);
    return results;
    
  } catch (error) {
    console.error("💥 Reverse sync failed:", error.message);
    throw error;
  }
}

/**
 * SLUG AUDIT AND CLEANUP
 * Finds and fixes duplicate slugs, generates missing slugs
 */
export async function auditAndFixSlugs() {
  console.log("🔍 Starting slug audit...");
  
  try {
    // Get all programs from Supabase
    const { data: programs, error } = await supabase
      .from('programs')
      .select('id, title, slug');
    
    if (error) throw error;
    
    const slugCounts = new Map();
    const duplicates = [];
    const missingSlugs = [];
    
    // Find duplicates and missing slugs
    for (const program of programs) {
      if (!program.slug) {
        missingSlugs.push(program);
      } else {
        const count = slugCounts.get(program.slug) || 0;
        slugCounts.set(program.slug, count + 1);
        
        if (count > 0) {
          duplicates.push(program);
        }
      }
    }
    
    console.log(`📊 Audit results:`);
    console.log(`   Missing slugs: ${missingSlugs.length}`);
    console.log(`   Duplicate slugs: ${duplicates.length}`);
    
    // Fix missing slugs
    const allSlugs = Array.from(slugCounts.keys());
    
    for (const program of missingSlugs) {
      const newSlug = generateSlug(program.title, allSlugs);
      allSlugs.push(newSlug);
      
      const { error: updateError } = await supabase
        .from('programs')
        .update({ slug: newSlug })
        .eq('id', program.id);
      
      if (updateError) {
        console.error(`❌ Failed to update slug for ${program.title}:`, updateError.message);
      } else {
        console.log(`✅ Generated slug for "${program.title}": ${newSlug}`);
      }
    }
    
    // Fix duplicate slugs
    for (const program of duplicates) {
      const newSlug = generateSlug(program.title, allSlugs);
      allSlugs.push(newSlug);
      
      const { error: updateError } = await supabase
        .from('programs')
        .update({ slug: newSlug })
        .eq('id', program.id);
      
      if (updateError) {
        console.error(`❌ Failed to fix duplicate slug for ${program.title}:`, updateError.message);
      } else {
        console.log(`✅ Fixed duplicate slug for "${program.title}": ${program.slug} → ${newSlug}`);
      }
    }
    
    return {
      missingSlugs: missingSlugs.length,
      duplicates: duplicates.length,
      fixed: missingSlugs.length + duplicates.length
    };
    
  } catch (error) {
    console.error("💥 Slug audit failed:", error.message);
    throw error;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const options = {};
  
  // Parse CLI options
  if (process.argv.includes('--dry-run')) options.dryRun = true;
  if (process.argv.includes('--force')) options.forceUpdate = true;
  
  switch (command) {
    case 'sync':
      await syncSupabaseToWix(options);
      break;
    case 'reverse-sync':
      await syncWixToSupabase();
      break;
    case 'audit-slugs':
      await auditAndFixSlugs();
      break;
    case 'test-embed':
      const testEmbed = process.argv[3];
      if (testEmbed) {
        console.log("Original:", testEmbed);
        console.log("Processed:", processEmbedCode(testEmbed));
      } else {
        console.log("Usage: node content-sync-engine.js test-embed '<embed-code>'");
      }
      break;
    default:
      console.log("Usage: node content-sync-engine.js [sync|reverse-sync|audit-slugs|test-embed] [--dry-run] [--force]");
  }
}