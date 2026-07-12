import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// First-party pageview beacon. Privacy-first by design:
//  - stores the pathname only (query string dropped — never captures tokens/PII in URLs)
//  - stores the external referrer HOST only, not the full URL
//  - coarse country from the edge header, never the raw IP
//  - a random per-session id supplied by the client (not linked to any account)
// No cookies. Data stays in Supabase. Best-effort: never blocks or errors the page.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const clean = (v: unknown, max = 200): string | null => {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s || null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    // pathname only — strip any query string / fragment defensively
    const rawPath = clean(body.path, 300) || '/'
    const path = rawPath.split('?')[0].split('#')[0] || '/'

    // referrer → host only, and only if external
    let referrer_host: string | null = null
    const ref = clean(body.referrer, 300)
    if (ref) {
      try {
        const host = new URL(ref).hostname
        if (host && !host.endsWith('secretxperience.eu')) referrer_host = host.slice(0, 120)
      } catch { /* ignore malformed referrer */ }
    }

    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      null

    await admin.from('page_events').insert({
      path,
      referrer_host,
      utm_source: clean(body.utm_source, 120),
      utm_medium: clean(body.utm_medium, 120),
      utm_campaign: clean(body.utm_campaign, 120),
      session_id: clean(body.sid, 64),
      country: country ? country.slice(0, 4) : null,
    })
  } catch { /* analytics must never break the page */ }

  // Always 204 — the client fires this fire-and-forget.
  return new NextResponse(null, { status: 204 })
}
