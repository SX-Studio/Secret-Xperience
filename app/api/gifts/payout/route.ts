import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Request a cash-out of earned gift value (min EUR 10). Fulfilled manually by admin.
export async function POST(_req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Please log in' }, { status: 401 })

  const { data, error } = await supabase.rpc('request_gift_payout')
  if (error) {
    const m = error.message || 'Could not request payout'
    return NextResponse.json({ error: /minimum/i.test(m) ? 'You need at least €10 in earnings to cash out' : m }, { status: 400 })
  }
  return NextResponse.json(data ?? { ok: true })
}
