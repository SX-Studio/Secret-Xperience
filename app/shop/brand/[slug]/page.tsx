import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductGrid from '../../ProductGrid'
import { ShopHeader, ShopFooter } from '../../ShopChrome'
import { BRAND_COLS, PRODUCT_COLS, shopDb, type Brand } from '../../brands'
import { brandDestination, goBrand } from '../../../lib/shopLinks'
import { SHOP_ORIGIN, isShopHost } from '../../../lib/domains'

/** A partner brand on the storefront: who they are, their featured items, and a counted link out. */

export const revalidate = 300

async function load(slug: string) {
  const db = shopDb()
  const { data: brand } = await db.from('brands').select(BRAND_COLS).eq('slug', slug).eq('active', true).maybeSingle()
  if (!brand) return null
  const { data: products } = await db.from('products').select(PRODUCT_COLS)
    .eq('brand_id', brand.id).eq('active', true)
    .order('featured', { ascending: false }).order('sort').order('created_at', { ascending: false })
    .limit(24)
  return { brand: brand as Brand, products: products || [] }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const canonical = `${SHOP_ORIGIN}/b/${params.slug}`
  try {
    const data = await load(params.slug)
    if (!data) return { title: 'The Boutique | SecretXperience', robots: { index: false } }
    const title = `${data.brand.name} | SecretXperience Boutique`
    const description = data.brand.tagline || data.brand.description?.slice(0, 200) || `Shop ${data.brand.name} — curated in the SecretXperience Boutique.`
    return {
      title, description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, ...(data.brand.cover_url ? { images: [{ url: data.brand.cover_url }] } : {}) },
    }
  } catch {
    return { title: 'The Boutique | SecretXperience', alternates: { canonical } }
  }
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const standalone = isShopHost(headers().get('host'))
  const data = await load(params.slug)
  if (!data) notFound()
  const { brand, products } = data
  const shopHome = standalone ? '/' : '/shop'
  const outbound = !brand.is_house && brandDestination(brand)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>
      <style>{`
        .shop-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(0,0,0,0.5) !important; border-color: var(--b3) !important; }
        .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .filter-pill { height: 34px; padding: 0 16px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; }
        .filter-pill.active { background: rgba(139,43,63,0.14); color: #d05b73; border-color: rgba(139,43,63,0.38); font-weight: 600; }
        .bp-hero { display:grid; grid-template-columns: 280px minmax(0,1fr); gap: 2rem; align-items: center; }
        @media(max-width:640px) { .shop-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .bp-hero { grid-template-columns: 1fr; } .bp-cover { height: 220px !important; } }
      `}</style>

      <ShopHeader standalone={standalone} back={{ href: shopHome, label: 'The Boutique' }} />

      <div style={{ background: 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 50%, #080612 100%)', borderBottom: '0.5px solid var(--b)', padding: '2.5rem 1.5rem' }}>
        <div className="bp-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="bp-cover" style={{ height: 320, borderRadius: 16, overflow: 'hidden', position: 'relative', border: '0.5px solid rgba(197,160,90,0.28)', background: 'linear-gradient(150deg,#2a0d18,#0d0a14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {brand.cover_url ? (
              <img src={brand.cover_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 96, color: 'rgba(197,160,90,0.2)' }}>{brand.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.85 }}>
              {brand.is_house ? 'SecretXperience · House collection' : 'Partner brand'}
            </div>
            {brand.logo_url && <img src={brand.logo_url} alt={brand.name} style={{ height: 36, maxWidth: 220, objectFit: 'contain', display: 'block', marginBottom: 12 }} />}
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 0.75rem' }}>{brand.name}</h1>
            {brand.tagline && <p style={{ fontSize: 16, color: 'var(--t2)', marginBottom: '0.75rem' }}>{brand.tagline}</p>}
            {brand.description && <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75, maxWidth: 620, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{brand.description}</p>}
            {outbound && (
              <a href={goBrand(brand.slug, 'brand')} rel="sponsored noopener" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Visit {brand.name} <i className="ti ti-external-link" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {products.length > 0 ? (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, margin: '2.5rem 0 0' }}>
              Featured from <em style={{ color: 'var(--gold)' }}>{brand.name}</em>
            </h2>
            <ProductGrid products={products as any} basePath={standalone ? '/p' : '/shop'} hideFilters />
          </>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 14, padding: '3.5rem 1rem' }}>
            {outbound ? <>Browse the full collection on <a href={goBrand(brand.slug, 'brand')} rel="sponsored noopener" target="_blank" style={{ color: 'var(--gold)' }}>{brand.name}&apos;s store ↗</a></> : 'New pieces arriving soon.'}
          </p>
        )}
        {!brand.is_house && (
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: '2.5rem', textAlign: 'center' }}>
            {brand.name} sells and ships its own products. We may earn a commission when you buy through these links.
          </p>
        )}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href={shopHome} style={{ color: 'var(--gold)', fontSize: 13, textDecoration: 'none' }}>← All brands</Link>
        </div>
      </div>

      <ShopFooter standalone={standalone} />
    </div>
  )
}
