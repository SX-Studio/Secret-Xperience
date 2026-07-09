'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
)

// Maps a listing's category to its detail/category route (mirrors CLAUDE.md routing).
const CAT_ROUTE: Record<string, string> = {
  escorts: 'escorts', companions: 'companionship', companionship: 'companionship',
  nightlife: 'nightlife', creators: 'creators', rentals: 'rentals',
  hotels: 'hotels', events: 'events', shop: 'shop',
}

type Ad = {
  id: string
  title: string
  category: string
  city: string | null
  country: string | null
  price_from: number | null
  images: string[] | null
  verified: boolean
}

interface Props {
  /** 'homepage' = full-width hero banner; 'section' = banner on one category page. */
  placement: 'homepage' | 'section'
  /** Required when placement = 'section' — the category to match. */
  category?: string
  /** When set, the banner is rendered into this mount element via a portal. */
  portalTo?: string
}

export default function PremiumBanner({ placement, category, portalTo }: Props) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const tier = placement === 'homepage' ? 'homepage' : 'section'
    let q = supabase
      .from('listings')
      .select('id,title,category,city,country,price_from,images,verified')
      .eq('active', true)
      .contains('placements', [tier])
      .gt('tier_expires_at', new Date().toISOString())
      .order('tier_expires_at', { ascending: false })
      .limit(1)
    if (placement === 'section' && category) q = q.eq('category', category)
    q.then(({ data }) => {
      if (!cancelled && data && data.length) setAd(data[0] as Ad)
    })
    return () => { cancelled = true }
  }, [placement, category])

  useEffect(() => {
    if (!portalTo) return
    const el = document.getElementById(portalTo)
    if (el) setMountEl(el)
  }, [portalTo])

  if (!ad) return null

  const hero = ad.images?.[0] || ''
  const route = CAT_ROUTE[ad.category] || 'escorts'
  const href = `/${route}/${ad.id}`
  const loc = [ad.city, ad.country].filter(Boolean).join(', ')
  const isHome = placement === 'homepage'
  const accent = isHome ? '#e8c97a' : '#c5a05a'
  const eyebrow = isHome ? 'Homepage Premium' : 'Featured in this section'

  const banner = (
    <>
    <style>{`
      .pbanner { transition: border-color .18s, box-shadow .18s; }
      .pbanner:hover { border-color: ${accent}99 !important; box-shadow: 0 12px 38px rgba(0,0,0,0.45), inset 0 0 0 1px ${accent}22 !important; }
      @media(max-width:520px){
        .pbanner { grid-template-columns: 1fr !important; }
        .pbanner > div:first-child { min-height: 150px; }
        .pbanner .pbanner-body { padding: 1.1rem 1.2rem !important; }
      }
    `}</style>
    <a
      href={href}
      className="pbanner"
      style={{
        // Full-width, image-left / content-right premium banner.
        // Image column scales with the container (min 130px, up to ~32%) so it
        // stays balanced from phone to wide desktop instead of a tiny fixed image.
        display: 'grid',
        gridTemplateColumns: 'minmax(130px, 32%) 1fr',
        gap: 0,
        textDecoration: 'none',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(120deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
        border: `0.5px solid ${accent}55`,
        boxShadow: `0 8px 30px rgba(0,0,0,0.35), inset 0 0 0 1px ${accent}10`,
        marginBottom: isHome ? '1.5rem' : '1.25rem',
        marginTop: isHome ? '1.25rem' : 0,
        minHeight: isHome ? 160 : 130,
      }}
    >
      {/* Hero image */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>
        {hero ? (
          <img
            src={hero}
            alt={ad.title}
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, opacity: 0.4 }}>
            <i className="ti ti-photo" style={{ fontSize: 28 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, rgba(8,6,14,0.55) 100%)' }} />
      </div>

      {/* Content */}
      <div className="pbanner-body" style={{ padding: isHome ? '1.4rem 1.6rem' : '1.1rem 1.3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: accent }}>
            ✦ {eyebrow}
          </span>
          {ad.verified && (
            <span style={{ fontSize: 10, color: '#26d4a0', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <i className="ti ti-rosette-discount-check-filled" /> Verified
            </span>
          )}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: isHome ? 28 : 22, fontWeight: 400, color: '#ece8e1', lineHeight: 1.1 }}>
          {ad.title}
        </div>
        {loc && (
          <div style={{ fontSize: 13, color: 'rgba(236,232,225,0.55)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-map-pin" style={{ fontSize: 13, color: accent }} /> {loc}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 12 }}>
          {ad.price_from != null ? (
            <span style={{ fontSize: 14, color: '#ece8e1' }}>
              from <strong style={{ color: accent }}>€{ad.price_from}</strong>
            </span>
          ) : <span />}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, color: '#0a0a0a',
            background: `linear-gradient(90deg, ${accent}, #c5a05a)`,
            borderRadius: 10, padding: '8px 16px', whiteSpace: 'nowrap',
          }}>
            View <i className="ti ti-arrow-right" />
          </span>
        </div>
      </div>
    </a>
    </>
  )

  if (portalTo) {
    return mountEl ? createPortal(banner, mountEl) : null
  }
  return banner
}
