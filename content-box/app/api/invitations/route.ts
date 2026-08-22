import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAdminBox } from '@/lib/boxAuth';
import { normalizePhone, looksLikePhone } from '@/lib/phone';
import { generateInviteToken, hashInviteToken, inviteUrl, INVITE_TTL_MS } from '@/lib/invitations';
import { writeAudit } from '@/lib/audit';

const INVITE_ROLES = new Set(['box_admin', 'creator', 'user']);

// Create an invitation for a box. Box admins (of that box) or platform admins.
// Returns the one-time invite URL; in production this is delivered by SMS.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as { boxId?: string; phone?: string; role?: string };
  const boxId = body?.boxId ?? '';
  const role = body?.role ?? '';
  if (!boxId || !INVITE_ROLES.has(role)) return new Response('Bad request', { status: 400 });
  if (!body?.phone || !looksLikePhone(body.phone)) return new Response('Invalid phone', { status: 400 });

  const allowed = await canAdminBox(profile.id, boxId, profile.role === 'platform_admin');
  if (!allowed) return new Response('Forbidden', { status: 403 });

  const admin = createAdminClient();
  const rawToken = generateInviteToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  const { data: invite, error } = await admin
    .from('invitations')
    .insert({
      box_id: boxId,
      inviter_id: profile.id,
      target_phone: normalizePhone(body.phone),
      role,
      token_hash: hashInviteToken(rawToken),
      expires_at: expiresAt,
    })
    .select('id')
    .single();
  if (error || !invite) return new Response('Create failed', { status: 500 });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'invitation.create',
    targetType: 'box',
    targetId: boxId,
    result: 'ok',
    meta: { role },
  });

  const url = inviteUrl(rawToken);
  // TODO(phase: SMS provider): send `url` to the target phone via SMS.
  console.log('[invitation] created', { boxId, role, url });

  return Response.json({ inviteUrl: url, expiresAt });
}
