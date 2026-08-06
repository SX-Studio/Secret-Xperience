'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

// Country code → flag emoji
function countryFlag(code: string) {
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(0x1F1E0 + c.charCodeAt(0) - 65)
  )
}

type Model = {
  id: number
  username: string
  snapshotUrl: string
  previewUrlThumbSmall: string
  clickUrl: string
  modelsCountry: string
  tags: string[]
  viewersCount: number
  broadcastHD: boolean
  broadcastVR: boolean
  languages: string[]
  streamRatio: 'vertical' | 'horizontal'
}

const CATEGORIES = [
  { tag: 'girls',   label: 'Girls',   icon: 'ti-girl' },
  { tag: 'couples', label: 'Couples', icon: 'ti-hearts' },
  { tag: 'trans',   label: 'Trans',   icon: 'ti-rainbow' },
  { tag: 'men',     label: 'Guys',    icon: 'ti-man' },
]

export default function LivePage() {
  const [tag, setTag]       = useState('girls')
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async (t: string) => {
    try {
      const res = await fetch(`/api/cams?tag=${t}&limit=24`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setModels(data.models || [])
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    load(tag)
    // Refresh every 30s as required by Stripcash API terms
    timerRef.current = setInterval(() => load(tag), 30_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [tag, load])

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .lp{min-height:100vh;background:var(--bg,#050505);color:var(--t,#ece8e1);font-family:var(--sans,'Poppins',sans-serif)}

        /* back */
        .lp-back{display:inline-flex;align-items:center;gap:6px;padding:14px 20px;
          color:var(--t2,#8c8880);font:400 13px var(--sans);text-decoration:none;transition:color .2s}
        .lp-back:hover{color:var(--t,#ece8e1)}
        .lp-back i{font-size:14px}

        /* hero */
        .lp-hero{padding:8px 24px 28px;max-width:1280px;margin:0 auto;
          display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}
        .lp-badge{display:inline-flex;align-items:center;gap:6px;
          background:rgba(239,68,68,.12);border:0.5px solid rgba(239,68,68,.3);
          color:#ef4444;padding:3px 10px;border-radius:20px;
          font:600 11px/1.6 var(--sans);letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
        .lp-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;
          animation:ldot 1.4s ease-in-out infinite}
        @keyframes ldot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.65)}}
        .lp-title{font-family:var(--serif,'Cormorant Garamond',serif);
          font-size:clamp(26px,4.5vw,44px);font-weight:400;line-height:1.1;
          letter-spacing:-.01em;color:var(--t,#ece8e1);margin-bottom:6px}
        .lp-title em{font-style:italic;
          background:linear-gradient(90deg,#c5a05a 0%,#e8cc88 50%,#c5a05a 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-sub{font-size:13px;color:var(--t2,#8c8880);line-height:1.6;max-width:440px}
        .lp-count{font-size:12px;color:var(--t3,#4c4a47);margin-top:4px}

        /* category tabs */
        .lp-tabs{max-width:1280px;margin:0 auto;padding:0 24px 24px;display:flex;gap:8px;flex-wrap:wrap}
        .lp-tab{display:inline-flex;align-items:center;gap:7px;padding:8px 18px;
          border-radius:10px;border:0.5px solid var(--b2,rgba(255,255,255,.1));
          background:var(--bg2,rgba(255,255,255,.04));
          color:var(--t2,#8c8880);font:500 13px var(--sans);cursor:pointer;transition:all .2s}
        .lp-tab:hover{border-color:rgba(197,160,90,.3);color:var(--t,#ece8e1)}
        .lp-tab.active{background:rgba(197,160,90,.1);border-color:rgba(197,160,90,.4);color:var(--gold,#c5a05a)}
        .lp-tab i{font-size:15px}

        /* grid */
        .lp-grid{max-width:1280px;margin:0 auto;padding:0 24px 64px;
          display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}

        /* model card */
        .mc{position:relative;border-radius:12px;overflow:hidden;
          background:#111;aspect-ratio:9/13;cursor:pointer;
          text-decoration:none;display:block;
          transition:transform .2s,box-shadow .2s}
        .mc:hover{transform:translateY(-3px) scale(1.015);
          box-shadow:0 16px 48px rgba(0,0,0,.7),0 0 0 .5px rgba(197,160,90,.3)}
        .mc img{width:100%;height:100%;object-fit:cover;display:block;
          transition:transform .4s ease}
        .mc:hover img{transform:scale(1.04)}

        /* overlay gradient */
        .mc-overlay{position:absolute;inset:0;
          background:linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.1) 55%,transparent 100%);
          pointer-events:none}

        /* top badges */
        .mc-top{position:absolute;top:8px;left:8px;right:8px;
          display:flex;align-items:flex-start;justify-content:space-between;gap:4px}
        .mc-live{display:inline-flex;align-items:center;gap:4px;
          background:rgba(239,68,68,.85);color:#fff;
          padding:2px 7px;border-radius:20px;font:700 9px/1.5 var(--sans);letter-spacing:.08em;text-transform:uppercase;
          backdrop-filter:blur(4px)}
        .mc-live span{width:5px;height:5px;border-radius:50%;background:#fff;
          animation:ldot 1.2s ease-in-out infinite}
        .mc-hd{background:rgba(0,0,0,.6);color:var(--gold,#c5a05a);
          padding:2px 6px;border-radius:6px;font:700 9px/1.5 var(--sans);letter-spacing:.06em;
          backdrop-filter:blur(4px)}
        .mc-vr{background:rgba(99,102,241,.7);color:#fff;
          padding:2px 6px;border-radius:6px;font:700 9px/1.5 var(--sans);letter-spacing:.06em}

        /* bottom info */
        .mc-info{position:absolute;bottom:0;left:0;right:0;padding:10px 10px 10px}
        .mc-name{font:600 13px/1.3 var(--sans);color:#fff;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
        .mc-meta{display:flex;align-items:center;justify-content:space-between;gap:4px}
        .mc-viewers{display:inline-flex;align-items:center;gap:4px;
          font:500 11px var(--sans);color:rgba(255,255,255,.7)}
        .mc-viewers i{font-size:11px}
        .mc-flag{font-size:13px;line-height:1}

        /* token CTA — fades in on hover */
        .mc-cta{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,.55);opacity:0;transition:opacity .2s;pointer-events:none}
        .mc:hover .mc-cta{opacity:1}
        .mc-cta-pill{background:var(--gold,#c5a05a);color:#050505;
          padding:6px 14px;border-radius:20px;font:700 11px/1.4 var(--sans);
          letter-spacing:.04em;white-space:nowrap;
          box-shadow:0 4px 16px rgba(197,160,90,.4)}
        @media(hover:none){.mc-cta{display:none}}

        /* skeleton loader */
        .mc-skel{border-radius:12px;aspect-ratio:9/13;
          background:linear-gradient(90deg,#111 25%,#1a1a1a 50%,#111 75%);
          background-size:200% 100%;animation:skelshimmer 1.4s infinite}
        @keyframes skelshimmer{to{background-position:-200% 0}}

        /* empty / error */
        .lp-empty{max-width:1280px;margin:40px auto;padding:0 24px;
          text-align:center;color:var(--t2,#8c8880);font-size:14px}

        /* disclaimer */
        .lp-disc{max-width:1280px;margin:0 auto;padding:20px 24px 48px;
          font-size:11px;color:var(--t3,#4c4a47);line-height:1.8;
          border-top:0.5px solid var(--b,rgba(255,255,255,.05))}
        .lp-disc a{color:inherit;text-decoration:underline;opacity:.7}

        /* mobile */
        @media(max-width:640px){
          .lp-grid{grid-template-columns:repeat(2,1fr);gap:8px;padding:0 16px 48px}
          .lp-hero{padding:8px 16px 20px}
          .lp-tabs{padding:0 16px 16px}
          .lp-disc{padding:16px 16px 40px}
          .mc-name{font-size:11px}
        }
        @media(min-width:1024px){
          .lp-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
        }
      `}</style>

      <div className="lp">
        <a href="/" className="lp-back">
          <i className="ti ti-arrow-left" aria-hidden="true" /> SecretXperience
        </a>

        <div className="lp-hero">
          <div>
            <div className="lp-badge">
              <span className="lp-dot" />
              Live Now
            </div>
            <h1 className="lp-title">Private <em>Live Shows</em></h1>
            <p className="lp-sub">Watch live performers in real time. Discreet, exclusive, available now.</p>
            {!loading && !error && (
              <p className="lp-count">{models.length} models online</p>
            )}
          </div>
        </div>

        {/* Live umbrella — cams · shows · chat */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 22px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: '0.5px solid #c5a05a', background: 'rgba(197,160,90,0.15)', color: '#e0c082' }}>
            <i className="ti ti-video" aria-hidden="true" /> Live Cams
          </span>
          <a href="/livestreams" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,0.14)', color: 'rgba(236,232,225,0.7)' }}>
            <i className="ti ti-broadcast" aria-hidden="true" /> Live Shows
          </a>
          <a href="/messages" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,0.14)', color: 'rgba(236,232,225,0.7)' }}>
            <i className="ti ti-message-circle" aria-hidden="true" /> Live Chat
          </a>
        </div>

        {/* Category tabs */}
        <div className="lp-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c.tag}
              className={`lp-tab${tag === c.tag ? ' active' : ''}`}
              onClick={() => { setTag(c.tag); setLoading(true) }}
            >
              <i className={`ti ${c.icon}`} aria-hidden="true" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Model grid */}
        <div className="lp-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mc-skel" />
              ))
            : error
            ? null
            : models.map(m => (
                <a
                  key={m.id}
                  href={m.clickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc"
                  aria-label={`Watch ${m.username} live`}
                >
                  <img
                    src={m.snapshotUrl || m.previewUrlThumbSmall}
                    alt={m.username}
                    loading={models.indexOf(m) < 6 ? 'eager' : 'lazy'}
                    fetchPriority={models.indexOf(m) < 4 ? 'high' : 'auto'}
                    onError={(e) => {
                      const img = e.currentTarget
                      if (img.src !== m.previewUrlThumbSmall) {
                        img.src = m.previewUrlThumbSmall
                      }
                    }}
                  />
                  <div className="mc-overlay" />
                  <div className="mc-cta">
                    <span className="mc-cta-pill">Get 50 Tokens Free</span>
                  </div>
                  <div className="mc-top">
                    <div className="mc-live">
                      <span />
                      LIVE
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {m.broadcastVR && <span className="mc-vr">VR</span>}
                      {m.broadcastHD && <span className="mc-hd">HD</span>}
                    </div>
                  </div>
                  <div className="mc-info">
                    <div className="mc-name">{m.username}</div>
                    <div className="mc-meta">
                      <span className="mc-viewers">
                        <i className="ti ti-eye" />
                        {m.viewersCount.toLocaleString()}
                      </span>
                      <span className="mc-flag">{countryFlag(m.modelsCountry)}</span>
                    </div>
                  </div>
                </a>
              ))
          }
        </div>

        {error && (
          <div className="lp-empty">
            <i className="ti ti-wifi-off" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
            Live feeds temporarily unavailable. Please try again shortly.
            <br />
            <button
              onClick={() => { setError(false); setLoading(true); load(tag) }}
              style={{ marginTop: 12, padding: '8px 20px', background: 'rgba(197,160,90,0.12)', border: '0.5px solid rgba(197,160,90,0.3)', borderRadius: 8, color: '#c5a05a', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)' }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && models.length === 0 && (
          <div className="lp-empty">No live models found in this category right now.</div>
        )}

        <div className="lp-disc">
          Live cam content is provided by Stripchat. All performers are consenting adults aged 18+.
          By viewing this page you confirm you are 18 or older and agree to our{' '}
          <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          SecretXperience participates in the Stripcash affiliate programme and may receive compensation for referrals.
        </div>
      </div>
    </>
  )
}
