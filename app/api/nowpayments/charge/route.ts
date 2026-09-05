/**
 * NOWPayments crypto charge initiation (parallel rail to Verotel FlexPay).
 *
 * Flow:
 *   1. Client POSTs { packageId }
 *   2. We create a pending payment_order in Supabase (advertiser = 'nowpayments')
 *   3. We create a NOWPayments hosted invoice (buyer picks the coin there)
 *   4. Return { url } — client redirects to the hosted checkout
 *   5. After settlement NOWPayments hits /api/nowpayments/webhook (IPN) → wallet credited
 *
 * Graceful { configured:false } (HTTP 200) when the crypto env isn't set, so the
 * tokens page shows the "coming soon" modal instead of a raw error — identical to
 * the Verotel charge route's behaviour.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { nowpaymentsConfig, createInvoice } from '../../../lib/nowpayments'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Not configured yet → tell client to show the graceful "coming soon" modal (never a 503 page).
  const cfg = nowpaymentsConfig()
  if (!cfg.configured) {
    return NextResponse.json({ error: 'Crypto not configured', configured: false }, { status: 200 })
  }

  const { packageId } = await req.json()
  if (!packageId) return NextResponse.json({ error: 'packageId required' }, { status: 400 })

  const { data: pkg } = await supabase
    .from('token_packages')
    .select('*')
    .eq('id', packageId)
    .eq('active', true)
    .single()

  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  const totalTokens = pkg.tokens + (pkg.bonus_tokens || 0)
  const priceEur    = Number(pkg.price_eur)

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: order, error: orderErr } = await admin
    .from('payment_orders')
    .insert({
      user_id:        session.user.id,
      package_id:     pkg.id,
      tokens_granted: totalTokens,
      amount_eur:     pkg.price_eur,
      advertiser:     'nowpayments',
      status:         'pending',
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const inv = await createInvoice({
    apiKey:      cfg.apiKey,
    priceEur,
    orderId:     order.id,
    description: `${totalTokens} tokens - SecretXperience`, // ASCII only
  })
  if (!inv) return NextResponse.json({ error: 'Could not start crypto checkout' }, { status: 502 })

  return NextResponse.json({ url: inv.url, orderId: order.id })
}
