'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

type L = {
  id: string
  title: string
  age: number | null
  city: string | null
  country: string | null
  price_from: number | null
  price_to: number | null
  images: string[] | null
  tags: string[] | null
  category: string | null
  subcategory: string | null
  verified: boolean
  meet_type: string | null
}

const SPECTRUM = 'linear-gradient(90deg,#e0507a,#b96bd8,#6b8be0,#3fd0c4,#e6c07a)'

// sub-tabs → which identity tags qualify
const TABS: { key: string; label: string; icon: string; match: (t: string[]) => boolean }[] = [
  { key: 'all',    label: 'Everyone', icon: 'ti-sparkles',      match: () => true },
  { key: 'men',    label: 'Men',      icon: 'ti-gender-male',    match: (t) => t.includes('orientation:gay') || t.includes('orientation:bi') },
  { key: 'trans',  label: 'Trans',    icon: 'ti-gender-transgender', match: (t) => t.includes('type:trans') },
  { key: 'couples',label: 'Couples',  icon: 'ti-heart-handshake',match: (t) => t.includes('type:couple') },
]

// Only gay/bi men, trans and couples belong in Pride — straight male escorts
// (type:men + orientation:straight) are deliberately excluded.
const PRIDE_TAGS = ['orientation:gay', 'orientation:bi', 'type:trans', 'type:couple', 'type:nonbinary']

function price(a: number | null, b: number | null) {
  if (a && b) return `€${a}–€${b}`
  if (a) return `from €${a}`
  return 'POA'
}

export default function PridePage() {
  const [items, setItems] = useState<L[]>([])
  const [tab, setTab] = useState('all')
  const [country, setCountry] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('listings')
      .select('id,title,age,city,country,price_from,price_to,images,tags,category,subcategory,verified,meet_type')
      .eq('active', true).overlaps('tags', PRIDE_TAGS)
      .order('featured_until', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems((data as L[]) || []); setLoading(false) })
  }, [])

  const countries = useMemo(() => {
    const s = new Set<string>(); items.forEach(i => i.country && s.add(i.country)); return Array.from(s).sort()
  }, [items])

  const shown = useMemo(() => {
    const t = TABS.find(x => x.key === tab)!
    return items.filter(i => t.match(i.tags || []) && (country === 'all' || i.country === country))
  }, [items, tab, country])

  const count = (k: string) => {
    const t = TABS.find(x => x.key === k)!
    return items.filter(i => t.match(i.tags || [])).length
  }

  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      <style>{`
        @keyframes prideShift { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        .pr-rule { height:2px; background:${SPECTRUM}; background-size:200% 100%; animation:prideShift 8s linear infinite; border:0; }
        .pr-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .pr-card:hover { transform: translateY(-4px); box-shadow: 0 22px 54px rgba(0,0,0,.55); }
        .pr-card:hover .pr-photo { transform: scale(1.05); }
      `}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#c5a05a', textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
        <Link href="/" style={{ height: 36, padding: '0 14px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><i className="ti ti-arrow-left" /> Home</Link>
      </nav>

      {/* hero */}
      <section style={{ padding: '4.5rem 1.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(185,107,216,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.1rem', background: SPECTRUM, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Pride · Spectrum · Everyone welcome</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 400, lineHeight: 1.12, margin: '0 0 1rem' }}>
            After dark, <em style={{ fontStyle: 'italic', background: SPECTRUM, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>all colours.</em>
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(236,232,225,0.62)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Gay & bi men, trans companions and open-minded couples across Belgium and beyond — verified, discreet, and unapologetically yours. Meetups only; be kind, ask first.
          </p>
          <hr className="pr-rule" style={{ maxWidth: 220, margin: '0 auto' }} />
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
              border: tab === t.key ? '1px solid transparent' : '0.5px solid rgba(255,255,255,0.14)',
              background: tab === t.key ? SPECTRUM : 'transparent',
              backgroundClip: 'padding-box',
              color: tab === t.key ? '#0a0710' : 'rgba(236,232,225,0.7)', font: '700 13px/1 Poppins, sans-serif',
            }}>
              <i className={`ti ${t.icon}`} /> {t.label} · {count(t.key)}
            </button>
          ))}
        </div>

        {/* country filter */}
        {countries.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.25)', color: '#ece8e1', font: '400 13.5px Poppins, sans-serif' }}>
              <option value="all">All countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.5)' }}>Loading…</p>
        ) : shown.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
            {shown.map(l => (
              <a key={l.id} href={`/listings/${l.id}`} className="pr-card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', overflow: 'hidden', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.09)', background: 'rgba(20,14,26,0.55)' }}>
                <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#0b0710' }}>
                  {l.images?.[0]
                    ? <img className="pr-photo" src={l.images[0]} alt={l.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .8s cubic-bezier(.2,.8,.4,1)' }} />
                    : <div style={{ width: '100%', height: '100%', background: SPECTRUM, opacity: .25 }} />}
                  {l.verified && <span style={{ position: 'absolute', top: 8, left: 8, font: '700 9px/1 Poppins', letterSpacing: '.08em', color: '#0a0710', background: '#26d4a0', padding: '4px 7px', borderRadius: 6 }}>✓ VERIFIED</span>}
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: SPECTRUM }} />
                </div>
                <div style={{ padding: '11px 13px 13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ font: '400 18px/1.1 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>{l.title}</span>
                    {l.age ? <span style={{ fontSize: 12, color: 'rgba(236,232,225,0.5)' }}>{l.age}</span> : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, font: '300 12px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.5)' }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 12, color: '#b96bd8' }} />{[l.city, l.country].filter(Boolean).join(', ')}
                  </div>
                  <div style={{ marginTop: 8, font: '600 12.5px/1 Poppins, sans-serif', color: '#e6c07a' }}>{price(l.price_from, l.price_to)}</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '0.5px dashed rgba(255,255,255,0.14)', borderRadius: 16 }}>
            <i className="ti ti-rainbow" style={{ fontSize: 34, background: SPECTRUM, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }} />
            <p style={{ color: 'rgba(236,232,225,0.6)', marginTop: 10 }}>No one’s out to play in this filter yet — be the first flame 🔥</p>
          </div>
        )}

        <p style={{ marginTop: '2.5rem', fontSize: 11.5, color: 'rgba(236,232,225,0.35)', textAlign: 'center', lineHeight: 1.6, maxWidth: 640, marginInline: 'auto' }}>
          A safe, consent-first space. Everyone here is 18+ and independent. Respect pronouns, ask before you assume, and report anything that isn’t kind. Meetup-requests only — no on-platform payments for companionship.
        </p>
      </div>
    </div>
  )
}
