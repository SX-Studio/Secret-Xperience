'use client'

// Ten cinematic category cards — atmospheric (gradient + spotlight + grain +
// vignette) backgrounds, one theme per category. Swap a card's background for a
// real photo by setting `photo` on its entry. CSS-only (no GSAP).

type Cat = {
  cat: string
  route: string
  hue: string
  glow: string        // radial spotlight colour (top)
  wash: string        // base diagonal gradient
  title: string       // may contain <em>…</em>
  sub: string
  cta: string
  badge?: string
  photo?: string      // optional /public path — overrides the atmospheric bg
}

const CATS: Cat[] = [
  { cat: 'Escorts', route: '/escorts', hue: '#c5a05a', glow: 'rgba(224,192,130,.55)', wash: '160deg, #2a1a10, #0b0710',
    title: 'Your <em>secret</em> side', sub: 'Verified companions — by the hour, the evening, the weekend.', cta: 'Explore escorts' },
  { cat: 'Companions', route: '/companionship', hue: '#d8a86a', glow: 'rgba(216,168,106,.5)', wash: '150deg, #2b1c14, #0b0710',
    title: 'Never arrive <em>alone</em>', sub: 'Dinner dates, travel partners, plus-ones for the night.', cta: 'Explore companions' },
  { cat: 'Nightlife', route: '/nightlife', hue: '#c0304a', glow: 'rgba(192,48,74,.55)', wash: '160deg, #2a0c16, #0a0510',
    title: 'Where the <em>night</em> opens', sub: 'Private clubs, members-only lounges, after-hours.', cta: 'Explore venues' },
  { cat: 'Creators', route: '/creators', hue: '#a86bd8', glow: 'rgba(168,107,216,.5)', wash: '155deg, #241633, #0b0712',
    title: 'Follow every <em>obsession</em>', sub: 'Private content, commissions, subscriptions.', cta: 'Browse creators' },
  { cat: 'Rentals', route: '/rentals', hue: '#c9a15e', glow: 'rgba(201,161,94,.5)', wash: '135deg, #2a2012, #0a0710',
    title: 'A place to <em>disappear</em>', sub: 'Private apartments & suites, discreet entry.', cta: 'Find a space' },
  { cat: 'Hotels', route: '/hotels', hue: '#26d4a0', glow: 'rgba(38,212,160,.42)', wash: '150deg, #0d2420, #070f10',
    title: 'Check in. <em>Tell no one.</em>', sub: 'Adult-friendly hotels, late check-in, no questions.', cta: 'Book a room' },
  { cat: 'Events', route: '/events', hue: '#e6c07a', glow: 'rgba(230,192,122,.5)', wash: '160deg, #2a2110, #0a0710',
    title: 'On the <em>guest list</em>', sub: 'Curated parties, soirées & private events, EU-wide.', cta: 'View calendar' },
  { cat: 'Shop', route: '/shop', hue: '#e0708a', glow: 'rgba(224,112,138,.45)', wash: '150deg, #2a141c, #0b0710',
    title: 'Dressed for the <em>dark</em>', sub: 'Refined accessories, intimate gifts, lingerie.', cta: 'Shop now' },
  { cat: 'Live', route: '/live', hue: '#e2504f', glow: 'rgba(226,80,79,.5)', wash: '160deg, #2a0e0e, #0a0508', badge: '● LIVE',
    title: 'Live, and <em>watching</em> you', sub: 'Cams, live shows & private chat, in real time.', cta: 'Watch live' },
  { cat: 'Xjobs', route: '/jobs', hue: '#c9a15e', glow: 'rgba(201,161,94,.45)', wash: '150deg, #23200f, #0a0710', badge: 'HIRING',
    title: 'Work on your <em>terms</em>', sub: 'Adult-industry jobs across Europe — offered & wanted.', cta: 'Browse jobs' },
]

export default function CategoryAnimations() {
  const go = (path: string) => () => { window.location.href = path }

  return (
    <section className="cat-anim-section" data-screen-label="Category explainer">
      <div className="section-inner">
        <header className="section-head">
          <span className="t-eyebrow t-eyebrow-gold">TEN WORLDS · ONE MEMBERSHIP</span>
          <h2 className="t-display section-title">
            Step into a world<br /><em>beyond ordinary.</em>
          </h2>
          <p className="t-body section-sub">
            From candlelit dinners to private nightlife, from live shows to creator subscriptions —
            every category is curated, verified, and built for the discreet.
          </p>
        </header>

        <div className="cx-grid">
          {CATS.map((c) => (
            <article
              key={c.route}
              className="cx-card"
              onClick={go(c.route)}
              tabIndex={0}
              role="link"
              aria-label={c.cat}
              onKeyDown={(e) => { if (e.key === 'Enter') go(c.route)() }}
            >
              <div
                className="cx-bg"
                style={c.photo
                  ? { backgroundImage: `url(${c.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: `radial-gradient(120% 90% at 30% 8%, ${c.glow} 0%, transparent 42%), linear-gradient(${c.wash})` }}
              />
              <div className="cx-spot" style={{ background: `radial-gradient(70% 45% at 70% 88%, ${c.hue}22 0%, transparent 60%)` }} />
              <div className="cx-grain" />
              <div className="cx-vig" />
              <div className="cx-content">
                <div className="cx-top">
                  <span className="cx-brand">Secret<em>Xperience</em></span>
                  {c.badge && <span className="cx-badge" style={{ background: c.hue }}>{c.badge}</span>}
                </div>
                <div className="cx-kicker" style={{ color: c.hue }}>{c.cat}</div>
                <h3 className="cx-title" dangerouslySetInnerHTML={{ __html: c.title }} />
                <p className="cx-sub">{c.sub}</p>
                <a
                  href={c.route}
                  className="cx-cta"
                  style={{ background: `linear-gradient(135deg,#e7c87f,${c.hue} 60%,#a0803d)` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {c.cta} →
                </a>
                <div className="cx-trust"><span>✦ 18+</span><span>✦ Verified</span><span>✦ Discreet</span></div>
              </div>
            </article>
          ))}
        </div>

        <footer className="section-foot">
          <p className="t-caption">All categories · Verified advertisers · EU-wide · Members from €0</p>
        </footer>
      </div>
    </section>
  )
}
