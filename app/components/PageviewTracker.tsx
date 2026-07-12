'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Fires a privacy-first pageview beacon on every route change. Cookieless:
// the per-session id lives in sessionStorage (cleared when the tab closes) and
// is a random value not tied to any account. Sends pathname only + referrer;
// the server drops query strings and keeps referrer host + coarse country only.
function sessionId(): string {
  try {
    let s = sessionStorage.getItem('sx_sid')
    if (!s) {
      s = (crypto?.randomUUID?.() || String(Math.random()).slice(2)) as string
      sessionStorage.setItem('sx_sid', s)
    }
    return s
  } catch {
    return ''
  }
}

export default function PageviewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const payload = JSON.stringify({
        path: pathname,
        referrer: document.referrer || '',
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        sid: sessionId(),
      })

      // Prefer sendBeacon (survives navigation); fall back to keepalive fetch.
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
      } else {
        fetch('/api/track', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
      }
    } catch { /* never break the page over analytics */ }
  }, [pathname])

  return null
}
