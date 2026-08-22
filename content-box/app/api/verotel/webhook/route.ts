import { createAdminClient } from '@/lib/supabase/admin';
import { verotelConfig, verifyPostback } from '@/lib/verotel';
import { ensureWallet, applyLedger } from '@/lib/wallet';
import { writeAudit } from '@/lib/audit';

// Verotel FlexPay postback. Verifies the signature, then credits the buyer's
// wallet exactly once (idempotency key = the Verotel sale id). Verotel posts
// via GET; POST accepted for safety.
export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}

async function handle(req: Request): Promise<Response> {
  const cfg = verotelConfig();
  if (!cfg.configured) return new Response('Not configured', { status: 503 });

  const params: Record<string, string> = {};
  if (req.method === 'GET') {
    new URL(req.url).searchParams.forEach((v, k) => (params[k] = v));
  } else {
    new URLSearchParams(await req.text()).forEach((v, k) => (params[k] = v));
  }

  if (!verifyPostback(params, String(cfg.key))) {
    return new Response('Invalid signature', { status: 400 });
  }
  if (String(params.shopID) !== String(cfg.shopId)) {
    return new Response('Forbidden', { status: 403 });
  }
  if ((params.type || '').toLowerCase() !== 'purchase') {
    return new Response('OK', { status: 200 }); // ack non-purchase events
  }

  const orderId = params.custom1;
  const userId = params.custom2;
  const saleId = params.saleID || params.referenceID || '';
  if (!orderId || !userId || !saleId) return new Response('Missing fields', { status: 400 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('token_orders')
    .select('id, user_id, tokens, status')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return new Response('Order not found', { status: 404 });
  if (order.user_id !== userId) return new Response('User mismatch', { status: 400 });
  if (order.status === 'paid') return new Response('OK', { status: 200 }); // already handled

  const walletId = await ensureWallet(userId, 'user');
  // Idempotent credit — a retried postback with the same sale id is a no-op.
  await applyLedger({
    walletId,
    delta: order.tokens,
    reason: 'Token purchase',
    refType: 'token_order',
    refId: order.id,
    idempotencyKey: `verotel:${saleId}`,
  });

  await admin
    .from('token_orders')
    .update({ status: 'paid', provider_ref: saleId })
    .eq('id', order.id);

  await writeAudit({
    actorId: userId,
    action: 'tokens.credited',
    targetType: 'token_order',
    targetId: order.id,
    result: 'paid',
    meta: { tokens: order.tokens, saleId },
  });

  return new Response('OK', { status: 200 });
}
