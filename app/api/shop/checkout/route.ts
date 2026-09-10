/**
 * Stripe checkout for a webshop product.
 * POST { productId } → { url } (Stripe Checkout session)
 *
 * Only works for fulfillment='stripe' products with a price. Affiliate
 * products are linked out client-side and never hit this route.
 */
import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { siteUrl } from '../../../lib/site'
import { SHOP_ORIGIN, isShopHost } from '../../../lib/domains'

const SITE = siteUrl()

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Please log in to purchase.' }, { status: 401 })

  const { productId } = await req.json()
  const onShop = isShopHost(req.headers.get('host'))
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: product } = await admin
    .from('products')
    .select('id, name, description, price_cents, currency, images, fulfillment, in_stock, active')
    .eq('id', productId)
    .maybeSingle()

  if (!product || !product.active) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.fulfillment !== 'stripe') return NextResponse.json({ error: 'This item is sold by a partner store.' }, { status: 400 })
  if (!product.in_stock) return NextResponse.json({ error: 'Out of stock' }, { status: 400 })
  if (!product.price_cents || product.price_cents <= 0) return NextResponse.json({ error: 'Item is not purchasable' }, { status: 400 })

  const { data: order } = await admin.from('shop_orders').insert({
    product_id: product.id,
    buyer_id: session.user.id,
    amount_cents: product.price_cents,
    currency: product.currency || 'EUR',
    status: 'pending',
  }).select('id').single()

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: (product.currency || 'eur').toLowerCase(),
        product_data: {
          name: product.name,
          description: product.description ? String(product.description).slice(0, 300) : undefined,
          images: Array.isArray(product.images) && product.images[0] ? [product.images[0]] : undefined,
        },
        unit_amount: product.price_cents,
      },
      quantity: 1,
    }],
    metadata: { order_id: order?.id || '', product_id: product.id, buyer_id: session.user.id },
    // Stripe return URLs are per-session, not registered in a panel and not
    // signed (unlike Verotel's), so they can safely follow the host. A buyer
    // on the storefront must come back to the storefront, not the marketplace.
    success_url: onShop ? `${SHOP_ORIGIN}/?order=success` : `${SITE}/shop?order=success`,
    cancel_url: onShop ? `${SHOP_ORIGIN}/?order=cancelled` : `${SITE}/shop?order=cancelled`,
  })

  if (order?.id) {
    await admin.from('shop_orders').update({ stripe_session_id: checkout.id }).eq('id', order.id)
  }

  return NextResponse.json({ url: checkout.url })
}
