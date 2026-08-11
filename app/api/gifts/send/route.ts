import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Send one gift to a recipient profile. All balance/earn logic is enforced
// atomically by the send_gift() SECURITY DEFINER function (RLS-safe).
export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Please log in to send gifts' }, { status: 401 })

  const { recipientId, giftSlug, message } = await req.json().catch(() => ({}))
  if (!recipientId || !giftSlug) return NextResponse.json({ error: 'recipientId and giftSlug required' }, { status: 400 })

  const { data, error } = await supabase.rpc('send_gift', {
    p_recipient: recipientId,
    p_gift: giftSlug,
    p_message: typeof message === 'string' ? message.slice(0, 200) : null,
  })

  if (error) {
    const m = error.message || 'Could not send gift'
    const insufficient = /insufficient/i.test(m)
    return NextResponse.json({ error: insufficient ? 'Not enough gift coins' : m }, { status: insufficient ? 402 : 400 })
  }

  return NextResponse.json(data ?? { ok: true })
}
