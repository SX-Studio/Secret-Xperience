'use client'

import './styles.css'

// Ten category cards — full-bleed branded image (photo + icon + label baked in),
// with the category headline overlaid as semi-transparent italic-serif text in the
// card's accent colour. Images live at /categories/<slug>.jpg.

const CATS: { label: string; slug: string; route: string; headline: string; accent: string }[] = [
  { label: 'Escorts',    slug: 'escorts',    route: '/escorts',       headline: 'Your secret side',        accent: '#e6c98a' },
  { label: 'Companions', slug: 'companions', route: '/companionship', headline: 'Never arrive alone',       accent: '#e3ba86' },
  { label: 'Nightlife',  slug: 'nightlife',  route: '/nightlife',     headline: 'Where the night opens',    accent: '#ef6d86' },
  { label: 'Creators',   slug: 'creators',   route: '/creators',      headline: 'Follow every obsession',   accent: '#c79bef' },
  { label: 'Rentals',    slug: 'rentals',    route: '/rentals',       headline: 'A place to disappear',     accent: '#edc074' },
  { label: 'Hotels',     slug: 'hotels',     route: '/hotels',        headline: 'Check in. Tell no one.',   accent: '#5fe0c4' },
  { label: 'Events',     slug: 'events',     route: '/events',        headline: 'On the guest list',        accent: '#e6c98a' },
  { label: 'Shop',       slug: 'shop',       route: '/shop',          headline: 'Dressed for the dark',     accent: '#ef8fb0' },
  { label: 'Live',       slug: 'live',       route: '/live',          headline: 'Live, and watching you',   accent: '#f0665f' },
  { label: 'Jobs',       slug: 'jobs',       route: '/jobs',          headline: 'Work on your terms',       accent: '#e6c98a' },
  { label: 'Pride',      slug: 'pride',      route: '/pride',         headline: 'All colours, after dark', accent: '#c79bef' },
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
              <span className="cx-head" style={{ color: c.accent }}>{c.headline}</span>
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
