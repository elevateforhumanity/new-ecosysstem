import { createClient } from '@supabase/supabase-js';

// Unified configuration - works across all platforms
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://cuxzzpsyufcewtmicszk.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'elevate-for-humanity-web',
    },
  },
});

// Test connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    console.log('   URL:', supabaseUrl);

    const { data, error } = await supabase
      .from('programs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }

    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
};

// Export configuration info
export const config = {
  supabaseUrl,
  isConfigured: !!(supabaseUrl && supabaseKey),
};
