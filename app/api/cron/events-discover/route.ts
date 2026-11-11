/**
 * Scheduled events discovery: one city per call, rotating through
 * DISCOVERY_TARGETS by least-recently-scanned. Triggered hourly by pg_cron +
 * pg_net (migration 20261002_events_discovery.sql) and daily by Vercel cron
 * (vercel.json) as a fallback. Both send `Authorization: Bearer <CRON_SECRET>`.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { discoveryConfigured, nextTarget, runDiscovery } from '../../../lib/eventsDiscovery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorised(req: Request) {
  const secret = process.env.CRON_SECRET || process.env.INTERNAL_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

async function handle(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!discoveryConfigured()) return NextResponse.json({ configured: false, error: 'ANTHROPIC_API_KEY not set' }, { status: 503 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const target = await nextTarget(admin)
  const result = await runDiscovery(admin, target, 'cron')
  return NextResponse.json({ city: target.city, ...result }, { status: result.error ? 500 : 200 })
}

export const GET = handle
export const POST = handle
