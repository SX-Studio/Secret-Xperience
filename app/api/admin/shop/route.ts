/**
 * Admin → Shop: partner brands, their featured items, and the SecretXperience
 * house collection on secretxperience.store.
 *
 * GET                                  → brands, products, click counts (7d / 30d)
 * POST   { type, data }                → create a brand or product
 * PATCH  { type, id, data }            → update one
 * DELETE { type: 'product', id }       → remove a product (brands are deactivated, never
 *                                         deleted: that would drop their click history)
 *
 * Partner items are always link-out ('affiliate'); only house items may use our
 * own card checkout, so we never take payment for a partner's goods.
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/adminAuth'
import { safeOutboundUrl } from '../../../lib/shopLinks'

export const dynamic = 'force-dynamic'

const unauth = (code: 401 | 403) => NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Forbidden' }, { status: code })
const bad = (error: string) => NextResponse.json({ error }, { status: 400 })

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const CATEGORIES = ['apparel', 'toys', 'accessories', 'wellness']

const str = (v: unknown, max = 2000) => typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

/** Image fields accept an https URL or a path under our own /public. */
function imageUrl(v: unknown): string | null | undefined {
  if (v === undefined) return undefined
  const s = str(v, 1000)
  if (!s) return null
  if (/^\/[A-Za-z0-9/_.-]+$/.test(s)) return s
  return safeOutboundUrl(s)
}

function linkUrl(v: unknown, label: string): string | null | undefined {
  if (v === undefined) return undefined
  const s = str(v, 2000)
  if (!s) return null
  const ok = safeOutboundUrl(s)
  if (!ok) throw new Error(`${label} must be a full http(s) link`)
  return ok
}

function brandFields(d: any, creating: boolean) {
  const out: Record<string, unknown> = {}
  if (creating || d.name !== undefined) {
    const name = str(d.name, 120); if (!name) throw new Error('Name is required'); out.name = name
  }
  if (creating || d.slug !== undefined) {
    const slug = (str(d.slug, 80) || String(out.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    if (!SLUG.test(slug)) throw new Error('Slug may use a–z, 0–9 and single dashes'); out.slug = slug
  }
  for (const k of ['tagline', 'description', 'affiliate_network', 'commission_note'] as const) {
    if (d[k] !== undefined) out[k] = str(d[k], k === 'description' ? 3000 : 300)
  }
  const logo = imageUrl(d.logo_url); if (logo !== undefined) out.logo_url = logo
  const cover = imageUrl(d.cover_url); if (cover !== undefined) out.cover_url = cover
  const site = linkUrl(d.website_url, 'Website'); if (site !== undefined) out.website_url = site
  const aff = linkUrl(d.affiliate_url, 'Affiliate link'); if (aff !== undefined) out.affiliate_url = aff
  for (const k of ['featured', 'active'] as const) if (typeof d[k] === 'boolean') out[k] = d[k]
  if (d.sort !== undefined) out.sort = Number.isFinite(+d.sort) ? Math.trunc(+d.sort) : 0
  out.updated_at = new Date().toISOString()
  return out
}

function productFields(d: any, creating: boolean) {
  const out: Record<string, unknown> = {}
  if (creating || d.name !== undefined) {
    const name = str(d.name, 160); if (!name) throw new Error('Name is required'); out.name = name
  }
  if (d.description !== undefined) out.description = str(d.description, 3000)
  if (creating || d.brand_id !== undefined) {
    if (typeof d.brand_id !== 'string' || !d.brand_id) throw new Error('Pick a brand'); out.brand_id = d.brand_id
  }
  if (d.category !== undefined) {
    const c = str(d.category, 40)
    if (c && !CATEGORIES.includes(c)) throw new Error('Unknown category'); out.category = c
  }
  if (d.price !== undefined) {
    if (d.price === null || d.price === '') out.price_cents = null
    else {
      const n = Math.round(Number(String(d.price).replace(',', '.')) * 100)
      if (!Number.isFinite(n) || n < 0 || n > 10_000_000) throw new Error('Price must be a number in euros'); out.price_cents = n
    }
  }
  if (d.images !== undefined) {
    const list = (Array.isArray(d.images) ? d.images : String(d.images || '').split(/\s*\n\s*/))
      .map(imageUrl).filter(Boolean).slice(0, 8)
    out.images = list
  }
  const ext = linkUrl(d.external_url, 'Product link'); if (ext !== undefined) out.external_url = ext
  for (const k of ['featured', 'active', 'in_stock', 'deal', 'compare_is_rrp'] as const) if (typeof d[k] === 'boolean') out[k] = d[k]
  if (d.sort !== undefined) out.sort = Number.isFinite(+d.sort) ? Math.trunc(+d.sort) : 0
  if (d.was_price !== undefined) {
    if (d.was_price === null || d.was_price === '') out.compare_at_cents = null
    else {
      const n = Math.round(Number(String(d.was_price).replace(',', '.')) * 100)
      if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) throw new Error('Old price must be a number in euros'); out.compare_at_cents = n
    }
  }
  if (d.deal_label !== undefined) out.deal_label = str(d.deal_label, 24)
  if (d.promo_code !== undefined) out.promo_code = str(d.promo_code, 40)
  if (d.deal_ends_at !== undefined) {
    const s = str(d.deal_ends_at, 40)
    if (s && Number.isNaN(Date.parse(s))) throw new Error('Deal end date is not a valid date')
    // A bare date means "through that day", in Brussels time.
    out.deal_ends_at = s ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T23:59:59+01:00` : s).toISOString() : null
  }
  return out
}

/** A deal must show a real saving: old price above the current one. */
function checkDeal(f: Record<string, unknown>) {
  const price = f.price_cents as number | null | undefined
  const was = f.compare_at_cents as number | null | undefined
  if (was != null && price != null && was <= price) throw new Error('Old price must be higher than the current price')
  if (f.deal === true && (price == null || was == null)) throw new Error('A deal needs both the current price and the old price')
}

/** Decide fulfillment from the brand, and keep products.brand (legacy text) in step. */
async function attachBrand(admin: any, fields: Record<string, unknown>, existingBrandId?: string | null) {
  const brandId = (fields.brand_id as string | undefined) ?? existingBrandId
  if (!brandId) return
  const { data: b } = await admin.from('brands').select('id, name, is_house, active').eq('id', brandId).maybeSingle()
  if (!b) throw new Error('Brand not found')
  fields.brand = b.name
  fields.fulfillment = b.is_house ? 'stripe' : 'affiliate'
  if (b.is_house && fields.price_cents === null) throw new Error('House items need a price')
  // The house label is created hidden; listing its first live item switches it on.
  if (b.is_house && !b.active && fields.active !== false) {
    await admin.from('brands').update({ active: true, updated_at: new Date().toISOString() }).eq('id', b.id)
  }
}

export async function GET() {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString()
  const since7 = Date.now() - 7 * 864e5
  const [{ data: brands }, { data: products }, { data: clicks }] = await Promise.all([
    ctx.admin.from('brands').select('*').order('is_house', { ascending: false }).order('featured', { ascending: false }).order('sort').order('name'),
    ctx.admin.from('products').select('id, name, description, price_cents, currency, images, category, brand_id, fulfillment, external_url, featured, in_stock, active, sort, created_at, deal, compare_at_cents, compare_is_rrp, deal_label, promo_code, deal_ends_at')
      .order('sort').order('created_at', { ascending: false }),
    ctx.admin.from('affiliate_clicks').select('brand_id, product_id, clicked_at').gte('clicked_at', since30).limit(100000),
  ])

  const tally: Record<string, { d7: number; d30: number }> = {}
  const bump = (k: string | null, t: number) => {
    if (!k) return
    const e = tally[k] ||= { d7: 0, d30: 0 }
    e.d30++; if (t >= since7) e.d7++
  }
  for (const c of clicks || []) {
    const t = Date.parse(c.clicked_at)
    bump(c.brand_id ? `b:${c.brand_id}` : null, t)
    bump(c.product_id ? `p:${c.product_id}` : null, t)
  }
  return NextResponse.json({ brands: brands ?? [], products: products ?? [], clicks: tally, categories: CATEGORIES })
}

export async function POST(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  const { type, data } = await request.json().catch(() => ({}))
  try {
    if (type === 'brand') {
      const fields = brandFields(data || {}, true)
      const { data: row, error } = await ctx.admin.from('brands').insert(fields).select('id').single()
      if (error) return bad(error.code === '23505' ? 'That slug is already taken' : error.message)
      return NextResponse.json({ id: row.id })
    }
    if (type === 'product') {
      const fields = productFields(data || {}, true)
      checkDeal(fields)
      await attachBrand(ctx.admin, fields)
      const { data: row, error } = await ctx.admin.from('products').insert(fields).select('id').single()
      if (error) return bad(error.message)
      return NextResponse.json({ id: row.id })
    }
    return bad('type must be brand or product')
  } catch (e: any) {
    return bad(e?.message || 'Invalid input')
  }
}

export async function PATCH(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  const { type, id, data } = await request.json().catch(() => ({}))
  if (!id || typeof id !== 'string') return bad('id required')
  try {
    if (type === 'brand') {
      const fields = brandFields(data || {}, false)
      const { error } = await ctx.admin.from('brands').update(fields).eq('id', id)
      if (error) return bad(error.code === '23505' ? 'That slug is already taken' : error.message)
      return NextResponse.json({ ok: true })
    }
    if (type === 'product') {
      const fields = productFields(data || {}, false)
      const { data: cur } = await ctx.admin.from('products').select('brand_id, price_cents, compare_at_cents, deal').eq('id', id).maybeSingle()
      if (!cur) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (!('price_cents' in fields)) fields.price_cents = cur.price_cents
      checkDeal({ deal: cur.deal, compare_at_cents: cur.compare_at_cents, ...fields })
      await attachBrand(ctx.admin, fields, cur.brand_id)
      const { error } = await ctx.admin.from('products').update(fields).eq('id', id)
      if (error) return bad(error.message)
      return NextResponse.json({ ok: true })
    }
    return bad('type must be brand or product')
  } catch (e: any) {
    return bad(e?.message || 'Invalid input')
  }
}

export async function DELETE(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  const { type, id } = await request.json().catch(() => ({}))
  if (type !== 'product' || typeof id !== 'string') return bad('Only products can be deleted; deactivate a brand instead')
  const { error } = await ctx.admin.from('products').delete().eq('id', id)
  if (error) return bad(error.message)
  return NextResponse.json({ ok: true })
}
