'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  availability: string | null
  role: string | null
  country: string | null
  city: string | null
  verified: boolean
  premium: boolean
  created_at: string
  age: number | null
  languages: string[] | null
}

interface Listing {
  id: string
  title: string
  category: string | null
  subcategory: string | null
  price_from: number | null
  price_to: number | null
  city: string | null
  rating: number | null
  review_count: number | null
  images: string[] | null
  meet_type: string | null
  featured_until: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitial(name: string): string {
  return name?.trim()?.[0]?.toUpperCase() ?? '?'
}

function formatPrice(from: number | null, to: number | null): string {
  if (!from && !to) return 'POA'
  if (from && to) return `€${from}–€${to}`
  if (from) return `From €${from}`
  if (to) return `Up to €${to}`
  return 'POA'
}

function formatRating(r: number | null): string {
  if (r == null) return '—'
  return r.toFixed(1)
}

function meetLabel(mt: string | null): string {
  if (!mt) return ''
  const m: Record<string, string> = {
    incall: 'Incall',
    outcall: 'Outcall',
    both: 'Incall & Outcall',
  }
  return m[mt.toLowerCase()] ?? mt
}

// ── Styles ────────────────────────────────────────────────────────────────────

const GOLD = '#c5a05a'
const GOLD_DIM = 'rgba(197,160,90,0.7)'
const BG = '#050505'
const CARD_BG = '#0e0e0e'
const CARD2_BG = '#111111'
const BORDER = 'rgba(197,160,90,0.18)'
const BORDER_SUBTLE = 'rgba(255,255,255,0.06)'
const TEXT = '#f0ece4'
const TEXT_MUTED = 'rgba(240,236,228,0.45)'
const TEXT_DIM = 'rgba(240,236,228,0.65)'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Poppins', sans-serif"

// ── Sub-components ────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(5,5,5,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: `0.5px solid ${BORDER}`,
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <a href="/" style={{
        color: GOLD_DIM,
        fontSize: '20px',
        textDecoration: 'none',
        lineHeight: 1,
        flexShrink: 0,
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={e => (e.currentTarget.style.color = GOLD_DIM)}
      >←</a>

      <a href="/" style={{
        fontFamily: SERIF,
        fontSize: '18px',
        color: GOLD,
        textDecoration: 'none',
        letterSpacing: '0.04em',
        fontWeight: 500,
      }}>
        Secret Xperience
      </a>
    </nav>
  )
}

function Avatar({ profile }: { profile: Profile }) {
  const [imgError, setImgError] = useState(false)

  if (profile.avatar_url && !imgError) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.full_name}
        onError={() => setImgError(true)}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${BORDER}`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div style={{
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: 'rgba(197,160,90,0.08)',
      border: `2px solid ${BORDER}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
    }}>
      <span style={{
        fontFamily: SERIF,
        fontSize: '48px',
        color: GOLD,
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {getInitial(profile.full_name)}
      </span>
    </div>
  )
}

function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontFamily: SANS,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: GOLD,
      background: 'rgba(197,160,90,0.1)',
      border: `0.5px solid rgba(197,160,90,0.4)`,
      borderRadius: '20px',
      padding: '3px 10px',
    }}>
      ✓ Verified
    </span>
  )
}

function PremiumBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontFamily: SANS,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#050505',
      background: `linear-gradient(135deg, ${GOLD} 0%, #e8c97a 60%, #a07a3a 100%)`,
      borderRadius: '20px',
      padding: '3px 10px',
    }}>
      ★ Premium
    </span>
  )
}

function isFeatured(listing: Listing): boolean {
  if (!listing.featured_until) return false
  return new Date(listing.featured_until) > new Date()
}

function ListingCard({ listing }: { listing: Listing }) {
  const [hovered, setHovered] = useState(false)
  const image = listing.images?.[0] ?? null
  const featured = isFeatured(listing)

  return (
    <div
      onClick={() => { window.location.href = '/?listing=' + listing.id }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: CARD2_BG,
        border: `0.5px solid ${hovered ? BORDER : BORDER_SUBTLE}`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(197,160,90,0.2)'
          : '0 2px 12px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Image area */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        background: 'rgba(197,160,90,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {image ? (
          <img
            src={image}
            alt={listing.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.35s',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '28px', opacity: 0.18 }}>◈</span>
          </div>
        )}

        {/* Category pill overlay */}
        {listing.category && (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            fontSize: '11px',
            fontFamily: SANS,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: GOLD,
            background: 'rgba(5,5,5,0.8)',
            border: `0.5px solid rgba(197,160,90,0.3)`,
            borderRadius: '20px',
            padding: '3px 9px',
            backdropFilter: 'blur(6px)',
          }}>
            {listing.category}
          </span>
        )}

        {/* Featured badge */}
        {featured && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '11px',
            fontFamily: SANS,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#050505',
            background: `linear-gradient(135deg, ${GOLD} 0%, #e8c97a 60%, #a07a3a 100%)`,
            borderRadius: '20px',
            padding: '3px 10px',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 8px rgba(197,160,90,0.4)',
          }}>
            ✦ Featured
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: '17px',
          color: TEXT,
          fontWeight: 600,
          lineHeight: 1.3,
          marginBottom: '6px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {listing.title}
        </div>

        {listing.city && (
          <div style={{
            fontSize: '13px',
            fontFamily: SANS,
            color: TEXT_MUTED,
            marginBottom: '10px',
          }}>
            ⌖ {listing.city}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {/* Price */}
          <span style={{
            fontSize: '14px',
            fontFamily: SERIF,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: '0.01em',
          }}>
            {formatPrice(listing.price_from, listing.price_to)}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Rating */}
            {listing.rating != null && (
              <span style={{
                fontSize: '13px',
                fontFamily: SANS,
                color: TEXT_DIM,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}>
                ⭐ {formatRating(listing.rating)}
                {listing.review_count ? (
                  <span style={{ color: TEXT_MUTED }}>({listing.review_count})</span>
                ) : null}
              </span>
            )}

            {/* Meet type */}
            {listing.meet_type && (
              <span style={{
                fontSize: '11px',
                fontFamily: SANS,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: TEXT_DIM,
                background: 'rgba(255,255,255,0.05)',
                border: `0.5px solid ${BORDER_SUBTLE}`,
                borderRadius: '20px',
                padding: '2px 8px',
              }}>
                {meetLabel(listing.meet_type)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '')

  const [profile, setProfile]   = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [session, setSession]   = useState<boolean>(false)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const listingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()

    async function load() {
      setLoading(true)

      // Parallel: session + profile + listings
      const [sessionResult, profileResult, listingsResult] = await Promise.all([
        supabase.auth.getSession(),
        supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, bio, availability, role, country, city, verified, premium, created_at, age, languages')
          .eq('id', id)
          .single(),
        supabase
          .from('listings')
          .select('id, title, category, subcategory, price_from, price_to, city, rating, review_count, images, meet_type, featured_until')
          .eq('profile_id', id)
          .eq('active', true),
      ])

      setSession(!!(sessionResult.data?.session))

      if (profileResult.error || !profileResult.data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const prof = profileResult.data as Profile
      setProfile(prof)
      setListings((listingsResult.data ?? []) as Listing[])
      document.title = `${prof.full_name || prof.username} | SecretXperience`
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta) }
      meta.setAttribute('content', prof.bio?.slice(0, 160) || `View the profile of ${prof.full_name || prof.username} on SecretXperience`)
      setLoading(false)
    }

    load()
  }, [id])

  function handleViewListings(e: React.MouseEvent) {
    e.preventDefault()
    listingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSendMessage() {
    const firstName = listings[0]?.title
    const displayName = profile?.full_name || profile?.username || ''
    const titleParam = firstName
      ? `&listing_title=${encodeURIComponent(firstName)}`
      : `&listing_title=${encodeURIComponent(displayName)}`
    if (session) {
      window.location.href = `/messages?provider_id=${id}${titleParam}`
    } else {
      window.location.href = `/login?next=${encodeURIComponent(`/messages?provider_id=${id}${titleParam}`)}`
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: BG, minHeight: '100vh', fontFamily: SANS }}>
        <NavBar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 56px)',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: `2px solid ${BORDER}`,
            borderTopColor: GOLD,
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: TEXT_MUTED, fontSize: '13px', fontFamily: SANS }}>Loading profile…</span>
        </div>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !profile) {
    return (
      <div style={{ background: BG, minHeight: '100vh', fontFamily: SANS }}>
        <NavBar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 56px)',
          flexDirection: 'column',
          gap: '12px',
          padding: '40px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: '64px',
            color: GOLD,
            lineHeight: 1,
            opacity: 0.3,
          }}>404</div>
          <div style={{
            fontFamily: SERIF,
            fontSize: '26px',
            color: TEXT,
            fontWeight: 600,
          }}>Profile Not Found</div>
          <div style={{
            fontSize: '14px',
            color: TEXT_MUTED,
            fontFamily: SANS,
            maxWidth: '320px',
            lineHeight: 1.6,
          }}>
            This profile doesn't exist or may have been removed.
          </div>
          <a href="/" style={{
            marginTop: '16px',
            fontSize: '13px',
            fontFamily: SANS,
            color: GOLD,
            textDecoration: 'none',
            letterSpacing: '0.06em',
          }}>← Back to Secret Xperience</a>
        </div>
      </div>
    )
  }

  // ── Full page ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: SANS }}>
      <style>{`
        @media (max-width: 640px) {
          .profile-main { padding: 20px 16px 60px !important; }
          .profile-hero { padding: 24px 18px 24px !important; }
          .profile-stat-item { padding: 0 12px !important; }
          .profile-stat-item:first-child { padding-left: 0 !important; border-left: none !important; }
        }
        @media (max-width: 420px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <NavBar />

      <main className="profile-main" style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}>

        {/* ── Hero Card ───────────────────────────────────────────────────── */}
        <section className="profile-hero" style={{
          background: CARD_BG,
          border: `0.5px solid ${BORDER}`,
          borderTop: `2px solid ${GOLD}`,
          borderRadius: '16px',
          padding: '40px 36px 36px',
          marginBottom: '40px',
          boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
        }}>

          {/* Top row: avatar + info */}
          <div style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            <Avatar profile={profile} />

            <div style={{ flex: 1, minWidth: '220px' }}>

              {/* Name */}
              <h1 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(24px, 5vw, 32px)',
                color: TEXT,
                fontWeight: 600,
                margin: '0 0 4px',
                lineHeight: 1.2,
              }}>
                {profile.full_name}
              </h1>

              {/* Username */}
              {profile.username && (
                <div style={{
                  fontSize: '13px',
                  fontFamily: SANS,
                  color: GOLD_DIM,
                  marginBottom: '10px',
                  letterSpacing: '0.03em',
                }}>
                  @{profile.username}
                </div>
              )}

              {/* Badges */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '12px',
              }}>
                {profile.verified && <VerifiedBadge />}
                {profile.premium  && <PremiumBadge />}
              </div>

              {/* Location */}
              {(profile.city || profile.country) && (
                <div style={{
                  fontSize: '13px',
                  fontFamily: SANS,
                  color: TEXT_MUTED,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <span style={{ fontSize: '14px' }}>⌖</span>
                  <span>
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {/* Age */}
              {profile.age != null && (
                <div style={{
                  fontSize: '13px',
                  fontFamily: SANS,
                  color: TEXT_MUTED,
                  marginBottom: '8px',
                  letterSpacing: '0.02em',
                }}>
                  {profile.age} years old
                </div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginTop: '4px',
                }}>
                  {profile.languages.map(lang => (
                    <span key={lang} style={{
                      fontSize: '12px',
                      fontFamily: SANS,
                      color: TEXT_MUTED,
                      background: 'rgba(255,255,255,0.05)',
                      border: `0.5px solid ${BORDER_SUBTLE}`,
                      borderRadius: '20px',
                      padding: '2px 9px',
                      letterSpacing: '0.04em',
                    }}>
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: `0.5px solid ${BORDER_SUBTLE}`,
            }}>
              <p style={{
                fontFamily: SANS,
                fontSize: '14px',
                lineHeight: 1.75,
                color: TEXT_DIM,
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}>
                {profile.bio}
              </p>
              {profile.availability && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🕐</span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#8c8880' }}>{profile.availability}</span>
                </div>
              )}
            </div>
          )}
          {!profile.bio && profile.availability && (
            <div style={{
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: `0.5px solid ${BORDER_SUBTLE}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>🕐</span>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#8c8880' }}>{profile.availability}</span>
              </div>
            </div>
          )}

          {/* Stats row */}
          {(() => {
            const memberSince = profile.created_at
              ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
              : null
            const activeCount = listings.length
            const ratingsWithValues = listings.filter(l => l.rating != null)
            const avgRating = ratingsWithValues.length > 0
              ? ratingsWithValues.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratingsWithValues.length
              : null
            const stats: { label: string; value: string }[] = []
            stats.push({ label: 'Active Advertisements', value: String(activeCount) })
            if (memberSince) stats.push({ label: 'Member Since', value: memberSince })
            if (avgRating != null) stats.push({ label: 'Avg Rating', value: `⭐ ${avgRating.toFixed(1)}` })
            return (
              <div style={{
                display: 'flex',
                gap: '0',
                marginTop: '28px',
                paddingTop: '24px',
                borderTop: `0.5px solid ${BORDER_SUBTLE}`,
                flexWrap: 'wrap',
              }}>
                {stats.map((s, i) => (
                  <div key={s.label} className="profile-stat-item" style={{
                    flex: '1 1 120px',
                    padding: '0 20px',
                    borderLeft: i > 0 ? `0.5px solid ${BORDER_SUBTLE}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: SANS,
                      color: TEXT_MUTED,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>{s.label}</span>
                    <span style={{
                      fontSize: '18px',
                      fontFamily: SERIF,
                      color: GOLD,
                      fontWeight: 600,
                    }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Verified Advertiser prominent section */}
          {profile.verified && (
            <div style={{
              marginTop: '20px',
              padding: '14px 18px',
              background: 'rgba(197,160,90,0.06)',
              border: `0.5px solid rgba(197,160,90,0.3)`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{
                fontSize: '22px',
                lineHeight: 1,
                color: GOLD,
                flexShrink: 0,
              }}>✓</span>
              <div>
                <div style={{
                  fontFamily: SANS,
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  marginBottom: '2px',
                }}>Identity Verified</div>
                <div style={{
                  fontFamily: SANS,
                  fontSize: '12px',
                  color: TEXT_MUTED,
                  lineHeight: 1.5,
                }}>
                  This advertiser has completed identity verification with Secret Xperience.
                </div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '28px',
            flexWrap: 'wrap',
          }}>
            <CTAButton
              label="Send Message"
              variant="filled"
              onClick={handleSendMessage}
            />
            <CTAButton
              label="View Listings"
              variant="ghost"
              onClick={handleViewListings}
            />
          </div>
        </section>

        {/* ── Listings ────────────────────────────────────────────────────── */}
        <section ref={listingsRef}>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: '22px',
            color: TEXT,
            fontWeight: 600,
            margin: '0 0 20px',
            letterSpacing: '0.01em',
          }}>
            Active Advertisements
          </h2>

          {listings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: TEXT_MUTED,
              fontFamily: SANS,
              fontSize: '14px',
              background: CARD_BG,
              border: `0.5px solid ${BORDER_SUBTLE}`,
              borderRadius: '12px',
              lineHeight: 1.7,
            }}>
              <div style={{
                fontSize: '32px',
                opacity: 0.25,
                marginBottom: '12px',
              }}>◈</div>
              No active listings at this time.
            </div>
          ) : (
            <div className="profile-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px,100%), 1fr))',
              gap: '20px',
            }}>
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// ── CTA Button helper ─────────────────────────────────────────────────────────

function CTAButton({
  label,
  variant,
  onClick,
}: {
  label: string
  variant: 'filled' | 'ghost'
  onClick: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)

  const filled = variant === 'filled'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: SANS,
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '11px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: filled
          ? 'none'
          : `0.5px solid ${hovered ? GOLD : 'rgba(197,160,90,0.4)'}`,
        background: filled
          ? hovered
            ? '#d4b06a'
            : GOLD
          : hovered
            ? 'rgba(197,160,90,0.08)'
            : 'transparent',
        color: filled ? '#050505' : hovered ? GOLD : GOLD_DIM,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
