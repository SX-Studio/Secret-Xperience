import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAdminBox } from '@/lib/boxAuth';
import { writeAudit } from '@/lib/audit';

// Revoke a pending invitation. Box admins of the box, or platform admins.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as { invitationId?: number };
  if (!body?.invitationId) return new Response('Bad request', { status: 400 });

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from('invitations')
    .select('id, box_id, status')
    .eq('id', body.invitationId)
    .maybeSingle();
  if (!invite) return new Response('Not found', { status: 404 });

  const allowed = await canAdminBox(profile.id, invite.box_id, profile.role === 'platform_admin');
  if (!allowed) return new Response('Forbidden', { status: 403 });
  if (invite.status !== 'pending') return new Response('Not revocable', { status: 409 });

  await admin.from('invitations').update({ status: 'revoked' }).eq('id', invite.id);
  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'invitation.revoke',
    targetType: 'box',
    targetId: invite.box_id,
    result: 'ok',
  });

  return Response.json({ ok: true });
}
