import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import RentalsGrid from './RentalsGrid'
import PremiumBanner from '../components/PremiumBanner/PremiumBanner'

export async function generateMetadata() {
  return {
    title: 'Private Spaces | SecretXperience',
    description: 'Discreet apartments, suites and studios available by the hour or night. Private entry, verified spaces across Europe.',
    openGraph: {
      title: 'Private Spaces | SecretXperience',
      description: 'Discreet apartments, suites and studios available by the hour or night.',
      url: 'https://www.secretxperience.eu/rentals',
    },
  }
}


export default async function RentalsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, category, subcategory, city, country, price_from, price_to, images, verified, premium, rating, review_count, meet_type, featured_until, created_at, tags, image_focus')
    .eq('active', true)
    .eq('category', 'rentals')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  const allListings = listings || []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://www.secretxperience.eu/rentals' },
        ]},
        { '@context': 'https://schema.org', '@type': 'Service', name: 'Discreet Rentals', serviceType: 'Adult Space Rental', advertiser: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' }, areaServed: ['BE','NL','DE','FR','LU','CH'], url: 'https://www.secretxperience.eu/rentals', description: 'Private, discreet rental spaces for intimate encounters — apartments, suites and studios across Europe.' },
      ]) }} />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rental-card:hover { transform: translateY(-3px) !important; box-shadow: 0 14px 40px rgba(0,0,0,0.5) !important; border-color: var(--b3) !important; }
        .rental-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px,100%), 1fr)); gap: 18px; }
        .loc-pill { height: 36px; padding: 0 14px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: all 0.15s; cursor: pointer; flex-shrink: 0; }
        .loc-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .loc-pill.active { background: rgba(122,170,238,0.12); color: var(--sapphire); border-color: rgba(122,170,238,0.35); font-weight: 600; }
        .type-pill { height: 32px; padding: 0 12px; border-radius: 8px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 12px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: all 0.15s; cursor: pointer; flex-shrink: 0; }
        .type-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .type-pill.active { background: var(--gbg); color: var(--gold); border-color: var(--gbrd); font-weight: 600; }
        @media(max-width:640px) { .rental-grid { grid-template-columns: 1fr; gap: 12px; } }
        @media(max-width:480px) { .rental-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '60px',
          position: 'sticky', top: 0, zIndex: 200,
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
              List your space
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(140deg, #1a1430 0%, #0d0d1a 50%, #080612 100%)',
          borderBottom: '0.5px solid var(--b)',
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,rgba(122,170,238,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%,rgba(197,160,90,0.06) 0%,transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
              SecretXperience · Private Spaces
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              Private <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Spaces</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Discreet apartments, suites and studios available by the hour or night
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allListings.length}</span> spaces available
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>🔑 Private entry · Verified</span>
            </div>
          </div>
        </div>

        {/* MAP PLACEHOLDER */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
          <div style={{
            background: 'var(--bg1)',
            border: '0.5px solid var(--b)',
            borderRadius: '14px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(122,170,238,0.04) 0%, rgba(197,160,90,0.04) 100%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: '24px', opacity: 0.4 }}>🗺</div>
            <div style={{ fontSize: '13px', color: 'var(--t3)', letterSpacing: '0.04em' }}>Map view coming soon</div>
            <div style={{ fontSize: '11px', color: 'var(--t3)', opacity: 0.6 }}>Interactive map with real-time availability</div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

          <PremiumBanner placement="section" category="rentals" />
          <RentalsGrid listings={allListings} />

          {/* HOST CTA */}
          {allListings.length > 0 && (
            <div style={{
              marginTop: '4rem',
              padding: '2.5rem',
              background: 'linear-gradient(140deg, #1a1430 0%, #0d0d1a 60%, #080612 100%)',
              border: '0.5px solid rgba(122,170,238,0.15)',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(122,170,238,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>List your private space</div>
                <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Earn from your apartment, studio or suite. Verified renters, discreet bookings, your schedule.
                </p>
                <Link href="/advertise" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                  borderRadius: 'var(--r)', color: '#0a0a0a',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  Become a host →
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
