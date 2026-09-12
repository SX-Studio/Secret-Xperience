import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

// Platform admin verifies or rejects a creator's KYC.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });
  if (profile.role !== 'platform_admin') return new Response('Forbidden', { status: 403 });

  const body = (await req.json()) as { profileId?: string; decision?: 'verify' | 'reject' };
  if (!body?.profileId || (body.decision !== 'verify' && body.decision !== 'reject')) {
    return new Response('Bad request', { status: 400 });
  }

  const admin = createAdminClient();
  const status = body.decision === 'verify' ? 'verified' : 'rejected';
  const { error } = await admin
    .from('kyc_verifications')
    .update({ status, verified_at: status === 'verified' ? new Date().toISOString() : null })
    .eq('profile_id', body.profileId);
  if (error) return new Response('Update failed', { status: 500 });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'kyc.decision',
    targetType: 'profile',
    targetId: body.profileId,
    result: status,
  });

  return Response.json({ ok: true, status });
}
