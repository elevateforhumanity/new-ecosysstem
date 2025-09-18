#!/usr/bin/env node

/**
 * Test Supabase Connection with Provided Credentials
 */

import { createClient } from '@supabase/supabase-js';

// Your actual Supabase credentials
const SUPABASE_URL = 'https://kkzbqkyuunahdxcfdfzv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtremJxa3l1dW5haGR4Y2ZkZnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI1NzQsImV4cCI6MjA1MDU0ODU3NH0.Ey8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

console.log('🔗 Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "_supabase_migrations" does not exist')) {
        console.log('✅ Connection successful! (Database is empty - this is normal for new projects)');
        return true;
      } else {
        console.error('❌ Connection error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Connection successful!');
    console.log('Migration data:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Test the connection
testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase is ready for deployment!');
    process.exit(0);
  } else {
    console.log('💥 Please check your Supabase credentials');
    process.exit(1);
  }
});