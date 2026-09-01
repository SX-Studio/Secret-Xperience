'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ETHNICITIES, tagMatchesEthnicity, HAIR_COLOURS, tagMatchesHair, BUILDS, tagMatchesBuild, ORIENTATIONS, tagMatchesOrientation, tagMatchesType } from '../lib/attributes'
import PremiumBanner from '../components/PremiumBanner/PremiumBanner'
import { focusPosition } from '../lib/imageFocus'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
)

/* ── Types ──────────────────────────────────────────────── */
type Listing = {
  id: string
  profile_id: string
  title: string
  description: string | null
  category: string
  subcategory: string | null
  city: string
  country: string
  price_from: number | null
  price_to: number | null
  currency: string
  meet_type: string | null
  images: string[] | null
  image_focus: Record<string, { x: number; y: number }> | null
  verified: boolean
  premium: boolean
  tags: string[] | null
  created_at: string
  featured_until: string | null
  age: number | null
}

/* ── Filter config ──────────────────────────────────────── */
const ESCORT_TYPES = [
  { value: 'women',      label: 'Women',         icon: '♀' },
  { value: 'men',        label: 'Men / Gigolo',  icon: '♂' },
  { value: 'trans-woman',label: 'Trans Woman',   icon: '⚧' },
  { value: 'trans-man',  label: 'Trans Man',     icon: '⚧' },
  { value: 'non-binary', label: 'Non-Binary',    icon: '⊕' },
  { value: 'couples',    label: 'Couples',       icon: '♥' },
  { value: 'fetish',     label: 'Fetish',        icon: '◈' },
  { value: 'all',        label: 'All',           icon: '✦' },
]

const SEXUAL_ORIENTATION = [
  ...ORIENTATIONS,
  { value: 'all', label: 'Any' },
]

const MEET_TYPES = [
  { value: 'incall',  label: 'Incall / Private' },
  { value: 'outcall', label: 'Outcall / Escort' },
  { value: 'both',    label: 'Both' },
  { value: 'all',     label: 'Any' },
]

const ETHNICITY_FILTER = [...ETHNICITIES, 'Any']
const HAIR_COLORS = [...HAIR_COLOURS, 'Any']
const BUILDS_FILTER = [...BUILDS, 'Any']
const CITIES      = ['Brussels', 'Antwerp', 'Ghent', 'Grimbergen', 'Amsterdam', 'Berlin', 'Paris', 'Cologne', 'Rotterdam', 'All Cities']

const SERVICES_LIST = ['69','Anal','BDSM','Body Massage','Couples','Cum on Body','Cum on Face','Deep Throat','Doggy Style','Domina','Duo','Erotic Massage','Facesitting','Fetish','Foot Worship','French Kissing','GFE','Golden Shower','Handjob','Kissing','Lap Dance','Massage','Mistress','Oral','Prostate Massage','Rimming','Roleplay','Spanking','Squirting','Strap-on','Striptease','Tantra','Thai Massage','Threesome','Toys']

/* ── Helpers ────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d < 7) return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function isAvailableNow(tags: string[] | null | undefined): boolean {
  if (!tags) return false
  const days = ['sun','mon','tue','wed','thu','fri','sat']
  const now = new Date()
  const day = days[now.getDay()]
  const whTag = tags.find(t => t.startsWith(`wh:${day}:`))
  if (!whTag) return false
  const range = whTag.split(':')[2]
  if (!range || range === 'off') return false
  const [startStr, endStr] = range.split('-')
  if (!startStr || !endStr) return false
  const sh = parseInt(startStr), eh = parseInt(endStr)
  const cur = now.getHours()
  return cur >= sh && cur < eh
}

function isNewListing(createdAt: string): boolean {
  return (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
}

/* ── SpotlightStrip component ────────────────────────────── */
function SpotlightStrip({ items, discreet }: { items: Listing[]; discreet: boolean }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 5000)
    return () => clearInterval(t)
  }, [items.length])
  if (!items.length) return null
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(197,160,90,0.06) 0%, transparent 70%)', borderBottom: '0.5px solid rgba(197,160,90,0.15)', padding: '1.25rem 1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 800, fontFamily: 'var(--sans)' }}>✦ Featured Tonight</span>
          <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg, rgba(197,160,90,0.4), transparent)' }} />
          <span style={{ fontSize: '11px', color: 'var(--t3)', fontFamily: 'var(--sans)' }}>{idx + 1}/{items.length}</span>
          <button onClick={() => setIdx(i => (i - 1 + items.length) % items.length)} style={{ width: 28, height: 28, borderRadius: '50%', border: '0.5px solid var(--b2)', background: 'var(--bg1)', color: 'var(--t2)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)' }}>‹</button>
          <button onClick={() => setIdx(i => (i + 1) % items.length)} style={{ width: 28, height: 28, borderRadius: '50%', border: '0.5px solid var(--b2)', background: 'var(--bg1)', color: 'var(--t2)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)' }}>›</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'flex-end', paddingBottom: '4px' }}>
          {items.map((l, i) => {
            const img = l.images?.[0] || null
            const active = i === idx
            const availNow = isAvailableNow(l.tags)
            return (
              <Link key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: active ? 260 : 140, height: active ? 360 : 200, borderRadius: 'var(--rl)', overflow: 'hidden', position: 'relative', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', border: active ? '1.5px solid rgba(197,160,90,0.5)' : '0.5px solid var(--b)', boxShadow: active ? '0 0 28px rgba(197,160,90,0.18), 0 8px 32px rgba(0,0,0,0.5)' : 'none', opacity: active ? 1 : 0.5, cursor: 'pointer' }}>
                  {img
                    ? <img src={img} alt={l.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, img), filter: discreet ? 'blur(20px) brightness(0.4)' : 'none', transition: 'filter 0.3s' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '48px', fontStyle: 'italic', color: 'rgba(197,160,90,0.1)' }}>{l.title.charAt(0)}</div>
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,5,5,0.9) 0%, transparent 55%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ background: 'var(--grad-gold)', color: '#000', fontSize: '8px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.12em', display: 'inline-block' }}>✦ SPOTLIGHT</span>
                    {availNow && <span style={{ background: 'rgba(62,207,142,0.2)', border: '0.5px solid rgba(62,207,142,0.45)', color: '#3ecf8e', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 3 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#3ecf8e', display: 'inline-block' }} />LIVE</span>}
                  </div>
                  {active && (
                    <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', color: '#ece8e1', lineHeight: 1.15, marginBottom: 4 }}>
                        {l.title}{l.age ? <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'normal', marginLeft: 5 }}>{l.age}</span> : null}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
                        📍 {l.city}{l.price_from ? <span style={{ color: 'var(--gold)', marginLeft: 6 }}>from €{l.price_from}</span> : null}
                      </div>
                      <span style={{ background: 'var(--grad-gold)', color: '#000', fontSize: '11px', fontWeight: 700, padding: '6px 14px', borderRadius: '999px', letterSpacing: '0.04em' }}>View Profile →</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        {items.length > 1 && (
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: '10px' }}>
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 5, height: 4, borderRadius: 2, background: i === idx ? 'var(--gold)' : 'rgba(197,160,90,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.25s', padding: 0 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Card component ─────────────────────────────────────── */
function EscortCard({ l, discreet, isPremier, isLive }: { l: Listing; discreet: boolean; isPremier?: boolean; isLive?: boolean }) {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = l.images || []
  const img = imgs[imgIdx] || imgs[0] || null
  const availNow = isAvailableNow(l.tags)
  const isNew = isNewListing(l.created_at)

  function slide(dir: number, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setImgIdx(i => (i + dir + imgs.length) % imgs.length)
  }

  return (
    <Link href={`/listings/${l.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <article
        style={{
          background: 'var(--bg1)', border: isPremier ? '1.5px solid rgba(197,160,90,0.35)' : '0.5px solid var(--b)',
          borderRadius: 'var(--rl)', overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.15s',
          cursor: 'pointer', position: 'relative',
          boxShadow: isPremier ? '0 0 18px rgba(197,160,90,0.08)' : 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(-4px)'
          el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)'
          el.style.borderColor = 'var(--b3)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = ''
          el.style.boxShadow = ''
          el.style.borderColor = 'var(--b)'
        }}
      >
        {/* Portrait image with slider */}
        <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--bg2)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={l.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, img), display: 'block', filter: discreet ? 'blur(24px) brightness(0.5)' : 'none', transition: 'filter 0.3s ease' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '72px', fontStyle: 'italic', color: 'rgba(197,160,90,0.08)' }}>
              {l.title.charAt(0)}
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 45%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Slider arrows */}
          {imgs.length > 1 && (
            <>
              <button onClick={e => slide(-1, e)} className="slide-btn slide-prev" aria-label="Previous"><i className="ti ti-chevron-left" /></button>
              <button onClick={e => slide(1, e)} className="slide-btn slide-next" aria-label="Next"><i className="ti ti-chevron-right" /></button>
              <span className="slide-ctr">{imgIdx + 1}/{imgs.length}</span>
            </>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {isPremier && (
              <span style={{ background: 'rgba(197,160,90,0.15)', border: '0.5px solid rgba(197,160,90,0.5)', color: 'var(--gold)', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px', letterSpacing: '0.1em', backdropFilter: 'blur(6px)' }}>PREMIÈRE</span>
            )}
            {l.verified && (
              <span style={{ background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>VERIFIED</span>
            )}
            {l.premium && !isPremier && (
              <span style={{ background: 'var(--grad-gold)', color: '#000', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em' }}>VIP</span>
            )}
            {isLive && (
              <a href="/livestreams" onClick={e => e.stopPropagation()} style={{ background: 'rgba(239,68,68,0.2)', border: '0.5px solid rgba(239,68,68,0.55)', color: '#ef4444', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.1em', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px #ef4444', animation: 'livepulse 1.2s infinite' }} />
                LIVE NOW
              </a>
            )}
            {availNow && (
              <span style={{ background: 'rgba(62,207,142,0.18)', border: '0.5px solid rgba(62,207,142,0.45)', color: '#3ecf8e', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3ecf8e', display: 'inline-block', boxShadow: '0 0 4px #3ecf8e' }} />
                AVAILABLE
              </span>
            )}
            {isNew && !availNow && (
              <span style={{ background: 'rgba(130,100,220,0.18)', border: '0.5px solid rgba(130,100,220,0.4)', color: '#a78bfa', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>NEW</span>
            )}
          </div>

          {/* Bottom info overlay: name + age + location */}
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', fontWeight: 400, color: '#ece8e1', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {l.title}
              </span>
              {l.age && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--sans)', flexShrink: 0 }}>{l.age}</span>}
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>📍 {l.city}</span>
          </div>

          {/* Hover overlay */}
          <div className="card-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(197,160,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
            <span style={{ background: 'var(--grad-gold)', color: '#000', fontWeight: 700, fontSize: '13px', padding: '10px 24px', borderRadius: '999px', letterSpacing: '0.06em' }}>View Profile →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

/* ── Main page ──────────────────────────────────────────── */
export default function EscortsPage() {
  const [listings, setListings]         = useState<Listing[]>([])
  const [liveSet, setLiveSet]           = useState<Set<string>>(new Set())
  const [loading, setLoading]           = useState(true)
  const [showFilters, setShowFilters]   = useState(false)
  const [discreetMode, setDiscreetMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sx_discreet') === '1'
    return false
  })

  // Filter state
  const [escortType, setEscortType]     = useState('women')
  const [orientation, setOrientation]   = useState('all')
  const [meetType, setMeetType]         = useState('all')
  const [city, setCity]                 = useState('All Cities')
  const [priceMin, setPriceMin]         = useState(0)
  const [priceMax, setPriceMax]         = useState(1000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [ethnicity, setEthnicity]       = useState('Any')
  const [hairColor, setHairColor]       = useState('Any')
  const [build, setBuild]               = useState('Any')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [sortBy, setSortBy]             = useState<'price_asc' | 'price_desc' | 'newest' | 'available'>('newest')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
    let q = supabase
      .from('listings')
      .select('id,profile_id,title,description,category,subcategory,city,country,price_from,price_to,currency,meet_type,images,image_focus,verified,premium,tags,created_at,featured_until,age')
      .eq('active', true)
      .in('category', ['escorts', 'companionship', 'domination', 'experiences', 'massage'])

    if (city !== 'All Cities') q = q.eq('city', city)
    if (verifiedOnly) q = q.eq('verified', true)
    if (meetType !== 'all') q = q.eq('meet_type', meetType)
    if (priceMin > 0) q = q.gte('price_from', priceMin)
    if (priceMax < 1000) q = q.lte('price_from', priceMax)

    if (sortBy === 'price_asc') q = q.order('price_from', { ascending: true, nullsFirst: false })
    else if (sortBy === 'price_desc') q = q.order('price_from', { ascending: false, nullsFirst: false })
    else q = q.order('created_at', { ascending: false })

    q = q.limit(60)

    const { data } = await q
    let results = data ?? []

    // Client-side filters for tag-based fields
    if (escortType !== 'all') {
      results = results.filter(l => {
        const rawTags = l.tags ?? []
        const tags = rawTags.map((t: string) => t.toLowerCase())
        const sub = (l.subcategory ?? '').toLowerCase()
        if (rawTags.some((t: string) => tagMatchesType(t, escortType))) return true
        // Category / subcategory fallbacks for listings without an explicit type tag
        if (escortType === 'women') return !tags.some((t: string) => tagMatchesType(t, 'men') || t.includes('trans') || tagMatchesType(t, 'couples') || tagMatchesType(t, 'non-binary'))
        if (escortType === 'men') return sub.includes('gigolo') || sub.includes('male')
        if (escortType === 'couples') return sub.includes('couple')
        if (escortType === 'fetish') return l.category === 'domination'
        return false
      })
    }
    if (orientation !== 'all') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => tagMatchesOrientation(t, orientation)))
    }
    if (ethnicity !== 'Any') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => tagMatchesEthnicity(t, ethnicity)))
    }
    if (hairColor !== 'Any') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => tagMatchesHair(t, hairColor)))
    }
    if (build !== 'Any') {
      results = results.filter(l => (l.tags ?? []).some((t: string) => tagMatchesBuild(t, build)))
    }
    if (selectedServices.length > 0) {
      results = results.filter(l => {
        const tags = (l.tags ?? []).map((t: string) => t.toLowerCase())
        return selectedServices.some(s => tags.includes(s.toLowerCase()))
      })
    }

    if (sortBy === 'available') {
      results = [...results].sort((a, b) => {
        const aAvail = isAvailableNow(a.tags) ? 1 : 0
        const bAvail = isAvailableNow(b.tags) ? 1 : 0
        return bAvail - aAvail
      })
    }

    setListings(results)
    setLoading(false)
    } catch { setLoading(false) }
  }, [escortType, orientation, meetType, city, priceMin, priceMax, verifiedOnly, ethnicity, hairColor, build, selectedServices, sortBy])

  useEffect(() => { fetchListings() }, [fetchListings])

  // Read ?gender= query param from the pill dropdowns on the homepage and
  // pre-apply the matching filter on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const g = new URLSearchParams(window.location.search).get('gender')
    if (!g) return
    if (g === 'female')      setEscortType('women')
    else if (g === 'male')   setEscortType('men')
    else if (g === 'trans')  setEscortType('trans-woman')
    else if (g === 'couple') setEscortType('couples')
    else if (g === 'gay')    { setEscortType('all'); setOrientation('gay') }
  }, [])

  useEffect(() => {
    async function fetchLive() {
      const { data } = await supabase.from('live_streams').select('provider_id').eq('status', 'live')
      setLiveSet(new Set((data || []).map((r: any) => r.provider_id)))
    }
    fetchLive()
    const ch = supabase.channel('live_badge_escorts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, fetchLive)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  function toggleService(s: string) {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function resetFilters() {
    setEscortType('all'); setOrientation('all'); setMeetType('all')
    setCity('All Cities'); setPriceMin(0); setPriceMax(1000)
    setVerifiedOnly(false); setEthnicity('Any'); setHairColor('Any')
    setBuild('Any'); setSelectedServices([])
  }

  const activeFilterCount = [
    escortType !== 'all', orientation !== 'all', meetType !== 'all',
    city !== 'All Cities', priceMin > 0, priceMax < 1000, verifiedOnly,
    ethnicity !== 'Any', hairColor !== 'Any', build !== 'Any',
    selectedServices.length > 0,
  ].filter(Boolean).length

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
        { '@type': 'ListItem', position: 2, name: 'Escorts', item: 'https://www.secretxperience.eu/escorts' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Escort Services',
      serviceType: 'Adult Escort Services',
      advertiser: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' },
      areaServed: ['BE', 'NL', 'DE', 'FR', 'LU', 'CH'],
      url: 'https://www.secretxperience.eu/escorts',
      description: 'Browse verified independent escorts across Belgium, Netherlands, Germany and France. Filter by city, type, price and availability.',
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t)', fontFamily: 'var(--sans)' }}>
      <style>{`
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .card-container:hover .card-hover-overlay { opacity: 1 !important; }
        .filter-select { background: var(--bg2); border: 0.5px solid var(--b2); border-radius: var(--r); color: var(--t); padding: 8px 12px; font-size: 13px; font-family: var(--sans); outline: none; width: 100%; cursor: pointer; }
        .filter-select:focus { border-color: var(--b3); }
        .price-slider { -webkit-appearance: none; width: 100%; height: 3px; border-radius: 2px; background: var(--b2); outline: none; cursor: pointer; }
        .price-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); cursor: pointer; border: 2px solid var(--bg); box-shadow: 0 0 6px rgba(197,160,90,0.4); }
        .service-chip { padding: 5px 12px; border-radius: 20px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 12px; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: var(--sans); }
        .service-chip.active { background: var(--gbg); color: var(--gold); border-color: var(--gbrd); }
        .type-btn { padding: 8px 16px; border-radius: 999px; border: 0.5px solid var(--b); background: transparent; color: var(--t2); font-size: 13px; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: var(--sans); display: inline-flex; align-items: center; gap: 5px; }
        .type-btn.active { background: var(--gbg); color: var(--gold); border-color: var(--gbrd); font-weight: 600; }
        .filter-panel { display: none; }
        @keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
        .filter-panel.open { display: block; }
        @media (min-width: 900px) { .filter-panel { display: block !important; } .mobile-filter-toggle { display: none !important; } }
        .listing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        @media (max-width: 640px) { .listing-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }
        @media (max-width: 480px) { .listing-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; } }
        .filter-aside { width: 260px; flex-shrink: 0; }
        @media (max-width: 899px) { .filter-aside { width: 100%; } }
        .escorts-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
        @media (max-width: 899px) { .escorts-layout { flex-direction: column; } }
        .escorts-nav-links { display: flex; align-items: center; gap: 1rem; }
        @media (max-width: 640px) { .escorts-nav-links { display: none; } }
        .premier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.1rem; }
        @media (max-width: 640px) { .premier-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: '60px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(5,5,5,0.95)', borderBottom: '0.5px solid var(--b)', backdropFilter: 'blur(18px)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontStyle: 'italic', color: 'var(--gold)', textDecoration: 'none' }}>
          Secret<em style={{ fontStyle: 'normal' }}>X</em>perience
        </Link>
        <div style={{ flex: 1 }} />
        <div className="escorts-nav-links">
          <Link href="/discover" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>✦ Discover</Link>
          <Link href="/companionship" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Companionship</Link>
          <Link href="/massage" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Massage</Link>
          <Link href="/nightlife" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Nightlife</Link>
          <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
          <Link href="/regulations" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Rights &amp; Regs</Link>
        </div>
        <button
          onClick={() => {
            const next = !discreetMode
            setDiscreetMode(next)
            localStorage.setItem('sx_discreet', next ? '1' : '0')
          }}
          title={discreetMode ? 'Exit discreet mode' : 'Discreet mode — blur photos'}
          style={{ background: discreetMode ? 'rgba(197,160,90,0.15)' : 'transparent', border: `0.5px solid ${discreetMode ? 'var(--gbrd)' : 'var(--b2)'}`, borderRadius: 8, padding: '6px 12px', color: discreetMode ? 'var(--gold)' : 'var(--t3)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all .15s' }}
        >
          {discreetMode ? '👁 Discreet on' : '👁 Discreet'}
        </button>
        <Link href="/listings/create" style={{ background: 'var(--grad-gold)', color: '#000', fontSize: '13px', fontWeight: 700, padding: '7px 16px', borderRadius: '999px', textDecoration: 'none', letterSpacing: '0.04em' }}>
          + Advertise
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(197,160,90,0.07) 0%, var(--bg) 60%)', borderBottom: '0.5px solid var(--b)', padding: '3rem 1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', opacity: 0.8 }}>SecretXperience · Escorts</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 5vw, 56px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.08, marginBottom: '0.75rem' }}>
            Escort Services
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: '15px', maxWidth: '520px', lineHeight: 1.7 }}>
            Verified independent escorts and companions across Europe. Browse by type, orientation, location and services.
          </p>

          {/* Browse by country/city — jumps to dedicated location pages */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '0.6rem' }}>Browse by location</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {[['belgium','🇧🇪 Belgium'],['netherlands','🇳🇱 Netherlands'],['germany','🇩🇪 Germany'],['france','🇫🇷 France'],['luxembourg','🇱🇺 Luxembourg'],['switzerland','🇨🇭 Switzerland']].map(([slug, label]) => (
                <Link key={slug} href={`/escorts/${slug}`} style={{ fontSize: '13px', padding: '6px 14px', border: '0.5px solid var(--gbrd)', borderRadius: '20px', color: 'var(--gold)', background: 'var(--gbg)', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 500 }}>{label}</Link>
              ))}
              {[['brussels','Brussels'],['antwerp','Antwerp'],['amsterdam','Amsterdam'],['berlin','Berlin'],['paris','Paris']].map(([slug, label]) => (
                <Link key={slug} href={`/escorts/${slug}`} style={{ fontSize: '13px', padding: '6px 14px', border: '0.5px solid var(--b)', borderRadius: '20px', color: 'var(--t2)', textDecoration: 'none', whiteSpace: 'nowrap' }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Escort type tabs */}
      <div style={{ background: 'rgba(10,10,14,0.9)', backdropFilter: 'blur(16px)', borderBottom: '0.5px solid var(--b)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {ESCORT_TYPES.map(t => (
            <button key={t.value} className={`type-btn${escortType === t.value ? ' active' : ''}`} onClick={() => setEscortType(t.value)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Spotlight: premium listings with active featured boost ── */}
      {!loading && (() => {
        const now = new Date().toISOString()
        const sl = listings.filter(l => l.premium && l.featured_until && l.featured_until > now)
        return <SpotlightStrip items={sl} discreet={discreetMode} />
      })()}

      <div className="escorts-layout" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>

        {/* ── Filter sidebar ── */}
        <aside className="filter-aside" style={{ position: 'sticky', top: '80px' }}>

          {/* Mobile toggle */}
          <button
            className="mobile-filter-toggle"
            onClick={() => setShowFilters(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', padding: '12px 16px', color: 'var(--t)', fontSize: '14px', cursor: 'pointer', marginBottom: '1rem', fontFamily: 'var(--sans)' }}
          >
            <span>Filters {activeFilterCount > 0 && <span style={{ background: 'var(--grad-gold)', color: '#000', borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: 700, marginLeft: '6px' }}>{activeFilterCount}</span>}</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>

          <div className={`filter-panel${showFilters ? ' open' : ''}`}>
            <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Search city */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>City</div>
                <select className="filter-select" value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Sexual orientation */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Sexual Orientation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {SEXUAL_ORIENTATION.map(o => (
                    <button key={o.value} onClick={() => setOrientation(o.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', padding: '5px 8px', borderRadius: '8px', fontSize: '13px', color: orientation === o.value ? 'var(--gold)' : 'var(--t2)', background: orientation === o.value ? 'var(--gbg)' : 'transparent', fontFamily: 'var(--sans)', textAlign: 'left' } as any}>
                      <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid ' + (orientation === o.value ? 'var(--gold)' : 'var(--b2)'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {orientation === o.value && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gold)' }} />}
                      </span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meet type */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Meet Type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {MEET_TYPES.map(m => (
                    <button key={m.value} onClick={() => setMeetType(m.value)} style={{ padding: '5px 12px', borderRadius: '20px', border: '0.5px solid ' + (meetType === m.value ? 'var(--gbrd)' : 'var(--b)'), background: meetType === m.value ? 'var(--gbg)' : 'transparent', color: meetType === m.value ? 'var(--gold)' : 'var(--t2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Price per Hour</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--t)', flex: 1, textAlign: 'center' }}>
                    €{priceMin}
                  </div>
                  <span style={{ color: 'var(--t3)', fontSize: '12px' }}>–</span>
                  <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--t)', flex: 1, textAlign: 'center' }}>
                    €{priceMax === 1000 ? '1000+' : priceMax}
                  </div>
                </div>
                <input type="range" aria-label="Minimum price" className="price-slider" min={0} max={1000} step={25} value={priceMin} onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax))} />
                <input type="range" aria-label="Maximum price" className="price-slider" min={0} max={1000} step={25} value={priceMax} onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin))} style={{ marginTop: '4px' }} />
              </div>

              {/* Ethnicity */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Ethnicity</div>
                <select className="filter-select" value={ethnicity} onChange={e => setEthnicity(e.target.value)}>
                  {ETHNICITY_FILTER.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>

              {/* Build */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Build</div>
                <select className="filter-select" value={build} onChange={e => setBuild(e.target.value)}>
                  {BUILDS_FILTER.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              {/* Hair color */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Hair Color</div>
                <select className="filter-select" value={hairColor} onChange={e => setHairColor(e.target.value)}>
                  {HAIR_COLORS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>

              {/* Services */}
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '8px', fontWeight: 600 }}>Services / Possibilities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {SERVICES_LIST.map(s => (
                    <button key={s} className={`service-chip${selectedServices.includes(s) ? ' active' : ''}`} onClick={() => toggleService(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified only */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div onClick={() => setVerifiedOnly(v => !v)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1.5px solid ' + (verifiedOnly ? 'var(--gold)' : 'var(--b2)'), background: verifiedOnly ? 'var(--gbg)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
                  {verifiedOnly && <span style={{ color: 'var(--gold)', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--t2)' }}>Verified only</span>
              </label>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} style={{ width: '100%', padding: '9px', background: 'none', border: '0.5px solid var(--b)', borderRadius: 'var(--r)', color: 'var(--t3)', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--sans)', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b3)'; (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b)'; (e.currentTarget as HTMLElement).style.color = 'var(--t3)' }}
                >
                  ✕ Reset filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Results ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Results bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '13px', color: 'var(--t3)' }}>
              {loading ? 'Loading…' : <><span style={{ color: 'var(--t)', fontWeight: 600 }}>{listings.length}</span> escorts found</>}
              {activeFilterCount > 0 && <span style={{ color: 'var(--gold)', marginLeft: '8px', fontSize: '12px' }}>({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)</span>}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Sort:</span>
              <select
                className="filter-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{ width: 'auto', padding: '6px 10px' }}
              >
                <option value="available">Available now</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Section Premium banner — renders only when an advertiser has bought it */}
          <PremiumBanner placement="section" category="escorts" />

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
              {escortType !== 'all' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>Type: {ESCORT_TYPES.find(t => t.value === escortType)?.label} <button onClick={() => setEscortType('all')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {orientation !== 'all' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>{SEXUAL_ORIENTATION.find(o => o.value === orientation)?.label} <button onClick={() => setOrientation('all')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {meetType !== 'all' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>{cap(meetType)} <button onClick={() => setMeetType('all')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {city !== 'All Cities' && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>📍 {city} <button onClick={() => setCity('All Cities')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {verifiedOnly && <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(38,212,160,0.08)', border: '0.5px solid rgba(38,212,160,0.3)', color: '#26d4a0', fontSize: '12px' }}>✓ Verified only <button onClick={() => setVerifiedOnly(false)} style={{ background: 'none', border: 'none', color: '#26d4a0', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>}
              {selectedServices.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', color: 'var(--gold)', fontSize: '12px' }}>{s} <button onClick={() => toggleService(s)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>×</button></span>)}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '3/4', background: 'var(--bg1)', borderRadius: 'var(--rl)', border: '0.5px solid var(--b)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--t3)' }}>
              <div style={{ fontSize: '40px', marginBottom: '1rem' }}>◈</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontStyle: 'italic', color: 'var(--t2)', marginBottom: '0.5rem' }}>No results found</h3>
              <p style={{ fontSize: '14px', marginBottom: '1.5rem' }}>Try adjusting your filters</p>
              <button onClick={resetFilters} style={{ background: 'var(--grad-gold)', border: 'none', borderRadius: '999px', padding: '10px 24px', color: '#000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>Clear all filters</button>
            </div>
          ) : (() => {
              const now = new Date().toISOString()
              const premierList  = listings.filter(l => l.premium && !(l.featured_until && l.featured_until > now))
              const standardList = listings.filter(l => !l.premium)
              const firstBatch   = standardList.slice(0, 8)
              const restBatch    = standardList.slice(8)
              return (
                <>
                  {firstBatch.length > 0 && (
                    <div className="listing-grid">
                      {firstBatch.map(l => <EscortCard key={l.id} l={l} discreet={discreetMode} isLive={liveSet.has(l.profile_id)} />)}
                    </div>
                  )}
                  {premierList.length > 0 && (
                    <div style={{ marginTop: firstBatch.length > 0 ? '2.5rem' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontStyle: 'italic', color: 'var(--t)', whiteSpace: 'nowrap' }}>★ Première Collection</span>
                        <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg, rgba(197,160,90,0.35), transparent)' }} />
                        <Link href="/advertise" style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none', opacity: 0.75, whiteSpace: 'nowrap' }}>Get placement →</Link>
                      </div>
                      <div className="premier-grid">
                        {premierList.map(l => <EscortCard key={l.id} l={l} discreet={discreetMode} isPremier isLive={liveSet.has(l.profile_id)} />)}
                      </div>
                    </div>
                  )}
                  {restBatch.length > 0 && (
                    <div className="listing-grid" style={{ marginTop: '1.5rem' }}>
                      {restBatch.map(l => <EscortCard key={l.id} l={l} discreet={discreetMode} isLive={liveSet.has(l.profile_id)} />)}
                    </div>
                  )}
                </>
              )
            })()}

          {/* Browse by country */}
          <div style={{ marginTop: '3rem', borderTop: '0.5px solid var(--b)', paddingTop: '2rem' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '0.9rem' }}>Browse by country</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.75rem' }}>
              {[['belgium','Belgium'],['netherlands','Netherlands'],['germany','Germany'],['france','France'],['luxembourg','Luxembourg'],['switzerland','Switzerland']].map(([slug, label]) => (
                <Link key={slug} href={`/escorts/${slug}`} style={{ fontSize: '13px', padding: '5px 14px', border: '0.5px solid var(--b)', borderRadius: '20px', color: 'var(--t2)', transition: 'all .2s' }}>{label}</Link>
              ))}
            </div>
            <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '0.9rem' }}>Browse by city</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[['brussels','Brussels'],['antwerp','Antwerp'],['ghent','Ghent'],['leuven','Leuven'],['mechelen','Mechelen'],['hasselt','Hasselt'],['liege','Liège'],['bruges','Bruges'],['ostend','Ostend'],['amsterdam','Amsterdam'],['rotterdam','Rotterdam'],['berlin','Berlin'],['paris','Paris'],['luxembourg','Luxembourg'],['zurich','Zürich'],['geneva','Geneva'],['basel','Basel']].map(([slug, label]) => (
                <Link key={slug} href={`/escorts/${slug}`} style={{ fontSize: '13px', padding: '5px 14px', border: '0.5px solid var(--b)', borderRadius: '20px', color: 'var(--t2)', transition: 'all .2s' }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* List CTA */}
          <div style={{ marginTop: '3rem', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--rl)', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.6rem' }}>Independent Escorts & Agencies</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '0.5rem' }}>Advertise your profile</h3>
              <p style={{ color: 'var(--t2)', fontSize: '14px', lineHeight: 1.65, maxWidth: '420px' }}>Reach verified clients across Europe. Free advertisement, discreet, no middlemen.</p>
            </div>
            <Link href="/listings/create" style={{ background: 'var(--grad-gold)', borderRadius: '999px', padding: '12px 28px', color: '#000', fontWeight: 700, fontSize: '14px', textDecoration: 'none', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              Create profile →
            </Link>
          </div>
        </main>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
    </div>
    </>
  )
}
