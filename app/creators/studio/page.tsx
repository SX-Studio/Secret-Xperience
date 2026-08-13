'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

// The Creator Studio dashboard is a self-contained document (its own theme engine
// writes CSS variables onto <html>). It's served verbatim from /creator-studio.html
// and mounted full-viewport in an isolating iframe so its light theme never leaks
// into the velvet-themed rest of the site. This route only adds the auth gate.
export default function CreatorStudio() {
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login?next=/creators/studio'; return }
      setAuthChecked(true)
    })()
  }, [])

  if (!authChecked) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)' }}>
        Loading…
      </div>
    )
  }

  return (
    <iframe
      src="/creator-studio.html"
      title="Creator Studio"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none', background: '#f6f6f7' }}
    />
  )
}
