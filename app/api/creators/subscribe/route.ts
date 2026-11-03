import { NextResponse } from 'next/server'

/**
 * Tokens are spent only on live-show tips (/api/live/tip). Token creator memberships is
 * switched off; the previous implementation is in git history.
 */
export async function POST() {
  return NextResponse.json({ error: 'Tokens can only be used to tip live shows.' }, { status: 410 })
}
