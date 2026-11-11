/**
 * Bird inbound webhook — consent-campaign replies and SMS delivery status.
 *
 * Subscribe this URL in Bird to: sms.received, sms.delivered, sms.undelivered,
 * sms.failed, sms.expired, sms.rejected. Every delivery is Standard-Webhooks
 * signed; unsigned or stale deliveries are rejected before any data is touched.
 *
 * Replies drive the GDPR outcome:
 *   keep        → listing consent recorded (advertiser stays on the platform)
 *   remove/stop → listing deactivated, number added to sms_optouts, never contacted again
 *   anything else → stored for an admin to read; no automatic action
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyBirdWebhook, parseDecision, toE164 } from '../../../lib/bird'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUS_EVENTS: Record<string, 'delivered' | 'failed'> = {
  'sms.delivered': 'delivered',
  'sms.undelivered': 'failed',
  'sms.failed': 'failed',
  'sms.expired': 'failed',
  'sms.rejected': 'failed',
}

export async function POST(request: Request) {
  const raw = await request.text()
  const ok = verifyBirdWebhook(raw, {
    id: request.headers.get('webhook-id'),
    timestamp: request.headers.get('webhook-timestamp'),
    signature: request.headers.get('webhook-signature'),
  })
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let evt: any
  try { evt = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const type: string = evt?.type ?? evt?.event ?? ''
  const data: any = evt?.data ?? evt?.payload ?? {}

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ── Delivery status ──────────────────────────────────────────────────────
  if (STATUS_EVENTS[type]) {
    const smsId = String(data?.sms_id ?? data?.id ?? '')
    if (smsId) {
      const status = STATUS_EVENTS[type]
      const error = status === 'failed'
        ? String(data?.error?.description ?? data?.error?.code ?? type)
        : null
      await admin.from('sms_campaign_messages').update({ status, error }).eq('provider_message_id', smsId)
    }
    return NextResponse.json({ ok: true })
  }

  // ── Inbound reply ────────────────────────────────────────────────────────
  if (type === 'sms.received' || type === 'sms.inbound') {
    const from = toE164(String(data?.from ?? data?.sender ?? ''))
    const text = String(data?.body ?? data?.text ?? data?.message?.text ?? data?.content ?? '')
    if (!from) return NextResponse.json({ ok: true, ignored: 'no sender' })

    // Latest message we sent to this number — that's the campaign they're answering.
    const { data: rows } = await admin
      .from('sms_campaign_messages')
      .select('id, campaign_id, listing_id, decision')
      .eq('phone', from)
      .order('created_at', { ascending: false })
      .limit(5)
    const decision = parseDecision(text)
    const now = new Date().toISOString()

    if (!rows || rows.length === 0) {
      // Unknown number texting our sender: honour STOP regardless, otherwise ignore.
      if (decision === 'stop') await admin.from('sms_optouts').upsert({ phone: from, reason: 'stop' })
      return NextResponse.json({ ok: true, ignored: 'unknown number' })
    }

    const latest = rows[0]
    // Keep the first explicit answer; later texts only add to the reply log.
    const update: any = { replied_at: latest.decision ? undefined : now, reply: text.slice(0, 500) }
    if (!latest.decision && decision) update.decision = decision
    await admin.from('sms_campaign_messages').update(update).eq('id', latest.id)

    const effective = latest.decision ?? decision
    if (effective === 'keep') {
      const listingIds = rows.map(r => r.listing_id).filter(Boolean)
      if (listingIds.length) {
        await admin.from('listings')
          .update({ consent_status: 'consented', consent_at: now, consent_campaign_id: latest.campaign_id })
          .in('id', listingIds)
      }
    } else if (effective === 'remove' || effective === 'stop') {
      await admin.from('sms_optouts').upsert({ phone: from, reason: effective })
      const listingIds = rows.map(r => r.listing_id).filter(Boolean)
      if (listingIds.length) {
        await admin.from('listings')
          .update({ active: false, consent_status: 'removed', consent_at: now, consent_campaign_id: latest.campaign_id })
          .in('id', listingIds)
      }
    }
    return NextResponse.json({ ok: true, decision: effective ?? null })
  }

  return NextResponse.json({ ok: true, ignored: type || 'unknown event' })
}
