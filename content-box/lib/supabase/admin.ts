import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client — SERVICE ROLE. Server-only, bypasses RLS.
// NEVER import this into client components. Hardened per the SX pattern:
// no token auto-refresh, no session persistence.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
