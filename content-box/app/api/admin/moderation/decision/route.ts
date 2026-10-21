import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

type Decision = 'approve' | 'reject' | 'suspend' | 'delete';
const TARGET: Record<Decision, 'approved' | 'rejected' | 'suspended' | 'deleted'> = {
  approve: 'approved',
  reject: 'rejected',
  suspend: 'suspended',
  delete: 'deleted',
};

// Platform admin acts on content in the moderation queue. Every decision is
// recorded in moderation_events and the audit log.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });
  if (profile.role !== 'platform_admin') return new Response('Forbidden', { status: 403 });

  const body = (await req.json()) as { contentId?: string; decision?: Decision; reason?: string };
  if (!body?.contentId || !body.decision || !(body.decision in TARGET)) {
    return new Response('Bad request', { status: 400 });
  }

  const admin = createAdminClient();
  const { data: item } = await admin
    .from('content_items')
    .select('id, public_code, moderation_status')
    .eq('id', body.contentId)
    .maybeSingle();
  if (!item) return new Response('Not found', { status: 404 });

  const to = TARGET[body.decision];
  const publishedAt = to === 'approved' ? new Date().toISOString() : null;

  await admin
    .from('content_items')
    .update({
      moderation_status: to,
      ...(to === 'approved' ? { published_at: publishedAt } : {}),
    })
    .eq('id', item.id);

  await admin.from('moderation_events').insert({
    content_item_id: item.id,
    actor_id: profile.id,
    action: body.decision,
    from_status: item.moderation_status,
    to_status: to,
    reason: body.reason ?? null,
  });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: `moderation.${body.decision}`,
    targetType: 'content',
    targetId: item.public_code,
    reason: body.reason ?? null,
    result: to,
  });

  return Response.json({ ok: true, status: to });
}
