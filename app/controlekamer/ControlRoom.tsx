'use client'

import { useEffect, useState } from 'react'
import { CK_GROUPS } from '../data/controlekamer'
import { CK_CSS } from './styles'

type Stats = {
  listings: number; pendingListings: number; users: number; advertisers: number
  openReports: number; pendingVerifications: number; subscribers: number
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" className="ck-ic ck-arr" width="16" height="16"><path d="M7 17L17 7M9 7h8v8"/></svg>
}

export default function ControlRoom() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [locking, setLocking] = useState(false)

  useEffect(() => {
    fetch('/api/controlekamer/stats').then(r => r.ok ? r.json() : null).then(setStats).catch(() => {})
  }, [])

  const lock = async () => {
    setLocking(true)
    try { await fetch('/api/controlekamer/lock', { method: 'POST' }) } catch {}
    window.location.reload()
  }

  const statCards: { n: number | string; l: string; alert?: boolean }[] = stats ? [
    { n: stats.listings, l: 'Advertenties' },
    { n: stats.pendingListings, l: 'In review', alert: stats.pendingListings > 0 },
    { n: stats.pendingVerifications, l: 'Verificaties', alert: stats.pendingVerifications > 0 },
    { n: stats.openReports, l: 'Open reports', alert: stats.openReports > 0 },
    { n: stats.users, l: 'Leden' },
    { n: stats.advertisers, l: 'Adverteerders' },
    { n: stats.subscribers, l: 'Nieuwsbrief' },
  ] : []

  return (
    <div className="ck ck-room">
      <style>{CK_CSS}</style>
      <div className="ck-wrap">
        <div className="ck-top">
          <div>
            <div className="ck-eyebrow">Controlekamer · Command Centre</div>
            <h1 className="ck-serif ck-h1"><span className="a">SX.eu</span> <span style={{ color: 'var(--faint)' }}>×</span> <span className="b">Content24</span></h1>
            <p className="ck-sub">Eén scherm om beide websites te besturen — alle backends, dashboards en programma’s die aan SX &amp; Content24 gekoppeld zijn.</p>
          </div>
          <div className="ck-top-actions">
            <span className="ck-pill">
              <svg viewBox="0 0 24 24" className="ck-ic" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              Sessie · 12u geldig
            </span>
            <button className="ck-lock" onClick={lock} disabled={locking}>
              <svg viewBox="0 0 24 24" className="ck-ic" width="14" height="14"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
              {locking ? 'Vergrendelen…' : 'Vergrendel'}
            </button>
          </div>
        </div>

        <div className="ck-stats">
          {stats ? statCards.map((s, i) => (
            <div key={i} className={`ck-stat${s.alert ? ' alert' : ''}`}>
              <div className="n">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          )) : Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="ck-stat"><div className="n" style={{ color: 'var(--faint)' }}>—</div><div className="l">laden…</div></div>
          ))}
        </div>

        <div className="ck-section-h">
          <h2>Backend &amp; gekoppelde programma’s</h2>
          <span className="tag">{CK_GROUPS.reduce((n, g) => n + g.links.length, 0)} links</span>
        </div>
        <div className="ck-grid">
          {CK_GROUPS.map(group => (
            <article key={group.id} className={`ck-card ${group.brand}`}>
              <div className="ck-card-h"><h3>{group.title}</h3></div>
              <p className="ck-card-blurb">{group.blurb}</p>
              <ul className="ck-links">
                {group.links.map(link => {
                  const external = /^https?:\/\//.test(link.href)
                  return (
                    <li key={link.name}>
                      <a href={link.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                        <div className="ck-ln">
                          <div className="t">{link.name}{link.configure && <span className="ck-cfg" title="URL nog te bevestigen">check url</span>}</div>
                          <div className="d">{link.desc}</div>
                        </div>
                        <ArrowIcon />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </article>
          ))}
        </div>

        <div className="ck-foot">
          <span>SX × Content24 · Front &amp; Backend API</span>
          <span>Toegang via QR · GSM 2FA</span>
        </div>
      </div>
    </div>
  )
}
