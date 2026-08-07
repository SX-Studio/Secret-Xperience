'use client'

import './styles.css'

// Ten category cards — each is a full-bleed branded image (photo + icon + label
// baked in), linking to its category. Images live at /categories/<slug>.jpg.

const CATS: { label: string; slug: string; route: string }[] = [
  { label: 'Escorts',    slug: 'escorts',    route: '/escorts' },
  { label: 'Companions', slug: 'companions', route: '/companionship' },
  { label: 'Nightlife',  slug: 'nightlife',  route: '/nightlife' },
  { label: 'Creators',   slug: 'creators',   route: '/creators' },
  { label: 'Rentals',    slug: 'rentals',    route: '/rentals' },
  { label: 'Hotels',     slug: 'hotels',     route: '/hotels' },
  { label: 'Events',     slug: 'events',     route: '/events' },
  { label: 'Shop',       slug: 'shop',       route: '/shop' },
  { label: 'Live',       slug: 'live',       route: '/live' },
  { label: 'Jobs',       slug: 'jobs',       route: '/jobs' },
]

export default function CategoryAnimations() {
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
            <a key={c.route} href={c.route} className="cx-card" aria-label={c.label}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cx-photo" src={`/categories/${c.slug}.jpg`} alt={c.label} loading="lazy" />
            </a>
          ))}
        </div>

        <footer className="section-foot">
          <p className="t-caption">All categories · Verified advertisers · EU-wide · Members from €0</p>
        </footer>
      </div>
    </section>
  )
}
