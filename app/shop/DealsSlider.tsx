'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { goProduct } from '../lib/shopLinks'

/**
 * "Best deals" slider across the full width of the storefront, above the hero.
 * Shows every live product marked as a deal (Admin → Shop), from any brand.
 * A partner's card goes straight to that shop's product page (through /go,
 * so the click is counted); a house item opens our own product page. Renders nothing when there are no deals, so an empty band
 * never sits at the top of the store.
 */

export interface Deal {
  id: string
  name: string
  price_cents: number | null
  compare_at_cents: number | null
  compare_is_rrp?: boolean | null
  currency?: string | null
  images?: string[] | null
  deal_label?: string | null
  promo_code?: string | null
  deal_ends_at?: string | null
  brand?: string | null
  fulfillment?: string | null
  brands?: { name: string; is_house?: boolean } | null
}

const money = (c: number, cur?: string | null) => `${(cur || 'EUR') === 'GBP' ? '£' : '€'}${(c / 100).toFixed(2).replace(/\.00$/, '')}`

export function discountPct(d: Pick<Deal, 'price_cents' | 'compare_at_cents'>): number | null {
  if (!d.price_cents || !d.compare_at_cents || d.compare_at_cents <= d.price_cents) return null
  return Math.round((1 - d.price_cents / d.compare_at_cents) * 100)
}

function endsIn(iso?: string | null, now = Date.now()): string | null {
  if (!iso) return null
  const ms = Date.parse(iso) - now
  if (!(ms > 0) || ms > 7 * 864e5) return null
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4)
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function DealsSlider({ deals, basePath }: { deals: Deal[]; basePath: string }) {
  const track = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const tick = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el || deals.length < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      if (paused.current || document.hidden) return
      const card = el.querySelector<HTMLElement>('.dls-card')
      const step = card ? card.offsetWidth + 14 : 240
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' })
    }, 3800)
    return () => clearInterval(id)
  }, [deals.length])

  if (deals.length === 0) return null

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  const hold = () => { paused.current = true }
  const release = () => { paused.current = false }

  return (
    <section aria-label="Best deals" className="dls">
      <style>{`
        .dls { position:relative; overflow:hidden; border-bottom:0.5px solid rgba(233,30,140,0.35);
          background: radial-gradient(ellipse at 12% 0%, rgba(233,30,140,0.22) 0%, transparent 55%),
                      radial-gradient(ellipse at 90% 100%, rgba(255,90,40,0.16) 0%, transparent 55%),
                      linear-gradient(120deg, #1d0716 0%, #12060f 55%, #0b0610 100%); }
        .dls-in { max-width:1200px; margin:0 auto; padding:1.1rem 1.5rem 1.25rem; }
        .dls-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:.85rem; }
        .dls-title { display:flex; align-items:center; gap:10px; flex-wrap:wrap; min-width:0; }
        .dls-flame { font:800 11px/1 var(--sans); letter-spacing:.14em; text-transform:uppercase; color:#fff;
          background:linear-gradient(90deg,#e91e8c,#ff5a28); padding:6px 10px; border-radius:999px; box-shadow:0 0 18px rgba(233,30,140,.45); white-space:nowrap; }
        .dls-h { font-family:var(--serif); font-size:clamp(18px,2.6vw,24px); font-weight:400; color:#f3e9ee; margin:0; white-space:nowrap; }
        .dls-h em { color:#ff5fae; font-style:italic; }
        .dls-arrows { display:flex; gap:8px; flex-shrink:0; }
        .dls-arrow { width:34px; height:34px; border-radius:50%; border:0.5px solid rgba(255,255,255,.18); background:rgba(0,0,0,.35); color:#f3e9ee; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; }
        .dls-arrow:hover { border-color:#ff5fae; color:#ff5fae; }
        .dls-track { display:flex; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none; -webkit-overflow-scrolling:touch; padding:2px 2px 4px; }
        .dls-track::-webkit-scrollbar { display:none; }
        .dls-card { flex:0 0 220px; scroll-snap-align:start; text-decoration:none; border-radius:14px; overflow:hidden; background:rgba(12,6,14,.85); border:0.5px solid rgba(233,30,140,.28); transition:transform .18s, border-color .18s, box-shadow .18s; display:flex; flex-direction:column; }
        .dls-card:hover { transform:translateY(-3px); border-color:rgba(255,95,174,.8); box-shadow:0 10px 30px rgba(233,30,140,.25); }
        .dls-img { position:relative; height:170px; background:linear-gradient(140deg,#3a1020,#1a0810); display:flex; align-items:center; justify-content:center; }
        .dls-img img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .dls-pct { position:absolute; top:10px; right:10px; z-index:2; min-width:50px; height:50px; padding:0 6px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          font:800 15px/1 var(--sans); color:#fff; background:radial-gradient(circle at 30% 30%,#ff4fa3,#c2106a); box-shadow:0 4px 16px rgba(233,30,140,.55); border:1.5px solid rgba(255,255,255,.75); }
        .dls-tag { position:absolute; top:10px; left:10px; z-index:2; max-width:calc(100% - 80px); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font:800 9.5px/1 var(--sans); letter-spacing:.12em; text-transform:uppercase; color:#1a0610; background:#ffd23f; padding:5px 8px; border-radius:6px; }
        .dls-ends { position:absolute; bottom:8px; left:8px; z-index:2; font:600 10.5px/1 var(--sans); color:#fff; background:rgba(0,0,0,.6); padding:5px 8px; border-radius:6px; backdrop-filter:blur(4px); }
        .dls-body { padding:.7rem .85rem .85rem; display:flex; flex-direction:column; gap:4px; flex:1; }
        .dls-brand { font:600 9.5px/1.2 var(--sans); letter-spacing:.12em; text-transform:uppercase; color:#ff8cc4; }
        .dls-name { font-family:var(--serif); font-size:15px; line-height:1.25; color:#f3e9ee; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .dls-price { display:flex; align-items:baseline; gap:8px; margin-top:auto; padding-top:4px; }
        .dls-now { font:700 17px/1 var(--sans); color:#ffd23f; }
        .dls-was { font:400 12px/1 var(--sans); color:rgba(243,233,238,.45); white-space:nowrap; }
        .dls-rrp { font-size:9.5px; letter-spacing:.06em; text-transform:uppercase; }
        .dls-go { margin-top:6px; font:600 11px/1 var(--sans); color:#f3e9ee; opacity:.75; }
        .dls-card:hover .dls-go { opacity:1; color:#ff8cc4; }
        .dls-code { align-self:flex-start; margin-top:6px; font:600 10.5px/1 var(--sans); letter-spacing:.06em; color:#ff8cc4; border:1px dashed rgba(255,140,196,.6); border-radius:6px; padding:5px 7px; }
        @media (max-width:640px) {
          .dls-in { padding:.9rem 1rem 1rem; }
          .dls-card { flex-basis:158px; }
          .dls-img { height:140px; }
          .dls-arrows { display:none; }
          .dls-pct { min-width:42px; height:42px; font-size:13px; }
          .dls-tag { max-width:calc(100% - 66px); font-size:8.5px; padding:4px 6px; }
        }
      `}</style>
      <div className="dls-in">
        <div className="dls-head">
          <div className="dls-title">
            <span className="dls-flame">🔥 Hot sale</span>
            <h2 className="dls-h">Best <em>deals</em> from our partner shops</h2>
          </div>
          <div className="dls-arrows">
            <button className="dls-arrow" aria-label="Previous deals" onClick={() => scrollBy(-1)}>‹</button>
            <button className="dls-arrow" aria-label="Next deals" onClick={() => scrollBy(1)}>›</button>
          </div>
        </div>
        <div
          ref={track}
          className="dls-track"
          onMouseEnter={hold} onMouseLeave={release}
          onTouchStart={hold} onTouchEnd={() => setTimeout(release, 4000)}
          onFocus={hold} onBlur={release}
        >
          {deals.map(d => {
            const pct = discountPct(d)
            const ends = now ? endsIn(d.deal_ends_at, now) : null
            const brand = d.brands?.name || d.brand
            const external = d.fulfillment === 'affiliate' && !d.brands?.is_house
            const inner = (
              <>
                <div className="dls-img">
                  {d.images?.[0]
                    ? <img src={d.images[0]} alt="" loading="lazy" />
                    : <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 52, color: 'rgba(255,140,196,0.25)' }}>{(brand || d.name).slice(0, 2).toUpperCase()}</span>}
                  {d.deal_label && <span className="dls-tag">{d.deal_label}</span>}
                  {pct !== null && <span className="dls-pct">-{pct}%</span>}
                  {ends && <span className="dls-ends">⏱ Ends in {ends}</span>}
                </div>
                <div className="dls-body">
                  {brand && <span className="dls-brand">{brand}</span>}
                  <span className="dls-name">{d.name}</span>
                  {d.price_cents != null && (
                    <span className="dls-price">
                      <span className="dls-now">{money(d.price_cents, d.currency)}</span>
                      {d.compare_at_cents != null && (
                        <span className="dls-was">{d.compare_is_rrp && <span className="dls-rrp">RRP </span>}<s>{money(d.compare_at_cents, d.currency)}</s></span>
                      )}
                    </span>
                  )}
                  {d.promo_code && <span className="dls-code">Code: {d.promo_code}</span>}
                  {external && brand && <span className="dls-go">Shop at {brand} ↗</span>}
                </div>
              </>
            )
            return external
              ? <a key={d.id} href={goProduct(d.id, 'deals')} target="_blank" rel="sponsored noopener" className="dls-card" aria-label={`${d.name} at ${brand || 'partner shop'}`}>{inner}</a>
              : <Link key={d.id} href={`${basePath}/${d.id}`} className="dls-card">{inner}</Link>
          })}
        </div>
      </div>
    </section>
  )
}
