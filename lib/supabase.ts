import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
} else {
  console.log('Supabase initialized with URL:', supabaseUrl);
}

// ── Client-side Instance ───────────────────────────────────
// We guard this to prevent build-time crashes if environment variables are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; 

/**
 * ── Server-side / Middleware Client Creator ────────────────
 * Note: If using @supabase/ssr, this would use createServerClient.
 * For now, we provide a standard client that can be used in 
 * server contexts with appropriate env vars.
 */
export const createBasiraClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};
