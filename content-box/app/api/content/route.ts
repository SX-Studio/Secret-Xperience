import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/audit';

// Create a content draft. The DB Trust & Safety gate (content_publish_gate)
// also enforces KYC + box membership, so this cannot be bypassed even here.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as {
    boxId?: string;
    title?: string;
    description?: string;
    priceTokens?: number;
  };
  const boxId = body?.boxId ?? '';
  const title = (body?.title ?? '').trim();
  const price = Number(body?.priceTokens);
  if (!boxId || !title) return new Response('Bad request', { status: 400 });
  if (!Number.isInteger(price) || price < 0) return new Response('Invalid price', { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('content_items')
    .insert({
      box_id: boxId,
      creator_id: profile.id,
      title,
      description: body.description ?? null,
      price_tokens: price,
      moderation_status: 'draft',
    })
    .select('id, public_code')
    .single();

  if (error) {
    // Gate violations (not verified / not a box creator) surface here.
    return new Response(error.message, { status: 403 });
  }

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'content.create',
    targetType: 'content',
    targetId: data.public_code,
    result: 'draft',
  });

  return Response.json({ content: data });
}
