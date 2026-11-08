// Dorcel Club affiliate banner (aff=8103). One source for every placement:
// `wide` is the horizontal strip used in the shop, `tile` is the tall card that
// sits beside the Enjoy with Joy banner on the homepage.
const HREF = 'https://www.dorcelclub.com/en?aff=8103'

export default function DorcelBanner({ variant = 'wide' }: { variant?: 'wide' | 'tile' }) {
  const tile = variant === 'tile'
  return (
    <>
      <style>{`
        .dorcel-banner{transition:transform .25s ease,border-color .18s,box-shadow .18s}
        .dorcel-banner:hover{border-color:rgba(180,20,40,0.75)!important;box-shadow:0 12px 40px rgba(0,0,0,0.55)!important}
        .dorcel-banner.tile:hover{transform:translateY(-3px)}
        @media(max-width:560px){.dorcel-banner.wide{grid-template-columns:1fr!important;gap:1rem!important}}
      `}</style>
      <a
        href={HREF}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`dorcel-banner ${variant}`}
        style={tile ? {
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14,
          minHeight: 360, height: '100%', boxSizing: 'border-box',
          background: 'radial-gradient(ellipse at 85% 10%, rgba(192,0,26,0.35) 0%, transparent 55%), linear-gradient(150deg, rgba(20,8,8,0.98) 0%, rgba(80,10,20,0.85) 100%)',
          border: '0.5px solid rgba(180,20,40,0.45)', borderRadius: 20,
          padding: 'clamp(1.5rem,4vw,2.75rem)', textDecoration: 'none',
          boxShadow: '0 14px 44px rgba(0,0,0,.45)',
        } : {
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1.5rem',
          background: 'linear-gradient(120deg, rgba(20,8,8,0.95) 0%, rgba(80,10,20,0.7) 100%)',
          border: '0.5px solid rgba(180,20,40,0.4)', borderRadius: 16,
          padding: '1.4rem 1.8rem', marginBottom: '2rem', textDecoration: 'none',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#e02030', marginBottom: tile ? 12 : 8 }}>
            ✦ Official Partner · Premium Content
          </div>
          <div style={{ fontFamily: tile ? "'Cormorant Garamond', var(--serif, serif)" : 'var(--serif)', fontSize: tile ? 'clamp(40px,4.4vw,56px)' : 'clamp(18px,3vw,26px)', fontWeight: tile ? 500 : 400, color: '#ece8e1', lineHeight: tile ? 1 : 1.15, marginBottom: tile ? 12 : 6 }}>
            Dorcel Club
          </div>
          <div style={{ fontSize: tile ? 14.5 : 13, color: tile ? 'rgba(236,232,225,0.72)' : 'rgba(236,232,225,0.5)', lineHeight: 1.6, maxWidth: 440 }}>
            Europe&apos;s most prestigious adult studio — exclusive HD films, series &amp; live shows.
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', alignSelf: tile ? 'flex-start' : undefined,
          fontSize: tile ? 14 : 13, fontWeight: 700, color: '#fff',
          background: 'linear-gradient(90deg, #c0001a, #8b000f)',
          borderRadius: tile ? 12 : 10, padding: tile ? '12px 22px' : '9px 18px', flexShrink: 0,
        }}>
          Visit Dorcel Club <i className="ti ti-arrow-right" />
        </span>
      </a>
    </>
  )
}
