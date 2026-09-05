import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

// Create a box. Platform admins only. The creator is added as its box_admin.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });
  if (profile.role !== 'platform_admin') return new Response('Forbidden', { status: 403 });

  const body = (await req.json()) as { name?: string; commissionBps?: number };
  const name = (body?.name ?? '').trim();
  if (!name) return new Response('Name required', { status: 400 });

  const commissionBps =
    typeof body.commissionBps === 'number' && body.commissionBps >= 0 && body.commissionBps <= 10000
      ? Math.round(body.commissionBps)
      : 2000;

  const admin = createAdminClient();
  const { data: box, error } = await admin
    .from('boxes')
    .insert({ name, commission_bps: commissionBps, created_by: profile.id })
    .select('id, public_code, name, commission_bps')
    .single();
  if (error || !box) return new Response('Create failed', { status: 500 });

  const { error: memberErr } = await admin.from('box_members').insert({
    box_id: box.id,
    profile_id: profile.id,
    role: 'box_admin',
    invited_by: profile.id,
  });
  if (memberErr) return new Response('Member add failed', { status: 500 });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'box.create',
    targetType: 'box',
    targetId: box.public_code,
    result: 'ok',
  });

  return Response.json({ box });
}
