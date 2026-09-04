'use client'
import { useState } from 'react'
import Link from 'next/link'
import DestinationDeals from './DestinationDeals'

const categories = [
  { icon: 'ti-user', title: 'Escorts & Companions', desc: 'Independent escorts, agency companions, GFE, touring — verified profiles with booking calendar and private messaging.', color: 'var(--grad-boudoir)' },
  { icon: 'ti-camera', title: 'Content Creators', desc: 'OnlyFans, Fansly, cam models and adult creators — sell subscriptions, PPV and custom content directly on the platform.', color: 'var(--grad-plum)' },
  { icon: 'ti-building', title: 'Clubs & Nightlife', desc: 'Adult clubs, fetish bars, BDSM dungeons, swingers clubs — list your venue, events and ticket sales.', color: 'linear-gradient(140deg,#2a1a3a 0%,#110a18 100%)' },
  { icon: 'ti-heart', title: 'Wellness & Massage', desc: 'Tantra massage, erotic wellness, couples retreats, spa services — reach clients looking for discreet, premium experiences.', color: 'linear-gradient(140deg,#1a2a1a 0%,#0a180a 100%)' },
  { icon: 'ti-home', title: 'Rentals & Venues', desc: 'Private apartments, BDSM studios, photo sets, adult-friendly hotels — hourly or nightly bookings with discreet entry.', color: 'linear-gradient(140deg,#2e2418 0%,#181208 100%)' },
  { icon: 'ti-confetti', title: 'Events & Experiences', desc: 'Fetish parties, lifestyle events, swingers nights, private soirées — sell tickets and manage guest lists.', color: 'linear-gradient(140deg,#3a1a28 0%,#1a0d14 100%)' },
]

const benefits = [
  { icon: 'ti-shield-check', title: 'Verified badge', desc: 'ID-verified profiles build trust and convert more clients.' },
  { icon: 'ti-map-pin', title: 'EU-wide reach', desc: 'Active users across Belgium, Netherlands, Germany, France and beyond.' },
  { icon: 'ti-lock', title: 'Encrypted messaging', desc: 'Clients contact you privately and securely — no personal number needed.' },
  { icon: 'ti-star', title: 'Reviews & ratings', desc: 'Authentic client reviews build your reputation and ranking.' },
  { icon: 'ti-bolt', title: 'Instant bookings', desc: 'Clients book directly from your profile — no back-and-forth.' },
  { icon: 'ti-chart-bar', title: 'Analytics dashboard', desc: 'See who viewed your profile, where they came from, and what converts.' },
  { icon: 'ti-credit-card', title: 'Secure payments', desc: 'Adult-friendly payment processing — no sudden account bans.' },
  { icon: 'ti-devices', title: 'Mobile optimised', desc: 'Your profile looks perfect on every device your clients use.' },
]

const plans = [
  {
    name: 'Basic',
    price: '€0',
    period: 'to get started',
    desc: 'Create your profile and go live for free. Use tokens to boost visibility.',
    cta: 'Create free profile',
    ctaHref: '/login',
    ctaStyle: 'ghost',
    features: [
      'Full profile with photos',
      'Listed in search results',
      'Booking requests',
      'Encrypted messaging',
      'Identity verification',
      'Stays live for free — no expiry',
    ],
    missing: ['Priority placement', 'Homepage slider', 'Featured badge'],
  },
  {
    name: 'Featured',
    price: '€29',
    period: 'for 7 days',
    desc: 'Gold-bordered card, priority placement in every category and search page.',
    cta: 'Get featured',
    ctaHref: '/boost',
    ctaStyle: 'gold',
    highlight: true,
    features: [
      'Everything in Basic',
      'Gold ✦ Featured badge',
      'Priority in search & category pages',
      'Booking calendar',
      'Analytics dashboard',
      'Client reviews',
    ],
    missing: ['Homepage slider placement'],
  },
  {
    name: 'Slider',
    price: '€79',
    period: 'for 30 days',
    desc: 'Appear in the homepage featured slider — maximum visibility to every visitor.',
    cta: 'Get in the slider',
    ctaHref: '/boost',
    ctaStyle: 'gold',
    features: [
      'Everything in Featured',
      'Homepage featured slider',
      'Top of every category page',
      'Featured city pages',
      'Maximum exposure for 30 days',
    ],
    missing: [],
  },
]

const faqs = [
  { q: 'How quickly can I get my profile live?', a: 'Profiles go live within minutes after identity verification is approved — usually within a few hours.' },
  { q: 'Does my basic listing ever expire?', a: 'No. A basic listing is completely free and stays live permanently — set it up once and you never need to re-list or pay to keep it visible.' },
  { q: 'What payment methods do you accept?', a: 'Featured placement boosts are processed via Stripe (card). Token packages for flash boosts and upgrades can also be purchased by card.' },
  { q: 'How do tokens work?', a: 'Tokens are an optional platform currency — 1 token = €0.10. They are used for flash boosts (a short visibility bump) and to upgrade a listing tier. Your basic listing never costs tokens. Packages start from €2.50.' },
  { q: 'Is my personal information protected?', a: 'Yes. We never display your real name, address or personal contact details publicly. All client communication goes through our encrypted messaging system.' },
  { q: 'Can I list in multiple cities?', a: 'Yes. You can create listings in any city across Europe and manage them from one dashboard.' },
  { q: 'What is the difference between featured and slider?', a: 'Featured (€29/7 days) gives you a gold badge and priority in category/search pages. Slider (€79/30 days) adds placement in the homepage featured slider seen by every visitor.' },
  { q: 'Do you accept advertisers from all European countries?', a: 'Yes. We currently serve Belgium, Netherlands, Germany, France, Luxembourg, Switzerland, Spain, Czech Republic, Hungary, Austria and more.' },
]

export default function AdvertisePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 14px rgba(197,160,90,0.35))' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/login" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Log in</Link>
          <Link href="/login?next=/listings/create" style={{ height: '36px', padding: '0 16px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>List your service</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '7rem 1.5rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(197,160,90,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>For advertisers, creators &amp; venues</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1.5rem', color: 'var(--t)' }}>
            Reach thousands of<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>verified, discreet clients</em><br />across Europe
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--t2)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2.5rem' }}>
            SecretXperience is Europe's premium adult lifestyle marketplace. List your service, venue or content — and connect with clients who are ready to book.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login?next=/listings/create" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '15px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-plus" /> Create your profile — it&apos;s free
            </Link>
            <a href="#pricing" style={{ padding: '14px 28px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '15px', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              See pricing
            </a>
          </div>
          <p style={{ marginTop: '1.25rem', fontSize: '12px', color: 'var(--t3)' }}>No credit card required · Free plan available · Go live in minutes</p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: '0.5px solid var(--b)', borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { n: '12+', l: 'Countries covered' },
            { n: '50K+', l: 'Monthly visitors' },
            { n: '8', l: 'Platform categories' },
            { n: '€0', l: 'To get started' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '13px', color: 'var(--t3)', marginTop: '6px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>Who it&apos;s for</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, margin: 0 }}>One platform,<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> every niche</em></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
          {categories.map(c => (
            <div key={c.title} style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.75rem', transition: 'border-color .2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--b3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--b)')}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <i className={`ti ${c.icon}`} style={{ fontSize: '22px', color: 'var(--gold)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500, margin: '0 0 .6rem', color: 'var(--t)' }}>{c.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR DESTINATIONS (Booking.com) */}
      <DestinationDeals />

      {/* BENEFITS */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--bg1)', borderTop: '0.5px solid var(--b)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>Why list with us</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, margin: 0 }}>Everything you need<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> to grow</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {benefits.map(b => (
              <div key={b.title} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${b.icon}`} style={{ fontSize: '18px', color: 'var(--gold)' }} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--t)' }}>{b.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>How it works</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, margin: 0 }}>Live in<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> three steps</em></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '2rem' }}>
          {[
            { n: '01', title: 'Create your profile', desc: 'Sign up free, choose your category, add photos and description. Takes less than 10 minutes.' },
            { n: '02', title: 'Get verified', desc: 'Complete ID verification to unlock the verified badge and Premium placement in search.' },
            { n: '03', title: 'Start receiving clients', desc: 'Clients find you, message securely, and book directly. You manage everything from your dashboard.' },
          ].map(s => (
            <div key={s.n} style={{ position: 'relative', paddingTop: '1rem' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '4rem', fontWeight: 400, color: 'rgba(197,160,90,0.15)', lineHeight: 1, marginBottom: '.5rem' }}>{s.n}</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500, margin: '0 0 .75rem', color: 'var(--gold)' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '6rem 1.5rem', background: 'var(--bg1)', borderTop: '0.5px solid var(--b)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>Pricing</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, margin: '0 0 1rem' }}>Simple,<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> transparent pricing</em></h2>
            <p style={{ fontSize: '15px', color: 'var(--t2)', margin: 0 }}>Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem', alignItems: 'start' }}>
            {plans.map(p => (
              <div key={p.name} style={{ background: p.highlight ? 'var(--bg)' : 'var(--bg2)', border: p.highlight ? '1px solid var(--gbrd)' : '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '2rem', position: 'relative', boxShadow: p.highlight ? '0 0 40px rgba(197,160,90,0.1)' : 'none' }}>
                {p.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', color: '#0a0a0a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', padding: '4px 16px', borderRadius: '20px' }}>MOST POPULAR</div>}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '.5rem' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: '2.8rem', fontWeight: 400, color: 'var(--t)', lineHeight: 1 }}>{p.price}</span>
                    <span style={{ fontSize: '13px', color: 'var(--t3)' }}>{p.period}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--t3)', margin: '.75rem 0 0' }}>{p.desc}</p>
                </div>
                <Link href={(p as any).ctaHref || '/login?next=/listings/create'} style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 'var(--r)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', marginBottom: '1.75rem', background: p.ctaStyle === 'gold' ? 'linear-gradient(135deg,var(--gold),var(--goldd))' : 'transparent', border: p.ctaStyle === 'ghost' ? '0.5px solid var(--b2)' : 'none', color: p.ctaStyle === 'gold' ? '#0a0a0a' : 'var(--t2)' }}>
                  {p.cta}
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--t)' }}>
                      <i className="ti ti-check" style={{ color: 'var(--gold)', fontSize: '15px', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                  {p.missing.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--t3)' }}>
                      <i className="ti ti-x" style={{ color: 'var(--b3)', fontSize: '15px', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>FAQ</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, margin: 0 }}>Common<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> questions</em></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t)', fontSize: '14px', fontWeight: 500, textAlign: 'left', gap: '1rem' }}>
                {f.q}
                <i className={`ti ${openFaq === i ? 'ti-minus' : 'ti-plus'}`} style={{ fontSize: '16px', color: 'var(--gold)', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '14px', color: 'var(--t2)', lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center', borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(197,160,90,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, margin: '0 0 1rem' }}>Ready to<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}> get started?</em></h2>
          <p style={{ fontSize: '16px', color: 'var(--t2)', marginBottom: '2rem', lineHeight: 1.7 }}>Join Europe&apos;s fastest growing adult lifestyle platform. Create your free profile today — no credit card needed.</p>
          <Link href="/login?next=/listings/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 36px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '16px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
            <i className="ti ti-plus" /> Create your free profile
          </Link>
          <p style={{ marginTop: '1.25rem', fontSize: '12px', color: 'var(--t3)' }}>Questions? Contact us at <a href="mailto:support@secretxperience.eu" style={{ color: 'var(--gold)' }}>support@secretxperience.eu</a></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '0.5px solid var(--b)', padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold)', textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '13px', color: 'var(--t3)', flexWrap: 'wrap' }}>
          <Link href="/regulations" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Regulations</Link>
          <Link href="/medical" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Medical Info</Link>
          <Link href="/terms" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Browse advertisements</Link>
          <span>© 2026 SecretXperience.eu</span>
        </div>
      </footer>

    </div>
  )
}
