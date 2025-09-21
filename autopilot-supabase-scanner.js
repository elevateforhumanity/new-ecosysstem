#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔍 AUTOPILOT: Scanning both Supabase projects...\n');

// Project 1: cuxzzpsyufcewtmicszk (from src files)
const project1 = {
  url: 'https://cuxzzpsyufcewtmicszk.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA'
};

// Project 2: kkzbqkyuunahdxcfdfzv (from platform files)
const project2 = {
  url: 'https://kkzbqkyuunahdxcfdfzv.supabase.co',
  key: 'need_to_find_key'
};

async function scanProject(project, name) {
  console.log(`📊 Testing ${name}:`);
  console.log(`   URL: ${project.url}`);
  
  if (project.key === 'need_to_find_key') {
    console.log('   ❌ Missing API key\n');
    return null;
  }
  
  try {
    const supabase = createClient(project.url, project.key);
    
    // Test connection
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*');
    
    if (programsError) {
      console.log(`   ❌ Programs table: ${programsError.message}`);
    } else {
      console.log(`   ✅ Programs table: ${programs?.length || 0} records`);
    }
    
    // Test other tables
    const tables = ['app_users', 'profiles', 'enrollments', 'assessments'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count');
        if (error) {
          results[table] = `❌ ${error.message}`;
        } else {
          results[table] = `✅ accessible`;
        }
      } catch (err) {
        results[table] = `❌ ${err.message}`;
      }
    }
    
    console.log('   Tables:');
    Object.entries(results).forEach(([table, status]) => {
      console.log(`     ${table}: ${status}`);
    });
    
    console.log('');
    return { url: project.url, key: project.key, programs: programs?.length || 0 };
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}\n`);
    return null;
  }
}

async function findBestProject() {
  const result1 = await scanProject(project1, 'Project 1 (cuxzzpsyufcewtmicszk)');
  const result2 = await scanProject(project2, 'Project 2 (kkzbqkyuunahdxcfdfzv)');
  
  console.log('🎯 AUTOPILOT DECISION:');
  
  if (result1 && result1.programs > 0) {
    console.log('✅ Using Project 1 (cuxzzpsyufcewtmicszk) - has data');
    return result1;
  } else if (result2 && result2.programs > 0) {
    console.log('✅ Using Project 2 (kkzbqkyuunahdxcfdfzv) - has data');
    return result2;
  } else if (result1) {
    console.log('✅ Using Project 1 (cuxzzpsyufcewtmicszk) - working connection');
    return result1;
  } else {
    console.log('❌ No working Supabase project found');
    return null;
  }
}

findBestProject().then(best => {
  if (best) {
    console.log('\n🚀 AUTOPILOT: Proceeding with Supabase setup...');
  } else {
    console.log('\n🔧 AUTOPILOT: Need to fix Supabase configuration first');
  }
});