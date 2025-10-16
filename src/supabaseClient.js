import { createClient } from '@supabase/supabase-js';

// Hardcoded values for now - will work without environment variables
const supabaseUrl = 'https://cuxzzpsyufcewtmicszk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection and log status
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    console.log('   URL:', supabaseUrl);
    console.log('   Key valid:', supabaseKey ? 'Yes' : 'No');
    
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      console.error('Error details:', error.message, error.code);
      return false;
    }
    
    console.log('✅ Supabase Integration Active!');
    console.log('   Programs found:', data?.length || 0);
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    console.error('Error type:', err.name);
    console.error('Error message:', err.message);
    return false;
  }
};