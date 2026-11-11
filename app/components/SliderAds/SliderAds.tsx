'use client'
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '../../lib/supabase'
import { focusPosition } from '../../lib/imageFocus'
import gsap from 'gsap'

interface AdSlide {
  id: string
  title: string
  category: string
  city: string
  country: string
  price_from?: number
  images?: string[]
  image_focus?: Record<string, { x: number; y: number }>
  verified?: boolean
  premium?: boolean
}

const ACC: Record<string, string> = {
  escorts: '#c5a05a', companionship: '#d4956a', nightlife: '#7a8aee',
  creators: '#b06ae0', rentals: '#5ab0c5', hotels: '#c5b05a', events: '#e05a8a',
}
const GRAD: Record<string, string> = {
  escorts:       'linear-gradient(160deg,#1a0a18,#2d1040,#1a0510)',
  companionship: 'linear-gradient(160deg,#0d0b08,#2a1a0d,#1a0d0b)',
  nightlife:     'linear-gradient(160deg,#06060f,#0d0d2a,#0a0614)',
  creators:      'linear-gradient(160deg,#0a0808,#1a0d1a,#0d0a0a)',
  rentals:       'linear-gradient(160deg,#080d10,#0d1a24,#080a0d)',
  hotels:        'linear-gradient(160deg,#0a0a08,#1a1a0d,#0d0d08)',
  events:        'linear-gradient(160deg,#0a0808,#240d0d,#140808)',
}

// How many px of the adjacent card to show peeking in on each side
const PEEK = 72

export default function SliderAds() {
  const [slides, setSlides]   = useState<AdSlide[]>([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused]   = useState(false)
  const [mountEl, setMountEl] = useState<Element | null>(null)
  const [ctaHref, setCtaHref] = useState('/advertise')

  const stageRef    = useRef<HTMLDivElement>(null)
  const ambientRef  = useRef<HTMLDivElement>(null)
  const progRef     = useRef<HTMLDivElement>(null)
  const cardRefs    = useRef<(HTMLDivElement | null)[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animRef     = useRef(false)
  const stageW      = useRef(0)

  // Resolve CTA destination based on auth state
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCtaHref(session ? '/dashboard' : '/advertise')
    })
  }, [])

  // Load featured advertisements
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('listings')
      .select('id,title,category,city,country,price_from,images,image_focus,verified,premium,featured_until')
      .eq('active', true)
      .not('featured_until', 'is', null)
      .order('featured_until', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data?.length) {
          setSlides(data.map((l: any) => ({
            id: l.id, title: l.title || '—',
            category: l.category || 'escorts',
            city: l.city || '', country: l.country || '',
            price_from: l.price_from, images: l.images || [],
            verified: l.verified, premium: l.premium,
          })))
        }
      })
  }, [])

  // Portal mount
  useEffect(() => {
    const el = document.getElementById('sliderAdsMount')
    if (el) setMountEl(el)
  }, [])

  // Position all cards relative to `idx`
  const positionCards = useCallback((idx: number, animate: boolean) => {
    if (!stageRef.current) return
    stageW.current = stageRef.current.offsetWidth
    const W = stageW.current
    const n = slides.length
    if (!n) return

    slides.forEach((s, i) => {
      const el = cardRefs.current[i]
      if (!el) return

      let dist = i - idx
      // Wrap around for circular behaviour
      if (dist > n / 2)  dist -= n
      if (dist < -n / 2) dist += n

      let x: number, opacity: number, scale: number, brightness: number, zIndex: number
      if (dist === 0) {
        x = 0; opacity = 1; scale = 1; brightness = 1; zIndex = 3
      } else if (dist === -1) {
        x = -(W - PEEK); opacity = 0.7; scale = 0.96; brightness = 0.65; zIndex = 2
      } else if (dist === 1) {
        x = W - PEEK;    opacity = 0.7; scale = 0.96; brightness = 0.65; zIndex = 2
      } else {
        x = dist < 0 ? -W * 2 : W * 2; opacity = 0; scale = 0.9; brightness = 0.5; zIndex = 1
      }

      const props = { x, opacity, scale, filter: `brightness(${brightness})`, zIndex }
      if (animate) {
        gsap.to(el, { ...props, duration: 0.52, ease: 'power2.inOut' })
      } else {
        gsap.set(el, props)
      }
    })

    // Ambient glow
    if (ambientRef.current) {
      const a = ACC[slides[idx]?.category] || '#c5a05a'
      gsap.to(ambientRef.current, {
        background: `radial-gradient(ellipse 90% 55% at 50% 100%, ${a}28 0%, transparent 70%)`,
        duration: 0.8, ease: 'power1.inOut',
      })
    }
  }, [slides])

  // Initial position after mount + on slide change
  useLayoutEffect(() => {
    if (slides.length && stageRef.current) positionCards(current, false)
  }, [slides, positionCards])

  // Progress bar
  const kickProgress = useCallback(() => {
    if (!progRef.current || paused) return
    gsap.killTweensOf(progRef.current)
    gsap.fromTo(progRef.current, { scaleX: 0 }, { scaleX: 1, duration: 6, ease: 'none', transformOrigin: 'left center' })
  }, [paused])

  const goTo = useCallback((idx: number) => {
    if (animRef.current || idx === current || !slides.length) return
    animRef.current = true
    setCurrent(idx)
    positionCards(idx, true)
    kickProgress()
    setTimeout(() => { animRef.current = false }, 580)
  }, [current, slides, positionCards, kickProgress])

  const next = useCallback(() => goTo((current + 1) % slides.length), [goTo, current, slides.length])
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [goTo, current, slides.length])

  // Auto-advance
  useEffect(() => {
    if (slides.length < 2 || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      gsap.killTweensOf(progRef.current)
      return
    }
    kickProgress()
    intervalRef.current = setInterval(next, 6000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [slides.length, current, paused, next, kickProgress])

  // Touch swipe
  const touchStart = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (dx > 50) prev()
    else if (dx < -50) next()
  }

  if (!slides.length || !mountEl) return null

  const slide  = slides[current]
  const accent = ACC[slide.category] || '#c5a05a'

  const STAGE_H = 480

  const el = (
    <div style={{ margin: '0 0 1.5rem' }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        .sp-nav:hover { background: rgba(255,255,255,0.12) !important; }
        .sp-card-link:hover .sp-cta { opacity: 1 !important; transform: translateY(0) !important; }
        .sp-dot:hover { width: 16px !important; }
        @keyframes sp-tick { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.6rem' }}>
        <span style={{ width:7, height:7, borderRadius:'50%', background:accent, flexShrink:0, boxShadow:`0 0 10px ${accent}bb`, transition:'background .4s, box-shadow .4s' }} />
        <span style={{ fontSize:9, letterSpacing:'.18em', fontWeight:700, textTransform:'uppercase', color:'rgba(236,232,225,0.35)' }}>
          Sponsored Feature
        </span>
        <span style={{ flex:1, height:'.5px', background:'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize:11, color:'rgba(236,232,225,0.3)', fontVariantNumeric:'tabular-nums', letterSpacing:'.04em' }}>
          <span style={{ color:accent, fontWeight:700 }}>{String(current+1).padStart(2,'0')}</span>
          <span style={{ opacity:.4 }}> / </span>
          {String(slides.length).padStart(2,'0')}
        </span>
        <div style={{ display:'flex', gap:3 }}>
          <button className="sp-nav" onClick={prev} aria-label="Previous" style={{ width:28,height:28,background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:'50%',cursor:'pointer',color:'rgba(236,232,225,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,transition:'background .15s' }}>
            <i className="ti ti-chevron-left" />
          </button>
          <button className="sp-nav" onClick={next} aria-label="Next" style={{ width:28,height:28,background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:'50%',cursor:'pointer',color:'rgba(236,232,225,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,transition:'background .15s' }}>
            <i className="ti ti-chevron-right" />
          </button>
        </div>
      </div>

      {/* ── Stage ─────────────────────────────────── */}
      <div
        ref={stageRef}
        style={{ position:'relative', height:STAGE_H, overflow:'hidden', borderRadius:18, background:'#080610', isolation:'isolate', contain:'layout paint' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Ambient layer */}
        <div ref={ambientRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, transition:'background .4s' }} />

        {/* Progress bar — top edge of stage */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:10, overflow:'hidden' }}>
          <div ref={progRef} style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, ${accent}00, ${accent}, ${accent}00)`, transformOrigin:'left center', transform:'scaleX(0)' }} />
        </div>

        {/* Pause hint */}
        {paused && (
          <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', zIndex:9, display:'flex', alignItems:'center', gap:6, fontSize:10, letterSpacing:'.07em', color:'rgba(236,232,225,0.55)', background:'rgba(0,0,0,0.62)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'5px 13px', backdropFilter:'blur(10px)', pointerEvents:'none', whiteSpace:'nowrap' }}>
            <i className="ti ti-player-pause-filled" style={{ fontSize:9 }} />
            Paused · move away to resume
          </div>
        )}

        {/* Cards */}
        {slides.map((s, i) => {
          const a = ACC[s.category] || '#c5a05a'
          const g = GRAD[s.category] || GRAD.escorts
          return (
            <div
              key={s.id}
              ref={el => { cardRefs.current[i] = el }}
              style={{ position:'absolute', inset:0, willChange:'transform,opacity' }}
            >
              <a
                href={`/listings/${s.id}`}
                className="sp-card-link"
                onClick={e => { if (i !== current) { e.preventDefault(); goTo(i) } }}
                style={{ display:'block', width:'100%', height:'100%', textDecoration:'none', background:g, cursor: i === current ? 'pointer' : 'pointer' }}
              >
                {/* Photo */}
                {s.images?.[0] ? (
                  <img src={s.images[0]} alt={s.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition: focusPosition(s.image_focus, s.images[0]), pointerEvents:'none' }} />
                ) : (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:120, fontStyle:'italic', color:`${a}12`, pointerEvents:'none' }}>
                    {s.title.charAt(0)}
                  </div>
                )}

                {/* Gradient overlay — heavier at bottom */}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(6,4,10,0.96) 0%, rgba(6,4,10,0.45) 40%, rgba(6,4,10,0.1) 70%, transparent 100%)', pointerEvents:'none' }} />

                {/* Side-edge vignette — helps stage edges blend */}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(6,4,10,0.55) 0%, transparent 12%, transparent 88%, rgba(6,4,10,0.55) 100%)', pointerEvents:'none' }} />

                {/* Ambient glow orb */}
                <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:500, height:300, borderRadius:'50%', background:`radial-gradient(circle, ${a}12 0%, transparent 70%)`, pointerEvents:'none' }} />

                {/* Top badges */}
                <div style={{ position:'absolute', top:18, left:18, display:'flex', gap:5, zIndex:2 }}>
                  {s.verified && (
                    <span style={{ fontSize:9, fontWeight:700, background:'rgba(29,201,143,0.18)', color:'#1dc98f', border:'0.5px solid rgba(29,201,143,0.35)', borderRadius:6, padding:'3px 8px', letterSpacing:'.07em', backdropFilter:'blur(6px)' }}>
                      <i className="ti ti-shield-check" style={{ marginRight:3,fontSize:9 }} />VERIFIED
                    </span>
                  )}
                  {s.premium && (
                    <span style={{ fontSize:9, fontWeight:700, background:`${a}22`, color:a, border:`0.5px solid ${a}44`, borderRadius:6, padding:'3px 8px', letterSpacing:'.07em', backdropFilter:'blur(6px)' }}>VIP</span>
                  )}
                </div>

                {/* Price — top right */}
                {s.price_from && (
                  <div style={{ position:'absolute', top:18, right:18, zIndex:2, background:'rgba(0,0,0,0.68)', backdropFilter:'blur(10px)', border:`0.5px solid ${a}44`, borderRadius:9, padding:'5px 12px', fontSize:14, fontWeight:700, color:a }}>
                    €{s.price_from}
                  </div>
                )}

                {/* Bottom content */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'2rem 2rem 1.5rem', zIndex:2 }}>
                  <div style={{ fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:`${a}cc`, marginBottom:6, fontWeight:600 }}>
                    {s.category}{s.city ? ` · ${s.city}` : ''}
                  </div>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(22px,2.8vw,34px)', fontStyle:'italic', fontWeight:400, color:'#ece8e1', lineHeight:1.15, marginBottom:10 }}>
                    {s.title}
                  </h3>
                  <div className="sp-cta" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:a, background:`${a}14`, border:`0.5px solid ${a}44`, borderRadius:8, padding:'7px 16px', opacity:0, transform:'translateY(8px)', transition:'opacity .22s, transform .22s', backdropFilter:'blur(6px)' }}>
                    View listing <i className="ti ti-arrow-right" style={{ fontSize:11 }} />
                  </div>
                </div>
              </a>
            </div>
          )
        })}

        {/* Plate label — bottom-centre of stage, above card content */}
        <div style={{ position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)', zIndex:6, pointerEvents:'none' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:9, letterSpacing:'.14em', fontWeight:700, textTransform:'uppercase', color:accent, background:'rgba(4,2,8,0.72)', border:`0.5px solid ${accent}44`, borderRadius:20, padding:'5px 14px', backdropFilter:'blur(12px)', whiteSpace:'nowrap' }}>
            <span style={{ width:4, height:4, borderRadius:'50%', background:accent, flexShrink:0 }} />
            Featured · {slide.title.split(' ').slice(0,3).join(' ')}
            <span style={{ width:4, height:4, borderRadius:'50%', background:accent, flexShrink:0 }} />
          </span>
        </div>
      </div>

      {/* ── Rail ─────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:'0.6rem', height:22 }}>
        {/* Dots */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              className="sp-dot"
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{ width:i===current?18:5, height:5, borderRadius:3, background:i===current?accent:'rgba(255,255,255,0.14)', border:'none', cursor:'pointer', padding:0, transition:'all .3s ease' }}
            />
          ))}
        </div>

        {/* Thread line */}
        <div style={{ flex:1, height:'.5px', background:`linear-gradient(90deg, ${accent}44, rgba(255,255,255,0.04))` }} />

        {/* Scrolling ticker */}
        <div style={{ width:180, overflow:'hidden', flexShrink:0 }}>
          <div style={{ display:'inline-flex', gap:32, animation:'sp-tick 22s linear infinite', whiteSpace:'nowrap' }}>
            {[...slides, ...slides].map((s, i) => (
              <span key={i} style={{ fontSize:9, letterSpacing:'.08em', color:'rgba(236,232,225,0.18)', textTransform:'uppercase', fontWeight:600 }}>
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Advertise CTA */}
      <div style={{ marginTop:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:'rgba(236,232,225,0.4)', letterSpacing:'.04em', fontFamily:'var(--sans)' }}>
          This could be your advertisement
        </span>
        <a href={ctaHref}
          style={{
            display:'inline-flex', alignItems:'center', gap:7,
            fontSize:12.5, fontWeight:700, letterSpacing:'.05em', textDecoration:'none',
            color:'#0a0712',
            background:`linear-gradient(135deg, ${accent}, ${accent}cc)`,
            border:`1px solid ${accent}`,
            borderRadius:24, padding:'9px 20px',
            boxShadow:`0 4px 18px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
            transition:'transform .18s ease, box-shadow .18s ease',
            whiteSpace:'nowrap', cursor:'pointer',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 7px 26px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.3)` }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 18px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)` }}>
          <i className="ti ti-sparkles" style={{ fontSize:14 }} aria-hidden="true" />
          Feature your advertisement
        </a>
      </div>
    </div>
  )

  return createPortal(el, mountEl)
}
