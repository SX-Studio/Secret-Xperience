/**
 * Creator memberships (token-based recurring).
 * POST { creatorId, tierName, action? }
 *   - action 'subscribe' (default): charge price_tokens from the fan's wallet, credit
 *     the creator, start a 30-day period. If an active sub exists for a different tier,
 *     switches the tier at the next renewal (no immediate re-charge).
 *   - action 'cancel': stop auto-renew; keep access until current_period_end.
 *   - action 'resume': re-enable auto-renew on an active, cancelling sub.
 *
 * Price: tiers are in EUR; billed at 10 tokens = €1.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
const tokensFor = (euro: any) => Math.max(1, Math.round((Number(euro) || 0) * 10))

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = session.user.id

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { creatorId, tierName, action = 'subscribe' } = body
  if (!creatorId || typeof creatorId !== 'string') return NextResponse.json({ error: 'creatorId required' }, { status: 400 })
  if (creatorId === me) return NextResponse.json({ error: 'You cannot subscribe to yourself' }, { status: 400 })

  const db = admin()

  // ---- cancel / resume ----
  if (action === 'cancel' || action === 'resume') {
    const { data: sub } = await db.from('creator_subscriptions')
      .select('id, current_period_end').eq('subscriber_id', me).eq('creator_id', creatorId).eq('status', 'active').maybeSingle()
    if (!sub) return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    const { error } = await db.from('creator_subscriptions')
      .update({ cancel_at_period_end: action === 'cancel' }).eq('id', sub.id)
    if (error) { console.error('[subscribe] cancel/resume:', error.message); return NextResponse.json({ error: 'Could not update subscription.' }, { status: 500 }) }
    return NextResponse.json({ ok: true, cancelAtPeriodEnd: action === 'cancel', currentPeriodEnd: sub.current_period_end })
  }

  // ---- subscribe / switch tier ----
  const { data: creator } = await db.from('profiles').select('id, studio_config').eq('id', creatorId).maybeSingle()
  if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  const tiers: any[] = Array.isArray((creator as any).studio_config?.tiers) ? (creator as any).studio_config.tiers : []
  const tier = tiers.find((t) => t?.name === tierName)
  if (!tier) return NextResponse.json({ error: 'Unknown membership tier' }, { status: 400 })
  const price = tokensFor(tier.price)

  // Already subscribed? switch tier (effective next renewal) instead of double-charging.
  const { data: existing } = await db.from('creator_subscriptions')
    .select('id, tier_name, current_period_end').eq('subscriber_id', me).eq('creator_id', creatorId).eq('status', 'active').maybeSingle()
  if (existing) {
    if (existing.tier_name === tierName) return NextResponse.json({ error: 'You are already subscribed to this tier.' }, { status: 409 })
    const { error } = await db.from('creator_subscriptions')
      .update({ tier_name: tierName, price_tokens: price, cancel_at_period_end: false }).eq('id', existing.id)
    if (error) return NextResponse.json({ error: 'Could not switch tier.' }, { status: 500 })
    return NextResponse.json({ ok: true, switched: true, tierName, priceTokens: price, currentPeriodEnd: existing.current_period_end })
  }

  // Charge first period — optimistic lock guards against concurrent spends.
  const { data: wallet } = await db.from('user_wallets').select('balance').eq('user_id', me).maybeSingle()
  if (!wallet || wallet.balance < price)
    return NextResponse.json({ error: 'Insufficient token balance', needTokens: price, balance: wallet?.balance ?? 0 }, { status: 402 })
  const subAfter = wallet.balance - price

  const { data: deducted, error: dErr } = await db.from('user_wallets')
    .update({ balance: subAfter }).eq('user_id', me).eq('balance', wallet.balance).select('balance')
  if (dErr) { console.error('[subscribe] deduct:', dErr.message); return NextResponse.json({ error: 'Could not process payment.' }, { status: 500 }) }
  if (!deducted?.length) return NextResponse.json({ error: 'Balance changed, please retry.' }, { status: 409 })

  // Credit creator.
  const { data: cw } = await db.from('user_wallets').select('balance').eq('user_id', creatorId).maybeSingle()
  const crAfter = (cw?.balance ?? 0) + price
  if (cw) await db.from('user_wallets').update({ balance: crAfter }).eq('user_id', creatorId)
  else await db.from('user_wallets').insert({ user_id: creatorId, balance: price })

  await db.from('token_ledger').insert([
    { user_id: me, amount: -price, balance_after: subAfter, type: 'spend', description: `Subscription: ${tierName}` },
    { user_id: creatorId, amount: price, balance_after: crAfter, type: 'bonus', description: `New subscriber: ${tierName}` },
  ])

  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString()
  const { data: sub, error: sErr } = await db.from('creator_subscriptions').insert({
    subscriber_id: me, creator_id: creatorId, tier_name: tierName, price_tokens: price,
    status: 'active', current_period_end: periodEnd, last_renewed_at: new Date().toISOString(),
  }).select('id, tier_name, current_period_end').single()
  if (sErr) { console.error('[subscribe] insert:', sErr.message); return NextResponse.json({ error: 'Payment taken but subscription failed — contact support.' }, { status: 500 }) }

  return NextResponse.json({ ok: true, subscription: sub, priceTokens: price, newBalance: subAfter })
}
