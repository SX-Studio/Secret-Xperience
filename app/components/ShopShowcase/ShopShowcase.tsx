'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BOUTIQUE_SHOPS } from '../../data/shops'

// Partner boutiques band. variant 'large' = 300×400 cards (/shop page, inline),
// 'compact' = 200×300 cards (homepage, portal via portalTo). Data + card images
// are described in app/data/shops.ts.
interface Props {
  variant: 'large' | 'compact'
  portalTo?: string
}

export default function ShopShowcase({ variant, portalTo }: Props) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (portalTo) setMountEl(document.getElementById(portalTo))
  }, [portalTo])

  const W = variant === 'large' ? 300 : 200
  const H = variant === 'large' ? 400 : 150
  const nameSize = variant === 'large' ? 19 : 13.5

  const body = (
    <section aria-label="Partner boutiques" style={{ background: 'var(--bg1, #0a090c)', borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))', padding: '3rem 1.5rem 2.5rem' }}>
      <style>{`
        .sbx-card { display:block; width:${W}px; height:${H}px; flex-shrink:0; border-radius:14px; overflow:hidden; position:relative; border:0.5px solid rgba(197,160,90,0.28); box-shadow:0 8px 28px rgba(0,0,0,0.45); text-decoration:none; transition:transform .15s, border-color .2s; }
        .sbx-card:hover { transform:translateY(-3px); border-color:rgba(197,160,90,0.7); }
        .sbx-row { display:flex; flex-wrap:wrap; gap:16px; justify-content:flex-start; }
        @media(max-width:700px){ .sbx-row { flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding-bottom:6px; -webkit-overflow-scrolling:touch; } .sbx-row::-webkit-scrollbar{display:none} }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.55)', marginBottom: 8 }}>✦ Lingerie &amp; Boutiques</p>
            <h2 style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, color: 'var(--t, #ece8e1)', lineHeight: 1.15, margin: 0 }}>
              Shop the <em style={{ color: '#c5a05a', fontStyle: 'italic' }}>Look</em>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t2, rgba(255,255,255,0.45))', maxWidth: 520, lineHeight: 1.7, marginTop: 8 }}>
              {BOUTIQUE_SHOPS.length} curated lingerie &amp; adult fashion boutiques — from Belgian classics to European couture.
            </p>
          </div>
          {variant === 'compact' && (
            <a href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', border: '0.5px solid rgba(197,160,90,0.4)', borderRadius: 10, color: '#c5a05a', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Visit the Boutique →
            </a>
          )}
        </div>

        <div className="sbx-row">
          {BOUTIQUE_SHOPS.map(s => (
            <a key={s.slug} href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="sbx-card" title={s.name}>
              {s.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/shops/${s.slug}.jpg`} alt={s.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(150deg,#1d1424,#0d0a10)', fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontStyle: 'italic', fontSize: variant === 'large' ? 34 : 20, color: '#c5a05a', textAlign: 'center', padding: '0 14px', lineHeight: 1.25 }}>{s.name}</span>
              )}
              <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${variant === 'large' ? 40 : 22}px 12px ${variant === 'large' ? 12 : 8}px`, background: 'linear-gradient(to top, rgba(5,3,8,0.88), transparent)', color: '#f2ead8', fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: nameSize, textAlign: 'center', letterSpacing: '0.03em' }}>
                {s.name} <span style={{ fontSize: nameSize - 6, color: 'rgba(197,160,90,0.9)' }}>↗</span>
              </span>
            </a>
          ))}
        </div>

        <p style={{ fontSize: 10.5, color: 'var(--t3, rgba(255,255,255,0.25))', marginTop: '1.25rem' }}>
          Independent third-party boutiques — orders and shipping handled on their own sites. Some links may become affiliate links.
        </p>
      </div>
    </section>
  )

  if (portalTo) return mountEl ? createPortal(body, mountEl) : null
  return body
}
