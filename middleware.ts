import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers }
  })

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

  const protectedRoutes = ['/dashboard', '/bookings', '/messages', '/profile', '/listings/create', '/verify', '/tokens', '/go-live']
  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// Only run the auth gate on the protected routes themselves. Previously the
// matcher fired on every request (all public pages, API routes, sitemap, etc.),
// spinning up a Supabase client and parsing cookies on traffic that never needed
// it — pure edge latency. Keep this list in sync with `protectedRoutes` above.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bookings/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/listings/create/:path*',
    '/verify/:path*',
    '/tokens/:path*',
    '/go-live/:path*',
  ]
}
