import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '20+ Best Platforms to Make Money for Creators | SecretXperience',
  description: 'The best OnlyFans alternatives and creator platforms to make money in 2026 — adult-friendly fan platforms, site builders, low-commission options and niche communities.',
  openGraph: {
    title: '20+ Best Platforms to Make Money for Creators',
    description: 'The best OnlyFans alternatives and creator platforms to make money — compared by niche, commission and audience.',
    url: 'https://www.secretxperience.eu/creator-platforms',
  },
}

interface Platform { name: string; url: string }
interface Category { title: string; description: string; emoji: string; items: Platform[] }

const CATEGORIES: Category[] = [
  {
    title: 'Best Platforms to Build Sites like OnlyFans to Make Money',
    emoji: '🏗️',
    description: 'White-label software to launch your own OnlyFans-style site — you own the platform, keep 100% of earnings and pay no ongoing commission.',
    items: [
      { name: 'xFans', url: 'https://adent.io/products/xfans' },
      { name: 'xModel', url: 'https://adent.io/products/xmodel' },
    ],
  },
  {
    title: 'Best Adult-Niche Supporting OnlyFans Creator Platforms',
    emoji: '🔥',
    description: 'Fan platforms that fully support adult content — subscriptions, tips, pay-per-view and live shows.',
    items: [
      { name: 'Fanspicy', url: 'https://fanspicy.com' },
      { name: 'Fansly', url: 'https://fansly.com' },
      { name: 'FanCentro', url: 'https://fancentro.com' },
      { name: 'ManyVids', url: 'https://www.manyvids.com' },
      { name: 'iFans', url: 'https://ifans.com' },
      { name: 'LoyalFans', url: 'https://www.loyalfans.com' },
      { name: 'LoverFans', url: 'https://loverfans.com' },
      { name: 'Faphouse', url: 'https://faphouse.com' },
      { name: 'AdmireMe.VIP', url: 'https://admireme.vip' },
      { name: 'AVN Stars', url: 'https://stars.avn.com' },
    ],
  },
  {
    title: 'OnlyFans Alternatives that Don’t Allow Adult Content',
    emoji: '🌿',
    description: 'Mainstream fan-monetization platforms — ideal for lifestyle, fitness and influencer content without adult material.',
    items: [
      { name: 'BrandArmy', url: 'https://brandarmy.com' },
      { name: 'Patreon', url: 'https://www.patreon.com' },
      { name: 'Fanfix', url: 'https://fanfix.io' },
    ],
  },
  {
    title: 'Voice-based Adult Creator Platform',
    emoji: '🎙️',
    description: 'Monetize your voice — AI-companion and voice-chat experiences for an adult audience.',
    items: [
      { name: 'SpicyChat.AI', url: 'https://spicychat.ai' },
    ],
  },
  {
    title: 'Platforms With Lower Commission Percentage',
    emoji: '💰',
    description: 'Keep more of what you earn — these platforms take a smaller cut than the industry-standard 20%.',
    items: [
      { name: 'Unlockd', url: 'https://unlockd.me' },
      { name: 'Patreon', url: 'https://www.patreon.com' },
      { name: 'BrandArmy', url: 'https://brandarmy.com' },
    ],
  },
  {
    title: 'Exclusive Adult Creator Platform for Men',
    emoji: '👨',
    description: 'A community built around male creators and their audience.',
    items: [
      { name: 'MenChats', url: 'https://menchats.com' },
    ],
  },
  {
    title: 'Exclusive Adult Creator Platform for Women',
    emoji: '👩',
    description: 'Built for female creators — strong promo tools and direct fan monetization.',
    items: [
      { name: 'IsMyGirl', url: 'https://ismygirl.com' },
    ],
  },
  {
    title: 'Ideal OnlyFans Alternative for LGBTQ Community',
    emoji: '🏳️‍🌈',
    description: 'A creator platform by and for the LGBTQ community, with a loyal and engaged fanbase.',
    items: [
      { name: 'JustFor.Fans', url: 'https://justfor.fans' },
    ],
  },
]

export default function CreatorPlatformsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080608', color: '#ece8e1', fontFamily: "'Poppins', sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.secretxperience.eu' },
          { '@type': 'ListItem', position: 2, name: 'Creator Platforms', item: 'https://www.secretxperience.eu/creator-platforms' },
        ],
      }) }} />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cp-card { display:flex; align-items:center; justify-content:space-between; gap:10px; background:#0e0c12; border:0.5px solid rgba(255,255,255,0.07); border-radius:12px; padding:14px 18px; text-decoration:none; color:#ece8e1; transition:border-color .2s, transform .15s; }
        .cp-card:hover { border-color:rgba(197,160,90,0.35); transform:translateY(-2px); }
        .cp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:10px; }
        @media(max-width:640px){ .cp-grid{grid-template-columns:repeat(2,1fr)} .cp-main{padding:2rem 1rem 5rem!important} }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 54, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,6,8,0.97)', borderBottom: '0.5px solid rgba(197,160,90,0.08)', backdropFilter: 'blur(18px)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#c5a05a', textDecoration: 'none', fontStyle: 'italic' }}>
          Secret<em style={{ fontStyle: 'normal' }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/creators" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Creators</Link>
          <Link href="/partners" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Partners</Link>
          <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← Home</Link>
        </div>
      </nav>

      <main className="cp-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <p style={{ fontSize: 9, letterSpacing: '.18em', color: 'rgba(197,160,90,0.55)', textTransform: 'uppercase', marginBottom: '0.875rem' }}>✦ Creator Economy Guide</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,5vw,50px)', fontWeight: 400, lineHeight: 1.12, marginBottom: '1rem', maxWidth: 720 }}>
          20+ Best Platforms to <em style={{ color: '#c5a05a', fontStyle: 'italic' }}>Make Money</em> for Creators
        </h1>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', maxWidth: 620, lineHeight: 1.75, marginBottom: '3rem' }}>
          Whether you want to join an OnlyFans alternative, keep a bigger share of your earnings, or launch your own platform entirely — this guide compares 20+ creator platforms by niche, commission and audience. Every platform links straight to its official site.
        </p>

        {CATEGORIES.map(cat => (
          <section key={cat.title} style={{ marginBottom: '2.75rem' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(19px,2.6vw,26px)', fontWeight: 400, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{cat.emoji}</span> {cat.title}
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginBottom: '1rem', lineHeight: 1.65, maxWidth: 600 }}>{cat.description}</p>
            <div className="cp-grid">
              {cat.items.map(p => (
                <a key={`${cat.title}-${p.name}`} href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="cp-card">
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: '#c5a05a', whiteSpace: 'nowrap' }}>Visit ↗</span>
                </a>
              ))}
            </div>
          </section>
        ))}

        <div style={{ marginTop: '3.5rem', padding: '2rem', border: '0.5px solid rgba(197,160,90,0.25)', borderRadius: 14, background: 'linear-gradient(140deg,#14101a,#0d0a10)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, marginBottom: 4 }}>Already creating? Get discovered here.</div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>List yourself on SecretXperience and reach a verified EU audience — free basic listing.</p>
          </div>
          <Link href="/advertise" style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#c5a05a,#a5813f)', borderRadius: 10, color: '#0a0a0a', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Start free →
          </Link>
        </div>

        <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', marginTop: '2rem', lineHeight: 1.6 }}>
          All platforms are independent third-party services (18+ where applicable). Commission rates and content policies change — always verify current terms on the platform’s own site.
        </p>
      </main>
    </div>
  )
}
