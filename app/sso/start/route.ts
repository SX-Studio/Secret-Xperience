import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isOwnHost } from '../../lib/domains'

/**
 * Cross-domain session bridge — the minting side.
 *
 * Cookies do not cross registrable domains, so a customer signed in on
 * secretxperience.eu arrives at secretxperience.shop signed out (and checkout
 * there requires a session). This route lets the domain that HAS the session
 * hand it to the one that doesn't:
 *
 *   GET /sso/start?return=https://secretxperience.shop/p/<id>
 *     1. verify the caller's session on this domain (getUser — a network
 *        check, not a local JWT parse, because this mints a login elsewhere)
 *     2. generate a single-use magic-link token for THAT user
 *     3. 302 to <return-origin>/sso/land#th=<token>&r=<path>
 *
 * The landing page on the other domain redeems the token with verifyOtp,
 * which sets that domain's cookies. The token travels in the URL FRAGMENT:
 * fragments are never sent to a server, never logged, and never leak via
 * Referer. It is single-use and short-lived, and it can only ever be minted
 * for the account that is already signed in here — there is no way to name
 * another user. `return` is restricted to our own hosts over https, so this
 * cannot be turned into an open redirect.
 *
 * Works in both directions: it reads whatever session the requesting host
 * holds, so the same route bridges .shop -> .eu as well.
 */
export const dynamic = 'force-dynamic'

function safeReturn(raw: string | null, requestOrigin: string): URL | null {
  if (!raw) return null
  let url: URL
  try { url = new URL(raw) } catch { return null }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) return null
  if (!isOwnHost(url.hostname)) return null
  if (url.origin === requestOrigin) return null // nothing to bridge
  return url
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const target = safeReturn(searchParams.get('return'), origin)
  if (!target) {
    return NextResponse.json({ error: 'return must be an https URL on one of our own domains' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Not signed in here either: log in on this domain first, then come back
    // through this route so the bridge completes. `next` is relative on purpose.
    const resume = `/sso/start?return=${encodeURIComponent(target.href)}`
    return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(resume)}`, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (!user.email) {
    return NextResponse.json({ error: 'This account has no email address and cannot be bridged.' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: user.email })
  const tokenHash = data?.properties?.hashed_token
  if (error || !tokenHash) {
    return NextResponse.json({ error: 'Could not start the sign-in handoff.' }, { status: 502 })
  }

  const land = new URL('/sso/land', target.origin)
  land.hash = `th=${encodeURIComponent(tokenHash)}&r=${encodeURIComponent(target.pathname + target.search)}`
  return NextResponse.redirect(land.toString(), { headers: { 'Cache-Control': 'no-store' } })
}
