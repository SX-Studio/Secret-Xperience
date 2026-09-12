import { randomUUID } from 'node:crypto';
import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

// Creator requests a payout of their available creator-wallet balance.
// Threshold (€50 / 5000 tokens) is enforced in the DB function.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { idempotencyKey?: string };
  const idem = body.idempotencyKey || randomUUID();

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('request_payout', {
    p_creator: profile.id,
    p_idem: idem,
  });
  if (error) {
    const status = error.message.includes('below_threshold') ? 422 : 400;
    return new Response(error.message, { status });
  }

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'payout.request',
    targetType: 'payout',
    targetId: (data as { id: string }).id,
    result: 'requested',
  });

  return Response.json({ ok: true, payout: data });
}
