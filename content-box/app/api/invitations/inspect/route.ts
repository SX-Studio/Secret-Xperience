import { createAdminClient } from '@/lib/supabase/admin';
import { hashInviteToken } from '@/lib/invitations';

// Minimal, unauthenticated preview of an invitation (the token IS the secret).
// Returns only what the accept screen needs — never the target phone.
export async function POST(req: Request) {
  const body = (await req.json()) as { token?: string };
  if (!body?.token) return Response.json({ valid: false });

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from('invitations')
    .select('role, status, expires_at, box_id')
    .eq('token_hash', hashInviteToken(body.token))
    .maybeSingle();

  if (!invite) return Response.json({ valid: false });

  const expired = new Date(invite.expires_at) < new Date();
  const open = invite.status === 'pending' && !expired;

  let boxName: string | null = null;
  if (open) {
    const { data: box } = await admin
      .from('boxes')
      .select('name')
      .eq('id', invite.box_id)
      .maybeSingle();
    boxName = box?.name ?? null;
  }

  return Response.json({
    valid: open,
    status: expired ? 'expired' : invite.status,
    role: invite.role,
    boxName,
  });
}
