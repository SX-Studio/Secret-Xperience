'use client'
import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ *
 * CollabsPromo — COLLABS partner block on the /creators frontpage.
 * Left: the COLLABS banner (image /promos/collabs.jpg, wordmark
 * fallback). Right: a looping promo video (/promos/collabs-promo.mp4)
 * that autoplays muted and repeats forever. Both link out to
 * collabs-photography.com (external affiliate → nofollow + sponsored).
 * ------------------------------------------------------------------ */

const HREF = 'https://www.collabs-photography.com/'

export default function CollabsPromo() {
  const vid = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = vid.current
    if (!v) return
    v.muted = true // ensure muted so autoplay is allowed
    const tryPlay = () => { v.play().catch(() => {}) }
    tryPlay()
    // resume if the browser paused it (tab switch, etc.)
    v.addEventListener('canplay', tryPlay)
    return () => v.removeEventListener('canplay', tryPlay)
  }, [])

  return (
    <section
      className="collabs-promo"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.55fr minmax(190px, 300px)',
        gap: '16px',
        alignItems: 'stretch',
        height: 'clamp(300px, 34vw, 420px)',
      }}
    >
      <style>{`
        .collabs-promo a { text-decoration: none; color: inherit; }
        .cp-cell { position: relative; overflow: hidden; border-radius: 16px; border: 0.5px solid var(--b2); box-shadow: 0 14px 44px rgba(0,0,0,0.5); display: block; height: 100%; transition: transform .25s ease, border-color .2s ease; }
        .cp-cell:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.25); }
        .cp-cell:hover .cp-media { transform: scale(1.04); }
        .cp-media { transition: transform .5s ease; }
        @media (max-width: 760px) {
          .collabs-promo { grid-template-columns: 1fr !important; height: auto !important; }
          .cp-banner { aspect-ratio: 970 / 260; height: auto !important; }
          .cp-video { height: 60vh; max-height: 520px; }
        }
      `}</style>

      {/* LEFT — COLLABS banner (image with wordmark fallback) */}
      <a href={HREF} target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="COLLABS — Fashion Photography"
         className="cp-cell cp-banner" style={{ background: 'linear-gradient(120deg,#0c1a1c 0%,#123033 45%,#0a1416 100%)' }}>
        <div className="cp-media" style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'url(/promos/collabs.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {/* fallback wordmark (revealed only if the photo file is missing) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%,rgba(64,140,140,0.35),transparent 60%)' }} />
          <div style={{ position: 'relative', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(2.6rem,8vw,5rem)', letterSpacing: '0.06em', color: '#f4f1ea', lineHeight: 1, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>COLLABS</div>
          <div style={{ position: 'relative', marginTop: '0.6rem', fontSize: 'clamp(0.65rem,1.6vw,1rem)', letterSpacing: '0.42em', textTransform: 'uppercase', color: '#cfe3e0', fontWeight: 500 }}>Fashion&nbsp;Photography</div>
        </div>
        <span style={{ position: 'absolute', bottom: '12px', right: '14px', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(8,6,18,0.55)', border: '0.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: '#f4f1ea', fontSize: '11px', fontWeight: 600 }}>
          Visit COLLABS <i className="ti ti-arrow-up-right" />
        </span>
      </a>

      {/* RIGHT — looping promo video */}
      <a href={HREF} target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="COLLABS promo video — visit collabs-photography.com"
         className="cp-cell cp-video" style={{ background: '#000' }}>
        <video
          ref={vid}
          className="cp-media"
          src="/promos/collabs-promo.mp4"
          poster="/promos/collabs.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 1 }}
        />
        {/* gentle top gradient + label */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(180deg,rgba(0,0,0,0.35),transparent 25%,transparent 70%,rgba(0,0,0,0.45))', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 11px', borderRadius: '20px', background: 'rgba(8,6,18,0.5)', border: '0.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: '#f4f1ea', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <i className="ti ti-player-play-filled" /> Promo
        </span>
      </a>
    </section>
  )
}
