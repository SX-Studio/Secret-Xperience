/**
 * Send one test SMS to an admin's own number before a campaign goes out.
 * POST { to, body } → { id, status }. Touches no campaign data.
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth'
import { sendSms, birdConfig, toE164 } from '../../../../lib/bird'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return NextResponse.json({ error: ctx.error === 401 ? 'Unauthorized' : 'Forbidden' }, { status: ctx.error })
  if (!birdConfig()) return NextResponse.json({ error: 'Bird is not configured. Set BIRD_API_KEY and BIRD_SMS_FROM in Vercel and redeploy.', configured: false }, { status: 503 })

  const { to, body } = await request.json().catch(() => ({}))
  const phone = toE164(String(to ?? ''))
  const text = String(body ?? '').trim()
  if (!phone) return NextResponse.json({ error: 'Enter a valid number in international format, e.g. +32470123456.' }, { status: 400 })
  if (!text) return NextResponse.json({ error: 'Message text is required.' }, { status: 400 })

  try {
    const res = await sendSms(phone, text, 'service')
    return NextResponse.json({ ok: true, ...res })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? 'Send failed') }, { status: 502 })
  }
}
