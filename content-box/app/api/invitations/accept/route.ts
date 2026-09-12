import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashInviteToken } from '@/lib/invitations';
import { normalizePhone } from '@/lib/phone';
import { writeAudit } from '@/lib/audit';

// Accept an invitation. The caller must be logged in, and their verified phone
// must match the invitation's target phone (invite is bound to the recipient).
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as { token?: string };
  if (!body?.token) return new Response('Bad request', { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userPhone = normalizePhone(user?.phone ?? '');

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from('invitations')
    .select('id, box_id, role, target_phone, status, expires_at, inviter_id')
    .eq('token_hash', hashInviteToken(body.token))
    .maybeSingle();

  if (!invite) return new Response('Invalid invitation', { status: 404 });
  if (invite.status !== 'pending') return new Response('Invitation not open', { status: 409 });
  if (new Date(invite.expires_at) < new Date()) {
    await admin.from('invitations').update({ status: 'expired' }).eq('id', invite.id);
    return new Response('Invitation expired', { status: 410 });
  }
  if (!userPhone || userPhone !== normalizePhone(invite.target_phone)) {
    return new Response('This invitation is for a different phone number', { status: 403 });
  }

  // Add (or reactivate) membership, then mark the invitation accepted.
  const { error: memberErr } = await admin
    .from('box_members')
    .upsert(
      {
        box_id: invite.box_id,
        profile_id: profile.id,
        role: invite.role,
        status: 'active',
        invited_by: invite.inviter_id,
      },
      { onConflict: 'box_id,profile_id' },
    );
  if (memberErr) return new Response('Join failed', { status: 500 });

  await admin
    .from('invitations')
    .update({ status: 'accepted', accepted_by: profile.id, accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'invitation.accept',
    targetType: 'box',
    targetId: invite.box_id,
    result: 'ok',
    meta: { role: invite.role },
  });

  return Response.json({ ok: true, boxId: invite.box_id, role: invite.role });
}
