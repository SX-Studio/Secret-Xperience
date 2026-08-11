/**
 * Verotel FlexPay charge for GIFT-COIN bundles.
 * Mirrors /api/verotel/charge but writes to gift_orders and marks the postback
 * with custom3=gift so the shared webhook credits gift_wallets (not tokens).
 */
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { GIFT_BUNDLE_BY_ID } from '../../../data/gifts'

const VEROTEL_SHOP_ID       = process.env.VEROTEL_SHOP_ID
const VEROTEL_SIGNATURE_KEY = process.env.VEROTEL_SIGNATURE_KEY
const FLEXPAY_START_URL     = 'https://secure.verotel.com/startorder'

function signParams(params: Record<string, string>, secret: string): string {
  const keys = Object.keys(params)
    .filter(k => k !== 'signature' && params[k] !== '' && params[k] != null)
    .sort((a, b) => { const la = a.toLowerCase(), lb = b.toLowerCase(); return la < lb ? -1 : la > lb ? 1 : 0 })
  let text = secret
  for (const k of keys) text += `:${k}=${params[k]}`
  return createHash('sha256').update(text, 'utf8').digest('hex').toLowerCase()
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bundleId } = await req.json().catch(() => ({}))
  const bundle = GIFT_BUNDLE_BY_ID[bundleId]
  if (!bundle) return NextResponse.json({ error: 'Unknown bundle' }, { status: 400 })

  // Not configured yet → graceful "coming soon" (never a 503 page), like tokens.
  if (!VEROTEL_SHOP_ID || !VEROTEL_SIGNATURE_KEY) {
    return NextResponse.json({ error: 'Payment not configured', configured: false }, { status: 200 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: order, error: orderErr } = await admin
    .from('gift_orders')
    .insert({ user_id: session.user.id, bundle: bundle.id, coins: bundle.coins, amount_eur: bundle.price, status: 'pending' })
    .select('id')
    .single()
  if (orderErr || !order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  const flexParams: Record<string, string> = {
    shopID:        String(VEROTEL_SHOP_ID),
    priceAmount:   bundle.price.toFixed(2),
    priceCurrency: 'EUR',
    type:          'purchase',
    description:   `${bundle.coins} gift coins - SecretXperience`,
    custom1:       order.id,
    custom2:       session.user.id,
    custom3:       'gift',
    version:       '4',
  }
  flexParams.signature = signParams(flexParams, VEROTEL_SIGNATURE_KEY.trim())
  const url = `${FLEXPAY_START_URL}?${new URLSearchParams(flexParams).toString()}`
  return NextResponse.json({ url, orderId: order.id })
}
