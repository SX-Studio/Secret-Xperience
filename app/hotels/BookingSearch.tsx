'use client'

import { useState } from 'react'

// Booking.com affiliate partner id. The search box deep-links to Booking.com
// carrying this aid, so bookings complete on Booking's side (they handle payment
// and guest data — nothing touches our own payment/PII flows) and we earn the
// affiliate commission. Overridable via env without a code change.
const AID = process.env.NEXT_PUBLIC_BOOKING_AID || '8132308'

const CITIES = ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Amsterdam', 'Rotterdam', 'Cologne', 'Paris', 'Luxembourg']

function nextSaturday(): Date {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  return d
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

export default function BookingSearch({ defaultCity = '' }: { defaultCity?: string }) {
  const ci = nextSaturday()
  const co = new Date(ci); co.setDate(co.getDate() + 2)

  const [dest, setDest] = useState(defaultCity)
  const [checkin, setCheckin] = useState(iso(ci))
  const [checkout, setCheckout] = useState(iso(co))
  const [adults, setAdults] = useState(2)
  const [rooms, setRooms] = useState(1)

  function search(destination: string) {
    const q = destination.trim()
    if (!q) return
    const p = new URLSearchParams({
      aid: AID,
      ss: q,
      checkin,
      checkout,
      group_adults: String(adults),
      group_children: '0',
      no_rooms: String(rooms),
      selected_currency: 'EUR',
    })
    window.open(`https://www.booking.com/searchresults.html?${p.toString()}`, '_blank', 'noopener,noreferrer')
  }

  const inp: React.CSSProperties = {
    height: '44px', padding: '0 12px', background: 'var(--bg2)', border: '0.5px solid var(--b2)',
    borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '14px', outline: 'none', width: '100%',
    fontFamily: 'var(--sans)', colorScheme: 'dark',
  }
  const lbl: React.CSSProperties = {
    fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--t3)', marginBottom: '6px', display: 'block', fontWeight: 600,
  }

  return (
    <div style={{
      marginBottom: '2.5rem', padding: '1.75rem',
      background: 'linear-gradient(140deg,#1a2028 0%,#0d1018 60%,#080612 100%)',
      border: '0.5px solid rgba(197,160,90,0.15)', borderRadius: '16px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 0%,rgba(197,160,90,0.07) 0%,transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '2px' }}>
              Search &amp; book <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>any hotel</em>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t3)' }}>Live availability &amp; prices — powered by Booking.com</div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--t3)' }}>Free cancellation on most rooms</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,2fr) 1fr 1fr auto auto auto', gap: '10px', alignItems: 'end' }} className="bk-grid">
          <div>
            <label style={lbl}>Destination</label>
            <input style={inp} placeholder="City, hotel or landmark" value={dest}
              onChange={e => setDest(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search(dest) }} />
          </div>
          <div>
            <label style={lbl}>Check-in</label>
            <input type="date" style={inp} value={checkin} min={iso(new Date())}
              onChange={e => setCheckin(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Check-out</label>
            <input type="date" style={inp} value={checkout} min={checkin}
              onChange={e => setCheckout(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Guests</label>
            <select style={{ ...inp, width: '80px' }} value={adults} onChange={e => setAdults(+e.target.value)}>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Rooms</label>
            <select style={{ ...inp, width: '80px' }} value={rooms} onChange={e => setRooms(+e.target.value)}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={() => search(dest)} style={{
            height: '44px', padding: '0 22px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,var(--gold),var(--goldd))', color: '#0a0a0a',
            borderRadius: 'var(--r)', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap',
          }}>Search</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--t3)', marginRight: '2px' }}>Popular:</span>
          {CITIES.map(c => (
            <button key={c} onClick={() => { setDest(c); search(c) }} style={{
              height: '30px', padding: '0 12px', borderRadius: '20px', cursor: 'pointer',
              border: '0.5px solid var(--b)', background: 'transparent', color: 'var(--t2)', fontSize: '12px',
            }}>{c}</button>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:820px){ .bk-grid{ grid-template-columns:1fr 1fr !important; } .bk-grid > button{ grid-column:1 / -1; } }`}</style>
    </div>
  )
}
