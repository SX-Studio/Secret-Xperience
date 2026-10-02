'use client'
import { useCallback, useEffect, useState } from 'react'

/* Admin → Events: approve or reject events found by the discovery agent, run a
 * city scan on demand, and see what is published. Discovered rows are hidden
 * from /events until approved here. */

type Ev = {
  id: string; slug: string; title: string; description?: string; category: string; tags?: string[]
  venue_name?: string | null; address?: string | null; city: string; country: string
  date_start: string; date_end?: string | null; time_start?: string | null; price_from?: number | null
  website?: string | null; source_url?: string | null; image_url?: string | null; recurring?: string
  featured: boolean; active: boolean; source?: string
}
type Run = { id: string; city: string; trigger: string; started_at: string; finished_at: string | null; found: number; inserted: number; skipped: number; error: string | null }
type Target = { city: string; country: string }

const card: React.CSSProperties = { background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '1.25rem' }
const h: React.CSSProperties = { font: '600 11px/1 var(--sans)', color: 'var(--t2, #8c8880)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }
const btn = (kind: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties => ({
  height: '34px', padding: '0 14px', borderRadius: 'var(--r, 8px)', cursor: 'pointer', font: '600 12px/1 var(--sans)', letterSpacing: '0.04em',
  border: kind === 'primary' ? 'none' : `0.5px solid ${kind === 'danger' ? 'rgba(226,83,107,0.35)' : 'var(--b2, rgba(255,255,255,0.12))'}`,
  background: kind === 'primary' ? 'linear-gradient(135deg,var(--gold,#c5a05a),var(--goldd,#9a7a3a))' : 'transparent',
  color: kind === 'primary' ? '#0a0a0a' : kind === 'danger' ? '#e2536b' : 'var(--t2, #8c8880)',
})
const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export default function EventsTab() {
  const [data, setData] = useState<{ pending: Ev[]; published: Ev[]; runs: Run[]; targets: Target[]; configured: boolean } | null>(null)
  const [city, setCity] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/events'); if (r.ok) { const j = await r.json(); setData(j); if (!city && j.targets?.[0]) setCity(j.targets[0].city) } } catch { /* keep */ }
  }, [city])
  useEffect(() => { load() }, [load])

  async function act(id: string, action: string) {
    setBusy(id)
    try {
      const r = await fetch('/api/admin/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
      if (!r.ok) { const j = await r.json(); setMsg({ kind: 'err', text: j.error || 'Update failed' }) }
      await load()
    } finally { setBusy(null) }
  }

  async function discover() {
    setBusy('discover'); setMsg(null)
    try {
      const r = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city }) })
      const j = await r.json()
      setMsg(r.ok
        ? { kind: 'ok', text: `${city}: ${j.found} events found, ${j.inserted} new added to the approval queue, ${j.skipped} already known.` }
        : { kind: 'err', text: j.error || 'Discovery failed' })
      await load()
    } catch { setMsg({ kind: 'err', text: 'Discovery failed (timed out?) — check the run log below.' }) } finally { setBusy(null) }
  }

  if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {!data.configured && (
        <div style={{ ...card, borderColor: 'rgba(226,83,107,0.35)', color: '#e2536b', font: '500 13px/1.5 var(--sans)' }}>
          Discovery is off: <code>ANTHROPIC_API_KEY</code> is not set in Vercel. Approvals below still work for events added by hand.
        </div>
      )}

      {/* Run now */}
      <div style={card}>
        <div style={h}><i className="ti ti-radar" style={{ marginRight: 6, color: 'var(--gold)' }} />Find new events</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={city} onChange={e => setCity(e.target.value)} style={{ height: '34px', padding: '0 10px', background: 'var(--bg3, #111)', border: '0.5px solid var(--b2, rgba(255,255,255,0.08))', borderRadius: 'var(--r, 8px)', color: 'var(--t, #ece8e1)', font: '400 13px/1 var(--sans)' }}>
            {data.targets.map(t => <option key={t.city} value={t.city}>{t.city} · {t.country}</option>)}
          </select>
          <button onClick={discover} disabled={busy === 'discover' || !data.configured} style={{ ...btn('primary'), opacity: busy === 'discover' || !data.configured ? 0.6 : 1 }}>
            {busy === 'discover' ? 'Searching the web… (up to a minute)' : 'Search now'}
          </button>
          <span style={{ font: '300 12px/1.5 var(--sans)', color: 'var(--t3)' }}>Runs automatically every hour, one city at a time. New finds wait here for your approval.</span>
        </div>
        {msg && <div style={{ marginTop: 10, font: '500 12px/1.5 var(--sans)', color: msg.kind === 'ok' ? '#26d4a0' : '#e2536b' }}>{msg.text}</div>}
      </div>

      {/* Approval queue */}
      <div>
        <div style={h}><i className="ti ti-inbox" style={{ marginRight: 6, color: 'var(--gold)' }} />Waiting for approval · {data.pending.length}</div>
        {data.pending.length === 0 && <div style={{ ...card, color: 'var(--t3)', textAlign: 'center' }}>Nothing waiting. Run a search above or wait for the hourly scan.</div>}
        <div style={{ display: 'grid', gap: '12px' }}>
          {data.pending.map(e => (
            <div key={e.id} style={{ ...card, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '14px', alignItems: 'start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ font: '600 15px/1.3 var(--serif)', color: 'var(--t)' }}>{e.title}</span>
                  <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'var(--gbg)', color: 'var(--gold)' }}>{e.category}</span>
                  {e.recurring && e.recurring !== 'one-time' && <span style={{ font: '500 10px/1 var(--sans)', color: 'var(--t3)' }}>{e.recurring}</span>}
                </div>
                <div style={{ font: '400 12px/1.6 var(--sans)', color: 'var(--t2)' }}>
                  {fmt(e.date_start)}{e.date_end && e.date_end !== e.date_start ? ` – ${fmt(e.date_end)}` : ''}{e.time_start ? ` · ${e.time_start}` : ''} · {e.city}{e.venue_name ? ` · ${e.venue_name}` : ''}
                  {' · '}<span style={{ color: !e.price_from ? '#26d4a0' : 'var(--gold)', fontWeight: 600 }}>{!e.price_from ? 'Free entry' : `From €${e.price_from}`}</span>
                </div>
                {e.description && <p style={{ margin: '6px 0 0', font: '300 12.5px/1.6 var(--sans)', color: 'var(--t2)' }}>{e.description}</p>}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8, font: '400 12px/1 var(--sans)' }}>
                  {e.website && <a href={e.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}><i className="ti ti-ticket" /> Tickets / website</a>}
                  {e.source_url && <a href={e.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t3)', textDecoration: 'none' }}><i className="ti ti-link" /> Found at</a>}
                  {e.tags?.length ? <span style={{ color: 'var(--t3)' }}>{e.tags.map(t => `#${t}`).join(' ')}</span> : null}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button disabled={busy === e.id} onClick={() => act(e.id, 'approve')} style={btn('primary')}><i className="ti ti-check" /> Publish</button>
                <button disabled={busy === e.id} onClick={() => act(e.id, 'reject')} style={btn('danger')}><i className="ti ti-x" /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Published */}
      <div>
        <div style={h}><i className="ti ti-calendar-check" style={{ marginRight: 6, color: 'var(--gold)' }} />Published upcoming · {data.published.length}</div>
        <div className="adm-table-wrap" style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '640px' }}>
            <thead><tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
              {['Event', 'City', 'Date', 'Price', 'Source', ''].map(x => <th key={x} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>{x}</th>)}
            </tr></thead>
            <tbody>
              {data.published.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--t3)' }}>No upcoming published events</td></tr>}
              {data.published.map(e => (
                <tr key={e.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}><a href={`/events/${e.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t)', textDecoration: 'none' }}>{e.title}</a>{e.featured && <span style={{ marginLeft: 8, font: '600 9px/1 var(--sans)', color: 'var(--gold)' }}>FEATURED</span>}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t2)', fontSize: 12 }}>{e.city}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t2)', fontSize: 12 }}>{fmt(e.date_start)}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: !e.price_from ? '#26d4a0' : 'var(--gold)' }}>{!e.price_from ? 'Free' : `€${e.price_from}`}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t3)', fontSize: 11 }}>{e.source === 'discovery' ? 'agent' : 'manual'}</td>
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                    <button disabled={busy === e.id} onClick={() => act(e.id, e.featured ? 'unfeature' : 'feature')} style={{ ...btn(), height: 28, marginRight: 6 }}>{e.featured ? 'Unfeature' : 'Feature'}</button>
                    <button disabled={busy === e.id} onClick={() => act(e.id, 'unpublish')} style={{ ...btn('danger'), height: 28 }}>Unpublish</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run log */}
      <div>
        <div style={h}><i className="ti ti-history" style={{ marginRight: 6, color: 'var(--gold)' }} />Scan log</div>
        <div className="adm-table-wrap" style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '640px' }}>
            <thead><tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
              {['When', 'City', 'Trigger', 'Found', 'New', 'Known', 'Result'].map(x => <th key={x} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>{x}</th>)}
            </tr></thead>
            <tbody>
              {data.runs.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--t3)' }}>No scans yet</td></tr>}
              {data.runs.map(r => (
                <tr key={r.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--t3)', fontSize: 11 }}>{new Date(r.started_at).toLocaleString('en-GB')}</td>
                  <td style={{ padding: '10px 16px' }}>{r.city}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t2)', fontSize: 12 }}>{r.trigger}</td>
                  <td style={{ padding: '10px 16px' }}>{r.found}</td>
                  <td style={{ padding: '10px 16px', color: r.inserted ? '#26d4a0' : 'var(--t2)' }}>{r.inserted}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--t2)' }}>{r.skipped}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: r.error ? '#e2536b' : !r.finished_at ? 'var(--t3)' : '#26d4a0' }}>{r.error ? r.error.slice(0, 80) : !r.finished_at ? 'running…' : 'ok'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
