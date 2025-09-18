import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkzbqkyuunahdxcfdfzv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtremJxa3l1dW5haGR4Y2ZkZnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2ODQ3MzQsImV4cCI6MjA3MjI2MDczNH0.fZvYJMuC7v7y69PzpYQMe6isLA1Dui3EunF2aC2LCFU';

export const supabase = createClient(supabaseUrl, supabaseKey);