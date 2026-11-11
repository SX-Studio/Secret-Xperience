/**
 * Admin consent campaigns (Bird SMS).
 *
 * GET  → campaigns with outcome counts
 * POST { name, body, audience, noReplyDays } → creates a campaign and queues one
 *        message per distinct phone number (opt-outs and invalid numbers skipped).
 *        Nothing is sent here — see ./send.
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/adminAuth'
import { toE164 } from '../../../lib/bird'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY = 480 // 3 GSM-7 segments; keeps cost + deliverability sane

export async function GET() {
  const ctx = await requireAdmin()
  if ('error' in ctx) return NextResponse.json({ error: ctx.error === 401 ? 'Unauthorized' : 'Forbidden' }, { status: ctx.error })

  const [{ data: campaigns }, { data: msgs }] = await Promise.all([
    ctx.admin.from('sms_campaigns').select('*').order('created_at', { ascending: false }).limit(50),
    ctx.admin.from('sms_campaign_messages').select('campaign_id, status, decision').limit(20000),
  ])

  const counts: Record<string, any> = {}
  for (const m of msgs ?? []) {
    const c = (counts[m.campaign_id] ??= { total: 0, queued: 0, sent: 0, delivered: 0, failed: 0, keep: 0, remove: 0, stop: 0, replied: 0 })
    c.total++
    c[m.status] = (c[m.status] ?? 0) + 1
    if (m.decision) { c.replied++; c[m.decision] = (c[m.decision] ?? 0) + 1 }
  }

  const { count: optouts } = await ctx.admin.from('sms_optouts').select('phone', { count: 'exact', head: true })
  return NextResponse.json({
    campaigns: (campaigns ?? []).map(c => ({ ...c, counts: counts[c.id] ?? { total: 0 } })),
    optouts: optouts ?? 0,
    configured: !!(process.env.BIRD_API_KEY && process.env.BIRD_SMS_FROM),
  })
}

export async function POST(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return NextResponse.json({ error: ctx.error === 401 ? 'Unauthorized' : 'Forbidden' }, { status: ctx.error })

  const { name, body, audience, noReplyDays } = await request.json().catch(() => ({}))
  const text = String(body ?? '').trim()
  if (!String(name ?? '').trim()) return NextResponse.json({ error: 'Give the campaign a name.' }, { status: 400 })
  if (!text) return NextResponse.json({ error: 'Message text is required.' }, { status: 400 })
  if (text.length > MAX_BODY) return NextResponse.json({ error: `Message is too long (${text.length}/${MAX_BODY} characters).` }, { status: 400 })
  const aud = audience === 'not_consented' ? 'not_consented' : 'all_with_phone'
  const days = Math.min(365, Math.max(1, Number(noReplyDays) || 30))

  // Audience: every active listing with a phone (optionally only those without consent yet).
  let q = ctx.admin.from('listings')
    .select('id, contact_phone, consent_status')
    .eq('active', true)
    .not('contact_phone', 'is', null)
  if (aud === 'not_consented') q = q.or('consent_status.is.null,consent_status.neq.consented')
  const { data: listings, error: lErr } = await q.limit(5000)
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })

  const { data: optoutRows } = await ctx.admin.from('sms_optouts').select('phone')
  const optedOut = new Set((optoutRows ?? []).map(r => r.phone))

  const byPhone = new Map<string, string[]>()
  let invalid = 0, skippedOptout = 0
  for (const l of listings ?? []) {
    const phone = toE164(l.contact_phone)
    if (!phone) { invalid++; continue }
    if (optedOut.has(phone)) { skippedOptout++; continue }
    const ids = byPhone.get(phone) ?? []
    ids.push(l.id)
    byPhone.set(phone, ids)
  }
  if (byPhone.size === 0) return NextResponse.json({ error: 'No eligible recipients for this audience.' }, { status: 400 })

  const { data: campaign, error: cErr } = await ctx.admin.from('sms_campaigns')
    .insert({ name: String(name).trim(), body: text, audience: aud, no_reply_days: days, created_by: ctx.userId })
    .select('*').single()
  if (cErr || !campaign) return NextResponse.json({ error: cErr?.message || 'Could not create campaign' }, { status: 500 })

  const rows = Array.from(byPhone.entries()).map(([phone, ids]) => ({
    campaign_id: campaign.id, phone, listing_id: ids[0], listing_ids: ids, status: 'queued',
  }))
  // Insert in chunks to stay under PostgREST payload limits.
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await ctx.admin.from('sms_campaign_messages').insert(rows.slice(i, i + 500))
    if (error) return NextResponse.json({ error: error.message, campaignId: campaign.id }, { status: 500 })
  }

  return NextResponse.json({
    campaign,
    queued: rows.length,
    listingsCovered: (listings ?? []).length - invalid - skippedOptout,
    skipped: { invalidNumbers: invalid, optedOut: skippedOptout },
  })
}
