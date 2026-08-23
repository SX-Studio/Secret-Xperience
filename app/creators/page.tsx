import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import CreatorsGrid from './CreatorsGrid'
import PremiumBanner from '../components/PremiumBanner/PremiumBanner'
import CreatorFeed from './CreatorFeed'
import CreatorHub from './CreatorHub'
import AIGirlfriendBanner from './AIGirlfriendBanner'
import OnlyFansShowcase from '../components/OnlyFansShowcase/OnlyFansShowcase'

export async function generateMetadata() {
  return {
    title: 'Exclusive Creators | SecretXperience',
    description: 'Subscribe to exclusive adult content creators across Europe. Premium photos, videos, and custom content from verified creators.',
    openGraph: {
      title: 'Exclusive Creators | SecretXperience',
      description: 'Subscribe to exclusive adult content creators across Europe.',
      url: 'https://www.secretxperience.eu/creators',
    },
  }
}


export default async function CreatorsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, category, subcategory, city, country, price_from, price_to, images, image_focus, verified, premium, trending, rating, review_count, meet_type, featured_until, created_at, tags')
    .eq('active', true)
    .eq('category', 'creators')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  const allListings = listings || []

  const { data: postRows } = await supabase
    .from('creator_posts')
    .select('id, caption, media_url, media_type, created_at, creator:profiles!creator_id(id, full_name, username, avatar_url, verified, external_links)')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(40)

  const posts = (postRows || []) as any[]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Creators', item: 'https://www.secretxperience.eu/creators' },
        ]},
        { '@context': 'https://schema.org', '@type': 'Service', name: 'Adult Content Creators', serviceType: 'Adult Content Creation', advertiser: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' }, areaServed: ['BE','NL','DE','FR','LU','CH'], url: 'https://www.secretxperience.eu/creators', description: 'Subscribe to verified adult content creators — photos, videos, live sessions and custom content across Europe.' },
      ]) }} />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .creator-card:hover { transform: translateY(-5px) !important; box-shadow: 0 18px 52px rgba(0,0,0,0.6) !important; }
        .creator-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
        .filter-pill { height: 34px; padding: 0 16px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; text-decoration: none; transition: background 0.15s, color 0.15s, border-color 0.15s; cursor: pointer; letter-spacing: 0.02em; }
        .filter-pill:hover { background: var(--bg2); color: var(--t); border-color: var(--b2); }
        .filter-pill.active { background: rgba(197,160,90,0.12); color: var(--gold); border-color: rgba(197,160,90,0.38); font-weight: 600; }
        @media(max-width:640px) { .creator-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
        @media(max-width:380px) { .creator-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '60px',
          position: 'sticky', top: 0, zIndex: 200,
          background: 'rgba(8,6,18,0.94)', backdropFilter: 'blur(18px)',
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
              Become a creator
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(140deg, #2a0d2a 0%, #1a0d1a 50%, #080612 100%)',
          borderBottom: '0.5px solid var(--b)',
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,rgba(197,160,90,0.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 30%,rgba(139,43,63,0.12) 0%,transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
              SecretXperience · Creators
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              Exclusive <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Creators</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Subscribe · Request custom content · Direct message
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{allListings.length || 0}</span> creators available
              </span>
              <span style={{ width: '1px', height: '14px', background: 'var(--b3)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--t3)' }}>Verified &amp; independent</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

          {/* CREATOR HUB — slide banners, stats, meet & greets, expos, journal, earnings, brands */}
          <CreatorHub creatorCount={allListings.length} />

          {/* LATEST CONTENT FEED */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, margin: 0 }}>Latest from creators</h2>
              <Link href="/creators/studio" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: '0.5px solid rgba(197,160,90,0.3)', color: 'var(--gold)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                <i className="ti ti-plus" /> Post content
              </Link>
            </div>
            <CreatorFeed posts={posts} />
          </div>

          {/* OnlyFans creator directory — shared with homepage, data in app/data/onlyfans.ts */}
          <div style={{ margin: '0 -1.5rem 3rem' }}>
            <OnlyFansShowcase />
          </div>

          {/* AI girlfriend affiliate banner — gptgirlfriend.online */}
          <div style={{ marginBottom: '3rem' }}>
            <AIGirlfriendBanner />
          </div>

          {allListings.length > 0 && (
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, margin: '0 0 1.25rem' }}>Book a creator</h2>
          )}

          {/* Creator link card — Cassie Redstarr (allmylinks) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: '1.5rem' }}>
            <a href="https://allmylinks.com/cassie-redstarr" target="_blank" rel="noopener noreferrer nofollow" title="Cassie Redstarr — all links"
               style={{ display: 'block', width: 200, height: 200, borderRadius: 14, overflow: 'hidden', position: 'relative', border: '0.5px solid rgba(197,160,90,0.4)', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/promos/cassie-redstarr.jpg" alt="Cassie Redstarr" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', background: 'rgba(197,160,90,0.92)', borderRadius: 20, color: '#0a0a0a', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em' }}>ALL LINKS</span>
            </a>
            <a href="https://link.me/teknoshadows" target="_blank" rel="noopener noreferrer nofollow" title="Teknoshadows — all links"
               style={{ display: 'block', width: 200, height: 200, borderRadius: 14, overflow: 'hidden', position: 'relative', border: '0.5px solid rgba(197,160,90,0.4)', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/promos/teknoshadows.jpg" alt="Teknoshadows" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', background: 'rgba(197,160,90,0.92)', borderRadius: 20, color: '#0a0a0a', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em' }}>ALL LINKS</span>
            </a>
          </div>
          <PremiumBanner placement="section" category="creators" />
          <CreatorsGrid listings={allListings} />

          {/* CTA BANNER */}
          {allListings.length > 0 && (
            <div style={{
              marginTop: '4rem',
              padding: '2.5rem',
              background: 'linear-gradient(140deg, #2a0d2a 0%, #1a0d1a 60%, #110d1c 100%)',
              border: '0.5px solid rgba(197,160,90,0.2)',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(197,160,90,0.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>Are you a creator?</div>
                <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Join SecretXperience and reach a curated audience of verified adult lifestyle enthusiasts across Europe.
                </p>
                <Link href="/advertise" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                  borderRadius: 'var(--r)', color: '#0a0a0a',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  Start your creator profile →
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
