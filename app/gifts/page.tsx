'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../lib/supabase'
import { GIFTS, GIFT_BUNDLES, GIFT_BY_SLUG, type Gift } from '../data/gifts'

const GOLD = '#c5a05a'
const TIER_LABEL: Record<number, string> = { 1: '1 coin', 2: '2 coins', 3: '3 coins', 4: '4 coins' }

function GiftsInner() {
  const params = useSearchParams()
  const toId = params.get('to')
  const [uid, setUid] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [earnings, setEarnings] = useState<{ earned: number; paid: number } | null>(null)
  const [recipient, setRecipient] = useState<{ id: string; name: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [fly, setFly] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const refreshWallet = (supabase: ReturnType<typeof createClient>, id: string) => {
    supabase.from('gift_wallets').select('balance').eq('user_id', id).maybeSingle()
      .then(({ data }) => setBalance(data?.balance ?? 0))
    supabase.from('gift_earnings').select('earned_cents,paid_cents').eq('recipient_id', id).maybeSingle()
      .then(({ data }) => data && setEarnings({ earned: data.earned_cents, paid: data.paid_cents }))
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null
      setUid(id)
      if (id) refreshWallet(supabase, id)
    })
    if (toId) {
      supabase.from('profiles').select('id, full_name').eq('id', toId).maybeSingle()
        .then(({ data }) => setRecipient(data ? { id: data.id, name: data.full_name || 'this profile' } : null))
    }
  }, [toId])

  const tiers = useMemo(() => [1, 2, 3, 4].map(t => ({ t, items: GIFTS.filter(g => g.tier === t) })), [])
  const available = earnings ? earnings.earned - earnings.paid : 0

  async function buy(bundleId: string) {
    if (!uid) { window.location.href = '/login?next=/gifts'; return }
    setBusy(true)
    try {
      const res = await fetch('/api/gifts/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bundleId }) })
      const json = await res.json()
      if (json.url) { window.location.href = json.url; return }
      setToast(json.configured === false ? 'Gift-coin payments are coming very soon 🎁' : (json.error || 'Could not start checkout'))
    } catch { setToast('Could not start checkout') }
    setBusy(false)
    setTimeout(() => setToast(null), 3500)
  }

  async function send(gift: Gift) {
    if (!uid) { window.location.href = `/login?next=/gifts${toId ? `?to=${toId}` : ''}`; return }
    if (!recipient) { setToast('Open a profile and tap “Send a gift” to choose who receives it.'); setTimeout(() => setToast(null), 3500); return }
    if ((balance ?? 0) < gift.cost) { setToast('Not enough gift coins — grab a bundle above 👆'); setTimeout(() => setToast(null), 3500); return }
    setBusy(true)
    try {
      const res = await fetch('/api/gifts/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: recipient.id, giftSlug: gift.slug, message: msg }) })
      const json = await res.json()
      if (!res.ok) { setToast(json.error || 'Could not send gift'); }
      else {
        setBalance(typeof json.balance === 'number' ? json.balance : (balance ?? 0) - gift.cost)
        setFly(gift.emoji); setTimeout(() => setFly(null), 1300)
        setToast(`${gift.emoji} ${gift.name} sent to ${recipient.name}!`); setMsg('')
      }
    } catch { setToast('Could not send gift') }
    setBusy(false)
    setTimeout(() => setToast(null), 3500)
  }

  async function cashOut() {
    setBusy(true)
    try {
      const res = await fetch('/api/gifts/payout', { method: 'POST' })
      const json = await res.json()
      setToast(res.ok ? 'Payout requested 🎉 We’ll be in touch to arrange it.' : (json.error || 'Could not request payout'))
      if (res.ok && uid) refreshWallet(createClient(), uid)
    } catch { setToast('Could not request payout') }
    setBusy(false)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: GOLD, textDecoration: 'none' }}>Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {balance !== null && <span style={{ padding: '7px 12px', borderRadius: 999, background: 'rgba(197,160,90,0.12)', border: `0.5px solid ${GOLD}55`, color: GOLD, font: '700 13px Poppins, sans-serif' }}>🪙 {balance} coins</span>}
          <Link href="/" style={{ height: 36, padding: '0 14px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><i className="ti ti-arrow-left" /> Home</Link>
        </div>
      </nav>

      <section style={{ padding: '3.5rem 1.5rem 1.5rem', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Gifts</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 400, margin: '0 0 .8rem' }}>
          Send a little <em style={{ fontStyle: 'italic', color: GOLD }}>sparkle.</em>
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(236,232,225,0.62)', lineHeight: 1.6 }}>
          Buy gift coins, then send gifts to your favourite escorts, private receptions, creators and profiles.
          {recipient && <> You’re gifting <strong style={{ color: GOLD }}>{recipient.name}</strong>.</>}
        </p>
      </section>

      {/* bundles */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '0 1.5rem 1rem' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, margin: '1rem 0' }}>Gift-coin bundles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {GIFT_BUNDLES.map(b => (
            <button key={b.id} onClick={() => buy(b.id)} disabled={busy} style={{
              cursor: 'pointer', textAlign: 'left', padding: 18, borderRadius: 16,
              border: b.featured ? `1.5px solid ${GOLD}` : '0.5px solid rgba(255,255,255,0.1)',
              background: b.featured ? 'linear-gradient(160deg, rgba(197,160,90,0.16), rgba(20,14,26,0.6))' : 'rgba(20,14,26,0.55)', position: 'relative' }}>
              {b.featured && <span style={{ position: 'absolute', top: 12, right: 12, font: '700 9px Poppins', letterSpacing: '.1em', color: '#0a0710', background: GOLD, padding: '3px 7px', borderRadius: 6 }}>BEST VALUE</span>}
              <div style={{ fontSize: 12, color: 'rgba(236,232,225,0.55)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{b.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: GOLD, lineHeight: 1 }}>{b.coins} <span style={{ fontSize: 16 }}>coins</span></div>
              <div style={{ marginTop: 10, font: '700 15px Poppins, sans-serif' }}>€{b.price}</div>
            </button>
          ))}
        </div>
      </section>

      {/* earnings (only if the viewer has received gifts) */}
      {earnings && earnings.earned > 0 && (
        <section style={{ maxWidth: 980, margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(20,14,26,0.55)' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(236,232,225,0.55)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Your gift earnings</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: GOLD }}>€{(available / 100).toFixed(2)} <span style={{ fontSize: 14, color: 'rgba(236,232,225,0.5)' }}>available</span></div>
              <div style={{ fontSize: 12, color: 'rgba(236,232,225,0.45)' }}>Earned €{(earnings.earned / 100).toFixed(2)} total · cash out from €10</div>
            </div>
            <button onClick={cashOut} disabled={busy || available < 1000} style={{ height: 42, padding: '0 22px', borderRadius: 10, border: 'none', cursor: available < 1000 ? 'not-allowed' : 'pointer', background: available < 1000 ? 'rgba(255,255,255,0.08)' : GOLD, color: available < 1000 ? 'rgba(236,232,225,0.5)' : '#0a0710', font: '700 13px Poppins, sans-serif' }}>
              {available < 1000 ? `€${((1000 - available) / 100).toFixed(2)} to go` : 'Cash out'}
            </button>
          </div>
        </section>
      )}

      {/* catalog */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '1rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, margin: '1rem 0' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, margin: 0 }}>Choose a gift</h2>
          {!recipient && <span style={{ fontSize: 12.5, color: 'rgba(236,232,225,0.5)' }}>Open a profile and tap “Send a gift” to pick a recipient.</span>}
        </div>

        {recipient && (
          <input value={msg} onChange={e => setMsg(e.target.value)} maxLength={200} placeholder={`Add a message for ${recipient.name} (optional)`}
            style={{ width: '100%', boxSizing: 'border-box', marginBottom: 16, padding: '11px 13px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.3)', color: '#ece8e1', font: '400 14px Poppins, sans-serif' }} />
        )}

        {tiers.map(({ t, items }) => (
          <div key={t} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: GOLD, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>{TIER_LABEL[t]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
              {items.map(g => {
                const afford = (balance ?? 0) >= g.cost
                return (
                  <button key={g.slug} onClick={() => send(g)} disabled={busy} title={`${g.name} — ${g.cost} coin${g.cost > 1 ? 's' : ''}`}
                    style={{ cursor: 'pointer', padding: '14px 6px 10px', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.1)',
                      background: recipient ? 'rgba(20,14,26,0.55)' : 'rgba(20,14,26,0.35)', opacity: recipient && !afford ? 0.55 : 1, transition: 'transform .12s ease' }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <div style={{ fontSize: 30, lineHeight: 1 }}>{g.emoji}</div>
                    <div style={{ fontSize: 11, color: 'rgba(236,232,225,0.7)', marginTop: 7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: GOLD, marginTop: 3, fontWeight: 600 }}>🪙 {g.cost}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <p style={{ fontSize: 11.5, color: 'rgba(236,232,225,0.4)', textAlign: 'center', lineHeight: 1.6, maxWidth: 640, margin: '1rem auto 0' }}>
          Recipients keep two-thirds of each gift’s value, cashable in real money once they reach €10. Gifts are a token of appreciation — not a booking or payment for services.
        </p>
      </section>

      {fly && <div aria-hidden style={{ position: 'fixed', left: '50%', bottom: 40, transform: 'translateX(-50%)', fontSize: 64, zIndex: 9999, pointerEvents: 'none', animation: 'giftFly 1.3s ease-out forwards' }}>{fly}</div>}
      {toast && <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 9999, background: 'rgba(12,10,20,0.95)', border: `0.5px solid ${GOLD}55`, color: '#ece8e1', padding: '12px 18px', borderRadius: 12, font: '500 13.5px Poppins, sans-serif', maxWidth: '90vw', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>{toast}</div>}
      <style>{`@keyframes giftFly{0%{opacity:0;transform:translateX(-50%) translateY(0) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-320px) scale(1.4)}}`}</style>
    </div>
  )
}

export default function GiftsPage() {
  return (
    <Suspense fallback={<div style={{ background: '#080612', minHeight: '100vh' }} />}>
      <GiftsInner />
    </Suspense>
  )
}
