/**
 * Send a batch of queued campaign messages via Bird. The admin UI calls this
 * repeatedly until `remaining` is 0, so a 488-number campaign never has to fit
 * inside one serverless invocation.
 *
 * POST { campaignId, batch? } → { sent, failed, remaining, done }
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth'
import { sendSms, birdConfig } from '../../../../lib/bird'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const ctx = await requireAdmin()
  if ('error' in ctx) return NextResponse.json({ error: ctx.error === 401 ? 'Unauthorized' : 'Forbidden' }, { status: ctx.error })
  if (!birdConfig()) return NextResponse.json({ error: 'Bird is not configured. Set BIRD_API_KEY and BIRD_SMS_FROM in Vercel and redeploy.', configured: false }, { status: 503 })

  const { campaignId, batch } = await request.json().catch(() => ({}))
  if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
  const size = Math.min(50, Math.max(1, Number(batch) || 20))

  const { data: campaign } = await ctx.admin.from('sms_campaigns').select('*').eq('id', campaignId).maybeSingle()
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.status === 'sent') return NextResponse.json({ sent: 0, failed: 0, remaining: 0, done: true })
  if (campaign.status !== 'sending') await ctx.admin.from('sms_campaigns').update({ status: 'sending' }).eq('id', campaignId)

  const { data: queued } = await ctx.admin.from('sms_campaign_messages')
    .select('id, phone, listing_ids')
    .eq('campaign_id', campaignId).eq('status', 'queued')
    .order('created_at', { ascending: true }).limit(size)

  let sent = 0, failed = 0
  const now = new Date().toISOString()
  for (const m of queued ?? []) {
    try {
      const res = await sendSms(m.phone, campaign.body, 'service')
      await ctx.admin.from('sms_campaign_messages')
        .update({ status: 'sent', provider_message_id: res.id, sent_at: now, error: null }).eq('id', m.id)
      if (m.listing_ids?.length) {
        await ctx.admin.from('listings')
          .update({ consent_status: 'pending', consent_campaign_id: campaignId })
          .in('id', m.listing_ids).is('consent_status', null)
      }
      sent++
    } catch (e: any) {
      await ctx.admin.from('sms_campaign_messages')
        .update({ status: 'failed', error: String(e?.message ?? e).slice(0, 300) }).eq('id', m.id)
      failed++
    }
  }

  const { count } = await ctx.admin.from('sms_campaign_messages')
    .select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('status', 'queued')
  const remaining = count ?? 0
  if (remaining === 0) await ctx.admin.from('sms_campaigns').update({ status: 'sent', sent_at: now }).eq('id', campaignId)

  return NextResponse.json({ sent, failed, remaining, done: remaining === 0 })
}
