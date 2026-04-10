import { SUPABASE_CONFIG } from '@/constants/config';
import { createClient } from '@supabase/supabase-js';

console.log('🔷 Initializing Supabase with project:', SUPABASE_CONFIG.url);

let supabase;

try {
  supabase = createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );
  
  console.log('✅ Supabase initialized successfully');
} catch (error) {
  console.error('❌ Supabase initialization error:', error);
}

export { supabase };
export default supabase;