import { createClient } from '@/lib/supabase/server';
import type { Profile, Role } from '@/lib/roles';

// Server-side session helpers. The profile row (with role) is the source of
// truth for authorization; never trust a role passed from the client.

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, public_code, role, status, display_name, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}

export async function requireRole(...allowed: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) throw new Error('unauthenticated');
  if (profile.status !== 'active') throw new Error('account not active');
  if (!allowed.includes(profile.role)) throw new Error('forbidden');
  return profile;
}
