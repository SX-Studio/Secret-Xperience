'use client'

/**
 * Shared motion FX for the Pride hub. Everything respects prefers-reduced-motion
 * and uses transform/opacity only, so it stays GPU-cheap and degrades to a calm
 * static state when motion is reduced.
 */

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

export const SPECTRUM_COLORS = ['#e0507a', '#f0966a', '#e6c07a', '#3fd0c4', '#6b8be0', '#b96bd8']
export const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 }
const seed = (s: string) => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

/* ── Living aurora with optional device-tilt parallax ──────────────────────── */
export function Aurora({ intensity = 0, px, py }: { intensity?: number; px?: MotionValue<number>; py?: MotionValue<number> }) {
  const rm = useReducedMotion()
  const zx = useMotionValue(0), zy = useMotionValue(0)
  const x = useTransform(px || zx, v => v * 28)
  const y = useTransform(py || zy, v => v * 22)
  const base = 0.22 + intensity * 0.4
  const blobs = [
    { c1: 'rgba(224,80,122,0.55)', c2: 'rgba(185,107,216,0.0)', x: ['-8%', '6%', '-8%'], y: ['-6%', '4%', '-6%'], s: 620, left: '4%', top: '-14%', d: 22 },
    { c1: 'rgba(63,208,196,0.42)', c2: 'rgba(107,139,224,0.0)', x: ['6%', '-6%', '6%'], y: ['4%', '-6%', '4%'], s: 560, left: '52%', top: '-8%', d: 27 },
    { c1: 'rgba(230,192,122,0.34)', c2: 'rgba(224,80,122,0.0)', x: ['-4%', '5%', '-4%'], y: ['3%', '-4%', '3%'], s: 500, left: '28%', top: '6%', d: 31 },
  ]
  return (
    <motion.div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, x, y }}>
      {blobs.map((b, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: b.left, top: b.top, width: b.s, height: b.s, borderRadius: '50%',
            background: `radial-gradient(circle at 50% 50%, ${b.c1}, ${b.c2} 70%)`, filter: 'blur(48px)', opacity: base, willChange: 'transform' }}
          animate={rm ? {} : { x: b.x, y: b.y, scale: [1, 1.12, 1] }}
          transition={rm ? {} : { duration: b.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </motion.div>
  )
}

/* ── Presence orbs: other people "in the room" drifting in the background ───── */
export function PresenceOrbs({ n = 8 }: { n?: number }) {
  const rm = useReducedMotion()
  const [orbs, setOrbs] = useState<{ id: number; left: number; top: number; c: string; d: number }[]>([])
  useEffect(() => {
    setOrbs(Array.from({ length: n }, (_, i) => ({
      id: i, left: 6 + Math.random() * 88, top: 10 + Math.random() * 78,
      c: SPECTRUM_COLORS[i % SPECTRUM_COLORS.length], d: 10 + Math.random() * 10,
    })))
  }, [n])
  if (rm) return null
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {orbs.map(o => (
        <motion.span key={o.id}
          style={{ position: 'absolute', left: `${o.left}%`, top: `${o.top}%`, width: 9, height: 9, borderRadius: '50%', background: o.c, boxShadow: `0 0 14px ${o.c}`, opacity: 0.5 }}
          animate={{ x: [0, 22, -16, 0], y: [0, -18, 12, 0], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: o.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

/* ── Cursor spotlight (desktop only) ───────────────────────────────────────── */
export function Spotlight({ on = true }: { on?: boolean }) {
  const rm = useReducedMotion()
  const x = useMotionValue(-500), y = useMotionValue(-500)
  const sx = useSpring(x, { stiffness: 220, damping: 28, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 220, damping: 28, mass: 0.5 })
  const [fine, setFine] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setFine(window.matchMedia('(pointer:fine)').matches)
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])
  if (rm || !on || !fine) return null
  return (
    <motion.div aria-hidden style={{ position: 'fixed', top: 0, left: 0, x: sx, y: sy, width: 460, height: 460, marginLeft: -230, marginTop: -230, borderRadius: '50%', pointerEvents: 'none', zIndex: 40, mixBlendMode: 'screen', background: 'radial-gradient(circle at 50% 50%, rgba(185,107,216,0.14), rgba(63,208,196,0.08) 40%, transparent 68%)' }} />
  )
}

/* ── Ambient rising particles ──────────────────────────────────────────────── */
export function Particles({ intensity = 0 }: { intensity?: number }) {
  const rm = useReducedMotion()
  const [seeds, setSeeds] = useState<{ id: number; left: number; size: number; dur: number; delay: number; c: string }[]>([])
  const count = Math.round(8 + intensity * 20)
  useEffect(() => {
    setSeeds(Array.from({ length: count }, (_, i) => ({ id: i, left: Math.random() * 100, size: 2 + Math.random() * 4, dur: 9 + Math.random() * 12, delay: Math.random() * 10, c: SPECTRUM_COLORS[i % SPECTRUM_COLORS.length] })))
  }, [count])
  if (rm) return null
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {seeds.map(s => (
        <motion.span key={s.id}
          style={{ position: 'absolute', left: `${s.left}%`, bottom: -10, width: s.size, height: s.size, borderRadius: '50%', background: s.c, boxShadow: `0 0 8px ${s.c}`, willChange: 'transform, opacity' }}
          initial={{ y: 0, opacity: 0 }} animate={{ y: -700, opacity: [0, 0.7, 0], x: [0, 18, -12, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeOut' }} />
      ))}
    </div>
  )
}

/* ── Magnetic wrapper: element gently pulls toward the cursor ───────────────── */
export function Magnetic({ children, strength = 0.3, style }: { children: React.ReactNode; strength?: number; style?: React.CSSProperties }) {
  const rm = useReducedMotion()
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 250, damping: 20 }), sy = useSpring(y, { stiffness: 250, damping: 20 })
  if (rm) return <div style={style}>{children}</div>
  return (
    <motion.div style={{ ...style, x: sx, y: sy }}
      onMouseMove={e => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); x.set((e.clientX - (r.left + r.width / 2)) * strength); y.set((e.clientY - (r.top + r.height / 2)) * strength) }}
      onMouseLeave={() => { x.set(0); y.set(0) }}>
      {children}
    </motion.div>
  )
}

/* ── Burst: confetti / heart explosions from a point ───────────────────────── */
type BurstItem = { id: number; x: number; y: number; kind: 'heart' | 'confetti'; n: number }
export function useBurst() {
  const rm = useReducedMotion()
  const [items, setItems] = useState<BurstItem[]>([])
  const idRef = useRef(0)
  const fire = useCallback((x: number, y: number, kind: 'heart' | 'confetti' = 'heart', n = 12) => {
    if (rm) return
    const id = ++idRef.current
    setItems(v => [...v, { id, x, y, kind, n }])
    setTimeout(() => setItems(v => v.filter(i => i.id !== id)), 1100)
  }, [rm])
  const layer = (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60 }}>
      <AnimatePresence>{items.map(it => <Burst key={it.id} {...it} />)}</AnimatePresence>
    </div>
  )
  return { fire, layer }
}
function Burst({ x, y, kind, n }: BurstItem) {
  const parts = Array.from({ length: n }, (_, i) => {
    const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5
    const dist = 46 + Math.random() * 70
    return { dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - 30, c: SPECTRUM_COLORS[i % SPECTRUM_COLORS.length], r: Math.random() * 360, s: 0.7 + Math.random() * 0.7 }
  })
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      {parts.map((p, i) => (
        <motion.div key={i} initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }} animate={{ x: p.dx, y: p.dy, scale: [0, p.s, p.s * 0.8], opacity: [1, 1, 0], rotate: p.r }} exit={{ opacity: 0 }} transition={{ duration: 0.95, ease: [0.2, 0.8, 0.3, 1] }} style={{ position: 'absolute' }}>
          {kind === 'heart'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill={p.c} style={{ filter: `drop-shadow(0 0 4px ${p.c})` }}><path d="M12 21s-8-5.3-8-10.6A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8 4.4C20 15.7 12 21 12 21z" /></svg>
            : <span style={{ display: 'block', width: 8, height: 12, borderRadius: 2, background: p.c, boxShadow: `0 0 6px ${p.c}` }} />}
        </motion.div>
      ))}
    </div>
  )
}

/* ── Ripples: a spectral ring blooms wherever you tap ──────────────────────── */
export function useRipples() {
  const rm = useReducedMotion()
  const [items, setItems] = useState<{ id: number; x: number; y: number }[]>([])
  const idRef = useRef(0)
  const spawn = useCallback((x: number, y: number) => {
    if (rm) return
    const id = ++idRef.current
    setItems(v => [...v.slice(-6), { id, x, y }])
    setTimeout(() => setItems(v => v.filter(i => i.id !== id)), 850)
  }, [rm])
  const layer = (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 45 }}>
      <AnimatePresence>
        {items.map(r => (
          <motion.div key={r.id} initial={{ scale: 0, opacity: 0.55 }} animate={{ scale: 1, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ position: 'absolute', left: r.x - 150, top: r.y - 150, width: 300, height: 300, borderRadius: '50%', border: '2px solid rgba(185,107,216,0.55)', boxShadow: '0 0 40px rgba(63,208,196,0.35), inset 0 0 40px rgba(224,80,122,0.25)' }} />
        ))}
      </AnimatePresence>
    </div>
  )
  return { spawn, layer }
}

/* ── Flag wipe: coloured wash expanding from the tapped chip ────────────────── */
export function FlagWipe({ trigger }: { trigger: { id: number; grad: string; x: number; y: number } | null }) {
  const rm = useReducedMotion()
  if (rm) return null
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, overflow: 'hidden' }}>
      <AnimatePresence>
        {trigger && (
          <motion.div key={trigger.id} initial={{ clipPath: `circle(0px at ${trigger.x}px ${trigger.y}px)`, opacity: 0.9 }} animate={{ clipPath: `circle(140% at ${trigger.x}px ${trigger.y}px)`, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.85, ease: [0.3, 0.8, 0.3, 1] }} style={{ position: 'absolute', inset: 0, background: trigger.grad, mixBlendMode: 'screen' }} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Pride rain: full-screen confetti downpour (easter egg / celebration) ───── */
export function PrideRain({ on }: { on: boolean }) {
  const rm = useReducedMotion()
  const [drops] = useState(() => Array.from({ length: 46 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 1.2, dur: 2.6 + Math.random() * 2, c: SPECTRUM_COLORS[i % SPECTRUM_COLORS.length], heart: Math.random() > 0.55, r: Math.random() * 360 })))
  if (rm) return null
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 65, overflow: 'hidden' }}>
      <AnimatePresence>
        {on && drops.map(d => (
          <motion.div key={d.id} initial={{ y: -40, opacity: 0, rotate: 0 }} animate={{ y: '105vh', opacity: [0, 1, 1, 0.6], rotate: d.r }} exit={{ opacity: 0 }} transition={{ duration: d.dur, delay: d.delay, ease: 'linear' }} style={{ position: 'absolute', left: `${d.left}%`, top: 0 }}>
            {d.heart
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill={d.c} style={{ filter: `drop-shadow(0 0 5px ${d.c})` }}><path d="M12 21s-8-5.3-8-10.6A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8 4.4C20 15.7 12 21 12 21z" /></svg>
              : <span style={{ display: 'block', width: 9, height: 14, borderRadius: 2, background: d.c, boxShadow: `0 0 7px ${d.c}` }} />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ── Constellation of your saves: liked profiles become a little night sky ──── */
export function Constellation({ stars, accent }: { stars: { id: string; title: string; img: string | null }[]; accent: string }) {
  const rm = useReducedMotion()
  if (!stars.length) return null
  const pts = stars.map((s, i) => { const n = seed(s.id + i); return { ...s, x: 8 + (n % 84), y: 18 + ((n >> 3) % 64) } })
  return (
    <section style={{ marginTop: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.26em', textTransform: 'uppercase', backgroundImage: accent, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Your night · {stars.length} saved</div>
      </div>
      <div style={{ position: 'relative', height: 190, maxWidth: 760, margin: '0 auto', borderRadius: 18, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.08)', background: 'radial-gradient(ellipse at 50% 120%, rgba(185,107,216,0.12), rgba(8,6,18,0.6) 70%)' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {pts.slice(1).map((p, i) => <line key={i} x1={`${pts[i].x}%`} y1={`${pts[i].y}%`} x2={`${p.x}%`} y2={`${p.y}%`} stroke="rgba(197,155,239,0.35)" strokeWidth="1" strokeDasharray="3 4" />)}
        </svg>
        {pts.map((p, i) => (
          <motion.a key={p.id} href={`/listings/${p.id}`} title={p.title}
            initial={rm ? { opacity: 1 } : { opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING, delay: i * 0.05 }}
            style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)', textDecoration: 'none' }}>
            <motion.span animate={rm ? {} : { opacity: [0.7, 1, 0.7], scale: [1, 1.12, 1] }} transition={{ duration: 2.4 + (i % 4) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'block', width: 26, height: 26, borderRadius: '50%', padding: 2, backgroundImage: accent, boxShadow: '0 0 12px rgba(185,107,216,0.7)' }}>
              {p.img ? <img src={p.img} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block', border: '1.5px solid #080612' }} /> : <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', background: '#080612' }} />}
            </motion.span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

/* ── Device-tilt parallax (mobile, best-effort; no-op without sensor) ──────── */
export function useTilt() {
  const rm = useReducedMotion()
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 60, damping: 18 }), sy = useSpring(y, { stiffness: 60, damping: 18 })
  useEffect(() => {
    if (rm || typeof window === 'undefined') return
    const h = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      x.set(Math.max(-1, Math.min(1, e.gamma / 45)))
      y.set(Math.max(-1, Math.min(1, (e.beta - 45) / 45)))
    }
    window.addEventListener('deviceorientation', h)
    return () => window.removeEventListener('deviceorientation', h)
  }, [rm, x, y])
  return { px: sx, py: sy }
}
