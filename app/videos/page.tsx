'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '../lib/supabase'

type Listing = {
  id: string
  title: string | null
  category: string | null
  city: string | null
  country: string | null
  images: string[] | null
  videos: string[] | null
  verified: boolean | null
}

// Curated video destinations already live on the platform — keeps the category
// full while advertiser video showcases roll in.
const RAILS = [
  { href: '/live', icon: 'ti-video', label: 'Live Cams', sub: 'Real-time private shows', accent: '#ef6d86' },
  { href: '/livestreams', icon: 'ti-broadcast', label: 'Live Shows', sub: 'Scheduled performances', accent: '#c79bef' },
  { href: '/creators', icon: 'ti-player-play', label: 'Creator Clips', sub: 'Subscriptions & pay-per-view', accent: '#5fe0c4' },
]

function poster(l: Listing) {
  return (l.images ?? []).find(Boolean) || ''
}

export default function VideosPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Listing | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('listings')
        .select('id,title,category,city,country,images,videos,verified')
        .eq('active', true)
        .not('videos', 'is', null)
        .order('created_at', { ascending: false })
        .limit(60)
      if (cancelled) return
      const withVideo = (data ?? []).filter(
        (l: Listing) => (l.videos ?? []).some(Boolean)
      )
      setRows(withVideo)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [supabase])

  // close lightbox on Escape
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const activeSrc = active ? (active.videos ?? []).find(Boolean) : ''

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        .vp{min-height:100vh;background:var(--bg,#050505);color:var(--t,#ece8e1);font-family:var(--sans,'Poppins',sans-serif)}
        .vp-back{display:inline-flex;align-items:center;gap:6px;padding:14px 20px;color:var(--t2,#8c8880);font:400 13px var(--sans);text-decoration:none;transition:color .2s}
        .vp-back:hover{color:var(--t,#ece8e1)}
        .vp-back i{font-size:14px}

        .vp-hero{padding:8px 24px 26px;max-width:1280px;margin:0 auto}
        .vp-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(159,130,200,.14);border:0.5px solid rgba(159,130,200,.34);color:#c79bef;padding:3px 10px;border-radius:20px;font:600 11px/1.6 var(--sans);letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}
        .vp-badge i{font-size:12px}
        .vp-title{font-family:var(--serif,'Cormorant Garamond',serif);font-size:clamp(28px,5vw,50px);font-weight:400;line-height:1.05;letter-spacing:-.01em;margin:0 0 8px}
        .vp-title em{font-style:italic;background:linear-gradient(90deg,#9f82c8 0%,#e0c8ff 50%,#9f82c8 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .vp-sub{font-size:14px;color:var(--t2,#8c8880);line-height:1.6;max-width:520px}

        /* rails */
        .vp-rails{max-width:1280px;margin:0 auto;padding:0 24px 30px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .vp-rail{display:flex;align-items:center;gap:12px;text-decoration:none;padding:16px 18px;border-radius:14px;border:0.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);transition:transform .2s,border-color .2s,background .2s}
        .vp-rail:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.06)}
        .vp-rail-ic{width:42px;height:42px;flex:0 0 42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px}
        .vp-rail-l{font:600 14px var(--sans);color:var(--t,#ece8e1);margin-bottom:2px}
        .vp-rail-s{font:400 12px var(--sans);color:var(--t2,#8c8880)}

        .vp-secttl{max-width:1280px;margin:0 auto;padding:6px 24px 14px;display:flex;align-items:baseline;justify-content:space-between;gap:12px}
        .vp-secttl h2{font:400 22px/1.2 var(--serif,'Cormorant Garamond',serif);margin:0}
        .vp-secttl span{font:400 12px var(--sans);color:var(--t3,#4c4a47)}

        /* grid */
        .vp-grid{max-width:1280px;margin:0 auto;padding:0 24px 56px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
        .vc{position:relative;border-radius:14px;overflow:hidden;background:#111;aspect-ratio:9/13;cursor:pointer;border:0.5px solid rgba(255,255,255,.06);transition:transform .2s,box-shadow .2s}
        .vc:hover{transform:translateY(-3px) scale(1.012);box-shadow:0 16px 48px rgba(0,0,0,.7),0 0 0 .5px rgba(159,130,200,.4)}
        .vc img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}
        .vc:hover img{transform:scale(1.05)}
        .vc-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 20%,#241a30,#0c0810);color:#5c5470;font-size:34px}
        .vc-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.05) 55%,transparent 100%);pointer-events:none}
        .vc-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:rgba(10,7,16,.5);border:1.5px solid rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);transition:transform .2s,background .2s}
        .vc:hover .vc-play{transform:translate(-50%,-50%) scale(1.12);background:rgba(159,130,200,.5)}
        .vc-play i{font-size:22px;color:#fff;margin-left:3px}
        .vc-info{position:absolute;bottom:0;left:0;right:0;padding:12px 12px 11px}
        .vc-name{font:600 13.5px/1.3 var(--sans);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .vc-meta{margin-top:3px;font:400 11.5px var(--sans);color:rgba(255,255,255,.62);display:flex;align-items:center;gap:6px}
        .vc-badge{position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;gap:4px;background:rgba(10,7,16,.55);color:#c79bef;padding:2px 8px;border-radius:20px;font:700 9px/1.6 var(--sans);letter-spacing:.06em;text-transform:uppercase;backdrop-filter:blur(4px)}

        .vc-skel{border-radius:14px;aspect-ratio:9/13;background:linear-gradient(90deg,#131013 25%,#1c1820 50%,#131013 75%);background-size:200% 100%;animation:vshim 1.4s infinite}
        @keyframes vshim{to{background-position:-200% 0}}

        /* empty */
        .vp-empty{max-width:720px;margin:8px auto 0;padding:34px 24px 60px;text-align:center}
        .vp-empty-ic{width:64px;height:64px;margin:0 auto 16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#c79bef;background:radial-gradient(circle at 50% 40%,rgba(159,130,200,.22),rgba(159,130,200,.04));border:0.5px solid rgba(159,130,200,.28)}
        .vp-empty h3{font:400 24px/1.2 var(--serif,'Cormorant Garamond',serif);margin:0 0 8px}
        .vp-empty p{font:400 14px/1.7 var(--sans);color:var(--t2,#8c8880);margin:0 0 20px}
        .vp-cta{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:999px;text-decoration:none;background:linear-gradient(90deg,#9f82c8,#c79bef);color:#0a0710;font:700 13px var(--sans)}
        .vp-cta i{font-size:15px}

        /* lightbox */
        .vp-lb{position:fixed;inset:0;z-index:80;background:rgba(4,2,8,.92);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)}
        .vp-lb-inner{width:min(560px,100%);max-height:90vh;display:flex;flex-direction:column;gap:12px}
        .vp-lb video{width:100%;max-height:78vh;border-radius:14px;background:#000;box-shadow:0 30px 90px rgba(0,0,0,.6)}
        .vp-lb-bar{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .vp-lb-t{font:600 15px var(--sans);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .vp-lb-x{flex:0 0 auto;width:38px;height:38px;border-radius:50%;border:0.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .vp-lb-x:hover{background:rgba(255,255,255,.14)}

        .vp-disc{max-width:1280px;margin:0 auto;padding:22px 24px 48px;font-size:11px;color:var(--t3,#4c4a47);line-height:1.8;border-top:0.5px solid rgba(255,255,255,.05)}

        @media(max-width:820px){.vp-rails{grid-template-columns:1fr}}
        @media(max-width:640px){
          .vp-grid{grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px 48px}
          .vp-hero{padding:8px 16px 20px}
          .vp-rails{padding:0 16px 24px}
          .vp-secttl{padding:6px 16px 12px}
        }
      `}</style>

      <div className="vp">
        <a href="/" className="vp-back">
          <i className="ti ti-arrow-left" aria-hidden="true" /> SecretXperience
        </a>

        <div className="vp-hero">
          <div className="vp-badge">
            <i className="ti ti-movie" aria-hidden="true" /> On Demand
          </div>
          <h1 className="vp-title">Watch in <em>full frame.</em></h1>
          <p className="vp-sub">
            Video showcases, teaser reels and premium clips from verified advertisers —
            play them right here, then step behind the closed door.
          </p>
        </div>

        {/* live video rails */}
        <div className="vp-rails">
          {RAILS.map(r => (
            <a key={r.href} href={r.href} className="vp-rail">
              <span className="vp-rail-ic" style={{ background: `${r.accent}22`, color: r.accent }}>
                <i className={`ti ${r.icon}`} aria-hidden="true" />
              </span>
              <span>
                <span className="vp-rail-l" style={{ display: 'block' }}>{r.label}</span>
                <span className="vp-rail-s">{r.sub}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="vp-secttl">
          <h2>Advertiser reels</h2>
          {!loading && rows.length > 0 && <span>{rows.length} video{rows.length === 1 ? '' : 's'}</span>}
        </div>

        {loading ? (
          <div className="vp-grid">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="vc-skel" />)}
          </div>
        ) : rows.length > 0 ? (
          <div className="vp-grid">
            {rows.map(l => {
              const p = poster(l)
              return (
                <div key={l.id} className="vc" onClick={() => setActive(l)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActive(l) }}
                  aria-label={`Play ${l.title || 'video'}`}>
                  {p
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p} alt={l.title || 'video'} loading="lazy" />
                    : <div className="vc-noimg"><i className="ti ti-movie" aria-hidden="true" /></div>}
                  <div className="vc-ov" />
                  {l.verified && <span className="vc-badge"><i className="ti ti-rosette-discount-check-filled" aria-hidden="true" /> Verified</span>}
                  <span className="vc-play"><i className="ti ti-player-play-filled" aria-hidden="true" /></span>
                  <div className="vc-info">
                    <div className="vc-name">{l.title || 'Untitled'}</div>
                    <div className="vc-meta">
                      {l.city && <span>{l.city}</span>}
                      {l.category && <span>· {l.category}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="vp-empty">
            <div className="vp-empty-ic"><i className="ti ti-movie" aria-hidden="true" /></div>
            <h3>The reel is loading — literally.</h3>
            <p>
              No advertiser video showcases are live just yet. Verified advertisers can add a
              teaser reel to any listing and it will appear here first. In the meantime, the
              rooms above are streaming right now.
            </p>
            <a href="/listings/create" className="vp-cta">
              <i className="ti ti-upload" aria-hidden="true" /> Add your video showcase
            </a>
          </div>
        )}

        <div className="vp-disc">
          All performers appearing in videos on SecretXperience are consenting adults aged 18 or older.
          By viewing this page you confirm you are 18+ and agree to our{' '}
          <a href="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms of Service</a> and{' '}
          <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</a>.
        </div>
      </div>

      {active && activeSrc && (
        <div className="vp-lb" onClick={() => setActive(null)}>
          <div className="vp-lb-inner" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
            <div className="vp-lb-bar">
              <span className="vp-lb-t">{active.title || 'Video'}</span>
              <button className="vp-lb-x" onClick={() => setActive(null)} aria-label="Close">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={activeSrc} controls autoPlay playsInline poster={poster(active)} />
          </div>
        </div>
      )}
    </>
  )
}
