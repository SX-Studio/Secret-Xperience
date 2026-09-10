import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const roleParam = searchParams.get('role') || 'user'
  const allowedRoles = ['user', 'provider', 'venue', 'creator']
  const oauthRole = allowedRoles.includes(roleParam) ? roleParam : 'user'
  // Use request origin so OAuth works on preview deployments, not just production
  const siteUrl = origin
  // Where to resume after login. Relative only, and '//' rejected — that form
  // is protocol-relative and would send the user off-site.
  const nextParam = searchParams.get('next')
  const resumeAt = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null

  if (code) {
    const cookieStore = cookies()
    // Redirect target determined after we know if the user is new.
    // Default to dashboard; updated below for new advertiser-role signups.
    const response = NextResponse.redirect(`${siteUrl}/dashboard`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync email to profiles; set role for new OAuth signups.
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const createdAtMs = user.created_at ? new Date(user.created_at).getTime() : 0
        const isNew = createdAtMs > 0 && (Date.now() - createdAtMs < 5 * 60 * 1000)
        const emailUpdate: Record<string, unknown> = { email: user.email }
        if (isNew && oauthRole !== 'user') emailUpdate.role = oauthRole
        await supabase
          .from('profiles')
          .update(emailUpdate)
          .eq('id', user.id)
          .is('email', null)  // only update if not already set (i.e. new user)
        if (resumeAt) {
          // An explicit resume target (the session bridge) beats onboarding.
          response.headers.set('Location', `${siteUrl}${resumeAt}`)
        } else if (isNew && ['provider', 'venue', 'creator'].includes(oauthRole)) {
          response.headers.set('Location', `${siteUrl}/listings/create`)
        }
      }

      // Signup attribution for OAuth signups (mirrors the email/password route).
      // Only record for brand-new users, once, when a first-touch cookie exists.
      try {
        const raw = cookieStore.get('sx_attribution')?.value
        if (user && raw) {
          const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0
          const isNewSignup = createdAt > 0 && (Date.now() - createdAt < 5 * 60 * 1000)
          if (isNewSignup) {
            const admin = createAdminClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              { auth: { autoRefreshToken: false, persistSession: false } }
            )
            const { data: existing } = await admin
              .from('signup_sources')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle()
            if (!existing) {
              const a = JSON.parse(decodeURIComponent(raw))
              await admin.from('signup_sources').insert({
                user_id: user.id,
                email: user.email?.toLowerCase() || null,
                utm_source: a.utm_source || null,
                utm_medium: a.utm_medium || null,
                utm_campaign: a.utm_campaign || null,
                utm_term: a.utm_term || null,
                utm_content: a.utm_content || null,
                landing_page: a.landing_page || null,
                referrer: a.referrer || null,
              })
            }
          }
        }
      } catch { /* never block login on attribution */ }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}