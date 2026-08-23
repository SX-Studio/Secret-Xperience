'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ *
 * CreatorHub — the lively editorial band above the creator overview.
 * Slide banners · animated info stats · meet & greet frame · expos ·
 * Creator Journal (news / tax & tips) · earnings benchmarks · brands.
 * Everything is curated/evergreen or real platform info — no fake
 * dated news links and no real-person earnings (privacy).
 * ------------------------------------------------------------------ */

/* Reveal-on-scroll wrapper */
function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setShown(true); io.disconnect() } })
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      ...style,
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity .7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
    }}>{children}</div>
  )
}

/* Count-up number that animates when scrolled into view */
function CountUp({ end, suffix = '', prefix = '', duration = 1400 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const run = () => {
      const start = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(end * eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    if (typeof IntersectionObserver === 'undefined') { setVal(end); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(); io.disconnect() } })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [end, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-GB')}{suffix}</span>
}

/* ---------------------------- data ---------------------------- */

const BANNERS = [
  {
    tag: 'Meet & Greet',
    title: 'Private Meet & Greets',
    body: 'Curated, verified, discreet — meet the creators you follow at invitation-only evenings across Europe.',
    cta: 'See the lineup', href: '/events',
    grad: 'linear-gradient(120deg,#3a1030 0%,#1c0d22 55%,#080612 100%)',
    glow: 'radial-gradient(ellipse at 78% 30%,rgba(197,160,90,0.22),transparent 60%)',
    icon: 'ti-sparkles',
  },
  {
    tag: 'Earn more',
    title: 'Keep 85% of every subscription',
    body: 'One of the highest creator payouts in the EU. Tokens, gifts, custom requests and tips — settled to your bank.',
    cta: 'Start earning', href: '/advertise',
    grad: 'linear-gradient(120deg,#101e2a 0%,#0d1622 55%,#080612 100%)',
    glow: 'radial-gradient(ellipse at 20% 30%,rgba(38,212,160,0.18),transparent 60%)',
    icon: 'ti-coin',
  },
  {
    tag: 'Content Expo',
    title: 'SecretXperience Expo 2026',
    body: 'Workshops, brand deals and creator networking. Cities announced through the season — register your interest.',
    cta: 'Notify me', href: '/events',
    grad: 'linear-gradient(120deg,#2a1440 0%,#16102a 55%,#080612 100%)',
    glow: 'radial-gradient(ellipse at 70% 60%,rgba(139,92,246,0.2),transparent 60%)',
    icon: 'ti-confetti',
  },
  {
    tag: 'Grow faster',
    title: 'Publish once. Reach everywhere.',
    body: 'Post to your SecretXperience feed and link every other platform from one verified profile.',
    cta: 'Open Studio', href: '/creators/studio',
    grad: 'linear-gradient(120deg,#3a1020 0%,#1e0d16 55%,#080612 100%)',
    glow: 'radial-gradient(ellipse at 82% 40%,rgba(224,96,122,0.18),transparent 60%)',
    icon: 'ti-rocket',
  },
]

const STATS = [
  { icon: 'ti-rosette-discount-check', end: 85, suffix: '%', label: 'Creator payout', sub: 'you keep the majority' },
  { icon: 'ti-map-pin', end: 6, label: 'Countries', sub: 'BE · NL · DE · FR · LU · CH' },
  { icon: 'ti-bolt', end: 24, suffix: 'h', label: 'Payout speed', sub: 'SEPA to your bank' },
  { icon: 'ti-shield-check', end: 100, suffix: '%', label: 'Verified', sub: 'ID-checked profiles only' },
]

const JOURNAL = [
  {
    tag: 'Tax & admin', icon: 'ti-receipt-tax', accent: '#26d4a0',
    title: 'The creator tax basics (EU)',
    teaser: 'Register as a sole trader, keep every invoice, set aside ~30% as you go.',
    body: 'In most EU countries creator income is self-employment income. Register a sole trader / freelance number before you scale, keep a separate account for the money you set aside for tax and VAT, and log platform payouts monthly rather than at year-end. A quarterly reserve of roughly 25–35% keeps you safe from a nasty settlement. When in doubt, a one-hour session with an accountant who knows digital/creator income pays for itself.',
  },
  {
    tag: 'Brand building', icon: 'ti-diamond', accent: '#c5a05a',
    title: 'Turn a profile into a brand',
    teaser: 'A recognisable name, a consistent look and one clear promise beat posting more.',
    body: 'The creators who last treat themselves as a brand: one memorable handle used everywhere, a consistent colour and tone, and a single clear promise to subscribers. Batch-shoot content, keep a posting rhythm your audience can rely on, and protect your name — secure the handle on every platform even before you use it. Consistency compounds far faster than volume.',
  },
  {
    tag: 'Industry', icon: 'ti-trending-up', accent: '#a78bfa',
    title: 'Where the creator economy is heading',
    teaser: 'Direct fan monetisation, bundled memberships and live formats keep growing.',
    body: 'The shift is away from ad-funded reach and toward direct fan relationships: memberships, tips, pay-per-message and live sessions. Diversify rails so no single platform controls your income, own your audience through a mailing list or link hub, and lean into live and interactive formats — they convert casual followers into paying members better than static posts.',
  },
  {
    tag: 'Safety', icon: 'ti-lock', accent: '#e0607a',
    title: 'Protect yourself online',
    teaser: 'Watermark, scrub metadata, keep work and private identities separate.',
    body: 'Watermark preview content, strip location metadata from photos before posting, and keep a firm wall between your creator identity and legal identity. Use a dedicated email and payment identity, review new subscribers before sending customs, and file takedowns fast when content is reposted. On SecretXperience every profile is ID-verified and PII stays in-platform — never move identity documents to third-party chats.',
  },
  {
    tag: 'Growth', icon: 'ti-users', accent: '#3ecf8e',
    title: 'Your first 1,000 subscribers',
    teaser: 'Give people a reason to follow today, then reward them for staying.',
    body: 'Early growth is about momentum, not perfection. Offer a strong free preview so people can see your style, run a launch offer with a deadline, and reward founding subscribers with something exclusive. Cross-post to the platforms where your audience already is and funnel everyone to one verified profile. Reply to early fans personally — word of mouth is your cheapest acquisition channel.',
  },
]

const EARNINGS = [
  { tier: 'Top 1%', pct: 100, note: 'Full-time, multi-rail' },
  { tier: 'Top 10%', pct: 62, note: 'Consistent + custom work' },
  { tier: 'Rising', pct: 34, note: 'Growing subscriber base' },
  { tier: 'Starting', pct: 14, note: 'First months' },
]

const BRANDS = [
  { name: 'Lingerie & apparel', icon: 'ti-hanger' },
  { name: 'Adult toys & wellness', icon: 'ti-heart' },
  { name: 'Cam & studio gear', icon: 'ti-camera' },
  { name: 'Beauty & skincare', icon: 'ti-sparkles' },
  { name: 'Content tools', icon: 'ti-device-laptop' },
  { name: 'Fan platforms', icon: 'ti-link' },
]

const EXPOS = [
  { city: 'Amsterdam', window: 'Spring 2026', kind: 'Creator Expo', icon: 'ti-building-pavilion', accent: '#a78bfa' },
  { city: 'Berlin', window: 'Summer 2026', kind: 'Meet & Greet', icon: 'ti-glass-cocktail', accent: '#c5a05a' },
  { city: 'Brussels', window: 'Autumn 2026', kind: 'Networking', icon: 'ti-users-group', accent: '#26d4a0' },
]

/* --------------------------- component --------------------------- */

export default function CreatorHub({ creatorCount = 0 }: { creatorCount?: number }) {
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [openJournal, setOpenJournal] = useState<number | null>(null)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 5500)
    return () => clearInterval(t)
  }, [paused])

  const go = (d: number) => setSlide(s => (s + d + BANNERS.length) % BANNERS.length)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '3.25rem' }}>
      <style>{`
        @keyframes hubFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes hubSpin { to { transform: rotate(360deg) } }
        @keyframes hubPulseRing { 0% { transform: scale(.9); opacity:.7 } 70% { transform: scale(1.7); opacity:0 } 100% { opacity:0 } }
        @keyframes hubScan { 0% { transform: translateX(-120%) } 100% { transform: translateX(320%) } }
        @keyframes hubBarGrow { from { width: 0 } }
        @keyframes hubMarquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes hubGlowPulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
        .hub-jcard:hover { transform: translateY(-4px); border-color: var(--b2) !important; box-shadow: 0 14px 40px rgba(0,0,0,0.5) !important; }
        .hub-expo:hover { transform: translateY(-4px); border-color: rgba(197,160,90,0.4) !important; }
        .hub-brand:hover { background: var(--bg2) !important; color: var(--t) !important; border-color: var(--b2) !important; }
        .hub-scroll::-webkit-scrollbar { height: 0 }
        .hub-playbtn:hover { transform: scale(1.08); box-shadow: 0 0 44px rgba(197,160,90,0.5) !important; }
        .hub-nav:hover { background: rgba(197,160,90,0.2) !important; color: var(--gold) !important; }
        @media (max-width: 860px) { .hub-feature { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .hub-stats { grid-template-columns: repeat(2,1fr) !important; } .hub-earn { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ============ SLIDE BANNERS ============ */}
      <Reveal>
        <div
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onTouchStart={e => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={e => { if (touchX.current == null) return; const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touchX.current = null }}
          style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '0.5px solid var(--b)', boxShadow: '0 14px 50px rgba(0,0,0,0.5)' }}
        >
          <div style={{ display: 'flex', width: `${BANNERS.length * 100}%`, transform: `translateX(-${slide * (100 / BANNERS.length)}%)`, transition: 'transform .7s cubic-bezier(.22,.61,.36,1)' }}>
            {BANNERS.map((b, i) => (
              <div key={i} style={{ width: `${100 / BANNERS.length}%`, position: 'relative', minHeight: '250px', background: b.grad, padding: 'clamp(1.75rem,4vw,3rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: b.glow, pointerEvents: 'none' }} />
                <i className={`ti ${b.icon}`} aria-hidden style={{ position: 'absolute', right: 'clamp(1rem,4vw,3rem)', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(90px,16vw,180px)', color: 'rgba(197,160,90,0.12)', animation: 'hubFloat 6s ease-in-out infinite' }} />
                <div style={{ position: 'relative', maxWidth: '560px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(197,160,90,0.1)', border: '0.5px solid rgba(197,160,90,0.3)', padding: '5px 12px', borderRadius: '20px', marginBottom: '14px' }}>
                    <i className={`ti ${b.icon}`} /> {b.tag}
                  </span>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,3.4vw,2.4rem)', fontWeight: 400, lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-0.01em' }}>{b.title}</h2>
                  <p style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: '460px' }}>{b.body}</p>
                  <Link href={b.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                    {b.cta} <i className="ti ti-arrow-right" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => go(-1)} aria-label="Previous" className="hub-nav" style={navBtn('left')}><i className="ti ti-chevron-left" /></button>
          <button onClick={() => go(1)} aria-label="Next" className="hub-nav" style={navBtn('right')}><i className="ti ti-chevron-right" /></button>

          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '7px', zIndex: 4 }}>
            {BANNERS.map((_, i) => (
              <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} style={{ width: i === slide ? '26px' : '7px', height: '7px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: i === slide ? 'var(--gold)' : 'rgba(255,255,255,0.28)', transition: 'width .35s, background .35s' }} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============ INFO STAT BOXES ============ */}
      <Reveal>
        <div className="hub-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '16px', padding: '1.35rem 1.2rem' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,rgba(197,160,90,0.5),transparent)', animation: `hubGlowPulse ${3 + i * 0.4}s ease-in-out infinite` }} />
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '18px', marginBottom: '12px' }}>
                <i className={`ti ${s.icon}`} />
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '30px', fontWeight: 400, color: 'var(--t)', lineHeight: 1 }}>
                <CountUp end={s.end} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t)', fontWeight: 600, marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ============ MEET & GREET VIDEO FRAME  +  EXPOS ============ */}
      <div className="hub-feature" style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '18px', alignItems: 'stretch' }}>
        {/* Video / meet & greet frame */}
        <Reveal>
          <Link href="/events" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <div style={{ position: 'relative', height: '100%', minHeight: '320px', borderRadius: '18px', overflow: 'hidden', border: '0.5px solid rgba(197,160,90,0.25)', background: 'linear-gradient(140deg,#2a0d2a 0%,#160d20 55%,#080612 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.75rem' }}>
              {/* animated spotlight sweeps */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 25%,rgba(197,160,90,0.22),transparent 45%)', animation: 'hubGlowPulse 4s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 75% 70%,rgba(139,43,63,0.28),transparent 50%)', animation: 'hubGlowPulse 5.5s ease-in-out infinite reverse' }} />
              {/* scanning light bar (video shimmer) */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)', animation: 'hubScan 4.5s linear infinite', pointerEvents: 'none' }} />
              {/* LIVE-style badge */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(8,6,18,0.55)', border: '0.5px solid var(--b2)', backdropFilter: 'blur(6px)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t2)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e0607a', boxShadow: '0 0 8px #e0607a', animation: 'livepulse 1.6s ease-in-out infinite' }} /> Meet &amp; Greet
              </div>
              {/* play button with pulse ring */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '76px', height: '76px' }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(197,160,90,0.5)', animation: 'hubPulseRing 2.4s ease-out infinite' }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(197,160,90,0.5)', animation: 'hubPulseRing 2.4s ease-out infinite 1.2s' }} />
                <div className="hub-playbtn" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontSize: '30px', boxShadow: '0 0 30px rgba(197,160,90,0.35)', transition: 'transform .2s, box-shadow .2s', paddingLeft: '5px' }}>
                  <i className="ti ti-player-play-filled" />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Featured film</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,2.6vw,1.9rem)', fontWeight: 400, margin: '0 0 8px', lineHeight: 1.15 }}>Behind the velvet rope</h3>
                <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6, margin: 0, maxWidth: '400px' }}>A look inside our invitation-only creator meet &amp; greets — verified guests, discreet venues, unforgettable evenings.</p>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Content Expos */}
        <Reveal delay={120}>
          <div style={{ height: '100%', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <i className="ti ti-building-pavilion" style={{ color: 'var(--gold)' }} />
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, margin: 0 }}>Content Expos</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t3)', margin: '0 0 16px' }}>Our 2026 creator event series — dates announced through the season.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {EXPOS.map((e, i) => (
                <div key={i} className="hub-expo" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '12px', transition: 'transform .2s, border-color .2s' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: `${e.accent}1f`, border: `0.5px solid ${e.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: e.accent, fontSize: '18px' }}>
                    <i className={`ti ${e.icon}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t)' }}>{e.city}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{e.kind} · {e.window}</div>
                  </div>
                  <i className="ti ti-chevron-right" style={{ color: 'var(--t3)', fontSize: '16px' }} />
                </div>
              ))}
            </div>
            <Link href="/events" style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '10px', border: '0.5px solid rgba(197,160,90,0.3)', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              <i className="ti ti-bell" /> Notify me about events
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ============ CREATOR JOURNAL (news / tax & tips) ============ */}
      <div>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.1rem' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>Creator Journal</div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, margin: 0 }}>News, tax &amp; growth tips</h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Swipe →</span>
          </div>
        </Reveal>
        <div className="hub-scroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem', padding: '4px 1.5rem 8px', scrollSnapType: 'x mandatory' }}>
          {JOURNAL.map((j, i) => {
            const open = openJournal === i
            return (
              <div key={i} className="hub-jcard" style={{ scrollSnapAlign: 'start', flex: '0 0 300px', maxWidth: '300px', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '16px', padding: '1.4rem', display: 'flex', flexDirection: 'column', transition: 'transform .22s, border-color .2s, box-shadow .22s' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', alignSelf: 'flex-start', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: j.accent, background: `${j.accent}18`, border: `0.5px solid ${j.accent}44`, padding: '4px 10px', borderRadius: '20px', marginBottom: '14px' }}>
                  <i className={`ti ${j.icon}`} /> {j.tag}
                </div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 400, margin: '0 0 8px', lineHeight: 1.25 }}>{j.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.65, margin: '0 0 12px' }}>
                  {open ? j.body : j.teaser}
                </p>
                <button onClick={() => setOpenJournal(open ? null : i)} style={{ marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  {open ? 'Show less' : 'Read more'} <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ EARNINGS BENCHMARK  +  BRANDS ============ */}
      <div className="hub-earn" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '18px' }}>
        {/* Earnings benchmark */}
        <Reveal>
          <div style={{ height: '100%', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '18px', padding: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <i className="ti ti-award" style={{ color: 'var(--gold)' }} />
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, margin: 0 }}>What top creators earn</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t3)', margin: '0 0 18px' }}>Typical monthly income by tier — illustrative benchmarks, not individual figures.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {EARNINGS.map((e, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--t)', fontWeight: 600 }}>{e.tier}</span>
                    <span style={{ color: 'var(--t3)', fontSize: '12px' }}>{e.note}</span>
                  </div>
                  <div style={{ height: '9px', borderRadius: '6px', background: 'var(--bg3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${e.pct}%`, borderRadius: '6px', background: 'linear-gradient(90deg,var(--goldd),var(--gold),var(--goldl))', animation: `hubBarGrow 1.3s cubic-bezier(.22,.61,.36,1) ${i * 140}ms both` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/advertise" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              See how payouts work <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </Reveal>

        {/* Brands / collaborations */}
        <Reveal delay={120}>
          <div style={{ height: '100%', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '18px', padding: '1.6rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <i className="ti ti-briefcase" style={{ color: 'var(--gold)' }} />
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, margin: 0 }}>Creator brand deals</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t3)', margin: '0 0 16px' }}>Categories our verified creators collaborate with across Europe.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', flex: 1 }}>
              {BRANDS.map((b, i) => (
                <div key={i} className="hub-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '12px', color: 'var(--t2)', fontSize: '12.5px', fontWeight: 600, transition: 'background .2s, color .2s, border-color .2s' }}>
                  <i className={`ti ${b.icon}`} style={{ color: 'var(--gold)', fontSize: '18px' }} /> {b.name}
                </div>
              ))}
            </div>
            <Link href="/partners" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '10px', border: '0.5px solid rgba(197,160,90,0.3)', color: 'var(--gold)', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Explore partner directory <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

function navBtn(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%',
    left: side === 'left' ? '12px' : 'auto',
    right: side === 'right' ? '12px' : 'auto',
    transform: 'translateY(-50%)',
    width: '38px', height: '38px', borderRadius: '50%', zIndex: 4,
    background: 'rgba(8,6,18,0.5)', border: '0.5px solid var(--b2)', backdropFilter: 'blur(6px)',
    color: 'var(--t2)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background .2s, color .2s',
  }
}
