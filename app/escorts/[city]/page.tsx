import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCityEditorial, cityFaq } from '../../lib/cityContent'

const CITIES: Record<string, string> = {
  brussels:    'Brussels',
  antwerp:     'Antwerp',
  ghent:       'Ghent',
  grimbergen:  'Grimbergen',
  leuven:      'Leuven',
  mechelen:    'Mechelen',
  hasselt:     'Hasselt',
  namur:       'Namur',
  charleroi:   'Charleroi',
  kortrijk:    'Kortrijk',
  ostend:      'Ostend',
  amsterdam:   'Amsterdam',
  rotterdam:   'Rotterdam',
  berlin:      'Berlin',
  hamburg:     'Hamburg',
  paris:       'Paris',
  lyon:        'Lyon',
  luxembourg:  'Luxembourg',
  liege:       'Liège',
  bruges:      'Bruges',
  cologne:     'Cologne',
  zurich:      'Zürich',
  geneva:      'Geneva',
  basel:       'Basel',
  bern:        'Bern',
  lausanne:    'Lausanne',
}

/** Country slugs — queries by `country` column instead of `city`. */
const COUNTRIES: Record<string, { name: string; code: string; cities: string; desc: string }> = {
  belgium:     { name: 'Belgium', code: 'BE', cities: 'Brussels, Antwerp & Ghent', desc: 'Browse verified escort ads in Belgium — women, couples, men & trans. Independent escorts and agencies for dinner dates, business trips and private meetings. Real photos, reviews & prices.' },
  netherlands: { name: 'Netherlands', code: 'NL', cities: 'Amsterdam, Rotterdam & Den Haag', desc: 'View escort ads in the Netherlands — women, couples, men, trans & private houses for home reception, escort service or erotic massage. Verified profiles, real photos & prices.' },
  germany:     { name: 'Germany', code: 'DE', cities: 'Berlin, Cologne & Hamburg', desc: 'Escort directory for Germany — independent escorts, escort agencies and private houses. Find female, male & trans escorts in Berlin, Cologne and beyond. Real photos & reviews.' },
  france:      { name: 'France', code: 'FR', cities: 'Paris, Lyon & Marseille', desc: 'Browse verified escort ads in France — women, men, couples & trans. Independent escorts and agencies for dinner dates, travel and private meetings. Real photos, reviews & prices.' },
  luxembourg:  { name: 'Luxembourg', code: 'LU', cities: 'Luxembourg City', desc: 'Verified escort ads in Luxembourg — women, men, couples & trans. Independent escorts for dinner dates, business trips and private meetings. Real photos, reviews & prices.' },
  switzerland: { name: 'Switzerland', code: 'CH', cities: 'Zürich, Geneva & Basel', desc: 'Browse verified escort ads in Switzerland — women, men, couples & trans. Independent escorts and agencies in Zürich, Geneva, Basel and beyond for dinner dates, travel and private meetings. Real photos, reviews & prices.' },
}

const ALL_SLUGS = [...Object.keys(CITIES), ...Object.keys(COUNTRIES)]

export async function generateStaticParams() {
  return ALL_SLUGS.map(slug => ({ city: slug }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const slug = params.city.toLowerCase()
  if (COUNTRIES[slug]) {
    const c = COUNTRIES[slug]
    const title = `Escort ${c.name} — Escorts in ${c.cities} | SecretXperience`
    return {
      title,
      description: c.desc,
      openGraph: { title, description: c.desc, type: 'website' },
      alternates: { canonical: `https://www.secretxperience.eu/escorts/${slug}` },
    }
  }
  const cityName = CITIES[slug]
  if (!cityName) return { title: 'SecretXperience' }
  const title = `Escort Girls ${cityName} — Verified Escorts, Real Photos & Prices | SecretXperience`
  const desc = `View escort ads in ${cityName} — women, men, couples & trans for escort service, private reception or erotic massage. Independent escorts & VIP companions. Real photos, reviews & prices.`
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'website' },
    alternates: { canonical: `https://www.secretxperience.eu/escorts/${slug}` },
  }
}

export default async function EscortsCityPage({ params }: { params: { city: string } }) {
  const slug = params.city.toLowerCase()
  const isCountry = !!COUNTRIES[slug]
  const countryInfo = COUNTRIES[slug]
  const cityName = CITIES[slug]

  if (!isCountry && !cityName) notFound()

  const displayName = isCountry ? countryInfo.name : cityName!

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  let query = supabase
    .from('listings')
    .select('id, title, category, city, country, price_from, images, verified, premium, age, tags')
    .eq('active', true)
    .eq('status', 'approved')
    .in('category', ['escorts', 'companionship', 'massage', 'domination'])
    .order('premium', { ascending: false })
    .limit(60)

  if (isCountry) {
    // Match both full name ("Belgium") and 2-letter code ("BE")
    query = query.or(`country.ilike.%${countryInfo.name}%,country.ilike.${countryInfo.code}`)
  } else {
    query = query.ilike('city', `%${cityName}%`)
  }

  const { data: listings } = await query

  // For country pages: collect unique cities for sub-navigation
  const citiesInCountry = isCountry
    ? [...new Set((listings ?? []).map(l => l.city).filter(Boolean))].sort()
    : []

  // City editorial + FAQ (city pages only; country pages have their own layout).
  const editorial = !isCountry ? getCityEditorial(slug, displayName) : null
  const faq = !isCountry ? cityFaq(displayName, 'escort') : []

  const itemList = {
    '@type': 'ItemList',
    name: `Escorts in ${displayName}`,
    url: `https://www.secretxperience.eu/escorts/${slug}`,
    numberOfItems: listings?.length ?? 0,
    itemListElement: (listings || []).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.secretxperience.eu/listings/${l.id}`,
      name: l.title,
    })),
  }
  const graph: any[] = [itemList]
  if (!isCountry && faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': graph }

  const S = {
    bg: '#050505', bg2: '#0e0e0e', t: '#ece8e1', t2: 'rgba(236,232,225,0.5)',
    gold: '#c5a05a', b: 'rgba(255,255,255,0.07)', serif: "'Cormorant Garamond', serif",
    sans: "'Poppins', sans-serif",
  }

  const listingCount = listings?.length ?? 0

  // ── Country landing page ──────────────────────────────────────────────────
  if (isCountry) {
    const BENEFITS = [
      { icon: '✦', title: 'Free to list', body: 'Create your profile at no cost. Go live the same day and start receiving booking requests immediately.' },
      { icon: '◈', title: 'No commission', body: 'Keep 100% of what you earn. We never take a cut from your bookings — you deal directly with clients.' },
      { icon: '◉', title: 'Verified badge', body: 'Complete a quick identity check and earn a verified badge that puts you first in search results.' },
      { icon: '◇', title: 'Discreet & secure', body: 'Your personal info stays private. Clients contact you through our encrypted messaging system.' },
      { icon: '◈', title: 'Spotlight placement', body: 'Premium members appear at the top of every search, category page, and the homepage carousel.' },
      { icon: '✦', title: 'Multi-city reach', body: 'One profile, every city. Mark yourself available in multiple locations and appear in all of them.' },
    ]
    const STEPS = [
      { n: '01', title: 'Create your free profile', body: 'Sign up with your email or Google account. Add your photos, description, rates and availability in minutes.' },
      { n: '02', title: 'Get identity verified', body: 'Upload a quick ID selfie. Our team reviews it within 24 h and awards your Verified badge — clients trust it.' },
      { n: '03', title: 'Start receiving bookings', body: 'Clients browse and message you directly. You decide who to accept, when to meet, and where.' },
    ]
    const TIERS = [
      { name: 'Free', price: '€0', period: '/month', highlight: false, features: ['1 listing', 'Basic photo gallery (5 photos)', 'Direct messaging', 'City search visibility', 'Booking requests'] },
      { name: 'Premium', price: '€29', period: '/month', highlight: true, features: ['Unlimited advertisements', 'Full photo gallery (20 photos)', 'Priority in search results', 'Verified badge eligibility', 'Spotlight placement', 'Analytics dashboard', 'Featured on homepage'] },
      { name: 'Elite', price: '€69', period: '/month', highlight: false, features: ['Everything in Premium', 'Top-of-page placement', 'Profile featured in newsletter', 'Dedicated account manager', 'Token wallet (500 tokens/mo)', 'Video profile support'] },
    ]
    const countryCities = Object.entries(CITIES)

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
          <style>{`
            *{box-sizing:border-box;margin:0;padding:0}
            a{color:inherit;text-decoration:none}
            .lp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
            @media(max-width:640px){.lp-grid{grid-template-columns:repeat(2,1fr);gap:.65rem}}
            .lp-card{background:${S.bg2};border:0.5px solid ${S.b};border-radius:14px;overflow:hidden;transition:border-color .2s,transform .2s}
            .lp-card:hover{border-color:rgba(197,160,90,0.35);transform:translateY(-3px)}
            .lp-card-img{aspect-ratio:3/4;background:#111;overflow:hidden;position:relative}
            .lp-card-img img{width:100%;height:100%;object-fit:cover;display:block}
            .pill-link{font-size:13px;padding:5px 14px;border:0.5px solid ${S.b};border-radius:20px;color:${S.t2};transition:border-color .2s,color .2s;display:inline-block}
            .pill-link:hover{border-color:${S.gold};color:${S.gold}}
            .benefit-card{background:${S.bg2};border:0.5px solid ${S.b};border-radius:16px;padding:1.5rem;transition:border-color .2s}
            .benefit-card:hover{border-color:rgba(197,160,90,0.3)}
            .step-num{font-family:${S.serif};font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.12);line-height:1;margin-bottom:.5rem}
            .tier-card{background:${S.bg2};border:0.5px solid ${S.b};border-radius:20px;padding:2rem;display:flex;flex-direction:column;gap:.75rem;position:relative;overflow:hidden}
            .tier-card.featured{border-color:rgba(197,160,90,0.5);background:linear-gradient(160deg,rgba(197,160,90,0.07) 0%,${S.bg2} 60%)}
            .tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
            @media(max-width:768px){.tier-grid{grid-template-columns:1fr}}
            .benefit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
            @media(max-width:768px){.benefit-grid{grid-template-columns:1fr 1fr}}
            @media(max-width:480px){.benefit-grid{grid-template-columns:1fr}}
            .step-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
            @media(max-width:768px){.step-grid{grid-template-columns:1fr}}
            .cta-btn{display:inline-block;background:linear-gradient(135deg,#c5a05a,#e8c97a);color:#080808;font-weight:700;font-size:15px;padding:14px 32px;border-radius:999px;letter-spacing:.04em;transition:transform .15s,box-shadow .15s;text-decoration:none}
            .cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(197,160,90,0.35)}
            .cta-btn-outline{display:inline-block;border:1px solid rgba(197,160,90,0.5);color:${S.gold};font-size:14px;padding:11px 24px;border-radius:999px;transition:all .15s;text-decoration:none}
            .cta-btn-outline:hover{background:rgba(197,160,90,0.08);border-color:${S.gold}}
          `}</style>

          {/* ── Sticky header ── */}
          <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.96)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid rgba(197,160,90,0.12)`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, letterSpacing: '0.04em' }}>
              Secret<span style={{ color: S.gold }}>Xperience</span>
            </a>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <a href="/escorts" style={{ fontSize: 13, color: S.t2 }}>Browse escorts</a>
              <a href="/login" style={{ fontSize: 13, color: S.t2, border: `0.5px solid ${S.b}`, padding: '6px 14px', borderRadius: 8 }}>Log in</a>
              <a href="/listings/create" className="cta-btn" style={{ fontSize: 13, padding: '7px 18px' }}>List free →</a>
            </div>
          </header>

          {/* ── Hero ── */}
          <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(160deg, rgba(197,160,90,0.1) 0%, ${S.bg} 55%)`, padding: '5rem 24px 4rem', borderBottom: `0.5px solid rgba(197,160,90,0.1)` }}>
            <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,160,90,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: S.gold, marginBottom: '1.25rem', opacity: 0.9 }}>SecretXperience · {countryInfo.name}</div>
              <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, lineHeight: 1.08, marginBottom: '1.25rem' }}>
                Advertise your escort profile<br />
                <em style={{ color: S.gold }}>in {countryInfo.name}</em>
              </h1>
              <p style={{ fontSize: 16, color: S.t2, maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.75 }}>
                {listingCount > 0 ? `Join ${listingCount}+ verified advertisers` : 'Join verified advertisers'} already reaching clients across {countryInfo.cities}. Free to list. No commission. Go live today.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/listings/create" className="cta-btn">Create free profile →</a>
                <a href="#listings" className="cta-btn-outline">Browse profiles</a>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[['✓ Free advertisement', ''], ['✓ No commission', ''], ['✓ Verified badge', ''], ['✓ Direct messages', '']].map(([t]) => (
                  <span key={t} style={{ fontSize: 13, color: S.t2 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats bar ── */}
          <div style={{ borderBottom: `0.5px solid ${S.b}`, background: S.bg2 }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.25rem 24px', display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                [String(listingCount > 0 ? listingCount + '+' : '—'), 'Active profiles in ' + countryInfo.name],
                ['100%', 'Free — no hidden fees'],
                ['24 h', 'Verification turnaround'],
                ['EU', 'GDPR-compliant platform'],
              ].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: S.serif, fontSize: 28, fontStyle: 'italic', color: S.gold, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 12, color: S.t2, marginTop: 4 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

            {/* ── How it works ── */}
            <section style={{ padding: '5rem 0 4rem' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.75rem', opacity: 0.8 }}>How it works</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, marginBottom: '3rem', lineHeight: 1.2 }}>
                Up and running in <em style={{ color: S.gold }}>three steps</em>
              </h2>
              <div className="step-grid">
                {STEPS.map(s => (
                  <div key={s.n}>
                    <div className="step-num">{s.n}</div>
                    <h3 style={{ fontFamily: S.serif, fontSize: 20, fontWeight: 400, marginBottom: '0.6rem' }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: S.t2, lineHeight: 1.7 }}>{s.body}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '2.5rem' }}>
                <a href="/listings/create" className="cta-btn">Get started — it's free</a>
              </div>
            </section>

            {/* ── Benefits ── */}
            <section style={{ padding: '3rem 0 4rem', borderTop: `0.5px solid ${S.b}` }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.75rem', opacity: 0.8 }}>Why SecretXperience</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, marginBottom: '2.5rem', lineHeight: 1.2 }}>
                Built for independent advertisers
              </h2>
              <div className="benefit-grid">
                {BENEFITS.map(b => (
                  <div key={b.title} className="benefit-card">
                    <div style={{ fontSize: 22, color: S.gold, marginBottom: '0.75rem' }}>{b.icon}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '0.5rem', color: S.t }}>{b.title}</h3>
                    <p style={{ fontSize: 13, color: S.t2, lineHeight: 1.65 }}>{b.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Pricing ── */}
            <section style={{ padding: '3rem 0 4rem', borderTop: `0.5px solid ${S.b}` }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.75rem', opacity: 0.8 }}>Pricing</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, marginBottom: '0.5rem', lineHeight: 1.2 }}>Simple, transparent plans</h2>
              <p style={{ fontSize: 14, color: S.t2, marginBottom: '2.5rem' }}>Start free. Upgrade when you're ready.</p>
              <div className="tier-grid">
                {TIERS.map(t => (
                  <div key={t.name} className={`tier-card${t.highlight ? ' featured' : ''}`}>
                    {t.highlight && <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.gold, background: 'rgba(197,160,90,0.12)', border: `0.5px solid rgba(197,160,90,0.3)`, padding: '3px 8px', borderRadius: 5 }}>Most popular</div>}
                    <div style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 400 }}>{t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: S.serif, fontSize: 40, fontStyle: 'italic', color: S.gold }}>{t.price}</span>
                      <span style={{ fontSize: 13, color: S.t2 }}>{t.period}</span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', flex: 1 }}>
                      {t.features.map(f => (
                        <li key={f} style={{ fontSize: 13, color: S.t2, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: S.gold, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <a href="/listings/create" className={t.highlight ? 'cta-btn' : 'cta-btn-outline'} style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                      {t.price === '€0' ? 'Start for free' : `Choose ${t.name}`}
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Live profiles (social proof) ── */}
            {listingCount > 0 && (
              <section id="listings" style={{ padding: '3rem 0 4rem', borderTop: `0.5px solid ${S.b}` }}>
                <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.75rem', opacity: 0.8 }}>Live now</div>
                <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 400, marginBottom: '0.5rem' }}>
                  Active profiles in <em style={{ color: S.gold }}>{countryInfo.name}</em>
                </h2>
                <p style={{ fontSize: 14, color: S.t2, marginBottom: '2rem' }}>This is what clients see when they search for escorts in {countryInfo.name}.</p>
                <div className="lp-grid">
                  {(listings || []).slice(0, 12).map(l => (
                    <Link key={l.id} href={`/listings/${l.id}`}>
                      <div className="lp-card">
                        <div className="lp-card-img">
                          {l.images?.[0]
                            ? <img src={l.images[0]} alt={l.title} loading="lazy" />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.serif, fontSize: '60px', fontStyle: 'italic', color: 'rgba(197,160,90,0.1)' }}>{l.title.charAt(0)}</div>
                          }
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(5,5,5,0.75) 0%,transparent 55%)', pointerEvents: 'none' }} />
                          {l.verified && <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', letterSpacing: '0.06em', backdropFilter: 'blur(4px)' }}>✓</span>}
                        </div>
                        <div style={{ padding: '10px 12px 12px' }}>
                          <div style={{ fontFamily: S.serif, fontSize: 15, fontWeight: 400, color: S.t, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: S.t2 }}>
                            <span>📍 {l.city}</span>
                            {l.price_from ? <span style={{ color: S.gold }}>€{l.price_from}</span> : null}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {listingCount > 12 && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <a href="/escorts" className="cta-btn-outline">View all {listingCount} profiles →</a>
                  </div>
                )}
              </section>
            )}

            {/* ── Bottom CTA ── */}
            <section style={{ padding: '3rem 0 5rem', textAlign: 'center', borderTop: `0.5px solid ${S.b}` }}>
              <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, marginBottom: '1rem', lineHeight: 1.2 }}>
                Ready to reach clients in <em style={{ color: S.gold }}>{countryInfo.name}</em>?
              </h2>
              <p style={{ fontSize: 15, color: S.t2, marginBottom: '2rem', maxWidth: 460, margin: '0 auto 2rem' }}>
                Create your free profile in minutes. No credit card required.
              </p>
              <a href="/listings/create" className="cta-btn" style={{ fontSize: 16, padding: '16px 40px' }}>Create free profile →</a>
            </section>

            {/* ── Browse by city ── */}
            <div style={{ borderTop: `0.5px solid ${S.b}`, paddingTop: '2rem', paddingBottom: '3rem' }}>
              <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Browse by city</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
                {citiesInCountry.length > 0
                  ? citiesInCountry.map(city => {
                      const citySlug = Object.entries(CITIES).find(([,v]) => v.toLowerCase() === city.toLowerCase())?.[0]
                      return citySlug
                        ? <a key={city} href={`/escorts/${citySlug}`} className="pill-link">{city}</a>
                        : <span key={city} className="pill-link" style={{ cursor: 'default' }}>{city}</span>
                    })
                  : countryCities.map(([k, name]) => (
                      <a key={k} href={`/escorts/${k}`} className="pill-link">{name}</a>
                    ))
                }
              </div>
              <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Other countries</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(COUNTRIES).filter(([k]) => k !== slug).map(([k, c]) => (
                  <a key={k} href={`/escorts/${k}`} className="pill-link">{c.name}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── City listing page ─────────────────────────────────────────────────────
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          a{color:inherit;text-decoration:none}
          .city-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
          @media(max-width:640px){.city-grid{grid-template-columns:repeat(2,1fr);gap:.65rem}}
          .city-card{background:${S.bg2};border:0.5px solid ${S.b};border-radius:14px;overflow:hidden;transition:border-color .2s,transform .2s;cursor:pointer}
          .city-card:hover{border-color:rgba(197,160,90,0.35);transform:translateY(-3px)}
          .city-card-img{aspect-ratio:3/4;background:#111;overflow:hidden;position:relative}
          .city-card-img img{width:100%;height:100%;object-fit:cover;display:block}
          .city-card-body{padding:10px 12px 12px}
          .city-card-name{font-family:${S.serif};font-size:15px;font-weight:400;color:${S.t};margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .city-card-meta{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:${S.t2}}
          .pill-link{font-size:13px;padding:5px 14px;border:0.5px solid ${S.b};border-radius:20px;color:${S.t2};transition:border-color .2s,color .2s;display:inline-block}
          .pill-link:hover{border-color:${S.gold};color:${S.gold}}
        `}</style>

        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid rgba(197,160,90,0.12)`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, letterSpacing: '0.04em' }}>
            Secret<span style={{ color: S.gold }}>Xperience</span>
          </a>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/escorts" style={{ fontSize: 13, color: S.t2 }}>← All escorts</a>
            <a href="/listings/create" style={{ fontSize: 13, color: S.gold, border: `0.5px solid rgba(197,160,90,0.4)`, padding: '6px 14px', borderRadius: 8, fontWeight: 500 }}>+ Advertise free</a>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 24px 6rem' }}>
          <nav style={{ fontSize: 12, color: S.t2, marginBottom: '1.5rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <a href="/" style={{ color: S.t2 }}>Home</a>
            <span>›</span>
            <a href="/escorts" style={{ color: S.t2 }}>Escorts</a>
            <span>›</span>
            <span style={{ color: S.gold }}>{displayName}</span>
          </nav>

          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, marginBottom: '0.5rem', lineHeight: 1.15 }}>
            Escort Girls <em style={{ fontStyle: 'italic', color: S.gold }}>{displayName}</em>
          </h1>
          <p style={{ fontSize: 14, color: S.t2, marginBottom: '1.25rem', maxWidth: 560, lineHeight: 1.7 }}>
            {listingCount} verified advertiser{listingCount !== 1 ? 's' : ''} available in {displayName}. All listings independently submitted and identity-reviewed.
          </p>

          {editorial && (
            <div style={{ maxWidth: 720, marginBottom: '2.5rem' }}>
              <p style={{ fontSize: 15, color: S.t, lineHeight: 1.8, marginBottom: editorial.areas.length ? '1.25rem' : 0 }}>
                {editorial.intro}
              </p>
              {editorial.areas.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.t2, marginBottom: '0.6rem' }}>Areas in {displayName}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {editorial.areas.map(a => (
                      <span key={a} className="pill-link" style={{ cursor: 'default' }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {listingCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: S.t2 }}>
              <p style={{ fontSize: 16, marginBottom: 16 }}>No advertisements yet in {displayName}.</p>
              <a href="/escorts" style={{ color: S.gold, fontSize: 14 }}>Browse all escorts →</a>
            </div>
          ) : (
            <div className="city-grid">
              {(listings || []).map(l => (
                <Link key={l.id} href={`/listings/${l.id}`}>
                  <div className="city-card">
                    <div className="city-card-img">
                      {l.images?.[0]
                        ? <img src={l.images[0]} alt={l.title} loading="lazy" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.serif, fontSize: '60px', fontStyle: 'italic', color: 'rgba(197,160,90,0.1)' }}>{l.title.charAt(0)}</div>
                      }
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(5,5,5,0.75) 0%,transparent 55%)', pointerEvents: 'none' }} />
                      {l.verified && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(38,212,160,0.15)', border: '0.5px solid rgba(38,212,160,0.4)', color: '#26d4a0', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', letterSpacing: '0.06em', backdropFilter: 'blur(4px)' }}>✓</span>
                      )}
                    </div>
                    <div className="city-card-body">
                      <div className="city-card-name">{l.title}</div>
                      <div className="city-card-meta">
                        <span>📍 {l.city}</span>
                        {l.age ? <span>{l.age} yrs</span> : (l.price_from ? <span style={{ color: S.gold }}>€{l.price_from}</span> : null)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {faq.length > 0 && (
            <section style={{ marginTop: '4rem', borderTop: `0.5px solid ${S.b}`, paddingTop: '2.5rem', maxWidth: 760 }}>
              <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(24px,4vw,34px)', fontWeight: 400, marginBottom: '1.75rem' }}>
                Escorts in {displayName} — <em style={{ color: S.gold }}>your questions</em>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {faq.map(f => (
                  <div key={f.q}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: S.t, marginBottom: '0.4rem' }}>{f.q}</h3>
                    <p style={{ fontSize: 14, color: S.t2, lineHeight: 1.7 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ marginTop: '4rem', borderTop: `0.5px solid ${S.b}`, paddingTop: '2rem' }}>
            <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Browse by country</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
              {Object.entries(COUNTRIES).map(([k, c]) => (
                <a key={k} href={`/escorts/${k}`} className="pill-link">{c.name}</a>
              ))}
            </div>
            <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t2, marginBottom: '1rem' }}>Browse by city</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(CITIES).filter(([k]) => k !== slug).map(([k, name]) => (
                <a key={k} href={`/escorts/${k}`} className="pill-link">{name}</a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
