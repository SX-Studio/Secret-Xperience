import { randomUUID } from 'node:crypto';
import { getProfile } from '@/lib/session';
import { purchaseCart } from '@/lib/rentals';
import { writeAudit } from '@/lib/audit';

// Rent one item or a cart. One atomic wallet transaction: if any item can't be
// afforded, the whole cart rolls back (no partial charge).
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as {
    contentId?: string;
    contentIds?: string[];
    idempotencyKey?: string;
  };
  const ids = body.contentIds ?? (body.contentId ? [body.contentId] : []);
  if (ids.length === 0) return new Response('No content selected', { status: 400 });

  const idem = body.idempotencyKey || randomUUID();

  try {
    const rentals = await purchaseCart(profile.id, ids, `${profile.id}:${idem}`);
    await writeAudit({
      actorId: profile.id,
      actorCode: profile.public_code,
      action: 'rental.purchase',
      result: 'ok',
      meta: { count: ids.length },
    });
    return Response.json({ ok: true, rentals });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'purchase failed';
    const status = msg.includes('insufficient') ? 402 : 400;
    return new Response(msg, { status });
  }
}
