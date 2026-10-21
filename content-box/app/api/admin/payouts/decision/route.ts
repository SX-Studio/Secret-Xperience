import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

// Platform admin pays (Paxum) or rejects (refund) a payout request.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });
  if (profile.role !== 'platform_admin') return new Response('Forbidden', { status: 403 });

  const body = (await req.json()) as {
    payoutId?: string;
    decision?: 'pay' | 'reject';
    providerRef?: string;
    reason?: string;
  };
  if (!body?.payoutId || (body.decision !== 'pay' && body.decision !== 'reject')) {
    return new Response('Bad request', { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('decide_payout', {
    p_payout: body.payoutId,
    p_decision: body.decision,
    p_admin: profile.id,
    p_provider_ref: body.providerRef ?? null,
    p_reason: body.reason ?? null,
  });
  if (error) return new Response(error.message, { status: 400 });

  // TODO(provider): on 'pay', trigger the actual Paxum transfer here.
  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: `payout.${body.decision}`,
    targetType: 'payout',
    targetId: body.payoutId,
    reason: body.reason ?? null,
    result: body.decision === 'pay' ? 'paid' : 'rejected',
  });

  return Response.json({ ok: true, payout: data });
}
