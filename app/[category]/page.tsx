import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { focusPosition } from '../lib/imageFocus'

const CATEGORY_META: Record<string, { title: string; description: string; heading: string; icon: string }> = {
  escorts: {
    title: 'Escort Services | SecretXperience',
    description: 'Browse verified escort services across Europe. Discreet, professional and fully verified advertisers in major cities.',
    heading: 'Escort Services',
    icon: 'ti-user',
  },
  companionship: {
    title: 'Companionship Services | SecretXperience',
    description: 'Refined companionship experiences. Verified advertisers for dinner dates, travel companions, and private meetings.',
    heading: 'Companionship',
    icon: 'ti-heart',
  },
  nightlife: {
    title: 'Adult Nightlife Venues | SecretXperience',
    description: 'Discover premium adult nightlife venues. Private clubs, swing clubs, bars, and exclusive events.',
    heading: 'Nightlife & Venues',
    icon: 'ti-building',
  },
  creators: {
    title: 'Adult Content Creators | SecretXperience',
    description: 'Subscribe to exclusive adult creator content. Premium photos, videos, and custom requests from verified creators.',
    heading: 'Content Creators',
    icon: 'ti-camera',
  },
  rentals: {
    title: 'Discreet Rental Spaces | SecretXperience',
    description: 'Private apartments, suites and discreet rental spaces for private meetings.',
    heading: 'Private Rentals',
    icon: 'ti-home',
  },
  massage: {
    title: 'Erotic & Tantric Massage | SecretXperience',
    description: 'Professional sensual, tantric and erotic massage services across Europe. Verified therapists, private premises.',
    heading: 'Massage & Wellness',
    icon: 'ti-massage',
  },
  domination: {
    title: 'Professional Domination & BDSM | SecretXperience',
    description: 'Verified professional dominants and BDSM practitioners across Europe. Private dungeons, all experience levels welcome.',
    heading: 'Domination & BDSM',
    icon: 'ti-crown',
  },
  experiences: {
    title: 'Luxury Adult Experiences | SecretXperience',
    description: 'Exclusive adult experiences and luxury encounters. Curated, verified, discreet.',
    heading: 'Luxury Experiences',
    icon: 'ti-sparkles',
  },
  adult: {
    title: 'Adult Services | SecretXperience',
    description: 'Premium adult services and experiences. All advertisers verified and independently listed.',
    heading: 'Adult Services',
    icon: 'ti-flame',
  },
  photo: {
    title: 'Adult Photography Studios | SecretXperience',
    description: 'Professional adult photography and video studios. Private sets, verified locations.',
    heading: 'Photo & Video Studios',
    icon: 'ti-camera',
  },
  hotels: {
    title: 'Discreet Hotels | SecretXperience',
    description: 'Adult-friendly hotels with guaranteed privacy and member discounts.',
    heading: 'Discreet Hotels',
    icon: 'ti-bed',
  },
  memberships: {
    title: 'Adult Memberships | SecretXperience',
    description: 'Exclusive membership programs for premium adult services and experiences.',
    heading: 'Memberships',
    icon: 'ti-crown',
  },
}

const CAT_NAV = [
  { value: 'escorts', label: 'Escorts' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'massage', label: 'Massage' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'creators', label: 'Creators' },
  { value: 'domination', label: 'Domination' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'rentals', label: 'Rentals' },
]

const CAT_HERO_BG: Record<string, string> = {
  escorts:       'linear-gradient(140deg,rgba(26,10,26,0.9),rgba(13,6,16,0.9))',
  companionship: 'linear-gradient(140deg,rgba(26,10,20,0.9),rgba(13,6,14,0.9))',
  massage:       'linear-gradient(140deg,rgba(10,26,26,0.9),rgba(6,13,13,0.9))',
  nightlife:     'linear-gradient(140deg,rgba(10,10,26,0.9),rgba(6,6,16,0.9))',
  creators:      'linear-gradient(140deg,rgba(26,26,10,0.9),rgba(13,13,6,0.9))',
  domination:    'linear-gradient(140deg,rgba(26,10,10,0.9),rgba(13,6,6,0.9))',
  experiences:   'linear-gradient(140deg,rgba(26,15,10,0.9),rgba(13,9,6,0.9))',
  rentals:       'linear-gradient(140deg,rgba(15,10,26,0.9),rgba(9,6,16,0.9))',
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const meta = CATEGORY_META[params.category]
  if (!meta) return { title: 'SecretXperience' }
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://www.secretxperience.eu/${params.category}`,
    },
  }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const meta = CATEGORY_META[params.category]
  if (!meta) notFound()

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, description, category, subcategory, city, country, price_from, price_to, images, image_focus, verified, premium, trending, rating, review_count, meet_type, featured_until')
    .eq('active', true)
    .ilike('category', params.category + '%')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false })
    .limit(48)

  const featured = (listings || []).filter(l => l.featured_until && new Date(l.featured_until) > new Date())
  const regular  = (listings || []).filter(l => !l.featured_until || new Date(l.featured_until) <= new Date())
  const heroBg = CAT_HERO_BG[params.category] || 'linear-gradient(140deg,rgba(20,12,30,0.9),rgba(8,6,18,0.9))'

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        .c-nav { display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; height:64px; position:sticky; top:0; z-index:200; background:rgba(8,6,18,0.92); backdrop-filter:blur(18px); border-bottom:0.5px solid var(--b); }
        .c-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
        .c-card { display:block; background:var(--bg1); border:0.5px solid var(--b); border-radius:var(--rl); overflow:hidden; text-decoration:none; transition:border-color .2s,transform .2s; }
        .c-card:hover { border-color:var(--b3); transform:translateY(-2px); }
        .c-card-hero { height:180px; position:relative; display:flex; align-items:flex-end; padding:1rem; }
        .c-card-body { padding:1rem 1.25rem; }
        .c-pill { height:32px; padding:0 14px; border-radius:20px; border:0.5px solid var(--b); background:transparent; color:var(--t2); display:inline-flex; align-items:center; gap:6px; text-decoration:none; font-size:13px; white-space:nowrap; transition:background .15s,color .15s; }
        .c-pill:hover { background:var(--bg2); color:var(--t); }
        .c-pill.active { background:var(--gbg); color:var(--gold); border-color:var(--gbrd); }
        .c-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; }
        .c-badge-feat { background:rgba(197,160,90,0.15); color:var(--gold); border:0.5px solid rgba(197,160,90,0.35); }
        .c-badge-ver  { background:rgba(38,212,160,0.12); color:#26d4a0; border:0.5px solid rgba(38,212,160,0.3); }
        .c-badge-prem { background:rgba(139,92,246,0.12); color:#a78bfa; border:0.5px solid rgba(139,92,246,0.3); }
        .c-badge-trend { background:rgba(245,168,38,0.12); color:#f5a826; border:0.5px solid rgba(245,168,38,0.3); }
        @media(max-width:640px) { .c-grid { grid-template-columns:1fr 1fr; gap:10px; } .c-card-hero { height:140px; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)' }}>

        {/* NAV */}
        <nav className="c-nav">
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 12px rgba(197,160,90,0.25))' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/search" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="ti ti-search" style={{ fontSize: '14px' }} /> Browse all
            </Link>
            <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
            <Link href="/advertise" style={{ height: '34px', padding: '0 14px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              List service
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ background: heroBg, borderBottom: '0.5px solid var(--b)', padding: '3.5rem 1.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%,rgba(197,160,90,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 600, opacity: 0.8 }}>SecretXperience</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
              <i className={`ti ${meta.icon}`} style={{ fontSize: '32px', color: 'var(--gold)', opacity: 0.7 }} />
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{meta.heading}</h1>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '1.25rem' }}>{meta.description}</p>
            <div style={{ fontSize: '13px', color: 'var(--t3)' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 500 }}>{listings?.length || 0}</span> advertisements available
            </div>
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)', overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '8px', alignItems: 'center', height: '52px', scrollbarWidth: 'none' }}>
            {CAT_NAV.map(cat => (
              <Link
                key={cat.value}
                href={`/${cat.value}`}
                className={`c-pill${cat.value === params.category ? ' active' : ''}`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

          {/* FEATURED */}
          {featured.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-sparkles" /> Featured
              </div>
              <div className="c-grid">
                {featured.map(l => <CCard key={l.id} l={l} isFeatured />)}
              </div>
              <div style={{ height: '0.5px', background: 'var(--b)', margin: '2.5rem 0' }} />
            </div>
          )}

          {/* ALL LISTINGS */}
          {!listings || listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>✦</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '22px' }}>Be among the first</div>
              <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '320px', lineHeight: 1.6 }}>No advertisements yet in this category. Be an early advertiser and reach clients from day one.</p>
              <Link href="/listings/create" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>List your service →</Link>
            </div>
          ) : (
            <div className="c-grid">
              {regular.map(l => <CCard key={l.id} l={l} isFeatured={false} />)}
            </div>
          )}

          {/* CTA */}
          {(listings?.length || 0) > 0 && (
            <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '0.75rem' }}>Are you a {meta.heading.toLowerCase()} advertiser?</div>
              <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem' }}>List your service for free and reach thousands of verified clients across Europe.</p>
              <Link href="/advertise" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                <i className="ti ti-plus" /> List your service — it's free
              </Link>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--gold)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--t3)' }}>
            Adults only (18+) ·{' '}
            <Link href="/terms" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Terms</Link>
            {' '}·{' '}
            <Link href="/privacy" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Privacy</Link>
          </p>
        </div>
      </div>
    </>
  )
}

function CCard({ l, isFeatured }: { l: any; isFeatured: boolean }) {
  const monogram = (l.title || 'Xx').slice(0, 2)
  return (
    <Link href={`/listings/${l.id}`} className="c-card">
      <div className="c-card-hero" style={{ background: 'var(--bg2)' }}>
        {l.images?.[0] && <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, l.images[0]), position: 'absolute', inset: 0 }} />}
        <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', display: 'flex', gap: '4px', flexWrap: 'wrap', zIndex: 2 }}>
          {isFeatured && <span className="c-badge c-badge-feat">✦ Featured</span>}
          {l.verified && <span className="c-badge c-badge-ver">✓ Verified</span>}
          {l.premium && <span className="c-badge c-badge-prem">Premium</span>}
          {l.trending && !isFeatured && !l.verified && <span className="c-badge c-badge-trend">Trending</span>}
        </div>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '64px', fontStyle: 'italic', fontWeight: 400, color: 'rgba(197,160,90,0.2)', lineHeight: 1, position: 'absolute', bottom: '0.25rem', left: '1rem', zIndex: 1 }}>{monogram}</span>
      </div>
      <div className="c-card-body">
        <div style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {l.subcategory || l.category}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--t)', marginBottom: '8px', lineHeight: 1.3 }}>{l.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--serif)' }}>
            {l.price_from ? `€${l.price_from}${l.price_to ? `–€${l.price_to}` : ''}` : 'POA'}
          </span>
          {l.rating > 0 && <span style={{ color: 'var(--t3)' }}>★ {Number(l.rating).toFixed(1)}</span>}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '6px' }}>
          <i className="ti ti-map-pin" style={{ marginRight: '4px' }} />{l.city}{l.country ? `, ${l.country}` : ''}
        </div>
      </div>
    </Link>
  )
}
