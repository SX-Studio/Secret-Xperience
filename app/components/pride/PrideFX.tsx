'use client'

/**
 * Shared motion FX for the Pride hub. All effects respect prefers-reduced-motion
 * and use only transform/opacity so they stay GPU-cheap. Nothing here is load-
 * bearing — if motion is reduced, every piece degrades to a calm static state.
 */

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

export const SPECTRUM_COLORS = ['#e0507a', '#f0966a', '#e6c07a', '#3fd0c4', '#6b8be0', '#b96bd8']
export const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 }

/* ── Living aurora: two slow, breathing rainbow blobs behind the hero ──────── */
export function Aurora({ intensity = 0 }: { intensity?: number }) {
  const rm = useReducedMotion()
  const base = 0.22 + intensity * 0.4
  const blobs = [
    { c1: 'rgba(224,80,122,0.55)', c2: 'rgba(185,107,216,0.0)', x: ['-8%', '6%', '-8%'], y: ['-6%', '4%', '-6%'], s: 620, left: '4%', top: '-14%', d: 22 },
    { c1: 'rgba(63,208,196,0.42)', c2: 'rgba(107,139,224,0.0)', x: ['6%', '-6%', '6%'], y: ['4%', '-6%', '4%'], s: 560, left: '52%', top: '-8%', d: 27 },
    { c1: 'rgba(230,192,122,0.34)', c2: 'rgba(224,80,122,0.0)', x: ['-4%', '5%', '-4%'], y: ['3%', '-4%', '3%'], s: 500, left: '28%', top: '6%', d: 31 },
  ]
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {blobs.map((b, i) => (
        <motion.div key={i}
          style={{ position: 'absolute', left: b.left, top: b.top, width: b.s, height: b.s, borderRadius: '50%',
            background: `radial-gradient(circle at 50% 50%, ${b.c1}, ${b.c2} 70%)`,
            filter: 'blur(48px)', opacity: base, willChange: 'transform' }}
          animate={rm ? {} : { x: b.x, y: b.y, scale: [1, 1.12, 1] }}
          transition={rm ? {} : { duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ── Cursor spotlight: a soft rainbow light that trails the pointer (desktop) ── */
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
    <motion.div aria-hidden style={{ position: 'fixed', top: 0, left: 0, x: sx, y: sy, width: 460, height: 460,
      marginLeft: -230, marginTop: -230, borderRadius: '50%', pointerEvents: 'none', zIndex: 40, mixBlendMode: 'screen',
      background: 'radial-gradient(circle at 50% 50%, rgba(185,107,216,0.14), rgba(63,208,196,0.08) 40%, transparent 68%)' }} />
  )
}

/* ── Ambient particles: slow rising motes; count grows with intensity ──────── */
export function Particles({ intensity = 0 }: { intensity?: number }) {
  const rm = useReducedMotion()
  const [seeds, setSeeds] = useState<{ id: number; left: number; size: number; dur: number; delay: number; c: string }[]>([])
  const count = Math.round(8 + intensity * 20)
  useEffect(() => {
    setSeeds(Array.from({ length: count }, (_, i) => ({
      id: i, left: Math.random() * 100, size: 2 + Math.random() * 4,
      dur: 9 + Math.random() * 12, delay: Math.random() * 10,
      c: SPECTRUM_COLORS[i % SPECTRUM_COLORS.length],
    })))
  }, [count])
  if (rm) return null
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {seeds.map(s => (
        <motion.span key={s.id}
          style={{ position: 'absolute', left: `${s.left}%`, bottom: -10, width: s.size, height: s.size, borderRadius: '50%', background: s.c, boxShadow: `0 0 8px ${s.c}`, willChange: 'transform, opacity' }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -700, opacity: [0, 0.7, 0], x: [0, 18, -12, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

/* ── Burst system: fire rainbow confetti / hearts from a screen point ──────── */
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
      <AnimatePresence>
        {items.map(it => <Burst key={it.id} {...it} />)}
      </AnimatePresence>
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
        <motion.div key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.dx, y: p.dy, scale: [0, p.s, p.s * 0.8], opacity: [1, 1, 0], rotate: p.r }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.95, ease: [0.2, 0.8, 0.3, 1] }}
          style={{ position: 'absolute' }}>
          {kind === 'heart'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill={p.c} style={{ filter: `drop-shadow(0 0 4px ${p.c})` }}><path d="M12 21s-8-5.3-8-10.6A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8 4.4C20 15.7 12 21 12 21z" /></svg>
            : <span style={{ display: 'block', width: 8, height: 12, borderRadius: 2, background: p.c, boxShadow: `0 0 6px ${p.c}` }} />}
        </motion.div>
      ))}
    </div>
  )
}

/* ── Flag wipe: a coloured wash that expands from the tapped chip ───────────── */
export function FlagWipe({ trigger }: { trigger: { id: number; grad: string; x: number; y: number } | null }) {
  const rm = useReducedMotion()
  if (rm) return null
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, overflow: 'hidden' }}>
      <AnimatePresence>
        {trigger && (
          <motion.div key={trigger.id}
            initial={{ clipPath: `circle(0px at ${trigger.x}px ${trigger.y}px)`, opacity: 0.9 }}
            animate={{ clipPath: `circle(140% at ${trigger.x}px ${trigger.y}px)`, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.3, 0.8, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, background: trigger.grad, mixBlendMode: 'screen' }} />
        )}
      </AnimatePresence>
    </div>
  )
}
