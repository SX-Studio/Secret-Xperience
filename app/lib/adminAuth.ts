/**
 * Admin gate for API routes: session via the SSR cookie client, then
 * profiles.role must be 'admin'. Returns a service-role client for the handler.
 * Mirrors the inline checks in app/api/admin/*.
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type AdminCtx = { userId: string; admin: SupabaseClient }

export async function requireAdmin(): Promise<AdminCtx | { error: 401 | 403 }> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 401 }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: profile } = await admin.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
  if (profile?.role !== 'admin') return { error: 403 }
  return { userId: session.user.id, admin }
}
