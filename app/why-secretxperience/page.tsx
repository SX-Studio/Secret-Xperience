import type { Metadata } from 'next'
import Link from 'next/link'

const TITLE = 'Escort Girls Belgium — Brussels, Antwerp, Ghent | SecretXperience'
const DESC  = 'Verified escort girls in Belgium — Brussels, Antwerp, Ghent, Liège & Bruges. ✓ Real photos ✓ Reviews ✓ Prices. Book independent escorts, VIP companions & private reception, discreetly.'
const URL   = 'https://www.secretxperience.eu/why-secretxperience'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: 'article',
    images: [{ url: 'https://www.secretxperience.eu/og-image.jpg', width: 1200, height: 630, alt: 'Escort Girls Belgium — SecretXperience' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: ['https://www.secretxperience.eu/og-image.jpg'] },
  keywords: [
    'escorts Belgium', 'escort girls Belgium', 'escort Brussels', 'escort Antwerp',
    'escort Ghent', 'escort Liège', 'escort Bruges', 'private reception Belgium',
    'independent escorts Belgium', 'verified escorts Belgium', 'escort directory Belgium',
    'adult services Belgium', 'escort girls Brussels', 'companions Belgium',
    'escort directory Netherlands', 'escort directory Germany', 'verified escort platform',
    'adult lifestyle marketplace', 'discreet escort booking', 'premium escort directory EU',
    'escort platform Amsterdam', 'escort platform Berlin', 'nightlife directory Europe',
    'adult creators platform', 'safe escort platform', 'best escort site Belgium',
  ].join(', '),
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.secretxperience.eu/#organization',
      name: 'SecretXperience',
      legalName: '3S.lifestyle bv',
      url: 'https://www.secretxperience.eu',
      logo: { '@type': 'ImageObject', url: 'https://www.secretxperience.eu/icon-192.png' },
      description: 'Europe\'s premium adult lifestyle marketplace — verified escorts, nightlife, creators, rentals and events across Belgium, Netherlands and Germany.',
      areaServed: ['BE', 'NL', 'DE', 'FR', 'LU', 'CH'],
      foundingLocation: { '@type': 'Place', name: 'Belgium' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Tangendallaan 23',
        addressLocality: 'Grimbergen',
        postalCode: '1850',
        addressCountry: 'BE',
      },
      vatID: 'BE 0749.661.728',
      sameAs: ['https://www.secretxperience.eu'],
    },
    {
      '@type': 'Article',
      '@id': `${URL}#article`,
      headline: 'Why SecretXperience Is Europe\'s Best Adult Services Platform',
      description: DESC,
      url: URL,
      image: 'https://www.secretxperience.eu/og-image.jpg',
      author: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' },
      publisher: { '@type': 'Organization', name: 'SecretXperience', logo: { '@type': 'ImageObject', url: 'https://www.secretxperience.eu/icon-192.png' } },
      datePublished: '2025-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      mainEntityOfPage: URL,
      keywords: 'adult platform Europe, escort directory Belgium, verified adult marketplace, discreet escort booking',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
        { '@type': 'ListItem', position: 2, name: 'Why SecretXperience', item: URL },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is SecretXperience?', acceptedAnswer: { '@type': 'Answer', text: 'SecretXperience is Europe\'s premium adult lifestyle marketplace, connecting verified escorts, companions, nightlife venues, content creators, and rental hosts with discerning clients across Belgium, the Netherlands, Germany, France, and beyond.' } },
        { '@type': 'Question', name: 'Is SecretXperience safe and discreet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every advertiser undergoes identity verification before receiving a verified badge. All communication is end-to-end encrypted. Personal information is never displayed publicly, and billing descriptors are fully discreet.' } },
        { '@type': 'Question', name: 'Which countries does SecretXperience cover?', acceptedAnswer: { '@type': 'Answer', text: 'SecretXperience actively covers Belgium, the Netherlands, Germany, France, Luxembourg, Switzerland, Spain, Czech Republic, Hungary, Austria, and more EU countries.' } },
        { '@type': 'Question', name: 'How do I list my services on SecretXperience?', acceptedAnswer: { '@type': 'Answer', text: 'Creating a basic profile is completely free. Sign up, choose your category, upload photos, and go live in under 10 minutes. Identity verification unlocks a verified badge and increased search visibility.' } },
        { '@type': 'Question', name: 'What categories are available on SecretXperience?', acceptedAnswer: { '@type': 'Answer', text: 'SecretXperience covers 8 categories: escorts & companions, nightlife venues & clubs, featured advertisements, creators & content, marketplace & partners, affiliate programmes, brands & webshop, and legal & medical information.' } },
        { '@type': 'Question', name: 'Is SecretXperience free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Browsing is free for all visitors. Advertisers create a basic listing at no cost. Premium placement (Featured badge, homepage slider) is available from €29 for 7 days.' } },
        { '@type': 'Question', name: 'How does SecretXperience compare to other escort directories?', acceptedAnswer: { '@type': 'Answer', text: 'Unlike legacy escort directories, SecretXperience offers identity verification, encrypted messaging, a token gifting economy, a built-in webshop, creator content feeds, real-time booking, and full GDPR compliance — all on a single platform built for the modern EU market.' } },
      ],
    },
  ],
}

const G = '#c5a05a'
const S = {
  bg:    '#080612',
  bg1:   '#100e1a',
  bg2:   '#16131f',
  t:     '#ece8e1',
  t2:    'rgba(236,232,225,0.65)',
  t3:    'rgba(236,232,225,0.35)',
  b:     'rgba(255,255,255,0.07)',
  b2:    'rgba(255,255,255,0.11)',
  serif: "'Cormorant Garamond', serif",
  sans:  "'Poppins', sans-serif",
}

function Section({ id, eyebrow, heading, italic, children }: {
  id: string; eyebrow: string; heading: string; italic?: string; children: React.ReactNode
}) {
  return (
    <section id={id} style={{ padding: '5rem 1.5rem', borderTop: `0.5px solid ${S.b}`, scrollMarginTop: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: G, marginBottom: '1.1rem' }}>{eyebrow}</div>
        <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(2rem,4.5vw,3.2rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 2.5rem', color: S.t }}>
          {heading}{italic && <em style={{ fontStyle: 'italic', color: G }}> {italic}</em>}
        </h2>
        {children}
      </div>
    </section>
  )
}

function StatRow({ stats }: { stats: { n: string; l: string }[] }) {
  return (
    <div className="sx-stat-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: '1.5rem', margin: '2.5rem 0', background: S.bg1, border: `0.5px solid ${S.b}`, borderRadius: '16px', padding: '2rem' }}>
      {stats.map(s => (
        <div key={s.l} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: S.serif, fontSize: '2.6rem', fontWeight: 400, color: G, lineHeight: 1 }}>{s.n}</div>
          <div style={{ fontSize: '12px', color: S.t2, marginTop: '6px', lineHeight: 1.5 }}>{s.l}</div>
        </div>
      ))}
    </div>
  )
}

function ProofCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ background: S.bg1, border: `0.5px solid ${S.b}`, borderRadius: '14px', padding: '1.75rem' }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: '24px', color: G, display: 'block', marginBottom: '1rem' }} />
      <h3 style={{ fontFamily: S.serif, fontSize: '20px', fontWeight: 500, margin: '0 0 .75rem', color: S.t }}>{title}</h3>
      <p style={{ fontSize: '14px', color: S.t2, lineHeight: 1.75, margin: 0 }}>{body}</p>
    </div>
  )
}

function Pillar({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <div style={{ fontFamily: S.serif, fontSize: '2.4rem', fontWeight: 400, color: 'rgba(197,160,90,0.18)', lineHeight: 1, flexShrink: 0, width: '3rem', textAlign: 'center' }}>{num}</div>
      <div>
        <h3 style={{ fontFamily: S.serif, fontSize: '19px', fontWeight: 500, color: G, margin: '0 0 .6rem' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: S.t2, lineHeight: 1.75, margin: 0 }}>{body}</p>
      </div>
    </div>
  )
}

function Q({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ borderBottom: `0.5px solid ${S.b}`, paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: S.serif, fontSize: '19px', fontWeight: 500, color: S.t, margin: '0 0 .65rem' }}>{q}</h3>
      <p style={{ fontSize: '14px', color: S.t2, lineHeight: 1.75, margin: 0 }}>{a}</p>
    </div>
  )
}

export default function WhySecretXperience() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>

        {/* ── NAV ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.96)', backdropFilter: 'blur(18px)', borderBottom: `0.5px solid ${S.b}`, padding: '0 1.5rem', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: S.serif, fontSize: '22px', color: G, textDecoration: 'none', letterSpacing: '.02em' }}>
            Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
          </Link>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/search" style={{ fontSize: '13px', color: S.t2, textDecoration: 'none', padding: '6px 14px', border: `0.5px solid ${S.b2}`, borderRadius: '8px' }}>Browse</Link>
            <Link href="/login?next=/listings/create" style={{ fontSize: '13px', color: '#0a0a0a', textDecoration: 'none', padding: '6px 16px', background: `linear-gradient(135deg,${G},#b8914a)`, borderRadius: '8px', fontWeight: 600 }}>List for free</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <header style={{ position: 'relative', padding: '7rem 1.5rem 5rem', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', background: `radial-gradient(circle,rgba(197,160,90,0.09) 0%,transparent 68%)`, pointerEvents: 'none' }} />
          <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative' }}>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: S.t3, marginBottom: '2rem', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
              <Link href="/" style={{ color: S.t3, textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <span style={{ color: S.t2 }}>Why SecretXperience</span>
            </nav>
            <div style={{ display: 'inline-block', background: 'rgba(197,160,90,0.1)', border: `0.5px solid rgba(197,160,90,0.3)`, borderRadius: '20px', padding: '4px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: G, marginBottom: '1.75rem' }}>
              Verified Escort Girls — Belgium &amp; Europe
            </div>
            <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(2.6rem,6.5vw,4.8rem)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 1.5rem', color: S.t }}>
              Escort Girls Belgium<br /><em style={{ fontStyle: 'italic', color: G }}>Verified, discreet<br />&amp; live now</em>
            </h1>
            <p style={{ fontSize: '17px', color: S.t2, lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 1.5rem' }}>
              Browse and book hundreds of verified escort girls, VIP companions, erotic massage and private reception across Brussels, Antwerp, Ghent, Liège, Bruges and all of Belgium — independent, discreet, and live now.
            </p>
            {/* Star trust line — mirrors how top-ranking listings present themselves */}
            <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '13px', color: S.t2, marginBottom: '2.25rem' }}>
              {['Real photos', 'Verified profiles', 'Reviews & prices', 'Discreet booking'].map(item => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: G }}>★</span>{item}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link href="/search" style={{ padding: '14px 32px', background: `linear-gradient(135deg,${G},#b8914a)`, borderRadius: '10px', color: '#0a0a0a', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-search" /> Browse advertisements
              </Link>
              <Link href="#why-great" style={{ padding: '14px 28px', border: `0.5px solid ${S.b2}`, borderRadius: '10px', color: S.t2, fontSize: '15px', textDecoration: 'none' }}>
                Read on ↓
              </Link>
            </div>
            {/* Browse escorts by city */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '11px', color: S.t3, marginBottom: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Browse escorts by city</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' }}>
                {[['brussels','Brussels'],['antwerp','Antwerp'],['ghent','Ghent'],['grimbergen','Grimbergen'],['liege','Liège'],['bruges','Bruges'],['amsterdam','Amsterdam'],['berlin','Berlin'],['paris','Paris'],['cologne','Cologne']].map(([slug,label]) => (
                  <Link key={slug} href={`/escorts/${slug}`} style={{ background: 'rgba(197,160,90,0.1)', border: `0.5px solid ${S.b}`, borderRadius: '20px', padding: '5px 14px', fontSize: '13px', color: S.t2, textDecoration: 'none' }}>{label}</Link>
                ))}
              </div>
            </div>
            {/* Browse escorts by country */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '11px', color: S.t3, marginBottom: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Browse by country</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {[['belgium','Belgium'],['netherlands','Netherlands'],['germany','Germany'],['france','France'],['luxembourg','Luxembourg'],['switzerland','Switzerland']].map(([slug,label]) => (
                  <Link key={slug} href={`/escorts/${slug}`} style={{ background: 'rgba(197,160,90,0.1)', border: `0.5px solid ${S.b}`, borderRadius: '20px', padding: '5px 14px', fontSize: '13px', color: S.t2, textDecoration: 'none' }}>{label}</Link>
                ))}
              </div>
            </div>
            {/* Quick nav pills */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['#why-great','1. Why it\'s great'],['#why-proven','2. Proven'],['#why-trustworthy','3. Trustworthy'],['#why-reputable','4. Reputable'],['#why-best','5. Best platform']].map(([h,l]) => (
                <a key={h} href={h} style={{ fontSize: '12px', color: S.t3, textDecoration: 'none', padding: '4px 12px', border: `0.5px solid ${S.b}`, borderRadius: '20px' }}>{l}</a>
              ))}
            </div>
          </div>
        </header>

        {/* ── TRUST STRIP ── */}
        <div style={{ background: S.bg1, borderTop: `0.5px solid ${S.b}`, borderBottom: `0.5px solid ${S.b}` }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem 3rem', justifyContent: 'center', alignItems: 'center' }}>
            {[
              ['ti-shield-check', '100% Discreet'],
              ['ti-rosette-discount-check-filled', 'ID-Verified Advertisers'],
              ['ti-lock', 'Encrypted Messaging'],
              ['ti-world', '12+ EU Countries'],
              ['ti-certificate', 'GDPR Compliant'],
            ].map(([ic, lb]) => (
              <div key={lb} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: S.t2 }}>
                <i className={`ti ${ic}`} style={{ color: G, fontSize: '16px' }} />{lb}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 1 — WHY IT'S GREAT
        ══════════════════════════════════════════════════ */}
        <Section id="why-great" eyebrow="Section 01 — Why it's great" heading="The adult lifestyle platform" italic="Europe has been waiting for">
          <div style={{ fontSize: '16px', color: S.t2, lineHeight: 1.9, marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1.25rem' }}>
              For too long, the European adult services market has been fragmented — advertisers scattered across outdated directories, clients navigating dozens of inconsistent sites, and venues with no central home. <strong style={{ color: S.t }}>SecretXperience changes that</strong>. One platform. Eight verticals. Thousands of real, verified advertisements across Belgium, the Netherlands, Germany, France, Luxembourg, and beyond.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              Whether you are looking for a <Link href="/escorts" style={{ color: G }}>verified escort in Brussels</Link>, a <Link href="/nightlife" style={{ color: G }}>fetish club in Amsterdam</Link>, a <Link href="/rentals" style={{ color: G }}>private apartment in Berlin</Link>, or a <Link href="/creators" style={{ color: G }}>content creator to follow</Link> — everything lives in one beautifully designed, mobile-optimised experience.
            </p>
            <p>
              SecretXperience was built from first principles for the modern EU market: GDPR-compliant by design, adult-friendly payment processing, multilingual, and structured to surface the right advertiser to the right client at exactly the right moment.
            </p>
          </div>

          <h3 style={{ fontFamily: S.serif, fontSize: '1.7rem', fontWeight: 400, color: S.t, margin: '2.5rem 0 1.5rem' }}>Eight pillars that make us complete</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              ['layout-list', 'Advertisements & Premium Services', 'Independent escorts, companion agencies, erotic massage, tantra, domination and experiential services — every advertiser category covered with premium placement tools.'],
              ['calendar-event', 'Events, Venues & Clubs', 'From fetish parties in Antwerp to swingers nights in Berlin and lifestyle events across France — discover and book adult events and nightlife venues across Europe.'],
              ['star', 'Featured Advertisements', 'Gold-badged featured profiles appear at the top of every category and search result — maximum visibility for advertisers who want to stand out.'],
              ['camera', 'Creators & Content', 'OnlyFans models, Fansly creators, cam performers — publish content, grow followers, receive token gifts and link all your external platforms from one creator profile.'],
              ['building-store', 'Marketplace & Partners', 'A curated adult lifestyle webshop plus 50+ verified affiliate partners across wellness, toys, lingerie, and lifestyle brands — all in one ecosystem.'],
              ['link', 'Affiliate & Referral', 'Earn platform tokens by referring new advertisers. Creators and partners earn recurring credit through our affiliate programme with no cap on rewards.'],
              ['shopping-bag', 'Brands, Webshop & Live Chat', 'Premium brands reach our audience directly. Stripe-powered checkout for physical products, with live chat letting buyers speak to sellers in real time.'],
              ['shield-check', 'Legal & Medical Information', 'Comprehensive, country-specific guides on EU sex work regulations, health resources, consent frameworks, and harm reduction — because a safe community is a thriving community.'],
            ].map(([ic, t, d]) => (
              <ProofCard key={t as string} icon={ic as string} title={t as string} body={d as string} />
            ))}
          </div>

          <StatRow stats={[
            { n: '8', l: 'Platform verticals' },
            { n: '12+', l: 'EU countries served' },
            { n: '13', l: 'Major cities indexed' },
            { n: '€0', l: 'To get started' },
          ]} />

          <div style={{ padding: '2rem', background: `rgba(197,160,90,0.06)`, border: `0.5px solid rgba(197,160,90,0.2)`, borderRadius: '14px', fontSize: '14px', color: S.t2, lineHeight: 1.8 }}>
            <strong style={{ color: S.t }}>Key platform features:</strong> Identity-verified profiles · Encrypted private messaging · Real-time booking requests · Token economy (gifts, boosts, tips) · Advertiser dashboard with analytics · GSAP-powered discover feed · Swipe-to-save private gallery · Multilingual (EN/FR/NL/DE/ES/IT/PT/PL/RO) · Mobile-first design · GDPR-compliant data handling · Automated event calendar with recurring event engine
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — WHY IT'S PROVEN
        ══════════════════════════════════════════════════ */}
        <Section id="why-proven" eyebrow="Section 02 — Why it's proven" heading="A platform built on" italic="measurable results">
          <div style={{ fontSize: '16px', color: S.t2, lineHeight: 1.9, marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1.25rem' }}>
              Proof is not a promise — it is a track record. SecretXperience was engineered with the infrastructure, verification processes, and feature depth that only come from a team that deeply understands the EU adult services landscape. Every decision is data-informed: which cities have the highest demand, which listing types convert best, which boost formats drive the most profile views.
            </p>
            <p>
              Advertisers who upgrade to a Featured advertisement report significantly higher inbound message volume within 48 hours. Verified profiles consistently rank above unverified advertisements in search and category pages — not by accident, but because verification is a direct quality signal embedded into our ranking algorithm.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              ['bolt', 'Instant live advertisements', 'A new advertisement goes live in under 10 minutes after sign-up. No waiting room. No review queue for basic profiles. Verification adds the badge — your advertisement is live immediately.'],
              ['chart-bar', 'Real search volume, real cities', 'Our per-city pages — escorts Brussels, nightlife Amsterdam, rentals Berlin — are built to capture the exact long-tail searches EU clients actually type. Every page is server-rendered, crawlable, and indexed.'],
              ['clock', 'Always-on availability engine', 'Advertisers set real-time availability. The "Available Now" badge surfaces in-category listings in real time, helping clients find someone tonight — not tomorrow.'],
              ['refresh', 'Self-updating event calendar', 'A nightly pg_cron job automatically rolls recurring events forward, removes stale listings, and keeps the events calendar accurate without any manual intervention.'],
              ['credit-card', 'Adult-friendly payments', 'Stripe powers all card transactions with a discreet billing descriptor. Token packages from €2.50 let clients boost, tip, and gift without a full card checkout every time.'],
              ['device-mobile', 'Mobile-first architecture', 'Over 70% of adult platform traffic is mobile. SecretXperience was designed mobile-first — 2-column listing grids, photo sliders, touch-optimised swipe UI, and a persistent mobile bottom nav.'],
            ].map(([ic, t, d]) => (
              <ProofCard key={t as string} icon={ic as string} title={t as string} body={d as string} />
            ))}
          </div>

          <StatRow stats={[
            { n: '<10min', l: 'Time to go live' },
            { n: '52', l: 'City SEO pages indexed' },
            { n: '70%+', l: 'Traffic that is mobile' },
            { n: '24/7', l: 'Auto-maintained events' },
          ]} />

          <p style={{ fontSize: '15px', color: S.t2, lineHeight: 1.8 }}>
            Every listing page — from a single escort profile to a nightlife venue — is server-rendered with a unique <code style={{ background: S.bg2, padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: G }}>{'<title>'}</code>, meta description, canonical URL, and structured data schema. This means Google indexes each advertiser individually — not just the homepage. Your profile can rank for searches like <em>&ldquo;escort Antwerp verified&rdquo;</em> or <em>&ldquo;nightlife club Brussels BDSM&rdquo;</em> because we built the infrastructure that makes that possible.
          </p>
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — WHY IT'S TRUSTWORTHY
        ══════════════════════════════════════════════════ */}
        <Section id="why-trustworthy" eyebrow="Section 03 — Why it's trustworthy" heading="Trust is the product." italic="Everything else follows.">
          <div style={{ fontSize: '16px', color: S.t2, lineHeight: 1.9, marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1.25rem' }}>
              In the adult services industry, trust is not a feature — it is the entire foundation. A platform that cannot be trusted by its advertisers is one they will leave. A platform that cannot be trusted by its clients is one they will never return to. SecretXperience was built with this axiom at every layer of the stack.
            </p>
            <p>
              From the moment an advertiser signs up to the moment a client completes a booking, every interaction is governed by systems designed to protect all parties — legally, financially, and personally.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2.5rem' }}>
            {[
              ['01', 'Identity verification on every advertiser', 'Before an advertiser receives a verified badge, they complete a secure identity and age verification process. Documents are handled by an encrypted verification flow — they are never stored on our servers in unprotected form. Verified profiles display a prominent badge that clients can trust at a glance.'],
              ['02', 'End-to-end encrypted messaging', 'All client-advertiser communication flows through SecretXperience\'s private messaging system. No personal phone numbers, no personal email addresses, no external contact information is required or displayed. Your privacy is protected by the architecture itself.'],
              ['03', 'Wallet security by design', 'Token wallet balances can only be modified by server-side admin routes — never by the browser client directly. Row-Level Security on our database enforces this at the database layer, meaning no client-side exploit can manipulate a balance.'],
              ['04', 'GDPR compliance built in', 'SecretXperience was built for the EU. Cookie consent, data minimisation, right-to-erasure flows, and privacy-by-design architecture are not afterthoughts — they are first-class requirements. We are transparent about what data we collect, why, and for how long.'],
              ['05', 'Discreet billing everywhere', 'Every Stripe payment — whether for a featured boost, a rental booking, or a token package — uses a discreet billing descriptor. Clients can transact with confidence that their bank statement will not expose their browsing habits.'],
              ['06', 'Moderated content, not a free-for-all', 'Listings go through an AI-assisted moderation layer before approval. Listings that violate our terms are rejected or suspended. Advertisers who game the system are removed. The quality of the directory is actively maintained.'],
            ].map(([n, t, d]) => (
              <Pillar key={n as string} num={n as string} title={t as string} body={d as string} />
            )).map((el, i) => (
              <div key={i} style={{ paddingBottom: '2rem', marginBottom: '2rem', borderBottom: `0.5px solid ${S.b}` }}>{el}</div>
            ))}
          </div>

          <div style={{ padding: '2rem', background: S.bg1, border: `0.5px solid ${S.b}`, borderRadius: '14px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Legal framework</div>
            <p style={{ fontSize: '14px', color: S.t2, lineHeight: 1.8, margin: '0 0 1rem' }}>
              SecretXperience operates in full compliance with EU law. Our <Link href="/regulations" style={{ color: G }}>Regulations page</Link> provides country-specific legal guidance on adult services in Belgium, the Netherlands, Germany, France, and other operating markets. Our <Link href="/medical" style={{ color: G }}>Medical Information section</Link> provides health resources maintained in partnership with harm reduction guidance. Legal and medical transparency is not a disclaimer — it is a service.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['GDPR Compliant', 'Age Verification', 'Content Moderation', 'Encrypted Storage', 'Discreet Billing', 'Legal Guidelines Published'].map(b => (
                <span key={b} style={{ fontSize: '12px', padding: '4px 12px', border: `0.5px solid rgba(197,160,90,0.3)`, borderRadius: '20px', color: G }}>{b}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — WHY IT'S REPUTABLE
        ══════════════════════════════════════════════════ */}
        <Section id="why-reputable" eyebrow="Section 04 — Why it's reputable" heading="Reputation built on" italic="the right principles">
          <div style={{ fontSize: '16px', color: S.t2, lineHeight: 1.9, marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1.25rem' }}>
              Reputation in the adult industry is earned slowly and lost quickly. SecretXperience has taken a deliberate approach: prioritise quality over quantity, verified over anonymous, transparent over opaque. We reject the race-to-the-bottom model of legacy escort directories — platforms with thousands of fake profiles, no verification, and no accountability.
            </p>
            <p>
              Our reputation rests on four commitments: to advertisers, to clients, to the broader community, and to the law.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              ['heart', 'Commitment to advertisers', 'Advertisers are not an afterthought — they are the product. We invest in tools that help them grow: analytics dashboards, verification badges, booking calendars, creator content feeds, token gifting, and featured placement. A advertiser who succeeds on SecretXperience is our best marketing.'],
              ['users', 'Commitment to clients', 'Clients deserve to know they are browsing real, identity-verified people. Every verified badge represents a completed verification. Every review is from a real client interaction. The platform exists to make finding the right experience easier, safer, and more reliable.'],
              ['world', 'Commitment to community', 'SecretXperience hosts legal, medical, and harm reduction information alongside its listings — because a healthy community is a sustainable one. We partner with EU affiliate networks who share these values, from sexual health brands to legal consultancies.'],
              ['scale', 'Commitment to compliance', 'We follow EU advertising standards for adult content, comply with GDPR across all user data, and publish plain-language legal guides for every market we serve. We do not operate in jurisdictions where our services would be illegal.'],
            ].map(([ic, t, d]) => (
              <ProofCard key={t as string} icon={ic as string} title={t as string} body={d as string} />
            ))}
          </div>

          <h3 style={{ fontFamily: S.serif, fontSize: '1.7rem', fontWeight: 400, color: S.t, margin: '2.5rem 0 1.5rem' }}>What sets us apart from other adult directories</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${S.b2}` }}>
                  {['Feature', 'SecretXperience', 'Legacy directories'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Feature' ? 'left' : 'center', padding: '10px 14px', color: h === 'SecretXperience' ? G : S.t3, fontWeight: 600, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Identity verification', '✦ Mandatory for badge', '✗ Rare or none'],
                  ['Encrypted messaging', '✦ Built-in, always', '✗ External contact only'],
                  ['Mobile-first design', '✦ Full responsive + app-feel', '~ Partially responsive'],
                  ['Creator content feed', '✦ Photos, video, tips, gifts', '✗ Not available'],
                  ['Token economy', '✦ Boosts, gifts, tips', '✗ Not available'],
                  ['Per-city SEO pages', '✦ 52 indexed city pages', '~ Limited or static'],
                  ['Real-time availability', '✦ Available Now badges', '✗ Manual update only'],
                  ['Webshop integration', '✦ Stripe + affiliate products', '✗ Not available'],
                  ['GDPR compliance', '✦ By design, documented', '~ Varies'],
                  ['Legal & medical guides', '✦ Per-country, published', '✗ Not available'],
                  ['Free basic listing', '✦ Forever free, no expiry', '~ Often expires'],
                  ['Affiliate referral', '✦ 75-token reward', '✗ Not available'],
                ].map(([f, sx, lg]) => (
                  <tr key={f as string} style={{ borderBottom: `0.5px solid ${S.b}` }}>
                    <td style={{ padding: '10px 14px', color: S.t }}>{f}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#26d4a0', fontWeight: 600 }}>{sx}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: S.t3 }}>{lg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 5 — WHY IT'S THE BEST ADULT PLATFORM
        ══════════════════════════════════════════════════ */}
        <Section id="why-best" eyebrow="Section 05 — Best adult service platform" heading="The adult platform built" italic="for modern Europe">
          <div style={{ fontSize: '16px', color: S.t2, lineHeight: 1.9, marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1.25rem' }}>
              The European adult services market is worth billions annually. Yet for years it has been served by platforms built in another era — slow, ugly, unverified, and increasingly unsafe. SecretXperience is the answer to a market that has outgrown its infrastructure.
            </p>
            <p style={{ marginBottom: '1.25rem' }}>
              We are not a simple escort directory. We are a full adult lifestyle ecosystem: a search engine, a social platform for creators, a booking engine for venues, a webshop for brands, a referral network for affiliates, and a legal resource centre — all unified under one brand, one design language, and one commitment to quality.
            </p>
            <p>
              Whether you are an <Link href="/escorts" style={{ color: G }}>independent escort in Antwerp</Link>, a <Link href="/creators" style={{ color: G }}>content creator building a fanbase</Link>, a <Link href="/nightlife" style={{ color: G }}>club owner in Amsterdam</Link>, or a client looking for a <Link href="/discover" style={{ color: G }}>discreet, verified experience</Link> — SecretXperience is built for you.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              ['01', 'The most complete adult marketplace in the EU', 'Eight service verticals in one platform. Escorts, nightlife, creators, rentals, hotels, events, webshop, and affiliate partners — no other EU adult platform covers this breadth while maintaining the verification and quality standards SecretXperience demands.'],
              ['02', 'SEO infrastructure that gets advertisers found', 'Every listing has its own unique, crawlable, Google-indexed page. Every city has its own landing page — /escorts/brussels, /nightlife/amsterdam, /rentals/berlin — structured with JSON-LD schema, canonical URLs, and keyword-optimised content. Advertisers on SecretXperience don\'t just get a listing — they get a searchable presence.'],
              ['03', 'An economy that rewards loyalty', 'Tokens create a circular economy: clients buy tokens to gift creators, boost advertisers, and tip for great experiences. Advertisers earn tokens through referrals and gifts. Featured placement uses tokens. This keeps money flowing within the ecosystem and rewards the most active community members.'],
              ['04', 'Built for discretion at every touchpoint', 'Discreet billing. Encrypted messaging. No public display of personal data. The "Discreet Mode" on browse pages blurs all photos until the user opts in. Privacy is not a setting — it is a default.'],
              ['05', 'A platform that grows with its community', 'New features ship constantly: the swipe-to-save Discover feed, creator gifting, self-updating events, referral rewards, the partner directory. SecretXperience is actively developed — not a static directory left to decay.'],
            ].map(([n, t, d]) => (
              <div key={n as string} style={{ paddingBottom: '2rem', marginBottom: '2rem', borderBottom: `0.5px solid ${S.b}` }}>
                <Pillar num={n as string} title={t as string} body={d as string} />
              </div>
            ))}
          </div>

          {/* Category quick links */}
          <div style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: S.serif, fontSize: '1.5rem', fontWeight: 400, color: S.t, margin: '0 0 1.25rem' }}>Explore by category</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                ['/escorts', 'Escorts & Companions'],
                ['/nightlife', 'Nightlife & Clubs'],
                ['/creators', 'Content Creators'],
                ['/rentals', 'Private Rentals'],
                ['/hotels', 'Adult-Friendly Hotels'],
                ['/events', 'Events & Experiences'],
                ['/shop', 'Adult Lifestyle Shop'],
                ['/partners', 'Partners & Affiliates'],
              ].map(([h, l]) => (
                <Link key={h} href={h} style={{ fontSize: '13px', fontWeight: 500, padding: '8px 18px', border: `0.5px solid rgba(197,160,90,0.3)`, borderRadius: '20px', color: G, textDecoration: 'none', background: 'rgba(197,160,90,0.06)' }}>{l}</Link>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════
            FAQ (schema-backed)
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', borderTop: `0.5px solid ${S.b}`, background: S.bg1 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: G, marginBottom: '1.1rem' }}>Frequently asked questions</div>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, margin: '0 0 2.5rem', color: S.t }}>
              Common questions about <em style={{ fontStyle: 'italic', color: G }}>SecretXperience</em>
            </h2>
            <Q q="What is SecretXperience?" a="SecretXperience is Europe's premium adult lifestyle marketplace, connecting verified escorts, companions, nightlife venues, content creators, and rental hosts with discerning clients across Belgium, the Netherlands, Germany, France, Luxembourg, and beyond. It is the only EU platform covering all eight adult lifestyle verticals in one unified experience." />
            <Q q="Is SecretXperience safe and discreet?" a="Yes. Every advertiser undergoes identity verification before receiving a verified badge. All communication is end-to-end encrypted and flows through the platform — no personal numbers or email addresses are exchanged. Billing descriptors on all transactions are fully discreet. Personal data is protected under GDPR." />
            <Q q="Which countries does SecretXperience cover?" a="SecretXperience actively covers Belgium, the Netherlands, Germany, France, Luxembourg, Switzerland, Spain, Czech Republic, Hungary, Austria, and more EU countries. Per-city landing pages exist for Brussels, Antwerp, Ghent, Amsterdam, Rotterdam, Berlin, Hamburg, Paris, Lyon, Luxembourg, Liège, Bruges, and Cologne." />
            <Q q="How do I list my services on SecretXperience?" a="Creating a basic profile is completely free and takes under 10 minutes. Sign up, choose your category (escort, nightlife venue, creator, rental, hotel, or event), upload photos and a description, and go live immediately. Identity verification unlocks a verified badge and increases your search ranking." />
            <Q q="Is SecretXperience free to use?" a="Browsing is free for all visitors. Advertisers create a basic listing at no cost — with no expiry date. Premium visibility options (Featured badge from €29/7 days, Homepage Slider from €79/30 days) are available when you're ready to grow. Token packages for boosts, tips and gifts start from €2.50." />
            <Q q="How does SecretXperience compare to Vivastreet, AdultWork, or Escort Advisor?" a="Unlike legacy escort directories, SecretXperience offers mandatory identity verification, end-to-end encrypted messaging, a token gift economy, a built-in creator content feed, a webshop, real-time availability signalling, 52 per-city SEO-optimised landing pages, and full GDPR compliance. It is a full adult lifestyle ecosystem, not a classified ad board." />
            <Q q="What is the token system and how does it work?" a="Tokens are SecretXperience's platform currency — 1 token = €0.10. They are used to boost advertisement visibility, send gifts to creators (25–200 tokens), and tip advertisers. Tokens can be purchased in packages from €2.50. Advertisers earn tokens through the referral programme (75 tokens per referred advertiser who lists) and by receiving fan gifts." />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════ */}
        <section style={{ padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: `radial-gradient(circle,rgba(197,160,90,0.08) 0%,transparent 68%)`, pointerEvents: 'none' }} />
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
            <div style={{ fontFamily: S.serif, fontSize: '4rem', fontWeight: 400, color: 'rgba(197,160,90,0.15)', lineHeight: 1, marginBottom: '1rem' }}>✦</div>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 400, margin: '0 0 1rem', color: S.t }}>
              Ready to join<em style={{ fontStyle: 'italic', color: G }}> Europe&apos;s finest?</em>
            </h2>
            <p style={{ fontSize: '16px', color: S.t2, lineHeight: 1.8, marginBottom: '2.5rem' }}>
              Create a free profile today. Go live in under 10 minutes. Join the adult lifestyle platform built for modern Europe.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?next=/listings/create" style={{ padding: '15px 36px', background: `linear-gradient(135deg,${G},#b8914a)`, borderRadius: '10px', color: '#0a0a0a', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-plus" /> Create your free profile
              </Link>
              <Link href="/search" style={{ padding: '15px 28px', border: `0.5px solid ${S.b2}`, borderRadius: '10px', color: S.t2, fontSize: '15px', textDecoration: 'none' }}>
                Browse advertisements
              </Link>
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '12px', color: S.t3 }}>
              No credit card · No expiry · Full EU coverage ·{' '}
              <Link href="/terms" style={{ color: S.t3 }}>Terms</Link> ·{' '}
              <Link href="/privacy" style={{ color: S.t3 }}>Privacy</Link>
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `0.5px solid ${S.b}`, padding: '2rem 1.5rem', background: S.bg1 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Link href="/" style={{ fontFamily: S.serif, fontSize: '18px', color: G, textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '13px', flexWrap: 'wrap' }}>
              {[['/escorts','Escorts'],['/nightlife','Nightlife'],['/creators','Creators'],['/rentals','Rentals'],['/events','Events'],['/advertise','Advertise'],['/how-it-works','How it works'],['/terms','Terms'],['/privacy','Privacy']].map(([h,l]) => (
                <Link key={h} href={h} style={{ color: S.t3, textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>
          <p style={{ maxWidth: '1100px', margin: '1.5rem auto 0', fontSize: '12px', color: S.t3, textAlign: 'center' }}>
            © {new Date().getFullYear()} 3S.lifestyle bv · Tangendallaan 23, 1850 Grimbergen · BE 0749.661.728
          </p>
        </footer>

      </div>
    </>
  )
}
