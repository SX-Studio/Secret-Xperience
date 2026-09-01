import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { newToken, newCode, mintGrant, GRANT_COOKIE, GRANT_TTL_HOURS } from '../../../lib/controlekamer'

export const dynamic = 'force-dynamic'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function originOf(req: Request): string {
  const h = req.headers
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || 'https'
  if (host) return `${proto}://${host}`
  return 'https://secretxperience.eu'
}

// Desktop asks for a fresh pending session and its QR.
export async function POST(req: Request) {
  const token = newToken()
  const code = newCode()
  const origin = originOf(req)
  const approveUrl = `${origin}/controlekamer/approve?t=${token}`

  const ua = (req.headers.get('user-agent') || '').slice(0, 200)
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null

  const { error } = await admin().from('control_room_sessions').insert({
    token, code, device: ua, ip, status: 'pending',
  })
  if (error) {
    console.error('[controlekamer] session insert failed:', error.message)
    return NextResponse.json({ error: 'Could not start a session.' }, { status: 500 })
  }

  let qrSvg = ''
  try {
    qrSvg = await QRCode.toString(approveUrl, {
      type: 'svg', margin: 1, width: 240, errorCorrectionLevel: 'M',
      color: { dark: '#0b0912', light: '#ffffff' },
    })
  } catch (e: any) {
    console.error('[controlekamer] qr generation failed:', e?.message)
  }

  return NextResponse.json({ token, code, approveUrl, qrSvg, ttlMinutes: 5 })
}

// Desktop polls this. On approval it mints the grant cookie on THIS (desktop) browser.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const db = admin()
  const { data: sess } = await db
    .from('control_room_sessions')
    .select('id, status, expires_at, approved_by')
    .eq('token', token)
    .maybeSingle()

  if (!sess) return NextResponse.json({ status: 'expired' })

  if (sess.status === 'pending' && new Date(sess.expires_at).getTime() < Date.now()) {
    await db.from('control_room_sessions').update({ status: 'expired' }).eq('id', sess.id)
    return NextResponse.json({ status: 'expired' })
  }

  if (sess.status === 'approved' && sess.approved_by) {
    // Consume once, so a leaked token can't be replayed for a second grant.
    await db.from('control_room_sessions').update({ status: 'consumed' }).eq('id', sess.id)
    const res = NextResponse.json({ status: 'approved' })
    res.cookies.set(GRANT_COOKIE, mintGrant(sess.approved_by), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/',
      maxAge: GRANT_TTL_HOURS * 3600,
    })
    return res
  }

  return NextResponse.json({ status: sess.status })
}
