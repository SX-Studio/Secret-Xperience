'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import './styles.css'

export default function CategoryAnimations() {
  const booted = useRef(false)

  function tryBoot() {
    if (booted.current) return
    if (typeof window === 'undefined') return
    // @ts-expect-error — gsap is loaded from CDN
    if (!window.gsap) return
    booted.current = true
    import('./animations.js').catch(err => console.warn('Category animations failed to boot', err))
  }

  useEffect(() => { tryBoot() }, [])

  const go = (path: string) => () => { window.location.href = path }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        strategy="lazyOnload"
        onReady={tryBoot}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js"
        strategy="lazyOnload"
        onReady={tryBoot}
      />

      <section className="cat-anim-section" data-screen-label="Category explainer">
        <div className="section-inner">

          <header className="section-head">
            <span className="t-eyebrow t-eyebrow-gold">TEN WORLDS · ONE MEMBERSHIP</span>
            <h2 className="t-display section-title">
              Discover what awaits<br /><em>after the door closes.</em>
            </h2>
            <p className="t-body section-sub">
              From candlelit dinners to private nightlife, from creator subscriptions to weekend escapes —
              every category is curated, verified, and built for the discreet.
            </p>
          </header>

          <div className="cat-grid">

            {/* 1. ESCORTS — Candleglow */}
            <article className="cat-card" id="cat-escorts" data-anim="candleglow" onClick={go('/escorts')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <radialGradient id="glow-escort" cx="50%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#e0c082" stopOpacity=".7" />
                      <stop offset="60%" stopColor="#c5a05a" stopOpacity=".15" />
                      <stop offset="100%" stopColor="#c5a05a" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="flame-escort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffe6a8" />
                      <stop offset="55%" stopColor="#e0c082" />
                      <stop offset="100%" stopColor="#9a7a3a" />
                    </linearGradient>
                    <linearGradient id="candle-escort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d1d33" />
                      <stop offset="100%" stopColor="#1a0d1a" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="130" cy="178" rx="58" ry="6" fill="url(#glow-escort)" opacity=".35" />
                  <circle className="esc-halo" cx="130" cy="80" r="62" fill="url(#glow-escort)" />
                  <rect x="120" y="100" width="20" height="70" rx="2" fill="url(#candle-escort)" stroke="rgba(197,160,90,.25)" strokeWidth=".5" />
                  <ellipse cx="130" cy="100" rx="10" ry="2.5" fill="#2a1228" stroke="rgba(197,160,90,.3)" strokeWidth=".5" />
                  <path d="M122 105 q-1 6 0 12 q1.5 3 3 0 q1-6 0-12 z" fill="rgba(232,212,168,.18)" />
                  <line x1="130" y1="95" x2="130" y2="100" stroke="#1a0d1a" strokeWidth="1.2" />
                  <g className="esc-flame" transform-origin="130 95">
                    <path d="M130 60 q-10 14 -7 25 q3 11 7 11 q4 0 7 -11 q3 -11 -7 -25 z" fill="url(#flame-escort)" />
                    <path d="M130 75 q-4 8 -2 14 q2 6 2 6 q0 0 2 -6 q2 -8 -2 -14 z" fill="#fff6dc" opacity=".7" />
                  </g>
                  <path className="esc-smoke" d="M130 40 q-6 -10 0 -20 q6 -10 0 -22" fill="none" stroke="rgba(232,212,168,.35)" strokeWidth=".8" strokeLinecap="round" />
                  <path className="esc-smoke esc-smoke-2" d="M130 40 q6 -8 0 -18 q-6 -10 0 -20" fill="none" stroke="rgba(232,212,168,.25)" strokeWidth=".7" strokeLinecap="round" />
                  <text className="esc-mono" x="40" y="55" fontFamily="Playfair Display" fontStyle="italic" fontWeight="400" fontSize="42" fill="rgba(197,160,90,.10)">S</text>
                  <text className="esc-mono" x="200" y="180" fontFamily="Playfair Display" fontStyle="italic" fontWeight="400" fontSize="38" fill="rgba(139,43,63,.14)">e</text>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Escorts</h3>
                <p className="cat-desc">Verified, discreet companions — by the hour, the evening, or the weekend.</p>
                <a href="/escorts" className="cat-cta" onClick={e => e.stopPropagation()}>Explore escorts →</a>
              </div>
            </article>

            {/* 2. COMPANIONS — Silk Thread */}
            <article className="cat-card" id="cat-companions" data-anim="silk" onClick={go('/companionship')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <linearGradient id="thread-comp" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9a7a3a" />
                      <stop offset="50%" stopColor="#e0c082" />
                      <stop offset="100%" stopColor="#9a7a3a" />
                    </linearGradient>
                    <radialGradient id="dotglow-comp" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#e0c082" stopOpacity=".9" />
                      <stop offset="100%" stopColor="#c5a05a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="48" cy="148" r="22" fill="url(#dotglow-comp)" opacity=".7" />
                  <circle cx="212" cy="52" r="22" fill="url(#dotglow-comp)" opacity=".7" />
                  <path id="comp-thread" d="M48 148 C 90 110, 170 110, 212 52" fill="none" stroke="url(#thread-comp)" strokeWidth="1.4" strokeLinecap="round" />
                  <path id="comp-thread-shimmer" d="M48 148 C 90 110, 170 110, 212 52" fill="none" stroke="#ffe6a8" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 200" opacity=".95" />
                  <circle className="comp-dot" cx="48" cy="148" r="5" fill="#c5a05a" />
                  <circle className="comp-dot" cx="212" cy="52" r="5" fill="#c5a05a" />
                  <g className="comp-heart-1">
                    <path d="M0 0 m-5 -2 c0 -3 4 -3 5 -1 c1 -2 5 -2 5 1 c0 4 -5 7 -5 7 c0 0 -5 -3 -5 -7 z" fill="#c5a05a" />
                  </g>
                  <g className="comp-heart-2" opacity=".65">
                    <path d="M0 0 m-4 -1.6 c0 -2.4 3.2 -2.4 4 -.8 c.8 -1.6 4 -1.6 4 .8 c0 3.2 -4 5.6 -4 5.6 c0 0 -4 -2.4 -4 -5.6 z" fill="#e0c082" />
                  </g>
                  <text x="20" y="40" fontFamily="Playfair Display" fontStyle="italic" fontSize="34" fill="rgba(197,160,90,.08)">&amp;</text>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Companions</h3>
                <p className="cat-desc">Dinner-date companions, travel partners, plus-ones for the night.</p>
                <a href="/companionship" className="cat-cta" onClick={e => e.stopPropagation()}>Explore companions →</a>
              </div>
            </article>

            {/* 3. NIGHTLIFE — Pulse Rings */}
            <article className="cat-card" id="cat-nightlife" data-anim="pulse" onClick={go('/nightlife')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#c5a05a" stopOpacity=".2" />
                      <stop offset="100%" stopColor="#c5a05a" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="liquid-night" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b04359" stopOpacity=".9" />
                      <stop offset="100%" stopColor="#5d1a29" />
                    </linearGradient>
                  </defs>
                  <circle cx="130" cy="100" r="90" fill="url(#ring-glow)" />
                  <circle className="night-ring night-ring-1" cx="130" cy="100" r="20" fill="none" stroke="#c5a05a" strokeWidth="1" />
                  <circle className="night-ring night-ring-2" cx="130" cy="100" r="20" fill="none" stroke="#8b2b3f" strokeWidth="1" />
                  <circle className="night-ring night-ring-3" cx="130" cy="100" r="20" fill="none" stroke="#6d3a5c" strokeWidth="1" />
                  <g className="night-glass" transform-origin="130 130">
                    <path d="M100 78 L160 78 L130 122 Z" fill="none" stroke="#e0c082" strokeWidth="1.4" strokeLinejoin="round" />
                    <clipPath id="bowl-clip"><path d="M100 78 L160 78 L130 122 Z" /></clipPath>
                    <path d="M104 82 L156 82 L130 119 Z" fill="url(#liquid-night)" clipPath="url(#bowl-clip)" opacity=".85" />
                    <line x1="130" y1="122" x2="130" y2="150" stroke="#e0c082" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="112" y1="152" x2="148" y2="152" stroke="#e0c082" strokeWidth="1.6" strokeLinecap="round" />
                    <circle className="night-olive" cx="138" cy="93" r="3.5" fill="#6d3a5c" stroke="#c5a05a" strokeWidth=".6" />
                    <line x1="138" y1="93" x2="156" y2="76" stroke="#c5a05a" strokeWidth=".6" />
                  </g>
                  <circle className="night-spark" cx="80" cy="60" r="1.4" fill="#e0c082" />
                  <circle className="night-spark" cx="190" cy="50" r="1.6" fill="#e0c082" />
                  <circle className="night-spark" cx="70" cy="140" r="1.2" fill="#e0c082" />
                  <circle className="night-spark" cx="200" cy="150" r="1.4" fill="#e0c082" />
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Nightlife</h3>
                <p className="cat-desc">Private clubs, members-only lounges, after-hours by reservation.</p>
                <a href="/nightlife" className="cat-cta" onClick={e => e.stopPropagation()}>Explore venues →</a>
              </div>
            </article>

            {/* 4. CREATORS — Aperture */}
            <article className="cat-card" id="cat-creators" data-anim="aperture" onClick={go('/creators')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <radialGradient id="iris-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffe6a8" />
                      <stop offset="40%" stopColor="#c5a05a" />
                      <stop offset="100%" stopColor="#9a7a3a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="130" cy="100" r="62" fill="none" stroke="rgba(197,160,90,.4)" strokeWidth="1" />
                  <circle cx="130" cy="100" r="58" fill="none" stroke="rgba(197,160,90,.15)" strokeWidth=".5" />
                  <g className="apt-iris" transform-origin="130 100">
                    <g className="apt-blade" transform-origin="130 100">
                      <path d="M130 100 L168 64 A54 54 0 0 1 187 96 Z" fill="#1a1525" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    </g>
                    <g className="apt-blade" transform-origin="130 100" transform="rotate(60 130 100)">
                      <path d="M130 100 L168 64 A54 54 0 0 1 187 96 Z" fill="#231d2f" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    </g>
                    <g className="apt-blade" transform-origin="130 100" transform="rotate(120 130 100)">
                      <path d="M130 100 L168 64 A54 54 0 0 1 187 96 Z" fill="#1a1525" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    </g>
                    <g className="apt-blade" transform-origin="130 100" transform="rotate(180 130 100)">
                      <path d="M130 100 L168 64 A54 54 0 0 1 187 96 Z" fill="#231d2f" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    </g>
                    <g className="apt-blade" transform-origin="130 100" transform="rotate(240 130 100)">
                      <path d="M130 100 L168 64 A54 54 0 0 1 187 96 Z" fill="#1a1525" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    </g>
                    <g className="apt-blade" transform-origin="130 100" transform="rotate(300 130 100)">
                      <path d="M130 100 L168 64 A54 54 0 0 1 187 96 Z" fill="#231d2f" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    </g>
                  </g>
                  <circle className="apt-glow" cx="130" cy="100" r="14" fill="url(#iris-glow)" />
                  <line x1="130" y1="32" x2="130" y2="38" stroke="rgba(197,160,90,.45)" strokeWidth="1" />
                  <line x1="130" y1="162" x2="130" y2="168" stroke="rgba(197,160,90,.45)" strokeWidth="1" />
                  <line x1="62" y1="100" x2="68" y2="100" stroke="rgba(197,160,90,.45)" strokeWidth="1" />
                  <line x1="192" y1="100" x2="198" y2="100" stroke="rgba(197,160,90,.45)" strokeWidth="1" />
                  <text x="194" y="40" fontFamily="Poppins" fontSize="8" fontWeight="600" letterSpacing="2" fill="rgba(232,212,168,.45)">f / 1.4</text>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Creators</h3>
                <p className="cat-desc">Private content, custom commissions, subscriptions to your favorites.</p>
                <a href="/creators" className="cat-cta" onClick={e => e.stopPropagation()}>Browse creators →</a>
              </div>
            </article>

            {/* 5. RENTALS — Door Light */}
            <article className="cat-card" id="cat-rentals" data-anim="door" onClick={go('/rentals')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <linearGradient id="warm-spill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0" />
                      <stop offset="50%" stopColor="#e0c082" stopOpacity=".6" />
                      <stop offset="100%" stopColor="#9a7a3a" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="interior-rental" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d1d33" />
                      <stop offset="100%" stopColor="#9a7a3a" />
                    </linearGradient>
                  </defs>
                  <line x1="40" y1="170" x2="220" y2="170" stroke="rgba(255,255,255,.06)" strokeWidth=".5" />
                  <rect x="92" y="40" width="76" height="130" rx="2" fill="none" stroke="rgba(232,212,168,.35)" strokeWidth="1" />
                  <rect x="96" y="44" width="68" height="122" rx="1" fill="none" stroke="rgba(232,212,168,.15)" strokeWidth=".5" />
                  <g className="door-spill">
                    <path d="M130 170 L60 200 L200 200 Z" fill="url(#warm-spill)" opacity="0" />
                  </g>
                  <g className="door-leaf" transform-origin="92 105">
                    <rect x="92" y="44" width="74" height="124" rx="1.5" fill="#1a0d1a" stroke="rgba(232,212,168,.45)" strokeWidth=".8" />
                    <rect x="100" y="56" width="58" height="48" rx="1" fill="none" stroke="rgba(232,212,168,.22)" strokeWidth=".5" />
                    <rect x="100" y="112" width="58" height="48" rx="1" fill="none" stroke="rgba(232,212,168,.22)" strokeWidth=".5" />
                    <circle cx="158" cy="106" r="2.2" fill="#c5a05a" />
                  </g>
                  <g className="door-interior" opacity="0">
                    <rect x="96" y="44" width="32" height="124" fill="url(#interior-rental)" opacity=".5" />
                    <circle cx="118" cy="92" r="6" fill="#ffe6a8" opacity=".55" />
                  </g>
                  <g transform="translate(202 60)" className="door-tag">
                    <circle r="6" fill="none" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    <line x1="0" y1="6" x2="0" y2="18" stroke="rgba(197,160,90,.5)" strokeWidth=".6" />
                    <rect x="-7" y="18" width="14" height="9" rx="1" fill="rgba(197,160,90,.12)" stroke="rgba(197,160,90,.45)" strokeWidth=".5" />
                    <text x="-5" y="25" fontFamily="Poppins" fontSize="6" fontWeight="600" letterSpacing="1" fill="#e0c082">407</text>
                  </g>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Rentals</h3>
                <p className="cat-desc">Private apartments and suites — discreet entry, hourly or nightly.</p>
                <a href="/rentals" className="cat-cta" onClick={e => e.stopPropagation()}>Find a space →</a>
              </div>
            </article>

            {/* 6. HOTELS — Key Card */}
            <article className="cat-card" id="cat-hotels" data-anim="keycard" onClick={go('/hotels')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <linearGradient id="card-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1a1525" />
                      <stop offset="100%" stopColor="#3d1d33" />
                    </linearGradient>
                    <radialGradient id="led-on" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#26d4a0" />
                      <stop offset="100%" stopColor="#1a8f6a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect x="80" y="36" width="100" height="34" rx="3" fill="#0d0710" stroke="rgba(232,212,168,.35)" strokeWidth=".8" />
                  <rect x="98" y="52" width="64" height="3" rx="1.5" fill="rgba(0,0,0,.6)" />
                  <circle className="hotel-led" cx="170" cy="45" r="2" fill="#b84d72" />
                  <circle className="hotel-led-halo" cx="170" cy="45" r="6" fill="url(#led-on)" opacity="0" />
                  <line x1="86" y1="42" x2="92" y2="42" stroke="rgba(232,212,168,.45)" strokeWidth=".8" />
                  <text x="86" y="65" fontFamily="Poppins" fontSize="6" fontWeight="600" letterSpacing="2" fill="rgba(232,212,168,.5)">RFID</text>
                  <rect className="hotel-beam" x="125" y="55" width="10" height="0" fill="rgba(38,212,160,.35)" opacity="0" />
                  <g className="hotel-card" transform="translate(0 0)">
                    <rect x="92" y="160" width="76" height="44" rx="3" fill="url(#card-grad)" stroke="rgba(197,160,90,.45)" strokeWidth=".8" />
                    <rect x="92" y="167" width="76" height="6" fill="#0a050a" />
                    <text x="100" y="190" fontFamily="Playfair Display" fontStyle="italic" fontSize="11" fill="#c5a05a">Xperience</text>
                    <text x="100" y="200" fontFamily="Poppins" fontSize="5" fontWeight="600" letterSpacing="2" fill="rgba(232,212,168,.55)">SUITE · 1207</text>
                  </g>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Hotels</h3>
                <p className="cat-desc">Adult-friendly hotels, late check-in, no questions asked.</p>
                <a href="/hotels" className="cat-cta" onClick={e => e.stopPropagation()}>Book a room →</a>
              </div>
            </article>

            {/* 7. EVENTS — Champagne */}
            <article className="cat-card" id="cat-events" data-anim="champagne" onClick={go('/events')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <linearGradient id="bubbly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffe6a8" />
                      <stop offset="100%" stopColor="#c5a05a" />
                    </linearGradient>
                    <radialGradient id="spark-evt" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffe6a8" />
                      <stop offset="100%" stopColor="#c5a05a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path d="M104 30 L156 30 L148 122 Q148 130 130 132 Q112 130 112 122 Z" fill="none" stroke="rgba(232,212,168,.55)" strokeWidth="1.2" strokeLinejoin="round" />
                  <line x1="130" y1="132" x2="130" y2="170" stroke="rgba(232,212,168,.55)" strokeWidth="1.2" />
                  <line x1="110" y1="172" x2="150" y2="172" stroke="rgba(232,212,168,.55)" strokeWidth="1.6" strokeLinecap="round" />
                  <clipPath id="flute-clip">
                    <path d="M104 30 L156 30 L148 122 Q148 130 130 132 Q112 130 112 122 Z" />
                  </clipPath>
                  <rect className="evt-liquid" x="104" y="132" width="52" height="0" fill="url(#bubbly)" opacity=".85" clipPath="url(#flute-clip)" />
                  <g className="evt-bubbles" clipPath="url(#flute-clip)">
                    <circle className="evt-b" cx="118" cy="120" r="1.5" fill="#ffe6a8" />
                    <circle className="evt-b" cx="130" cy="120" r="1.2" fill="#ffe6a8" />
                    <circle className="evt-b" cx="142" cy="120" r="1.6" fill="#ffe6a8" />
                    <circle className="evt-b" cx="124" cy="120" r="1.1" fill="#ffe6a8" />
                    <circle className="evt-b" cx="136" cy="120" r="1.4" fill="#ffe6a8" />
                    <circle className="evt-b" cx="120" cy="120" r="1.2" fill="#ffe6a8" />
                  </g>
                  <g className="evt-pop">
                    <circle cx="130" cy="20" r="3" fill="url(#spark-evt)" />
                    <line x1="130" y1="6" x2="130" y2="14" stroke="#e0c082" strokeWidth="1" strokeLinecap="round" />
                    <line x1="130" y1="26" x2="130" y2="34" stroke="#e0c082" strokeWidth="1" strokeLinecap="round" />
                    <line x1="115" y1="20" x2="123" y2="20" stroke="#e0c082" strokeWidth="1" strokeLinecap="round" />
                    <line x1="137" y1="20" x2="145" y2="20" stroke="#e0c082" strokeWidth="1" strokeLinecap="round" />
                    <line x1="120" y1="10" x2="125" y2="15" stroke="#e0c082" strokeWidth="1" strokeLinecap="round" />
                    <line x1="140" y1="10" x2="135" y2="15" stroke="#e0c082" strokeWidth="1" strokeLinecap="round" />
                  </g>
                  <g className="evt-confetti">
                    <rect className="evt-c" x="48" y="20" width="3" height="6" fill="#c5a05a" transform="rotate(20 49 23)" />
                    <rect className="evt-c" x="200" y="30" width="3" height="6" fill="#8b2b3f" transform="rotate(-15 201 33)" />
                    <rect className="evt-c" x="220" y="10" width="3" height="6" fill="#c5a05a" transform="rotate(40 221 13)" />
                    <rect className="evt-c" x="30" y="50" width="3" height="6" fill="#6d3a5c" transform="rotate(-25 31 53)" />
                  </g>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Events</h3>
                <p className="cat-desc">Curated parties, soirées, and private events across the continent.</p>
                <a href="/events" className="cat-cta" onClick={e => e.stopPropagation()}>View events calendar →</a>
              </div>
            </article>

            {/* 8. SHOP — Ribbon Untie */}
            <article className="cat-card" id="cat-shop" data-anim="ribbon" onClick={go('/shop')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <linearGradient id="box-shop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d1d33" />
                      <stop offset="100%" stopColor="#1a0d1a" />
                    </linearGradient>
                    <linearGradient id="lid-shop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a2638" />
                      <stop offset="100%" stopColor="#2a1228" />
                    </linearGradient>
                    <radialGradient id="treasure-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffe6a8" stopOpacity=".9" />
                      <stop offset="100%" stopColor="#c5a05a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse className="shop-glow" cx="130" cy="118" rx="50" ry="22" fill="url(#treasure-glow)" opacity="0" />
                  <rect x="86" y="100" width="88" height="62" rx="2" fill="url(#box-shop)" stroke="rgba(197,160,90,.4)" strokeWidth=".8" />
                  <rect className="shop-rib-v" x="126" y="100" width="8" height="62" fill="#c5a05a" opacity=".9" />
                  <g className="shop-lid" transform-origin="130 100">
                    <rect x="80" y="86" width="100" height="18" rx="2" fill="url(#lid-shop)" stroke="rgba(197,160,90,.4)" strokeWidth=".8" />
                    <rect x="126" y="86" width="8" height="18" fill="#c5a05a" />
                  </g>
                  <g className="shop-bow" transform-origin="130 86">
                    <path d="M130 86 Q108 70 116 60 Q124 50 130 78 Z" fill="#c5a05a" stroke="#9a7a3a" strokeWidth=".6" />
                    <path d="M130 86 Q152 70 144 60 Q136 50 130 78 Z" fill="#c5a05a" stroke="#9a7a3a" strokeWidth=".6" />
                    <circle cx="130" cy="84" r="3.5" fill="#9a7a3a" />
                    <path d="M126 86 Q120 100 124 110" fill="none" stroke="#9a7a3a" strokeWidth=".6" />
                    <path d="M134 86 Q140 100 136 110" fill="none" stroke="#9a7a3a" strokeWidth=".6" />
                  </g>
                  <circle className="shop-spark" cx="100" cy="100" r="1.5" fill="#e0c082" opacity="0" />
                  <circle className="shop-spark" cx="120" cy="92" r="1.2" fill="#e0c082" opacity="0" />
                  <circle className="shop-spark" cx="140" cy="92" r="1.4" fill="#e0c082" opacity="0" />
                  <circle className="shop-spark" cx="160" cy="100" r="1.3" fill="#e0c082" opacity="0" />
                  <circle className="shop-spark" cx="130" cy="80" r="1.6" fill="#ffe6a8" opacity="0" />
                  <ellipse cx="130" cy="166" rx="50" ry="3" fill="rgba(0,0,0,.5)" />
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Shop</h3>
                <p className="cat-desc">Refined accessories, intimate gifts, lingerie — delivered discreetly.</p>
                <a href="/shop" className="cat-cta" onClick={e => e.stopPropagation()}>Shop now →</a>
              </div>
            </article>

            {/* 9. LIVE — Cams, shows & chat */}
            <article className="cat-card cat-live" id="cat-live" data-anim="live" onClick={go('/live')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <radialGradient id="glow-live" cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stopColor="#e2504f" stopOpacity=".32" />
                      <stop offset="70%" stopColor="#e2504f" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="130" cy="94" r="60" fill="url(#glow-live)" />
                  <path className="lv-wave" d="M96 66 q-14 14 0 30" fill="none" stroke="rgba(197,160,90,.45)" strokeWidth="1.2" strokeLinecap="round" />
                  <path className="lv-wave" d="M86 58 q-22 22 0 46" fill="none" stroke="rgba(197,160,90,.3)" strokeWidth="1.1" strokeLinecap="round" />
                  <path className="lv-wave" d="M164 66 q14 14 0 30" fill="none" stroke="rgba(197,160,90,.45)" strokeWidth="1.2" strokeLinecap="round" />
                  <path className="lv-wave" d="M174 58 q22 22 0 46" fill="none" stroke="rgba(197,160,90,.3)" strokeWidth="1.1" strokeLinecap="round" />
                  <rect x="102" y="66" width="56" height="42" rx="6" fill="rgba(197,160,90,.05)" stroke="#c5a05a" strokeWidth="1.6" />
                  <path d="M124 78 l16 9 -16 9 z" fill="#e0c082" />
                  <rect x="100" y="120" width="46" height="18" rx="9" fill="rgba(226,80,79,.16)" stroke="#e2504f" strokeWidth="1.2" />
                  <circle className="lv-dot" cx="111" cy="129" r="3.4" fill="#e2504f" />
                  <text x="119" y="133" fontSize="9" fontWeight="700" letterSpacing="1.5" fill="#e2504f" fontFamily="Poppins, sans-serif">LIVE</text>
                  <path d="M156 118 h34 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-20 l-8 8 v-8 h-6 a6 6 0 0 1 -6 -6 v-14 a6 6 0 0 1 6 -6 z" fill="rgba(197,160,90,.05)" stroke="#c5a05a" strokeWidth="1.5" strokeLinejoin="round" />
                  <line x1="164" y1="128" x2="188" y2="128" stroke="rgba(197,160,90,.45)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="164" y1="135" x2="182" y2="135" stroke="rgba(197,160,90,.45)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Live</h3>
                <p className="cat-desc">Cams, live shows &amp; private chat — watch, tip and talk in real time.</p>
                <a href="/live" className="cat-cta" onClick={e => e.stopPropagation()}>Watch live →</a>
              </div>
            </article>

            {/* 10. XVACATURES — Adult-industry jobs */}
            <article className="cat-card cat-xvac" id="cat-xvacatures" data-anim="xvac" onClick={go('/jobs')}>
              <div className="cat-canvas">
                <svg viewBox="0 0 260 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <radialGradient id="glow-xvac" cx="50%" cy="48%" r="52%">
                      <stop offset="0%" stopColor="#e0c082" stopOpacity=".28" />
                      <stop offset="70%" stopColor="#e0c082" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="130" cy="98" r="58" fill="url(#glow-xvac)" />
                  <text x="196" y="54" fontSize="40" fontFamily="Playfair Display, Georgia, serif" fontStyle="italic" fill="rgba(197,160,90,.10)">X</text>
                  <rect x="82" y="82" width="96" height="66" rx="8" fill="rgba(197,160,90,.05)" stroke="#c5a05a" strokeWidth="1.6" />
                  <path d="M110 82 v-10 a6 6 0 0 1 6 -6 h28 a6 6 0 0 1 6 6 v10" fill="none" stroke="#c5a05a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="82" y1="108" x2="178" y2="108" stroke="#c5a05a" strokeWidth="1.6" />
                  <rect x="120" y="102" width="20" height="12" rx="3" fill="rgba(197,160,90,.2)" stroke="#c5a05a" strokeWidth="1.3" />
                  <path d="M104 122 l16 16 M120 122 l-16 16" fill="none" stroke="rgba(197,160,90,.4)" strokeWidth="1.2" strokeLinecap="round" />
                  <g className="xv-spark" stroke="#e0c082" strokeWidth="1.6" strokeLinecap="round" transform-origin="166 126">
                    <line x1="166" y1="119" x2="166" y2="133" />
                    <line x1="159" y1="126" x2="173" y2="126" />
                  </g>
                </svg>
              </div>
              <div className="cat-meta">
                <h3 className="cat-title">Xvacatures</h3>
                <p className="cat-desc">Adult-industry jobs across Europe — vacancies offered &amp; work wanted.</p>
                <a href="/jobs" className="cat-cta" onClick={e => e.stopPropagation()}>Browse jobs →</a>
              </div>
            </article>

          </div>

          <footer className="section-foot">
            <p className="t-caption">All categories · Verified advertisers · EU-wide · Members from €0</p>
          </footer>

        </div>
      </section>
    </>
  )
}
