'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// AI Angels affiliate banner (FirstPromoter ref `fpr=secretxperience`).
// Imagery is AI Angels' own character art, self-hosted in /public/aiangels so
// the banner does not depend on their storage URLs. Copy quotes their own
// description, so it promises nothing they don't.
const HREF = 'https://www.aiangels.io/?fpr=secretxperience'
const PINK = '#ff6b9d'

export default function AIAngelsBanner({ portalTo }: { portalTo?: string }) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (portalTo) setMountEl(document.getElementById(portalTo))
  }, [portalTo])

  const banner = (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      aria-label="AI Angels — chat free with 560+ AI girlfriends"
      className="aia-banner"
      style={{
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', alignItems: 'center', gap: 'clamp(1rem,3vw,2rem)',
        position: 'relative', overflow: 'hidden', textDecoration: 'none', color: 'inherit',
        borderRadius: 20, border: `0.5px solid ${PINK}55`,
        background: `radial-gradient(ellipse at 80% 30%, ${PINK}33 0%, transparent 55%), linear-gradient(120deg,#12070f 0%,#1d0a19 55%,#120812 100%)`,
        boxShadow: '0 16px 50px rgba(0,0,0,.5)',
        padding: 'clamp(1.25rem,3.5vw,2.25rem)',
      }}
    >
      <style>{`
        .aia-banner{transition:transform .25s ease,border-color .2s ease}
        .aia-banner:hover{transform:translateY(-3px);border-color:${PINK}aa!important}
        .aia-banner:hover .aia-cta{filter:brightness(1.08)}
        .aia-media{display:grid;grid-template-columns:1.15fr 1fr;grid-template-rows:1fr 1fr;gap:10px;height:300px}
        .aia-media > *{border-radius:14px;overflow:hidden;border:0.5px solid rgba(255,255,255,.12);background:#1a0f18}
        .aia-media img,.aia-media video{width:100%;height:100%;object-fit:cover;display:block}
        .aia-media .aia-vid{grid-row:1 / span 2}
        @media(max-width:760px){
          .aia-banner{grid-template-columns:1fr!important}
          .aia-media{height:230px}
        }
        @media(prefers-reduced-motion:reduce){.aia-banner{transition:none}}
      `}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ffc2d6', background: `${PINK}1f`, border: `0.5px solid ${PINK}66`, padding: '5px 12px', borderRadius: 20, marginBottom: 14 }}>
          ✦ Partner · AI companions
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 'clamp(30px,4vw,46px)', fontWeight: 500, lineHeight: 1.04, color: '#fbeef3', margin: '0 0 10px' }}>
          Create your dream{' '}
          <em style={{ fontStyle: 'italic', color: PINK }}>AI girlfriend</em>
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(251,238,243,.72)', margin: '0 0 20px', maxWidth: 440 }}>
          Sweet, flirty &amp; a little naughty. Chat free with 560+ AI girlfriends who send photos &amp; videos. No credit card needed.
        </p>
        <span className="aia-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 30, background: `linear-gradient(135deg, ${PINK}, #c2417a)`, color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: `0 8px 26px ${PINK}55` }}>
          Meet your AI Angel <i className="ti ti-arrow-right" />
        </span>
        <div style={{ fontSize: 10.5, color: 'rgba(251,238,243,.4)', marginTop: 12 }}>
          Partner · aiangels.io · opens in a new tab · 18+
        </div>
      </div>

      <div className="aia-media" aria-hidden="true">
        <div className="aia-vid">
          <video src="/aiangels/loop.mp4" poster="/aiangels/loop-poster.webp" autoPlay muted loop playsInline preload="metadata" />
        </div>
        <div><img src="/aiangels/a1.webp" alt="" loading="lazy" /></div>
        <div><img src="/aiangels/a2.webp" alt="" loading="lazy" /></div>
      </div>
    </a>
  )

  if (!portalTo) return banner
  if (!mountEl) return null
  return createPortal(
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 1.5rem' }}>{banner}</div>,
    mountEl,
  )
}
