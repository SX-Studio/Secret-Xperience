'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'

/* Admin → Shop: partner brands on secretxperience.store, the few items each one
 * has featured, and the SecretXperience house collection. Partner items link
 * out through /go/... (counted); house items sell through our own checkout. */

type Brand = {
  id: string; slug: string; name: string; tagline: string | null; description: string | null
  logo_url: string | null; cover_url: string | null; website_url: string | null; affiliate_url: string | null
  affiliate_network: string | null; commission_note: string | null
  is_house: boolean; featured: boolean; sort: number; active: boolean; kind: 'lingerie' | 'toys'
}
type Product = {
  id: string; name: string; description: string | null; price_cents: number | null; images: string[] | null
  category: string | null; brand_id: string | null; fulfillment: string; external_url: string | null
  featured: boolean; in_stock: boolean; active: boolean; sort: number
  deal: boolean; compare_at_cents: number | null; compare_is_rrp: boolean; deal_label: string | null; promo_code: string | null; deal_ends_at: string | null
}
type Clicks = Record<string, { d7: number; d30: number }>
type Data = { brands: Brand[]; products: Product[]; clicks: Clicks; categories: string[] }

const STORE = 'https://www.secretxperience.store'
const card: React.CSSProperties = { background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '1.1rem 1.25rem' }
const h: React.CSSProperties = { font: '600 11px/1 var(--sans)', color: 'var(--t2, #8c8880)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', height: 36, padding: '0 10px', background: 'var(--bg2, #111)', border: '0.5px solid var(--b2, rgba(255,255,255,0.12))', borderRadius: 'var(--r, 8px)', color: 'var(--t, #ece8e1)', font: '400 13px/1 var(--sans)' }
const area: React.CSSProperties = { ...input, height: 'auto', minHeight: 70, padding: '8px 10px', lineHeight: 1.5, resize: 'vertical' }
const label: React.CSSProperties = { display: 'block', font: '500 11px/1.3 var(--sans)', color: 'var(--t3, #6b6760)', marginBottom: 5 }
const btn = (kind: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties => ({
  height: 32, padding: '0 12px', borderRadius: 'var(--r, 8px)', cursor: 'pointer', font: '600 12px/1 var(--sans)', whiteSpace: 'nowrap',
  border: kind === 'primary' ? 'none' : `0.5px solid ${kind === 'danger' ? 'rgba(226,83,107,0.35)' : 'var(--b2, rgba(255,255,255,0.12))'}`,
  background: kind === 'primary' ? 'linear-gradient(135deg,var(--gold,#c5a05a),var(--goldd,#9a7a3a))' : 'transparent',
  color: kind === 'primary' ? '#0a0a0a' : kind === 'danger' ? '#e2536b' : 'var(--t2, #8c8880)',
})
const pill = (on: boolean, color = '#5fbf8a'): React.CSSProperties => ({ font: '600 10px/1 var(--sans)', letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 7px', borderRadius: 6, color: on ? color : 'var(--t3, #6b6760)', border: `0.5px solid ${on ? color + '66' : 'var(--b2, rgba(255,255,255,0.12))'}` })
const euro = (c: number | null) => c == null ? '' : (c / 100).toFixed(2)

function Field({ l, children, wide }: { l: string; children: React.ReactNode; wide?: boolean }) {
  return <label style={{ gridColumn: wide ? '1 / -1' : undefined }}><span style={label}>{l}</span>{children}</label>
}

function BrandForm({ initial, onSave, onCancel, busy }: { initial: Partial<Brand>; onSave: (d: any) => void; onCancel: () => void; busy: boolean }) {
  const [f, setF] = useState<any>({ ...initial })
  const set = (k: string) => (e: any) => setF((x: any) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 12 }}>
      <Field l="Name *"><input style={input} value={f.name || ''} onChange={set('name')} /></Field>
      <Field l="Slug (store address /b/…) — blank = from name"><input style={input} value={f.slug || ''} onChange={set('slug')} disabled={!!initial.is_house} /></Field>
      <Field l="Tagline"><input style={input} value={f.tagline || ''} onChange={set('tagline')} /></Field>
      <Field l="Sort (lower = first)"><input style={input} type="number" value={f.sort ?? 0} onChange={set('sort')} /></Field>
      {!initial.is_house && (
        <Field l="Row on the store">
          <select style={input} value={f.kind || 'lingerie'} onChange={set('kind')}>
            <option value="toys">Sex toys & erotic shops</option>
            <option value="lingerie">Lingerie & fashion</option>
          </select>
        </Field>
      )}
      {!initial.is_house && <>
        <Field l="Affiliate link (where clicks go — tracking URL from the programme)" wide><input style={input} value={f.affiliate_url || ''} onChange={set('affiliate_url')} placeholder="https://…" /></Field>
        <Field l="Website (fallback when there is no affiliate link)"><input style={input} value={f.website_url || ''} onChange={set('website_url')} placeholder="https://…" /></Field>
        <Field l="Affiliate network / programme"><input style={input} value={f.affiliate_network || ''} onChange={set('affiliate_network')} placeholder="e.g. Awin, own programme" /></Field>
        <Field l="Commission terms (internal note)" wide><input style={input} value={f.commission_note || ''} onChange={set('commission_note')} placeholder="e.g. 10% per sale, 30-day cookie" /></Field>
      </>}
      <Field l="Cover image (https link or /shops/…jpg)"><input style={input} value={f.cover_url || ''} onChange={set('cover_url')} /></Field>
      <Field l="Logo image (optional)"><input style={input} value={f.logo_url || ''} onChange={set('logo_url')} /></Field>
      <Field l="Description" wide><textarea style={area} value={f.description || ''} onChange={set('description')} /></Field>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ font: '400 13px var(--sans)', color: 'var(--t2)' }}><input type="checkbox" checked={f.active ?? true} onChange={set('active')} /> Live on the store</label>
        {!initial.is_house && <label style={{ font: '400 13px var(--sans)', color: 'var(--t2)' }}><input type="checkbox" checked={!!f.featured} onChange={set('featured')} /> Featured (shown first)</label>}
        <span style={{ flex: 1 }} />
        <button style={btn()} onClick={onCancel}>Cancel</button>
        <button style={btn('primary')} disabled={busy} onClick={() => onSave(f)}>{busy ? 'Saving…' : 'Save brand'}</button>
      </div>
    </div>
  )
}

function ProductForm({ initial, brands, categories, onSave, onCancel, busy }: { initial: Partial<Product>; brands: Brand[]; categories: string[]; onSave: (d: any) => void; onCancel: () => void; busy: boolean }) {
  const [f, setF] = useState<any>({
    ...initial,
    price: euro(initial.price_cents ?? null),
    was_price: euro(initial.compare_at_cents ?? null),
    deal_ends_at: initial.deal_ends_at ? initial.deal_ends_at.slice(0, 10) : '',
    images: (initial.images || []).join('\n'),
  })
  const set = (k: string) => (e: any) => setF((x: any) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const house = brands.find(b => b.id === f.brand_id)?.is_house
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 12 }}>
      <Field l="Brand *">
        <select style={input} value={f.brand_id || ''} onChange={set('brand_id')}>
          <option value="">— pick —</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.is_house ? '★ ' : ''}{b.name}{b.active ? '' : ' (hidden)'}</option>)}
        </select>
      </Field>
      <Field l="Item name *"><input style={input} value={f.name || ''} onChange={set('name')} /></Field>
      <Field l="Category">
        <select style={input} value={f.category || ''} onChange={set('category')}>
          <option value="">—</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field l={house ? 'Price € * (sold through our checkout)' : 'Price € (display only — optional)'}><input style={input} value={f.price ?? ''} onChange={set('price')} inputMode="decimal" placeholder="49.90" /></Field>
      {!house && <Field l="Item link (affiliate deep link to this product) — blank = brand's link" wide><input style={input} value={f.external_url || ''} onChange={set('external_url')} placeholder="https://…" /></Field>}
      <Field l="Image links (one per line, first is the cover)" wide><textarea style={area} value={f.images} onChange={set('images')} placeholder="https://…" /></Field>
      <Field l="Description" wide><textarea style={area} value={f.description || ''} onChange={set('description')} /></Field>
      <div style={{ gridColumn: '1 / -1', borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))', paddingTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        <label style={{ gridColumn: '1 / -1', font: '600 13px var(--sans)', color: '#ff8cc4' }}>
          <input type="checkbox" checked={!!f.deal} onChange={set('deal')} /> 🔥 Show in the Best deals slider
        </label>
        <Field l="Old price € (struck through; sets the -% badge)"><input style={input} value={f.was_price ?? ''} onChange={set('was_price')} inputMode="decimal" placeholder="79.90" /></Field>
        <label style={{ font: '400 12px/1.4 var(--sans)', color: 'var(--t2)', alignSelf: 'end' }}>
          <input type="checkbox" checked={!!f.compare_is_rrp} onChange={set('compare_is_rrp')} /> Old price is the brand's RRP (adviesprijs), not the shop's own earlier price
        </label>
        <Field l="Label on the card">
          <input style={input} list="deal-labels" value={f.deal_label || ''} onChange={set('deal_label')} placeholder="HOT" />
          <datalist id="deal-labels"><option value="HOT" /><option value="BEST DEAL" /><option value="SALE" /><option value="BESTSELLER" /><option value="LAST CHANCE" /></datalist>
        </Field>
        <Field l="Promo code (optional)"><input style={input} value={f.promo_code || ''} onChange={set('promo_code')} placeholder="SX15" /></Field>
        <Field l="Deal ends (optional — drops out after)"><input style={input} type="date" value={f.deal_ends_at || ''} onChange={set('deal_ends_at')} /></Field>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ font: '400 13px var(--sans)', color: 'var(--t2)' }}><input type="checkbox" checked={f.active ?? true} onChange={set('active')} /> Live</label>
        <label style={{ font: '400 13px var(--sans)', color: 'var(--t2)' }}><input type="checkbox" checked={!!f.featured} onChange={set('featured')} /> Featured</label>
        <label style={{ font: '400 13px var(--sans)', color: 'var(--t2)' }}><input type="checkbox" checked={f.in_stock ?? true} onChange={set('in_stock')} /> In stock</label>
        <span style={{ flex: 1 }} />
        <button style={btn()} onClick={onCancel}>Cancel</button>
        <button style={btn('primary')} disabled={busy} onClick={() => onSave(f)}>{busy ? 'Saving…' : 'Save item'}</button>
      </div>
    </div>
  )
}

export default function ShopTab() {
  const [data, setData] = useState<Data | null>(null)
  const [editing, setEditing] = useState<string | null>(null) // 'brand:new' | 'brand:<id>' | 'product:new' | 'product:<id>'
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/shop'); if (r.ok) setData(await r.json()); else setMsg({ kind: 'err', text: `Could not load (${r.status})` }) } catch { setMsg({ kind: 'err', text: 'Could not load' }) }
  }, [])
  useEffect(() => { load() }, [load])

  async function send(method: string, body: any, ok: string) {
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/admin/shop', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setMsg({ kind: 'err', text: j.error || 'Save failed' }); return false }
      setMsg({ kind: 'ok', text: ok }); setEditing(null); await load(); return true
    } finally { setBusy(false) }
  }

  const productsByBrand = useMemo(() => {
    const m: Record<string, Product[]> = {}
    for (const p of data?.products || []) (m[p.brand_id || '-'] ||= []).push(p)
    return m
  }, [data])

  if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3)' }}>{msg?.text || 'Loading…'}</div>

  const clicks = (k: string) => data.clicks[k] || { d7: 0, d30: 0 }
  const totals = data.brands.reduce((a, b) => { const c = clicks(`b:${b.id}`); return { d7: a.d7 + c.d7, d30: a.d30 + c.d30 } }, { d7: 0, d30: 0 })
  const withAffiliate = data.brands.filter(b => !b.is_house && b.affiliate_url).length
  const shown = data.brands.filter(b => !q || b.name.toLowerCase().includes(q.toLowerCase()))
  const unlinked = productsByBrand['-'] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          ['Live brands', data.brands.filter(b => b.active && !b.is_house).length],
          ['With affiliate link', `${withAffiliate} / ${data.brands.filter(b => !b.is_house).length}`],
          ['Live items', data.products.filter(p => p.active).length],
          ['Clicks out · 7d', totals.d7],
          ['Clicks out · 30d', totals.d30],
        ].map(([k, v]) => (
          <div key={k as string} style={card}><div style={{ ...h, marginBottom: 8 }}>{k}</div><div style={{ font: '400 26px/1 var(--serif)', color: 'var(--gold, #c5a05a)' }}>{v}</div></div>
        ))}
      </div>

      <div style={{ ...card, fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
        Commission-only for now. A brand is live on <a href={STORE} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>secretxperience.store</a> with its own page; every click out is counted (no personal data) and sent to its <b>affiliate link</b> — or its plain website until you add one. Brands without an affiliate link earn you nothing yet.
        The ★ SecretXperience brand is the house collection: its items sell through our own card checkout, and it switches on when its first item goes live.
      </div>

      {msg && <div style={{ ...card, color: msg.kind === 'ok' ? '#5fbf8a' : '#e2536b', fontSize: 13 }}>{msg.text}</div>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...input, maxWidth: 260 }} placeholder="Filter brands…" value={q} onChange={e => setQ(e.target.value)} />
        <span style={{ flex: 1 }} />
        <button style={btn()} onClick={() => setEditing('product:new')}>+ Add item</button>
        <button style={btn('primary')} onClick={() => setEditing('brand:new')}>+ Add brand</button>
      </div>

      {editing === 'brand:new' && (
        <div style={card}><div style={h}>New brand</div>
          <BrandForm initial={{ active: true }} busy={busy} onCancel={() => setEditing(null)} onSave={d => send('POST', { type: 'brand', data: d }, 'Brand added')} />
        </div>
      )}
      {editing === 'product:new' && (
        <div style={card}><div style={h}>New item</div>
          <ProductForm initial={{ active: true, in_stock: true }} brands={data.brands} categories={data.categories} busy={busy} onCancel={() => setEditing(null)} onSave={d => send('POST', { type: 'product', data: d }, 'Item added')} />
        </div>
      )}

      {shown.map(b => {
        const c = clicks(`b:${b.id}`)
        const items = productsByBrand[b.id] || []
        return (
          <div key={b.id} style={{ ...card, opacity: b.active ? 1 : 0.7 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 56, borderRadius: 8, overflow: 'hidden', background: 'var(--bg2, #111)', flexShrink: 0 }}>
                {b.cover_url && <img src={b.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                <div style={{ font: '600 14px/1.3 var(--sans)', color: 'var(--t)' }}>{b.is_house ? '★ ' : ''}{b.name}</div>
                <div style={{ font: '400 12px/1.4 var(--sans)', color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  /b/{b.slug}{b.affiliate_network ? ` · ${b.affiliate_network}` : ''}{b.commission_note ? ` · ${b.commission_note}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={pill(b.active)}>{b.active ? 'Live' : 'Hidden'}</span>
                {b.featured && <span style={pill(true, '#c5a05a')}>Featured</span>}
                {!b.is_house && <span style={pill(!!b.affiliate_url, '#c5a05a')}>{b.affiliate_url ? 'Affiliate ✓' : 'No affiliate link'}</span>}
                <span style={{ font: '400 12px var(--sans)', color: 'var(--t2)', margin: '0 6px' }}>{items.length} items · {c.d7} / {c.d30} clicks (7d/30d)</span>
                {b.active && <a href={`${STORE}/b/${b.slug}`} target="_blank" rel="noreferrer" style={{ ...btn(), display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>View</a>}
                <button style={btn()} onClick={() => setEditing(editing === `brand:${b.id}` ? null : `brand:${b.id}`)}>Edit</button>
              </div>
            </div>
            {editing === `brand:${b.id}` && (
              <BrandForm initial={b} busy={busy} onCancel={() => setEditing(null)} onSave={d => send('PATCH', { type: 'brand', id: b.id, data: d }, 'Brand saved')} />
            )}
            {items.length > 0 && (
              <div style={{ marginTop: 10, borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))' }}>
                {items.map(p => {
                  const pc = clicks(`p:${p.id}`)
                  return (
                    <div key={p.id} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 6, overflow: 'hidden', background: 'var(--bg2, #111)', flexShrink: 0 }}>
                          {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <span style={{ flex: '1 1 180px', font: '400 13px/1.3 var(--sans)', color: p.active ? 'var(--t)' : 'var(--t3)' }}>
                          {p.name}{p.price_cents != null ? ` · €${euro(p.price_cents)}` : ''}{p.category ? ` · ${p.category}` : ''}
                        </span>
                        {!p.active && <span style={pill(false)}>Hidden</span>}
                        {p.featured && <span style={pill(true, '#c5a05a')}>Featured</span>}
                        {p.deal && <span style={pill(true, '#ff5fae')}>🔥 Deal{p.compare_at_cents && p.price_cents ? ` -${Math.round((1 - p.price_cents / p.compare_at_cents) * 100)}%` : ''}</span>}
                        <span style={{ font: '400 12px var(--sans)', color: 'var(--t3)' }}>{p.fulfillment === 'stripe' ? 'our checkout' : `${pc.d7} / ${pc.d30} clicks`}</span>
                        {p.active && <a href={`${STORE}/p/${p.id}`} target="_blank" rel="noreferrer" style={{ ...btn(), display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>View</a>}
                        <button style={btn()} onClick={() => setEditing(editing === `product:${p.id}` ? null : `product:${p.id}`)}>Edit</button>
                        <button style={btn('danger')} disabled={busy} onClick={() => { if (confirm(`Delete "${p.name}"? Its click history stays on the brand.`)) send('DELETE', { type: 'product', id: p.id }, 'Item deleted') }}>Delete</button>
                      </div>
                      {editing === `product:${p.id}` && (
                        <ProductForm initial={p} brands={data.brands} categories={data.categories} busy={busy} onCancel={() => setEditing(null)} onSave={d => send('PATCH', { type: 'product', id: p.id, data: d }, 'Item saved')} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {unlinked.length > 0 && (
        <div style={card}>
          <div style={h}>Items without a brand ({unlinked.length})</div>
          {unlinked.map(p => (
            <div key={p.id} style={{ padding: '6px 0' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                <button style={btn()} onClick={() => setEditing(editing === `product:${p.id}` ? null : `product:${p.id}`)}>Assign brand</button>
              </div>
              {editing === `product:${p.id}` && (
                <ProductForm initial={p} brands={data.brands} categories={data.categories} busy={busy} onCancel={() => setEditing(null)} onSave={d => send('PATCH', { type: 'product', id: p.id, data: d }, 'Item saved')} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
