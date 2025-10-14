/**
 * LMS Identity Mapping CSV Import
 * 
 * Imports CSV files mapping LMS user IDs to Google emails
 * Format: lms_source,lms_user_id,google_email,full_name
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface IdentityRecord {
  lms_source: string;
  lms_user_id: string;
  google_email: string;
  full_name?: string;
}

/**
 * Parse CSV file into identity records
 */
export function parseIdentityCSV(csvContent: string): IdentityRecord[] {
  const lines = csvContent.trim().split('\n');
  const records: IdentityRecord[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 3) {
      console.error(`Skipping invalid line ${i + 1}: ${line}`);
      continue;
    }
    
    records.push({
      lms_source: parts[0],
      lms_user_id: parts[1],
      google_email: parts[2],
      full_name: parts[3] || undefined,
    });
  }
  
  return records;
}

/**
 * Validate identity records
 */
export function validateIdentityRecords(records: IdentityRecord[]): {
  valid: IdentityRecord[];
  invalid: Array<{ record: IdentityRecord; reason: string }>;
} {
  const valid: IdentityRecord[] = [];
  const invalid: Array<{ record: IdentityRecord; reason: string }> = [];
  
  for (const record of records) {
    // Validate lms_source
    if (!record.lms_source || record.lms_source.length === 0) {
      invalid.push({ record, reason: 'Missing lms_source' });
      continue;
    }
    
    // Validate lms_user_id
    if (!record.lms_user_id || record.lms_user_id.length === 0) {
      invalid.push({ record, reason: 'Missing lms_user_id' });
      continue;
    }
    
    // Validate google_email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!record.google_email || !emailRegex.test(record.google_email)) {
      invalid.push({ record, reason: 'Invalid google_email format' });
      continue;
    }
    
    valid.push(record);
  }
  
  return { valid, invalid };
}

/**
 * Import identity records to staging table
 */
export async function importIdentityRecords(
  records: IdentityRecord[]
): Promise<{ batchId: string; imported: number }> {
  // Generate batch ID
  const batchId = crypto.randomUUID();
  
  // Insert records with batch ID
  const recordsWithBatch = records.map(r => ({
    ...r,
    import_batch_id: batchId,
  }));
  
  const { data, error } = await supabase
    .from('lms_identity_import')
    .insert(recordsWithBatch)
    .select('id');
  
  if (error) {
    throw new Error(`Failed to import records: ${error.message}`);
  }
  
  return {
    batchId,
    imported: data?.length || 0,
  };
}

/**
 * Apply identity import batch
 */
export async function applyIdentityImport(
  batchId?: string
): Promise<{ imported: number; updated: number; skipped: number }> {
  const { data, error } = await supabase.rpc('apply_identity_import', {
    p_batch_id: batchId || null,
  });
  
  if (error) {
    throw new Error(`Failed to apply import: ${error.message}`);
  }
  
  return data[0] || { imported: 0, updated: 0, skipped: 0 };
}

/**
 * Get identity mapping summary
 */
export async function getIdentitySummary() {
  const { data, error } = await supabase
    .from('v_lms_identity_summary')
    .select('*');
  
  if (error) {
    throw new Error(`Failed to get summary: ${error.message}`);
  }
  
  return data;
}

/**
 * Get unapplied import batches
 */
export async function getUnappliedBatches() {
  const { data, error } = await supabase
    .from('lms_identity_import')
    .select('import_batch_id, lms_source, imported_at, COUNT(*) as record_count')
    .eq('applied', false)
    .order('imported_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get unapplied batches: ${error.message}`);
  }
  
  return data;
}

/**
 * CLI: Import CSV file
 */
export async function importCSVFile(filePath: string) {
  console.error('📂 Reading CSV file:', filePath);
  
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const records = parseIdentityCSV(csvContent);
  
  console.error(`📊 Parsed ${records.length} records`);
  
  // Validate
  const { valid, invalid } = validateIdentityRecords(records);
  
  if (invalid.length > 0) {
    console.error(`⚠️  ${invalid.length} invalid records:`);
    invalid.forEach(({ record, reason }) => {
      console.error(`  - ${record.lms_user_id}: ${reason}`);
    });
  }
  
  if (valid.length === 0) {
    console.error('❌ No valid records to import');
    return;
  }
  
  console.error(`✅ ${valid.length} valid records`);
  
  // Import to staging
  const { batchId, imported } = await importIdentityRecords(valid);
  console.error(`📥 Imported ${imported} records with batch ID: ${batchId}`);
  
  // Apply import
  console.error('🔄 Applying import...');
  const result = await applyIdentityImport(batchId);
  
  console.error('✅ Import complete:');
  console.error(`  - New mappings: ${result.imported}`);
  console.error(`  - Updated mappings: ${result.updated}`);
  console.error(`  - Skipped: ${result.skipped}`);
  
  // Show summary
  const summary = await getIdentitySummary();
  console.error('\n📊 Identity Mapping Summary:');
  summary.forEach((s: any) => {
    console.error(`  ${s.lms_source}: ${s.total_mappings} mappings (${s.unique_emails} unique emails)`);
  });
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npx tsx identity-import.ts <csv-file>');
    console.error('');
    console.error('CSV Format:');
    console.error('  lms_source,lms_user_id,google_email,full_name');
    console.error('  canvas,user123,student@school.edu,John Doe');
    console.error('  moodle,456,jane@school.edu,Jane Smith');
    process.exit(1);
  }
  
  const filePath = args[0];
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  importCSVFile(filePath)
    .then(() => {
      console.error('\n🎉 Identity import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import failed:', error.message);
      process.exit(1);
    });
}
