'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { ShopHeader } from '../ShopChrome'
import { goProduct, productDestination } from '../../lib/shopLinks'

const GRAD = 'linear-gradient(140deg, #2a0d18 0%, #1a0d14 50%, #080612 100%)'


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
        const { data } = await supabase.from('products').select('*, brands(slug, name, is_house, affiliate_url, website_url)').eq('id', params.id).eq('active', true).maybeSingle()
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
  const dealLive = !!product?.deal && (!product.deal_ends_at || Date.parse(product.deal_ends_at) > Date.now())
  const wasStr = dealLive && product.compare_at_cents > (product.price_cents || 0) ? `${sym}${(product.compare_at_cents / 100).toFixed(2)}` : null
  const pct = wasStr && product.price_cents ? Math.round((1 - product.price_cents / product.compare_at_cents) * 100) : null
  const [copied, setCopied] = useState(false)
  const isAffiliate = product?.fulfillment === 'affiliate'
  const brand = product?.brands && !Array.isArray(product.brands) ? product.brands : null
  const brandName: string | null = brand?.name || product?.brand || null
  const partnerUrl = product ? productDestination(product.external_url, brand) : null
  const brandHref = brand?.slug ? `${standalone ? '/b' : '/shop/brand'}/${brand.slug}` : null

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
              <span style={{ fontFamily: 'var(--serif)', fontSize: '120px', fontStyle: 'italic', color: 'rgba(197,160,90,0.18)' }}>{(brandName || product.name || 'Sx').slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {/* Info */}
          <div>
            {brandName && (brandHref
              ? <Link href={brandHref} style={{ display: 'inline-block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px', textDecoration: 'none' }}>{brandName} →</Link>
              : <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>{brandName}</div>)}
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>{product.name}</h1>
            {priceStr && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)' }}>{priceStr}</span>
                {wasStr && <span style={{ fontSize: '16px', color: 'var(--t3)', textDecoration: 'line-through' }}>{wasStr}</span>}
                {pct ? <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', background: 'linear-gradient(90deg,#e91e8c,#ff5a28)', borderRadius: 999, padding: '4px 9px' }}>-{pct}%</span> : null}
              </div>
            )}
            {dealLive && product.promo_code && (
              <button
                onClick={() => { navigator.clipboard?.writeText(product.promo_code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {}) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem', padding: '9px 14px', background: 'transparent', border: '1px dashed rgba(255,140,196,0.7)', borderRadius: 'var(--r)', color: '#ff8cc4', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <i className="ti ti-ticket" /> Code: {product.promo_code} · {copied ? 'Copied ✓' : 'Copy'}
              </button>
            )}
            {product.description && <p style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.75, marginBottom: '1.75rem' }}>{product.description}</p>}

            {isAffiliate ? (
              partnerUrl ? (
                <a href={goProduct(product.id, 'product')} target="_blank" rel="noopener sponsored" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box' }}>
                  <i className="ti ti-external-link" /> Shop at {brandName || 'partner store'}
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
              {!isAffiliate && <span>🚚 Discreet EU shipping · plain packaging</span>}
              <span>🔒 {isAffiliate ? `Sold and shipped by ${brandName || 'the partner store'}` : 'Secure checkout via Stripe'}</span>
              {isAffiliate && <span>We may earn a commission when you buy through this link.</span>}
            </div>
          </div>
        </div>
      )}
      <style>{`@media(max-width:680px){ .pd-grid{ grid-template-columns:1fr !important; } .pd-grid > div:first-child{ height:320px !important; } }`}</style>
    </div>
  )
}
