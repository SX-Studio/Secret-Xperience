'use client'

import './styles.css'

// The twelve worlds as a compact rail: two rows that swipe sideways on a phone,
// a 6×2 grid on wider screens. Uses the same branded photos as before
// (/categories/<slug>.jpg — label and icon are baked into the image), shown
// uncropped at their own 300:486 ratio.

const WORLDS: { label: string; slug: string; route: string; headline: string; accent: string }[] = [
  { label: 'Escorts',           slug: 'escorts',    route: '/escorts',           headline: 'Your secret side',        accent: '#e6c98a' },
  { label: 'Private Reception', slug: 'companions', route: '/private-reception', headline: 'Never arrive alone',      accent: '#e3ba86' },
  { label: 'Pride',             slug: 'pride',      route: '/pride',             headline: 'All colours, after dark', accent: '#c79bef' },
  { label: 'Nightlife',         slug: 'nightlife',  route: '/nightlife',         headline: 'Where the night opens',   accent: '#ef6d86' },
  { label: 'Creators',          slug: 'creators',   route: '/creators',          headline: 'Follow every obsession',  accent: '#c79bef' },
  { label: 'Rentals',           slug: 'rentals',    route: '/rentals',           headline: 'A place to disappear',    accent: '#edc074' },
  { label: 'Hotels',            slug: 'hotels',     route: '/hotels',            headline: 'Check in. Tell no one.',  accent: '#5fe0c4' },
  { label: 'Events',            slug: 'events',     route: '/events',            headline: 'On the guest list',       accent: '#e6c98a' },
  { label: 'Shop',              slug: 'shop',       route: '/shop',              headline: 'Dressed for the dark',    accent: '#ef8fb0' },
  { label: 'Live',              slug: 'live',       route: '/live',              headline: 'Live, and watching you',  accent: '#f0665f' },
  { label: 'Jobs',              slug: 'jobs',       route: '/jobs',              headline: 'Work on your terms',      accent: '#e6c98a' },
  { label: 'Videos',            slug: 'videos',     route: '/videos',            headline: 'Watch in full frame',     accent: '#c79bef' },
]

export default function WorldsRail() {
  return (
    <section className="wr-section" data-screen-label="Twelve worlds">
      <div className="wr-inner">
        <header className="wr-head">
          <div>
            <span className="wr-eyebrow">TWELVE WORLDS · ONE MEMBERSHIP</span>
            <h2 className="wr-title">Choose your <em>world</em></h2>
          </div>
          <span className="wr-hint" aria-hidden="true">SWIPE →</span>
        </header>

        <nav className="wr-rail" aria-label="Twelve worlds">
          {WORLDS.map((w) => (
            <a key={w.route} href={w.route} className="wr-card" aria-label={w.label}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="wr-photo" src={`/categories/${w.slug}.jpg`} alt={w.label} loading="lazy" />
              <span className="wr-headline" style={{ color: w.accent }}>{w.headline}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}
