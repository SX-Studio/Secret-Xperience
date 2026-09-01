'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CK_CSS } from './styles'

type Status = 'loading' | 'pending' | 'awaiting_otp' | 'approved' | 'denied' | 'expired' | 'error'

export default function Gate() {
  const [status, setStatus] = useState<Status>('loading')
  const [code, setCode] = useState('')
  const [qrSvg, setQrSvg] = useState('')
  const [approveUrl, setApproveUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [phoneHint, setPhoneHint] = useState('')
  const [otp, setOtp] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [otpBusy, setOtpBusy] = useState(false)
  const tokenRef = useRef<string>('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPoll = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }

  const start = useCallback(async () => {
    stopPoll()
    setStatus('loading')
    try {
      const r = await fetch('/api/controlekamer/session', { method: 'POST' })
      if (!r.ok) throw new Error('session')
      const j = await r.json()
      tokenRef.current = j.token
      setCode(j.code); setQrSvg(j.qrSvg || ''); setApproveUrl(j.approveUrl || '')
      setStatus('pending')
      pollRef.current = setInterval(async () => {
        try {
          const pr = await fetch(`/api/controlekamer/session?token=${encodeURIComponent(tokenRef.current)}`)
          const pj = await pr.json()
          if (pj.status === 'approved') {
            stopPoll(); setStatus('approved')
            setTimeout(() => window.location.reload(), 500)
          } else if (pj.status === 'awaiting_otp') {
            stopPoll(); setPhoneHint(pj.phoneHint || ''); setStatus('awaiting_otp')
          } else if (pj.status === 'denied') { stopPoll(); setStatus('denied') }
          else if (pj.status === 'expired' || pj.status === 'consumed') { stopPoll(); setStatus('expired') }
        } catch { /* transient network — keep polling */ }
      }, 2500)
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => { start(); return stopPoll }, [start])

  const copy = async () => {
    try { await navigator.clipboard.writeText(approveUrl); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch {}
  }

  const submitOtp = async () => {
    if (otp.trim().length < 4) { setOtpErr('Vul de code in.'); return }
    setOtpBusy(true); setOtpErr('')
    try {
      const r = await fetch('/api/controlekamer/otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenRef.current, code: otp.trim() }),
      })
      const j = await r.json()
      if (r.ok && j.status === 'approved') { setStatus('approved'); setTimeout(() => window.location.reload(), 500) }
      else if (r.status === 410) { setStatus('expired') }
      else { setOtpErr(j.error === 'invalid_code' ? 'Onjuiste code — probeer opnieuw.' : 'Verificatie mislukt.') }
    } catch { setOtpErr('Netwerkfout.') }
    finally { setOtpBusy(false) }
  }

  return (
    <div className="ck ck-gate">
      <style>{CK_CSS}</style>
      <div className="ck-gate-card">
        <div className="ck-gate-side">
          <div className="ck-eyebrow">SecretXperience · Content24</div>
          <h1 className="ck-serif ck-gate-title">Controlekamer</h1>
          <p className="ck-lede">
            Beveiligde toegang. Scan de QR-code met je telefoon en keur dit toestel goed om de
            controlekamer op deze desktop te openen.
          </p>
          <ol className="ck-steps">
            <li><span>1</span> Scan de QR met de camera van je GSM</li>
            <li><span>2</span> Log in als admin op je telefoon</li>
            <li><span>3</span> Vergelijk de code &amp; tik <b>Goedkeuren</b></li>
          </ol>
          <div className="ck-shield">
            <svg viewBox="0 0 24 24" className="ck-ic"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>
            Twee-factor via GSM · geen wachtwoord op de desktop nodig
          </div>
        </div>

        <div className="ck-gate-qr">
          {status === 'loading' && <div className="ck-qr-box ck-skeleton" aria-label="Bezig met laden" />}

          {status === 'pending' && (
            <>
              <div className="ck-qr-box" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <div className="ck-code-label">Verificatiecode</div>
              <div className="ck-code">{code}</div>
              <div className="ck-hint">Wacht op goedkeuring vanaf je telefoon…</div>
              <div className="ck-dots"><i /><i /><i /></div>
              <button className="ck-linkbtn" onClick={copy}>{copied ? 'Gekopieerd ✓' : 'Kopieer goedkeuringslink'}</button>
            </>
          )}

          {status === 'awaiting_otp' && (
            <div className="ck-otp">
              <svg viewBox="0 0 24 24" className="ck-state-ic" style={{ color: 'var(--core)' }}><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/></svg>
              <div className="ck-code-label">SMS-verificatie</div>
              <div className="ck-hint">We stuurden een code naar {phoneHint || 'je telefoon'}.</div>
              <input
                className="ck-otp-input" inputMode="numeric" autoFocus maxLength={8}
                placeholder="______" value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') submitOtp() }}
              />
              {otpErr && <div className="ck-otp-err">{otpErr}</div>}
              <button className="ck-btn" onClick={submitOtp} disabled={otpBusy}>{otpBusy ? 'Controleren…' : 'Bevestigen'}</button>
              <button className="ck-linkbtn" onClick={start}>Nieuwe code aanvragen</button>
            </div>
          )}

          {status === 'approved' && (
            <div className="ck-state ck-ok">
              <svg viewBox="0 0 24 24" className="ck-state-ic"><path d="M20 6L9 17l-5-5"/></svg>
              <div>Goedgekeurd — openen…</div>
            </div>
          )}

          {status === 'denied' && (
            <div className="ck-state ck-bad">
              <svg viewBox="0 0 24 24" className="ck-state-ic"><path d="M18 6L6 18M6 6l12 12"/></svg>
              <div>Toegang geweigerd op de telefoon.</div>
              <button className="ck-btn" onClick={start}>Opnieuw proberen</button>
            </div>
          )}

          {(status === 'expired' || status === 'error') && (
            <div className="ck-state">
              <svg viewBox="0 0 24 24" className="ck-state-ic"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              <div>{status === 'expired' ? 'De code is verlopen.' : 'Er ging iets mis.'}</div>
              <button className="ck-btn" onClick={start}>Nieuwe code</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
