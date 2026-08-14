'use client'
import { useEffect, useState } from 'react'

// First-visit welcome modal: asks whether the visitor is here to browse (Member)
// or to advertise (Creator). The creator choice sends them to /advertise#pricing.
// Shows once, then remembers the choice in localStorage.
const KEY = 'sx_welcome_choice'
// Paths where the modal shouldn't interrupt (onboarding / auth / dashboards).
const SKIP = ['/advertise', '/login', '/admin', '/creators/studio']

export default function WelcomeChoice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return
      const path = window.location.pathname
      if (SKIP.some((p) => path === p || path.startsWith(p + '/'))) return
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    } catch { /* ignore */ }
  }, [])

  function choose(kind: 'member' | 'creator') {
    try { localStorage.setItem(KEY, kind) } catch { /* ignore */ }
    setOpen(false)
    if (kind === 'creator') window.location.href = '/advertise#pricing'
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose how to continue"
      onClick={() => choose('member')}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(6,4,12,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        fontFamily: "'Poppins', sans-serif", animation: 'sxwc-fade .25s ease',
      }}
    >
      <style>{`
        @keyframes sxwc-fade{from{opacity:0}to{opacity:1}}
        @keyframes sxwc-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .sxwc-card{animation:sxwc-rise .32s cubic-bezier(.2,.7,.2,1)}
        .sxwc-opt{text-align:left;cursor:pointer;border-radius:16px;padding:22px 20px;display:flex;flex-direction:column;gap:8px;transition:transform .15s ease,border-color .15s ease,background .15s ease}
        .sxwc-opt:hover{transform:translateY(-3px)}
        .sxwc-opt .ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px}
        .sxwc-opt .ti{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;color:#f3efe7}
        .sxwc-opt .ds{font-size:12.5px;line-height:1.5;color:rgba(236,232,225,0.6)}
        .sxwc-opt .go{margin-top:6px;font-size:12px;font-weight:600;letter-spacing:.02em;display:inline-flex;align-items:center;gap:6px}
        @media(max-width:560px){.sxwc-grid{grid-template-columns:1fr !important}}
        @media(prefers-reduced-motion:reduce){.sxwc-card,.sxwc-opt{animation:none;transition:none}}
      `}</style>

      <div
        className="sxwc-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px,100%)', background: 'linear-gradient(180deg,#141021,#0c0913)',
          border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '22px',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)', padding: 'clamp(24px,4vw,40px)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => choose('member')}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%', border: '0.5px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: 'rgba(236,232,225,0.7)', cursor: 'pointer', fontSize: 16 }}
        >✕</button>

        <div style={{ textAlign: 'center', marginBottom: 'clamp(20px,3vw,28px)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c5a05a', marginBottom: 10 }}>Welcome to</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,4.5vw,38px)', fontWeight: 400, color: '#f3efe7', lineHeight: 1.1 }}>
            Secret<em style={{ fontStyle: 'italic', color: '#c5a05a' }}>Xperience</em>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(236,232,225,0.6)', margin: '10px auto 0', maxWidth: 420, lineHeight: 1.6 }}>
            How would you like to continue? You can change your mind anytime.
          </p>
        </div>

        <div className="sxwc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Visitor / Member */}
          <button
            className="sxwc-opt"
            onClick={() => choose('member')}
            style={{ border: '0.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="ic" style={{ background: 'rgba(197,160,90,0.14)', color: '#e0c082' }}>🔎</span>
            <span className="ti">Visitor</span>
            <span className="ds">Browse verified advertisers, follow creators, and subscribe as a member.</span>
            <span className="go" style={{ color: '#e0c082' }}>Continue browsing →</span>
          </button>

          {/* Gebruiker / Creator */}
          <button
            className="sxwc-opt"
            onClick={() => choose('creator')}
            style={{ border: '0.5px solid rgba(197,160,90,0.5)', background: 'linear-gradient(160deg,rgba(197,160,90,0.16),rgba(197,160,90,0.05))' }}
          >
            <span className="ic" style={{ background: 'rgba(197,160,90,0.28)', color: '#f0d79f' }}>✦</span>
            <span className="ti">Creator</span>
            <span className="ds">Advertise your services, build a profile, and earn from subscriptions & gifts.</span>
            <span className="go" style={{ color: '#f0d79f' }}>See creator plans →</span>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(236,232,225,0.4)', margin: '18px 0 0' }}>
          You must be 18+ to use SecretXperience.
        </p>
      </div>
    </div>
  )
}
