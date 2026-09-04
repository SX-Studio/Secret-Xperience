// Destination overview for the Hotels category: a curated grid of "hot seller"
// and "deal" destinations that deep-link into Booking.com (carrying our affiliate
// id). We deliberately don't print fabricated discount percentages — "hot" cards
// open Booking sorted by popularity, "deal" cards sorted by price (cheapest
// first), so the numbers the visitor sees are always Booking's real live prices.

const AID = process.env.NEXT_PUBLIC_BOOKING_AID || '8132308'

type Dest = { city: string; country: string; flag: string; kind: 'hot' | 'deal'; blurb: string }

const DESTS: Dest[] = [
  { city: 'Brussels',   country: 'Belgium',     flag: '🇧🇪', kind: 'hot',  blurb: 'City-break favourite' },
  { city: 'Amsterdam',  country: 'Netherlands', flag: '🇳🇱', kind: 'hot',  blurb: 'Books out fast' },
  { city: 'Antwerp',    country: 'Belgium',     flag: '🇧🇪', kind: 'hot',  blurb: 'Weekend hotspot' },
  { city: 'Paris',      country: 'France',      flag: '🇫🇷', kind: 'hot',  blurb: 'Always in demand' },
  { city: 'Bruges',     country: 'Belgium',     flag: '🇧🇪', kind: 'deal', blurb: 'Off-peak value' },
  { city: 'Cologne',    country: 'Germany',     flag: '🇩🇪', kind: 'deal', blurb: 'Great midweek rates' },
  { city: 'Ghent',      country: 'Belgium',     flag: '🇧🇪', kind: 'deal', blurb: 'Boutique bargains' },
  { city: 'Luxembourg', country: 'Luxembourg',  flag: '🇱🇺', kind: 'deal', blurb: 'Low-season deals' },
]

function url(city: string, kind: 'hot' | 'deal') {
  const p = new URLSearchParams({
    aid: AID,
    ss: city,
    selected_currency: 'EUR',
    order: kind === 'deal' ? 'price' : 'popularity',
  })
  return `https://www.booking.com/searchresults.html?${p.toString()}`
}

export default function HotelDeals() {
  const hot = DESTS.filter(d => d.kind === 'hot')
  const deal = DESTS.filter(d => d.kind === 'deal')

  const Section = ({ title, sub, badge, items }: { title: string; sub: string; badge: string; items: Dest[] }) => (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '0.9rem' }}>
        <span style={{ fontSize: '18px' }}>{badge}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '18px' }}>{title}</span>
        <span style={{ fontSize: '12px', color: 'var(--t3)' }}>{sub}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
        {items.map(d => (
          <a key={d.city} href={url(d.city, d.kind)} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: 'block', padding: '14px 16px', borderRadius: '13px', textDecoration: 'none',
            background: 'var(--bg1,#0a0a0a)', border: '0.5px solid var(--b,rgba(255,255,255,0.07))',
            transition: 'all .15s',
          }} className="deal-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t)' }}>{d.flag} {d.city}</span>
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: '20px',
                ...(d.kind === 'hot'
                  ? { background: 'rgba(184,77,114,0.14)', color: '#e08aa6' }
                  : { background: 'rgba(197,160,90,0.14)', color: 'var(--gold)' }),
              }}>{d.kind === 'hot' ? 'Hot' : 'Deal'}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '8px' }}>{d.blurb}</div>
            <div style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>View live deals →</div>
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{
      marginBottom: '2.5rem', padding: '1.75rem',
      background: 'var(--bg1,#0a0a0a)', border: '0.5px solid var(--b,rgba(255,255,255,0.06))', borderRadius: '16px',
    }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: '1.25rem' }}>
        Where to stay · live rates on Booking.com
      </div>
      <Section title="Hot sellers" sub="most-booked right now" badge="🔥" items={hot} />
      <Section title="Best deals" sub="lowest prices first" badge="🏷️" items={deal} />
      <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '0.25rem' }}>
        Prices and availability shown live on Booking.com · SecretXperience earns a commission on bookings.
      </div>
      <style>{`.deal-card:hover{ border-color:var(--gbrd,rgba(197,160,90,0.35)) !important; background:var(--bg2,rgba(255,255,255,0.03)) !important; transform:translateY(-1px); }`}</style>
    </div>
  )
}
