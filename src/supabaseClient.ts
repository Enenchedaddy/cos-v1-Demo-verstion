import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

// Clean flag to verify if real Supabase environment variables are loaded
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

export const supabase = createClient(
  supabaseUrl || 'https://your-placeholder-id.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // Supabase owns persisted session and refresh-token management. The COS
      // application never stores credentials or tokens itself.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
