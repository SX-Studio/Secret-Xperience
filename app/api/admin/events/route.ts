/**
 * Admin → Events.
 *
 * GET                       → pending discovered events, upcoming published events, recent runs
 * PATCH { id, action }      → approve (publish) | reject (keep row, hidden) | unpublish | feature
 * POST  { city }            → run discovery for one city now (same code path as the cron)
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/adminAuth'
import { DISCOVERY_TARGETS, discoveryConfigured, runDiscovery } from '../../../lib/eventsDiscovery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const unauth = (code: 401 | 403) => NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Forbidden' }, { status: code })

export async function GET() {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  const today = new Date().toISOString().slice(0, 10)
  const [{ data: pending }, { data: published }, { data: runs }] = await Promise.all([
    ctx.admin.from('events').select('*').eq('status', 'pending').order('date_start', { ascending: true }).limit(200),
    ctx.admin.from('events').select('id, slug, title, city, country, category, date_start, date_end, price_from, website, featured, active, source')
      .eq('active', true).gte('date_start', today).order('date_start', { ascending: true }).limit(300),
    ctx.admin.from('event_discovery_runs').select('*').order('started_at', { ascending: false }).limit(40),
  ])
  return NextResponse.json({
    pending: pending ?? [], published: published ?? [], runs: runs ?? [],
    targets: DISCOVERY_TARGETS, configured: discoveryConfigured(),
  })
}

export async function PATCH(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  const { id, action } = await request.json().catch(() => ({}))
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'id required' }, { status: 400 })

  const upd: Record<string, unknown> =
    action === 'approve'   ? { status: 'approved', active: true,  reviewed_by: ctx.userId, reviewed_at: new Date().toISOString() } :
    action === 'reject'    ? { status: 'rejected', active: false, reviewed_by: ctx.userId, reviewed_at: new Date().toISOString() } :
    action === 'unpublish' ? { active: false } :
    action === 'feature'   ? { featured: true } :
    action === 'unfeature' ? { featured: false } : {}
  if (!Object.keys(upd).length) return NextResponse.json({ error: 'unknown action' }, { status: 400 })

  const { error } = await ctx.admin.from('events').update(upd).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return unauth(ctx.error)
  if (!discoveryConfigured()) return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set in Vercel' }, { status: 503 })
  const { city } = await request.json().catch(() => ({}))
  const target = DISCOVERY_TARGETS.find(t => t.city === city)
  if (!target) return NextResponse.json({ error: 'unknown city' }, { status: 400 })
  const result = await runDiscovery(ctx.admin, target, 'manual')
  return NextResponse.json({ city: target.city, ...result }, { status: result.error ? 500 : 200 })
}
