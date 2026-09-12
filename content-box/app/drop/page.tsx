import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/session';
import DropForm, { type DropBox } from './DropForm';

export const dynamic = 'force-dynamic';

export default async function DropPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/drop');

  const supabase = await createClient();

  const { data: kycRow } = await supabase
    .from('kyc_verifications')
    .select('status')
    .eq('profile_id', profile.id)
    .maybeSingle();
  const kyc = (kycRow?.status ?? 'none') as 'none' | 'pending' | 'verified' | 'rejected';

  const { data: memberships } = await supabase
    .from('box_members')
    .select('role, box:boxes(id, name, public_code)')
    .in('role', ['creator', 'box_admin'])
    .eq('status', 'active');

  const boxes: DropBox[] = (memberships ?? [])
    .map((m) => {
      const b = m.box as DropBox | DropBox[] | null;
      return Array.isArray(b) ? b[0] ?? null : b;
    })
    .filter((b): b is DropBox => Boolean(b));

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '40px 20px' }}>
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ember)' }}
      >
        Drop content · {profile.public_code}
      </div>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, margin: '.2em 0 1em' }}>
        Drop
      </h1>
      <DropForm kyc={kyc} boxes={boxes} />
    </main>
  );
}
