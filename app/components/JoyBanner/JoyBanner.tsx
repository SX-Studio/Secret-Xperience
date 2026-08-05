'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const SITE = 'https://www.enjoywithjoy.be/#'
const GOLD = '#e8c97a'
const PINK = '#e05a86'

// Full profile, transcribed from enjoywithjoy.be (bio / stats / contact / socials).
const BIO: string[] = [
  'I am Joy, 18 years old and a student.',
  'I am ready to welcome you in my studio and accompany you to spend an unforgettable moment.',
  'My entourage describes me as very spontaneous, sociable, patient, friendly and sincere.',
  'I love to laugh and talk about interesting things because I like to discover the joy of life.',
  'I describe myself as elegant, stylish and at the same time very attractive.',
  'You will always see me in fashionable clothes or in fine and sexy lingerie of high quality.',
  'I like dedicated men who are respectful, sympathetic and above all hygienic.',
  'For me, life is synonymous with excitement, experiences and pleasure.',
  'My goal is to relax and charm you in the hope of finding yourself.',
  'For a moment of sensuality and sharing. Tender kisses,',
]

const STATS: [string, string][] = [
  ['Gender', 'Young woman'],
  ['Orientation', 'Straight'],
  ['Nationality', 'Belgian'],
  ['Ethnicity', 'Western European'],
  ['Age', '18 years'],
  ['Height', '172 cm'],
  ['Weight', '62 kg'],
  ['Hair', 'Brown'],
  ['Languages', 'FR · NL · EN · DE · IT'],
]

const SOCIALS: { label: string; href: string; icon: string }[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/enjoyourlife_07', icon: 'ti-brand-instagram' },
  { label: 'Snapchat', href: 'http://8qh14a.me/v/4e8e4f3ec5', icon: 'ti-brand-snapchat' },
  { label: 'Skype', href: 'https://join.skype.com/invite/zUWCdONbtXfU', icon: 'ti-brand-skype' },
  { label: 'OnlyFans', href: 'https://onlyfans.com/enjoywithjoy69', icon: 'ti-heart-filled' },
  { label: 'Fansly', href: 'https://fansly.com/enjoywithjoy69', icon: 'ti-star-filled' },
  { label: 'MymFans', href: 'https://mym.fans/Enjoywithjoy69', icon: 'ti-flame' },
  { label: 'Video Collection', href: 'https://snapsell.info/1LMrZxcStx', icon: 'ti-video' },
  { label: 'Friends2Follow', href: 'https://f2f.com/enjoywithjoy69', icon: 'ti-users' },
]

interface Props {
  /** When set, the banner renders into this mount element via a portal. */
  portalTo?: string
}

export default function JoyBanner({ portalTo }: Props) {
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!portalTo) return
    const el = document.getElementById(portalTo)
    if (el) setMountEl(el)
  }, [portalTo])

  // Lock body scroll while the profile modal is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open])

  const banner = (
    <>
      <style>{`
        .jb-card{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
        .jb-card:hover{transform:translateY(-3px);box-shadow:0 22px 60px rgba(0,0,0,.55);border-color:${GOLD}88}
        .jb-cta{transition:transform .18s ease,box-shadow .18s ease}
        .jb-cta:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(224,90,134,.45)}
        .jb-social{transition:background .16s ease,border-color .16s ease,color .16s ease}
        .jb-social:hover{background:rgba(232,201,122,.12);border-color:${GOLD}88;color:#fff}
        @keyframes jbFade{from{opacity:0}to{opacity:1}}
        @keyframes jbRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:640px){
          .jb-card{min-height:300px !important}
          .jb-name{font-size:44px !important}
          .jb-modal-grid{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* ── BANNER (kader) ── */}
      <div
        className="jb-card"
        onDoubleClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Enjoy with Joy — double-click for full profile"
        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true) }}
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          minHeight: 360,
          cursor: 'pointer',
          border: `0.5px solid ${GOLD}55`,
          boxShadow: '0 14px 44px rgba(0,0,0,.45)',
          margin: '1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* background photo (afbeelding 2) */}
        <img
          src="/enjoywithjoy/bg.jpg"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* readability overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(10,7,12,.88) 0%, rgba(10,7,12,.55) 42%, rgba(10,7,12,.15) 100%)' }} />

        {/* content */}
        <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(1.5rem,4vw,2.75rem)', maxWidth: 620 }}>
          <img
            src="/enjoywithjoy/logo.png"
            alt="Enjoy with Joy"
            style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,.9)', padding: 4, boxShadow: `0 0 30px ${GOLD}55`, marginBottom: 16 }}
          />
          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 700, color: GOLD, marginBottom: 8 }}>
            ✦ Featured Advertiser
          </div>
          <div className="jb-name" style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 60, fontWeight: 500, color: '#fff', lineHeight: 1, marginBottom: 10 }}>
            Enjoy with Joy
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['Escort', 'Anderlecht · Brussels', '18 y/o'].map((t) => (
              <span key={t} style={{ fontSize: 12, color: '#f0e9e0', border: `0.5px solid ${GOLD}66`, borderRadius: 999, padding: '5px 12px', background: 'rgba(0,0,0,.25)' }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: 14.5, color: 'rgba(240,233,224,.82)', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 480 }}>
            For an intimate moment of sensuality and sharing. From <strong style={{ color: GOLD }}>€150 / 30&nbsp;min</strong>.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(true) }}
              className="jb-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                fontSize: 14, fontWeight: 700, color: '#fff', border: 'none',
                background: `linear-gradient(90deg, ${PINK}, #b8446c)`, borderRadius: 12, padding: '12px 22px',
              }}
            >
              <i className="ti ti-user-heart" /> View full profile
            </button>
            <a
              href={SITE}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="jb-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                fontSize: 14, fontWeight: 700, color: '#0a0a0a',
                background: `linear-gradient(90deg, ${GOLD}, #c5a05a)`, borderRadius: 12, padding: '12px 22px',
              }}
            >
              <i className="ti ti-external-link" /> Visit website
            </a>
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(240,233,224,.5)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-click" /> Double-click the banner for the full profile
          </div>
        </div>
      </div>
    </>
  )

  const modal = open ? (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(6,4,9,.82)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '4vh 16px', overflowY: 'auto', animation: 'jbFade .2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860, background: '#14101a', borderRadius: 20,
          border: `0.5px solid ${GOLD}44`, boxShadow: '0 30px 90px rgba(0,0,0,.6)',
          overflow: 'hidden', animation: 'jbRise .28s ease', marginBottom: '4vh',
        }}
      >
        {/* modal hero */}
        <div style={{ position: 'relative', minHeight: 200 }}>
          <img src="/enjoywithjoy/bg.jpg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,16,26,.35) 0%, rgba(20,16,26,.95) 100%)' }} />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="ti ti-x" />
          </button>
          <div style={{ position: 'relative', zIndex: 2, padding: '1.75rem 1.75rem 1.25rem', display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <img src="/enjoywithjoy/logo.png" alt="Enjoy with Joy" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.92)', padding: 4, boxShadow: `0 0 24px ${GOLD}55`, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 40, fontWeight: 500, color: '#fff', lineHeight: 1 }}>Enjoy with Joy</div>
              <div style={{ fontSize: 13, color: 'rgba(240,233,224,.7)', marginTop: 4 }}>Escort girl · Anderlecht (Brussels) · 18 y/o</div>
            </div>
          </div>
        </div>

        {/* modal body */}
        <div style={{ padding: '1.5rem 1.75rem 2rem' }}>
          <div className="jb-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 28 }}>
            {/* left: bio */}
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 24, color: GOLD, margin: '0 0 12px', fontWeight: 500 }}>A little explanation…</h3>
              {BIO.map((p, i) => (
                <p key={i} style={{ fontSize: 14, color: 'rgba(240,233,224,.82)', lineHeight: 1.6, margin: '0 0 10px' }}>{p}</p>
              ))}

              <h3 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 22, color: GOLD, margin: '22px 0 10px', fontWeight: 500 }}>Region &amp; rates</h3>
              <p style={{ fontSize: 14, color: 'rgba(240,233,224,.82)', lineHeight: 1.6, margin: '0 0 8px' }}>
                Receives in <strong>1070 Brussels — Anderlecht, Rue des Fraises 33</strong>, and by appointment in 1910–1820 Flemish Brabant (Kampenhout, Steenokkerzeel). Transfers anywhere within the hour + the Belgian coast (Knokke, etc.) whenever possible.
              </p>
              <p style={{ fontSize: 14, color: '#f0e9e0', margin: 0 }}>
                Rates: from <strong style={{ color: GOLD }}>€150 / 30&nbsp;min</strong> · <strong style={{ color: GOLD }}>€250 / hour</strong>
              </p>
            </div>

            {/* right: stats + contact + socials */}
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 22, color: GOLD, margin: '0 0 12px', fontWeight: 500 }}>Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 20 }}>
                {STATS.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, padding: '6px 0', borderBottom: '0.5px solid rgba(255,255,255,.07)' }}>
                    <span style={{ color: 'rgba(240,233,224,.55)' }}>{k}</span>
                    <span style={{ color: '#f0e9e0', textAlign: 'right', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 22, color: GOLD, margin: '0 0 10px', fontWeight: 500 }}>Contact</h3>
              <a href="https://wa.me/32475200590" target="_blank" rel="noopener noreferrer" className="jb-social" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0e9e0', border: '0.5px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13.5 }}>
                <i className="ti ti-brand-whatsapp" style={{ color: '#26d4a0', fontSize: 18 }} /> +32 (0)475 20 05 90
              </a>
              <a href="mailto:enjoywithjoy69@gmail.com" className="jb-social" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0e9e0', border: '0.5px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 12px', marginBottom: 16, fontSize: 13.5 }}>
                <i className="ti ti-mail" style={{ color: GOLD, fontSize: 18 }} /> enjoywithjoy69@gmail.com
              </a>

              <h3 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 22, color: GOLD, margin: '0 0 10px', fontWeight: 500 }}>Elsewhere</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="jb-social" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'rgba(240,233,224,.85)', border: '0.5px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '9px 10px', fontSize: 12.5 }}>
                    <i className={`ti ${s.icon}`} style={{ color: GOLD }} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* footer CTA → website */}
          <a
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="jb-cta"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24,
              textDecoration: 'none', fontSize: 15, fontWeight: 700, color: '#0a0a0a',
              background: `linear-gradient(90deg, ${GOLD}, #c5a05a)`, borderRadius: 14, padding: '14px 22px',
            }}
          >
            <i className="ti ti-external-link" /> Visit enjoywithjoy.be
          </a>
        </div>
      </div>
    </div>
  ) : null

  const content = (
    <>
      {banner}
      {typeof document !== 'undefined' && modal ? createPortal(modal, document.body) : null}
    </>
  )

  if (portalTo) {
    return mountEl ? createPortal(content, mountEl) : null
  }
  return content
}
