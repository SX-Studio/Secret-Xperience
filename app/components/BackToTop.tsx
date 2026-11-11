'use client'

import { useEffect, useState } from 'react'

// Small floating "back to top" button. Sits just above the Pride-mode
// pill in the bottom-left corner (Pride mode is at bottom:92, so this
// sits at bottom:152). Only appears after the visitor has scrolled down
// far enough that it becomes useful.
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      style={{
        position: 'fixed',
        left: 16,
        bottom: 152,
        zIndex: 9000,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'rgba(12,10,20,0.85)',
        border: '2px solid #ef4444',
        color: '#ef4444',
        cursor: 'pointer',
        display: visible ? 'inline-flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        transition: 'transform .15s ease, background .2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(12,10,20,0.85)' }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <i className="ti ti-arrow-up" aria-hidden="true" />
    </button>
  )
}
