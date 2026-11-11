import { NextResponse } from 'next/server'

/**
 * Paid featured boosts are switched off. This route took a Stripe card payment
 * to promote any listing, escorts included, which Stripe prohibits and which
 * put the Stripe account the boutique depends on at risk. Card payments now
 * happen only on the storefront; the previous implementation is in git history.
 */
export async function POST() {
  return NextResponse.json({ error: 'Paid boosts are not available.' }, { status: 410 })
}
