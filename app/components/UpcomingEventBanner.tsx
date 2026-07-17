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
  time_start: string | null
  image_url: string | null
}

// Homepage "upcoming event" banner — shows the next upcoming event, preferring a
// featured one, then the soonest by date. Portals into #upcomingEventMount.
export default function UpcomingEventBanner() {
  const [ev, setEv] = useState<Ev | null>(null)
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = document.getElementById('upcomingEventMount')
    if (el) setMountEl(el)
  }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    supabase
      .from('events')
      .select('slug,title,description,venue_name,city,date_start,time_start,image_url,featured')
      .eq('active', true)
      .gte('date_start', today)
      .order('featured', { ascending: false })
      .order('date_start', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data && data.length) setEv(data[0] as Ev)
      })
    return () => { cancelled = true }
  }, [])

  if (!ev) return null

  const dateLabel = ev.date_start
    ? new Date(ev.date_start).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
    : ''
  const loc = [ev.venue_name, ev.city].filter(Boolean).join(' · ')

  const banner = (
    <>
      <style>{`
        .upev { transition: border-color .18s, box-shadow .18s, transform .18s; }
        .upev:hover { border-color: #e8c97a99 !important; box-shadow: 0 14px 44px rgba(0,0,0,0.5) !important; transform: translateY(-2px); }
        @media(max-width:560px){
          .upev { grid-template-columns: 1fr !important; }
          .upev > .upev-img { min-height: 190px; }
        }
      `}</style>
      <a
        href={`/events/${ev.slug}`}
        className="upev"
        style={{
          display: 'grid', gridTemplateColumns: 'minmax(130px, 30%) 1fr', gap: 0,
          maxWidth: 980, margin: '2rem auto 0.5rem', textDecoration: 'none', borderRadius: 16, overflow: 'hidden',
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
        <div style={{ padding: '18px 22px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ font: '600 10px/1 Poppins, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8c97a' }}>
            Upcoming event
          </div>
          <div style={{ font: '400 24px/1.15 "Cormorant Garamond", Georgia, serif', color: '#f2ede4', margin: '7px 0 6px' }}>
            {ev.title}
          </div>
          <div style={{ font: '400 13px/1.5 Poppins, sans-serif', color: 'rgba(236,232,225,0.62)' }}>
            {dateLabel}{ev.time_start ? ` · ${ev.time_start}` : ''}{loc ? ` · ${loc}` : ''}
          </div>
          {ev.description && (
            <div style={{ font: '300 13px/1.5 Poppins, sans-serif', color: 'rgba(236,232,225,0.5)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {ev.description}
            </div>
          )}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 14, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d)', color: '#1a1206',
              font: '700 12.5px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '11px 20px', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(197,160,90,0.26)',
            }}
          >
            View event <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </a>
    </>
  )

  return mountEl ? createPortal(banner, mountEl) : null
}
