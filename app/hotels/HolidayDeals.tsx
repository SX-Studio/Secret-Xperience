'use client'

// Curated Flight + Hotel holiday deals for the Hotels page. Data is static
// marketing content (name, location, rating, nights, dates, price/person from
// the source deal). Cards deep-link to Booking.com (affiliate id) for the hotel;
// swap to a lastminute affiliate link here if/when one is set. Photos are
// drop-in: /public/deals/<slug>.jpg replaces the gradient fallback.

const AID = process.env.NEXT_PUBLIC_BOOKING_AID || '8132308'

type Deal = {
  name: string; loc: string; slug: string; stars: number; rating: number; reviews: number
  nights: number; dates: string; from: number; allInclusive?: boolean; flash?: boolean; grad: string
}

const ALL_INCLUSIVE: Deal[] = [
  { name: 'Hotel Las Águilas Tenerife, Affiliated by Meliá', loc: 'Puerto de la Cruz, Spanje', slug: 'las-aguilas-tenerife', stars: 4, rating: 4.0, reviews: 1614, nights: 4, dates: '16 – 20 nov', from: 720, allInclusive: true, grad: 'linear-gradient(140deg,#1f4a52,#0b1c1e)' },
  { name: 'Checkin Bungalows Atlántida', loc: 'Los Cristianos, Spanje', slug: 'checkin-bungalows-atlantida', stars: 3, rating: 3.0, reviews: 2046, nights: 5, dates: '12 – 17 okt', from: 671, allInclusive: true, grad: 'linear-gradient(140deg,#245266,#0b1a22)' },
  { name: 'Ona Alborada', loc: 'Buzanada, Spanje', slug: 'ona-alborada', stars: 3, rating: 3.5, reviews: 660, nights: 5, dates: '21 – 26 sep', from: 646, allInclusive: true, flash: true, grad: 'linear-gradient(140deg,#2a5560,#0d1c20)' },
]

const FLASH_SALE: Deal[] = [
  { name: 'Ilunion Bel-Art', loc: 'Barcelona, Spanje', slug: 'ilunion-bel-art', stars: 4, rating: 4.0, reviews: 549, nights: 2, dates: '2 – 4 okt', from: 394, flash: true, grad: 'linear-gradient(140deg,#3a2e40,#160f1c)' },
  { name: 'behotelisboa', loc: 'Lissabon, Portugal', slug: 'behotelisboa', stars: 4, rating: 4.5, reviews: 846, nights: 2, dates: '22 – 24 jan', from: 197, flash: true, grad: 'linear-gradient(140deg,#3a3320,#18120a)' },
  { name: 'Hôtel Aqua Mirage Club & Aqua Parc – All Inclusive – Marrakech', loc: 'Marrakesh, Marokko', slug: 'aqua-mirage-marrakech', stars: 4, rating: 4.0, reviews: 9191, nights: 3, dates: '19 – 22 nov', from: 390, allInclusive: true, flash: true, grad: 'linear-gradient(140deg,#4a3320,#1c1008)' },
]

type Tile = { city: string; slug: string; from: number; grad: string }
const DESTINATIONS: Tile[] = [
  { city: 'Salou',        slug: 'salou',        from: 115, grad: 'linear-gradient(140deg,#1f4a66,#0b1a24)' },
  { city: 'Chefchaouene', slug: 'chefchaouene', from: 119, grad: 'linear-gradient(140deg,#20406a,#0b1626)' },
  { city: 'Calella',      slug: 'calella',      from: 145, grad: 'linear-gradient(140deg,#245a52,#0b201c)' },
  { city: 'Avignon',      slug: 'avignon',      from: 148, grad: 'linear-gradient(140deg,#3a4a24,#141c0b)' },
  { city: 'Madrid',       slug: 'madrid',       from: 197, grad: 'linear-gradient(140deg,#4a3520,#1c1208)' },
  { city: 'Rome',         slug: 'rome',         from: 203, grad: 'linear-gradient(140deg,#4a2f28,#1c0f0b)' },
]

const hotelUrl = (d: Deal) =>
  `https://www.booking.com/searchresults.html?${new URLSearchParams({ aid: AID, ss: `${d.name.split('–')[0].trim()} ${d.loc.split(',')[0]}`, selected_currency: 'EUR' })}`
const cityUrl = (t: Tile) =>
  `https://www.booking.com/searchresults.html?${new URLSearchParams({ aid: AID, ss: t.city, selected_currency: 'EUR', order: 'price' })}`

function Stars({ n }: { n: number }) {
  return <span style={{ color: 'var(--gold)', fontSize: '11px', letterSpacing: '1px' }}>{'★'.repeat(n)}<span style={{ color: 'var(--t3)' }}>{'★'.repeat(5 - n)}</span></span>
}

function DealCard({ d }: { d: Deal }) {
  return (
    <a href={hotelUrl(d)} target="_blank" rel="noopener noreferrer sponsored" className="hd-card" style={{
      display: 'flex', flexDirection: 'column', textDecoration: 'none', borderRadius: '15px', overflow: 'hidden',
      background: 'var(--bg1,#0a0a0a)', border: '0.5px solid var(--b,rgba(255,255,255,0.08))', transition: 'transform .15s,border-color .15s',
    }}>
      <div style={{ position: 'relative', height: '190px', background: d.grad, overflow: 'hidden' }}>
        <img src={`/deals/${d.slug}.jpg`} alt={d.name} loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 55%,rgba(0,0,0,0.7))' }} />
        <span style={{ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', background: 'rgba(20,30,40,0.85)', color: '#fff', backdropFilter: 'blur(6px)' }}>
          ✈ 🏨 Flight + Hotel
        </span>
        {d.flash && (
          <span style={{ position: 'absolute', top: '44px', right: '10px', fontSize: '10px', fontWeight: 700, padding: '4px 9px', borderRadius: '8px', background: 'rgba(245,158,11,0.95)', color: '#0a0a0a' }}>
            ⚡ Flash sale
          </span>
        )}
        <div style={{ position: 'absolute', left: '14px', bottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#fff', fontSize: '12px' }}>
          <i className="ti ti-map-pin" style={{ fontSize: '13px' }} /> {d.loc}
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--t)', lineHeight: 1.25 }}>{d.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stars n={d.stars} />
          <span style={{ fontSize: '11px', color: 'var(--t2)' }}>● {d.rating.toFixed(1)} · {d.reviews.toLocaleString('nl-BE')} reviews</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.6 }}>
          {d.nights} nachten · {d.dates}<br />
          Vlucht inbegrepen · Brussel{d.allInclusive ? <><br />All-inclusive</> : null}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--t3)' }}>vanaf </span>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold)' }}>€{d.from}</span>
          <span style={{ fontSize: '11px', color: 'var(--t3)' }}> / persoon</span>
        </div>
      </div>
    </a>
  )
}

export default function HolidayDeals() {
  const Row = ({ title, sub, items }: { title: string; sub: string; items: Deal[] }) => (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 400, margin: 0 }}>{title}</h2>
        <p style={{ fontSize: '13px', color: 'var(--t3)', marginTop: '2px' }}>{sub}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '18px' }}>
        {items.map(d => <DealCard key={d.slug} d={d} />)}
      </div>
    </div>
  )

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <Row title="All-inclusive holidays" sub="For a carefree journey" items={ALL_INCLUSIVE} />
      <Row title="Flash Sale offers" sub="Limited time offers" items={FLASH_SALE} />

      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 400, margin: 0 }}>Flight + Hotel Deals</h2>
          <p style={{ fontSize: '13px', color: 'var(--t3)', marginTop: '2px' }}>Discover our most popular destinations</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {DESTINATIONS.map(t => (
            <a key={t.slug} href={cityUrl(t)} target="_blank" rel="noopener noreferrer sponsored" className="hd-card" style={{
              position: 'relative', display: 'block', height: '150px', borderRadius: '14px', overflow: 'hidden',
              textDecoration: 'none', background: t.grad, border: '0.5px solid var(--b,rgba(255,255,255,0.08))', transition: 'transform .15s',
            }}>
              <img src={`/deals/${t.slug}.jpg`} alt={t.city} loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.55))' }} />
              <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '12px', fontWeight: 700, padding: '5px 11px', borderRadius: '8px', background: 'rgba(255,255,255,0.95)', color: '#111' }}>From €{t.from}</span>
              <div style={{ position: 'absolute', left: '16px', bottom: '12px', fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 600, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{t.city}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--t3)', marginTop: '1.75rem' }}>
        Prijzen per persoon, indicatief · vluchten vanaf Brussel · boeking &amp; actuele beschikbaarheid bij onze reispartner.
      </div>
      <style>{`.hd-card:hover{ transform:translateY(-3px); border-color:var(--gbrd,rgba(197,160,90,0.4)) !important; }`}</style>
    </div>
  )
}
