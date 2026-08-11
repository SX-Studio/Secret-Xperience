'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { createClient } from '../lib/supabase'
import LockerRoom from '../components/LockerRoom'
import { Aurora, Spotlight, Particles, FlagWipe, useBurst, SPRING } from '../components/pride/PrideFX'

type L = {
  id: string; title: string; age: number | null; city: string | null; country: string | null
  price_from: number | null; price_to: number | null; images: string[] | null
  tags: string[] | null; services: string[] | null; category: string | null
  subcategory: string | null; verified: boolean; meet_type: string | null
}

const SPECTRUM = 'linear-gradient(90deg,#e0507a,#b96bd8,#6b8be0,#3fd0c4,#e6c07a)'

const FLAGS: { key: string; label: string; emoji: string; grad: string }[] = [
  { key: 'rainbow', label: 'Rainbow', emoji: '🏳️‍🌈', grad: SPECTRUM },
  { key: 'bear',    label: 'Bear',    emoji: '🐻', grad: 'linear-gradient(90deg,#5a3410,#a8692c,#e4b268,#efd9a0,#2a1a0c)' },
  { key: 'leather', label: 'Leather', emoji: '🖤', grad: 'linear-gradient(90deg,#14141f,#2f57a6,#e9e9ef,#8a8a96,#c0202a)' },
  { key: 'trans',   label: 'Trans',   emoji: '🏳️‍⚧️', grad: 'linear-gradient(90deg,#5bcefa,#f5a9b8,#ffffff,#f5a9b8,#5bcefa)' },
]

const TRIBES: { key: string; label: string; icon: string; color: string; kw: string[] }[] = [
  { key: 'twinks',  label: 'Twinks',  icon: 'ti-sparkles',        color: '#f5a9b8', kw: ['twink', 'smooth', 'boy', 'young'] },
  { key: 'jocks',   label: 'Jocks',   icon: 'ti-barbell',         color: '#3fd0c4', kw: ['jock', 'muscle', 'athlet', 'sport', 'gym', 'fit'] },
  { key: 'bears',   label: 'Bears',   icon: 'ti-mood-smile-beam', color: '#a8692c', kw: ['bear', 'hairy', 'chubby', 'cub'] },
  { key: 'daddies', label: 'Daddies', icon: 'ti-crown',           color: '#e0507a', kw: ['daddy', 'mature', 'silver', 'papa'] },
  { key: 'leather', label: 'Leather', icon: 'ti-shirt',           color: '#8a8fb0', kw: ['leather', 'kink', 'fetish', 'master', 'dom', 'rubber'] },
  { key: 'otters',  label: 'Otters',  icon: 'ti-paw',             color: '#b96bd8', kw: ['otter', 'lean', 'slim'] },
]

const HANKY: { key: string; label: string; color: string; ring: string; svc: string[] }[] = [
  { key: 'anything',    label: 'Anything', color: '#ff8a3d', ring: '#ffb27a', svc: [] },
  { key: 'leather',     label: 'Leather',  color: '#141018', ring: '#5a5a72', svc: ['SM master hard','SM master soft','SM slave hard','SM slave soft','Bondage (master)','Bondage (slave)','Spanking'] },
  { key: 'oral',        label: 'Oral',     color: '#4bb8f0', ring: '#9fe0ff', svc: ['Deepthroat','Cum in mouth (CIM)','With condom','Without a condom'] },
  { key: 'fisting',     label: 'Fisting',  color: '#c0202a', ring: '#ff6b73', svc: ['Fisting (giving)','Fisting (receiving)','Anal (Greek)'] },
  { key: 'watersports', label: 'Golden',   color: '#e6c93a', ring: '#f4e58c', svc: ['Golden shower (giving)','Golden shower (receiving)'] },
  { key: 'rimming',     label: 'Rimming',  color: '#7a4ac0', ring: '#b48ce6', svc: ['Rimming (giving)','Rimming (receiving)'] },
  { key: 'toys',        label: 'Toys',     color: '#e0507a', ring: '#f5a0bd', svc: ['Games','Strapon'] },
  { key: 'cuddles',     label: 'Cuddles',  color: '#f2ede4', ring: '#ffffff', svc: ['Kissing','French kissing','Sensual massage','Body to body'] },
]

const isTrans = (t: string[]) => t.includes('type:trans') || t.includes('type:trans woman') || t.includes('type:trans man')
const TABS: { key: string; label: string; icon: string; match: (t: string[]) => boolean }[] = [
  { key: 'all',    label: 'Everyone', icon: 'ti-sparkles',      match: () => true },
  { key: 'men',    label: 'Men',      icon: 'ti-gender-male',    match: (t) => (t.includes('orientation:gay') || t.includes('orientation:bi')) && !isTrans(t) },
  { key: 'trans',  label: 'Trans',    icon: 'ti-gender-transgender', match: (t) => isTrans(t) },
  { key: 'couples',label: 'Couples',  icon: 'ti-heart-handshake',match: (t) => t.includes('type:couple') },
]
const PRIDE_TAGS = ['orientation:gay', 'orientation:bi', 'type:trans', 'type:trans woman', 'type:couple', 'type:nonbinary']

function price(a: number | null, b: number | null) { if (a && b) return `€${a}–€${b}`; if (a) return `from €${a}`; return 'POA' }
const tribeHay = (l: L) => `${l.title || ''} ${(l.tags || []).join(' ')}`.toLowerCase()
const matchTribe = (l: L, kw: string[]) => { const h = tribeHay(l); return kw.some(k => h.includes(k)) }
const matchHanky = (l: L, svc: string[]) => svc.length === 0 || (l.services || []).some(s => svc.includes(s))

export default function PridePage() {
  const rm = useReducedMotion()
  const [items, setItems] = useState<L[]>([])
  const [tab, setTab] = useState('all')
  const [country, setCountry] = useState('all')
  const [tribe, setTribe] = useState<string | null>(null)
  const [hanky, setHanky] = useState<string | null>(null)
  const [flag, setFlag] = useState('rainbow')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState<Set<string>>(new Set())

  // Vibe meter — the room warms up the more you play with it
  const [vibe, setVibe] = useState(0)
  const [afterHours, setAfterHours] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [flagWipe, setFlagWipe] = useState<{ id: number; grad: string; x: number; y: number } | null>(null)
  const { fire, layer } = useBurst()
  const wipeId = useRef(0)

  useEffect(() => {
    try { const f = localStorage.getItem('sx_pride_flag'); if (f && FLAGS.some(x => x.key === f)) setFlag(f) } catch {}
    try { const lk = JSON.parse(localStorage.getItem('sx_pride_liked') || '[]'); setLiked(new Set(lk)) } catch {}
    const supabase = createClient()
    supabase.from('listings')
      .select('id,title,age,city,country,price_from,price_to,images,tags,services,category,subcategory,verified,meet_type')
      .eq('active', true).overlaps('tags', PRIDE_TAGS)
      .order('featured_until', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems((data as L[]) || []); setLoading(false) })
  }, [])

  const ACC = FLAGS.find(f => f.key === flag)?.grad || SPECTRUM
  const intensity = afterHours ? 1 : vibe / 100

  function bump(n = 8) {
    setVibe(v => {
      const nv = Math.min(100, v + n)
      if (v < 100 && nv >= 100) celebrate()
      return nv
    })
  }
  function celebrate() {
    setAfterHours(true)
    setToast('✦ After hours unlocked — the room is yours')
    const cx = window.innerWidth / 2, cy = window.innerHeight * 0.4
    fire(cx, cy, 'confetti', 22)
    setTimeout(() => fire(cx - 80, cy + 30, 'heart', 14), 160)
    setTimeout(() => fire(cx + 80, cy + 30, 'confetti', 16), 300)
    setTimeout(() => setToast(null), 4200)
  }
  function pickFlag(k: string, e: React.MouseEvent) {
    setFlag(k); try { localStorage.setItem('sx_pride_flag', k) } catch {}
    const g = FLAGS.find(f => f.key === k)?.grad || SPECTRUM
    setFlagWipe({ id: ++wipeId.current, grad: g, x: e.clientX, y: e.clientY })
    fire(e.clientX, e.clientY, 'confetti', 12)
    bump(10)
  }
  function toggleLike(l: L, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setLiked(prev => {
      const nx = new Set(prev)
      if (nx.has(l.id)) nx.delete(l.id)
      else { nx.add(l.id); fire(e.clientX, e.clientY, 'heart', 12); bump(6) }
      try { localStorage.setItem('sx_pride_liked', JSON.stringify([...nx])) } catch {}
      return nx
    })
  }

  const countries = useMemo(() => { const s = new Set<string>(); items.forEach(i => i.country && s.add(i.country)); return Array.from(s).sort() }, [items])
  const base = useMemo(() => {
    const t = TABS.find(x => x.key === tab)!
    const hk = hanky ? HANKY.find(x => x.key === hanky) : null
    return items.filter(i => t.match(i.tags || []) && (country === 'all' || i.country === country) && (!hk || matchHanky(i, hk.svc)))
  }, [items, tab, country, hanky])
  const tr = tribe ? TRIBES.find(x => x.key === tribe) : null
  const tribeHits = useMemo(() => tr ? base.filter(i => matchTribe(i, tr.kw)) : [], [base, tr])
  const tribeFellBack = !!tr && tribeHits.length === 0
  const shown = tr && !tribeFellBack ? tribeHits : base

  const count = (k: string) => { const t = TABS.find(x => x.key === k)!; return items.filter(i => t.match(i.tags || [])).length }
  const tribeCount = (kw: string[]) => items.filter(i => matchTribe(i, kw)).length
  const hankyCount = (svc: string[]) => svc.length === 0 ? items.length : items.filter(i => matchHanky(i, svc)).length

  return (
    <div style={{ background: afterHours ? '#05040c' : '#080612', minHeight: '100vh', color: '#ece8e1', transition: 'background 1.2s ease', position: 'relative' }}>
      <style>{`
        @keyframes prideShift { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes prMarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes prGlow { 0%,100%{filter:drop-shadow(0 0 4px rgba(185,107,216,.4))} 50%{filter:drop-shadow(0 0 12px rgba(185,107,216,.8))} }
        .pr-rule { height:2px; background-image:${ACC}; background-size:200% 100%; animation:prideShift 8s linear infinite; border:0; }
        .pr-photo { transition: transform .8s cubic-bezier(.2,.8,.4,1); }
        .pr-marq:hover .pr-marq-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .pr-rule,[data-anim]{ animation:none!important } }
      `}</style>

      {/* Ambient layers */}
      <Spotlight on={!afterHours || true} />
      {layer}
      <FlagWipe trigger={flagWipe} />

      {/* Vibe meter ribbon */}
      <div style={{ position: 'sticky', top: 64, zIndex: 150, height: 3, background: 'rgba(255,255,255,0.05)' }}>
        <motion.div style={{ height: '100%', backgroundImage: ACC, backgroundSize: '200% 100%', transformOrigin: 'left' }}
          animate={{ scaleX: vibe / 100 }} transition={SPRING} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={SPRING}
            style={{ position: 'fixed', top: 80, left: '50%', translateX: '-50%', zIndex: 120, padding: '10px 20px', borderRadius: 999,
              background: 'rgba(12,8,20,0.9)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
              font: '600 13px/1 Poppins, sans-serif', color: '#f2ede4', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#c5a05a', textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
        <Link href="/" style={{ height: 36, padding: '0 14px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><i className="ti ti-arrow-left" /> Home</Link>
      </nav>

      {/* hero */}
      <section style={{ padding: '4.5rem 1.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Aurora intensity={intensity} />
        <Particles intensity={intensity} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.1rem', backgroundImage: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Pride · Spectrum · Everyone welcome</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 400, lineHeight: 1.12, margin: '0 0 1rem' }}>
            After dark, <em style={{ fontStyle: 'italic', backgroundImage: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>all colours.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
            style={{ fontSize: 15.5, color: 'rgba(236,232,225,0.62)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Gay &amp; bi men, trans companions and open-minded couples across Belgium and beyond — verified, discreet, and unapologetically yours. Meetups only; be kind, ask first.
          </motion.p>

          {/* Fly your flag */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {FLAGS.map(f => {
              const active = flag === f.key
              return (
                <motion.button key={f.key} onClick={(e) => pickFlag(f.key, e)} title={`${f.label} flag`}
                  whileHover={rm ? {} : { y: -2, scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
                  style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
                    border: active ? '1px solid transparent' : '0.5px solid rgba(255,255,255,0.14)', background: active ? 'transparent' : 'rgba(255,255,255,0.03)',
                    color: active ? '#0a0710' : 'rgba(236,232,225,0.7)', font: '700 12px/1 Poppins, sans-serif', overflow: 'hidden' }}>
                  {active && <motion.span layoutId="prFlagBg" transition={SPRING} style={{ position: 'absolute', inset: 0, backgroundImage: f.grad, zIndex: 0 }} />}
                  <span style={{ position: 'relative', zIndex: 1, fontSize: 15 }}>{f.emoji}</span>
                  <span style={{ position: 'relative', zIndex: 1 }}>{f.label}</span>
                </motion.button>
              )
            })}
          </div>
          <hr className="pr-rule" style={{ maxWidth: 220, margin: '0 auto' }} />
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem', position: 'relative', zIndex: 2 }}>

        {/* Cruise Control */}
        <motion.a href="/discover?vibe=pride" onClick={() => bump(4)} whileHover={rm ? {} : { y: -3 }} whileTap={{ scale: 0.99 }} transition={SPRING}
          style={{ display: 'flex', alignItems: 'center', gap: 18, textDecoration: 'none', borderRadius: 18, padding: '20px 24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20,14,26,0.6)' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: ACC, opacity: 0.14 }} />
          <motion.div animate={rm ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', width: 56, height: 56, borderRadius: 16, backgroundImage: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
            <i className="ti ti-flame" style={{ fontSize: 28, color: '#0a0710' }} />
          </motion.div>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: 5 }}>Cruise Mode</div>
            <div style={{ font: '400 21px/1.15 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>Swipe the room — right to save, left to pass.</div>
          </div>
          <i className="ti ti-arrow-right" style={{ position: 'relative', color: '#f2ede4', fontSize: 24, flexShrink: 0 }} />
        </motion.a>

        {/* Tonight's Lineup */}
        {items.filter(i => i.images?.[0]).length > 3 && (
          <div style={{ marginBottom: '2.25rem' }}>
            <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.24em', textTransform: 'uppercase', backgroundImage: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#26d4a0', boxShadow: '0 0 10px #26d4a0' }} /> Tonight&rsquo;s Lineup
            </div>
            <div className="pr-marq" style={{ position: 'relative', overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)' }}>
              <div className="pr-marq-track" data-anim style={{ display: 'flex', gap: 12, width: 'max-content', animation: rm ? 'none' : 'prMarquee 34s linear infinite' }}>
                {(() => { const t = items.filter(i => i.images?.[0]).slice(0, 14); return [...t, ...t] })().map((l, idx) => (
                  <motion.a key={l.id + '-' + idx} href={`/listings/${l.id}`} whileHover={rm ? {} : { y: -3, scale: 1.03 }} transition={SPRING}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', textDecoration: 'none', flexShrink: 0 }}>
                    <span data-anim style={{ display: 'block', borderRadius: '50%', padding: 2, backgroundImage: ACC, animation: rm ? 'none' : 'prGlow 3.5s ease-in-out infinite' }}>
                      <img src={l.images![0]} alt="" loading="lazy" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '2px solid #080612' }} />
                    </span>
                    <span style={{ font: '600 12.5px/1 Poppins, sans-serif', color: '#ece8e1' }}>{l.title}</span>
                    {l.city && <span style={{ font: '300 11px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.45)' }}>· {l.city}</span>}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Find your tribe */}
        <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: 12 }}>Find your tribe</div>
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: '2.25rem' }}>
          {TRIBES.map(trb => {
            const active = tribe === trb.key
            return (
              <motion.button key={trb.key} onClick={() => { setTribe(active ? null : trb.key); if (!active) bump(6) }} layout
                whileHover={rm ? {} : { y: -5, scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', padding: '18px 14px', borderRadius: 16, textAlign: 'left',
                  border: active ? `1px solid ${trb.color}` : '0.5px solid rgba(255,255,255,0.09)',
                  background: `linear-gradient(150deg, ${trb.color}2e, rgba(20,14,26,0.6) 62%)`,
                  boxShadow: active ? `0 14px 40px ${trb.color}40` : '0 8px 24px rgba(0,0,0,0.3)' }}>
                {active && <motion.span layoutId="prTribeGlow" transition={SPRING} style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${trb.color}, 0 0 30px ${trb.color}30`, borderRadius: 16 }} />}
                <i className={`ti ${trb.icon}`} style={{ fontSize: 26, color: trb.color, display: 'block', marginBottom: 10, position: 'relative' }} />
                <div style={{ font: '600 14px/1 Poppins, sans-serif', color: '#f2ede4', position: 'relative' }}>{trb.label}</div>
                {(() => { const n = tribeCount(trb.kw); return <div style={{ font: '400 11px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.4)', marginTop: 4, position: 'relative' }}>{n > 0 ? `${n} here` : 'be the first 🔥'}</div> })()}
              </motion.button>
            )
          })}
        </motion.div>

        {/* tabs with sliding indicator */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <motion.button key={t.key} onClick={() => { setTab(t.key); bump(3) }} whileTap={{ scale: 0.96 }} transition={SPRING}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                  border: active ? '1px solid transparent' : '0.5px solid rgba(255,255,255,0.14)', background: 'transparent',
                  color: active ? '#0a0710' : 'rgba(236,232,225,0.7)', font: '700 13px/1 Poppins, sans-serif', overflow: 'hidden' }}>
                {active && <motion.span layoutId="prTabBg" transition={SPRING} style={{ position: 'absolute', inset: 0, backgroundImage: ACC, zIndex: 0 }} />}
                <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 7 }}><i className={`ti ${t.icon}`} /> {t.label} · {count(t.key)}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Hanky code rail */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.45)' }}>Hanky code · tap a colour</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {HANKY.map((h, i) => {
            const active = hanky === h.key
            const n = hankyCount(h.svc)
            return (
              <button key={h.key} onClick={() => { setHanky(active ? null : h.key); if (!active) bump(5) }} title={`${h.label} · ${n}`} disabled={n === 0}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: n === 0 ? 'default' : 'pointer', background: 'none', border: 0, opacity: n === 0 ? 0.3 : 1 }}>
                <span style={{ position: 'relative', width: 30, height: 30 }}>
                  {active && <motion.span layoutId="prHankyRing" transition={SPRING} style={{ position: 'absolute', inset: -5, borderRadius: 12, boxShadow: `0 0 0 2px #fff, 0 0 18px ${h.ring}` }} />}
                  <motion.span aria-hidden data-anim
                    animate={rm ? {} : { rotate: [45, 51, 45, 39, 45] }}
                    transition={rm ? {} : { duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                    whileHover={{ scale: 1.15 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: 9, background: h.color, border: `1px solid ${h.ring}`, boxShadow: active ? `0 6px 16px ${h.ring}55` : '0 4px 12px rgba(0,0,0,0.4)' }} />
                </span>
                <span style={{ font: `${active ? 700 : 500} 11px/1 Poppins, sans-serif`, color: active ? '#f2ede4' : 'rgba(236,232,225,0.6)' }}>{h.label}</span>
              </button>
            )
          })}
        </div>

        {/* country filter */}
        {countries.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <select value={country} onChange={e => setCountry(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.25)', color: '#ece8e1', font: '400 13.5px Poppins, sans-serif' }}>
              <option value="all">All countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {(tribe || hanky) && (
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <button onClick={() => { setTribe(null); setHanky(null) }} style={{ font: '500 12px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.6)', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '7px 15px', cursor: 'pointer' }}>
              <i className="ti ti-x" style={{ fontSize: 12 }} /> Clear filters
            </button>
          </div>
        )}

        {tribeFellBack && (
          <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.5)', font: '400 12.5px/1.5 Poppins, sans-serif', marginBottom: '1.25rem' }}>
            No <strong style={{ color: '#f2ede4' }}>{tr!.label}</strong> tagged yet — showing the whole room. Be the first to claim it 🔥
          </p>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.5)' }}>Loading…</p>
        ) : shown.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
            {shown.map((l, i) => (
              <motion.a key={l.id} href={`/listings/${l.id}`}
                initial={rm ? { opacity: 1 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                transition={{ ...SPRING, delay: Math.min(i, 8) * 0.035 }}
                whileHover={rm ? {} : { y: -5 }}
                style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', overflow: 'hidden', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.09)', background: 'rgba(20,14,26,0.55)' }}>
                <motion.div className="pr-hoverwrap" whileHover="h" initial="rest" animate="rest" style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#0b0710' }}>
                  {l.images?.[0]
                    ? <motion.img className="pr-photo" src={l.images[0]} alt={l.title} loading="lazy" variants={{ rest: { scale: 1 }, h: { scale: 1.06 } }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.4, 1] }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', backgroundImage: ACC, opacity: .25 }} />}
                  {/* sheen sweep */}
                  {!rm && <motion.div aria-hidden variants={{ rest: { x: '-120%', opacity: 0 }, h: { x: '220%', opacity: 1 } }} transition={{ duration: 0.9, ease: 'easeOut' }}
                    style={{ position: 'absolute', top: 0, bottom: 0, width: '55%', transform: 'skewX(-18deg)', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)', pointerEvents: 'none' }} />}
                  {l.verified && <span style={{ position: 'absolute', top: 8, left: 8, font: '700 9px/1 Poppins', letterSpacing: '.08em', color: '#0a0710', background: '#26d4a0', padding: '4px 7px', borderRadius: 6 }}>✓ VERIFIED</span>}
                  {/* like heart */}
                  <motion.button onClick={(e) => toggleLike(l, e)} whileTap={{ scale: 0.8 }} aria-label={liked.has(l.id) ? 'Unsave' : 'Save'}
                    style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,6,18,0.5)', backdropFilter: 'blur(6px)' }}>
                    <motion.span animate={liked.has(l.id) ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={SPRING} style={{ display: 'inline-flex' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={liked.has(l.id) ? '#e0507a' : 'none'} stroke={liked.has(l.id) ? '#e0507a' : 'rgba(255,255,255,0.8)'} strokeWidth="2"><path d="M12 21s-8-5.3-8-10.6A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8 4.4C20 15.7 12 21 12 21z" /></svg>
                    </motion.span>
                  </motion.button>
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundImage: ACC }} />
                </motion.div>
                <div style={{ padding: '11px 13px 13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ font: '400 18px/1.1 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>{l.title}</span>
                    {l.age ? <span style={{ fontSize: 12, color: 'rgba(236,232,225,0.5)' }}>{l.age}</span> : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, font: '300 12px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.5)' }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 12, color: '#b96bd8' }} />{[l.city, l.country].filter(Boolean).join(', ')}
                  </div>
                  <div style={{ marginTop: 8, font: '600 12.5px/1 Poppins, sans-serif', color: '#e6c07a' }}>{price(l.price_from, l.price_to)}</div>
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '0.5px dashed rgba(255,255,255,0.14)', borderRadius: 16 }}>
            <i className="ti ti-rainbow" style={{ fontSize: 34, backgroundImage: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }} />
            <p style={{ color: 'rgba(236,232,225,0.6)', marginTop: 10 }}>No one&rsquo;s out to play in this filter yet — be the first flame 🔥</p>
          </div>
        )}

        <LockerRoom />

        <p style={{ marginTop: '2.5rem', fontSize: 11.5, color: 'rgba(236,232,225,0.35)', textAlign: 'center', lineHeight: 1.6, maxWidth: 640, marginInline: 'auto' }}>
          A safe, consent-first space. Everyone here is 18+ and independent. Respect pronouns, ask before you assume, and report anything that isn&rsquo;t kind. Meetup-requests only — no on-platform payments for companionship.
        </p>
      </div>
    </div>
  )
}
