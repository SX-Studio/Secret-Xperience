import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Tip the performer of a live show. POST { streamId, amount, message? }
 *
 * The only thing tokens are spent on. tip_live_stream() debits the wallet,
 * writes the ledger, records the performer's earning in live_tips and posts
 * the tip into the chat in one transaction.
 */
const TIP_AMOUNTS = [10, 25, 50, 100, 250]

const ERRORS: Record<string, { status: number; error: string }> = {
  insufficient_tokens: { status: 402, error: 'Not enough tokens.' },
  stream_ended:        { status: 410, error: 'This show has ended.' },
  stream_not_found:    { status: 404, error: 'Show not found.' },
  self_tip:            { status: 400, error: 'You cannot tip your own show.' },
  invalid_amount:      { status: 400, error: 'Invalid tip amount.' },
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { streamId, amount, message } = await req.json().catch(() => ({}))
  if (!streamId || !TIP_AMOUNTS.includes(amount)) {
    return NextResponse.json({ error: 'Invalid tip amount.' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: profile } = await admin.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle()

  const { data: balance, error } = await admin.rpc('tip_live_stream', {
    p_viewer: user.id,
    p_stream: streamId,
    p_amount: amount,
    p_username: profile?.full_name || profile?.username || 'Guest',
    p_message: typeof message === 'string' ? message : '',
  })
  if (error) {
    const known = ERRORS[error.message]
    if (known) return NextResponse.json({ error: known.error }, { status: known.status })
    console.error('[live/tip] tip_live_stream failed:', error.message)
    return NextResponse.json({ error: 'Tip failed.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, balance })
}
