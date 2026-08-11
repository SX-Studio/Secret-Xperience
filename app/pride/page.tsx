'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'
import LockerRoom from '../components/LockerRoom'

type L = {
  id: string
  title: string
  age: number | null
  city: string | null
  country: string | null
  price_from: number | null
  price_to: number | null
  images: string[] | null
  tags: string[] | null
  services: string[] | null
  category: string | null
  subcategory: string | null
  verified: boolean
  meet_type: string | null
}

const SPECTRUM = 'linear-gradient(90deg,#e0507a,#b96bd8,#6b8be0,#3fd0c4,#e6c07a)'

// ── Fly your flag: pick a flag, the whole hub re-themes to match ──────────────
const FLAGS: { key: string; label: string; emoji: string; grad: string }[] = [
  { key: 'rainbow', label: 'Rainbow', emoji: '🏳️‍🌈', grad: SPECTRUM },
  { key: 'bear',    label: 'Bear',    emoji: '🐻', grad: 'linear-gradient(90deg,#5a3410,#a8692c,#e4b268,#efd9a0,#2a1a0c)' },
  { key: 'leather', label: 'Leather', emoji: '🖤', grad: 'linear-gradient(90deg,#14141f,#2f57a6,#e9e9ef,#8a8a96,#c0202a)' },
  { key: 'trans',   label: 'Trans',   emoji: '🏳️‍⚧️', grad: 'linear-gradient(90deg,#5bcefa,#f5a9b8,#ffffff,#f5a9b8,#5bcefa)' },
]

// ── Find your tribe: playful browse tiles (soft keyword match) ────────────────
const TRIBES: { key: string; label: string; icon: string; color: string; kw: string[] }[] = [
  { key: 'twinks',  label: 'Twinks',  icon: 'ti-sparkles',        color: '#f5a9b8', kw: ['twink', 'smooth', 'boy', 'young'] },
  { key: 'jocks',   label: 'Jocks',   icon: 'ti-barbell',         color: '#3fd0c4', kw: ['jock', 'muscle', 'athlet', 'sport', 'gym', 'fit'] },
  { key: 'bears',   label: 'Bears',   icon: 'ti-mood-smile-beam', color: '#a8692c', kw: ['bear', 'hairy', 'chubby', 'cub', 'daddy bear'] },
  { key: 'daddies', label: 'Daddies', icon: 'ti-crown',           color: '#e0507a', kw: ['daddy', 'mature', 'silver', 'papa'] },
  { key: 'leather', label: 'Leather', icon: 'ti-shirt',           color: '#8a8fb0', kw: ['leather', 'kink', 'fetish', 'master', 'dom', 'rubber'] },
  { key: 'otters',  label: 'Otters',  icon: 'ti-paw',             color: '#b96bd8', kw: ['otter', 'lean', 'slim'] },
]

// ── Hanky code rail: tap a colour, filter by what they actually offer ─────────
// Each colour maps to real service labels from the possibilities catalogue.
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

function price(a: number | null, b: number | null) {
  if (a && b) return `€${a}–€${b}`
  if (a) return `from €${a}`
  return 'POA'
}

const tribeHay = (l: L) => `${l.title || ''} ${(l.tags || []).join(' ')}`.toLowerCase()
const matchTribe = (l: L, kw: string[]) => { const h = tribeHay(l); return kw.some(k => h.includes(k)) }
const matchHanky = (l: L, svc: string[]) => svc.length === 0 || (l.services || []).some(s => svc.includes(s))

export default function PridePage() {
  const [items, setItems] = useState<L[]>([])
  const [tab, setTab] = useState('all')
  const [country, setCountry] = useState('all')
  const [tribe, setTribe] = useState<string | null>(null)
  const [hanky, setHanky] = useState<string | null>(null)
  const [flag, setFlag] = useState('rainbow')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try { const f = localStorage.getItem('sx_pride_flag'); if (f && FLAGS.some(x => x.key === f)) setFlag(f) } catch {}
    const supabase = createClient()
    supabase.from('listings')
      .select('id,title,age,city,country,price_from,price_to,images,tags,services,category,subcategory,verified,meet_type')
      .eq('active', true).overlaps('tags', PRIDE_TAGS)
      .order('featured_until', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems((data as L[]) || []); setLoading(false) })
  }, [])

  const ACC = FLAGS.find(f => f.key === flag)?.grad || SPECTRUM
  function pickFlag(k: string) { setFlag(k); try { localStorage.setItem('sx_pride_flag', k) } catch {} }

  const countries = useMemo(() => {
    const s = new Set<string>(); items.forEach(i => i.country && s.add(i.country)); return Array.from(s).sort()
  }, [items])

  // Base filter (tab + country + hanky), then tribe on top. If a tribe has no
  // one tagged yet, fall back to the base set so the room never looks empty.
  const base = useMemo(() => {
    const t = TABS.find(x => x.key === tab)!
    const hk = hanky ? HANKY.find(x => x.key === hanky) : null
    return items.filter(i =>
      t.match(i.tags || []) &&
      (country === 'all' || i.country === country) &&
      (!hk || matchHanky(i, hk.svc)))
  }, [items, tab, country, hanky])

  const tr = tribe ? TRIBES.find(x => x.key === tribe) : null
  const tribeHits = useMemo(() => tr ? base.filter(i => matchTribe(i, tr.kw)) : [], [base, tr])
  const tribeFellBack = !!tr && tribeHits.length === 0
  const shown = tr && !tribeFellBack ? tribeHits : base

  const tonight = useMemo(() => items.filter(i => i.images?.[0]).slice(0, 14), [items])
  const count = (k: string) => { const t = TABS.find(x => x.key === k)!; return items.filter(i => t.match(i.tags || [])).length }
  const tribeCount = (kw: string[]) => items.filter(i => matchTribe(i, kw)).length
  const hankyCount = (svc: string[]) => svc.length === 0 ? items.length : items.filter(i => matchHanky(i, svc)).length

  const chip = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 999, cursor: 'pointer',
    border: active ? '1px solid transparent' : '0.5px solid rgba(255,255,255,0.14)',
    background: active ? ACC : 'rgba(255,255,255,0.03)', color: active ? '#0a0710' : 'rgba(236,232,225,0.72)',
    font: '600 12.5px/1 Poppins, sans-serif', whiteSpace: 'nowrap', transition: 'all .15s',
  })

  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      <style>{`
        @keyframes prideShift { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes prMarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .pr-rule { height:2px; background:${ACC}; background-size:200% 100%; animation:prideShift 8s linear infinite; border:0; }
        .pr-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .pr-card:hover { transform: translateY(-4px); box-shadow: 0 22px 54px rgba(0,0,0,.55); }
        .pr-card:hover .pr-photo { transform: scale(1.05); }
        .pr-tribe { transition: transform .2s ease, box-shadow .2s ease; }
        .pr-tribe:hover { transform: translateY(-4px) scale(1.02); }
        .pr-marq:hover .pr-marq-track { animation-play-state: paused; }
        .pr-hanky { transition: transform .15s ease; }
        .pr-hanky:hover { transform: translateY(-3px); }
        .pr-cruise:hover { transform: translateY(-3px); box-shadow: 0 24px 60px rgba(0,0,0,.5); }
        .pr-cruise:hover .pr-cruise-arrow { transform: translateX(5px); }
      `}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#c5a05a', textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
        <Link href="/" style={{ height: 36, padding: '0 14px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><i className="ti ti-arrow-left" /> Home</Link>
      </nav>

      {/* hero */}
      <section style={{ padding: '4.5rem 1.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(185,107,216,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.1rem', background: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Pride · Spectrum · Everyone welcome</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 400, lineHeight: 1.12, margin: '0 0 1rem' }}>
            After dark, <em style={{ fontStyle: 'italic', background: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>all colours.</em>
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(236,232,225,0.62)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Gay &amp; bi men, trans companions and open-minded couples across Belgium and beyond — verified, discreet, and unapologetically yours. Meetups only; be kind, ask first.
          </p>

          {/* Fly your flag */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {FLAGS.map(f => (
              <button key={f.key} onClick={() => pickFlag(f.key)} title={`${f.label} flag`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
                border: flag === f.key ? '1px solid transparent' : '0.5px solid rgba(255,255,255,0.14)',
                background: flag === f.key ? f.grad : 'rgba(255,255,255,0.03)', color: flag === f.key ? '#0a0710' : 'rgba(236,232,225,0.7)',
                font: '700 12px/1 Poppins, sans-serif', transition: 'all .15s',
              }}><span style={{ fontSize: 15 }}>{f.emoji}</span> {f.label}</button>
            ))}
          </div>
          <hr className="pr-rule" style={{ maxWidth: 220, margin: '0 auto', backgroundImage: ACC, backgroundSize: '200% 100%' }} />
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Cruise Control — swipe entry */}
        <a href="/discover?vibe=pride" className="pr-cruise" style={{ display: 'flex', alignItems: 'center', gap: 18, textDecoration: 'none', borderRadius: 18, padding: '20px 24px', marginBottom: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20,14,26,0.6)', transition: 'transform .2s, box-shadow .2s' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: ACC, opacity: 0.14 }} />
          <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 16, background: ACC, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
            <i className="ti ti-flame" style={{ fontSize: 28, color: '#0a0710' }} />
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: 5 }}>Cruise Mode</div>
            <div style={{ font: '400 21px/1.15 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>Swipe the room — right to save, left to pass.</div>
          </div>
          <div className="pr-cruise-arrow" style={{ position: 'relative', color: '#f2ede4', fontSize: 24, transition: 'transform .2s', flexShrink: 0 }}><i className="ti ti-arrow-right" /></div>
        </a>

        {/* Tonight's Lineup — neon marquee */}
        {tonight.length > 3 && (
          <div style={{ marginBottom: '2.25rem' }}>
            <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.24em', textTransform: 'uppercase', background: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#26d4a0', boxShadow: '0 0 10px #26d4a0' }} /> Tonight&rsquo;s Lineup
            </div>
            <div className="pr-marq" style={{ position: 'relative', overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)' }}>
              <div className="pr-marq-track" style={{ display: 'flex', gap: 12, width: 'max-content', animation: 'prMarquee 34s linear infinite' }}>
                {[...tonight, ...tonight].map((l, idx) => (
                  <a key={l.id + '-' + idx} href={`/listings/${l.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', textDecoration: 'none', flexShrink: 0 }}>
                    <img src={l.images![0]} alt="" loading="lazy" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid transparent', backgroundImage: `linear-gradient(#080612,#080612), ${ACC}`, backgroundOrigin: 'border-box', backgroundClip: 'content-box, border-box' }} />
                    <span style={{ font: '600 12.5px/1 Poppins, sans-serif', color: '#ece8e1' }}>{l.title}</span>
                    {l.city && <span style={{ font: '300 11px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.45)' }}>· {l.city}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Find your tribe */}
        <div style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: 12 }}>Find your tribe</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: '2.25rem' }}>
          {TRIBES.map(tr => {
            const active = tribe === tr.key
            return (
              <button key={tr.key} onClick={() => setTribe(active ? null : tr.key)} className="pr-tribe" style={{
                position: 'relative', overflow: 'hidden', cursor: 'pointer', padding: '18px 14px', borderRadius: 16, textAlign: 'left',
                border: active ? `1px solid ${tr.color}` : '0.5px solid rgba(255,255,255,0.09)',
                background: `linear-gradient(150deg, ${tr.color}2e, rgba(20,14,26,0.6) 62%)`,
                boxShadow: active ? `0 14px 40px ${tr.color}40` : '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                <i className={`ti ${tr.icon}`} style={{ fontSize: 26, color: tr.color, display: 'block', marginBottom: 10 }} />
                <div style={{ font: '600 14px/1 Poppins, sans-serif', color: '#f2ede4' }}>{tr.label}</div>
                {(() => { const n = tribeCount(tr.kw); return <div style={{ font: '400 11px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.4)', marginTop: 4 }}>{n > 0 ? `${n} here` : 'be the first 🔥'}</div> })()}
              </button>
            )
          })}
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
              border: tab === t.key ? '1px solid transparent' : '0.5px solid rgba(255,255,255,0.14)',
              background: tab === t.key ? ACC : 'transparent', backgroundClip: 'padding-box',
              color: tab === t.key ? '#0a0710' : 'rgba(236,232,225,0.7)', font: '700 13px/1 Poppins, sans-serif',
            }}>
              <i className={`ti ${t.icon}`} /> {t.label} · {count(t.key)}
            </button>
          ))}
        </div>

        {/* Hanky code rail */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ font: '700 10px/1 Poppins, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.45)' }}>Hanky code · tap a colour</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {HANKY.map(h => {
            const active = hanky === h.key
            const n = hankyCount(h.svc)
            return (
              <button key={h.key} onClick={() => setHanky(active ? null : h.key)} className="pr-hanky" title={`${h.label} · ${n}`} disabled={n === 0}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: n === 0 ? 'default' : 'pointer', background: 'none', border: 0, opacity: n === 0 ? 0.3 : 1 }}>
                <span aria-hidden style={{
                  width: 30, height: 30, borderRadius: 9, background: h.color, transform: 'rotate(45deg)',
                  border: active ? `2px solid #fff` : `1px solid ${h.ring}`,
                  boxShadow: active ? `0 0 0 3px ${h.ring}80, 0 6px 16px ${h.ring}55` : `0 4px 12px rgba(0,0,0,0.4)`,
                }} />
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
            {shown.map(l => (
              <a key={l.id} href={`/listings/${l.id}`} className="pr-card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', overflow: 'hidden', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.09)', background: 'rgba(20,14,26,0.55)' }}>
                <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#0b0710' }}>
                  {l.images?.[0]
                    ? <img className="pr-photo" src={l.images[0]} alt={l.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .8s cubic-bezier(.2,.8,.4,1)' }} />
                    : <div style={{ width: '100%', height: '100%', background: ACC, opacity: .25 }} />}
                  {l.verified && <span style={{ position: 'absolute', top: 8, left: 8, font: '700 9px/1 Poppins', letterSpacing: '.08em', color: '#0a0710', background: '#26d4a0', padding: '4px 7px', borderRadius: 6 }}>✓ VERIFIED</span>}
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: ACC }} />
                </div>
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
              </a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '0.5px dashed rgba(255,255,255,0.14)', borderRadius: 16 }}>
            <i className="ti ti-rainbow" style={{ fontSize: 34, background: ACC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }} />
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
