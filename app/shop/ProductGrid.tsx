'use client'
import { useState } from 'react'
import Link from 'next/link'

export interface Product {
  id: string
  name: string
  description?: string | null
  price_cents?: number | null
  currency?: string
  images?: string[] | null
  category?: string | null
  brand?: string | null
  fulfillment: string
  external_url?: string | null
  featured?: boolean
  in_stock?: boolean
}

const FILTERS = [
  { value: 'all', label: 'All Products' },
  { value: 'apparel', label: 'Lingerie & Apparel' },
  { value: 'toys', label: 'Toys' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'wellness', label: 'Wellness' },
]

const GRADS = [
  'linear-gradient(140deg, #3a1020 0%, #1a0810 100%)',
  'linear-gradient(140deg, #1a1230 0%, #0d0820 100%)',
  'linear-gradient(140deg, #2a1a10 0%, #150d08 100%)',
  'linear-gradient(140deg, #1a2a18 0%, #0d1410 100%)',
  'linear-gradient(140deg, #2a1028 0%, #150814 100%)',
]

function price(p: Product) {
  if (!p.price_cents) return null
  const sym = (p.currency || 'EUR') === 'GBP' ? '£' : '€'
  return `${sym}${(p.price_cents / 100).toFixed(2)}`
}

function ProductCard({ p, idx, basePath }: { p: Product; idx: number; basePath: string }) {
  const monogram = (p.brand || p.name || 'Sx').slice(0, 2).toUpperCase()
  const grad = GRADS[idx % GRADS.length]
  const isAffiliate = p.fulfillment === 'affiliate'

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`${basePath}/${p.id}`} className="shop-card" style={{ display: 'block', textDecoration: 'none', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.15s' }}>
        <div style={{ height: '200px', background: grad, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.images?.[0] ? (
            <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <span style={{ fontFamily: 'var(--serif)', fontSize: '64px', fontStyle: 'italic', color: 'rgba(197,160,90,0.2)', lineHeight: 1, userSelect: 'none' }}>{monogram}</span>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,6,18,0.5) 0%, transparent 55%)' }} />
          {p.category && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(139,43,63,0.25)', color: '#d05b73', border: '0.5px solid rgba(139,43,63,0.4)', backdropFilter: 'blur(4px)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.category}</div>
          )}
          {isAffiliate && (
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 2, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(8,6,18,0.7)', color: 'var(--t2)', border: '0.5px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>Partner store ↗</div>
          )}
        </div>
        <div style={{ padding: '0.9rem 1rem 1rem' }}>
          {p.brand && <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px', opacity: 0.85 }}>{p.brand}</div>}
          <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--t)', marginBottom: '6px', lineHeight: 1.3 }}>{p.name}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--gold)', fontWeight: 500 }}>
            {price(p) || (isAffiliate ? `View at ${p.brand || 'partner'}` : 'POA')}
          </div>
        </div>
      </Link>
    </div>
  )
}

// basePath differs per domain: products are /shop/<id> on the marketplace and
// /p/<id> on the standalone storefront, where the shop is the whole site.
export default function ProductGrid({ products, basePath = '/shop' }: { products: Product[]; basePath?: string }) {
  const [filter, setFilter] = useState('all')
  const filtered = products.filter(p => filter === 'all' || (p.category ?? '').toLowerCase() === filter)

  return (
    <>
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)', overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -1.5rem 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '52px' }}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`filter-pill${filter === f.value ? ' active' : ''}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2.5rem 0 1.5rem' }}>
        <span style={{ fontSize: '12px', color: 'var(--t3)', letterSpacing: '0.04em' }}>{filtered.length} products</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Shipping to:</span>
          <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: 500 }}>🇪🇺 EU</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--t3)' }}>No products match this filter</div>
      ) : (
        <div className="shop-grid">
          {filtered.map((p, i) => <ProductCard key={p.id} p={p} idx={i} basePath={basePath} />)}
        </div>
      )}
    </>
  )
}
