'use client'
import { useCallback, useEffect, useState } from 'react'

/* Admin → Campaigns: one-time GDPR consent SMS to advertisers whose listings were
 * sourced from redlights.be. Create → test on your own number → send in batches →
 * replies (KEEP / REMOVE / STOP) land via the Bird webhook and update the counts. */

type Campaign = {
  id: string; name: string; body: string; audience: string; no_reply_days: number
  status: 'draft' | 'sending' | 'sent'; created_at: string; sent_at: string | null
  counts: Record<string, number>
}

const DEFAULT_BODY =
  'SecretXperience: your advert (as listed on redlights.be) is shown on secretxperience.eu. ' +
  'Reply KEEP to keep it and claim your free profile, or REMOVE to delete it and never hear from us again.'

function segments(text: string) {
  const gsm = /^[\x20-\x7E\n\r€£¥èéùìòÇØøÅåΔΦΓΛΩΠΨΣΘΞÆæßÉÄÖÑÜ§¿äöñüà]*$/.test(text)
  const per = gsm ? (text.length <= 160 ? 160 : 153) : (text.length <= 70 ? 70 : 67)
  return { count: Math.max(1, Math.ceil(text.length / per)), encoding: gsm ? 'GSM-7' : 'Unicode' }
}

const card: React.CSSProperties = { background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '1.25rem' }
const label: React.CSSProperties = { font: '600 10px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)', marginBottom: '6px', display: 'block' }
const input: React.CSSProperties = { width: '100%', height: '44px', padding: '0 12px', background: 'var(--bg3, #111)', border: '0.5px solid var(--b2, rgba(255,255,255,0.08))', borderRadius: 'var(--r, 8px)', color: 'var(--t, #ece8e1)', font: '400 13px/1 var(--sans)', outline: 'none', boxSizing: 'border-box' }
const btn = (primary = false): React.CSSProperties => ({ height: '40px', padding: '0 16px', borderRadius: 'var(--r, 8px)', cursor: 'pointer', font: '600 12px/1 var(--sans)', letterSpacing: '0.04em', border: primary ? 'none' : '0.5px solid var(--b2, rgba(255,255,255,0.12))', background: primary ? 'linear-gradient(135deg,var(--gold,#c5a05a),var(--goldd,#9a7a3a))' : 'transparent', color: primary ? '#0a0a0a' : 'var(--t2, #8c8880)' })

export default function CampaignsTab() {
  const [data, setData] = useState<{ campaigns: Campaign[]; optouts: number; configured: boolean } | null>(null)
  const [name, setName] = useState('Consent notice — redlights.be listings')
  const [body, setBody] = useState(DEFAULT_BODY)
  const [audience, setAudience] = useState<'all_with_phone' | 'not_consented'>('not_consented')
  const [days, setDays] = useState(30)
  const [testTo, setTestTo] = useState('')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ id: string; done: number; total: number } | null>(null)

  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/sms-campaign'); if (r.ok) setData(await r.json()) } catch { /* keep */ }
  }, [])
  useEffect(() => { load() }, [load])

  async function createCampaign() {
    setBusy('create'); setMsg(null)
    try {
      const r = await fetch('/api/admin/sms-campaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, body, audience, noReplyDays: days }) })
      const j = await r.json()
      if (!r.ok) { setMsg({ kind: 'err', text: j.error || 'Could not create campaign' }); return }
      setMsg({ kind: 'ok', text: `Campaign created — ${j.queued} numbers queued (${j.listingsCovered} listings). Skipped: ${j.skipped.invalidNumbers} invalid, ${j.skipped.optedOut} opted out. Nothing sent yet.` })
      await load()
    } catch { setMsg({ kind: 'err', text: 'Could not create campaign' }) } finally { setBusy(null) }
  }

  async function sendTest() {
    setBusy('test'); setMsg(null)
    try {
      const r = await fetch('/api/admin/sms-campaign/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: testTo, body }) })
      const j = await r.json()
      setMsg(r.ok ? { kind: 'ok', text: `Test sent to ${testTo} (Bird id ${j.id}).` } : { kind: 'err', text: j.error || 'Test failed' })
    } catch { setMsg({ kind: 'err', text: 'Test failed' }) } finally { setBusy(null) }
  }

  async function sendAll(c: Campaign) {
    const total = c.counts.total || 0
    if (!window.confirm(`Send "${c.name}" to ${c.counts.queued ?? total} numbers now? This cannot be undone.`)) return
    setBusy(c.id); setMsg(null); setProgress({ id: c.id, done: 0, total: c.counts.queued ?? total })
    try {
      let done = false, sent = 0
      while (!done) {
        const r = await fetch('/api/admin/sms-campaign/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: c.id, batch: 20 }) })
        const j = await r.json()
        if (!r.ok) { setMsg({ kind: 'err', text: j.error || 'Send failed' }); break }
        sent += j.sent + j.failed
        setProgress({ id: c.id, done: sent, total: sent + j.remaining })
        done = j.done
      }
      if (done) setMsg({ kind: 'ok', text: `Campaign sent. Replies will appear here as they arrive.` })
      await load()
    } finally { setBusy(null); setProgress(null) }
  }

  const seg = segments(body)
  const configured = data?.configured ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {!configured && (
        <div style={{ ...card, borderColor: 'rgba(224,96,122,0.4)', color: 'var(--t2, #8c8880)', fontSize: '13px', lineHeight: 1.6 }}>
          <strong style={{ color: '#e0607a' }}>Bird is not configured.</strong> Set <code>BIRD_API_KEY</code>, <code>BIRD_SMS_FROM</code> and <code>BIRD_WEBHOOK_SECRET</code> in Vercel, redeploy, and subscribe <code>/api/bird/webhook</code> to the <code>sms.received</code> + delivery events in Bird. You can draft and queue campaigns meanwhile; sending is blocked until then.
        </div>
      )}

      {msg && <div style={{ ...card, padding: '0.9rem 1.1rem', fontSize: '13px', color: msg.kind === 'ok' ? '#1ecf8e' : '#e0607a', borderColor: msg.kind === 'ok' ? 'rgba(30,207,142,0.35)' : 'rgba(224,96,122,0.4)' }}>{msg.text}</div>}

      {/* Compose */}
      <div style={card}>
        <div style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t2, #8c8880)', marginBottom: '1rem' }}>
          <i className="ti ti-send" style={{ marginRight: 6, color: 'var(--gold, #c5a05a)' }} /> New consent campaign
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div><label style={label}>Name</label><input style={input} value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label style={label}>Audience</label>
            <select style={input} value={audience} onChange={e => setAudience(e.target.value as any)}>
              <option value="not_consented">Not yet consented (recommended)</option>
              <option value="all_with_phone">Every active listing with a phone</option>
            </select></div>
          <div><label style={label}>No reply → unpublish after (days)</label><input style={input} type="number" min={1} max={365} value={days} onChange={e => setDays(Number(e.target.value) || 30)} /></div>
        </div>
        <label style={label}>Message · {body.length} chars · {seg.count} segment{seg.count > 1 ? 's' : ''} ({seg.encoding})</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} maxLength={480}
          style={{ ...input, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }} />
        <div style={{ fontSize: '11.5px', color: 'var(--t3, #4c4a47)', margin: '6px 0 14px', lineHeight: 1.5 }}>
          Replies are matched on the words <b>KEEP</b>, <b>REMOVE</b> and <b>STOP</b> (also ja/nee/oui/non/verwijder/supprimer). Keep those words in the text.
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={btn(true)} disabled={busy !== null} onClick={createCampaign}>{busy === 'create' ? 'Creating…' : 'Create campaign (queue only)'}</button>
          <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', flex: '1 1 260px' }}>
            <input style={{ ...input, width: 'auto', flex: 1 }} placeholder="+32470123456" value={testTo} onChange={e => setTestTo(e.target.value)} />
            <button style={btn()} disabled={busy !== null || !configured || !testTo} onClick={sendTest}>{busy === 'test' ? 'Sending…' : 'Send test to me'}</button>
          </span>
        </div>
      </div>

      {/* Campaigns */}
      <div className="adm-table-wrap" style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.06))' }}>
          <span style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t2, #8c8880)' }}>Campaigns</span>
          <span style={{ fontSize: '11.5px', color: 'var(--t3, #4c4a47)' }}>{data?.optouts ?? 0} numbers opted out (never contacted again)</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '860px' }}>
          <thead><tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
            {['Campaign', 'Status', 'Queued', 'Sent', 'Delivered', 'Failed', 'KEEP', 'REMOVE', 'STOP', 'No reply', ''].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(!data || data.campaigns.length === 0) && <tr><td colSpan={11} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>{data ? 'No campaigns yet' : 'Loading…'}</td></tr>}
            {data?.campaigns.map(c => {
              const k = c.counts; const delivered = (k.sent ?? 0) + (k.delivered ?? 0)
              const noReply = Math.max(0, (k.total ?? 0) - (k.queued ?? 0) - (k.failed ?? 0) - (k.replied ?? 0))
              const p = progress?.id === c.id ? progress : null
              return (
                <tr key={c.id} style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                  <td style={{ padding: '12px 14px' }}><div style={{ fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: '11px', color: 'var(--t3, #4c4a47)' }}>{new Date(c.created_at).toLocaleDateString('en-GB')} · {c.audience === 'not_consented' ? 'not consented' : 'all with phone'} · {c.no_reply_days}d</div></td>
                  <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '10.5px', padding: '3px 9px', borderRadius: '999px', border: '0.5px solid var(--b2, rgba(255,255,255,0.12))', color: c.status === 'sent' ? '#1ecf8e' : c.status === 'sending' ? 'var(--gold, #c5a05a)' : 'var(--t2, #8c8880)' }}>{c.status}</span></td>
                  <td style={{ padding: '12px 14px' }}>{k.queued ?? 0}</td>
                  <td style={{ padding: '12px 14px' }}>{delivered}</td>
                  <td style={{ padding: '12px 14px', color: '#1ecf8e' }}>{k.delivered ?? 0}</td>
                  <td style={{ padding: '12px 14px', color: (k.failed ?? 0) > 0 ? '#e0607a' : undefined }}>{k.failed ?? 0}</td>
                  <td style={{ padding: '12px 14px', color: '#1ecf8e', fontWeight: 600 }}>{k.keep ?? 0}</td>
                  <td style={{ padding: '12px 14px', color: '#e0607a', fontWeight: 600 }}>{k.remove ?? 0}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--t2, #8c8880)' }}>{k.stop ?? 0}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--t3, #4c4a47)' }}>{c.status === 'sent' ? noReply : '—'}</td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    {c.status !== 'sent' && (k.queued ?? 0) > 0 && (
                      <button style={btn(true)} disabled={busy !== null || !configured} onClick={() => sendAll(c)}>
                        {p ? `Sending ${p.done}/${p.total}…` : c.status === 'sending' ? 'Resume send' : 'Send now'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
