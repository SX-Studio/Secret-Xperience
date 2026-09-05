/**
 * NOWPayments IPN (webhook) handler — crypto rail counterpart of the Verotel
 * postback. Verifies the x-nowpayments-sig HMAC, then — only on a fully settled
 * payment — credits the buyer's token wallet exactly once. Wallet-credit logic
 * (ledger-based idempotency, upsert wallet, credit, mark order completed) mirrors
 * app/api/verotel/webhook/route.ts.
 *
 * Register this IPN callback in the NOWPayments store settings:
 *   https://www.secretxperience.eu/api/nowpayments/webhook
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { nowpaymentsConfig, verifyIpn } from '../../../lib/nowpayments'

export async function POST(req: NextRequest) {
  const cfg = nowpaymentsConfig()
  if (!cfg.configured) {
    console.error('NOWPayments webhook: env not configured')
    return new NextResponse('Not configured', { status: 503 })
  }

  const raw = await req.text()
  let body: Record<string, any>
  try {
    body = JSON.parse(raw)
  } catch {
    return new NextResponse('Bad body', { status: 400 })
  }

  const sig = req.headers.get('x-nowpayments-sig') || ''
  if (!verifyIpn(body, sig, cfg.ipnSecret)) {
    console.error('NOWPayments webhook: invalid signature')
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const status    = String(body.payment_status || '')
  const orderId   = String(body.order_id || '')
  const paymentId = String(body.payment_id || '')
  if (!orderId || !paymentId) {
    console.error('NOWPayments webhook: missing fields', { orderId, paymentId })
    return new NextResponse('Missing fields', { status: 400 })
  }
  // Credit only when the payment is fully settled; acknowledge other states so
  // NOWPayments stops retrying.
  if (status !== 'finished') return new NextResponse('OK', { status: 200 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: order } = await admin
    .from('payment_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    console.error('NOWPayments webhook: order not found', orderId)
    return new NextResponse('Order not found', { status: 404 })
  }

  const userId = order.user_id

  // Idempotency guard via the ledger (not order.status) — same reasoning as the
  // Verotel webhook: a crash after status=completed but before credit must still
  // credit on retry.
  const { data: existingLedger } = await admin
    .from('token_ledger')
    .select('id')
    .eq('reference_id', orderId)
    .eq('type', 'purchase')
    .maybeSingle()

  if (existingLedger) return new NextResponse('OK', { status: 200 })

  await admin.from('user_wallets').upsert(
    { user_id: userId, balance: 0, total_purchased: 0, total_spent: 0 },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  const { data: wallet } = await admin
    .from('user_wallets')
    .select('balance, total_purchased')
    .eq('user_id', userId)
    .single()

  const newBalance     = (wallet?.balance ?? 0) + order.tokens_granted
  const newTotalBought = (wallet?.total_purchased ?? 0) + order.tokens_granted

  const { error: walletErr } = await admin.from('user_wallets').update({
    balance:         newBalance,
    total_purchased: newTotalBought,
    updated_at:      new Date().toISOString(),
  }).eq('user_id', userId)

  if (walletErr) {
    console.error('NOWPayments webhook: wallet credit failed', walletErr)
    return new NextResponse('Wallet update failed', { status: 500 })
  }

  const { error: ledgerErr } = await admin.from('token_ledger').insert({
    user_id:       userId,
    amount:        order.tokens_granted,
    balance_after: newBalance,
    type:          'purchase',
    description:   `Token package purchase — Crypto #${paymentId}`,
    reference_id:  orderId,
  })

  if (ledgerErr) {
    console.error('NOWPayments webhook: ledger insert failed', ledgerErr)
  }

  await admin.from('payment_orders').update({
    status:              'completed',
    advertiser_order_id: paymentId,
    webhook_payload:     body,
    completed_at:        new Date().toISOString(),
  }).eq('id', orderId)

  return new NextResponse('OK', { status: 200 })
}
