import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CANONICAL_ORIGIN, isMirrorHost } from './app/lib/domains'

const PROTECTED_ROUTES = ['/dashboard', '/bookings', '/messages', '/profile', '/listings/create', '/verify', '/tokens', '/go-live']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next({
    request: { headers: request.headers }
  })

  // Mirror domains (secretxperience.nl) serve the identical platform. Point
  // crawlers at the .eu twin so the two domains don't compete as duplicates.
  // Sent as an HTTP header rather than a <link> tag because ~60 of the 68 pages
  // set no metadata of their own (many are client components and cannot), so a
  // per-page tag would have to be added by hand and re-added on every new page.
  // The Link header covers every route, present and future, in one place.
  // Query strings are dropped on purpose — tracking params must not fork the
  // canonical URL.
  if (isMirrorHost(request.headers.get('host'))) {
    response.headers.set('Link', `<${CANONICAL_ORIGIN}${pathname}>; rel="canonical"`)
  }

  // Everything below is the auth gate, and it only concerns the protected
  // routes. The matcher now spans all pages so the canonical header above can
  // be attached, so bail out here before touching cookies or Supabase — public
  // traffic must not pay for a session lookup it never uses.
  if (!PROTECTED_ROUTES.some(route => pathname.startsWith(route))) return response

  // Use getSession() — reads the JWT from cookies locally, no Supabase network call.
  // getUser() makes a network request using the publishable key, which is origin-restricted
  // and crashes the middleware from Vercel's edge runtime (no Origin header → "Host not in allowlist").
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

// Runs on every page request so mirror domains get their canonical header, but
// skips API routes, Next internals and any path with a file extension (static
// assets) — none of those are indexable pages. The auth gate inside the handler
// still narrows itself to PROTECTED_ROUTES.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
