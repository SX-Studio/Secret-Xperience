'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

/**
 * Cross-domain session bridge — the receiving side. See app/sso/start/route.ts.
 *
 * Reads the single-use token from the URL fragment, scrubs it from history
 * immediately, redeems it with verifyOtp (which writes this domain's session
 * cookies), then continues to the path the user was heading for. The resume
 * path is relative-only; '//' is refused because the browser would treat it
 * as protocol-relative and leave the site.
 */
export default function SsoLand() {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const tokenHash = params.get('th')
    const rawResume = params.get('r') || '/'
    const resume = rawResume.startsWith('/') && !rawResume.startsWith('//') ? rawResume : '/'

    // The token must not survive in history or be re-sent on reload.
    window.history.replaceState(null, '', window.location.pathname)

    if (!tokenHash) { window.location.replace('/'); return }

    ;(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
      if (error) { setFailed(true); return }
      window.location.replace(resume)
    })()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', color: 'var(--t)', fontFamily: 'var(--sans)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        {failed ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 10 }}>That sign-in link has expired</div>
            <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 18 }}>Bridge links are single-use and only valid for a short time. Sign in again to continue.</p>
            <a href="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 14 }}>Go to sign in →</a>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 10 }}>Signing you in…</div>
            <p style={{ fontSize: 14, color: 'var(--t2)' }}>One moment.</p>
          </>
        )}
      </div>
    </div>
  )
}
