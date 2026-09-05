'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

interface Package {
  id: string
  name: string
  slug: string
  tokens: number
  bonus_tokens: number
  price_eur: number
  popular: boolean
}

interface Wallet {
  balance: number
  total_purchased: number
  total_spent: number
}

interface LedgerEntry {
  id: string
  amount: number
  type: 'purchase' | 'spend' | 'refund'
  description: string
  created_at: string
  balance_after: number
}

const TIER_COSTS = [
  { tier: 'basic',    label: 'Basic Listing',     tokens: 0,    days: 0,  desc: 'Standard grid listing — free and always on.' },
  { tier: 'featured', label: 'Featured Advertisement',  tokens: 50,   days: 7,  desc: 'Gold-bordered card, priority placement in category grid.' },
  { tier: 'slider',   label: 'Slider Ad',         tokens: 200,  days: 7,  desc: 'Rotating slideshow ad on the home page and section pages — high visibility.' },
  { tier: 'section',  label: 'Section Premium',   tokens: 240,  days: 7,  desc: 'Full-width premium banner across your whole category section.' },
  { tier: 'premium',  label: 'Premium Listing',   tokens: 300,  days: 30, desc: 'Top of category for 30 days, larger card, premium badge.' },
  { tier: 'homepage', label: 'Homepage Premium',  tokens: 1100, days: 30, desc: 'Full-width banner on the homepage — our most-visited page. Maximum exposure.' },
]

const ADD_ONS = [
  { label: 'Photo gallery add-on',   tokens: 15  },
  { label: 'Verification badge',     tokens: 25  },
  { label: 'Top boost (24 h)',        tokens: 75  },
]

const FALLBACK_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    tokens: 25,
    bonus_tokens: 0,
    price_eur: 2.50,
    popular: false,
    rate: '€0.10/token',
    perks: ['Tip a creator', 'One 6-hour flash boost'],
  },
  {
    id: 'basic',
    name: 'Basic',
    slug: 'basic',
    tokens: 50,
    bonus_tokens: 0,
    price_eur: 5,
    popular: false,
    rate: '€0.10/token',
    perks: ['One Featured advertisement (7 days)', 'Two flash boosts'],
  },
  {
    id: 'standard',
    name: 'Standard',
    slug: 'standard',
    tokens: 150,
    bonus_tokens: 0,
    price_eur: 15,
    popular: false,
    rate: '€0.10/token',
    perks: ['One Premium listing (30 days)', 'or Featured + Slider for a week'],
  },
  {
    id: 'popular',
    name: 'Popular',
    slug: 'popular',
    tokens: 200,
    bonus_tokens: 10,
    price_eur: 20,
    popular: true,
    rate: '€0.095/token · +10 bonus',
    perks: ['Featured advertisement for 7 days', 'Flash boost × 5', 'Slider ad for 7 days'],
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    tokens: 350,
    bonus_tokens: 25,
    price_eur: 35,
    popular: false,
    rate: '€0.093/token · +25 bonus',
    perks: ['Slider ad for 30 days', 'Featured advertisement × 3', 'Priority placement'],
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    tokens: 500,
    bonus_tokens: 50,
    price_eur: 50,
    popular: false,
    rate: '€0.091/token · +50 bonus',
    perks: ['Premium listing for 30 days', 'Flash boost × 10', 'Concierge support'],
  },
  {
    id: 'elite',
    name: 'Elite',
    slug: 'elite',
    tokens: 750,
    bonus_tokens: 100,
    price_eur: 75,
    popular: false,
    rate: '€0.088/token · +100 bonus',
    perks: ['2+ months premium listing', 'Unlimited flash boosts × 3', 'Personal account manager'],
  },
]

function getPerkIcon(perk: string): string {
  if (perk.toLowerCase().includes('gold') || perk.toLowerCase().includes('platinum') || perk.toLowerCase().includes('concierge') || perk.toLowerCase().includes('manager')) return 'ti-crown'
  if (perk.toLowerCase().includes('creator') || perk.toLowerCase().includes('unlock') || perk.toLowerCase().includes('priority') || perk.toLowerCase().includes('events')) return 'ti-sparkles'
  return 'ti-check'
}

export default function TokensPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [wallet,   setWallet]   = useState<Wallet | null>(null)
  const [ledger,   setLedger]   = useState<LedgerEntry[]>([])
  const [session,  setSession]  = useState<any>(null)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [cryptoId, setCryptoId] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [status,   setStatus]   = useState<'idle' | 'success' | 'cancel'>('idle')
  const [role,     setRole]     = useState<string>('Member')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('status') === 'success') setStatus('success')
    if (sp.get('status') === 'cancel')  setStatus('cancel')
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        supabase.from('user_wallets').select('balance,total_purchased,total_spent').eq('user_id', session.user.id).maybeSingle()
          .then(({ data }) => setWallet(data))
        supabase.from('token_ledger').select('id,amount,type,description,created_at,balance_after').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(15)
          .then(({ data }) => setLedger(data || []))
        supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
          .then(({ data }) => {
            if (data?.role) {
              const map: Record<string, string> = { user: 'Member', client: 'Member', provider: 'Advertiser', venue: 'Venue', creator: 'Creator', admin: 'Admin' }
              setRole(map[data.role] || 'Member')
            }
          })
      }
    })
    supabase.from('token_packages').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => setPackages(data || []))
  }, [])

  async function handlePurchase(pkg: Package | typeof FALLBACK_PACKAGES[0]) {
    if (!session) { window.location.href = '/login?next=/tokens'; return }
    setSelected(pkg.id)
    setLoading(true)
    try {
      const res  = await fetch('/api/verotel/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      // Not configured / error → graceful modal, never a raw error page.
      setShowPayModal(true)
    } catch {
      setShowPayModal(true)
    } finally {
      setLoading(false)
    }
  }

  // Crypto rail (NOWPayments) — parallel to Verotel. Same graceful fallback:
  // configured:false → the "coming soon" modal, never a raw error.
  async function payWithCrypto(pkg: Package | typeof FALLBACK_PACKAGES[0]) {
    if (!session) { window.location.href = '/login?next=/tokens'; return }
    setCryptoId(pkg.id)
    try {
      const res  = await fetch('/api/nowpayments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setShowPayModal(true)
    } catch {
      setShowPayModal(true)
    } finally {
      setCryptoId(null)
    }
  }

  // Compute stats from ledger
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const spentThisMonth = ledger
    .filter(e => e.type === 'spend' && new Date(e.created_at) >= startOfMonth)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0)
  const tipsGiven = ledger
    .filter(e => e.type === 'spend' && e.description?.toLowerCase().includes('tip'))
    .reduce((sum, e) => sum + Math.abs(e.amount), 0)

  const displayPackages = packages.length > 0
    ? packages.map(pkg => ({
        ...pkg,
        rate: `€${(pkg.price_eur / (pkg.tokens + pkg.bonus_tokens)).toFixed(3)}/token`,
        perks: [] as string[],
      }))
    : FALLBACK_PACKAGES

  function fmtDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  return (
    <div style={{ background: '#08060e', minHeight: '100vh', color: '#ece8e1', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197,160,90,0.25); }
          50%       { box-shadow: 0 0 0 8px rgba(197,160,90,0); }
        }

        .tok-nav-link {
          font: 500 13px/1 'Poppins', sans-serif;
          color: rgba(236,232,225,0.45);
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: color 0.15s;
        }
        .tok-nav-link:hover { color: #ece8e1; }
        .tok-nav-link.active { color: #c5a05a; }

        .tok-pkg-card {
          background: rgba(255,255,255,0.025);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.75rem 1.5rem;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }
        .tok-pkg-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .tok-pkg-card.featured {
          border-color: rgba(197,160,90,0.45);
          background: linear-gradient(145deg, rgba(197,160,90,0.06) 0%, rgba(255,255,255,0.02) 100%);
          box-shadow: 0 0 0 1px rgba(197,160,90,0.15), 0 8px 32px rgba(197,160,90,0.1);
          transform: scale(1.03);
        }
        .tok-pkg-card.featured:hover {
          transform: scale(1.03) translateY(-3px);
        }

        .tok-cta-btn {
          width: 100%;
          padding: 12px 0;
          border-radius: 10px;
          font: 600 12px/1 'Poppins', sans-serif;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: filter 0.15s, transform 0.15s;
          margin-top: auto;
          padding-top: 14px;
        }
        .tok-cta-btn:hover { filter: brightness(1.12); }
        .tok-cta-btn:disabled { opacity: 0.45; cursor: default; }
        .tok-cta-btn.primary {
          background: linear-gradient(135deg, #c5a05a 0%, #a0803d 100%);
          color: #080808;
          border: none;
          box-shadow: 0 4px 20px rgba(197,160,90,0.22);
        }
        .tok-cta-btn.secondary {
          background: transparent;
          color: #c5a05a;
          border: 0.5px solid rgba(197,160,90,0.4);
        }
        .tok-cta-btn.secondary:hover { background: rgba(197,160,90,0.06); }
        .tok-crypto-btn {
          width: 100%;
          margin-top: 8px;
          padding: 9px 0;
          border-radius: 9px;
          background: transparent;
          color: rgba(236,232,225,0.6);
          border: 0.5px solid rgba(236,232,225,0.14);
          font: 500 10px/1 'Poppins', sans-serif;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .tok-crypto-btn:hover { color: #c5a05a; border-color: rgba(197,160,90,0.4); background: rgba(197,160,90,0.04); }
        .tok-crypto-btn:disabled { opacity: 0.45; cursor: default; }

        .tok-section-rule {
          height: 0.5px;
          background: linear-gradient(90deg, rgba(197,160,90,0.3) 0%, transparent 70%);
          margin: 0.75rem 0 1.25rem;
        }

        .tok-table-row {
          display: grid;
          grid-template-columns: 80px 1fr 90px 80px 90px;
          align-items: center;
          gap: 12px;
          padding: 13px 18px;
          border-bottom: 0.5px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .tok-table-row:last-child { border-bottom: none; }
        .tok-table-row:hover { background: rgba(255,255,255,0.02); }
        .tok-table-head {
          font: 600 10px/1 'Poppins', sans-serif;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(236,232,225,0.3);
        }

        @media (max-width: 768px) {
          .tok-stats-row { grid-template-columns: 1fr 1fr !important; }
          .tok-pkg-grid  { grid-template-columns: 1fr !important; }
          .tok-pkg-card.featured { transform: none !important; }
          .tok-pkg-card.featured:hover { transform: translateY(-3px) !important; }
          .tok-table-row {
            grid-template-columns: 70px 1fr 70px 70px !important;
          }
          .tok-table-col-balance { display: none; }
          .tok-nav-links { display: none !important; }
          .tok-hero-balance { font-size: clamp(52px, 15vw, 72px) !important; }
          .tok-main { padding: 2rem 16px 4rem !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(8,6,14,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '0.5px solid rgba(197,160,90,0.1)',
        padding: '0 24px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <a href="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 19,
          fontWeight: 500,
          color: '#c5a05a',
          fontStyle: 'italic',
          letterSpacing: '0.02em',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          Secret<em style={{ fontWeight: 300 }}>Xperience</em>
        </a>

        <nav className="tok-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="/" className="tok-nav-link">Browse</a>
          <a href="/discover" className="tok-nav-link">Discover</a>
          <a href="/dashboard?tab=messages" className="tok-nav-link">Messages</a>
          <a href="/tokens" className="tok-nav-link active">Wallet</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {wallet && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(197,160,90,0.08)',
              border: '0.5px solid rgba(197,160,90,0.25)',
              borderRadius: 20,
              padding: '5px 12px',
            }}>
              <i className="ti ti-coin" style={{ fontSize: 14, color: '#c5a05a' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#c5a05a' }}>
                {wallet.balance.toLocaleString()}
              </span>
            </div>
          )}
          <a href="/dashboard" style={{
            fontSize: 12,
            color: 'rgba(236,232,225,0.4)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
            Back
          </a>
        </div>
      </header>

      {/* ── STATUS BANNERS ── */}
      {status === 'success' && (
        <div style={{
          background: 'rgba(29,201,143,0.08)',
          border: '0.5px solid rgba(29,201,143,0.25)',
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: '#1dc98f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <i className="ti ti-circle-check" style={{ fontSize: 16 }} />
          Payment successful — your tokens have been credited to your account!
        </div>
      )}
      {status === 'cancel' && (
        <div style={{
          background: 'rgba(224,90,90,0.08)',
          border: '0.5px solid rgba(224,90,90,0.25)',
          padding: '14px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: '#e05a5a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <i className="ti ti-x" style={{ fontSize: 16 }} />
          Payment cancelled — no charges were made.
        </div>
      )}

      <main className="tok-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 24px 6rem', animation: 'fadeUp 0.4s ease' }}>

        {/* ── HERO ── */}
        <div style={{ marginBottom: '4rem' }}>
          <p style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(197,160,90,0.65)',
            fontWeight: 500,
            marginBottom: '0.75rem',
            fontFamily: "'Poppins', sans-serif",
          }}>
            Wallet · {role}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className="tok-hero-balance"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(52px, 8vw, 72px)',
                fontWeight: 400,
                color: '#c5a05a',
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {wallet ? wallet.balance.toLocaleString() : '—'}
            </span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: 300,
              color: 'rgba(197,160,90,0.55)',
              fontStyle: 'italic',
            }}>
              tokens
            </span>
          </div>

          <p style={{
            fontSize: 14,
            color: 'rgba(236,232,225,0.4)',
            marginBottom: '2rem',
            fontWeight: 300,
          }}>
            ≈ €{wallet ? (wallet.balance * 0.10).toFixed(2) : '0.00'} available
          </p>

          {/* Stats row */}
          <div
            className="tok-stats-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              maxWidth: 680,
            }}
          >
            {[
              {
                label: 'Spent this month',
                value: spentThisMonth.toLocaleString(),
                icon: 'ti-trending-down',
                color: 'rgba(224,90,90,0.7)',
              },
              {
                label: 'Total purchased',
                value: wallet ? wallet.total_purchased.toLocaleString() : '—',
                icon: 'ti-shopping-cart',
                color: '#c5a05a',
              },
              {
                label: 'Tips given',
                value: tipsGiven.toLocaleString(),
                icon: 'ti-heart',
                color: 'rgba(197,160,90,0.6)',
              },
              {
                label: 'Balance',
                value: wallet ? wallet.balance.toLocaleString() : '—',
                icon: 'ti-coin',
                color: '#c5a05a',
              },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '1rem 1.1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <i className={`ti ${stat.icon}`} style={{ fontSize: 13, color: stat.color }} />
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(236,232,225,0.35)',
                  }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 400,
                  color: '#ece8e1',
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BUY TOKENS SECTION ── */}
        <div style={{ marginBottom: '4rem' }}>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(197,160,90,0.55)',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}>
            Top up
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 400,
            color: '#ece8e1',
            lineHeight: 1.15,
            marginBottom: '0.1rem',
          }}>
            Buy <em style={{ fontStyle: 'italic', color: '#c5a05a' }}>tokens</em>
          </h2>
          <div className="tok-section-rule" />
          <p style={{
            fontSize: 12,
            color: 'rgba(236,232,225,0.35)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            marginBottom: '2rem',
          }}>
            Single purchase · no auto-renew
          </p>

          <div
            className="tok-pkg-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 14,
            }}
          >
            {displayPackages.map(pkg => {
              const isFeatured = pkg.popular
              const rate = (pkg as any).rate || `€${(pkg.price_eur / (pkg.tokens + pkg.bonus_tokens)).toFixed(3)}/token`
              const perks: string[] = (pkg as any).perks || []
              const total = pkg.tokens + pkg.bonus_tokens

              return (
                <div
                  key={pkg.id}
                  className={`tok-pkg-card${isFeatured ? ' featured' : ''}`}
                >
                  {/* Most popular banner */}
                  {isFeatured && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(90deg, #c5a05a 0%, #d4b46e 100%)',
                      borderRadius: '15px 15px 0 0',
                      padding: '6px 0',
                      textAlign: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#080808',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}>
                      Most Popular
                    </div>
                  )}

                  <div style={{ paddingTop: isFeatured ? '1.75rem' : 0 }}>
                    {/* Package name */}
                    <p style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isFeatured ? '#c5a05a' : 'rgba(236,232,225,0.5)',
                      marginBottom: '0.6rem',
                    }}>
                      {pkg.name}
                    </p>

                    {/* Amount */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: '0.2rem' }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 38,
                        fontWeight: 400,
                        color: isFeatured ? '#c5a05a' : '#ece8e1',
                        lineHeight: 1,
                      }}>
                        {total.toLocaleString()}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 11,
                      color: 'rgba(236,232,225,0.35)',
                      marginBottom: '0.75rem',
                      fontWeight: 300,
                    }}>
                      tokens
                    </p>

                    {/* Price */}
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 26,
                      fontWeight: 400,
                      color: '#ece8e1',
                      marginBottom: '0.2rem',
                    }}>
                      €{pkg.price_eur.toFixed(0)}
                    </p>

                    {/* Rate */}
                    <p style={{
                      fontSize: 10,
                      color: 'rgba(197,160,90,0.6)',
                      fontWeight: 400,
                      marginBottom: '0.4rem',
                      letterSpacing: '0.02em',
                    }}>
                      {rate}
                    </p>

                    {/* Days of visibility at basic rate (3 tok/day) */}
                    <p style={{
                      fontSize: 10,
                      color: 'rgba(236,232,225,0.3)',
                      fontWeight: 300,
                      marginBottom: perks.length ? '1rem' : '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <i className="ti ti-calendar" style={{ fontSize: 10 }} />
                      ≈ {Math.floor(total / 3)} days visibility at basic tier
                    </p>

                    {/* Perks */}
                    {perks.length > 0 && (
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 0 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}>
                        {perks.map(perk => (
                          <li key={perk} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            fontSize: 11,
                            color: 'rgba(236,232,225,0.55)',
                            fontWeight: 300,
                          }}>
                            <i
                              className={`ti ${getPerkIcon(perk)}`}
                              style={{ fontSize: 12, color: isFeatured ? '#c5a05a' : 'rgba(197,160,90,0.5)', flexShrink: 0 }}
                            />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <button
                      className={`tok-cta-btn ${isFeatured ? 'primary' : 'secondary'}`}
                      onClick={() => handlePurchase(pkg as any)}
                      disabled={loading && selected === pkg.id}
                    >
                      {loading && selected === pkg.id ? 'Redirecting…' : 'Buy now'}
                    </button>
                    <button
                      className="tok-crypto-btn"
                      onClick={() => payWithCrypto(pkg as any)}
                      disabled={cryptoId === pkg.id}
                    >
                      {cryptoId === pkg.id ? 'Redirecting…' : <><span aria-hidden>◎</span> Pay with crypto</>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── TRANSACTIONS SECTION ── */}
        <div style={{ marginBottom: '4rem' }}>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(197,160,90,0.55)',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}>
            Activity
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 400,
            color: '#ece8e1',
            lineHeight: 1.15,
            marginBottom: '0.1rem',
          }}>
            Recent <em style={{ fontStyle: 'italic', color: '#c5a05a' }}>transactions</em>
          </h2>
          <div className="tok-section-rule" />
          <p style={{
            fontSize: 12,
            color: 'rgba(236,232,225,0.35)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            marginBottom: '1.5rem',
          }}>
            Last 15 entries
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div className="tok-table-row" style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              <span className="tok-table-head">Date</span>
              <span className="tok-table-head">Description</span>
              <span className="tok-table-head">Type</span>
              <span className="tok-table-head" style={{ textAlign: 'right' }}>Amount</span>
              <span className="tok-table-head tok-table-col-balance" style={{ textAlign: 'right' }}>Balance</span>
            </div>

            {ledger.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'rgba(236,232,225,0.3)',
                fontSize: 13,
                fontWeight: 300,
              }}>
                {!session
                  ? 'Sign in to view your transaction history'
                  : 'No transactions yet — purchase tokens to get started'}
              </div>
            ) : (
              ledger.map(entry => {
                const isCredit = entry.type === 'purchase' || entry.type === 'refund'
                const typeIcon = entry.type === 'purchase'
                  ? 'ti-coin'
                  : entry.type === 'refund'
                  ? 'ti-arrow-up-right'
                  : 'ti-arrow-down-right'
                const typeColor = entry.type === 'purchase'
                  ? '#c5a05a'
                  : entry.type === 'refund'
                  ? '#1dc98f'
                  : 'rgba(236,232,225,0.35)'
                const typeLabel = entry.type.charAt(0).toUpperCase() + entry.type.slice(1)

                return (
                  <div key={entry.id} className="tok-table-row">
                    <span style={{ fontSize: 12, color: 'rgba(236,232,225,0.45)', fontWeight: 300 }}>
                      {fmtDate(entry.created_at)}
                    </span>
                    <span style={{
                      fontSize: 13,
                      color: '#ece8e1',
                      fontWeight: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.description}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className={`ti ${typeIcon}`} style={{ fontSize: 13, color: typeColor }} />
                      <span style={{ fontSize: 11, color: typeColor, fontWeight: 500, letterSpacing: '0.04em' }}>
                        {typeLabel}
                      </span>
                    </span>
                    <span style={{
                      textAlign: 'right',
                      fontSize: 13,
                      fontWeight: 600,
                      color: isCredit ? '#1dc98f' : '#e2536b',
                    }}>
                      {isCredit ? '+' : '−'}{Math.abs(entry.amount).toLocaleString()}
                    </span>
                    <span className="tok-table-col-balance" style={{
                      textAlign: 'right',
                      fontSize: 12,
                      color: 'rgba(236,232,225,0.4)',
                      fontWeight: 300,
                    }}>
                      {entry.balance_after.toLocaleString()}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── LISTING TIERS ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(197,160,90,0.55)',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}>
            Usage
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 3.5vw, 36px)',
            fontWeight: 400,
            color: '#ece8e1',
            lineHeight: 1.15,
            marginBottom: '0.1rem',
          }}>
            Listing <em style={{ fontStyle: 'italic', color: '#c5a05a' }}>tiers</em>
          </h2>
          <div className="tok-section-rule" />
          <p style={{
            fontSize: 12,
            color: 'rgba(236,232,225,0.35)',
            fontWeight: 300,
            marginBottom: '1.5rem',
          }}>
            Tiers stack — extend any time by spending more tokens
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {TIER_COSTS.map(t => (
              <div key={t.tier} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ece8e1' }}>{t.label}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#c5a05a',
                    background: 'rgba(197,160,90,0.1)',
                    borderRadius: 6,
                    padding: '2px 8px',
                  }}>
                    {t.tokens === 0 ? 'Free' : `${t.tokens} ◈`}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(236,232,225,0.45)', lineHeight: 1.6, marginBottom: '0.5rem', fontWeight: 300 }}>{t.desc}</p>
                <p style={{ fontSize: 11, color: 'rgba(236,232,225,0.25)' }}>
                  {t.days === 0 ? 'Always on' : `Duration: ${t.days} days`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADD-ONS ── */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 400,
            color: '#ece8e1',
            marginBottom: '1.25rem',
          }}>
            Add‑ons
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ADD_ONS.map(a => (
              <div key={a.label} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <span style={{ fontSize: 13, color: '#ece8e1' }}>{a.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#c5a05a' }}>{a.tokens} ◈</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYMENT COMPLIANCE ── */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(236,232,225,0.25)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>
            Accepted payment methods
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
            {['Visa', 'Mastercard', 'Cryptocurrency', 'Bank Transfer'].map(m => (
              <span key={m} style={{
                fontSize: 11,
                color: 'rgba(236,232,225,0.4)',
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '5px 12px',
              }}>
                {m}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(236,232,225,0.28)', lineHeight: 1.8, maxWidth: 640, fontWeight: 300 }}>
            Payments are processed securely via an adult-friendly payment processor. All transactions are encrypted. Tokens are non-refundable except as required by applicable Belgian consumer law (14-day withdrawal right). Token purchases appear discreetly on your statement. By purchasing you agree to our{' '}
            <a href="/terms" style={{ color: 'rgba(197,160,90,0.6)', textDecoration: 'none' }}>Terms of Use</a>.
          </p>
        </div>
      </main>

      {/* Payment coming-soon modal */}
      {showPayModal && (
        <div
          onClick={() => { setShowPayModal(false); setSelected(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,6,14,0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, #12101a 0%, #1a1525 100%)', border: '0.5px solid rgba(232,201,122,0.3)', borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,201,122,0.1)', border: '1px solid rgba(232,201,122,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <i className="ti ti-lock" style={{ fontSize: 24, color: '#e8c97a' }} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: '#ece8e1', marginBottom: 10 }}>
              Payment coming soon
            </div>
            <p style={{ fontSize: 14, color: 'rgba(236,232,225,0.55)', lineHeight: 1.6, marginBottom: 24 }}>
              Secure token checkout is being finalised. To purchase tokens or enquire about early access, contact us directly.
            </p>
            <a
              href="mailto:support@secretxperience.eu"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg, #e8c97a, #c5a05a)', color: '#0a0a0a', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 10, textDecoration: 'none', marginBottom: 12 }}
            >
              <i className="ti ti-mail" /> Contact support
            </a>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => { setShowPayModal(false); setSelected(null) }}
                style={{ background: 'none', border: 'none', color: 'rgba(236,232,225,0.35)', fontSize: 12, cursor: 'pointer', padding: '6px 12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ borderTop: '0.5px solid rgba(197,160,90,0.1)', padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(236,232,225,0.25)', fontWeight: 300 }}>
          © 2026 SecretXperience.eu ·{' '}
          <a href="/regulations" style={{ color: 'rgba(197,160,90,0.5)', textDecoration: 'none' }}>Regulations</a>
          {' '}·{' '}
          <a href="/medical" style={{ color: 'rgba(197,160,90,0.5)', textDecoration: 'none' }}>Medical Info</a>
          {' '}·{' '}
          <a href="/terms" style={{ color: 'rgba(197,160,90,0.5)', textDecoration: 'none' }}>Terms</a>
          {' '}·{' '}
          <a href="/privacy" style={{ color: 'rgba(197,160,90,0.5)', textDecoration: 'none' }}>Privacy</a>
          {' '}·{' '}
          <a href="/contact" style={{ color: 'rgba(197,160,90,0.5)', textDecoration: 'none' }}>Support</a>
        </p>
      </footer>
    </div>
  )
}
