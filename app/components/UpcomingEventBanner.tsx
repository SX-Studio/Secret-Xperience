'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '../lib/supabase'

type Ev = {
  slug: string
  title: string
  description: string | null
  venue_name: string | null
  city: string | null
  date_start: string | null
  date_end: string | null
  time_start: string | null
  image_url: string | null
  category: string | null
}

// Homepage "upcoming" band — left: the next party/nightlife event; right: the
// next fair/expo (category = 'expo'). Portals into #upcomingEventMount.
export default function UpcomingEventBanner() {
  const [party, setParty] = useState<Ev | null>(null)
  const [expo, setExpo] = useState<Ev | null>(null)
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = document.getElementById('upcomingEventMount')
    if (el) setMountEl(el)
  }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    const cols = 'slug,title,description,venue_name,city,date_start,date_end,time_start,image_url,category,featured'

    // Left: soonest non-expo event (parties/nightlife), featured first.
    supabase.from('events').select(cols)
      .eq('active', true).gte('date_start', today).neq('category', 'expo')
      .order('featured', { ascending: false }).order('date_start', { ascending: true })
      .limit(1)
      .then(({ data }) => { if (!cancelled && data && data.length) setParty(data[0] as Ev) })

    // Right: soonest fair / expo.
    supabase.from('events').select(cols)
      .eq('active', true).gte('date_start', today).eq('category', 'expo')
      .order('featured', { ascending: false }).order('date_start', { ascending: true })
      .limit(1)
      .then(({ data }) => { if (!cancelled && data && data.length) setExpo(data[0] as Ev) })

    return () => { cancelled = true }
  }, [])

  if (!party && !expo) return null

  const dateRange = (ev: Ev) => {
    if (!ev.date_start) return ''
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const s = new Date(ev.date_start)
    if (ev.date_end && ev.date_end !== ev.date_start) {
      const e = new Date(ev.date_end)
      return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
    }
    return s.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
  }

  const card = (ev: Ev, eyebrow: string, icon: string) => {
    const loc = [ev.venue_name, ev.city].filter(Boolean).join(' · ')
    return (
      <a
        key={ev.slug}
        href={`/events/${ev.slug}`}
        className="upev"
        style={{
          display: 'grid', gridTemplateColumns: 'minmax(104px, 34%) 1fr', gap: 0,
          textDecoration: 'none', borderRadius: 16, overflow: 'hidden',
          border: '0.5px solid rgba(232,201,122,0.34)', background: 'linear-gradient(120deg, rgba(197,160,90,0.10), rgba(20,14,26,0.55))',
          boxShadow: '0 10px 34px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="upev-img"
          style={{
            background: `linear-gradient(135deg, rgba(197,160,90,0.18), rgba(20,14,26,0.6)), url(${ev.image_url || ''}) center/cover no-repeat`,
            minHeight: 150,
          }}
        />
        <div style={{ padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ font: '600 10px/1 Poppins, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8c97a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className={`ti ${icon}`} style={{ fontSize: 12 }} /> {eyebrow}
          </div>
          <div style={{ font: '400 22px/1.15 "Cormorant Garamond", Georgia, serif', color: '#f2ede4', margin: '7px 0 6px' }}>
            {ev.title}
          </div>
          <div style={{ font: '400 12.5px/1.5 Poppins, sans-serif', color: 'rgba(236,232,225,0.62)' }}>
            {dateRange(ev)}{ev.time_start ? ` · ${ev.time_start}` : ''}{loc ? ` · ${loc}` : ''}
          </div>
          {ev.description && (
            <div style={{ font: '300 12.5px/1.5 Poppins, sans-serif', color: 'rgba(236,232,225,0.5)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {ev.description}
            </div>
          )}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 14, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d)', color: '#1a1206',
              font: '700 12px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '10px 18px', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(197,160,90,0.26)',
            }}
          >
            {ev.category === 'expo' ? 'View fair' : 'View event'} <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </a>
    )
  }

  const single = !party || !expo

  const band = (
    <>
      <style>{`
        .upev { transition: border-color .18s, box-shadow .18s, transform .18s; }
        .upev:hover { border-color: #e8c97a99 !important; box-shadow: 0 14px 44px rgba(0,0,0,0.5) !important; transform: translateY(-2px); }
        .upev-band { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 1100px; margin: 2rem auto 0.5rem; }
        @media(max-width:760px){ .upev-band { grid-template-columns: 1fr !important; } }
        @media(max-width:440px){
          .upev { grid-template-columns: 1fr !important; }
          .upev > .upev-img { min-height: 170px; }
        }
      `}</style>
      <div className="upev-band" style={single ? { gridTemplateColumns: '1fr', maxWidth: 980 } : undefined}>
        {party && card(party, 'Upcoming event', 'ti-confetti')}
        {expo && card(expo, 'Fairs & expos', 'ti-building-store')}
      </div>
    </>
  )

  return mountEl ? createPortal(band, mountEl) : null
}
