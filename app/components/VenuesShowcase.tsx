'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { venues, VENUE_CATEGORY_ORDER, type Venue } from '../data/venues'

const CAT_ICON: Record<string, string> = {
  "Gentlemen's Clubs & Bars": '🍸',
  'Erotic Massage & Sauna': '💆',
  'Brothels & Laufhaus': '🏩',
  'Strip Clubs': '💃',
  'Swingers Clubs': '🔑',
  'Domina & Fetish': '⛓️',
  'Escort': '💋',
}

function VenueCard({ v }: { v: Venue }) {
  return (
    <a
      href={v.website}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      title={v.name}
      className="venue-card"
      style={{
        display: 'flex', flexDirection: 'column', textDecoration: 'none', overflow: 'hidden',
        border: '0.5px solid rgba(197,160,90,0.24)', borderRadius: 14,
        background: 'rgba(20,14,26,0.55)', boxShadow: '0 8px 26px rgba(0,0,0,0.32)',
      }}
    >
      <div style={{ position: 'relative', height: 150, background: 'linear-gradient(135deg, rgba(197,160,90,0.18), rgba(20,14,26,0.6))' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.image}
          alt={v.name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ font: '400 17px/1.2 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>{v.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, font: '300 12px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.5)' }}>
          <i className="ti ti-map-pin" style={{ fontSize: 12, color: 'rgba(197,160,90,0.7)' }} />{v.city}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 11, font: '600 11px/1 Poppins, sans-serif', letterSpacing: '0.05em', color: '#c5a05a' }}>
          Visit website <i className="ti ti-external-link" style={{ fontSize: 12 }} />
        </span>
      </div>
    </a>
  )
}

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem',
}

// variant 'full' = the /venues page (all categories). 'teaser' = a homepage band
// (first few venues + a link to /venues). Portals into portalTo when provided.
export default function VenuesShowcase({ variant = 'full', portalTo }: { variant?: 'full' | 'teaser'; portalTo?: string }) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!portalTo) return
    const el = document.getElementById(portalTo)
    if (el) setMountEl(el)
  }, [portalTo])

  const eyebrow: React.CSSProperties = { font: '600 10px/1 Poppins, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.75)' }

  if (variant === 'teaser') {
    const featured = venues.slice(0, 8)
    const teaser = (
      <div style={{ maxWidth: 1100, margin: '2.75rem auto 0.5rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={eyebrow}>Venues · Belgium</div>
            <div style={{ font: '400 24px/1.15 "Cormorant Garamond", Georgia, serif', color: '#f2ede4', marginTop: 4 }}>Clubs, saunas &amp; erotic massage</div>
          </div>
          <a href="/venues" style={{ whiteSpace: 'nowrap', font: '600 12px/1 Poppins, sans-serif', color: '#c5a05a', textDecoration: 'none' }}>View all {venues.length} →</a>
        </div>
        <div style={gridStyle}>
          {featured.map(v => <VenueCard key={v.name + v.city} v={v} />)}
        </div>
      </div>
    )
    return mountEl ? createPortal(teaser, mountEl) : null
  }

  // full page — grouped by country, then category
  const COUNTRIES: { name: 'Belgium' | 'Germany'; flag: string }[] = [
    { name: 'Belgium', flag: '🇧🇪' },
    { name: 'Germany', flag: '🇩🇪' },
  ]
  return (
    <div style={{ display: 'grid', gap: '3.5rem' }}>
      {COUNTRIES.map(({ name: country, flag }) => {
        const cv = venues.filter(v => v.country === country)
        if (!cv.length) return null
        return (
          <div key={country} id={country.toLowerCase()}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 12, marginBottom: 24, borderBottom: '0.5px solid rgba(197,160,90,0.28)' }}>
              <span style={{ fontSize: 26 }} aria-hidden="true">{flag}</span>
              <h2 style={{ font: '400 30px/1 "Cormorant Garamond", Georgia, serif', color: '#f2ede4', margin: 0 }}>{country}</h2>
              <span style={{ font: '400 13px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.4)' }}>{cv.length} venues</span>
            </div>
            <div style={{ display: 'grid', gap: '2.5rem' }}>
              {VENUE_CATEGORY_ORDER.map(cat => {
                const items = cv.filter(v => v.category === cat)
                if (!items.length) return null
                return (
                  <section key={cat}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 18 }} aria-hidden="true">{CAT_ICON[cat] || '◆'}</span>
                      <h3 style={{ font: '400 22px/1.1 "Cormorant Garamond", Georgia, serif', color: '#f2ede4', margin: 0 }}>{cat}</h3>
                      <span style={{ font: '400 12px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.4)' }}>({items.length})</span>
                    </div>
                    <div style={gridStyle}>
                      {items.map(v => <VenueCard key={v.name + v.city} v={v} />)}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
