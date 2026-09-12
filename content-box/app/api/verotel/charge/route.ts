import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { findPackage } from '@/lib/packages';
import { verotelConfig, buildStartOrderUrl } from '@/lib/verotel';
import { checkRateLimit, HOUR } from '@/lib/ratelimit';
import { writeAudit } from '@/lib/audit';

// Create a pending token order and return a signed Verotel FlexPay URL.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  if (!(await checkRateLimit(`charge:${profile.id}`, 20, HOUR))) {
    return new Response('Too many requests, try later', { status: 429 });
  }

  const { packageId } = (await req.json()) as { packageId?: string };
  const pkg = packageId ? findPackage(packageId) : undefined;
  if (!pkg) return new Response('Unknown package', { status: 400 });

  const cfg = verotelConfig();
  if (!cfg.configured) {
    // Graceful: client shows a "payment coming soon" message, never a 503.
    return Response.json({ configured: false });
  }

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from('token_orders')
    .insert({
      user_id: profile.id,
      package_id: pkg.id,
      tokens: pkg.tokens,
      fiat_cents: pkg.eurCents,
      currency: 'EUR',
      provider: 'verotel',
      status: 'pending',
    })
    .select('id')
    .single();
  if (error || !order) return new Response('Order failed', { status: 500 });

  const url = buildStartOrderUrl({
    shopId: String(cfg.shopId),
    key: String(cfg.key),
    priceEur: (pkg.eurCents / 100).toFixed(2),
    description: `${pkg.tokens} tokens - Content Box`, // ASCII only
    orderId: order.id,
    userId: profile.id,
  });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'tokens.order',
    targetType: 'token_order',
    targetId: order.id,
    result: 'pending',
    meta: { tokens: pkg.tokens, eurCents: pkg.eurCents },
  });

  return Response.json({ configured: true, url, orderId: order.id });
}
