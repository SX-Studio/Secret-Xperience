import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

// Platform admin triages a report: "takedown" suspends the reported content;
// "dismiss" closes it. Content takedown also writes a moderation_event.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });
  if (profile.role !== 'platform_admin') return new Response('Forbidden', { status: 403 });

  const body = (await req.json()) as {
    reportId?: string;
    decision?: 'takedown' | 'dismiss';
    resolution?: string;
  };
  if (!body?.reportId || (body.decision !== 'takedown' && body.decision !== 'dismiss')) {
    return new Response('Bad request', { status: 400 });
  }

  const admin = createAdminClient();
  const { data: report } = await admin
    .from('reports')
    .select('id, target_type, target_id, status')
    .eq('id', body.reportId)
    .maybeSingle();
  if (!report) return new Response('Not found', { status: 404 });

  if (body.decision === 'takedown' && report.target_type === 'content') {
    // target_id for content reports is the CNT- public_code.
    const { data: item } = await admin
      .from('content_items')
      .select('id, moderation_status')
      .eq('public_code', report.target_id)
      .maybeSingle();
    if (item) {
      await admin.from('content_items').update({ moderation_status: 'suspended' }).eq('id', item.id);
      await admin.from('moderation_events').insert({
        content_item_id: item.id,
        actor_id: profile.id,
        action: 'report_takedown',
        from_status: item.moderation_status,
        to_status: 'suspended',
        reason: body.resolution ?? 'report upheld',
      });
    }
  }

  await admin
    .from('reports')
    .update({
      status: body.decision === 'takedown' ? 'actioned' : 'dismissed',
      resolution: body.resolution ?? null,
      decided_at: new Date().toISOString(),
      decided_by: profile.id,
    })
    .eq('id', report.id);

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: `report.${body.decision}`,
    targetType: report.target_type,
    targetId: report.target_id,
    reason: body.resolution ?? null,
    result: body.decision === 'takedown' ? 'actioned' : 'dismissed',
  });

  return Response.json({ ok: true });
}
