'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../app/lib/supabase'
import EscortProfile from './EscortProfile'

const ESCORT_CATEGORIES = new Set(['escorts', 'companionship', 'massage', 'domination', 'experiences'])

/* ─── Category helpers ───────────────────────────────────── */

const CATEGORY_ICONS: Record<string, string> = {
  escorts:       '✦',
  massage:       '◈',
  companionship: '◇',
  domination:    '◉',
  adult:         '▲',
  creators:      '◎',
  nightlife:     '◐',
  experiences:   '◆',
  rentals:       '□',
  events:        '◳',
  photo:         '◑',
  memberships:   '◈',
}

const CATEGORY_LABELS: Record<string, string> = {
  escorts:       'Escort',
  massage:       'Massage',
  companionship: 'Companionship',
  domination:    'Domination',
  adult:         'Adult Services',
  creators:      'Creators',
  nightlife:     'Nightlife',
  experiences:   'Experiences',
  rentals:       'Rentals',
  events:        'Event Spaces',
  photo:         'Photo / Video',
  memberships:   'Memberships',
}

const MEET_LABELS: Record<string, string> = {
  incall:  'Incall',
  outcall: 'Outcall',
  both:    'Incall & Outcall',
}

/* ─── Types ─────────────────────────────────────────────── */

interface Listing {
  id:          string
  title:       string
  description: string | null
  category:    string
  subcategory: string | null
  city:        string
  country:     string
  price_from:  number | null
  price_to:    number | null
  currency:    string
  meet_type:   string | null
  images:      string[] | null
  videos:      string[] | null
  verified:    boolean
  premium:     boolean
  trending:    boolean
  age:         number | null
  website:     string | null
  profile_id:  string
  profile: {
    full_name:  string | null
    username:   string | null
    avatar_url: string | null
    verified:   boolean
  }
}

const PERSONAL_CATS = new Set(['escorts','companionship','massage','domination','experiences'])

/* ─── Page ──────────────────────────────────────────────── */

export default function ListingDetailPage() {
  const params  = useParams()
  const id      = params?.id as string

  const [listing,   setListing]   = useState<Listing | null>(null)
  const [notFound,  setNotFound]  = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [session,   setSession]   = useState<any>(null)
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [isFaved,   setIsFaved]   = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  const [similarListings, setSimilarListings] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const supabase = createClient()
      const [{ data: { session: sess } }, { data, error }] = await Promise.all([
        supabase.auth.getSession(),
        supabase
          .from('listings')
          .select(`
            *,
            profile:profiles!profile_id (
              full_name,
              username,
              avatar_url,
              verified,
              phone,
              phone_verified,
              show_phone,
              whatsapp,
              whatsapp_verified,
              show_whatsapp
            )
          `)
          .eq('id', id)
          .single(),
      ])
      setSession(sess)
      if (sess?.user?.id) {
        supabase.from('favorites').select('listing_id').eq('user_id', sess.user.id).eq('listing_id', id).maybeSingle()
          .then(({ data: fav }) => setIsFaved(!!fav))
      }
      if (error || !data) {
        setNotFound(true)
      } else if ((data.active === false || (data.status && data.status !== 'approved')) && data.profile_id !== sess?.user?.id) {
        // Pending/rejected listings are only visible to their owner.
        setNotFound(true)
      } else {
        setListing(data as any)
        if (data.images?.length) setActiveImg(data.images[0])
        // Track view (fire-and-forget)
        supabase.from('listing_views').insert({ listing_id: id, viewer_id: sess?.user?.id || null }).then(() => {})
        // Fetch similar listings by same category
        const { data: sims } = await supabase
          .from('listings')
          .select('id, title, category, subcategory, city, country, price_from, verified, premium, rating')
          .eq('active', true)
          .ilike('category', (data.category || '') + '%')
          .neq('id', id)
          .order('rating', { ascending: false })
          .limit(3)
        setSimilarListings(sims || [])
        document.title = `${data.title} | SecretXperience`
        const ogTitle = `${data.title} | SecretXperience`
        const ogDesc  = data.description?.slice(0, 160) || `Book ${data.title} in ${data.city}`
        const ogImg   = data.images?.[0] || '/og-image.jpg'
        const ogUrl   = `https://www.secretxperience.eu/listings/${id}`

        const setMeta = (attr: 'name' | 'property', key: string, val: string) => {
          let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
          if (!el) { el = document.createElement('meta') as HTMLMetaElement; el.setAttribute(attr, key); document.head.appendChild(el) }
          el.content = val
        }
        setMeta('name', 'description', ogDesc)
        setMeta('property', 'og:title', ogTitle)
        setMeta('property', 'og:description', ogDesc)
        setMeta('property', 'og:image', ogImg)
        setMeta('property', 'og:url', ogUrl)
        setMeta('property', 'og:type', 'website')
        setMeta('property', 'twitter:card', 'summary_large_image')
        setMeta('property', 'twitter:title', ogTitle)
        setMeta('property', 'twitter:description', ogDesc)
        setMeta('property', 'twitter:image', ogImg)

        // JSON-LD
        const prev = document.getElementById('listing-jsonld')
        if (prev) prev.remove()
        const ld = document.createElement('script')
        ld.id = 'listing-jsonld'
        ld.type = 'application/ld+json'
        ld.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: data.title,
          description: data.description || '',
          image: data.images || [],
          url: ogUrl,
          areaServed: { '@type': 'City', name: data.city },
          serviceType: CATEGORY_LABELS[data.category] || data.category,
          ...(data.price_from ? { offers: { '@type': 'Offer', price: data.price_from, priceCurrency: data.currency || 'EUR' } } : {}),
        })
        document.head.appendChild(ld)
      }
      setPageLoading(false)
    }
    load()
  }, [id])

  /* ── Navigate to message/book (auth guard) ── */
  async function toggleFavorite() {
    if (!session) { window.location.href = `/login?next=/listings/${id}`; return }
    setFavLoading(true)
    const supabase = createClient()
    if (isFaved) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('listing_id', listing!.id)
      setIsFaved(false)
    } else {
      await supabase.from('favorites').upsert({ user_id: session.user.id, listing_id: listing!.id })
      setIsFaved(true)
    }
    setFavLoading(false)
  }

  function goToMessage() {
    if (!session) { window.location.href = `/login?next=/listings/${id}`; return }
    window.location.href = `/messages?provider_id=${listing!.profile_id}&listing_id=${listing!.id}&listing_title=${encodeURIComponent(listing!.title)}`
  }

  function goToBook() {
    if (!session) { window.location.href = `/login?next=/listings/${id}`; return }
    window.location.href = `/messages?provider_id=${listing!.profile_id}&listing_id=${listing!.id}&listing_title=${encodeURIComponent(listing!.title)}&preset=book`
  }

  async function shareLink() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title || 'SecretXperience', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  /* ── Shared styles ── */
  const fonts = ``

  /* ─── Loading ─── */
  if (pageLoading) return (
    <>
      <style>{`${fonts} body{background:#050505;margin:0;}`}</style>
      <div style={{
        minHeight: '100vh', background: '#050505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '1.5px solid rgba(197,160,90,0.2)',
          borderTop: '1.5px solid #c5a05a',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  )

  /* ─── Not found ─── */
  if (notFound || !listing) return (
    <>
      <style>{`${fonts} *, *::before, *::after{box-sizing:border-box;margin:0;padding:0;} body{background:#050505;}`}</style>
      <div style={{
        minHeight: '100vh', background: '#050505', color: '#ece8e1',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif", gap: '1.5rem', padding: '2rem',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', color: 'rgba(255,255,255,0.2)',
        }}>
          ◈
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '28px', fontWeight: 300,
          color: '#ece8e1', letterSpacing: '-0.01em',
        }}>
          Listing not found
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 300 }}>
          This listing may have been removed or doesn't exist.
        </p>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: '#c5a05a', fontSize: '13px', fontFamily: "'Poppins', sans-serif",
          fontWeight: 500, letterSpacing: '0.06em', textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          ← Back to home
        </a>
      </div>
    </>
  )

  // Only rentals and hotels support on-platform booking/payments
  const BOOKABLE_CATEGORIES = ['rentals', 'hotels', 'events', 'shop']
  const isBookable = BOOKABLE_CATEGORIES.includes(listing.category?.toLowerCase() || '')

  const cat       = listing.category
  const icon      = CATEGORY_ICONS[cat] || '◆'
  const catLabel  = CATEGORY_LABELS[cat] || cat
  const meetLabel = listing.meet_type ? (MEET_LABELS[listing.meet_type] || listing.meet_type) : null
  const hasImages = listing.images && listing.images.length > 0
  const prof      = listing.profile

  /* ── Escort/companion/massage/domination — use dedicated profile layout ── */
  if (ESCORT_CATEGORIES.has(cat)) {
    return (
      <>
        <style>{`
          ${fonts}
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #050505; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @media (min-width: 900px) { .ep-mobile-cta { display: none !important; } }
        `}</style>
        <div style={{ minHeight: '100vh', background: '#050505', color: '#ece8e1' }}>
          <nav style={{ background: 'rgba(5,5,5,0.95)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', height: '60px', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
            <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px 8px', fontSize: '18px', lineHeight: 1, borderRadius: '6px' }} aria-label="Go back">←</button>
            <a href="/" style={{ textDecoration: 'none', flex: 1 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, color: '#c5a05a', letterSpacing: '0.04em' }}>
                Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
              </span>
            </a>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{catLabel}</span>
          </nav>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem', animation: 'fadeUp 0.35s ease' }}>
            <EscortProfile
              listing={{ ...listing, tags: (listing as any).tags ?? [], services: (listing as any).services ?? [] }}
              session={session}
              isBookable={isBookable}
              onBook={isBookable ? goToBook : goToMessage}
              onMessage={goToMessage}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        ${fonts}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ld-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ld-tag {
          display: inline-flex; align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        .ld-thumb {
          width: 72px; height: 72px;
          object-fit: cover;
          border-radius: 8px;
          border: 1.5px solid transparent;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s, opacity 0.2s;
          opacity: 0.65;
        }
        .ld-thumb:hover { opacity: 1; }
        .ld-thumb.active {
          border-color: #c5a05a;
          opacity: 1;
        }
        .ld-book-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg,#c5a05a 0%,#a0803d 100%);
          border: none;
          border-radius: 12px;
          color: #080808;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
        }
        .ld-book-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);
          pointer-events: none;
        }
        .ld-book-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ld-msg-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 0.5px solid rgba(197,160,90,0.4);
          border-radius: 12px;
          color: #c5a05a;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .ld-msg-btn:hover {
          border-color: rgba(197,160,90,0.7);
          background: rgba(197,160,90,0.05);
        }
        @media (min-width: 768px) {
          .ld-layout { display: grid !important; grid-template-columns: 1fr 340px; gap: 2rem; }
        }
        @media (max-width: 480px) {
          .ld-hero-icon { font-size: 36px !important; }
        }
        .rv-submit {
          padding: 11px 28px;
          background: linear-gradient(135deg,#c5a05a 0%,#a0803d 100%);
          border: none;
          border-radius: 10px;
          color: #080808;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .rv-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);
          pointer-events: none;
        }
        .rv-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .rv-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .rv-cancel {
          padding: 11px 20px;
          background: transparent;
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: rgba(255,255,255,0.35);
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .rv-cancel:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.6); }
        .rv-leave-btn {
          padding: 10px 22px;
          background: transparent;
          border: 0.5px solid rgba(197,160,90,0.35);
          border-radius: 10px;
          color: #c5a05a;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .rv-leave-btn:hover { border-color: rgba(197,160,90,0.65); background: rgba(197,160,90,0.06); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#050505', color: '#ece8e1' }}>

        {/* ── Nav ── */}
        <nav style={{
          background: 'rgba(5,5,5,0.95)',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          height: '60px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '18px',
              lineHeight: 1,
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            aria-label="Go back"
          >
            ←
          </button>
          <a href="/" style={{ textDecoration: 'none', flex: 1 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20px',
              fontWeight: 400,
              color: '#c5a05a',
              letterSpacing: '0.04em',
            }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
          </a>
        </nav>

        {/* ── Body ── */}
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 6rem',
          animation: 'fadeUp 0.35s ease',
        }}>

          {/* Two-column layout on wide screens */}
          <div className="ld-layout" style={{ display: 'block' }}>

            {/* ── Left column ── */}
            <div>

              {/* Hero section */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                padding: '2rem 1.75rem',
                marginBottom: '1.5rem',
              }}>
                {/* Icon + Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="ld-hero-icon" style={{
                    fontSize: '44px',
                    color: 'rgba(197,160,90,0.7)',
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    {/* Badges row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.75rem' }}>
                      {/* Category pill */}
                      <span className="ld-badge" style={{
                        background: 'rgba(197,160,90,0.08)',
                        border: '0.5px solid rgba(197,160,90,0.25)',
                        color: 'rgba(197,160,90,0.8)',
                      }}>
                        {catLabel}
                      </span>
                      {listing.verified && (
                        <span className="ld-badge" style={{
                          background: 'rgba(80,160,120,0.1)',
                          border: '0.5px solid rgba(80,160,120,0.3)',
                          color: 'rgba(100,200,150,0.85)',
                        }}>
                          ✓ Verified
                        </span>
                      )}
                      {listing.premium && (
                        <span className="ld-badge" style={{
                          background: 'rgba(197,160,90,0.12)',
                          border: '0.5px solid rgba(197,160,90,0.35)',
                          color: '#c5a05a',
                        }}>
                          ★ Premium
                        </span>
                      )}
                      {listing.trending && (
                        <span className="ld-badge" style={{
                          background: 'rgba(184,77,114,0.1)',
                          border: '0.5px solid rgba(184,77,114,0.3)',
                          color: 'rgba(220,100,140,0.85)',
                        }}>
                          ↑ Trending
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(24px,4vw,36px)',
                      fontWeight: 400,
                      color: '#ece8e1',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      marginBottom: '0.75rem',
                    }}>
                      {listing.title}
                    </h1>

                    {/* City + meet type + age row */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
                    }}>
                      {listing.city && (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.4)',
                          fontWeight: 300,
                          letterSpacing: '0.03em',
                        }}>
                          📍 {listing.city}{listing.country ? `, ${listing.country}` : ''}
                        </span>
                      )}
                      {meetLabel && (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '13px',
                          color: 'rgba(197,160,90,0.55)',
                          fontWeight: 400,
                          letterSpacing: '0.05em',
                        }}>
                          {meetLabel}
                        </span>
                      )}
                      {PERSONAL_CATS.has(listing.category) && listing.age && (
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 300,
                          letterSpacing: '0.03em',
                        }}>
                          {listing.age} yrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price */}
                {(listing.price_from || listing.price_to) && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(197,160,90,0.07)',
                    border: '0.5px solid rgba(197,160,90,0.2)',
                    borderRadius: '10px',
                    marginBottom: '0',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '22px',
                      fontWeight: 400,
                      color: '#c5a05a',
                      letterSpacing: '0.01em',
                    }}>
                      {listing.price_from && listing.price_to
                        ? `€${listing.price_from} – €${listing.price_to}`
                        : listing.price_from
                        ? `from €${listing.price_from}`
                        : `up to €${listing.price_to}`}
                    </span>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '12px',
                      color: 'rgba(197,160,90,0.45)',
                      fontWeight: 300,
                    }}>
                      {listing.currency || 'EUR'}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo gallery */}
              {hasImages && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  {/* Main image */}
                  {activeImg && (
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '0.875rem',
                      background: 'rgba(255,255,255,0.03)',
                    }}>
                      <img
                        src={activeImg}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  {/* Thumbnail strip */}
                  {listing.images!.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {listing.images!.map((url, i) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className={`ld-thumb${activeImg === url ? ' active' : ''}`}
                          onClick={() => setActiveImg(url)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video gallery */}
              {listing.videos && listing.videos.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold, #c5a05a)', fontWeight: 600, marginBottom: '1rem', opacity: 0.8 }}>
                    Videos
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {listing.videos.map((url, i) => (
                      <video
                        key={url}
                        src={url}
                        controls
                        preload="metadata"
                        playsInline
                        style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 360, outline: 'none' }}
                        aria-label={`Video ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem 1.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}>
                    {PERSONAL_CATS.has(listing.category)
                      ? 'About this service'
                      : listing.category === 'nightlife'
                      ? 'About this venue'
                      : listing.category === 'events'
                      ? 'About this event'
                      : 'About this listing'}
                  </p>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.55)',
                    fontWeight: 300,
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {listing.description}
                  </p>
                </div>
              )}


              {/* Tags / subcategory */}
              {listing.subcategory && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px',
                  padding: '1.5rem 1.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    marginBottom: '0.875rem',
                  }}>
                    Tags
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="ld-tag">{listing.subcategory}</span>
                    <span className="ld-tag">{catLabel}</span>
                    {meetLabel && <span className="ld-tag">{meetLabel}</span>}
                  </div>
                </div>
              )}

            </div>

            {/* ── Similar listings ── */}
            {similarListings.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginBottom: '1rem' }}>
                  Similar listings
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {similarListings.map(s => (
                    <a key={s.id} href={`/listings/${s.id}`} style={{ textDecoration: 'none', display: 'block', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem 1.25rem', transition: 'border-color 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(197,160,90,0.3)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                    >
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                        {s.category}{s.subcategory ? ' · ' + s.subcategory : ''}
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: '#ece8e1', marginBottom: '6px', fontWeight: 400 }}>
                        {s.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#c5a05a' }}>
                          {s.price_from ? `€${s.price_from}` : 'POA'}
                        </span>
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                          {s.city || ''}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Right column (sidebar) ── */}
            <div>

              {/* Advertiser card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                padding: '1.5rem',
                marginBottom: '1rem',
              }}>
                <p style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  {listing.profile_id ? 'Advertiser' : 'Listing Info'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                    background: 'rgba(197,160,90,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {prof?.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={prof.full_name || 'Advertiser'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px',
                        color: 'rgba(197,160,90,0.6)',
                        fontWeight: 300,
                      }}>
                        {(prof?.full_name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name + verified */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#ece8e1',
                        letterSpacing: '0.01em',
                      }}>
                        {prof?.full_name || 'Anonymous'}
                      </span>
                      {prof?.verified && (
                        <span style={{
                          fontSize: '13px',
                          color: 'rgba(100,200,150,0.85)',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 500,
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                    {prof?.username && (
                      <span style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.28)',
                        fontWeight: 300,
                        letterSpacing: '0.03em',
                      }}>
                        @{prof.username}
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                {(() => {
                  const p = prof as any
                  const phoneNum = p?.show_phone === false ? null : (p?.phone || (listing as any).contact_phone || null)
                  const phoneVerified = !!(p?.phone && p?.phone_verified)
                  const waNum = p?.show_whatsapp === false ? null
                    : (p?.whatsapp || ((listing as any).whatsapp_optin ? (p?.phone || (listing as any).contact_phone) : null) || null)
                  const waVerified = !!(p?.whatsapp && p?.whatsapp_verified)
                  const waDigits = waNum ? String(waNum).replace(/[^0-9]/g, '') : ''
                  // Belgian numbers shown as +32 (0) 4XX XX XX XX; tel: stays clean (+32…).
                  const fmtPhone = (raw: any) => {
                    const d = String(raw).replace(/\D/g, '')
                    if (d.startsWith('32') && d.length >= 10) {
                      const n = d.slice(2)
                      const grouped = n.length === 9 ? n.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') : n
                      return `+32 (0) ${grouped}`
                    }
                    return '+' + d
                  }
                  const telClean = (raw: any) => '+' + String(raw).replace(/\D/g, '')
                  if (!phoneNum && !waNum) return null
                  return (
                    <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {phoneNum && (
                        <a href={`tel:${telClean(phoneNum)}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ece8e1', fontFamily: "'Poppins',sans-serif", fontSize: '14px' }}>
                          <span style={{ fontSize: '16px' }}>📞</span>
                          <span style={{ letterSpacing: '0.02em' }}>{fmtPhone(phoneNum)}</span>
                          {phoneVerified && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#1dc98f', background: 'rgba(29,201,143,0.1)', border: '0.5px solid rgba(29,201,143,0.35)', borderRadius: '20px', padding: '2px 7px' }}>✓</span>}
                        </a>
                      )}
                      {waNum && (
                        <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ece8e1', fontFamily: "'Poppins',sans-serif", fontSize: '14px' }}>
                          <span style={{ fontSize: '16px' }}>🟢</span>
                          <span>WhatsApp</span>
                          {waVerified && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#1dc98f', background: 'rgba(29,201,143,0.1)', border: '0.5px solid rgba(29,201,143,0.35)', borderRadius: '20px', padding: '2px 7px' }}>✓</span>}
                        </a>
                      )}
                    </div>
                  )
                })()}

                {/* View profile link — only when there's a real advertiser */}
                {listing.profile_id && (
                  <a
                    href={`/profile/${listing.profile_id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '0.5px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '13px',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s, color 0.2s',
                      width: '100%',
                      boxSizing: 'border-box',
                      marginTop: '0.75rem',
                    }}
                  >
                    View Profile →
                  </a>
                )}
              </div>

              {/* Pricing card */}
              {(listing.price_from || listing.price_to || listing.meet_type) && (
                <div style={{
                  background: 'rgba(197,160,90,0.04)',
                  border: '0.5px solid rgba(197,160,90,0.15)',
                  borderRadius: '18px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1rem',
                }}>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(197,160,90,0.45)',
                    fontWeight: 600,
                    marginBottom: '0.875rem',
                  }}>
                    Pricing details
                  </p>
                  {listing.price_from && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Starting from
                      </span>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#c5a05a', fontWeight: 400 }}>
                        €{listing.price_from}
                      </span>
                    </div>
                  )}
                  {listing.price_to && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Up to
                      </span>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#c5a05a', fontWeight: 400 }}>
                        €{listing.price_to}
                      </span>
                    </div>
                  )}
                  {listing.meet_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                        Meet type
                      </span>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>
                        {meetLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Website link — only render for safe http(s) URLs */}
              {listing.website && /^https?:\/\//i.test(listing.website) && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #c5a05a 0%, #a0803d 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#080808',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(197,160,90,0.25)',
                    marginBottom: '4px',
                    transition: 'opacity 0.2s, transform 0.15s',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                >
                  <i className="ti ti-external-link" style={{ fontSize: '14px' }} />
                  Visit Website
                </a>
              )}

              {/* CTA buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {listing.profile_id ? (
                  <>
                    <button type="button" className="ld-book-btn" onClick={isBookable ? goToBook : goToMessage}>
                      {isBookable ? 'Book Now' : 'Send Message'}
                    </button>
                    {isBookable && (
                      <button type="button" className="ld-msg-btn" onClick={goToMessage}>
                        Send Message
                      </button>
                    )}
                    <a href={`/gifts?to=${listing.profile_id}`} className="ld-msg-btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                      🎁 Send a gift
                    </a>
                  </>
                ) : (
                  <div style={{
                    padding: '13px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 300,
                    textAlign: 'center',
                    letterSpacing: '0.03em',
                    lineHeight: 1.6,
                  }}>
                    Contact details in venue description above
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '11px', borderRadius: 'var(--r, 8px)',
                    border: `0.5px solid ${isFaved ? 'rgba(197,160,90,0.5)' : 'var(--b, rgba(255,255,255,0.08))'}`,
                    background: isFaved ? 'rgba(197,160,90,0.1)' : 'transparent',
                    color: isFaved ? 'var(--gold, #c5a05a)' : 'var(--t2, rgba(236,232,225,0.55))',
                    cursor: favLoading ? 'default' : 'pointer',
                    fontSize: '13px', fontFamily: 'var(--sans)', transition: 'all .2s',
                  }}
                >
                  <i className={isFaved ? 'ti ti-heart-filled' : 'ti ti-heart'} />
                  {isFaved ? 'Saved' : 'Save advertisement'}
                </button>

                {/* Share button */}
                <button
                  type="button"
                  onClick={shareLink}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '11px', borderRadius: 'var(--r, 8px)',
                    border: 'var(--b, 0.5px solid rgba(255,255,255,0.08))',
                    background: 'transparent',
                    color: copied ? '#3ecf8e' : 'var(--t2, rgba(236,232,225,0.55))',
                    cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)', transition: 'all .2s',
                  }}
                >
                  <i className={copied ? 'ti ti-check' : 'ti ti-share'} />
                  {copied ? 'Link copied!' : 'Share'}
                </button>

                {/* Report link */}
                <a
                  href={`/report?listing_id=${listing.id}&listing_title=${encodeURIComponent(listing.title)}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '9px', borderRadius: 'var(--r, 8px)',
                    color: 'rgba(255,255,255,0.2)', fontSize: '11px',
                    fontFamily: 'var(--sans)', textDecoration: 'none',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    transition: 'color .2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = 'rgba(200,80,80,0.7)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                >
                  <i className="ti ti-flag" style={{ fontSize: '12px' }} />
                  Report advertisement
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
