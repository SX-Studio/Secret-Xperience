/**
 * GET /go/b/<brand-slug>  → brand's affiliate link (or website)
 * GET /go/p/<product-id>  → product's own link, else its brand's
 *
 * Counts the click, then 302s. Commission is earned on the brand's side, so
 * this count is our only record of the traffic we sent; it stores no user id
 * and no IP. Crawlers are redirected but not counted.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CLICK_SOURCES, brandDestination, looksLikeBot, productDestination } from '../../../lib/shopLinks'
import { SHOP_ORIGIN } from '../../../lib/domains'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function away(url: string) {
  const res = NextResponse.redirect(url, 302)
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('Referrer-Policy', 'origin')
  return res
}

export async function GET(req: NextRequest, { params }: { params: { kind: string; id: string } }) {
  const { kind, id } = params
  const home = `${SHOP_ORIGIN}/`
  const db = admin()

  let destination: string | null = null
  let brandId: string | null = null
  let productId: string | null = null

  if (kind === 'b' && SLUG.test(id)) {
    const { data: b } = await db.from('brands')
      .select('id, affiliate_url, website_url').eq('slug', id).eq('active', true).maybeSingle()
    destination = brandDestination(b)
    brandId = b?.id ?? null
  } else if (kind === 'p' && UUID.test(id)) {
    const { data: p } = await db.from('products')
      .select('id, external_url, brand_id, brands(affiliate_url, website_url)')
      .eq('id', id).eq('active', true).maybeSingle()
    const brand = (Array.isArray(p?.brands) ? p?.brands[0] : p?.brands) as { affiliate_url?: string; website_url?: string } | null
    destination = productDestination(p?.external_url, brand)
    brandId = p?.brand_id ?? null
    productId = p?.id ?? null
  }

  if (!destination) return away(home)

  if (!looksLikeBot(req.headers.get('user-agent'))) {
    const s = req.nextUrl.searchParams.get('s')
    const source = (CLICK_SOURCES as readonly string[]).includes(s || '') ? s : null
    const { error } = await db.from('affiliate_clicks').insert({ brand_id: brandId, product_id: productId, source })
    if (error) console.error('[go] click not recorded:', error.message)
  }

  return away(destination)
}
