'use client'

import { useState } from 'react'

// Untracked lastminute Flight + Hotel launcher: collects the trip details and
// opens lastminute's holidays (flight+hotel) search in a new tab. lastminute's
// deep-link parameter names aren't published, so the query below is best-effort —
// unknown params are ignored and the visitor still lands on a valid search page.
// When an affiliate deep-link/ID is available, set NEXT_PUBLIC_LASTMINUTE_URL
// (full tracked base) and/or NEXT_PUBLIC_LASTMINUTE_AFF (extra query string) and
// bookings become attributed with no other change.
const BASE = process.env.NEXT_PUBLIC_LASTMINUTE_URL || 'https://www.lastminute.com/holidays'
const AFF = process.env.NEXT_PUBLIC_LASTMINUTE_AFF || ''

const POPULAR = ['Tenerife', 'Barcelona', 'Mallorca', 'Marrakesh', 'Lisbon', 'Rome', 'Costa del Sol', 'Antalya']

function nextSaturday(): Date {
  const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); return d
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

export default function LastminuteSearch() {
  const ci = nextSaturday(); const co = new Date(ci); co.setDate(co.getDate() + 5)
  const [dest, setDest] = useState('')
  const [origin, setOrigin] = useState('Brussels')
  const [checkin, setCheckin] = useState(iso(ci))
  const [checkout, setCheckout] = useState(iso(co))
  const [adults, setAdults] = useState(2)

  function go(destination: string) {
    const q = destination.trim()
    const p = new URLSearchParams({
      destination: q, departure: origin, checkIn: checkin, checkOut: checkout, adults: String(adults),
    })
    if (AFF) new URLSearchParams(AFF).forEach((v, k) => p.set(k, v))
    const sep = BASE.includes('?') ? '&' : '?'
    window.open(`${BASE}${q || AFF ? sep + p.toString() : ''}`, '_blank', 'noopener,noreferrer')
  }

  const inp: React.CSSProperties = { height: '44px', padding: '0 12px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '14px', outline: 'none', width: '100%', fontFamily: 'var(--sans)', colorScheme: 'dark' }
  const lbl: React.CSSProperties = { fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '6px', display: 'block', fontWeight: 600 }

  return (
    <div style={{ marginBottom: '2.5rem', padding: '1.75rem', background: 'linear-gradient(140deg,#241a2e 0%,#140d1a 60%,#080612 100%)', border: '0.5px solid rgba(197,160,90,0.15)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 0%,rgba(197,160,90,0.07) 0%,transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '2px' }}>
              ✈🏨 Flight + Hotel <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>packages</em>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t3)' }}>All-inclusive &amp; city breaks — search live deals on lastminute.com</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,2fr) 1fr 1fr 1fr auto auto', gap: '10px', alignItems: 'end' }} className="lm-grid">
          <div>
            <label style={lbl}>Destination</label>
            <input style={inp} placeholder="Where to?" value={dest} onChange={e => setDest(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') go(dest) }} />
          </div>
          <div>
            <label style={lbl}>From</label>
            <input style={inp} value={origin} onChange={e => setOrigin(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Check-in</label>
            <input type="date" style={inp} value={checkin} min={iso(new Date())} onChange={e => setCheckin(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Check-out</label>
            <input type="date" style={inp} value={checkout} min={checkin} onChange={e => setCheckout(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Travellers</label>
            <select style={{ ...inp, width: '80px' }} value={adults} onChange={e => setAdults(+e.target.value)}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={() => go(dest)} style={{ height: '44px', padding: '0 22px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', color: '#0a0a0a', borderRadius: 'var(--r)', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>Search</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--t3)', marginRight: '2px' }}>Popular:</span>
          {POPULAR.map(c => (
            <button key={c} onClick={() => { setDest(c); go(c) }} style={{ height: '30px', padding: '0 12px', borderRadius: '20px', cursor: 'pointer', border: '0.5px solid var(--b)', background: 'transparent', color: 'var(--t2)', fontSize: '12px' }}>{c}</button>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:820px){ .lm-grid{ grid-template-columns:1fr 1fr !important; } .lm-grid > button{ grid-column:1 / -1; } }`}</style>
    </div>
  )
}
