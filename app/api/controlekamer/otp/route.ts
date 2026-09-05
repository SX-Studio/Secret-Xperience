import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { mintGrant, GRANT_COOKIE, GRANT_TTL_HOURS } from '../../../lib/controlekamer'
import { checkOtp } from '../../../lib/twilio'

export const dynamic = 'force-dynamic'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Desktop submits the SMS code. On a valid code we mint the grant cookie here (on the
// desktop browser making this request) and consume the session.
export async function POST(req: Request) {
  const { token, code } = (await req.json()) as { token?: string; code?: string }
  if (!token || !code) return NextResponse.json({ error: 'token and code required' }, { status: 400 })

  const db = admin()
  const { data: sess } = await db
    .from('control_room_sessions')
    .select('id, status, expires_at, approved_by, otp_required, otp_verified')
    .eq('token', token)
    .maybeSingle()

  if (!sess) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (sess.status !== 'approved' || !sess.otp_required || sess.otp_verified) {
    return NextResponse.json({ error: 'not_awaiting_otp' }, { status: 409 })
  }
  if (new Date(sess.expires_at).getTime() < Date.now()) {
    await db.from('control_room_sessions').update({ status: 'expired' }).eq('id', sess.id)
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  const check = await checkOtp(code.trim())
  if (!check.ok) return NextResponse.json({ error: check.error || 'invalid_code' }, { status: 401 })

  await db.from('control_room_sessions')
    .update({ otp_verified: true, status: 'consumed' })
    .eq('id', sess.id)

  const res = NextResponse.json({ status: 'approved' })
  res.cookies.set(GRANT_COOKIE, mintGrant(sess.approved_by!), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/',
    maxAge: GRANT_TTL_HOURS * 3600,
  })
  return res
}
