#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const outputDir = process.env.OUTPUT_DIR || '.autopilot_out';
const outputFile = path.join(outputDir, 'candidates.csv');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check if Supabase is configured
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error(chalk.red('❌ Supabase not configured'));
  console.log(chalk.yellow('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env'));
  console.log(chalk.gray('   Or use local mock data for testing\n'));
  
  // Generate mock data for testing
  generateMockCSV();
  process.exit(0);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateMockCSV() {
  const spinner = ora('Generating mock candidate data...').start();
  
  const mockCandidates = [
    {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-0101',
      position: 'Full-Stack Developer',
      source: 'LinkedIn',
      status: 'interview',
      stage: 'technical',
      overall_score: 85,
      created_at: '2025-01-10',
      notes: 'Strong React skills, good communication',
    },
    {
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-0102',
      position: 'DevOps Engineer',
      source: 'Indeed',
      status: 'screening',
      stage: 'phone_screen',
      overall_score: 78,
      created_at: '2025-01-12',
      notes: 'AWS certified, 5 years experience',
    },
    {
      full_name: 'Mike Johnson',
      email: 'mike.j@example.com',
      phone: '555-0103',
      position: 'Product Manager',
      source: 'Referral',
      status: 'offer',
      stage: 'offer',
      overall_score: 92,
      created_at: '2025-01-08',
      notes: 'Excellent product sense, strong leadership',
    },
    {
      full_name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      phone: '555-0104',
      position: 'UX/UI Designer',
      source: 'Direct',
      status: 'new',
      stage: 'application',
      overall_score: null,
      created_at: '2025-01-15',
      notes: 'Portfolio looks promising',
    },
  ];
  
  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Position',
    'Source',
    'Status',
    'Stage',
    'Score',
    'Applied Date',
    'Notes',
  ];
  
  const rows = mockCandidates.map(c => [
    escapeCSV(c.full_name),
    escapeCSV(c.email),
    escapeCSV(c.phone),
    escapeCSV(c.position),
    escapeCSV(c.source),
    escapeCSV(c.status),
    escapeCSV(c.stage),
    escapeCSV(c.overall_score),
    escapeCSV(c.created_at),
    escapeCSV(c.notes),
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  fs.writeFileSync(outputFile, csv, 'utf8');
  
  spinner.succeed(chalk.green(`Exported ${mockCandidates.length} mock candidates`));
  console.log(chalk.cyan('\n📁 Output file:'), outputFile);
  console.log(chalk.gray('   (This is mock data for testing)\n'));
}

async function exportCandidates() {
  const spinner = ora('Fetching candidates from Supabase...').start();
  
  try {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!candidates || candidates.length === 0) {
      spinner.warn(chalk.yellow('No candidates found in database'));
      console.log(chalk.gray('   Generating mock data instead...\n'));
      generateMockCSV();
      return;
    }
    
    spinner.text = `Processing ${candidates.length} candidates...`;
    
    // CSV headers
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Position',
      'Source',
      'Status',
      'Stage',
      'Technical Score',
      'Culture Fit Score',
      'Overall Score',
      'LinkedIn',
      'GitHub',
      'Applied Date',
      'Last Updated',
      'Notes',
    ];
    
    // Convert candidates to CSV rows
    const rows = candidates.map(c => [
      escapeCSV(c.id),
      escapeCSV(c.full_name),
      escapeCSV(c.email),
      escapeCSV(c.phone),
      escapeCSV(c.position),
      escapeCSV(c.source),
      escapeCSV(c.status),
      escapeCSV(c.stage),
      escapeCSV(c.technical_score),
      escapeCSV(c.culture_fit_score),
      escapeCSV(c.overall_score),
      escapeCSV(c.linkedin_url),
      escapeCSV(c.github_url),
      escapeCSV(c.created_at),
      escapeCSV(c.updated_at),
      escapeCSV(c.notes),
    ]);
    
    // Generate CSV content
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Write to file
    fs.writeFileSync(outputFile, csv, 'utf8');
    
    spinner.succeed(chalk.green(`Exported ${candidates.length} candidates`));
    
    console.log(chalk.cyan('\n📁 Output file:'), outputFile);
    console.log(chalk.gray('\nYou can now:'));
    console.log(chalk.gray('  • Open in Excel or Google Sheets'));
    console.log(chalk.gray('  • Import into your ATS'));
    console.log(chalk.gray('  • Share with hiring team\n'));
    
    // Generate summary statistics
    const statusCounts = candidates.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(chalk.cyan('Summary:'));
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(chalk.gray(`  ${status}: ${count}`));
    });
    console.log('');
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to export candidates'));
    console.error(chalk.red('\nError:'), error.message);
    
    if (error.message.includes('relation "candidates" does not exist')) {
      console.log(chalk.yellow('\n⚠️  The candidates table doesn\'t exist yet.'));
      console.log(chalk.gray('   Run the Supabase migration first:'));
      console.log(chalk.gray('   supabase/migrations/012_hiring_automation.sql\n'));
    }
    
    process.exit(1);
  }
}

// Run the export
exportCandidates();
