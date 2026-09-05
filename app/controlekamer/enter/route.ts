import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { mintGrant, GRANT_COOKIE, GRANT_TTL_HOURS } from '../../lib/controlekamer'

export const dynamic = 'force-dynamic'

// Secret-link bypass: a single unguessable URL that unlocks the control room with no
// QR and no login. Disabled unless CONTROLEKAMER_BYPASS_SECRET is set, so it can be
// turned off (or rotated) by changing/clearing that env var. Anyone with the link is in
// — treat it like a password.
function bypassSecret(): string {
  return (process.env.CONTROLEKAMER_BYPASS_SECRET || '').trim()
}

function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key') || ''
  const secret = bypassSecret()
  const gate = new URL('/controlekamer', url.origin)

  // Feature off (no secret set) or wrong/blank key → silently fall back to the QR gate.
  if (!secret || !key || !safeEq(key, secret)) {
    return NextResponse.redirect(gate, { status: 303 })
  }

  const res = NextResponse.redirect(gate, { status: 303 })
  res.cookies.set(GRANT_COOKIE, mintGrant('bypass-link'), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/',
    maxAge: GRANT_TTL_HOURS * 3600,
  })
  return res
}
