import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Link from 'next/link'
import CreatorsGrid from './CreatorsGrid'
import PremiumBanner from '../components/PremiumBanner/PremiumBanner'
import CreatorFeed from './CreatorFeed'
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

// Neon Pulse palette — remaps the shared theme tokens for this page only, so every
// child (grids, showcases, banners) inherits the electric violet/cyan look.
const neon = {
  '--bg': '#07060e', '--bg1': '#120e20', '--bg2': 'rgba(255,255,255,0.06)', '--bg3': 'rgba(255,255,255,0.04)',
  '--t': '#eef0ff', '--t2': '#b6bce0', '--t3': '#7a80a8',
  '--gold': '#8b6cf0', '--goldd': '#4be0d0',
  '--b': 'rgba(255,255,255,0.10)', '--b2': 'rgba(255,255,255,0.14)', '--b3': 'rgba(255,255,255,0.20)',
  '--gbg': 'rgba(139,108,240,0.14)', '--gbrd': 'rgba(139,108,240,0.40)',
} as React.CSSProperties

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
    .limit(200)

  const posts = (postRows || []) as any[]

  // Full directory of published content-creator profiles (role = 'creator' and
  // they have clicked "Upload profile" → studio_config.published). Read with the
  // service role so every creator shows regardless of the viewer's RLS scope.
  let directory: any[] = []
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: creatorRows } = await admin
      .from('profiles')
      .select('id, full_name, username, avatar_url, verified, headline, studio_config')
      .eq('role', 'creator')
      .not('username', 'is', null)
      .limit(1000)
    directory = (creatorRows || [])
      .filter((c: any) => c.username && c.studio_config?.published === true)
      .map((c: any) => ({
        id: c.id,
        full_name: c.full_name,
        username: c.username,
        avatar_url: c.avatar_url,
        verified: !!c.verified,
        headline: c.headline || '',
      }))
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Creators', item: 'https://www.secretxperience.eu/creators' },
        ]},
        { '@context': 'https://schema.org', '@type': 'Service', name: 'Adult Content Creators', serviceType: 'Adult Content Creation', advertiser: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' }, areaServed: ['BE','NL','DE','FR','LU','CH'], url: 'https://www.secretxperience.eu/creators', description: 'Subscribe to verified adult content creators — photos, videos, live sessions and custom content across Europe.' },
      ]) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; }
        .cr-aura{position:fixed;inset:-12%;z-index:0;pointer-events:none;filter:blur(14px)}
        .cr-blob{position:absolute;border-radius:50%;mix-blend-mode:screen;opacity:.85}
        .cr-b1{width:46vw;height:46vw;left:1%;top:-8%;background:radial-gradient(circle,rgba(139,108,240,.40),transparent 68%);animation:crD1 15s ease-in-out infinite alternate}
        .cr-b2{width:42vw;height:42vw;right:1%;top:-12%;background:radial-gradient(circle,rgba(75,224,208,.30),transparent 68%);animation:crD2 18s ease-in-out infinite alternate}
        .cr-b3{width:56vw;height:56vw;left:28%;bottom:-26%;background:radial-gradient(circle,rgba(230,80,180,.28),transparent 66%);animation:crD3 22s ease-in-out infinite alternate}
        @keyframes crD1{from{transform:translate(0,0) scale(1)}to{transform:translate(7vw,6vh) scale(1.12)}}
        @keyframes crD2{from{transform:translate(0,0) scale(1.05)}to{transform:translate(-7vw,5vh) scale(.94)}}
        @keyframes crD3{from{transform:translate(0,0) scale(1)}to{transform:translate(-5vw,-6vh) scale(1.1)}}
        .cr-panel{background:var(--bg2);border:.5px solid var(--b);border-radius:22px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .cr-fadein{opacity:0;transform:translateY(16px);animation:crFade .6s cubic-bezier(.2,.7,.2,1) forwards}
        @keyframes crFade{to{opacity:1;transform:none}}
        .cr-grad{background:linear-gradient(120deg,var(--gold),var(--goldd))}
        .cr-cta-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:13px;color:#0a0714;font-weight:700;font-size:13.5px;text-decoration:none;background:linear-gradient(120deg,var(--gold),var(--goldd));box-shadow:0 10px 30px -12px var(--gold)}
        .cr-mini b{font-family:var(--serif);font-size:44px;line-height:1;background:linear-gradient(120deg,var(--gold),var(--goldd));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;display:block}
        @media(max-width:860px){.cr-bento{grid-template-columns:1fr !important}}
        @media(prefers-reduced-motion:reduce){.cr-blob{animation:none!important}.cr-fadein{animation:none!important;opacity:1;transform:none}}
      ` }} />

      <div style={{ ...neon, background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)', position: 'relative', overflowX: 'hidden' }}>

        <div className="cr-aura" aria-hidden="true"><span className="cr-blob cr-b1" /><span className="cr-blob cr-b2" /><span className="cr-blob cr-b3" /></div>

        {/* NAV */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '62px', position: 'sticky', top: 0, zIndex: 200,
          background: 'rgba(8,6,16,0.55)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
          borderBottom: '0.5px solid var(--b)',
        }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--t)', letterSpacing: '.02em', textDecoration: 'none' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 400, background: 'linear-gradient(120deg,var(--gold),var(--goldd))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Xperience</em>
          </Link>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Link href="/creators/studio" className="cr-cta-btn" style={{ padding: '9px 16px', fontSize: '13px' }}>Become a content creator</Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '26px 1.5rem 5rem', position: 'relative', zIndex: 1 }}>

          {/* BENTO HERO */}
          <div className="cr-bento cr-fadein" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '26px' }}>
            <div className="cr-panel" style={{ padding: 'clamp(28px,4vw,40px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,108,240,.35),transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: '10.5px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '14px', fontWeight: 600 }}>SecretXperience · Creators</div>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 'clamp(38px,5.5vw,62px)', lineHeight: 1.03, letterSpacing: '-.01em' }}>
                Exclusive <em style={{ fontStyle: 'italic', background: 'linear-gradient(120deg,var(--gold),var(--goldd))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creators</em>, up close.
              </h1>
              <p style={{ fontSize: '14.5px', color: 'var(--t2)', maxWidth: '420px', lineHeight: 1.7, marginTop: '14px' }}>
                Subscribe, request custom content and message verified independent creators across Europe.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '22px' }}>
                <a href="#latest" className="cr-cta-btn">Explore creators</a>
                <Link href="/how-it-works" style={{ padding: '12px 20px', borderRadius: '13px', border: '0.5px solid var(--b2)', background: 'var(--bg2)', color: 'var(--t)', fontSize: '13.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>How it works</Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="cr-panel cr-mini" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <b>{allListings.length || 0}</b>
                <span style={{ fontSize: '11.5px', color: 'var(--t3)', letterSpacing: '0.05em', marginTop: '8px' }}>VERIFIED CREATORS</span>
              </div>
              <div className="cr-panel cr-mini" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <b>{directory.length || 0}</b>
                <span style={{ fontSize: '11.5px', color: 'var(--t3)', letterSpacing: '0.05em', marginTop: '8px' }}>PUBLISHED CREATOR PROFILES</span>
              </div>
            </div>
          </div>

          {/* LATEST — marketplace grid with filter rail + search (in CreatorFeed) */}
          <div id="latest" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '27px', fontWeight: 500, margin: 0 }}>All creators</h2>
              <Link href="/creators/studio" className="cr-cta-btn" style={{ padding: '9px 16px', fontSize: '13px' }}>
                <i className="ti ti-plus" /> Post content
              </Link>
            </div>
            <CreatorFeed posts={posts} directory={directory} />
          </div>

          {/* OnlyFans directory — inherits the neon palette */}
          <div style={{ margin: '0 -1.5rem 3rem' }}>
            <OnlyFansShowcase />
          </div>

          {allListings.length > 0 && (
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '27px', fontWeight: 500, margin: '0 0 1.25rem' }}>Book a creator</h2>
          )}

          {/* Creator link cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: '1.5rem' }}>
            <a href="https://allmylinks.com/cassie-redstarr" target="_blank" rel="noopener noreferrer nofollow" title="Cassie Redstarr — all links"
               style={{ display: 'block', width: 200, height: 200, borderRadius: 16, overflow: 'hidden', position: 'relative', border: '0.5px solid var(--gbrd)', boxShadow: '0 10px 32px -14px var(--gold)', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/promos/cassie-redstarr.jpg" alt="Cassie Redstarr" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', background: 'linear-gradient(120deg,var(--gold),var(--goldd))', borderRadius: 20, color: '#0a0714', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em' }}>ALL LINKS</span>
            </a>
            <a href="https://link.me/teknoshadows" target="_blank" rel="noopener noreferrer nofollow" title="Teknoshadows — all links"
               style={{ display: 'block', width: 200, height: 200, borderRadius: 16, overflow: 'hidden', position: 'relative', border: '0.5px solid var(--gbrd)', boxShadow: '0 10px 32px -14px var(--gold)', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/promos/teknoshadows.jpg" alt="Teknoshadows" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', background: 'linear-gradient(120deg,var(--gold),var(--goldd))', borderRadius: 20, color: '#0a0714', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em' }}>ALL LINKS</span>
            </a>
          </div>
          <PremiumBanner placement="section" category="creators" />
          <CreatorsGrid listings={allListings} />

          {/* CTA */}
          {allListings.length > 0 && (
            <div className="cr-panel" style={{ marginTop: '3.5rem', padding: '2.6rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(139,108,240,0.14),rgba(75,224,208,0.10))' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '30px', fontWeight: 500, marginBottom: '0.5rem' }}>Are you a creator?</div>
              <p style={{ fontSize: '14px', color: 'var(--t2)', maxWidth: '420px', margin: '0 auto 1.4rem', lineHeight: 1.6 }}>
                Join SecretXperience and reach a curated audience of verified adult-lifestyle enthusiasts across Europe.
              </p>
              <Link href="/advertise" className="cr-cta-btn" style={{ padding: '13px 26px', fontSize: '14px' }}>Start your creator profile →</Link>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: '0.5px solid var(--b)', padding: '2.2rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--t)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--gold)' }}>Xperience</em>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--t3)' }}>
            Adults only (18+) ·{' '}
            <Link href="/regulations" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Regulations</Link>{' '}·{' '}
            <Link href="/medical" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Medical Info</Link>{' '}·{' '}
            <Link href="/terms" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Terms</Link>{' '}·{' '}
            <Link href="/privacy" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Privacy</Link>
          </p>
        </footer>
      </div>
    </>
  )
}
