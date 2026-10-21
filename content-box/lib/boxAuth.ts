import { createAdminClient } from '@/lib/supabase/admin';

// Server-side check: may this profile administer this box?
// True for platform admins and for active box_admin members of the box.
export async function canAdminBox(
  profileId: string,
  boxId: string,
  isPlatformAdmin: boolean,
): Promise<boolean> {
  if (isPlatformAdmin) return true;
  const admin = createAdminClient();
  const { data } = await admin
    .from('box_members')
    .select('id')
    .eq('box_id', boxId)
    .eq('profile_id', profileId)
    .eq('role', 'box_admin')
    .eq('status', 'active')
    .maybeSingle();
  return Boolean(data);
}
