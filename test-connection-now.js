#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Your working Supabase credentials
const SUPABASE_URL = 'https://cuxzzpsyufcewtmicszk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';

console.log('🔗 Testing Supabase connection with your credentials...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      
      if (error.message.includes('relation "programs" does not exist')) {
        console.log('✅ Connection works! Database just needs schema setup.');
        return true;
      }
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('✅ Programs table accessible');
    console.log('📊 Found', data?.length || 0, 'programs');
    return true;
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🚀 Supabase is ready! Building student portal...');
  } else {
    console.log('\n🔧 Need to fix connection first.');
  }
});