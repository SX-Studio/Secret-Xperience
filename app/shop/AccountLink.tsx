'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

/**
 * Sign-in / signed-in control for the standalone storefront.
 *
 * Signed out, it goes to /login ON THIS DOMAIN. It must not send the visitor
 * to the marketplace's login: that would be a visible route from the
 * storefront into the adult site, which the storefront exists to avoid. The
 * same Supabase account works on both domains, so signing in here IS the
 * shared account. The seamless bridge (/sso/start) is for the other
 * direction — a customer already signed in on the marketplace being handed
 * across — and is triggered from that side, where linking to .eu is fine.
 *
 * Signed in, it shows the account and a sign-out. It deliberately does NOT
 * link to the marketplace dashboard, for the same reason. A shop-scoped
 * orders page is the right home for an account link when it exists.
 */
export default function AccountLink() {
  const [email, setEmail] = useState<string | null | undefined>(undefined) // undefined = not yet known

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Render nothing until the session is known so server and client markup match.
  if (email === undefined) return <span style={{ width: 52, display: 'inline-block' }} />

  if (!email) {
    const next = window.location.pathname + window.location.search
    return <a href={`/login?next=${encodeURIComponent(next)}`} style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Sign in</a>
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '13px', color: 'var(--t3)' }}>
      <span title={email} style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
      <button
        onClick={async () => { await createClient().auth.signOut(); window.location.reload() }}
        style={{ background: 'none', border: '0.5px solid var(--b)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
      >
        Sign out
      </button>
    </span>
  )
}
