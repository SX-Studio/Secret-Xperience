/* ------------------------------------------------------------------ *
 * CollabsBanner — linked partner banner for collabs-photography.com.
 * Uses /promos/collabs.jpg when present; until the file is added it
 * shows a CSS "COLLABS · Fashion Photography" wordmark fallback. The
 * photo is layered as a background-image (not <img>) so a missing file
 * reveals the fallback with no broken-image icon.
 * External affiliate link → nofollow + sponsored + new tab.
 * ------------------------------------------------------------------ */

export default function CollabsBanner() {
  return (
    <a
      href="https://www.collabs-photography.com/"
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      aria-label="COLLABS — Fashion Photography"
      className="collabs-banner"
      style={{
        display: 'block', position: 'relative', overflow: 'hidden',
        borderRadius: '16px', border: '0.5px solid var(--b2)',
        boxShadow: '0 14px 44px rgba(0,0,0,0.5)',
        textDecoration: 'none',
        aspectRatio: '970 / 250', width: '100%',
        background: 'linear-gradient(120deg,#0c1a1c 0%,#123033 45%,#0a1416 100%)',
      }}
    >
      <style>{`
        .collabs-banner { transition: transform .25s ease, border-color .2s ease; }
        .collabs-banner:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.25); }
        .collabs-banner:hover .collabs-photo { transform: scale(1.04); }
        .collabs-photo { transition: transform .5s ease; }
        @media (max-width: 640px) {
          .collabs-banner { aspect-ratio: 970 / 300; }
          .collabs-word { font-size: clamp(2.2rem,13vw,4rem) !important; }
        }
      `}</style>

      {/* real photo layer (background-image; absent = transparent, reveals fallback) */}
      <div
        className="collabs-photo"
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: 'url(/promos/collabs.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />

      {/* CSS wordmark fallback (shows only while the photo file is missing) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%,rgba(64,140,140,0.35),transparent 60%)' }} />
        <div className="collabs-word" style={{ position: 'relative', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(2.6rem,9vw,5rem)', letterSpacing: '0.06em', color: '#f4f1ea', lineHeight: 1, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          COLLABS
        </div>
        <div style={{ position: 'relative', marginTop: '0.6rem', fontSize: 'clamp(0.65rem,1.8vw,1rem)', letterSpacing: '0.42em', textTransform: 'uppercase', color: '#cfe3e0', fontWeight: 500 }}>
          Fashion&nbsp;Photography
        </div>
      </div>

      {/* hover affordance */}
      <span style={{ position: 'absolute', bottom: '12px', right: '14px', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(8,6,18,0.55)', border: '0.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: '#f4f1ea', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em' }}>
        Visit COLLABS <i className="ti ti-arrow-up-right" />
      </span>
    </a>
  )
}
