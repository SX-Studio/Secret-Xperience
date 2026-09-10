'use client'

import { useEffect } from 'react'
import { isOwnHost } from '../lib/domains'

// First-touch attribution. On the first landing that carries UTM params (or an
// external referrer), capture them into a cookie + localStorage and never
// overwrite. The signup route reads the cookie to record which directory / ad
// network drove the signup.
const COOKIE = 'sx_attribution'
const LS = 'sx_attribution'

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

export default function AttributionTracker() {
  useEffect(() => {
    try {
      // First-touch wins — don't overwrite an existing capture.
      if (readCookie(COOKIE) || localStorage.getItem(LS)) return

      const params = new URLSearchParams(window.location.search)
      const utm_source = params.get('utm_source') || ''
      const utm_medium = params.get('utm_medium') || ''
      const utm_campaign = params.get('utm_campaign') || ''
      const utm_term = params.get('utm_term') || ''
      const utm_content = params.get('utm_content') || ''

      const referrer = document.referrer || ''
      let externalReferrer = ''
      if (referrer) {
        try {
          const host = new URL(referrer).hostname
          if (host && !isOwnHost(host)) externalReferrer = referrer
        } catch { /* ignore malformed referrer */ }
      }

      // Nothing worth attributing — skip so direct/internal visits stay empty.
      if (!utm_source && !externalReferrer) return

      const payload = {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        landing_page: window.location.pathname + window.location.search,
        referrer: externalReferrer,
      }

      const value = encodeURIComponent(JSON.stringify(payload))
      const maxAge = 60 * 60 * 24 * 30 // 30 days
      document.cookie = `${COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
      localStorage.setItem(LS, JSON.stringify(payload))
    } catch { /* never break the page over analytics */ }
  }, [])

  return null
}
