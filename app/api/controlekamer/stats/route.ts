import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyGrant, GRANT_COOKIE } from '../../../lib/controlekamer'

export const dynamic = 'force-dynamic'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Aggregate-only counts for the control-room dashboard. Grant-gated; no PII leaves here.
export async function GET() {
  const grant = verifyGrant(cookies().get(GRANT_COOKIE)?.value)
  if (!grant) return NextResponse.json({ error: 'locked' }, { status: 401 })

  const db = admin()
  const head = () => ({ count: 'exact' as const, head: true })
  const safe = (p: PromiseLike<{ count: number | null }>) =>
    Promise.resolve(p).then(r => r.count ?? 0).catch(() => 0)

  const [listings, pending, users, providers, openReports, pendingVerif, subs] = await Promise.all([
    safe(db.from('listings').select('*', head())),
    safe(db.from('listings').select('*', head()).eq('active', false)),
    safe(db.from('profiles').select('*', head())),
    safe(db.from('profiles').select('*', head()).in('role', ['provider', 'venue', 'creator'])),
    safe(db.from('reports').select('*', head()).eq('status', 'open')),
    safe(db.from('identity_verifications').select('*', head()).eq('status', 'pending')),
    safe(db.from('newsletter_subscribers').select('*', head())),
  ])

  return NextResponse.json({
    listings, pendingListings: pending, users, advertisers: providers,
    openReports, pendingVerifications: pendingVerif, subscribers: subs,
    generatedAt: new Date().toISOString(),
  })
}
