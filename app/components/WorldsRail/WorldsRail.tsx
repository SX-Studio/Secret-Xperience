'use client'

import type { ReactNode } from 'react'
import './styles.css'

// The twelve worlds as a compact neon rail: two rows that swipe sideways on a
// phone, a 6×2 grid on wider screens. The neon drawings are our own artwork
// (no stock photos), so they can be used anywhere without a licence.

type World = { label: string; route: string; viewBox: string; art: ReactNode }

const W = 'currentColor'

const WORLDS: World[] = [
  {
    label: 'Escorts', route: '/escorts', viewBox: '38 22 99 66',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 52 C60 31 75 29 87.5 41 C100 29 115 31 130 52" />
        <path d="M45 52 C70 59 105 59 130 52" />
        <path d="M45 52 C62 81 113 81 130 52" />
      </g>
    ),
  },
  {
    label: 'Private Reception', route: '/private-reception', viewBox: '44 2 87 90',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-14 80 60)"><path d="M70 20 H84 L82 52 Q77 60 72 52 Z" /><path d="M77 58 V84 M69 84 H85" /></g>
        <g transform="rotate(14 95 60)"><path d="M91 20 H105 L103 52 Q98 60 93 52 Z" /><path d="M98 58 V84 M90 84 H106" /></g>
      </g>
    ),
  },
  {
    label: 'Pride', route: '/pride', viewBox: '40 10 95 80',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M87.5 82 C70 70 48 56 48 38 A18 18 0 0 1 87.5 30 A18 18 0 0 1 127 38 C127 56 105 70 87.5 82 Z" />
        <path d="M66 44 H109" strokeWidth="2.5" />
        <path d="M72 54 H103" strokeWidth="2.5" />
      </g>
    ),
  },
  {
    label: 'Nightlife', route: '/nightlife', viewBox: '46 10 83 82',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M58 22 H117 L87.5 55 Z" />
        <path d="M87.5 55 V84 M73 84 H102" />
        <circle cx="99" cy="38" r="4" />
      </g>
    ),
  },
  {
    label: 'Creators', route: '/creators', viewBox: '50 8 75 92',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="64" y="20" width="47" height="32" rx="4" />
        <circle cx="87.5" cy="36" r="10" />
        <path d="M87.5 52 V60 M87.5 60 L69 96 M87.5 60 L106 96" />
      </g>
    ),
  },
  {
    label: 'Rentals', route: '/rentals', viewBox: '42 24 112 48',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="62" cy="48" r="15" />
        <path d="M77 48 H140 M120 48 V60 M131 48 V57" />
      </g>
    ),
  },
  {
    label: 'Hotels', route: '/hotels', viewBox: '40 18 95 54',
    art: (
      <g fill={W} className="wr-nt">
        <text x="87.5" y="40" textAnchor="middle" fontSize="18">DO NOT</text>
        <text x="87.5" y="64" textAnchor="middle" fontSize="18">DISTURB</text>
      </g>
    ),
  },
  {
    label: 'Events', route: '/events', viewBox: '36 12 103 70',
    art: (
      <g className="wr-nt">
        <rect x="40" y="16" width="95" height="62" rx="10" fill="none" stroke={W} strokeWidth="3.5" />
        <text x="87.5" y="45" textAnchor="middle" fontSize="22" fill={W}>SX</text>
        <text x="87.5" y="68" textAnchor="middle" fontSize="16" fill={W}>NIGHTS</text>
      </g>
    ),
  },
  {
    label: 'Shop', route: '/shop', viewBox: '36 38 104 60',
    art: (
      <g stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M42 74 C56 75 72 62 86 52 C96 45 106 44 112 51 L132 76 C134 80 130 82 126 80 L114 67 L110 94 L105 94 L105 63 C96 68 72 86 52 86 C44 86 40 80 42 74 Z" fill="rgba(255,31,46,0.2)" />
      </g>
    ),
  },
  {
    label: 'Live', route: '/live', viewBox: '32 20 111 52',
    art: (
      <g className="wr-nt">
        <rect x="36" y="24" width="103" height="44" rx="22" fill="none" stroke={W} strokeWidth="3.5" />
        <circle cx="56" cy="46" r="7" fill={W} />
        <text x="100" y="54" textAnchor="middle" fontSize="19" fill={W}>ON AIR</text>
      </g>
    ),
  },
  {
    label: 'Jobs', route: '/jobs', viewBox: '44 14 87 76',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="52" y="36" width="71" height="46" rx="6" />
        <path d="M74 36 V28 A4 4 0 0 1 78 24 H97 A4 4 0 0 1 101 28 V36" />
        <path d="M52 56 H123" strokeWidth="2.5" />
      </g>
    ),
  },
  {
    label: 'Videos', route: '/videos', viewBox: '40 14 95 70',
    art: (
      <g fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="44" y="20" width="87" height="58" rx="10" />
        <path d="M80 36 L100 49 L80 62 Z" fill={W} />
      </g>
    ),
  },
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
            <a key={w.route} href={w.route} className="wr-card">
              <svg className="wr-art" viewBox={w.viewBox} aria-hidden="true">
                <g className="wr-neon">{w.art}</g>
              </svg>
              <span className="wr-label">{w.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}
