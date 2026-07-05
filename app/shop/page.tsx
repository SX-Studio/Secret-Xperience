import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import ProductGrid from './ProductGrid'
import PremiumBanner from '../components/PremiumBanner/PremiumBanner'
import ShopShowcase from '../components/ShopShowcase/ShopShowcase'

export async function generateMetadata() {
  return {
    title: 'The Boutique | SecretXperience',
    description: 'Curated luxury accessories, intimate gifts, and premium wellness. Discreet EU shipping in plain packaging.',
    openGraph: {
      title: 'The Boutique | SecretXperience',
      description: 'Curated luxury accessories, intimate gifts, and premium wellness.',
      url: 'https://www.secretxperience.eu/shop',
    },
  }
}


export default async function ShopPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, price_cents, currency, images, category, brand, fulfillment, external_url, featured, in_stock')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(60)

  const allProducts = products || []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://www.secretxperience.eu/shop' },
        ]},
        { '@context': 'https://schema.org', '@type': 'Service', name: 'Adult Shop', serviceType: 'Adult Products & Accessories', advertiser: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' }, areaServed: ['BE','NL','DE','FR','LU','CH'], url: 'https://www.secretxperience.eu/shop', description: 'Premium adult products, accessories and lifestyle items delivered discreetly across Europe.' },
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
        .dorcel-banner { transition: border-color .18s, box-shadow .18s; }
        .dorcel-banner:hover { border-color: rgba(180,20,40,0.75) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.55) !important; }
        @media(max-width:560px) { .dorcel-banner { grid-template-columns: 1fr !important; gap: 1rem !important; } }
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

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '58px',
          position: 'sticky', top: '34px', zIndex: 200,
          background: 'rgba(8,6,18,0.96)', backdropFilter: 'blur(18px)',
          borderBottom: '0.5px solid var(--b)',
        }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 12px rgba(197,160,90,0.25))' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
            <Link href="/advertise" style={{
              height: '34px', padding: '0 16px',
              background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
              borderRadius: 'var(--r)', color: '#0a0a0a',
              fontSize: '13px', fontWeight: 700,
              textDecoration: 'none', display: 'flex', alignItems: 'center',
            }}>
              List your shop
            </Link>
          </div>
        </nav>

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
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allProducts.length}</span> products
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>🚚 Plain packaging · Free returns</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>

          <PremiumBanner placement="section" category="shop" />

          {/* Dorcel Collection affiliate banner */}
          <a
            href="https://www.dorcelclub.com/en?aff=8103"
            target="_blank"
            rel="noopener noreferrer"
            className="dorcel-banner"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '1.5rem',
              background: 'linear-gradient(120deg, rgba(20,8,8,0.95) 0%, rgba(80,10,20,0.7) 100%)',
              border: '0.5px solid rgba(180,20,40,0.4)',
              borderRadius: 16,
              padding: '1.4rem 1.8rem',
              marginBottom: '2rem',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#e02030', marginBottom: 8 }}>
                ✦ Official Partner · Premium Content
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 400, color: '#ece8e1', lineHeight: 1.15, marginBottom: 6 }}>
                Dorcel Club
              </div>
              <div style={{ fontSize: 13, color: 'rgba(236,232,225,0.5)', lineHeight: 1.5 }}>
                Europe&apos;s most prestigious adult studio — exclusive HD films, series &amp; live shows.
              </div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              fontSize: 13, fontWeight: 700, color: '#fff',
              background: 'linear-gradient(90deg, #c0001a, #8b000f)',
              borderRadius: 10, padding: '9px 18px', flexShrink: 0,
            }}>
              Visit store <i className="ti ti-arrow-right" />
            </span>
          </a>

          <ProductGrid products={allProducts} />

          {/* Partner boutiques — lingerie & adult fashion, data in app/data/shops.ts */}
          <div style={{ margin: '3rem -1.5rem 0' }}>
            <ShopShowcase variant="large" />
          </div>

          {/* VENDOR CTA */}
          {allProducts.length > 0 && (
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

        {/* FOOTER */}
        <footer style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--gold)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--t3)' }}>
            Adults only (18+) ·{' '}
            <Link href="/regulations" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Regulations</Link>
            {' '}·{' '}
            <Link href="/medical" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Medical Info</Link>
            {' '}·{' '}
            <Link href="/terms" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Terms</Link>
            {' '}·{' '}
            <Link href="/privacy" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Privacy</Link>
          </p>
        </footer>
      </div>
    </>
  )
}
