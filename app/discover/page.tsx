'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '../lib/supabase'
import { focusPosition } from '../lib/imageFocus'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'

if (typeof window !== 'undefined') gsap.registerPlugin(Draggable)

interface Card {
  id: string
  title: string
  category: string
  subcategory: string | null
  city: string
  country: string
  price_from: number | null
  images: string[] | null
  image_focus: Record<string, { x: number; y: number }> | null
  verified: boolean
  premium: boolean
  tags: string[] | null
  description: string | null
  featured_until: string | null
}

const SKIP_KEY = 'sx_discover_skipped'
const BATCH    = 20

function getSkipped(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SKIP_KEY) || '[]')) } catch { return new Set() }
}
function addSkipped(id: string) {
  const s = getSkipped(); s.add(id)
  localStorage.setItem(SKIP_KEY, JSON.stringify([...s].slice(-200)))
}

function isAvailableNow(tags: string[] | null): boolean {
  if (!tags) return false
  const now = new Date()
  const dayIdx = now.getDay()
  const days = ['sun','mon','tue','wed','thu','fri','sat']
  const today = days[dayIdx]
  const hour = now.getHours()
  return tags.some(t => {
    const m = t.match(/^wh:(\w{3}):(\d{1,2})-(\d{1,2})$/)
    if (!m || m[1] !== today) return false
    return hour >= parseInt(m[2]) && hour < parseInt(m[3])
  })
}

const PRIDE_TAGS = ['orientation:gay', 'orientation:bi', 'type:trans', 'type:trans woman', 'type:couple', 'type:nonbinary']

const CATS = [
  { v: 'all',          l: 'All',              icon: 'ti-sparkles' },
  { v: '__pride',      l: '🏳️‍🌈 Pride',        icon: 'ti-rainbow' },
  { v: 'escorts',      l: 'Companions',       icon: 'ti-user' },
  { v: 'creators',     l: 'Creators',         icon: 'ti-camera' },
  { v: 'nightlife',    l: 'Nightlife',        icon: 'ti-building' },
  { v: 'rentals',      l: 'Private Rentals',  icon: 'ti-home' },
  { v: 'hotels',       l: 'Hotels',           icon: 'ti-bed' },
  { v: 'events',       l: 'Events',           icon: 'ti-calendar-event' },
  { v: '__verified',   l: 'Verified only',    icon: 'ti-shield-check' },
  { v: '__available',  l: 'Available tonight',icon: 'ti-clock' },
]

export default function DiscoverPage() {
  const [cards, setCards]         = useState<Card[]>([])
  const [index, setIndex]         = useState(0)
  const [userId, setUserId]       = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [liking, setLiking]       = useState(false)
  const [noMore, setNoMore]       = useState(false)
  const [action, setAction]       = useState<'like' | 'skip' | null>(null)
  const [category, setCategory]   = useState('all')

  const cardRef   = useRef<HTMLDivElement>(null)
  const draggable = useRef<any>(null)

  // Deep-link: /discover?vibe=pride opens straight into the Pride vibe
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vibe') === 'pride') {
      setCategory('__pride')
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      const { count } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
      setSavedCount(count || 0)
    })
  }, [])

  // Keyboard shortcuts: ← to skip, → to save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (action || noMore || loading) return
      if (e.key === 'ArrowLeft') flyOut('skip')
      else if (e.key === 'ArrowRight') flyOut('like')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [action, noMore, loading, index, cards])

  const loadCards = useCallback(async (cat: string) => {
    setLoading(true)
    setNoMore(false)
    setIndex(0)
    const supabase = createClient()
    const skipped = getSkipped()

    let q = supabase
      .from('listings')
      .select('id,title,category,subcategory,city,country,price_from,images,image_focus,verified,premium,tags,description,featured_until')
      .eq('active', true)
      .order('featured_until', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(BATCH + skipped.size + 10)

    if (cat === '__verified') {
      q = q.eq('verified', true)
    } else if (cat === '__pride') {
      q = q.overlaps('tags', PRIDE_TAGS)
    } else if (cat === '__available') {
      // Filter client-side below
    } else if (cat !== 'all') {
      q = q.ilike('category', cat + '%')
    }

    const { data, error } = await q
    if (error) { console.error('[discover] load failed:', error.message) }
    let filtered = (data || []).filter((c: any) => !skipped.has(c.id))
    if (cat === '__available') filtered = filtered.filter((c: any) => isAvailableNow(c.tags))
    setCards(filtered.slice(0, BATCH))
    setLoading(false)
  }, [])

  useEffect(() => { loadCards(category) }, [category, loadCards])

  useEffect(() => {
    if (!cardRef.current || loading || noMore) return
    const el = cardRef.current

    if (draggable.current) { draggable.current.forEach((d: any) => d.kill()) }

    draggable.current = Draggable.create(el, {
      type: 'x',
      inertia: false,
      onDrag() {
        const x = this.x
        const rot = x * 0.08
        const opacity = Math.max(0.4, 1 - Math.abs(x) / 400)
        gsap.set(el, { rotation: rot, opacity })
        const likeEl = el.querySelector<HTMLElement>('.disc-like-ind')
        const skipEl = el.querySelector<HTMLElement>('.disc-skip-ind')
        if (likeEl) likeEl.style.opacity = x > 30  ? String(Math.min(1, (x - 30) / 80))  : '0'
        if (skipEl) skipEl.style.opacity = x < -30 ? String(Math.min(1, (-x - 30) / 80)) : '0'
      },
      onDragEnd() {
        const x = this.x
        if (x > 120) {
          flyOut('like')
        } else if (x < -120) {
          flyOut('skip')
        } else {
          gsap.to(el, { x: 0, rotation: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
          const likeEl = el.querySelector<HTMLElement>('.disc-like-ind')
          const skipEl = el.querySelector<HTMLElement>('.disc-skip-ind')
          if (likeEl) likeEl.style.opacity = '0'
          if (skipEl) skipEl.style.opacity = '0'
        }
      },
    })

    return () => { if (draggable.current) draggable.current.forEach((d: any) => d.kill()) }
  }, [index, cards, loading])

  async function flyOut(type: 'like' | 'skip') {
    if (!cardRef.current) return
    setAction(type)
    const el = cardRef.current
    const x  = type === 'like' ? 600 : -600

    gsap.to(el, {
      x, rotation: type === 'like' ? 25 : -25, opacity: 0,
      duration: 0.4, ease: 'power2.in',
      onComplete: async () => {
        const current = cards[index]
        if (!current) return

        if (type === 'like' && userId) {
          setLiking(true)
          const supabase = createClient()
          await supabase.from('favorites').upsert(
            { user_id: userId, listing_id: current.id },
            { onConflict: 'user_id,listing_id', ignoreDuplicates: true }
          )
          setSavedCount(n => n + 1)
          setLiking(false)
        } else {
          addSkipped(current.id)
        }

        gsap.set(el, { x: 0, rotation: 0, opacity: 1 })
        const likeEl = el.querySelector<HTMLElement>('.disc-like-ind')
        const skipEl = el.querySelector<HTMLElement>('.disc-skip-ind')
        if (likeEl) likeEl.style.opacity = '0'
        if (skipEl) skipEl.style.opacity = '0'

        const next = index + 1
        if (next >= cards.length) setNoMore(true)
        else setIndex(next)
        setAction(null)
      },
    })
  }

  const card = cards[index]

  return (
    <div style={{ minHeight: '100vh', background: '#080608', color: '#ece8e1', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        *{box-sizing:border-box;margin:0;padding:0}
        .disc-like-ind,.disc-skip-ind{position:absolute;top:32px;z-index:10;font-size:13px;font-weight:700;letter-spacing:.12em;padding:8px 18px;border-radius:10px;transition:none;pointer-events:none;opacity:0;text-transform:uppercase}
        .disc-like-ind{right:20px;color:#3ecf8e;border:2px solid #3ecf8e;background:rgba(62,207,142,0.12);transform:rotate(10deg)}
        .disc-skip-ind{left:20px;color:#e2536b;border:2px solid #e2536b;background:rgba(226,83,107,0.12);transform:rotate(-10deg)}
        .disc-pill{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.4);font:500 12px 'Poppins',sans-serif;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;min-height:36px}
        .disc-pill.active,.disc-pill:hover{border-color:rgba(197,160,90,0.45);background:rgba(197,160,90,0.08);color:#c5a05a}
        .disc-act{border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .2s}
        .disc-act.big{width:64px;height:64px;font-size:24px}
        .disc-act.small{width:48px;height:48px;font-size:18px}
        .disc-act:hover{transform:scale(1.1)}
        .disc-act:active{transform:scale(0.9)}
        .disc-act.pass{background:rgba(226,83,107,0.1);border:0.5px solid rgba(226,83,107,0.35);color:#e2536b}
        .disc-act.pass:hover{box-shadow:0 0 24px rgba(226,83,107,0.3)}
        .disc-act.save{background:rgba(62,207,142,0.1);border:0.5px solid rgba(62,207,142,0.35);color:#3ecf8e}
        .disc-act.save:hover{box-shadow:0 0 24px rgba(62,207,142,0.3)}
        .disc-act.info{background:rgba(255,255,255,0.05);border:0.5px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.35)}
        .disc-act.info:hover{border-color:rgba(197,160,90,0.4);color:#c5a05a}
        kbd{display:inline-flex;align-items:center;justify-content:center;padding:2px 7px;border-radius:5px;border:0.5px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);font:500 11px 'Poppins',sans-serif;color:rgba(255,255,255,0.3)}
      `}</style>

      {/* Top bar — "Private Gallery" */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', height: 54, background: 'rgba(8,6,8,0.97)', borderBottom: '0.5px solid rgba(197,160,90,0.08)', position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(18px)' }}>
        <a href="/" aria-label="Back" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 16 }}>
          <i className="ti ti-arrow-left" />
        </a>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, letterSpacing: '0.01em', color: '#ece8e1' }}>
          Private <em style={{ color: '#c5a05a' }}>Gallery</em>
        </div>

        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 12px', transition: 'color .15s' }} onMouseOver={e => (e.currentTarget.style.color = '#c5a05a')} onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
          <i className="ti ti-bookmark-filled" style={{ fontSize: 14 }} />
          {savedCount > 0 ? <span>{savedCount} saved</span> : <span>Saved</span>}
        </a>
      </header>

      {/* Filter pills */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6, padding: '0.875rem 1.25rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATS.map(c => (
            <button key={c.v} onClick={() => setCategory(c.v)} className={`disc-pill${category === c.v ? ' active' : ''}`}>
              <i className={`ti ${c.icon}`} style={{ fontSize: 12 }} />
              {c.l}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 1rem 2rem', gap: '1.25rem' }}>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '0.5px solid rgba(197,160,90,0.3)', borderTopColor: '#c5a05a', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : noMore ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(197,160,90,0.06)', border: '0.5px solid rgba(197,160,90,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>✦</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontStyle: 'italic' }}>You've seen them all</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', maxWidth: 260, lineHeight: 1.65 }}>Check your saved listings or browse the full catalogue.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { localStorage.removeItem(SKIP_KEY); loadCards(category) }} style={{ padding: '10px 20px', border: '0.5px solid rgba(197,160,90,0.35)', borderRadius: 10, background: 'transparent', color: '#c5a05a', cursor: 'pointer', fontSize: 13, fontFamily: "'Poppins',sans-serif" }}>
                Start over
              </button>
              <a href="/dashboard" style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius: 10, color: '#080808', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                View saved →
              </a>
            </div>
          </div>
        ) : card ? (
          <>
            {/* Counter: 01 of 10 portraits */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: 'rgba(197,160,90,0.5)', fontWeight: 500 }}>{String(index + 1).padStart(2, '0')}</span>
              <span>of</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: 'rgba(197,160,90,0.3)', fontWeight: 400 }}>{cards.length}</span>
              <span>portraits</span>
            </div>

            {/* Card */}
            <div
              ref={cardRef}
              style={{
                width: '100%', maxWidth: 380, borderRadius: 22, overflow: 'hidden',
                background: '#0e0c12', border: '0.5px solid rgba(197,160,90,0.12)',
                boxShadow: '0 28px 72px rgba(0,0,0,0.75)',
                cursor: 'grab', userSelect: 'none', position: 'relative',
                touchAction: 'none',
              }}
            >
              <div className="disc-like-ind"><i className="ti ti-heart-filled" style={{ marginRight: 6 }} />SAVE</div>
              <div className="disc-skip-ind">PASS <i className="ti ti-x" style={{ marginLeft: 6 }} /></div>

              {/* Photo */}
              <div style={{ height: 420, background: 'linear-gradient(140deg,#1a0a1a,#0d0610)', position: 'relative', overflow: 'hidden' }}>
                {card.images?.[0] ? (
                  <img src={card.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(card.image_focus, card.images[0]), pointerEvents: 'none' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 96, fontStyle: 'italic', color: 'rgba(197,160,90,0.1)' }}>
                    {card.title.charAt(0)}
                  </div>
                )}

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(8,6,12,0.95) 0%,rgba(8,6,12,0.15) 50%,transparent 75%)', pointerEvents: 'none' }} />

                {/* Badges */}
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 5 }}>
                  {card.verified && (
                    <span style={{ background: 'rgba(62,207,142,0.18)', border: '0.5px solid rgba(62,207,142,0.4)', color: '#3ecf8e', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.08em', backdropFilter: 'blur(6px)' }}>
                      <i className="ti ti-shield-check" style={{ marginRight: 3, fontSize: 9 }} />VERIFIED
                    </span>
                  )}
                  {card.premium && (
                    <span style={{ background: 'linear-gradient(90deg,rgba(197,160,90,0.9),rgba(232,201,126,0.9))', color: '#000', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.08em' }}>VIP</span>
                  )}
                </div>

                {card.price_from && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(197,160,90,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 600, color: '#c5a05a' }}>
                    €{card.price_from}/hr
                  </div>
                )}

                {/* Bottom text */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1.25rem 1rem' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: 'italic', fontWeight: 400, color: '#ece8e1', lineHeight: 1.15, marginBottom: 6 }}>
                    {card.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-map-pin" style={{ fontSize: 11 }} />
                      {card.city}{card.country ? `, ${card.country}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div style={{ padding: '0.875rem 1.25rem 1.25rem' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  {card.category}{card.subcategory ? ` · ${card.subcategory}` : ''}
                </div>
                {card.description && (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {card.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button className="disc-act big pass" aria-label="Pass" onClick={() => flyOut('skip')} disabled={!!action}>
                <i className="ti ti-x" />
              </button>

              <a href={`/listings/${card.id}`} className="disc-act small info" aria-label="View profile" title="View full profile" onClick={e => e.stopPropagation()}>
                <i className="ti ti-user" />
              </a>

              <button className="disc-act big save" aria-label="Save" onClick={() => flyOut('like')} disabled={liking || !!action}>
                <i className="ti ti-heart-filled" />
              </button>
            </div>

            {/* Button labels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: -8 }}>
              <div style={{ width: 64, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>Pass</div>
              <div style={{ width: 48, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>View</div>
              <div style={{ width: 64, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>Save</div>
            </div>

            {/* Keyboard hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
              <kbd>←</kbd><span>Pass</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <kbd>→</kbd><span>Save</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Drag to choose</span>
            </div>

            {!userId && (
              <a href="/login?next=/discover" style={{ fontSize: 12, color: 'rgba(197,160,90,0.6)', textDecoration: 'none', borderBottom: '0.5px solid rgba(197,160,90,0.2)', paddingBottom: 1 }}>
                Sign in to save your picks →
              </a>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
