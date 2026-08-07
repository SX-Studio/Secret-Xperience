'use client'

// Ten category cards — full-bleed photo, centered line icon, uppercase label and
// a gold underline (matches the approved mockup). Each card looks for a photo at
// /categories/<slug>.jpg; until that file exists it falls back to a themed
// gradient, then auto-upgrades to the photo once uploaded.

type Cat = {
  cat: string        // uppercase label
  slug: string       // /categories/<slug>.jpg
  route: string
  icon: string       // tabler icon name
  hue: string
  wash: string       // fallback gradient
}

const CATS: Cat[] = [
  { cat: 'Escorts',    slug: 'escorts',    route: '/escorts',       icon: 'ti-users',                    hue: '#c5a05a', wash: '160deg,#2a1a10,#0b0710' },
  { cat: 'Companions', slug: 'companions', route: '/companionship', icon: 'ti-rosette-discount-check',   hue: '#d8a86a', wash: '150deg,#2b1c14,#0b0710' },
  { cat: 'Nightlife',  slug: 'nightlife',  route: '/nightlife',     icon: 'ti-world',                    hue: '#c0304a', wash: '160deg,#2a0c16,#0a0510' },
  { cat: 'Creators',   slug: 'creators',   route: '/creators',      icon: 'ti-camera',                   hue: '#a86bd8', wash: '155deg,#241633,#0b0712' },
  { cat: 'Rentals',    slug: 'rentals',    route: '/rentals',       icon: 'ti-shopping-bag',             hue: '#c9a15e', wash: '135deg,#2a2012,#0a0710' },
  { cat: 'Hotels',     slug: 'hotels',     route: '/hotels',        icon: 'ti-bell',                     hue: '#c9a15e', wash: '150deg,#241a10,#0a0710' },
  { cat: 'Events',     slug: 'events',     route: '/events',        icon: 'ti-calendar',                 hue: '#e6c07a', wash: '160deg,#2a2110,#0a0710' },
  { cat: 'Shop',       slug: 'shop',       route: '/shop',          icon: 'ti-shopping-cart',            hue: '#e0708a', wash: '150deg,#2a141c,#0b0710' },
  { cat: 'Live',       slug: 'live',       route: '/live',          icon: 'ti-broadcast',                hue: '#e2504f', wash: '160deg,#2a0e0e,#0a0508' },
  { cat: 'Jobs',       slug: 'jobs',       route: '/jobs',          icon: 'ti-briefcase',                hue: '#c9a15e', wash: '150deg,#23200f,#0a0710' },
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
              <div className="cx-fallback" style={{ background: `linear-gradient(${c.wash})` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="cx-photo"
                src={`/categories/${c.slug}.jpg`}
                alt={c.cat}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div className="cx-shade" />
              <a href={c.route} className="cx-cap" onClick={(e) => e.stopPropagation()}>
                <i className={`ti ${c.icon}`} aria-hidden="true" />
                <span className="cx-label">{c.cat}</span>
                <span className="cx-rule" />
              </a>
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
