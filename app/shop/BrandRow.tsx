import Link from 'next/link'
import type { Brand } from './brands'

/**
 * Partner brands on the storefront home. Each card opens the brand's page on
 * our domain (its featured items + a counted link out), not the brand's site
 * directly — the brand page is what a brand is shown when we pitch placement.
 * The store shows one row per brand kind (sex toys / lingerie), each with its own title.
 */
export default function BrandRow({ brands, basePath, eyebrow, title, accent, label, wide = false }: {
  brands: Brand[]; basePath: string; eyebrow: string; title: string; accent: string; label: string
  /** Landscape cards (≈2:1), for shops whose cover art is a wide promo photo. */
  wide?: boolean
}) {
  if (brands.length === 0) return null
  return (
    <section aria-label={`${title} ${accent}`} style={{ margin: '3rem 0 0' }}>
      <style>{`
        .brw-row { display:flex; flex-wrap:wrap; gap:14px; }
        .brw-card { display:block; width:200px; height:260px; flex-shrink:0; border-radius:14px; overflow:hidden; position:relative; border:0.5px solid rgba(197,160,90,0.28); box-shadow:0 8px 28px rgba(0,0,0,0.45); text-decoration:none; transition:transform .15s, border-color .2s; background:linear-gradient(150deg,#2a0d18,#0d0a14); }
        .brw-card:hover { transform:translateY(-3px); border-color:rgba(197,160,90,0.7); }
        .brw-card.brw-wide { width:340px; height:167px; }
        @media(max-width:700px){ .brw-row{ flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding-bottom:6px; margin:0 -1.5rem; padding-left:1.5rem; padding-right:1.5rem; } .brw-row::-webkit-scrollbar{display:none} .brw-card{ width:150px; height:200px; } .brw-card.brw-wide{ width:260px; height:128px; } .brw-wide .brw-tag{ display:none; } }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.6)', marginBottom: 8 }}>✦ {eyebrow}</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 400, margin: 0 }}>
            {title} <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{accent}</em>
          </h2>
        </div>
        <span style={{ fontSize: 12, color: 'var(--t3)' }}>{brands.length} {label}</span>
      </div>
      <div className="brw-row">
        {brands.map(b => (
          <Link key={b.id} href={`${basePath}/${b.slug}`} className={wide ? 'brw-card brw-wide' : 'brw-card'}>
            {b.cover_url ? (
              <img src={b.cover_url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 56, color: 'rgba(197,160,90,0.2)' }}>
                {b.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,6,18,0.92) 0%, rgba(8,6,18,0.2) 45%, transparent 70%)' }} />
            <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
              {b.logo_url && <img src={b.logo_url} alt="" style={{ height: 22, maxWidth: '70%', objectFit: 'contain', display: 'block', marginBottom: 8 }} />}
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: '#ece8e1', lineHeight: 1.15 }} translate="no" className="notranslate">{b.name}</div>
              {b.tagline && <div className="brw-tag" style={{ fontSize: 11, color: 'rgba(236,232,225,0.55)', marginTop: 4, lineHeight: 1.35 }}>{b.tagline}</div>}
            </div>
            {b.featured && (
              <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 6, background: 'rgba(197,160,90,0.18)', color: 'var(--gold)', border: '0.5px solid rgba(197,160,90,0.4)' }}>Featured</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
