import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import { focusPosition } from '../lib/imageFocus'

const CATEGORIES = [
  { value: 'all',           label: 'All',             icon: 'ti-layout-grid' },
  { value: 'escorts',       label: 'Escorts',          icon: 'ti-user' },
  { value: 'companionship', label: 'Companionship',    icon: 'ti-heart' },
  { value: 'massage',       label: 'Massage',          icon: 'ti-massage' },
  { value: 'nightlife',     label: 'Nightlife',        icon: 'ti-building' },
  { value: 'creators',      label: 'Creators',         icon: 'ti-camera' },
  { value: 'domination',    label: 'Domination',       icon: 'ti-crown' },
  { value: 'experiences',   label: 'Experiences',      icon: 'ti-sparkles' },
  { value: 'rentals',       label: 'Rentals',          icon: 'ti-home' },
  { value: 'hotels',        label: 'Hotels',           icon: 'ti-bed' },
]

const CITIES = ['All cities', 'Brussels', 'Antwerp', 'Ghent', 'Amsterdam', 'Berlin', 'Paris', 'Barcelona', 'London']

const CAT_GRAD: Record<string, string> = {
  escorts:       'linear-gradient(140deg,#1a0a1a,#0d0610)',
  companionship: 'linear-gradient(140deg,#1a0a14,#0d060e)',
  massage:       'linear-gradient(140deg,#0a1a1a,#060d0d)',
  nightlife:     'linear-gradient(140deg,#0a0a1a,#060610)',
  creators:      'linear-gradient(140deg,#1a1a0a,#0d0d06)',
  domination:    'linear-gradient(140deg,#1a0a0a,#0d0606)',
  experiences:   'linear-gradient(140deg,#1a0f0a,#0d0906)',
  rentals:       'linear-gradient(140deg,#0f0a1a,#090610)',
}

const PAGE_SIZE = 24

export async function generateMetadata({ searchParams }: { searchParams: { q?: string; category?: string; city?: string } }): Promise<Metadata> {
  const q = searchParams.q || ''
  const cat = searchParams.category || ''
  const city = searchParams.city || ''
  const title = [q && `"${q}"`, cat && cat !== 'all' && cat, city && city !== 'All cities' && city].filter(Boolean).join(' · ')
  return {
    title: title ? `${title} — SecretXperience` : 'Browse All Listings — SecretXperience',
    description: 'Search and browse verified adult services, escorts, companions, nightlife venues and creators across Europe.',
    robots: { index: !q, follow: true },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; category?: string; city?: string; sort?: string; page?: string; verified?: string; meet?: string; min?: string; max?: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const q        = searchParams.q?.trim() || ''
  const category = searchParams.category || 'all'
  const city     = searchParams.city || ''
  const sort     = searchParams.sort || 'relevance'
  const page     = Math.max(0, parseInt(searchParams.page || '0') || 0)
  const verified = searchParams.verified === '1'
  const meetRaw  = searchParams.meet || ''
  const meet     = ['incall', 'outcall', 'both'].includes(meetRaw) ? meetRaw : ''
  const minPrice = searchParams.min ? parseInt(searchParams.min) : null
  const maxPrice = searchParams.max ? parseInt(searchParams.max) : null

  // Escape PostgREST-significant chars and ILIKE wildcards so user input can't break parsing or match unintentionally
  const safeQ = q.replace(/[,()*\\%_]/g, ' ').trim()

  let query = supabase
    .from('listings')
    .select('id,title,description,category,subcategory,city,country,price_from,price_to,verified,premium,trending,meet_type,featured_until,tags,images,image_focus', { count: 'exact' })
    .eq('active', true)

  if (safeQ) {
    const pattern = `%${safeQ}%`
    query = query.or(
      `title.ilike.${pattern},description.ilike.${pattern},city.ilike.${pattern},subcategory.ilike.${pattern}`
    )
  }
  if (category && category !== 'all') query = query.ilike('category', category + '%')
  if (city && city !== 'All cities') query = query.ilike('city', city + '%')
  if (verified) query = query.eq('verified', true)
  if (meet) query = query.or(`meet_type.eq.${meet},meet_type.eq.both`)
  if (minPrice != null) query = query.gte('price_from', minPrice)
  if (maxPrice != null) query = query.lte('price_from', maxPrice)

  query = query.order('featured_until', { ascending: false, nullsFirst: false })
  if (sort === 'price_asc') query = query.order('price_from', { ascending: true, nullsFirst: false })
  else if (sort === 'price_desc') query = query.order('price_from', { ascending: false, nullsFirst: false })
  else {
    query = query.order('created_at', { ascending: false })
  }

  let { data: listings, count: totalCount } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  // Client-side relevance bump: exact title matches first when there's a query
  if (safeQ && sort === 'relevance' && listings) {
    const needle = safeQ.toLowerCase()
    listings = [...listings].sort((a: any, b: any) => {
      const score = (l: any) => {
        const t = (l.title || '').toLowerCase()
        if (t === needle) return 100
        if (t.startsWith(needle)) return 50
        if (t.includes(needle)) return 25
        return 0
      }
      return score(b) - score(a)
    })
  }

  const featured = (listings || []).filter(l => l.featured_until && new Date(l.featured_until) > new Date())
  const regular  = (listings || []).filter(l => !l.featured_until || new Date(l.featured_until) <= new Date())

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        .s-nav { display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; height:64px; position:sticky; top:0; z-index:200; background:rgba(8,6,18,0.92); backdrop-filter:blur(18px); border-bottom:0.5px solid var(--b); }
        .s-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
        .s-card { display:block; background:var(--bg1); border:0.5px solid var(--b); border-radius:var(--rl); overflow:hidden; text-decoration:none; transition:border-color .2s,transform .2s; }
        .s-card:hover { border-color:var(--b3); transform:translateY(-2px); }
        .s-card-hero { height:180px; position:relative; display:flex; align-items:flex-end; padding:1rem; }
        .s-card-body { padding:1rem 1.25rem; }
        .s-cat-pill { height:32px; padding:0 14px; border-radius:20px; border:0.5px solid var(--b); background:transparent; color:var(--t2); display:inline-flex; align-items:center; gap:6px; text-decoration:none; font-size:13px; cursor:pointer; white-space:nowrap; transition:background .15s,color .15s,border-color .15s; }
        .s-cat-pill:hover, .s-cat-pill.active { background:var(--gbg); color:var(--gold); border-color:var(--gbrd); }
        .s-badge { font-size:10px; font-weight:700; letter-spacing:.06em; padding:2px 8px; border-radius:8px; }
        .s-badge-feat { background:rgba(197,160,90,0.15); color:var(--gold); border:0.5px solid rgba(197,160,90,0.35); }
        .s-badge-ver  { background:rgba(38,212,160,0.12); color:#26d4a0; border:0.5px solid rgba(38,212,160,0.3); }
        .s-badge-prem { background:rgba(139,92,246,0.12); color:#a78bfa; border:0.5px solid rgba(139,92,246,0.3); }
        .s-empty { grid-column:1/-1; text-align:center; padding:5rem 2rem; display:flex; flex-direction:column; align-items:center; gap:1.25rem; }
        .s-search { width:100%; height:52px; padding:0 50px 0 46px; background:var(--bg2); border:0.5px solid var(--b2); border-radius:26px; color:var(--t); font:400 14px var(--sans); }
        .s-search:focus { outline:none; border-color:var(--gbrd); }
        .s-search::placeholder { color:var(--t3); }
        @media(max-width:640px) { .s-grid { grid-template-columns:1fr 1fr; gap:10px; } .s-card-hero { height:140px; } .s-nav { padding:0 1rem; } }
        @media(max-width:480px) { .s-grid { grid-template-columns:1fr 1fr; gap:8px; } .s-card-hero { height:150px; } .s-price-row { width:100%; margin-left:0!important; } }
      `}</style>

      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)' }}>

        {/* NAV */}
        <nav className="s-nav">
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 12px rgba(197,160,90,0.30))' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/discover" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>✦</span> Discover
            </Link>
            <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
            <Link href="/regulations" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Regulations</Link>
            <Link href="/medical" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Medical</Link>
            <Link href="/advertise" style={{ height: '34px', padding: '0 14px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ti ti-plus" /> List service
            </Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

          {/* SEARCH BAR */}
          <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '18px', pointerEvents: 'none' }} />
            <form method="GET" action="/search">
              <input
                name="q"
                type="text"
                defaultValue={q}
                placeholder="Search listings, companions, venues…"
                className="s-search"
                autoComplete="off"
              />
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {city && city !== 'All cities' && <input type="hidden" name="city" value={city} />}
              {sort !== 'relevance' && <input type="hidden" name="sort" value={sort} />}
            </form>
            {q && (
              <Link href={`/search${category !== 'all' ? `?category=${category}` : ''}`} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '18px' }}>
                <i className="ti ti-x" />
              </Link>
            )}
          </div>

          {/* CATEGORY PILLS */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.value}
                href={`/search?${new URLSearchParams({ ...(q && { q }), category: cat.value, ...(city && city !== 'All cities' && { city }), ...(sort !== 'relevance' && { sort }) }).toString()}`}
                className={`s-cat-pill${category === cat.value ? ' active' : ''}`}
              >
                <i className={`ti ${cat.icon}`} style={{ fontSize: '13px' }} />
                {cat.label}
              </Link>
            ))}
          </div>

          {/* CITY + SORT ROW */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {CITIES.map(c => {
                const isActive = (c === 'All cities' && (!city || city === 'All cities')) || city === c
                return (
                  <Link
                    key={c}
                    href={`/search?${new URLSearchParams({ ...(q && { q }), ...(category !== 'all' && { category }), city: c === 'All cities' ? '' : c, ...(sort !== 'relevance' && { sort }) }).toString()}`}
                    style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '12px', border: `0.5px solid ${isActive ? 'var(--gbrd)' : 'var(--b)'}`, background: isActive ? 'var(--gbg)' : 'transparent', color: isActive ? 'var(--gold)' : 'var(--t3)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    {c}
                  </Link>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {[{ v: 'relevance', label: 'Relevant' }, { v: 'price_asc', label: 'Price ↑' }, { v: 'price_desc', label: 'Price ↓' }].map(s => (
                <Link
                  key={s.v}
                  href={`/search?${new URLSearchParams({ ...(q && { q }), ...(category !== 'all' && { category }), ...(city && city !== 'All cities' && { city }), sort: s.v }).toString()}`}
                  style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '12px', border: `0.5px solid ${sort === s.v ? 'var(--gbrd)' : 'var(--b)'}`, background: sort === s.v ? 'var(--gbg)' : 'transparent', color: sort === s.v ? 'var(--gold)' : 'var(--t3)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ADVANCED FILTERS */}
          <form method="GET" action="/search" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--b)' }}>
            {q && <input type="hidden" name="q" value={q} />}
            {category !== 'all' && <input type="hidden" name="category" value={category} />}
            {city && city !== 'All cities' && <input type="hidden" name="city" value={city} />}
            {sort !== 'relevance' && <input type="hidden" name="sort" value={sort} />}

            {/* Verified toggle */}
            <button type="submit" name="verified" value={verified ? '' : '1'}
              style={{ height: 32, padding: '0 14px', borderRadius: 20, border: `0.5px solid ${verified ? 'var(--gbrd)' : 'var(--b)'}`, background: verified ? 'var(--gbg)' : 'transparent', color: verified ? 'var(--gold)' : 'var(--t3)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              ✓ Verified only
            </button>

            {/* Meet type */}
            {(['', 'incall', 'outcall'] as const).map(m => (
              <button key={m || 'all'} type="submit" name="meet" value={m}
                style={{ height: 32, padding: '0 14px', borderRadius: 20, border: `0.5px solid ${meet === m ? 'var(--gbrd)' : 'var(--b)'}`, background: meet === m ? 'var(--gbg)' : 'transparent', color: meet === m ? 'var(--gold)' : 'var(--t3)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}>
                {m === '' ? 'Any location' : m === 'incall' ? 'Incall' : 'Outcall'}
              </button>
            ))}

            <div className="s-price-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>Price €</span>
              <input type="number" name="min" defaultValue={minPrice ?? ''} placeholder="Min" min={0} step={10}
                style={{ width: 68, height: 36, padding: '0 10px', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: 8, color: 'var(--t)', fontSize: 12, fontFamily: 'var(--sans)', outline: 'none' }} />
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>—</span>
              <input type="number" name="max" defaultValue={maxPrice ?? ''} placeholder="Max" min={0} step={10}
                style={{ width: 68, height: 36, padding: '0 10px', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: 8, color: 'var(--t)', fontSize: 12, fontFamily: 'var(--sans)', outline: 'none' }} />
              <button type="submit" style={{ height: 36, padding: '0 14px', borderRadius: 8, background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600 }}>Filter</button>
            </div>
          </form>

          {/* RESULTS COUNT */}
          <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>
              {totalCount ?? (listings?.length || 0)} {(totalCount ?? listings?.length ?? 0) === 1 ? 'listing' : 'listings'}
              {q && <span> matching <em style={{ color: 'var(--t2)' }}>"{q}"</em></span>}
              {category !== 'all' && <span> in <em style={{ color: 'var(--t2)', textTransform: 'capitalize' }}>{category}</em></span>}
              {city && city !== 'All cities' && <span> · <em style={{ color: 'var(--t2)' }}>{city}</em></span>}
            </span>
            {page > 0 && <span style={{ color: 'var(--t3)' }}>Page {page + 1}</span>}
          </div>

          {/* FEATURED STRIP */}
          {featured.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-sparkles" /> Featured
              </div>
              <div className="s-grid">
                {featured.map(l => <ListingCard key={l.id} l={l} isFeatured />)}
              </div>
              <div style={{ height: '0.5px', background: 'var(--b)', margin: '2.5rem 0' }} />
            </div>
          )}

          {/* ALL RESULTS */}
          {!listings || listings.length === 0 ? (
            <div className="s-empty">
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>✦</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--t)' }}>No advertisements found</div>
              <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '320px', lineHeight: 1.6 }}>
                {q ? `No results for "${q}". Try different keywords or browse by category.` : 'No listings match these filters. Try broadening your search.'}
              </p>
              <Link href="/search" style={{ padding: '10px 24px', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: 'var(--r)', color: 'var(--t2)', textDecoration: 'none', fontSize: '13px' }}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="s-grid">
              {regular.map(l => <ListingCard key={l.id} l={l} isFeatured={false} />)}
            </div>
          )}

          {/* PAGINATION */}
          {(totalCount ?? 0) > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '3rem' }}>
              {page > 0 && (
                <Link
                  href={`/search?${new URLSearchParams({ ...(q && { q }), ...(category !== 'all' && { category }), ...(city && city !== 'All cities' && { city }), ...(sort !== 'relevance' && { sort }), ...(verified && { verified: '1' }), ...(meet && { meet }), ...(minPrice != null && { min: String(minPrice) }), ...(maxPrice != null && { max: String(maxPrice) }), page: String(page - 1) }).toString()}`}
                  style={{ padding: '10px 20px', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--r)', color: 'var(--t2)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  ← Previous
                </Link>
              )}
              <span style={{ fontSize: '12px', color: 'var(--t3)', padding: '0 8px' }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount ?? 0)} of {totalCount}
              </span>
              {(page + 1) * PAGE_SIZE < (totalCount ?? 0) && (
                <Link
                  href={`/search?${new URLSearchParams({ ...(q && { q }), ...(category !== 'all' && { category }), ...(city && city !== 'All cities' && { city }), ...(sort !== 'relevance' && { sort }), ...(verified && { verified: '1' }), ...(meet && { meet }), ...(minPrice != null && { min: String(minPrice) }), ...(maxPrice != null && { max: String(maxPrice) }), page: String(page + 1) }).toString()}`}
                  style={{ padding: '10px 20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', borderRadius: 'var(--r)', color: 'var(--gold)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Next →
                </Link>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '0.75rem' }}>Are you an advertiser?</div>
            <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '1.5rem' }}>List your service for free and reach thousands of verified clients across Europe.</p>
            <Link href="/advertise" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <i className="ti ti-plus" /> List your service — it's free
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function isAvailableNow(tags: string[] | null | undefined): boolean {
  if (!tags) return false
  const now = new Date()
  const days = ['sun','mon','tue','wed','thu','fri','sat']
  const day = days[now.getDay()]
  const whTag = tags.find(t => t.startsWith(`wh:${day}:`))
  if (!whTag) return false
  const range = whTag.split(':')[2]
  if (!range || range === 'off') return false
  const [startStr, endStr] = range.split('-')
  if (!startStr || !endStr) return false
  const [sh, sm = 0] = startStr.split(':').map(Number)
  const [eh, em = 0] = endStr.split(':').map(Number)
  const cur = now.getHours() * 60 + now.getMinutes()
  const start = sh * 60 + (sm as number)
  const end   = eh * 60 + (em as number)
  return cur >= start && cur < end
}

function ListingCard({ l, isFeatured }: { l: any; isFeatured: boolean }) {
  const heroBg = (CAT_GRAD as any)[(l.category || '').toLowerCase()] || 'linear-gradient(140deg,#1a0a1a,#0d0610)'
  const monogram = (l.title || 'Xx').slice(0, 2)
  const availNow = isAvailableNow(l.tags)

  return (
    <Link href={`/listings/${l.id}`} className="s-card">
      <div className="s-card-hero" style={{ background: heroBg }}>
        {l.images?.[0] && (
          <img src={l.images[0]} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, l.images[0]), position: 'absolute', inset: 0 }} />
        )}
        <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', display: 'flex', gap: '4px', flexWrap: 'wrap', zIndex: 2 }}>
          {isFeatured && !l.premium && <span className="s-badge s-badge-feat">✦ Featured</span>}
          {l.premium && isFeatured && <span className="s-badge s-badge-prem">✦ Premium</span>}
          {l.verified && <span className="s-badge s-badge-ver">✓ Verified</span>}
          {availNow && <span className="s-badge" style={{ background: 'rgba(62,207,142,0.15)', color: '#3ecf8e', border: '0.5px solid rgba(62,207,142,0.35)' }}>● Available now</span>}
        </div>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '64px', fontStyle: 'italic', fontWeight: 400, color: 'rgba(197,160,90,0.25)', lineHeight: 1, position: 'absolute', bottom: '0.25rem', left: '1rem', zIndex: 1 }}>{monogram}</span>
      </div>
      <div className="s-card-body">
        <div style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {l.category}{l.subcategory && ` · ${l.subcategory}`}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--t)', marginBottom: '8px', lineHeight: 1.3 }}>{l.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--serif)' }}>
            {l.price_from ? `€${l.price_from}${l.price_to ? `–€${l.price_to}` : ''}` : 'POA'}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '6px' }}>
          <i className="ti ti-map-pin" style={{ marginRight: '4px' }} />{l.city}{l.country ? `, ${l.country}` : ''}
        </div>
      </div>
    </Link>
  )
}
