'use client'
import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ *
 * CollabsPromo — COLLABS partner block on the /creators frontpage.
 * Both cells play the looping COLLABS promo video
 * (/promos/collabs-promo.mp4), autoplaying muted and repeating
 * forever. Left is the wide hero, right is a narrow companion.
 * Both link out to collabs-photography.com (external affiliate →
 * nofollow + sponsored).
 * ------------------------------------------------------------------ */

const HREF = 'https://www.collabs-photography.com/'
const VIDEO_FLASH = '/promos/collabs-promo-3s.mp4'       // 3s logo flash — left hero cell
const VIDEO_PROMO = '/promos/collabs-promo-original.mp4' // original fashion promo — right cell

export default function CollabsPromo() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const vids = Array.from(el.querySelectorAll('video'))
    const play = () => vids.forEach((v) => { v.muted = true; v.play().catch(() => {}) })
    play()
    // resume if the browser paused any of them (tab switch, etc.)
    vids.forEach((v) => v.addEventListener('canplay', play))
    return () => vids.forEach((v) => v.removeEventListener('canplay', play))
  }, [])

  return (
    <section
      ref={root}
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

      {/* LEFT — COLLABS animated promo (wide hero) */}
      <a href={HREF} target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="COLLABS — Fashion Photography"
         className="cp-cell cp-banner" style={{ background: '#000' }}>
        <video
          className="cp-media"
          src={VIDEO_FLASH}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 1 }}
        />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(180deg,rgba(0,0,0,0.28),transparent 28%,transparent 68%,rgba(0,0,0,0.42))', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', bottom: '12px', right: '14px', zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(8,6,18,0.55)', border: '0.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: '#f4f1ea', fontSize: '11px', fontWeight: 600 }}>
          Visit COLLABS <i className="ti ti-arrow-up-right" />
        </span>
      </a>

      {/* RIGHT — looping promo video (narrow companion) */}
      <a href={HREF} target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="COLLABS promo video — visit collabs-photography.com"
         className="cp-cell cp-video" style={{ background: '#000' }}>
        <video
          className="cp-media"
          src={VIDEO_PROMO}
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
