/**
 * Verotel FlexPay charge initiation
 *
 * Flow:
 *   1. Client POSTs { packageId }
 *   2. We create a pending payment_order in Supabase
 *   3. We build a signed Verotel FlexPay "startorder" URL (SHA256 signature)
 *   4. Return { url } — client redirects user to Verotel's hosted payment page
 *   5. After payment Verotel hits /api/verotel/webhook (postback) → wallet credited
 *
 * FlexPay startorder URL:
 *   https://secure.verotel.com/startorder
 *     ?shopID={SHOP_ID}&priceAmount={EUR}&priceCurrency=EUR&type=purchase
 *     &description={desc}&custom1={orderId}&custom2={userId}&version=4
 *     &successURL=...&declineURL=...&signature={SHA256}
 *
 * Signature (Verotel FlexPay spec):
 *   text = SIGNATURE_KEY
 *   for each param sorted case-insensitively by name (excluding "signature"):
 *     text += ":" + name + "=" + value
 *   signature = lowercase( SHA256(text) )
 *
 * Env vars (set in Vercel):
 *   VEROTEL_SHOP_ID         — website ID from Verotel control panel (e.g. 136440)
 *   VEROTEL_SIGNATURE_KEY   — FlexPay signature key (secret, from FlexPay options)
 */
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const VEROTEL_SHOP_ID       = process.env.VEROTEL_SHOP_ID
const VEROTEL_SIGNATURE_KEY = process.env.VEROTEL_SIGNATURE_KEY
const FLEXPAY_START_URL     = 'https://secure.verotel.com/startorder'

function signParams(params: Record<string, string>, secret: string): string {
  const keys = Object.keys(params)
    .filter(k => k !== 'signature' && params[k] !== '' && params[k] != null)
    .sort((a, b) => {
      const la = a.toLowerCase(), lb = b.toLowerCase()
      return la < lb ? -1 : la > lb ? 1 : 0
    })
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

  // Not configured yet → tell client to show the graceful "coming soon" modal (never a 503 page).
  if (!VEROTEL_SHOP_ID || !VEROTEL_SIGNATURE_KEY) {
    return NextResponse.json({ error: 'Payment not configured', configured: false }, { status: 200 })
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
  const priceStr    = Number(pkg.price_eur).toFixed(2)

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
      provider:         'verotel',
      status:         'pending',
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    console.error('[payment_orders] insert failed:', orderErr?.message ?? orderErr)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Plain (unencoded) values used for signing; URLSearchParams encodes for the query string.
  // NOTE: success/decline URLs are configured in the Verotel panel (FlexPay options),
  // NOT passed as request params — passing them breaks signature verification.
  const flexParams: Record<string, string> = {
    shopID:        String(VEROTEL_SHOP_ID),
    priceAmount:   priceStr,
    priceCurrency: 'EUR',
    type:          'purchase',
    description:   `${totalTokens} tokens - SecretXperience`,
    custom1:       order.id,
    custom2:       session.user.id,
    version:       '4',
  }
  flexParams.signature = signParams(flexParams, VEROTEL_SIGNATURE_KEY.trim())

  const url = `${FLEXPAY_START_URL}?${new URLSearchParams(flexParams).toString()}`

  return NextResponse.json({ url, orderId: order.id })
}
