'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { ShopHeader } from '../ShopChrome'

const GRAD = 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 50%, #080612 100%)'

function validUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try { const u = new URL(url.trim()); return (u.protocol === 'http:' || u.protocol === 'https:') && !/[^\x00-\x7F]/.test(u.hostname) ? u.href : null } catch { return null }
}

export default function ProductDetail({ params, standalone }: { params: { id: string }; standalone: boolean }) {
  const shopHome = standalone ? '/' : '/shop'
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('products').select('*').eq('id', params.id).eq('active', true).maybeSingle()
        setProduct(data)
      } catch { /* ignore */ } finally { setLoading(false) }
    })()
  }, [params.id])

  async function buy() {
    setBuying(true); setError('')
    try {
      const res = await fetch('/api/shop/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: params.id }) })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Checkout failed'); setBuying(false); return }
      if (json.url) window.location.href = json.url
    } catch { setError('Checkout failed'); setBuying(false) }
  }

  const sym = product && (product.currency || 'EUR') === 'GBP' ? '£' : '€'
  const priceStr = product?.price_cents ? `${sym}${(product.price_cents / 100).toFixed(2)}` : null
  const isAffiliate = product?.fulfillment === 'affiliate'
  const partnerUrl = validUrl(product?.external_url)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>
      <ShopHeader standalone={standalone} back={{ href: shopHome, label: 'The Boutique' }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--t3)' }}>Loading…</div>
      ) : !product ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '0.75rem' }}>Product not found</div>
          <Link href={shopHome} style={{ color: 'var(--gold)', textDecoration: 'none' }}>← Back to the boutique</Link>
        </div>
      ) : (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2.5rem' }} className="pd-grid">
          {/* Image */}
          <div style={{ height: '420px', background: GRAD, borderRadius: '16px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid var(--b)' }}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            ) : (
              <span style={{ fontFamily: 'var(--serif)', fontSize: '120px', fontStyle: 'italic', color: 'rgba(197,160,90,0.18)' }}>{(product.brand || product.name || 'Sx').slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>{product.brand}</div>}
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>{product.name}</h1>
            {priceStr && <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', marginBottom: '1.25rem' }}>{priceStr}</div>}
            {product.description && <p style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.75, marginBottom: '1.75rem' }}>{product.description}</p>}

            {isAffiliate ? (
              partnerUrl ? (
                <a href={partnerUrl} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box' }}>
                  <i className="ti ti-external-link" /> Shop at {product.brand || 'partner store'}
                </a>
              ) : (
                <div style={{ padding: '14px', background: 'var(--bg2)', borderRadius: 'var(--r)', fontSize: '13px', color: 'var(--t3)', textAlign: 'center' }}>Partner link unavailable</div>
              )
            ) : (
              <>
                <button onClick={buy} disabled={buying || !product.in_stock} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', background: product.in_stock ? 'linear-gradient(135deg,var(--gold),var(--goldd))' : 'var(--bg2)', borderRadius: 'var(--r)', color: product.in_stock ? '#0a0a0a' : 'var(--t3)', fontSize: '15px', fontWeight: 700, border: 'none', cursor: product.in_stock && !buying ? 'pointer' : 'not-allowed', boxSizing: 'border-box' }}>
                  <i className="ti ti-shopping-bag" /> {!product.in_stock ? 'Out of stock' : buying ? 'Redirecting…' : `Buy now${priceStr ? ` · ${priceStr}` : ''}`}
                </button>
                {error && <div style={{ marginTop: '10px', fontSize: '13px', color: '#e0607a', textAlign: 'center' }}>{error}</div>}
              </>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--t3)' }}>
              <span>🚚 Discreet EU shipping · plain packaging</span>
              <span>🔒 {isAffiliate ? 'Fulfilled by the partner store' : 'Secure checkout via Stripe'}</span>
            </div>
          </div>
        </div>
      )}
      <style>{`@media(max-width:680px){ .pd-grid{ grid-template-columns:1fr !important; } .pd-grid > div:first-child{ height:320px !important; } }`}</style>
    </div>
  )
}
