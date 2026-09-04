'use client'

// Destination showcase for the advertise page: image + visible "from" price per
// destination, deep-linking into Booking.com (with our affiliate id). Prices are
// indicative starting rates (labelled "vanaf · indicatief"); the live price is
// one click away on Booking, sorted popularity (hot) or price (deal). Photos are
// drop-in: put <slug>.jpg in /public/destinations and it replaces the gradient.

const AID = process.env.NEXT_PUBLIC_BOOKING_AID || '8132308'

type Dest = {
  city: string; country: string; flag: string; slug: string
  kind: 'hot' | 'deal'; from: number; grad: string
}

const DESTS: Dest[] = [
  { city: 'Brussels',   country: 'Belgium',     flag: '🇧🇪', slug: 'brussels',   kind: 'hot',  from: 79,  grad: 'linear-gradient(140deg,#3a2540,#160d1e)' },
  { city: 'Amsterdam',  country: 'Netherlands', flag: '🇳🇱', slug: 'amsterdam',  kind: 'hot',  from: 119, grad: 'linear-gradient(140deg,#243a52,#0d1622)' },
  { city: 'Antwerp',    country: 'Belgium',     flag: '🇧🇪', slug: 'antwerp',    kind: 'hot',  from: 85,  grad: 'linear-gradient(140deg,#3a2a1a,#180f08)' },
  { city: 'Paris',      country: 'France',      flag: '🇫🇷', slug: 'paris',      kind: 'hot',  from: 109, grad: 'linear-gradient(140deg,#402535,#1a0d16)' },
  { city: 'Bruges',     country: 'Belgium',     flag: '🇧🇪', slug: 'bruges',     kind: 'deal', from: 89,  grad: 'linear-gradient(140deg,#2a3320,#12180a)' },
  { city: 'Cologne',    country: 'Germany',     flag: '🇩🇪', slug: 'cologne',    kind: 'deal', from: 75,  grad: 'linear-gradient(140deg,#33202a,#160b12)' },
  { city: 'Ghent',      country: 'Belgium',     flag: '🇧🇪', slug: 'ghent',      kind: 'deal', from: 82,  grad: 'linear-gradient(140deg,#1f3340,#0b161c)' },
  { city: 'Luxembourg', country: 'Luxembourg',  flag: '🇱🇺', slug: 'luxembourg', kind: 'deal', from: 95,  grad: 'linear-gradient(140deg,#2e2a44,#12101f)' },
]

function url(d: Dest) {
  const p = new URLSearchParams({
    aid: AID, ss: d.city, selected_currency: 'EUR',
    order: d.kind === 'deal' ? 'price' : 'popularity',
  })
  return `https://www.booking.com/searchresults.html?${p.toString()}`
}

export default function DestinationDeals() {
  return (
    <section style={{ padding: '6rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Popular destinations
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, marginBottom: '0.75rem' }}>
          Trending stays &amp; <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>deals</em>
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--t2)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          Where your guests are booking now — live rates on Booking.com.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '18px' }}>
        {DESTS.map(d => (
          <a key={d.slug} href={url(d)} target="_blank" rel="noopener noreferrer sponsored" className="dest-card" style={{
            display: 'block', textDecoration: 'none', borderRadius: '15px', overflow: 'hidden',
            border: '0.5px solid var(--b,rgba(255,255,255,0.08))', background: 'var(--bg1,#0a0a0a)',
            transition: 'transform .15s, border-color .15s',
          }}>
            {/* image / gradient postcard */}
            <div style={{ position: 'relative', height: '150px', background: d.grad, overflow: 'hidden' }}>
              <img
                src={`/destinations/${d.slug}.jpg`}
                alt={d.city}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.72))' }} />
              <span style={{
                position: 'absolute', top: '10px', right: '10px',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '4px 9px', borderRadius: '20px', backdropFilter: 'blur(6px)',
                ...(d.kind === 'hot'
                  ? { background: 'rgba(184,77,114,0.85)', color: '#fff' }
                  : { background: 'rgba(197,160,90,0.9)', color: '#0a0a0a' }),
              }}>{d.kind === 'hot' ? '🔥 Hot' : '🏷️ Deal'}</span>
              <div style={{ position: 'absolute', left: '14px', bottom: '10px' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: '#fff', lineHeight: 1.1 }}>{d.city}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{d.flag} {d.country}</div>
              </div>
            </div>
            {/* price row */}
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>vanaf · indicatief</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold)' }}>€{d.from}<span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--t3)' }}> / nacht</span></div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600, whiteSpace: 'nowrap' }}>Live prijzen →</span>
            </div>
          </a>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--t3)', marginTop: '1.5rem' }}>
        Prijzen indicatief · live tarieven &amp; beschikbaarheid op Booking.com · SecretXperience ontvangt een commissie op boekingen.
      </div>
      <style>{`.dest-card:hover{ transform:translateY(-3px); border-color:var(--gbrd,rgba(197,160,90,0.4)) !important; }`}</style>
    </section>
  )
}
