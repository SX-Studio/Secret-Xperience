'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { CK_CSS } from '../styles'

type Phase = 'checking' | 'anon' | 'forbidden' | 'ready' | 'done' | 'error'
type Info = { code: string; device?: string; ip?: string; status: string; created_at?: string; expires_at?: string }

export default function ApprovePage() {
  const [phase, setPhase] = useState<Phase>('checking')
  const [info, setInfo] = useState<Info | null>(null)
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('t') || ''
    setToken(t)
    ;(async () => {
      if (!t) { setPhase('error'); return }
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setPhase('anon'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
      if (profile?.role !== 'admin') { setPhase('forbidden'); return }
      try {
        const r = await fetch(`/api/controlekamer/approve?t=${encodeURIComponent(t)}`)
        if (r.status === 401 || r.status === 403) { setPhase('forbidden'); return }
        if (!r.ok) { setPhase('error'); return }
        const j = await r.json()
        setInfo(j)
        if (j.status !== 'pending') { setResult({ ok: false, text: `Deze aanvraag is al ${j.status}.` }); setPhase('done'); return }
        setPhase('ready')
      } catch { setPhase('error') }
    })()
  }, [])

  const decide = async (action: 'approve' | 'deny') => {
    setWorking(true)
    try {
      const r = await fetch('/api/controlekamer/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      })
      const j = await r.json()
      if (!r.ok) { setResult({ ok: false, text: j.error === 'expired' ? 'De code is verlopen.' : 'Kon niet verwerken.' }) }
      else if (action === 'approve') setResult({
        ok: true,
        text: j.otpRequired
          ? 'Goedgekeurd. We stuurden een SMS-code — voer die nu in op de desktop om af te ronden.'
          : 'Desktop goedgekeurd. Je kan verder op de computer.',
      })
      else setResult({ ok: false, text: 'Aanvraag geweigerd.' })
      setPhase('done')
    } catch { setResult({ ok: false, text: 'Netwerkfout.' }); setPhase('done') }
    finally { setWorking(false) }
  }

  const nextUrl = typeof window !== 'undefined' ? `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}` : '/login'

  return (
    <div className="ck ck-appr">
      <style>{CK_CSS}</style>
      <div className="ck-appr-card">
        <div className="ck-eyebrow">Controlekamer · Goedkeuring</div>
        <h1 className="ck-serif">Desktop toegang</h1>

        {phase === 'checking' && <p className="ck-lede">Bezig met controleren…</p>}

        {phase === 'anon' && (
          <>
            <p className="ck-lede">Log in als admin om deze desktop goed te keuren.</p>
            <a className="ck-authlink" href={nextUrl}>Inloggen →</a>
          </>
        )}

        {phase === 'forbidden' && <p className="ck-lede">Dit account heeft geen admin-rechten voor de controlekamer.</p>}

        {phase === 'error' && <p className="ck-lede">Ongeldige of verlopen goedkeuringslink.</p>}

        {phase === 'ready' && info && (
          <>
            <p className="ck-lede">Een desktop vraagt toegang tot de controlekamer. Controleer of de code hieronder <b>exact</b> overeenkomt met wat op je scherm staat.</p>
            <div className="ck-appr-code">
              <div className="l">Vergelijk deze code</div>
              <div className="c">{info.code}</div>
            </div>
            <div className="ck-meta">
              {info.device && <div><span>Toestel</span><b>{info.device.slice(0, 60)}</b></div>}
              {info.ip && <div><span>IP</span><b>{info.ip}</b></div>}
              {info.created_at && <div><span>Aangevraagd</span><b>{new Date(info.created_at).toLocaleTimeString()}</b></div>}
            </div>
            <div className="ck-appr-actions">
              <button className="ck-deny" onClick={() => decide('deny')} disabled={working}>Weigeren</button>
              <button className="ck-approve" onClick={() => decide('approve')} disabled={working}>{working ? '…' : 'Goedkeuren'}</button>
            </div>
            <p className="ck-warn">Keur alleen goed als jij deze desktop nu zelf opent. De toegang blijft 12 uur geldig.</p>
          </>
        )}

        {phase === 'done' && result && (
          <div className={`ck-appr-result ${result.ok ? 'ok' : 'bad'}`}>
            <div className="big">{result.ok ? '✓' : '✕'}</div>
            <div>{result.text}</div>
          </div>
        )}
      </div>
    </div>
  )
}
