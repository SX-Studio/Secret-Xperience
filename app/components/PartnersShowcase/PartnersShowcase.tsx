'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PARTNER_SECTIONS, PARTNER_BADGE, PARTNER_INDUSTRY_IDS, PARTNER_LIFESTYLE_IDS } from '../../data/partners'

// Homepage "Partners & Links" band — every partner from app/data/partners.ts,
// grouped by category, rendered into #partnersShowcaseMount above the footer.
// Categories beyond the first row start collapsed to keep the homepage light;
// "Show all" expands the full directory in place.
const VISIBLE_DEFAULT = 4

export default function PartnersShowcase() {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setMountEl(document.getElementById('partnersShowcaseMount'))
  }, [])

  if (!mountEl) return null

  const ordered = [...PARTNER_INDUSTRY_IDS, ...PARTNER_LIFESTYLE_IDS]
    .map(id => PARTNER_SECTIONS.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
  const visible = expanded ? ordered : ordered.slice(0, VISIBLE_DEFAULT)
  const total = ordered.reduce((n, s) => n + s.items.length, 0)
  const hiddenCount = total - visible.reduce((n, s) => n + s.items.length, 0)

  return createPortal(
    <section aria-label="Partners and links" style={{ background: 'var(--bg1, #0a090c)', borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))', padding: '3.5rem 1.5rem 3rem' }}>
      <style>{`
        .psx-chip { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; background:var(--bg2, rgba(255,255,255,0.03)); border:0.5px solid var(--b2, rgba(255,255,255,0.08)); border-radius:20px; color:var(--t, #ece8e1); font:500 12px var(--sans, 'Poppins', sans-serif); text-decoration:none; white-space:nowrap; transition:border-color .15s, background .15s, transform .12s; }
        .psx-chip:hover { border-color:rgba(197,160,90,0.45); background:rgba(197,160,90,0.08); transform:translateY(-1px); }
        .psx-chip .psx-ext { font-size:10px; color:var(--t3, rgba(255,255,255,0.3)); }
        .psx-cat { margin-bottom:1.5rem; }
        .psx-cat-label { display:flex; align-items:center; gap:8px; font:700 10px var(--sans, 'Poppins',sans-serif); letter-spacing:.14em; text-transform:uppercase; color:rgba(197,160,90,0.6); margin-bottom:0.65rem; }
        .psx-cat-label::after { content:''; flex:1; height:0.5px; background:var(--b, rgba(255,255,255,0.06)); }
        .psx-chips { display:flex; flex-wrap:wrap; gap:8px; }
        @media(max-width:640px){ .psx-chips { flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; } .psx-chips::-webkit-scrollbar { display:none; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.55)', marginBottom: 8 }}>✦ Curated by SecretXperience</p>
            <h2 style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 400, color: 'var(--t, #ece8e1)', lineHeight: 1.15, margin: 0 }}>
              Partners &amp; <em style={{ color: '#c5a05a', fontStyle: 'italic' }}>Links</em>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t2, rgba(255,255,255,0.45))', maxWidth: 520, lineHeight: 1.7, marginTop: 8 }}>
              {total}+ hand-picked businesses for the adult services world — EU adult shops, webcam platforms, nightlife venues, lifestyle brands and industry tools.
            </p>
          </div>
          <a href="/partners" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'transparent', border: '0.5px solid rgba(197,160,90,0.4)', borderRadius: 10, color: '#c5a05a', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
            View full directory →
          </a>
        </div>

        {visible.map(section => (
          <div key={section.id} className="psx-cat">
            <div className="psx-cat-label">
              <span style={{ fontSize: 14, letterSpacing: 0 }}>{section.emoji}</span>
              {section.title}
              <span style={{ color: 'var(--t3, rgba(255,255,255,0.2))', fontWeight: 400 }}>{section.items.length}</span>
            </div>
            <div className="psx-chips">
              {section.items.map(p => {
                const bs = p.badge ? PARTNER_BADGE[p.badge] : null
                const inner = (
                  <>
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    {p.name}
                    {bs && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.06em', padding: '2px 6px', borderRadius: 20, background: bs.bg, color: bs.color, border: `0.5px solid ${bs.border}` }}>{p.badge}</span>}
                    {p.url && <i className="ti ti-external-link psx-ext" aria-hidden="true" />}
                  </>
                )
                return p.url ? (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="psx-chip" title={p.tagline}>{inner}</a>
                ) : (
                  <span key={p.name} className="psx-chip" title={p.tagline} style={{ cursor: 'default' }}>{inner}</span>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ padding: '9px 22px', background: 'var(--bg2, rgba(255,255,255,0.03))', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: 10, color: 'var(--t2, rgba(255,255,255,0.55))', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.03em' }}
          >
            {expanded ? 'Show fewer categories' : `Show all ${ordered.length} categories (${hiddenCount} more partners)`}
          </button>
          <span style={{ fontSize: 10.5, color: 'var(--t3, rgba(255,255,255,0.25))' }}>
            Some links are affiliate links — we may earn a commission at no cost to you.
          </span>
        </div>
      </div>
    </section>,
    mountEl
  )
}
