/* ------------------------------------------------------------------ *
 * AIGirlfriendBanner — affiliate banner for gptgirlfriend.online.
 * Neon "energy portal" CSS art (no external image asset). Placed in
 * the middle of the /creators overview. Whole banner links out to the
 * partner site (external affiliate → nofollow + noopener).
 * ------------------------------------------------------------------ */

export default function AIGirlfriendBanner() {
  return (
    <a
      href="https://www.gptgirlfriend.online/"
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      aria-label="Create your AI girlfriend — 1 free try-out on GPTGirlfriend"
      className="aigf-banner"
      style={{
        display: 'block', textDecoration: 'none', color: 'inherit',
        position: 'relative', overflow: 'hidden',
        borderRadius: '18px', border: '0.5px solid rgba(168,85,247,0.4)',
        background: 'linear-gradient(110deg,#0b0616 0%,#140a26 45%,#1c0a2e 70%,#0b0616 100%)',
        boxShadow: '0 16px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(168,85,247,0.08)',
        minHeight: '190px',
      }}
    >
      <style>{`
        @keyframes aigfWave { 0% { transform: translateX(-12%) rotate(-2deg) } 50% { transform: translateX(12%) rotate(2deg) } 100% { transform: translateX(-12%) rotate(-2deg) } }
        @keyframes aigfWave2 { 0% { transform: translateX(10%) } 50% { transform: translateX(-10%) } 100% { transform: translateX(10%) } }
        @keyframes aigfPortal { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .9 } 50% { transform: translate(-50%,-50%) scale(1.06); opacity: 1 } }
        @keyframes aigfSpin { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes aigfPlus { 0%,100% { opacity:.65; text-shadow: 0 0 10px rgba(236,72,153,.8) } 50% { opacity:1; text-shadow: 0 0 22px rgba(236,72,153,1),0 0 40px rgba(168,85,247,.8) } }
        @keyframes aigfBtnGlow { 0%,100% { box-shadow: 0 0 22px rgba(236,72,153,.45) } 50% { box-shadow: 0 0 34px rgba(168,85,247,.6) } }
        @keyframes aigfDot { 0%,100% { opacity:.4 } 50% { opacity:1 } }
        .aigf-banner:hover { border-color: rgba(236,72,153,0.6) !important; transform: translateY(-3px); }
        .aigf-banner { transition: transform .25s ease, border-color .2s ease; }
        .aigf-banner:hover .aigf-cta { transform: translateY(-1px); filter: brightness(1.08); }
        .aigf-art { position: absolute; inset: 0; pointer-events: none; }
        @media (max-width: 620px) {
          .aigf-inner { padding: 1.5rem 1.25rem !important; }
          .aigf-title { font-size: 1.7rem !important; }
          .aigf-portal-wrap { opacity: .5 !important; }
        }
      `}</style>

      {/* --- neon energy art --- */}
      <div className="aigf-art">
        {/* colour wash */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 62% 50%,rgba(168,85,247,0.35),transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 88% 40%,rgba(59,130,246,0.28),transparent 50%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 74% 70%,rgba(236,72,153,0.3),transparent 55%)' }} />
        {/* energy waves */}
        <div style={{ position: 'absolute', top: '35%', left: '30%', right: '-10%', height: '3px', background: 'linear-gradient(90deg,transparent,#3b82f6,#a855f7,#ec4899,transparent)', filter: 'blur(2px)', animation: 'aigfWave 7s ease-in-out infinite', opacity: 0.8 }} />
        <div style={{ position: 'absolute', top: '58%', left: '25%', right: '-5%', height: '2px', background: 'linear-gradient(90deg,transparent,#ec4899,#a855f7,#3b82f6,transparent)', filter: 'blur(2px)', animation: 'aigfWave2 9s ease-in-out infinite', opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: '48%', left: '35%', right: '0%', height: '2px', background: 'linear-gradient(90deg,transparent,#a855f7,#ec4899,transparent)', filter: 'blur(1.5px)', animation: 'aigfWave 6s ease-in-out infinite reverse', opacity: 0.6 }} />

        {/* portal + silhouette */}
        <div className="aigf-portal-wrap" style={{ position: 'absolute', top: '50%', left: '72%', width: '150px', height: '150px' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '150px', height: '150px', borderRadius: '50%', background: 'conic-gradient(from 0deg,#3b82f6,#a855f7,#ec4899,#a855f7,#3b82f6)', filter: 'blur(9px)', animation: 'aigfSpin 12s linear infinite', opacity: 0.75 }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '96px', height: '132px', transform: 'translate(-50%,-50%)', borderRadius: '48% 48% 44% 44%', background: 'linear-gradient(180deg,#0a0512,#160a28)', boxShadow: 'inset 0 0 30px rgba(168,85,247,0.5)', animation: 'aigfPortal 5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '26px', color: '#ec4899', animation: 'aigfPlus 3s ease-in-out infinite' }}>✚</div>
        </div>
      </div>

      {/* --- copy --- */}
      <div className="aigf-inner" style={{ position: 'relative', zIndex: 2, padding: '2rem 2.25rem', maxWidth: '620px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f0abfc', background: 'rgba(236,72,153,0.12)', border: '0.5px solid rgba(236,72,153,0.4)', padding: '5px 12px', borderRadius: '20px', marginBottom: '14px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 8px #ec4899', animation: 'aigfDot 1.8s ease-in-out infinite' }} />
          AI instant girlfriend generator · 1 free try-out creation
        </div>

        <h2 className="aigf-title" style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.9rem,4vw,2.6rem)', fontWeight: 400, lineHeight: 1.08, margin: '0 0 8px', letterSpacing: '-0.01em', color: '#f4eefb' }}>
          Create Her <span style={{ background: 'linear-gradient(90deg,#ec4899,#a855f7)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: '#ec4899' }}>Your Way</span>
        </h2>
        <p style={{ fontSize: '13.5px', color: '#c4b5d4', letterSpacing: '0.04em', margin: '0 0 20px' }}>
          Look · Personality · Story
        </p>

        <span className="aigf-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '13px 28px', borderRadius: '30px', background: 'linear-gradient(135deg,#ec4899,#a855f7)', color: '#fff', fontSize: '14px', fontWeight: 700, transition: 'transform .2s, filter .2s', animation: 'aigfBtnGlow 3.5s ease-in-out infinite' }}>
          <i className="ti ti-sparkles" /> Create AI Girlfriend
        </span>

        <div style={{ fontSize: '10.5px', color: '#8b7ca0', marginTop: '12px', letterSpacing: '0.02em' }}>
          Partner · gptgirlfriend.online · opens in a new tab
        </div>
      </div>
    </a>
  )
}
