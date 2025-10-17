import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://cuxzzpsyufcewtmicszk.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1eHp6cHN5dWZjZXd0bWljc3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNjEwNDcsImV4cCI6MjA3MzczNzA0N30.DyFtzoKha_tuhKiSIPoQlKonIpaoSYrlhzntCUvLUnA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection (only in development)
export const testSupabaseConnection = async () => {
  if (import.meta.env.DEV) {
    try {
      console.log('🔌 Testing Supabase connection...');

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Supabase connection error:', error.message);
        return false;
      }

      console.log('✅ Supabase connected');
      return true;
    } catch (err) {
      console.error('Supabase connection failed:', err.message);
      return false;
    }
  }
  return true;
};
