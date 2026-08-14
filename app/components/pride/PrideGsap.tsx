'use client'

/**
 * PrideGsap — an interactive GSAP layer for the Pride hub.
 *
 * Fifty distinct GSAP-powered animations and helper functions, grouped so the
 * whole "after dark, all colours" room reacts to the cursor, taps, scroll and
 * milestones. Everything is opt-in through `data-gsap` attributes or the global
 * overlay, so it layers on top of the existing framer-motion UI without fighting
 * it for the same transforms. All effects honour `prefers-reduced-motion`.
 *
 * Live global effects mount with <PrideGsapLayer/>. Element-level effects are
 * attached by tagging a node, e.g. <button data-gsap="magnetic">.
 *
 *  1 cursorComet        11 magnetic          21 textScramble      31 rippleButton      41 hueCycle
 *  2 cursorRing         12 magneticLabel     22 gradientSweep      32 flipCard          42 sparkleTrail
 *  3 clickHearts        13 tilt              23 counterRoll       33 heartbeat         43 shockwave*
 *  4 clickConfetti      14 tiltGlare         24 underlineDraw     34 rainbowBorder     44 confettiCannon*
 *  5 clickRipple        15 revealRise        25 breathe          35 draggableThrow    45 pulseRing*
 *  6 spotlightFollow    16 revealStagger     26 glowPulse        36 spinWheel         46 shakeError*
 *  7 auroraDrift        17 scrubDepth        27 floatBob         37 elasticIn         47 flipNumber*
 *  8 emojiField         18 pinGrow           28 shimmer          38 gridFlyIn         48 typewriter
 *  9 prideKonami        19 charWave          29 jelly            39 gsapMarquee       49 pointerParallax
 * 10 scrollProgress     20 charRise          30 pressPop         40 hoverLift         50 beamSweep
 *
 * (* = imperative, exposed on window.__prideGsap and as named exports)
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'

const SPECTRUM = ['#e0507a', '#b96bd8', '#6b8be0', '#3fd0c4', '#e6c07a']
const HEARTS = ['❤️', '🧡', '💛', '💚', '💙', '💜']
const EMOJIS = ['🏳️‍🌈', '✨', '💜', '🔥', '🦄', '💖', '🌈', '⭐']

let pluginsReady = false
function ensurePlugins() {
  if (pluginsReady || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, Draggable)
  pluginsReady = true
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
function prefersReduced() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// A single fixed overlay all spawned bits live in (never blocks clicks).
function getFxLayer(): HTMLDivElement {
  let el = document.getElementById('pride-gsap-fx') as HTMLDivElement | null
  if (!el) {
    el = document.createElement('div')
    el.id = 'pride-gsap-fx'
    el.setAttribute('aria-hidden', 'true')
    Object.assign(el.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '9000', overflow: 'hidden',
    } as CSSStyleDeclaration)
    document.body.appendChild(el)
  }
  return el
}

function spawn(html: string, x: number, y: number, extra?: Partial<CSSStyleDeclaration>): HTMLSpanElement {
  const layer = getFxLayer()
  const node = document.createElement('span')
  node.innerHTML = html
  Object.assign(node.style, {
    position: 'absolute', left: '0', top: '0', willChange: 'transform,opacity',
    transform: `translate(${x}px,${y}px)`, pointerEvents: 'none', userSelect: 'none',
  } as CSSStyleDeclaration, extra || {})
  layer.appendChild(node)
  return node
}

/* ---------------------------------------------------------------------------
 * IMPERATIVE EFFECTS (43-47) — callable from anywhere
 * ------------------------------------------------------------------------- */

// 43 shockwave — an expanding accent ring, for milestones
export function shockwave(x: number, y: number, color = '#b96bd8') {
  if (prefersReduced()) return
  const n = spawn('', x, y, {
    width: '12px', height: '12px', marginLeft: '-6px', marginTop: '-6px',
    borderRadius: '50%', border: `2px solid ${color}`, boxShadow: `0 0 24px ${color}`,
  })
  gsap.to(n, {
    scale: 26, opacity: 0, duration: 1, ease: 'power2.out',
    onComplete: () => n.remove(),
  })
}

// 44 confettiCannon — a directional rainbow burst
export function confettiCannon(x: number, y: number, count = 20) {
  if (prefersReduced()) return
  for (let i = 0; i < count; i++) {
    const c = pick(SPECTRUM)
    const n = spawn('', x, y, {
      width: `${rand(5, 10)}px`, height: `${rand(8, 14)}px`, background: c,
      borderRadius: '2px', opacity: '1',
    })
    const angle = rand(-Math.PI, 0)                    // fan upward
    const dist = rand(80, 240)
    gsap.to(n, {
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist + rand(60, 180),   // gravity pull-down
      rotation: rand(-360, 360), opacity: 0,
      duration: rand(0.9, 1.6), ease: 'power2.out',
      onComplete: () => n.remove(),
    })
  }
}

// 45 pulseRing — draw attention to an element with a soft ring
export function pulseRing(el: Element | null, color = '#3fd0c4') {
  if (!el || prefersReduced()) return
  const r = (el as HTMLElement).getBoundingClientRect()
  const n = spawn('', r.left + r.width / 2, r.top + r.height / 2, {
    width: `${r.width}px`, height: `${r.height}px`,
    marginLeft: `${-r.width / 2}px`, marginTop: `${-r.height / 2}px`,
    borderRadius: '16px', border: `2px solid ${color}`, opacity: '0.9',
  })
  gsap.to(n, { scale: 1.35, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => n.remove() })
}

// 46 shakeError — a quick horizontal shake (e.g. a blocked action)
export function shakeError(el: Element | null) {
  if (!el) return
  if (prefersReduced()) return
  gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' })
}

// 47 flipNumber — odometer-style roll of a numeric label
export function flipNumber(el: Element | null, to: number, prefix = '', suffix = '') {
  if (!el) return
  const obj = { v: parseFloat((el as HTMLElement).dataset.val || '0') || 0 }
  gsap.to(obj, {
    v: to, duration: prefersReduced() ? 0 : 0.9, ease: 'power2.out',
    onUpdate: () => { (el as HTMLElement).textContent = prefix + Math.round(obj.v).toLocaleString() + suffix },
    onComplete: () => { (el as HTMLElement).dataset.val = String(to) },
  })
}

/* ---------------------------------------------------------------------------
 * Small helpers reused by element effects
 * ------------------------------------------------------------------------- */

// splits an element's text into per-character spans (idempotent)
function splitChars(el: HTMLElement): HTMLSpanElement[] {
  if (el.dataset.gsapSplit === '1') return Array.from(el.querySelectorAll('span[data-ch]'))
  const text = el.textContent || ''
  el.textContent = ''
  const spans: HTMLSpanElement[] = []
  for (let i = 0; i < text.length; i++) {
    const s = document.createElement('span')
    s.textContent = text[i] === ' ' ? ' ' : text[i]
    s.setAttribute('data-ch', '1')
    s.style.display = 'inline-block'
    s.style.willChange = 'transform,opacity'
    el.appendChild(s)
    spans.push(s)
  }
  el.dataset.gsapSplit = '1'
  return spans
}

/* ---------------------------------------------------------------------------
 * The mounted layer — global effects + one-time DOM scan for element effects
 * ------------------------------------------------------------------------- */

export default function PrideGsapLayer({ accent }: { accent?: string }) {
  const cometRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const auroraRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    ensurePlugins()
    const reduced = prefersReduced()
    const cleanups: Array<() => void> = []

    // expose the imperative API for the page to call on milestones
    ;(window as any).__prideGsap = { shockwave, confettiCannon, pulseRing, shakeError, flipNumber }

    const ctx = gsap.context(() => {
      /* ---- pointer-driven globals (1,2,6,49) ---- */
      if (!reduced) {
        const comet = cometRef.current, ring = ringRef.current, spot = spotRef.current
        // 1 cursorComet / 2 cursorRing / 6 spotlightFollow — quickTo lets each lag differently
        const cx = comet ? gsap.quickTo(comet, 'x', { duration: 0.18, ease: 'power3' }) : null
        const cy = comet ? gsap.quickTo(comet, 'y', { duration: 0.18, ease: 'power3' }) : null
        const rx = ring ? gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }) : null
        const ry = ring ? gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' }) : null
        const sx = spot ? gsap.quickTo(spot, 'x', { duration: 0.8, ease: 'power2' }) : null
        const sy = spot ? gsap.quickTo(spot, 'y', { duration: 0.8, ease: 'power2' }) : null
        let sparkClock = 0
        // 49 pointerParallax layers registered via data-gsap-parallax
        const layers = gsap.utils.toArray<HTMLElement>('[data-gsap-parallax]')
        const onMove = (e: PointerEvent) => {
          cx && cx(e.clientX); cy && cy(e.clientY)
          rx && rx(e.clientX); ry && ry(e.clientY)
          sx && sx(e.clientX); sy && sy(e.clientY)
          const nx = (e.clientX / window.innerWidth - 0.5)
          const ny = (e.clientY / window.innerHeight - 0.5)
          layers.forEach((l) => {
            const d = parseFloat(l.dataset.gsapParallax || '18')
            gsap.to(l, { x: nx * d, y: ny * d, duration: 0.6, ease: 'power2.out' })
          })
          // 42 sparkleTrail — occasional sparkles along the path
          const now = performance.now()
          if (now - sparkClock > 90) {
            sparkClock = now
            const s = spawn(`<span style="font-size:${rand(9, 15)}px">✦</span>`, e.clientX, e.clientY, { color: pick(SPECTRUM), opacity: '1' })
            gsap.to(s, { y: e.clientY + rand(-30, -8), opacity: 0, scale: rand(0.4, 1.1), duration: rand(0.5, 0.9), ease: 'power1.out', onComplete: () => s.remove() })
          }
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        cleanups.push(() => window.removeEventListener('pointermove', onMove))
      }

      /* ---- click / tap globals (3,4,5) ---- */
      let clickAlt = 0
      const onDown = (e: PointerEvent) => {
        if (reduced) return
        const x = e.clientX, y = e.clientY
        // 5 clickRipple
        const rip = spawn('', x, y, { width: '14px', height: '14px', marginLeft: '-7px', marginTop: '-7px', borderRadius: '50%', border: `1.5px solid ${accent ? '#fff' : pick(SPECTRUM)}`, opacity: '0.8' })
        gsap.to(rip, { scale: 7, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => rip.remove() })
        // alternate 3 clickHearts / 4 clickConfetti so every tap feels different
        if (clickAlt++ % 2 === 0) {
          for (let i = 0; i < 6; i++) {
            const h = spawn(`<span style="font-size:${rand(12, 20)}px">${pick(HEARTS)}</span>`, x, y, { opacity: '1' })
            gsap.to(h, { x: x + rand(-60, 60), y: y - rand(40, 120), rotation: rand(-40, 40), opacity: 0, duration: rand(0.8, 1.3), ease: 'power2.out', onComplete: () => h.remove() })
          }
        } else {
          confettiCannon(x, y, 12)
        }
      }
      window.addEventListener('pointerdown', onDown)
      cleanups.push(() => window.removeEventListener('pointerdown', onDown))

      /* ---- ambient loops (7,8,50) ---- */
      if (!reduced) {
        // 7 auroraDrift — the two blobs breathe and wander forever
        if (auroraRef.current) {
          const blobs = Array.from(auroraRef.current.children) as HTMLElement[]
          blobs.forEach((b, i) => {
            gsap.to(b, { xPercent: i ? -18 : 22, yPercent: i ? 16 : -12, scale: 1.25, duration: 9 + i * 3, repeat: -1, yoyo: true, ease: 'sine.inOut' })
          })
        }
        // 50 beamSweep — a light beam crosses the hero on a slow cadence
        if (beamRef.current) {
          gsap.fromTo(beamRef.current, { xPercent: -140, opacity: 0 }, { xPercent: 240, opacity: 1, duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 6, yoyo: false })
        }
        // 8 emojiField — pride emojis drift up from the bottom edge
        const fieldTimer = window.setInterval(() => {
          if (document.hidden) return
          const x = rand(0, window.innerWidth)
          const e = spawn(`<span style="font-size:${rand(14, 26)}px">${pick(EMOJIS)}</span>`, x, window.innerHeight + 20, { opacity: '0' })
          gsap.timeline({ onComplete: () => e.remove() })
            .to(e, { opacity: rand(0.25, 0.6), duration: 0.8 })
            .to(e, { y: -60, x: x + rand(-60, 60), rotation: rand(-30, 30), duration: rand(7, 12), ease: 'none' }, 0)
            .to(e, { opacity: 0, duration: 1.2 }, '-=1.6')
        }, 2600)
        cleanups.push(() => window.clearInterval(fieldTimer))
      }

      /* ---- 9 prideKonami — type "pride" for a full-screen rainbow sweep ---- */
      let buf = ''
      const onKey = (e: KeyboardEvent) => {
        if (e.key.length !== 1) return
        buf = (buf + e.key.toLowerCase()).slice(-5)
        if (buf === 'pride') {
          buf = ''
          if (reduced) return
          const sweep = spawn('', 0, 0, { left: '0', top: '0', width: '100vw', height: '100vh', background: `linear-gradient(120deg,${SPECTRUM.join(',')})`, opacity: '0', mixBlendMode: 'screen' })
          gsap.timeline({ onComplete: () => sweep.remove() })
            .to(sweep, { opacity: 0.5, duration: 0.4 })
            .to(sweep, { opacity: 0, duration: 1.1 })
          for (let i = 0; i < 3; i++) setTimeout(() => confettiCannon(rand(0, window.innerWidth), rand(0, window.innerHeight * 0.5), 18), i * 160)
        }
      }
      window.addEventListener('keydown', onKey)
      cleanups.push(() => window.removeEventListener('keydown', onKey))

      /* ---- 10 scrollProgress — a gradient bar tracks page scroll ---- */
      const bar = document.createElement('div')
      Object.assign(bar.style, { position: 'fixed', left: '0', top: '0', height: '2px', width: '100%', transformOrigin: 'left center', transform: 'scaleX(0)', zIndex: '9100', background: accent || `linear-gradient(90deg,${SPECTRUM.join(',')})`, pointerEvents: 'none' } as CSSStyleDeclaration)
      document.body.appendChild(bar)
      const stProg = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }) })
      cleanups.push(() => { stProg.kill(); bar.remove() })

      /* ============================ ELEMENT EFFECTS ============================ */

      // 11 magnetic + 12 magneticLabel
      gsap.utils.toArray<HTMLElement>('[data-gsap~="magnetic"]').forEach((el) => {
        if (reduced) return
        const label = el.querySelector<HTMLElement>('[data-gsap-label]')
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })
        const enter = () => gsap.to(el, { scale: 1.05, duration: 0.3 })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const mx = e.clientX - (r.left + r.width / 2)
          const my = e.clientY - (r.top + r.height / 2)
          xTo(mx * 0.4); yTo(my * 0.4)
          if (label) gsap.to(label, { x: mx * 0.15, y: my * 0.15, duration: 0.4 })
        }
        const leave = () => { xTo(0); yTo(0); gsap.to(el, { scale: 1, duration: 0.4 }); if (label) gsap.to(label, { x: 0, y: 0, duration: 0.4 }) }
        el.addEventListener('pointerenter', enter)
        el.addEventListener('pointermove', move as any)
        el.addEventListener('pointerleave', leave)
        cleanups.push(() => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move as any); el.removeEventListener('pointerleave', leave) })
      })

      // 13 tilt + 14 tiltGlare
      gsap.utils.toArray<HTMLElement>('[data-gsap~="tilt"]').forEach((el) => {
        if (reduced) return
        el.style.transformStyle = 'preserve-3d'
        let glare = el.querySelector<HTMLElement>('[data-gsap-glare]')
        if (!glare) {
          glare = document.createElement('span')
          glare.setAttribute('data-gsap-glare', '1')
          Object.assign(glare.style, { position: 'absolute', inset: '0', borderRadius: 'inherit', pointerEvents: 'none', opacity: '0', background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.35), transparent 60%)' } as CSSStyleDeclaration)
          if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
          el.appendChild(glare)
        }
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          gsap.to(el, { rotationY: px * 16, rotationX: -py * 16, duration: 0.4, ease: 'power2.out', transformPerspective: 700 })
          gsap.to(glare!, { opacity: 0.8, backgroundPosition: `${50 + px * 60}% ${py * 60}%`, duration: 0.3 })
        }
        const leave = () => { gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' }); gsap.to(glare!, { opacity: 0, duration: 0.4 }) }
        el.addEventListener('pointermove', move as any)
        el.addEventListener('pointerleave', leave)
        cleanups.push(() => { el.removeEventListener('pointermove', move as any); el.removeEventListener('pointerleave', leave) })
      })

      // 15 revealRise + 16 revealStagger (ScrollTrigger)
      gsap.utils.toArray<HTMLElement>('[data-gsap~="reveal"]').forEach((el) => {
        if (reduced) { gsap.set(el, { opacity: 1 }); return }
        const kids = el.hasAttribute('data-gsap-stagger') ? Array.from(el.children) : [el]
        gsap.from(kids, {
          opacity: 0, y: 26, duration: 0.7, ease: 'power3.out',
          stagger: kids.length > 1 ? 0.06 : 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      // 17 scrubDepth — parallax translate tied to scroll
      gsap.utils.toArray<HTMLElement>('[data-gsap-depth]').forEach((el) => {
        if (reduced) return
        const depth = parseFloat(el.dataset.gsapDepth || '60')
        gsap.to(el, { y: depth, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })

      // 18 pinGrow — element scales up a touch while pinned in view
      gsap.utils.toArray<HTMLElement>('[data-gsap~="pin"]').forEach((el) => {
        if (reduced) return
        gsap.fromTo(el, { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 40%', scrub: true } })
      })

      // 19 charWave — per-character sine wave loop
      gsap.utils.toArray<HTMLElement>('[data-gsap~="wave"]').forEach((el) => {
        if (reduced) return
        const chars = splitChars(el)
        gsap.to(chars, { y: -8, duration: 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: { each: 0.05, from: 'start' } })
      })

      // 20 charRise — characters rise/fade in on scroll
      gsap.utils.toArray<HTMLElement>('[data-gsap~="chars"]').forEach((el) => {
        const chars = splitChars(el)
        if (reduced) { gsap.set(chars, { opacity: 1 }); return }
        gsap.from(chars, { opacity: 0, y: 20, rotationX: -60, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
      })

      // 21 textScramble — characters resolve out of noise
      gsap.utils.toArray<HTMLElement>('[data-gsap~="scramble"]').forEach((el) => {
        const final = el.textContent || ''
        if (reduced) return
        const glyphs = '!<>-_\\/[]{}—=+*^?#'
        let frame = 0
        const total = final.length * 3
        const tick = () => {
          let out = ''
          for (let i = 0; i < final.length; i++) {
            if (i < frame / 3) out += final[i]
            else out += glyphs[Math.floor(Math.random() * glyphs.length)]
          }
          el.textContent = out
          frame++
          if (frame <= total) requestAnimationFrame(tick)
          else el.textContent = final
        }
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => { frame = 0; tick() } })
      })

      // 22 gradientSweep — animate the background-position of gradient text
      gsap.utils.toArray<HTMLElement>('[data-gsap~="sweep"]').forEach((el) => {
        if (reduced) return
        el.style.backgroundSize = '200% 100%'
        gsap.to(el, { backgroundPositionX: '200%', duration: 6, ease: 'none', repeat: -1 })
      })

      // 23 counterRoll — data-gsap-count target rolls up when scrolled into view
      gsap.utils.toArray<HTMLElement>('[data-gsap-count]').forEach((el) => {
        const to = parseFloat(el.dataset.gsapCount || '0')
        ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => flipNumber(el, to, el.dataset.gsapPrefix || '', el.dataset.gsapSuffix || '') })
      })

      // 24 underlineDraw — an accent underline wipes in on hover
      gsap.utils.toArray<HTMLElement>('[data-gsap~="underline"]').forEach((el) => {
        if (reduced) return
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
        const line = document.createElement('span')
        Object.assign(line.style, { position: 'absolute', left: '0', bottom: '-2px', height: '2px', width: '100%', transformOrigin: 'left center', transform: 'scaleX(0)', background: accent || `linear-gradient(90deg,${SPECTRUM.join(',')})` } as CSSStyleDeclaration)
        el.appendChild(line)
        const enter = () => gsap.to(line, { scaleX: 1, transformOrigin: 'left center', duration: 0.4, ease: 'power2.out' })
        const leave = () => gsap.to(line, { scaleX: 0, transformOrigin: 'right center', duration: 0.3, ease: 'power2.in' })
        el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave)
        cleanups.push(() => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave) })
      })

      // 25 breathe — gentle scale pulse
      gsap.utils.toArray<HTMLElement>('[data-gsap~="breathe"]').forEach((el) => {
        if (reduced) return
        gsap.to(el, { scale: 1.06, duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })

      // 26 glowPulse — drop-shadow pulse
      gsap.utils.toArray<HTMLElement>('[data-gsap~="glow"]').forEach((el, i) => {
        if (reduced) return
        const c = SPECTRUM[i % SPECTRUM.length]
        gsap.fromTo(el, { filter: `drop-shadow(0 0 3px ${c}66)` }, { filter: `drop-shadow(0 0 14px ${c})`, duration: 1.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })

      // 27 floatBob — vertical bob with random phase
      gsap.utils.toArray<HTMLElement>('[data-gsap~="float"]').forEach((el) => {
        if (reduced) return
        gsap.to(el, { y: rand(-10, -6), duration: rand(2, 3.2), ease: 'sine.inOut', repeat: -1, yoyo: true, delay: rand(0, 1) })
      })

      // 28 shimmer — a sheen sweeps across the element forever
      gsap.utils.toArray<HTMLElement>('[data-gsap~="shimmer"]').forEach((el) => {
        if (reduced) return
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
        el.style.overflow = 'hidden'
        const sh = document.createElement('span')
        Object.assign(sh.style, { position: 'absolute', top: '0', bottom: '0', width: '40%', transform: 'skewX(-18deg)', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', pointerEvents: 'none' } as CSSStyleDeclaration)
        el.appendChild(sh)
        gsap.fromTo(sh, { xPercent: -260 }, { xPercent: 460, duration: 2.2, ease: 'power1.inOut', repeat: -1, repeatDelay: 2.4 })
      })

      // 29 jelly — squash/stretch on hover
      gsap.utils.toArray<HTMLElement>('[data-gsap~="jelly"]').forEach((el) => {
        if (reduced) return
        const enter = () => gsap.fromTo(el, { scaleX: 1.14, scaleY: 0.86 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1,0.35)' })
        el.addEventListener('pointerenter', enter)
        cleanups.push(() => el.removeEventListener('pointerenter', enter))
      })

      // 30 pressPop — depress on pointerdown, spring back on release
      gsap.utils.toArray<HTMLElement>('[data-gsap~="press"]').forEach((el) => {
        if (reduced) return
        const down = () => gsap.to(el, { scale: 0.92, duration: 0.12 })
        const up = () => gsap.to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.4)' })
        el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up)
        cleanups.push(() => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', up); el.removeEventListener('pointerleave', up) })
      })

      // 31 rippleButton — a material-style ripple from the click point, inside the button
      gsap.utils.toArray<HTMLElement>('[data-gsap~="ripple"]').forEach((el) => {
        if (reduced) return
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
        el.style.overflow = 'hidden'
        const down = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const d = document.createElement('span')
          Object.assign(d.style, { position: 'absolute', left: `${e.clientX - r.left}px`, top: `${e.clientY - r.top}px`, width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', pointerEvents: 'none' } as CSSStyleDeclaration)
          el.appendChild(d)
          gsap.to(d, { scale: 42, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => d.remove() })
        }
        el.addEventListener('pointerdown', down as any)
        cleanups.push(() => el.removeEventListener('pointerdown', down as any))
      })

      // 32 flipCard — 3D flip between front/back on click
      gsap.utils.toArray<HTMLElement>('[data-gsap~="flip"]').forEach((el) => {
        let flipped = false
        const click = () => {
          flipped = !flipped
          gsap.to(el, { rotationY: flipped ? 180 : 0, duration: reduced ? 0 : 0.7, ease: 'power3.inOut', transformPerspective: 900 })
        }
        el.style.transformStyle = 'preserve-3d'
        el.addEventListener('click', click)
        cleanups.push(() => el.removeEventListener('click', click))
      })

      // 33 heartbeat — double-thump loop
      gsap.utils.toArray<HTMLElement>('[data-gsap~="heartbeat"]').forEach((el) => {
        if (reduced) return
        gsap.timeline({ repeat: -1, repeatDelay: 1.1 })
          .to(el, { scale: 1.18, duration: 0.14, ease: 'power2.out' })
          .to(el, { scale: 1, duration: 0.14, ease: 'power2.in' })
          .to(el, { scale: 1.12, duration: 0.12, ease: 'power2.out' })
          .to(el, { scale: 1, duration: 0.2, ease: 'power2.in' })
      })

      // 34 rainbowBorder — a conic accent border rotates
      gsap.utils.toArray<HTMLElement>('[data-gsap~="rainbow"]').forEach((el) => {
        if (reduced) return
        const obj = { a: 0 }
        gsap.to(obj, { a: 360, duration: 5, ease: 'none', repeat: -1, onUpdate: () => { el.style.background = `conic-gradient(from ${obj.a}deg, ${SPECTRUM.join(',')}, ${SPECTRUM[0]})` } })
      })

      // 35 draggableThrow — grab & fling with inertia, snaps home
      gsap.utils.toArray<HTMLElement>('[data-gsap~="drag"]').forEach((el) => {
        if (reduced) return
        Draggable.create(el, {
          type: 'x,y', inertia: false, edgeResistance: 0.65, dragClickables: true,
          onDragStart: function () { gsap.to(el, { scale: 1.1, duration: 0.2 }) },
          onRelease: function () { gsap.to(el, { x: 0, y: 0, scale: 1, duration: 1, ease: 'elastic.out(1,0.5)' }) },
        })
      })

      // 36 spinWheel — a draggable disc that keeps spinning with throw velocity
      gsap.utils.toArray<HTMLElement>('[data-gsap~="wheel"]').forEach((el) => {
        if (reduced) return
        Draggable.create(el, { type: 'rotation', inertia: false,
          onDrag: function () { /* live rotate handled by Draggable */ },
          onRelease: function () { gsap.to(el, { rotation: '+=' + rand(120, 520), duration: 2.4, ease: 'power3.out' }) },
        })
      })

      // 37 elasticIn — pop in with an elastic overshoot on scroll
      gsap.utils.toArray<HTMLElement>('[data-gsap~="elastic"]').forEach((el) => {
        if (reduced) { gsap.set(el, { opacity: 1 }); return }
        gsap.from(el, { scale: 0.5, opacity: 0, duration: 0.9, ease: 'elastic.out(1,0.5)', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
      })

      // 38 gridFlyIn — children fly in from alternating sides
      gsap.utils.toArray<HTMLElement>('[data-gsap~="flyin"]').forEach((el) => {
        if (reduced) { gsap.set(Array.from(el.children), { opacity: 1 }); return }
        const kids = Array.from(el.children)
        gsap.from(kids, { opacity: 0, x: (i) => (i % 2 ? 40 : -40), y: 30, duration: 0.7, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      })

      // 39 gsapMarquee — seamless infinite scroll of a row's duplicated content
      gsap.utils.toArray<HTMLElement>('[data-gsap~="marquee"]').forEach((el) => {
        if (reduced) return
        const track = el.firstElementChild as HTMLElement | null
        if (!track) return
        track.innerHTML = track.innerHTML + track.innerHTML  // duplicate for seamless loop
        const w = track.scrollWidth / 2
        gsap.fromTo(track, { x: 0 }, { x: -w, duration: Math.max(18, w / 45), ease: 'none', repeat: -1 })
      })

      // 40 hoverLift — lift + shadow on hover
      gsap.utils.toArray<HTMLElement>('[data-gsap~="lift"]').forEach((el) => {
        if (reduced) return
        const enter = () => gsap.to(el, { y: -6, boxShadow: '0 18px 46px rgba(0,0,0,0.5)', duration: 0.3, ease: 'power2.out' })
        const leave = () => gsap.to(el, { y: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', duration: 0.4 })
        el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave)
        cleanups.push(() => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave) })
      })

      // 41 hueCycle — slowly rotate the element's hue for a living-colour feel
      gsap.utils.toArray<HTMLElement>('[data-gsap~="hue"]').forEach((el) => {
        if (reduced) return
        const obj = { h: 0 }
        gsap.to(obj, { h: 360, duration: 12, ease: 'none', repeat: -1, onUpdate: () => { el.style.filter = `hue-rotate(${obj.h}deg)` } })
      })

      // 48 typewriter — type out data-gsap-type text when scrolled into view
      gsap.utils.toArray<HTMLElement>('[data-gsap~="type"]').forEach((el) => {
        const full = el.dataset.gsapType || el.textContent || ''
        el.textContent = ''
        if (reduced) { el.textContent = full; return }
        const obj = { n: 0 }
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
          gsap.to(obj, { n: full.length, duration: full.length * 0.045, ease: 'none', onUpdate: () => { el.textContent = full.slice(0, Math.round(obj.n)) } }),
        })
      })
    })

    return () => {
      ctx.revert()
      cleanups.forEach((fn) => fn())
      const layer = document.getElementById('pride-gsap-fx')
      if (layer) layer.remove()
      try { delete (window as any).__prideGsap } catch { (window as any).__prideGsap = undefined }
    }
  }, [accent])

  return (
    <>
      {/* aurora blobs (7) */}
      <div ref={auroraRef} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', filter: 'blur(60px)', opacity: 0.5 }}>
        <span style={{ position: 'absolute', top: '10%', left: '12%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,#b96bd8aa,transparent 70%)' }} />
        <span style={{ position: 'absolute', bottom: '8%', right: '10%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,#3fd0c4aa,transparent 70%)' }} />
      </div>
      {/* light beam (50) */}
      <div ref={beamRef} aria-hidden style={{ position: 'fixed', top: 0, bottom: 0, width: '18%', pointerEvents: 'none', zIndex: 1, transform: 'skewX(-14deg)', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />
      {/* cursor spotlight (6) */}
      <div ref={spotRef} aria-hidden style={{ position: 'fixed', left: 0, top: 0, width: 460, height: 460, marginLeft: -230, marginTop: -230, borderRadius: '50%', pointerEvents: 'none', zIndex: 1, background: 'radial-gradient(circle, rgba(185,107,216,0.14), transparent 62%)', mixBlendMode: 'screen' }} />
      {/* cursor comet (1) + ring (2) — hidden on touch via pointer:fine */}
      <div ref={ringRef} aria-hidden className="pg-cursor" style={{ position: 'fixed', left: 0, top: 0, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: '50%', border: '1.5px solid rgba(230,192,122,0.6)', pointerEvents: 'none', zIndex: 9200 }} />
      <div ref={cometRef} aria-hidden className="pg-cursor" style={{ position: 'fixed', left: 0, top: 0, width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: '50%', background: 'radial-gradient(circle,#fff,#e6c07a)', boxShadow: '0 0 16px #e6c07a', pointerEvents: 'none', zIndex: 9201 }} />
      <style>{`
        @media (hover: none), (pointer: coarse) { .pg-cursor { display:none !important } }
        @media (prefers-reduced-motion: reduce) { .pg-cursor { display:none !important } }
      `}</style>
    </>
  )
}
