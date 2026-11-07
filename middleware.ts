import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CANONICAL_ORIGIN, SHOP_ORIGIN, isLegacyShopHost, isMirrorHost, isShopHost } from './app/lib/domains'

const PROTECTED_ROUTES = ['/dashboard', '/bookings', '/messages', '/profile', '/listings/create', '/verify', '/go-live']

/** Storefront paths that map onto an existing marketplace route. */
const SHOP_LEGAL_DOCS = ['terms', 'privacy', 'shipping', 'returns']

/**
 * Paths the storefront serves as-is. Anything outside this set is bounced to
 * the storefront home rather than rendering marketplace content on the .store
 * domain — the separation is the reason that domain exists, so it is enforced
 * here rather than left to whoever adds the next page.
 */
function shopPassthrough(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/reset-password' ||
    pathname === '/tokens' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/sso/')
  )
}

/** Public path -> internal route on the storefront, plus the canonical path. */
function shopRewrite(pathname: string): { to: string; canonical: string } | null {
  if (pathname === '/') return { to: '/shop', canonical: '/' }

  const product = pathname.match(/^\/p\/([^/]+)$/)
  if (product) return { to: `/shop/${product[1]}`, canonical: pathname }

  const doc = pathname.match(/^\/(\w+)$/)
  if (doc && SHOP_LEGAL_DOCS.includes(doc[1])) {
    return { to: `/shop/legal/${doc[1]}`, canonical: pathname }
  }

  return null
}

/** True when the request carries a Supabase session cookie (not proof it is valid). */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
}

/**
 * Where a marketplace /shop or /tokens path lives on the storefront, or null.
 * Payments are only ever taken on .store, so these pages no longer render on
 * the marketplace at all.
 */
function storeDestination(pathname: string): string | null {
  if (pathname === '/tokens') return '/tokens'
  if (pathname === '/shop') return '/'
  const legal = pathname.match(/^\/shop\/legal\/(\w+)$/)
  if (legal && SHOP_LEGAL_DOCS.includes(legal[1])) return `/${legal[1]}`
  const product = pathname.match(/^\/shop\/([^/]+)$/)
  if (product) return `/p/${product[1]}`
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host')

  // ---- Retired storefront domain (secretxperience.shop) -------------------
  if (isLegacyShopHost(host)) {
    return NextResponse.redirect(`${SHOP_ORIGIN}${pathname}${search}`, 308)
  }

  // ---- Storefront (secretxperience.store) ---------------------------------
  // The shop and the token wallet are the whole site here: / is the boutique,
  // products are /p/<id>, /tokens is the wallet, and the marketplace is not
  // reachable at all.
  if (isShopHost(host)) {
    const mapped = shopRewrite(pathname)

    if (mapped) {
      const url = request.nextUrl.clone()
      url.pathname = mapped.to
      const rewritten = NextResponse.rewrite(url)
      rewritten.headers.set('Link', `<${SHOP_ORIGIN}${mapped.canonical === '/' ? '/' : mapped.canonical}>; rel="canonical"`)
      return rewritten
    }

    if (shopPassthrough(pathname)) {
      const passed = NextResponse.next({ request: { headers: request.headers } })
      passed.headers.set('Link', `<${SHOP_ORIGIN}${pathname}>; rel="canonical"`)
      if (pathname !== '/tokens') return passed
      // The wallet needs a session on THIS domain; the generic gate below would
      // send a signed-out visitor to the marketplace-style flow, so gate here.
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
        { cookies: { getAll: () => request.cookies.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => passed.cookies.set(name, value, options)) } }
      )
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return NextResponse.redirect(new URL('/login?next=/tokens', request.url))
      return passed
    }

    // Marketplace route requested on the storefront domain — send them to the
    // boutique instead of serving escort content from secretxperience.store.
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ---- Shop + wallet live on the storefront ------------------------------
  // A signed-in visitor goes through the session bridge so they arrive on
  // .store already signed in; their wallet is the same row either way. A
  // signed-out visitor goes straight there (the shop is public; /tokens on
  // .store asks them to sign in).
  const storePath = storeDestination(pathname)
  if (storePath) {
    const target = `${SHOP_ORIGIN}${storePath}${search}`
    if (hasSessionCookie(request)) {
      const bridge = new URL('/sso/start', request.url)
      bridge.searchParams.set('return', target)
      return NextResponse.redirect(bridge)
    }
    return NextResponse.redirect(target)
  }

  const response = NextResponse.next({
    request: { headers: request.headers }
  })

  // ---- Canonicals on the marketplace domains ------------------------------
  // Everything on a mirror (.nl) points at its .eu twin.
  // Sent as an HTTP header rather than a <link> tag because ~60 of the 68 pages
  // set no metadata of their own (many are client components and cannot), so a
  // tag would have to be hand-added and re-added on every new page.
  // Query strings are dropped so tracking params can't fork the canonical URL.
  if (isMirrorHost(host)) {
    response.headers.set('Link', `<${CANONICAL_ORIGIN}${pathname}>; rel="canonical"`)
  }

  // ---- Auth gate ----------------------------------------------------------
  // The matcher spans all pages so the canonical headers above can be attached,
  // so bail out here before touching cookies or Supabase — public traffic must
  // not pay for a session lookup it never uses.
  if (!PROTECTED_ROUTES.some(route => pathname.startsWith(route))) return response

  // Use getSession() — reads the JWT from cookies locally, no Supabase network call.
  // getUser() would make a network request on every gated page load from the edge.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// Runs on every page request so the storefront can be routed and canonical
// headers attached. Skips API routes, Next internals and any path with a file
// extension (static assets) — none of those are indexable pages. The auth gate
// inside the handler still narrows itself to PROTECTED_ROUTES.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
