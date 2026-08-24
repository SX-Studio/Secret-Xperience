'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { focusPosition } from '../lib/imageFocus'

interface Listing {
  id: string
  title: string
  description?: string | null
  category: string
  subcategory?: string | null
  city?: string | null
  country?: string | null
  price_from?: number | null
  price_to?: number | null
  images?: string[] | null
  image_focus?: Record<string, { x: number; y: number }>
  verified?: boolean
  premium?: boolean
  trending?: boolean
  rating?: number
  review_count?: number
  meet_type?: string | null
  featured_until?: string | null
  created_at: string
  tags?: string[] | null
}

const CREATOR_FILTERS = [
  { value: 'all', label: 'All Creators' },
  { value: 'photo', label: 'Photo & Video' },
  { value: 'couple', label: 'Couple' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'custom', label: 'Custom Content' },
]

const GRAD_PALETTE = [
  'linear-gradient(145deg, #3d1d33 0%, #1a0d1a 100%)',
  'linear-gradient(145deg, #1a1230 0%, #0d0818 100%)',
  'linear-gradient(145deg, #2a1020 0%, #150810 100%)',
  'linear-gradient(145deg, #1a2830 0%, #0d1418 100%)',
  'linear-gradient(145deg, #281a10 0%, #140d08 100%)',
  'linear-gradient(145deg, #201a30 0%, #100d18 100%)',
]

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

function StarRating({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(0, Math.round(rating || 0)))
  return (
    <span style={{ color: 'var(--gold)', fontSize: '13px', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      {rating > 0 && <span style={{ color: 'var(--t3)', marginLeft: '5px', fontSize: '12px' }}>{Number(rating).toFixed(1)}</span>}
    </span>
  )
}

function CreatorCard({ l, isFeatured, idx, discreet }: { l: Listing; isFeatured: boolean; idx: number; discreet: boolean }) {
  const monogram = (l.title || 'Sx').slice(0, 2).toUpperCase()
  const gradBg = GRAD_PALETTE[idx % GRAD_PALETTE.length]
  const availNow = isAvailableNow(l.tags)
  const newListing = isNewListing(l.created_at)

  return (
    <Link
      href={`/listings/${l.id}`}
      className="creator-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'var(--bg1)',
        border: isFeatured ? '1px solid rgba(197,160,90,0.55)' : '0.5px solid var(--b)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.15s',
        boxShadow: isFeatured
          ? '0 0 28px rgba(197,160,90,0.18), 0 8px 32px rgba(0,0,0,0.45)'
          : '0 4px 16px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Portrait image area */}
      <div style={{
        height: '260px',
        background: gradBg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {l.images?.[0] && (
          <img
            src={l.images[0]}
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, l.images[0]), position: 'absolute', inset: 0,
              filter: discreet ? 'blur(24px) brightness(0.5)' : 'none',
              transition: 'filter 0.3s ease',
            }}
          />
        )}
        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(8,6,18,0.88) 0%, rgba(8,6,18,0.15) 50%, transparent 100%)',
          zIndex: 1,
        }} />
        {/* Monogram */}
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: '88px',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'rgba(197,160,90,0.22)',
          lineHeight: 1,
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>{monogram}</div>
        {/* Top badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', flexWrap: 'wrap', zIndex: 3 }}>
          {isFeatured && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: 'rgba(197,160,90,0.22)', color: 'var(--gold)', border: '0.5px solid rgba(197,160,90,0.45)', backdropFilter: 'blur(4px)' }}>
              ✦ Featured
            </span>
          )}
          {l.verified && (
            <span style={{ background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>VERIFIED</span>
          )}
          {availNow && (
            <span style={{ background: 'rgba(62,207,142,0.18)', border: '0.5px solid rgba(62,207,142,0.45)', color: '#3ecf8e', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3ecf8e', display: 'inline-block', boxShadow: '0 0 4px #3ecf8e' }} />
              AVAILABLE
            </span>
          )}
          {newListing && !availNow && (
            <span style={{ background: 'rgba(130,100,220,0.18)', border: '0.5px solid rgba(130,100,220,0.4)', color: '#a78bfa', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.06em', backdropFilter: 'blur(6px)' }}>NEW</span>
          )}
          {l.premium && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: 'rgba(139,92,246,0.16)', color: '#a78bfa', border: '0.5px solid rgba(139,92,246,0.32)', backdropFilter: 'blur(4px)' }}>
              Premium
            </span>
          )}
        </div>
        {/* Price badge pinned bottom-right */}
        <div style={{
          position: 'absolute', bottom: '10px', right: '10px', zIndex: 3,
          background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
          color: '#0a0a0a', fontSize: '12px', fontWeight: 700,
          padding: '5px 10px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
          letterSpacing: '0.02em',
        }}>
          {l.price_from ? `from €${l.price_from}/mo` : 'Free preview'}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1rem 1.1rem 1.1rem' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '4px', fontWeight: 600 }}>
          {l.subcategory || 'Creator'}
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--t)', marginBottom: '6px', lineHeight: 1.25, letterSpacing: '0.01em' }}>
          {l.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <StarRating rating={l.rating ?? 0} />
          {l.city && <span style={{ fontSize: '12px', color: 'var(--t3)' }}>📍 {l.city}</span>}
        </div>
        {/* Subscribe CTA */}
        <div style={{
          width: '100%', padding: '9px',
          background: 'linear-gradient(135deg,rgba(197,160,90,0.12),rgba(197,160,90,0.06))',
          border: '0.5px solid rgba(197,160,90,0.32)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '13px', fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.05em',
        }}>
          Subscribe →
        </div>
      </div>
    </Link>
  )
}

export default function CreatorsGrid({ listings }: { listings: Listing[] }) {
  // Read discreet mode after mount so SSR and first client render match (no hydration mismatch).
  const [discreet, setDiscreet] = useState<boolean>(false)
  useEffect(() => { try { setDiscreet(localStorage.getItem('discreetMode') === '1') } catch { /* ignore */ } }, [])
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredAll = listings.filter(l =>
    typeFilter === 'all' || (l.subcategory ?? '').toLowerCase().includes(typeFilter)
  )

  const featured = filteredAll.filter(l => l.featured_until && new Date(l.featured_until) > new Date())
  const regular  = filteredAll.filter(l => !l.featured_until || new Date(l.featured_until) <= new Date())

  return (
    <>
      {/* CONTENT TYPE FILTER BAR */}
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'rgba(17,13,28,0.96)', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem 1.5rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '52px', scrollbarWidth: 'none' }}>
          {CREATOR_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`filter-pill${typeFilter === f.value ? ' active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discreet toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>
          {filteredAll.length} creators
        </div>
        <button
          onClick={() => {
            const next = !discreet
            setDiscreet(next)
            localStorage.setItem('discreetMode', next ? '1' : '0')
          }}
          title={discreet ? 'Exit discreet mode' : 'Discreet mode — blur photos'}
          style={{
            background: discreet ? 'rgba(197,160,90,0.15)' : 'transparent',
            border: '0.5px solid var(--b3)',
            borderRadius: '999px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 600,
            color: discreet ? 'var(--gold)' : 'var(--t3)',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <i className={`ti ${discreet ? 'ti-eye-off' : 'ti-eye'}`} />
          {discreet ? 'Discreet ON' : 'Discreet'}
        </button>
      </div>

      {/* FEATURED SECTION */}
      {featured.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <div style={{ height: '0.5px', flex: 1, background: 'linear-gradient(90deg,rgba(197,160,90,0.5),transparent)' }} />
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              ✦ Featured Creators
            </div>
            <div style={{ height: '0.5px', flex: 1, background: 'linear-gradient(270deg,rgba(197,160,90,0.5),transparent)' }} />
          </div>
          <div className="creator-grid">
            {featured.map((l, i) => <CreatorCard key={l.id} l={l} isFeatured idx={i} discreet={discreet} />)}
          </div>
          <div style={{ height: '0.5px', background: 'var(--b)', margin: '3rem 0 0' }} />
        </div>
      )}

      {/* ALL CREATORS */}
      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(197,160,90,0.08)', border: '0.5px solid rgba(197,160,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✦</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '24px' }}>Be a pioneer creator</div>
          <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '340px', lineHeight: 1.7 }}>No creators yet. Be among the first and build a following from day one.</p>
          <Link href="/advertise" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            Become a creator →
          </Link>
        </div>
      ) : filteredAll.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '36px', opacity: 0.3 }}>✦</div>
          <p style={{ fontSize: '14px', color: 'var(--t3)' }}>No creators match this filter</p>
        </div>
      ) : (
        <div>
          {regular.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                All Creators · {regular.length} profiles
              </div>
            </div>
          )}
          <div className="creator-grid">
            {regular.map((l, i) => <CreatorCard key={l.id} l={l} isFeatured={false} idx={i} discreet={discreet} />)}
          </div>
        </div>
      )}
    </>
  )
}
