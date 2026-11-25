'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

const COUNTRY_FLAGS: Record<string, string> = { Belgium: '🇧🇪', Germany: '🇩🇪', Netherlands: '🇳🇱', 'United Kingdom': '🇬🇧', Spain: '🇪🇸', Switzerland: '🇨🇭', France: '🇫🇷', Austria: '🇦🇹', 'Czech Republic': '🇨🇿' }
const CATEGORY_COLORS: Record<string, string> = { fetish: 'var(--grad-boudoir)', nightlife: 'linear-gradient(140deg,#2a1a3a,#110a18)', lifestyle: 'var(--grad-plum)', wellness: 'linear-gradient(140deg,#1a2a1a,#0a180a)' }

// Only treat a website as linkable if it's a well-formed ASCII http(s) URL —
// guards against malformed/internationalised domains that won't resolve.
function validWebsite(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (/[^\x00-\x7F]/.test(u.hostname)) return null
    return u.href
  } catch { return null }
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const [event, setEvent] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('events').select('*').eq('slug', params.slug).single()
      .then(({ data }) => {
        setEvent(data)
        setLoading(false)
        if (data) {
          supabase.from('events').select('*').eq('active', true).eq('country', data.country).neq('slug', params.slug).limit(3)
            .then(({ data: rel }) => setRelated(rel || []))
        }
      })
  }, [params.slug])

  if (loading) return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>Loading…</div>
  if (!event) return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--t3)' }}><i className="ti ti-calendar-off" style={{ fontSize: '48px' }} /><p>Event not found</p><Link href="/events" style={{ color: 'var(--gold)' }}>← Back to events</Link></div>

  const flag = COUNTRY_FLAGS[event.country] || '🌍'
  const isFree = !event.price_from || event.price_from === 0
  const heroBg = CATEGORY_COLORS[event.category] || 'var(--grad-noir)'
  const dateStr = event.date_start ? new Date(event.date_start).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date TBA'
  const dateEnd = event.date_end && event.date_end !== event.date_start ? new Date(event.date_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 14px rgba(197,160,90,0.35))' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <Link href="/events" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-arrow-left" /> All events
        </Link>
      </nav>

      {/* HERO */}
      <div style={{ background: heroBg, position: 'relative', overflow: 'hidden', minHeight: '340px', display: 'flex', alignItems: 'flex-end' }}>
        {/* Cover image */}
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(8,6,18,0.85) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,rgba(197,160,90,0.1) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', width: '100%', padding: '4rem 1.5rem 3rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {event.featured && <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', borderRadius: '10px', padding: '3px 12px' }}>FEATURED</span>}
            {event.verified && <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', background: 'rgba(38,212,160,0.12)', color: '#26d4a0', border: '0.5px solid rgba(38,212,160,0.3)', borderRadius: '10px', padding: '3px 12px' }}>✓ VERIFIED</span>}
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '3px 12px', textTransform: 'capitalize' }}>{event.category}</span>
            {event.recurring !== 'one-time' && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px 12px', textTransform: 'capitalize' }}>{event.recurring}</span>}
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, margin: '0 0 1rem', lineHeight: 1.2 }}>{event.title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
            <span><i className="ti ti-calendar" style={{ marginRight: '6px' }} />{dateStr}{dateEnd && ` — ${dateEnd}`}</span>
            <span>{flag} {event.city}, {event.country}</span>
            {event.venue_name && <span><i className="ti ti-building" style={{ marginRight: '6px' }} />{event.venue_name}</span>}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="sx-two-col" style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2.5rem', alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 500, margin: '0 0 1rem', color: 'var(--t)' }}>About this event</h2>
          <p style={{ fontSize: '15px', color: 'var(--t2)', lineHeight: 1.8, margin: '0 0 2rem' }}>{event.description}</p>

          {event.tags?.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '10px' }}>Tags</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {event.tags.map((t: string) => (
                  <span key={t} style={{ fontSize: '12px', color: 'var(--t2)', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '4px 12px' }}>#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Related events */}
          {related.length > 0 && (
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '0.5px solid var(--b)' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500, margin: '0 0 1.25rem' }}>More events in {event.country}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {related.map(r => (
                  <Link key={r.id} href={`/events/${r.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1rem', textDecoration: 'none', transition: 'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--b3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--b)')}>
                    <div style={{ background: 'var(--bg2)', borderRadius: '10px', padding: '10px', textAlign: 'center', minWidth: '52px' }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold)', lineHeight: 1 }}>{r.date_start ? new Date(r.date_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBA'}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--t)', marginBottom: '3px' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t3)' }}>{r.city} · {r.venue_name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Info card */}
        <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 400, color: isFree ? '#26d4a0' : 'var(--gold)', marginBottom: '.25rem' }}>
            {isFree ? 'Free' : `€${event.price_from}`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '1.5rem' }}>{isFree ? 'Free entry' : 'from per person'}</div>

          {validWebsite(event.website) ? (
            <a href={validWebsite(event.website)!} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}>
              <i className="ti ti-external-link" /> Visit official website
            </a>
          ) : (
            <div style={{ padding: '12px', background: 'var(--bg2)', borderRadius: 'var(--r)', fontSize: '13px', color: 'var(--t3)', textAlign: 'center', marginBottom: '1rem' }}>No website available</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <i className="ti ti-calendar" style={{ color: 'var(--t3)', fontSize: '16px', marginTop: '1px', flexShrink: 0 }} />
              <div><div style={{ color: 'var(--t)', fontWeight: 500 }}>{dateStr}</div>{dateEnd && <div style={{ color: 'var(--t3)', fontSize: '12px', marginTop: '2px' }}>Until {dateEnd}</div>}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <i className="ti ti-map-pin" style={{ color: 'var(--t3)', fontSize: '16px', marginTop: '1px', flexShrink: 0 }} />
              <div><div style={{ color: 'var(--t)', fontWeight: 500 }}>{flag} {event.city}</div><div style={{ color: 'var(--t3)', fontSize: '12px', marginTop: '2px' }}>{event.country}{event.venue_name && ` · ${event.venue_name}`}</div></div>
            </div>
            {event.recurring !== 'one-time' && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="ti ti-repeat" style={{ color: 'var(--t3)', fontSize: '16px', flexShrink: 0 }} />
                <span style={{ color: 'var(--t2)', textTransform: 'capitalize' }}>{event.recurring} event</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '0.5px solid var(--b)', fontSize: '12px', color: 'var(--t3)', textAlign: 'center' }}>
            <i className="ti ti-shield-check" style={{ color: 'var(--gold)', marginRight: '6px' }} />
            Verified by SecretXperience
          </div>
        </div>
      </div>
    </div>
  )
}
