'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { venues, type VenueCategory } from '../../data/venues'
import { createClient } from '../../lib/supabase'

type Item = {
  name: string
  city: string | null
  country: string | null
  website: string | null
  image: string | null
  description?: string | null
  featured?: boolean
}

const COUNTRY_FLAG: Record<string, string> = {
  Belgium: '🇧🇪', Netherlands: '🇳🇱', Germany: '🇩🇪', France: '🇫🇷', Luxembourg: '🇱🇺',
  Spain: '🇪🇸', Italy: '🇮🇹', Austria: '🇦🇹', Switzerland: '🇨🇭', 'Czech Republic': '🇨🇿',
  Portugal: '🇵🇹', Poland: '🇵🇱', 'United Kingdom': '🇬🇧', Hungary: '🇭🇺', Greece: '🇬🇷',
}

interface Props {
  /** Matching venues.ts curated category. */
  venueCategory: VenueCategory
  /** Matching directory_listings DB category. */
  dbCategory: string
  eyebrow: string
  title: React.ReactNode
  blurb: string
  info: { h: string; p: string }[]
  accent?: string
}

export default function CommunityHub({ venueCategory, dbCategory, eyebrow, title, blurb, info, accent = '#c5a05a' }: Props) {
  const [dbItems, setDbItems] = useState<Item[]>([])
  const [country, setCountry] = useState<string>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('directory_listings')
      .select('name,city,country,website,image_url,description,featured')
      .eq('status', 'approved').eq('category', dbCategory)
      .then(({ data }) => {
        if (data) setDbItems(data.map((d: any) => ({
          name: d.name, city: d.city, country: d.country, website: d.website,
          image: d.image_url, description: d.description, featured: d.featured,
        })))
      })
  }, [dbCategory])

  const curated: Item[] = useMemo(
    () => venues.filter(v => v.category === venueCategory)
      .map(v => ({ name: v.name, city: v.city, country: v.country, website: v.website, image: v.image })),
    [venueCategory]
  )

  const all = useMemo(() => {
    const merged = [...dbItems, ...curated]
    return merged.sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [dbItems, curated])

  const countries = useMemo(() => {
    const set = new Set<string>()
    all.forEach(i => { if (i.country) set.add(i.country) })
    return Array.from(set).sort()
  }, [all])

  const shown = country === 'all' ? all : all.filter(i => i.country === country)

  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: accent, textDecoration: 'none' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/venues" style={navBtn}>All venues</Link>
          <Link href="/" style={navBtn}><i className="ti ti-arrow-left" /> Home</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '4.5rem 1.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', color: accent, textTransform: 'uppercase', marginBottom: '1.25rem' }}>{eyebrow}</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>{title}</h1>
          <p style={{ fontSize: 15.5, color: 'rgba(236,232,225,0.62)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 1.5rem' }}>{blurb}</p>
          <a href="#submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,#e7c87f,${accent} 55%,#a0803d)`, color: '#1a1206', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 11 }}>
            <i className="ti ti-plus" /> List your venue
          </a>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* country filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          <button onClick={() => setCountry('all')} style={chip(country === 'all', accent)}>All Europe · {all.length}</button>
          {countries.map(c => (
            <button key={c} onClick={() => setCountry(c)} style={chip(country === c, accent)}>
              {COUNTRY_FLAG[c] || '📍'} {c}
            </button>
          ))}
        </div>

        {/* grid */}
        {shown.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
            {shown.map((v, i) => (
              <a key={`${v.name}-${i}`} href={v.website || '#'} target="_blank" rel="noopener noreferrer nofollow sponsored" title={v.name}
                style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', overflow: 'hidden', border: `0.5px solid ${accent}3d`, borderRadius: 14, background: 'rgba(20,14,26,0.55)', boxShadow: '0 8px 26px rgba(0,0,0,0.32)' }}>
                <div style={{ position: 'relative', height: 150, background: `linear-gradient(135deg, ${accent}2e, rgba(20,14,26,0.6))` }}>
                  {v.image && <img src={v.image} alt={v.name} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {v.featured && <span style={{ position: 'absolute', top: 8, left: 8, font: '700 9px/1 Poppins', letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a1206', background: accent, padding: '4px 8px', borderRadius: 6 }}>Featured</span>}
                </div>
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ font: '400 17px/1.2 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>{v.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, font: '300 12px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.5)' }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 12, color: `${accent}b3` }} />{[v.city, v.country].filter(Boolean).join(', ')}
                  </div>
                  {v.website && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 11, font: '600 11px/1 Poppins, sans-serif', letterSpacing: '0.05em', color: accent }}>
                      Visit website <i className="ti ti-external-link" style={{ fontSize: 12 }} />
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.5)', padding: '2rem 0' }}>No venues listed here yet — be the first below.</p>
        )}

        {/* info content */}
        <div style={{ maxWidth: 780, margin: '4rem auto 0', display: 'grid', gap: '1.5rem' }}>
          {info.map((s, i) => (
            <div key={i}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: accent, fontWeight: 500, margin: '0 0 8px' }}>{s.h}</h2>
              <p style={{ fontSize: 14.5, color: 'rgba(236,232,225,0.7)', lineHeight: 1.7, margin: 0 }}>{s.p}</p>
            </div>
          ))}
        </div>

        <SubmitVenueForm dbCategory={dbCategory} accent={accent} />

        <p style={{ marginTop: '2.5rem', fontSize: 11.5, color: 'rgba(236,232,225,0.35)', textAlign: 'center', lineHeight: 1.6 }}>
          Listings are provided for information. SecretXperience is not affiliated with these venues; visit each website for current details. All venues are adults-only (18+).
        </p>
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = { height: 36, padding: '0 14px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }
const chip = (active: boolean, accent: string): React.CSSProperties => ({
  padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
  border: `0.5px solid ${active ? accent : 'rgba(255,255,255,0.14)'}`,
  background: active ? `${accent}22` : 'transparent',
  color: active ? accent : 'rgba(236,232,225,0.6)', font: '600 13px/1 Poppins, sans-serif',
})

const COUNTRIES = ['Belgium', 'Netherlands', 'Germany', 'France', 'Luxembourg', 'Spain', 'Italy', 'Austria', 'Switzerland', 'Czech Republic', 'Portugal', 'Poland', 'United Kingdom', 'Hungary', 'Greece', 'Other']

function SubmitVenueForm({ dbCategory, accent }: { dbCategory: string; accent: string }) {
  const [f, setF] = useState({ name: '', city: '', country: '', website: '', contact_email: '', description: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim()) { setMsg('Please add the venue name'); return }
    setState('sending'); setMsg('')
    try {
      const res = await fetch('/api/community', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'venue', category: dbCategory, ...f }),
      })
      const j = await res.json()
      if (!res.ok) { setState('error'); setMsg(j.error || 'Could not submit'); return }
      setState('done')
    } catch { setState('error'); setMsg('Network error') }
  }

  if (state === 'done') {
    return (
      <div id="submit" style={{ maxWidth: 620, margin: '3.5rem auto 0', textAlign: 'center', border: `0.5px solid ${accent}44`, borderRadius: 16, padding: '2.5rem', background: 'rgba(20,14,26,0.5)' }}>
        <i className="ti ti-circle-check" style={{ fontSize: 40, color: '#26d4a0' }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, margin: '12px 0 8px' }}>Thank you — submitted for review</h3>
        <p style={{ color: 'rgba(236,232,225,0.6)', fontSize: 14 }}>Our team will review your venue and publish it once approved.</p>
      </div>
    )
  }

  return (
    <form id="submit" onSubmit={submit} style={{ maxWidth: 620, margin: '3.5rem auto 0', border: `0.5px solid ${accent}44`, borderRadius: 16, padding: 'clamp(1.5rem,4vw,2.25rem)', background: 'rgba(20,14,26,0.5)' }}>
      <div style={{ font: '700 11px/1 Poppins', letterSpacing: '.2em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>Self-serve listing</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, margin: '0 0 6px' }}>List your venue</h2>
      <p style={{ color: 'rgba(236,232,225,0.55)', fontSize: 13.5, margin: '0 0 20px' }}>Own or run a venue anywhere in Europe? Submit it — we review every entry before it goes live.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input required placeholder="Venue name *" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={inp} />
        <input placeholder="City" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} style={inp} />
        <select value={f.country} onChange={e => setF({ ...f, country: e.target.value })} style={inp}>
          <option value="">Country…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Website (https://…)" value={f.website} onChange={e => setF({ ...f, website: e.target.value })} style={inp} />
        <input type="email" placeholder="Contact email" value={f.contact_email} onChange={e => setF({ ...f, contact_email: e.target.value })} style={{ ...inp, gridColumn: '1 / -1' }} />
        <textarea placeholder="Short description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} rows={3} style={{ ...inp, gridColumn: '1 / -1', resize: 'vertical' }} />
      </div>
      {msg && <div style={{ color: '#e0708a', fontSize: 13, marginTop: 10 }}>{msg}</div>}
      <button type="submit" disabled={state === 'sending'} style={{ marginTop: 16, width: '100%', padding: '13px', border: 'none', borderRadius: 11, cursor: 'pointer', background: `linear-gradient(135deg,#e7c87f,${accent} 55%,#a0803d)`, color: '#1a1206', font: '700 14px/1 Poppins' }}>
        {state === 'sending' ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  )
}

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 10,
  border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.25)',
  color: '#ece8e1', font: '400 14px/1.3 Poppins, sans-serif',
}
