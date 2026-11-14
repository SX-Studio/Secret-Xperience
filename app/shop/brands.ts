import { createClient } from '@supabase/supabase-js'

/** Public (anon) read of the storefront's brand data. RLS limits it to active rows. */
export function shopDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export interface Brand {
  id: string
  slug: string
  name: string
  tagline?: string | null
  description?: string | null
  logo_url?: string | null
  cover_url?: string | null
  website_url?: string | null
  affiliate_url?: string | null
  is_house: boolean
  kind: 'lingerie' | 'toys'
  featured: boolean
}

export const BRAND_COLS = 'id, slug, name, tagline, description, logo_url, cover_url, website_url, affiliate_url, is_house, featured, kind'

export const PRODUCT_COLS = 'id, name, description, price_cents, currency, images, category, brand, brand_id, fulfillment, external_url, featured, in_stock, deal, compare_at_cents, compare_is_rrp, deal_label, promo_code, deal_ends_at, brands(slug, name, is_house)'
