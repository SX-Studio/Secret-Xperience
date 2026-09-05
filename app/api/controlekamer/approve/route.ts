import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { twilioConfigured, sendOtp } from '../../../lib/twilio'

export const dynamic = 'force-dynamic'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Confirms the caller is a logged-in admin (from their phone session cookies).
async function requireAdmin() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' as const, status: 401 }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
  if (profile?.role !== 'admin') return { error: 'Forbidden' as const, status: 403 }
  return { userId: session.user.id }
}

// Phone loads the pending session details to compare the code before approving.
export async function GET(req: Request) {
  const gate = await requireAdmin()
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const token = new URL(req.url).searchParams.get('t')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { data: sess } = await admin()
    .from('control_room_sessions')
    .select('code, device, ip, status, created_at, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!sess) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const expired = sess.status === 'pending' && new Date(sess.expires_at).getTime() < Date.now()
  return NextResponse.json({ ...sess, status: expired ? 'expired' : sess.status })
}

// Phone approves or denies the desktop session.
export async function POST(req: Request) {
  const gate = await requireAdmin()
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const { token, action } = (await req.json()) as { token?: string; action?: 'approve' | 'deny' }
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })
  const decision = action === 'deny' ? 'denied' : 'approved'

  const db = admin()
  const { data: sess } = await db
    .from('control_room_sessions')
    .select('id, status, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!sess) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (sess.status !== 'pending') return NextResponse.json({ error: `already ${sess.status}` }, { status: 409 })
  if (new Date(sess.expires_at).getTime() < Date.now()) {
    await db.from('control_room_sessions').update({ status: 'expired' }).eq('id', sess.id)
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  // On approval, fire the SMS-OTP second factor if Twilio is configured. If the send
  // fails we fall back to no-OTP rather than lock the admin out (they already proved the
  // phone-approval factor to get here).
  let otpRequired = false
  if (decision === 'approved' && twilioConfigured()) {
    const sent = await sendOtp()
    if (sent.ok) otpRequired = true
    else console.error('[controlekamer] OTP send failed, granting without 2FA:', sent.error)
  }

  const update: Record<string, any> = {
    status: decision,
    approved_by: decision === 'approved' ? gate.userId : null,
    approved_at: new Date().toISOString(),
    otp_required: otpRequired,
  }
  // Give the OTP room to arrive and be typed on the desktop.
  if (otpRequired) update.expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { error } = await db.from('control_room_sessions').update(update).eq('id', sess.id)
  if (error) {
    console.error('[controlekamer] approve update failed:', error.message)
    return NextResponse.json({ error: 'Could not record decision.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: decision, otpRequired })
}
