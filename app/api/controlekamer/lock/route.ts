import { NextResponse } from 'next/server'
import { GRANT_COOKIE } from '../../../lib/controlekamer'

export const dynamic = 'force-dynamic'

// Locks the control room again on this desktop by clearing the grant cookie.
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(GRANT_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
