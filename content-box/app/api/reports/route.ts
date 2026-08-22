import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

const TARGETS = new Set(['content', 'profile', 'box']);
const REASONS = new Set(['csam', 'nonconsensual', 'illegal', 'stolen', 'impersonation', 'spam', 'other']);
const URGENT = new Set(['csam', 'nonconsensual', 'illegal']);

// File a report. Authenticated users only for MVP (a public form can be added).
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as {
    targetType?: string;
    targetId?: string;
    reason?: string;
    details?: string;
  };
  if (!body?.targetType || !TARGETS.has(body.targetType)) return new Response('Bad target', { status: 400 });
  if (!body?.targetId) return new Response('Missing target', { status: 400 });
  if (!body?.reason || !REASONS.has(body.reason)) return new Response('Bad reason', { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('reports')
    .insert({
      reporter_id: profile.id,
      target_type: body.targetType,
      target_id: body.targetId,
      reason: body.reason,
      details: body.details?.slice(0, 2000) ?? null,
      urgent: URGENT.has(body.reason),
    })
    .select('id')
    .single();
  if (error) return new Response('Report failed', { status: 500 });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'report.file',
    targetType: body.targetType,
    targetId: body.targetId,
    result: 'open',
    meta: { reason: body.reason },
  });

  return Response.json({ ok: true, id: data.id });
}
