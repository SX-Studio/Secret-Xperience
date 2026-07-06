'use client'

import { useEffect, useState, CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Visitor-selectable hero styles. A floating 🎨 button lets the visitor pick
// one of 10 looks (or Klassiek = the built-in hero). Choice persists in
// localStorage (sx_hero_theme). The chosen variant renders into
// #heroThemesMount and the default #editorialHero is hidden.

const LS_KEY = 'sx_hero_theme'

const PROFILES = [
  { name: 'Sophia',  city: 'BRUSSEL',    img: '/ads/sophia-2.jpg',     href: '/listings/72ff192a-666c-4e35-98c3-2765917a0612' },
  { name: 'Mel',     city: 'GRIMBERGEN', img: '/ads/mel-2.jpg',        href: '/listings/da05cafd-d905-404d-b168-d06875662176' },
  { name: 'Rebe',    city: 'ANTWERPEN',  img: '/ads/rebe-4.jpg',       href: '/listings/1e7ad4eb-c09e-4eec-9969-898cd22af19a' },
  { name: 'Lorena',  city: 'WEMMEL',     img: '/ads/lorena-2.jpg',     href: '/listings/85897b78-4d2a-4f69-8022-e4dcecb6a9fc' },
  { name: 'Karolzinha', city: 'GRIMBERGEN', img: '/ads/karolzinha-2.jpg', href: '/listings/d107be49-4caa-4719-a680-1850f4d742c0' },
]

const serif = "var(--serif, 'Cormorant Garamond', serif)"

function goSearch() {
  window.location.href = '/search'
}

function SearchBar({ btnBg, btnColor = '#14080e', border = 'rgba(255,255,255,.16)', bg = 'rgba(255,255,255,.07)', max = 480 }:
  { btnBg: string; btnColor?: string; border?: string; bg?: string; max?: number }) {
  return (
    <div onClick={goSearch} style={{ display: 'flex', alignItems: 'center', background: bg, border: `1px solid ${border}`, borderRadius: 18, padding: '7px 7px 7px 22px', maxWidth: max, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
      <span style={{ color: '#9a8c98', fontSize: 14, flex: 1 }}>Search listings, companions, venues…</span>
      <b style={{ background: btnBg, borderRadius: 13, padding: '12px 26px', color: btnColor, fontSize: 13.5, fontWeight: 600 }}>Search</b>
    </div>
  )
}

function LivePill({ color = '#26d4a0' }: { color?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${color}1a`, border: `1px solid ${color}66`, borderRadius: 999, padding: '8px 16px', fontSize: 12.5, color: '#e8e0d0', marginTop: 20 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
      <b style={{ color }}>63</b>&nbsp;listings live now across&nbsp;<b style={{ color }}>14</b>&nbsp;cities
    </div>
  )
}

function Stats({ color }: { color: string }) {
  const stt: CSSProperties = { fontSize: 9.5, letterSpacing: '.18em', color: '#9a8c98' }
  return (
    <div style={{ display: 'flex', gap: 44, marginTop: 32, flexWrap: 'wrap' }}>
      {[['63', 'LISTINGS'], ['14', 'CITIES'], ['8', 'CATEGORIES'], ['4.8 ★', 'AVG RATING']].map(([n, l]) => (
        <div key={l}><div style={{ fontFamily: serif, fontSize: 28, color }}>{n}</div><div style={stt}>{l}</div></div>
      ))}
    </div>
  )
}

function Headline({ accent, size = 56 }: { accent: string; size?: number }) {
  return (
    <>
      <div style={{ fontSize: 12, letterSpacing: '.28em', color: accent, marginBottom: 18 }}>EU · DISCREET · VERIFIED</div>
      <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: size, lineHeight: 1.08, color: '#fff', margin: 0 }}>Where the night begins</h1>
      <h1 style={{ fontFamily: serif, fontWeight: 400, fontStyle: 'italic', fontSize: size - 4, lineHeight: 1.2, color: accent, margin: '0 0 20px' }}>with someone discreet</h1>
      <p style={{ color: '#b7a8b3', fontSize: 15, lineHeight: 1.7, maxWidth: 430, marginBottom: 26 }}>
        A members-only marketplace for escorts, companions, nightlife, creators, rentals, and the after-hours.
      </p>
    </>
  )
}

function Card({ p, border, badge, badgeText = '● AVAILABLE NOW', w = 280 }: { p: typeof PROFILES[0]; border: string; badge: string; badgeText?: string; w?: number }) {
  return (
    <a href={p.href} style={{ display: 'block', position: 'relative', width: w, borderRadius: 20, overflow: 'hidden', border, background: '#1a0f18', boxShadow: '0 30px 70px rgba(0,0,0,.6)', textDecoration: 'none', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 12, left: 12, background: badge, borderRadius: 999, padding: '5px 13px', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', color: '#fff', zIndex: 2 }}>{badgeText}</span>
      <div style={{ height: w, background: `url('${p.img}') center 15%/cover` }} />
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: serif, fontSize: 21, color: '#fff' }}>{p.name}</span>
        <span style={{ fontSize: 11, color: '#9d8fa5', letterSpacing: '.06em' }}>{p.city}</span>
      </div>
    </a>
  )
}

// ─── The 10 hero variants ───────────────────────────────────────────────

function GoldenAura() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,3.5rem)', background: 'radial-gradient(ellipse 55% 65% at 82% 20%,rgba(197,160,90,.28),transparent 60%),radial-gradient(ellipse 45% 55% at 8% 85%,rgba(139,43,63,.4),transparent 60%),#150a12' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <Headline accent="#e8c97e" />
          <SearchBar btnBg="linear-gradient(135deg,#e8c97e,#c5883f)" />
          <LivePill />
          <Stats color="#e8c97e" />
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -14, borderRadius: 26, background: 'conic-gradient(from 20deg,#e8c97e,#8b2b3f,#e8c97e)', filter: 'blur(22px)', opacity: .55 }} />
          <div style={{ position: 'relative' }}>
            <Card p={PROFILES[3]} border="1.5px solid rgba(232,201,126,.8)" badge="linear-gradient(90deg,#26d4a0,#0e9f6e)" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SunsetVelvet() {
  const cp: CSSProperties = { padding: '9px 18px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: '#fff', textDecoration: 'none' }
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,3.5rem)', background: 'radial-gradient(ellipse 60% 70% at 88% 8%,rgba(255,110,90,.35),transparent 55%),radial-gradient(ellipse 55% 60% at 70% 100%,rgba(255,45,120,.28),transparent 60%),#190a18' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <Headline accent="#ff9d7a" />
          <SearchBar btnBg="linear-gradient(90deg,#ff8a5c,#ff2d78)" btnColor="#fff" />
          <LivePill color="#ffb46b" />
          <Stats color="#ff9d7a" />
          <div style={{ display: 'flex', gap: 9, marginTop: 24, flexWrap: 'wrap' }}>
            <a href="/escorts" style={{ ...cp, background: 'linear-gradient(90deg,#ff8a5c,#ff5c7a)' }}>💋 Escorts</a>
            <a href="/private-reception" style={{ ...cp, background: 'linear-gradient(90deg,#b45cff,#7a4dff)' }}>🏠 Privé</a>
            <a href="/private-reception?cat=massage" style={{ ...cp, background: 'linear-gradient(90deg,#ff5c9e,#e02d94)' }}>💆 Massage</a>
            <a href="/live" style={{ ...cp, background: 'linear-gradient(90deg,#2dd4a0,#0e9f8f)' }}>📹 Live</a>
            <a href="/nightlife" style={{ ...cp, background: 'linear-gradient(90deg,#ffb46b,#ff8a3c)' }}>🥂 Nightlife</a>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -3, borderRadius: 23, background: 'linear-gradient(140deg,#ff8a5c,#ff2d78 55%,#b45cff)' }} />
          <div style={{ position: 'relative' }}>
            <Card p={PROFILES[2]} border="none" badge="linear-gradient(90deg,#ff8a5c,#ff2d78)" />
          </div>
        </div>
      </div>
    </section>
  )
}

function NeonNights() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,3.5rem)', background: '#0f0817' }}>
      <span style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,60,180,.4),transparent 65%)', right: -80, top: -120, filter: 'blur(10px)' }} />
      <span style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(80,200,255,.28),transparent 65%)', left: -100, bottom: -140, filter: 'blur(10px)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <Headline accent="#ff5ccf" />
          <SearchBar btnBg="linear-gradient(90deg,#ff5ccf,#8a5cff)" btnColor="#fff" />
          <LivePill color="#4ff0c8" />
          <Stats color="#ff5ccf" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -2, borderRadius: 22, background: 'linear-gradient(140deg,#ff5ccf,#8a5cff,#4ff0c8)' }} />
            <div style={{ position: 'relative' }}>
              <Card p={PROFILES[1]} border="none" badge="linear-gradient(90deg,#ff5ccf,#8a5cff)" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/live" style={{ background: 'rgba(255,92,207,.15)', border: '1px solid rgba(255,92,207,.5)', color: '#ff9ce4', borderRadius: 12, padding: '9px 16px', fontSize: 11.5, fontWeight: 600, textDecoration: 'none' }}>🔥 nu online</a>
            <a href="/messages" style={{ background: 'rgba(79,240,200,.12)', border: '1px solid rgba(79,240,200,.45)', color: '#8ff5da', borderRadius: 12, padding: '9px 16px', fontSize: 11.5, fontWeight: 600, textDecoration: 'none' }}>⚡ direct chatten</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChampagneBlush() {
  const mini = (p: typeof PROFILES[0], style: CSSProperties) => (
    <a href={p.href} style={{ width: 170, borderRadius: 16, overflow: 'hidden', background: '#1a0f18', boxShadow: '0 18px 44px rgba(0,0,0,.5)', textDecoration: 'none', display: 'block', ...style }}>
      <div style={{ height: 190, background: `url('${p.img}') center 15%/cover` }} />
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontFamily: serif, fontSize: 15, color: '#fff' }}>{p.name}</div>
        <div style={{ fontSize: 10, color: '#9d8fa5' }}>{p.city} · €100</div>
      </div>
    </a>
  )
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,3.5rem)', background: 'linear-gradient(130deg,#3a1626 0%,#4a1e2c 45%,#5c2a34 75%,#6e3a38 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <Headline accent="#ffd6aa" />
          <SearchBar btnBg="linear-gradient(135deg,#ffd6aa,#e8a06a)" />
          <LivePill color="#ffce8a" />
          <Stats color="#ffd6aa" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          {mini(PROFILES[0], { transform: 'rotate(-8deg) translateX(30px)' })}
          {mini(PROFILES[3], { transform: 'translateY(-14px)', zIndex: 2, position: 'relative' })}
          {mini(PROFILES[2], { transform: 'rotate(8deg) translateX(-30px)' })}
        </div>
      </div>
    </section>
  )
}

function AuroraLuxe() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,3.5rem)', background: '#0a0f14' }}>
      <span style={{ position: 'absolute', inset: '-40% -20%', background: 'conic-gradient(from 210deg at 60% 40%,transparent 0deg,rgba(28,180,160,.22) 40deg,transparent 90deg,rgba(197,160,90,.25) 150deg,transparent 210deg,rgba(90,60,180,.2) 280deg,transparent 340deg)', filter: 'blur(50px)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <Headline accent="#e8c97e" />
          <SearchBar btnBg="linear-gradient(90deg,#e8c97e,#2edfc0)" />
          <LivePill color="#2edfc0" />
          <Stats color="#e8c97e" />
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -3, borderRadius: 23, background: 'linear-gradient(160deg,#e8c97e,#2edfc0 60%,#5a3cb4)' }} />
          <div style={{ position: 'relative' }}>
            <Card p={PROFILES[1]} border="none" badge="linear-gradient(90deg,#0e9f8f,#2edfc0)" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Cinematic() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 620 }}>
      <div style={{ position: 'absolute', inset: 0, background: `url('${PROFILES[3].img}') center 12%/cover` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,rgba(11,7,15,.96) 25%,rgba(11,7,15,.55) 55%,rgba(11,7,15,.2))' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(11,7,15,.95) 8%,transparent 45%)' }} />
      <div style={{ position: 'relative', padding: 'clamp(2.5rem,6vw,5rem) clamp(1rem,4vw,3.5rem) 140px', maxWidth: 640 }}>
        <Headline accent="#e8c97e" size={60} />
        <Stats color="#e8c97e" />
      </div>
      <a href={PROFILES[4].href} style={{ position: 'absolute', right: 'clamp(1rem,4vw,3.5rem)', top: 90, background: 'rgba(20,12,22,.72)', border: '1px solid rgba(232,201,126,.4)', borderRadius: 16, padding: '14px 20px', backdropFilter: 'blur(10px)', textDecoration: 'none' }}>
        <div style={{ fontSize: 10, letterSpacing: '.14em', color: '#b8a7b3' }}>FEATURED · PRIVÉ</div>
        <div style={{ fontFamily: serif, fontSize: 22, color: '#fff', margin: '3px 0' }}>Karolzinha — Grimbergen</div>
        <div style={{ fontFamily: serif, fontSize: 17, color: '#e8c97e' }}>● available now 24/7</div>
      </a>
      <div style={{ position: 'absolute', left: 'clamp(1rem,4vw,3.5rem)', right: 'clamp(1rem,4vw,3.5rem)', bottom: 40, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <SearchBar btnBg="linear-gradient(135deg,#e8c97e,#c5883f)" bg="rgba(20,12,22,.75)" border="rgba(232,201,126,.35)" max={2000} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(38,212,160,.12)', border: '1px solid rgba(38,212,160,.4)', borderRadius: 18, padding: '14px 20px', fontSize: 13, color: '#e8e0d0', whiteSpace: 'nowrap', backdropFilter: 'blur(12px)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#26d4a0', boxShadow: '0 0 10px #26d4a0' }} /><b style={{ color: '#26d4a0' }}>63</b>&nbsp;live now
        </div>
      </div>
    </section>
  )
}

function Orbit() {
  const bubbles: Array<[number, number, number, string, string]> = [
    [6, 18, 86, '#ff8a5c', PROFILES[0].img], [14, 64, 64, '#26d4a0', PROFILES[1].img], [34, 84, 52, '#b45cff', PROFILES[2].img],
    [82, 20, 78, '#ff5c9e', PROFILES[3].img], [89, 56, 60, '#e8c97e', PROFILES[4].img],
  ]
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(3rem,6vw,5.5rem) clamp(1rem,4vw,3.5rem)', textAlign: 'center', background: 'radial-gradient(ellipse 65% 60% at 50% 0%,rgba(197,160,90,.18),transparent 60%),radial-gradient(ellipse 50% 40% at 50% 115%,rgba(255,92,158,.16),transparent 65%),#120a16' }}>
      {bubbles.map(([x, y, s, c, img], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s, borderRadius: '50%', background: `url(${img}) center 12%/cover`, border: `3px solid ${c}`, boxShadow: '0 10px 30px rgba(0,0,0,.5)' }} />
      ))}
      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(232,201,126,.12)', border: '1px solid rgba(232,201,126,.4)', borderRadius: 999, padding: '8px 20px', fontSize: 12, letterSpacing: '.2em', color: '#e8c97e', marginBottom: 24 }}>EU · DISCREET · VERIFIED</div>
        <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(34px,5vw,60px)', lineHeight: 1.08, color: '#fff', margin: 0 }}>
          Where the night begins <em style={{ fontStyle: 'italic', background: 'linear-gradient(90deg,#e8c97e,#ff8fb0)', WebkitBackgroundClip: 'text', color: 'transparent' }}>with someone discreet</em>
        </h1>
        <p style={{ color: '#b7a8b3', fontSize: 15.5, lineHeight: 1.7, margin: '22px auto 28px', maxWidth: 460 }}>A members-only marketplace for escorts, companions, nightlife, creators, rentals, and the after-hours.</p>
        <div onClick={goSearch} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 999, padding: '8px 8px 8px 26px', maxWidth: 520, margin: '0 auto', boxShadow: '0 24px 60px rgba(0,0,0,.45)', cursor: 'pointer' }}>
          <span style={{ color: '#9a8c98', fontSize: 14.5, flex: 1, textAlign: 'left' }}>Search listings, companions, venues…</span>
          <b style={{ background: 'linear-gradient(90deg,#ff8a5c,#ff2d78)', borderRadius: 999, padding: '13px 28px', color: '#fff', fontSize: 14 }}>Search</b>
        </div>
        <LivePill />
        <div style={{ display: 'flex', justifyContent: 'center' }}><Stats color="#e8c97e" /></div>
      </div>
    </section>
  )
}

function Diagonal() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 600, background: '#140b12' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%', clipPath: 'polygon(18% 0,100% 0,100% 100%,0 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <div style={{ background: `url('${PROFILES[1].img}') center 10%/cover` }} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
            <div style={{ background: `url('${PROFILES[2].img}') center 20%/cover` }} />
            <div style={{ background: `url('${PROFILES[4].img}') center 25%/cover` }} />
          </div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(80deg,rgba(20,11,18,.85) 0%,transparent 40%)' }} />
      </div>
      <div style={{ position: 'absolute', right: '44.5%', top: 0, bottom: 0, width: 120, background: 'linear-gradient(180deg,#e8c97e,#ff5c8a)', clipPath: 'polygon(60% 0,100% 0,40% 100%,0 100%)', opacity: .9 }} />
      <div style={{ position: 'relative', padding: 'clamp(2.5rem,6vw,5rem) 0 3rem clamp(1rem,4vw,3.5rem)', maxWidth: 560 }}>
        <Headline accent="#ff8fb0" />
        <SearchBar btnBg="linear-gradient(90deg,#e8c97e,#ff5c8a)" max={440} />
        <LivePill />
        <Stats color="#e8c97e" />
      </div>
    </section>
  )
}

function Mosaic() {
  const mc = (p: typeof PROFILES[0], tag: string, tagc: string, h: number) => (
    <a href={p.href} style={{ position: 'relative', display: 'block', borderRadius: 16, overflow: 'hidden', height: h, boxShadow: '0 16px 40px rgba(0,0,0,.5)', textDecoration: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `url('${p.img}') center 12%/cover` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,6,12,.85),transparent 45%)' }} />
      <span style={{ position: 'absolute', top: 10, left: 10, background: tagc, borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 600, color: '#fff' }}>{tag}</span>
      <div style={{ position: 'absolute', left: 14, bottom: 12, fontFamily: serif, fontSize: 19, color: '#fff' }}>{p.name}</div>
    </a>
  )
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,3.5rem)', background: 'radial-gradient(ellipse 50% 60% at 90% 10%,rgba(180,92,255,.2),transparent 60%),radial-gradient(ellipse 45% 50% at 5% 90%,rgba(197,160,90,.18),transparent 60%),#100a14' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 48, alignItems: 'center' }}>
        <div>
          <Headline accent="#d9a5ff" />
          <SearchBar btnBg="linear-gradient(90deg,#b45cff,#ff5c9e)" btnColor="#fff" border="rgba(217,165,255,.35)" max={460} />
          <LivePill />
          <Stats color="#d9a5ff" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 560 }}>
          <div style={{ display: 'grid', gap: 14 }}>
            {mc(PROFILES[0], '● PRIVÉ', 'linear-gradient(90deg,#b45cff,#7a4dff)', 280)}
            {mc(PROFILES[1], '● MASSAGE', 'linear-gradient(90deg,#ff5c9e,#e02d94)', 195)}
          </div>
          <div style={{ display: 'grid', gap: 14, marginTop: 34 }}>
            {mc(PROFILES[2], '● ESCORT', 'linear-gradient(90deg,#ff8a5c,#ff5c7a)', 195)}
            {mc(PROFILES[3], '● GFE', 'linear-gradient(90deg,#26d4a0,#0e9f8f)', 280)}
          </div>
        </div>
      </div>
    </section>
  )
}

function AppStyle() {
  const story = (img: string, c: string, href: string) => (
    <a key={img} href={href} style={{ width: 70, height: 70, borderRadius: '50%', padding: 3, background: c, display: 'inline-block', flexShrink: 0 }}>
      <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', background: `url(${img}) center 10%/cover`, border: '3px solid #14090f' }} />
    </a>
  )
  const cc = (p: typeof PROFILES[0], badge: string, badgec: string) => (
    <a key={p.name} href={p.href} style={{ minWidth: 200, borderRadius: 18, overflow: 'hidden', background: '#1d1018', boxShadow: '0 18px 44px rgba(0,0,0,.5)', textDecoration: 'none', flexShrink: 0 }}>
      <div style={{ position: 'relative', height: 235, background: `url('${p.img}') center 12%/cover` }}>
        <span style={{ position: 'absolute', top: 10, left: 10, background: badgec, borderRadius: 999, padding: '4px 11px', fontSize: 9.5, fontWeight: 600, color: '#fff' }}>{badge}</span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: serif, fontSize: 17, color: '#fff' }}>{p.name}</span>
        <span style={{ fontSize: 10.5, color: '#c99' }}>{p.city}</span>
      </div>
    </a>
  )
  const green = 'linear-gradient(140deg,#26d4a0,#0e9f8f)'
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(1.5rem,4vw,3.5rem) clamp(1rem,4vw,3.5rem)', background: 'radial-gradient(ellipse 70% 50% at 50% -10%,rgba(255,92,122,.18),transparent 60%),#14090f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, marginBottom: 30, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ fontSize: 12, letterSpacing: '.28em', color: '#ff8fa8', marginBottom: 14 }}>EU · DISCREET · VERIFIED</div>
          <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.12, color: '#fff', margin: 0 }}>
            Where the night begins <em style={{ fontStyle: 'italic', color: '#ff8fa8' }}>with someone discreet</em>
          </h1>
        </div>
        <Stats color="#ff8fa8" />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 26, overflowX: 'auto' }}>
        {story(PROFILES[0].img, green, PROFILES[0].href)}
        {story(PROFILES[1].img, 'linear-gradient(140deg,#ff5c7a,#ff2d78)', PROFILES[1].href)}
        {story(PROFILES[2].img, green, PROFILES[2].href)}
        {story(PROFILES[3].img, 'linear-gradient(140deg,#e8c97e,#c5883f)', PROFILES[3].href)}
        {story(PROFILES[4].img, 'linear-gradient(140deg,#b45cff,#7a4dff)', PROFILES[4].href)}
        <span style={{ fontSize: 12, color: '#c9a3b1', marginLeft: 6, whiteSpace: 'nowrap' }}><b style={{ color: '#26d4a0' }}>●</b> groen = nu beschikbaar</span>
      </div>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', marginBottom: 30, paddingBottom: 6 }}>
        {cc(PROFILES[0], '● NU BESCHIKBAAR', green)}
        {cc(PROFILES[1], '● NU BESCHIKBAAR', green)}
        {cc(PROFILES[2], '24/7', 'linear-gradient(90deg,#ff8a5c,#ff5c7a)')}
        {cc(PROFILES[3], 'GFE', 'linear-gradient(90deg,#b45cff,#7a4dff)')}
        {cc(PROFILES[4], 'PRIVÉ', 'linear-gradient(90deg,#e8c97e,#c5883f)')}
      </div>
      <SearchBar btnBg="linear-gradient(90deg,#ff5c7a,#ff2d78)" btnColor="#fff" border="rgba(255,143,168,.35)" max={2000} />
    </section>
  )
}

const THEMES: Array<{ id: string; name: string; dots: string[]; render: () => ReactNode }> = [
  { id: 'golden-aura',     name: 'Golden Aura',     dots: ['#e8c97e', '#8b2b3f'], render: () => <GoldenAura /> },
  { id: 'sunset-velvet',   name: 'Sunset Velvet',   dots: ['#ff8a5c', '#ff2d78'], render: () => <SunsetVelvet /> },
  { id: 'neon-nights',     name: 'Neon Nights',     dots: ['#ff5ccf', '#4ff0c8'], render: () => <NeonNights /> },
  { id: 'champagne-blush', name: 'Champagne Blush', dots: ['#ffd6aa', '#6e3a38'], render: () => <ChampagneBlush /> },
  { id: 'aurora-luxe',     name: 'Aurora Luxe',     dots: ['#e8c97e', '#2edfc0'], render: () => <AuroraLuxe /> },
  { id: 'cinematic',       name: 'Cinematic',       dots: ['#0b070f', '#e8c97e'], render: () => <Cinematic /> },
  { id: 'orbit',           name: 'Orbit',           dots: ['#ff8fb0', '#e8c97e'], render: () => <Orbit /> },
  { id: 'diagonal',        name: 'Diagonal',        dots: ['#e8c97e', '#ff5c8a'], render: () => <Diagonal /> },
  { id: 'mosaic',          name: 'Mosaic',          dots: ['#d9a5ff', '#ff5c9e'], render: () => <Mosaic /> },
  { id: 'app-style',       name: 'App-style',       dots: ['#ff8fa8', '#26d4a0'], render: () => <AppStyle /> },
]

export default function HeroThemes() {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)
  const [theme, setTheme] = useState<string>('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMountEl(document.getElementById('heroThemesMount'))
    try { setTheme(localStorage.getItem(LS_KEY) || '') } catch {}
  }, [])

  // Hide/show the built-in hero depending on selection
  useEffect(() => {
    const el = document.getElementById('editorialHero')
    if (el) el.style.display = theme ? 'none' : ''
    try { theme ? localStorage.setItem(LS_KEY, theme) : localStorage.removeItem(LS_KEY) } catch {}
  }, [theme])

  if (!mountEl) return null
  const active = THEMES.find(t => t.id === theme)

  const picker = (
      <div style={{ position: 'fixed', left: 18, bottom: 84, zIndex: 99999 }}>
        {open && (
          <div style={{ marginBottom: 10, background: 'rgba(14,10,16,0.97)', border: '0.5px solid rgba(197,160,90,0.35)', borderRadius: 16, padding: 10, width: 228, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', maxHeight: '60vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, letterSpacing: '.14em', color: 'rgba(197,160,90,0.7)', textTransform: 'uppercase', padding: '4px 8px 8px' }}>✨ Kies jouw look</div>
            <button onClick={() => { setTheme(''); setOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', background: theme === '' ? 'rgba(197,160,90,0.14)' : 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#ece8e1', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' }}>
              <span style={{ display: 'inline-flex' }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: '#c5a05a' }} /><span style={{ width: 14, height: 14, borderRadius: '50%', background: '#1a1024', marginLeft: -5 }} /></span>
              Klassiek {theme === '' && '✓'}
            </button>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { setTheme(t.id); setOpen(false); window.scrollTo({ top: 0 }) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', background: theme === t.id ? 'rgba(197,160,90,0.14)' : 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#ece8e1', fontSize: 13, fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ display: 'inline-flex' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.dots[0] }} />
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.dots[1], marginLeft: -5 }} />
                </span>
                {t.name} {theme === t.id && '✓'}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(o => !o)} aria-label="Kies jouw look" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,10,16,0.95)', border: '0.5px solid rgba(197,160,90,0.5)', borderRadius: 999, padding: '10px 16px', color: '#e8c97e', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: 'inherit' }}>
          🎨 {active ? active.name : 'Kies jouw look'}
        </button>
      </div>
  )

  return (
    <>
      {createPortal(<>{active?.render()}</>, mountEl)}
      {createPortal(picker, document.body)}
    </>
  )
}
