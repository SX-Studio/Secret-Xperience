'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ONLYFANS_GROUPS, ONLYFANS_TOTAL } from '../../data/onlyfans'

// OnlyFans creator directory band. Data lives in app/data/onlyfans.ts.
// Renders inline (creators page) or into a mount div via portal (homepage,
// pass portalTo) — same pattern as PremiumBanner/PartnersShowcase.
const OF_BLUE = '#00aeef'

// Avatar next to each link: tries /onlyfans/<handle>.jpg from /public (drop the
// creator's photo there — filename = handle with dots/dashes as-is). Until the
// file exists it falls back to an initials monogram. OnlyFans avatars cannot be
// hotlinked or fetched programmatically (authenticated API, bot protection).
function OFAvatar({ name, handle }: { name: string; handle: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  if (failed) {
    return (
      <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(0,174,239,0.35), rgba(0,116,190,0.55))', border: '1px solid rgba(0,174,239,0.45)', color: '#eaf7ff', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.02em' }}>
        {initials}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/onlyfans/${handle}.jpg`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,174,239,0.45)', background: 'rgba(0,174,239,0.12)' }}
    />
  )
}

export default function OnlyFansShowcase({ portalTo }: { portalTo?: string }) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (portalTo) setMountEl(document.getElementById(portalTo))
  }, [portalTo])

  const body = (
    <section aria-label="OnlyFans creators" style={{ background: 'var(--bg1, #0a090c)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderLeft: 'none', borderRight: 'none', padding: '3rem 1.5rem 2.5rem' }}>
      <style>{`
        .ofx-chip { display:inline-flex; align-items:center; gap:8px; padding:5px 14px 5px 6px; background:var(--bg2, rgba(255,255,255,0.03)); border:0.5px solid rgba(0,174,239,0.22); border-radius:20px; color:var(--t, #ece8e1); font:500 12.5px var(--sans, 'Poppins', sans-serif); text-decoration:none; white-space:nowrap; transition:border-color .15s, background .15s, transform .12s; }
        .ofx-chip:hover { border-color:rgba(0,174,239,0.6); background:rgba(0,174,239,0.08); transform:translateY(-1px); }
        .ofx-chip .ofx-ext { font-size:10px; color:var(--t3, rgba(255,255,255,0.3)); }
        .ofx-group { margin-bottom:1.4rem; }
        .ofx-group-label { display:flex; align-items:center; gap:8px; font:700 10px var(--sans, 'Poppins',sans-serif); letter-spacing:.14em; text-transform:uppercase; color:rgba(0,174,239,0.75); margin-bottom:0.65rem; }
        .ofx-group-label::after { content:''; flex:1; height:0.5px; background:var(--b, rgba(255,255,255,0.06)); }
        .ofx-chips { display:flex; flex-wrap:wrap; gap:8px; }
        @media(max-width:640px){ .ofx-chips { flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; } .ofx-chips::-webkit-scrollbar { display:none; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(0,174,239,0.7)', marginBottom: 8 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: OF_BLUE, boxShadow: '0 0 8px rgba(0,174,239,0.7)', marginRight: 7, verticalAlign: 'middle' }} />
              Creator Spotlight
            </p>
            <h2 style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, color: 'var(--t, #ece8e1)', lineHeight: 1.15, margin: 0 }}>
              OnlyFans <em style={{ color: OF_BLUE, fontStyle: 'italic' }}>Creators</em>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t2, rgba(255,255,255,0.45))', maxWidth: 520, lineHeight: 1.7, marginTop: 8 }}>
              {ONLYFANS_TOTAL} independent creators from Belgium and across Europe — subscribe directly on their OnlyFans page.
            </p>
          </div>
          <a href="/advertise" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'transparent', border: '0.5px solid rgba(0,174,239,0.4)', borderRadius: 10, color: OF_BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
            Get listed here →
          </a>
        </div>

        {ONLYFANS_GROUPS.map(group => (
          <div key={group.id} className="ofx-group">
            <div className="ofx-group-label">
              <span style={{ fontSize: 14, letterSpacing: 0 }}>{group.flag}</span>
              {group.label}
              <span style={{ color: 'var(--t3, rgba(255,255,255,0.2))', fontWeight: 400 }}>{group.items.length}</span>
            </div>
            <div className="ofx-chips">
              {group.items.map(c => (
                <a key={c.handle} href={c.url} target="_blank" rel="noopener noreferrer nofollow" className="ofx-chip" title={`@${c.handle} on OnlyFans`}>
                  <OFAvatar name={c.name} handle={c.handle} />
                  {c.name}
                  <i className="ti ti-external-link ofx-ext" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 10.5, color: 'var(--t3, rgba(255,255,255,0.25))', marginTop: '1.25rem' }}>
          All creators are independent (18+). Links open on OnlyFans; some links contain referral codes.
        </p>
      </div>
    </section>
  )

  if (portalTo) return mountEl ? createPortal(body, mountEl) : null
  return body
}
