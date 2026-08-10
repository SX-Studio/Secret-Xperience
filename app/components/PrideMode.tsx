'use client'

import { useEffect, useState } from 'react'

// Site-wide "Pride mode" — a floating toggle that drapes the whole site in a
// rainbow ribbon and spectral accents. Persisted in localStorage and applied
// pre-paint by the theme bootstrap in layout.tsx (class `pride-mode` on <html>),
// so this component only owns the button + the live toggle.
export default function PrideMode() {
  const [on, setOn] = useState(false)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    setOn(document.documentElement.classList.contains('pride-mode'))
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    document.documentElement.classList.toggle('pride-mode', next)
    try { localStorage.prideMode = next ? 'on' : 'off' } catch {}
    if (next) { setBurst(true); setTimeout(() => setBurst(false), 1100) }
  }

  return (
    <>
      <button
        onClick={toggle}
        aria-pressed={on}
        title={on ? 'Turn Pride mode off' : 'Turn Pride mode on'}
        style={{
          position: 'fixed', left: 16, bottom: 16, zIndex: 9000,
          height: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: on ? '1.5px solid transparent' : '1px solid rgba(255,255,255,0.18)',
          background: on
            ? 'linear-gradient(90deg,#e0507a,#e6a15a,#e6c07a,#3fd0c4,#6b8be0,#b96bd8)'
            : 'rgba(12,10,20,0.72)',
          color: on ? '#0a0710' : 'rgba(236,232,225,0.85)',
          font: '700 12.5px/1 Poppins, sans-serif', letterSpacing: '.02em',
          backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          transition: 'transform .15s ease',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>🏳️‍🌈</span>
        {on ? 'Pride ON' : 'Pride mode'}
      </button>

      {burst && (
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 8999, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const colors = ['#e0507a', '#e6a15a', '#e6c07a', '#3fd0c4', '#6b8be0', '#b96bd8']
            const left = Math.random() * 100
            const delay = Math.random() * 0.25
            const dur = 0.8 + Math.random() * 0.5
            const size = 7 + Math.random() * 8
            return (
              <span key={i} style={{
                position: 'absolute', top: '-16px', left: `${left}%`, width: size, height: size,
                background: colors[i % colors.length], borderRadius: i % 2 ? '50%' : '2px',
                animation: `prideFall ${dur}s ${delay}s cubic-bezier(.4,.2,.4,1) forwards`,
              }} />
            )
          })}
          <style>{`@keyframes prideFall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}`}</style>
        </div>
      )}
    </>
  )
}
