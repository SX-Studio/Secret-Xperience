'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.location.pathname.startsWith('/controlekamer')) return
    if (!localStorage.getItem('sx_cookie_consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('sx_cookie_consent', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
      background: 'rgba(8,6,18,0.97)', backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '0.5px solid rgba(197,160,90,0.2)',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <p style={{ flex: 1, fontSize: '13px', color: 'rgba(236,232,225,0.55)', margin: 0, lineHeight: 1.5, minWidth: '200px' }}>
        We use essential cookies to keep the platform working.{' '}
        <a href="/cookies" style={{ color: '#c5a05a', textDecoration: 'none' }}>Cookie policy</a>
        {' '}·{' '}
        <a href="/privacy" style={{ color: '#c5a05a', textDecoration: 'none' }}>Privacy</a>
      </p>
      <button
        onClick={accept}
        style={{
          background: 'linear-gradient(135deg,#c5a05a,#a07840)',
          border: 'none', borderRadius: '8px',
          padding: '10px 24px', color: '#000',
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: '13px', letterSpacing: '0.05em',
          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        Accept & continue
      </button>
    </div>
  )
}
