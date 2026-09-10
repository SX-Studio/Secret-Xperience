import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CANONICAL_ORIGIN, SHOP_ORIGIN, isMirrorHost, isShopHost } from './app/lib/domains'

const PROTECTED_ROUTES = ['/dashboard', '/bookings', '/messages', '/profile', '/listings/create', '/verify', '/tokens', '/go-live']

/** Storefront paths that map onto an existing marketplace route. */
const SHOP_LEGAL_DOCS = ['terms', 'privacy', 'shipping', 'returns']

/**
 * Paths the storefront serves as-is. Anything outside this set is bounced to
 * the storefront home rather than rendering marketplace content on the .shop
 * domain — the separation is the reason that domain exists, so it is enforced
 * here rather than left to whoever adds the next page.
 */
function shopPassthrough(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/reset-password' ||
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')

  // ---- Storefront (secretxperience.shop) ----------------------------------
  // The shop is the whole site here: / is the boutique, products are /p/<id>,
  // and the marketplace is not reachable at all.
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
      return passed
    }

    // Marketplace route requested on the storefront domain — send them to the
    // boutique instead of serving escort content from secretxperience.shop.
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next({
    request: { headers: request.headers }
  })

  // ---- Canonicals on the marketplace domains ------------------------------
  // Shop content is canonical on the storefront, so /shop here points there.
  // Everything else on a mirror (.nl) points at its .eu twin.
  // Sent as an HTTP header rather than a <link> tag because ~60 of the 68 pages
  // set no metadata of their own (many are client components and cannot), so a
  // tag would have to be hand-added and re-added on every new page.
  // Query strings are dropped so tracking params can't fork the canonical URL.
  const productOnMarketplace = pathname.match(/^\/shop\/([^/]+)$/)
  if (pathname === '/shop') {
    response.headers.set('Link', `<${SHOP_ORIGIN}/>; rel="canonical"`)
  } else if (productOnMarketplace) {
    response.headers.set('Link', `<${SHOP_ORIGIN}/p/${productOnMarketplace[1]}>; rel="canonical"`)
  } else if (isMirrorHost(host)) {
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
