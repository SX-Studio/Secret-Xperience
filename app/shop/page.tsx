import { createServerClient } from '@supabase/ssr'
import DorcelBanner from '../components/DorcelBanner'
import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import ProductGrid from './ProductGrid'
import PremiumBanner from '../components/PremiumBanner/PremiumBanner'
import BrandRow from './BrandRow'
import { BRAND_COLS, PRODUCT_COLS, type Brand } from './brands'
import { ShopHeader, ShopFooter } from './ShopChrome'
import { SHOP_ORIGIN, isShopHost } from '../lib/domains'

export async function generateMetadata() {
  return {
    title: 'The Boutique | SecretXperience',
    description: 'Curated luxury accessories, intimate gifts, and premium wellness. Discreet EU shipping in plain packaging.',
    alternates: { canonical: `${SHOP_ORIGIN}/` },
    openGraph: {
      title: 'The Boutique | SecretXperience',
      description: 'Curated luxury accessories, intimate gifts, and premium wellness.',
      url: `${SHOP_ORIGIN}/`,
    },
  }
}


export default async function ShopPage() {
  const standalone = isShopHost(headers().get('host'))
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const [{ data: products }, { data: brandRows }] = await Promise.all([
    supabase
      .from('products')
      .select(PRODUCT_COLS)
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('sort')
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('brands')
      .select(BRAND_COLS)
      .eq('active', true)
      .eq('is_house', false)
      .order('featured', { ascending: false })
      .order('sort')
      .order('name'),
  ])

  const allProducts = (products || []) as any[]
  // The house label's own products get their own section above the partners'.
  const houseProducts = allProducts.filter(p => p.brands?.is_house)
  const partnerProducts = allProducts.filter(p => !p.brands?.is_house)
  const brands = (brandRows || []) as Brand[]
  const brandBase = standalone ? '/b' : '/shop/brand'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'The Boutique', item: `${SHOP_ORIGIN}/` },
        ]},
        { '@context': 'https://schema.org', '@type': 'Store', name: 'SecretXperience Boutique', url: `${SHOP_ORIGIN}/`, areaServed: ['BE','NL','DE','FR','LU','CH'], description: 'Premium adult products, accessories and lifestyle items delivered discreetly across Europe.' },
      ]) }} />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .shop-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(0,0,0,0.5) !important; border-color: var(--b3) !important; }
        .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .filter-pill { height: 34px; padding: 0 16px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: all 0.15s; cursor: pointer; letter-spacing: 0.02em; flex-shrink: 0; }
        .filter-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .filter-pill.active { background: rgba(139,43,63,0.14); color: #d05b73; border-color: rgba(139,43,63,0.38); font-weight: 600; }
        .sort-sel { height: 34px; padding: 0 12px; background: var(--bg2); border: 0.5px solid var(--b2); border-radius: var(--r); color: var(--t2); font-size: 13px; cursor: pointer; outline: none; flex-shrink: 0; }
        .sort-sel:focus { border-color: var(--gbrd); }
        @media(max-width:640px) { .shop-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
        @media(max-width:380px) { .shop-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

        {/* STICKY SHIPPING BANNER */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(139,43,63,0.2),rgba(109,58,92,0.2))',
          borderBottom: '0.5px solid rgba(139,43,63,0.3)',
          padding: '7px 1.5rem',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--t2)',
          letterSpacing: '0.06em',
          position: 'sticky',
          top: 0,
          zIndex: 300,
          backdropFilter: 'blur(12px)',
        }}>
          <span style={{ color: 'var(--gold)', marginRight: '8px' }}>✦</span>
          Discreet EU shipping · 3–5 days · Plain packaging
          <span style={{ color: 'var(--gold)', marginLeft: '8px' }}>✦</span>
        </div>

        <ShopHeader standalone={standalone} />

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 50%, #080612 100%)',
          borderBottom: '0.5px solid var(--b)',
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 60%,rgba(139,43,63,0.14) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 20%,rgba(197,160,90,0.08) 0%,transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
              SecretXperience · Boutique
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              The <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Boutique</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Curated luxury accessories, intimate gifts, and premium wellness
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{brands.length}</span> brands · <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allProducts.length}</span> picks
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>🚚 Plain packaging · Free returns</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>

          <PremiumBanner placement="section" category="shop" />

          <DorcelBanner />

          {houseProducts.length > 0 && (
            <section aria-label="The SecretXperience Collection" style={{ margin: '2.5rem 0 3rem' }}>
              <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.6)', marginBottom: 8 }}>✦ House collection</p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 400, margin: 0 }}>
                The <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>SecretXperience</em> Collection
              </h2>
              <ProductGrid products={houseProducts} basePath={standalone ? '/p' : '/shop'} hideFilters />
            </section>
          )}

          {partnerProducts.length > 0 && (
            <>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 400, margin: '2rem 0 1rem' }}>
                Featured <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>picks</em>
              </h2>
              <ProductGrid products={partnerProducts} basePath={standalone ? '/p' : '/shop'} />
            </>
          )}

          <BrandRow brands={brands} basePath={brandBase} />

          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: '2rem', textAlign: 'center' }}>
            Partner brands sell and ship their own products. We may earn a commission when you buy through links on this page.
          </p>

          {/* VENDOR CTA */}
          {!standalone && allProducts.length > 0 && (
            <div style={{
              marginTop: '4rem',
              padding: '2.5rem',
              background: 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 60%, #110d1c 100%)',
              border: '0.5px solid rgba(139,43,63,0.25)',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(139,43,63,0.12) 0%,transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>Sell in The Boutique</div>
                <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Reach thousands of European customers. Discreet, verified, adult-lifestyle focused.
                </p>
                <Link href="/advertise" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                  borderRadius: 'var(--r)', color: '#0a0a0a',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  Apply as a vendor →
                </Link>
              </div>
            </div>
          )}
        </div>

        <ShopFooter standalone={standalone} />
      </div>
    </>
  )
}
