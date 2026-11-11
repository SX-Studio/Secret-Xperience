import type { Metadata } from 'next'
import Link from 'next/link'
import { PARTNER_SECTIONS as SECTIONS, PARTNER_BADGE as BADGE, PARTNER_INDUSTRY_IDS, PARTNER_LIFESTYLE_IDS, type BizLink } from '../data/partners'
import { PARTNER_IMAGES } from '../data/partnerImages'

export const metadata: Metadata = {
  title: 'Partners & Links — SecretXperience.eu',
  description: 'Curated adult industry partners, EU sex shops, lifestyle affiliates and services for the adult entertainment world.',
}


// ─── Banner art ───────────────────────────────────────────────────────────────

const OFFICIAL = 'Official Partner'

// Hand-made banners for official partners that have no usable share image.
const OFFICIAL_ART: Record<string, { bg: string; ink: string }> = {
  'Dorcel Club': { bg: 'radial-gradient(ellipse at 80% 15%, rgba(224,32,48,0.55) 0%, transparent 60%), linear-gradient(150deg,#140606 0%,#4a0710 60%,#1a0508 100%)', ink: '#f5e9e6' },
  'Stripchat':   { bg: 'radial-gradient(ellipse at 20% 85%, rgba(255,60,90,0.5) 0%, transparent 60%), linear-gradient(150deg,#0d0a10 0%,#3a0b1c 55%,#a3102f 100%)', ink: '#fff' },
}

// Stable per-partner hue, so a partner keeps its colour between visits.
function hue(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

function BannerArt({ p, tall }: { p: BizLink; tall?: boolean }) {
  const img = PARTNER_IMAGES[p.name]
  const ratio = tall ? '16 / 9' : '640 / 336'
  if (img) {
    return (
      <div style={{ aspectRatio: ratio, overflow: 'hidden', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <img src={img} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }
  const art = OFFICIAL_ART[p.name]
  const h = hue(p.name)
  return (
    <div aria-hidden="true" style={{
      aspectRatio: ratio, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: art?.bg ?? `radial-gradient(ellipse at 78% 18%, hsla(${h},70%,55%,0.45) 0%, transparent 60%), linear-gradient(140deg, hsl(${h},35%,9%) 0%, hsl(${(h + 30) % 360},45%,18%) 100%)`,
      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ position: 'absolute', right: '-4%', bottom: '-18%', fontSize: tall ? 150 : 110, opacity: 0.16, lineHeight: 1 }}>{p.emoji}</span>
      <span style={{ position: 'relative', padding: '0 1.25rem', textAlign: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: tall ? 'clamp(34px,4vw,46px)' : 26, fontWeight: 500, lineHeight: 1.05, color: art?.ink ?? '#f3ede4', letterSpacing: '0.01em', textShadow: '0 2px 18px rgba(0,0,0,0.45)' }}>
        {p.name}
      </span>
    </div>
  )
}

function PartnerCard({ p }: { p: BizLink }) {
  const bs = p.badge ? BADGE[p.badge] : null
  const inner = (
    <>
      <BannerArt p={p} />
      <div style={{ padding: '0.9rem 1.1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14 }}>{p.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#ece8e1' }}>{p.name}</span>
          {bs && (
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.08em', padding: '2px 6px', borderRadius: 20, background: bs.bg, color: bs.color, border: `0.5px solid ${bs.border}` }}>
              {p.badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, flex: 1 }}>{p.tagline}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          {p.url ? (
            <span className="p-visit">
              {new URL(p.url).hostname.replace('www.', '')} <i className="ti ti-external-link" style={{ fontSize: 10 }} />
            </span>
          ) : (
            <span className="p-visit" style={{ opacity: 0.45, cursor: 'default' }}>website coming soon</span>
          )}
          {p.network && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', fontFamily: "'Poppins',sans-serif" }}>via {p.network}</span>
          )}
        </div>
      </div>
    </>
  )
  return p.url ? (
    <a href={p.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="p-card">{inner}</a>
  ) : (
    <div className="p-card">{inner}</div>
  )
}

function OfficialCard({ p }: { p: BizLink }) {
  return (
    <a href={p.url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="p-card p-official">
      <BannerArt p={p} tall />
      <div style={{ padding: '1.1rem 1.25rem 1.3rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#e09090' }}>✦ Official Partner</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 500, color: '#f3ede4', lineHeight: 1.1 }}>{p.name}</div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, flex: 1 }}>{p.tagline}</p>
        <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(90deg,#c0001a,#8b000f)', color: '#fff', fontSize: 12.5, fontWeight: 700 }}>
          Visit {p.name} <i className="ti ti-arrow-right" />
        </span>
      </div>
    </a>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnersPage() {
  const industryIds  = PARTNER_INDUSTRY_IDS
  const lifestyleIds = PARTNER_LIFESTYLE_IDS
  const hasRegular = (sec: typeof SECTIONS[number]) => sec.items.some(p => p.badge !== OFFICIAL)
  const officials = SECTIONS.flatMap(s => s.items).filter(p => p.badge === OFFICIAL && p.url)

  return (
    <div style={{ minHeight: '100vh', background: '#080608', color: '#ece8e1' }}>
      <style>{`
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cat-pill { height: 32px; padding: 0 13px; border-radius: 20px; border: 0.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4); font: 500 11px 'Poppins', sans-serif; cursor: pointer; white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all .15s; flex-shrink: 0; }
        .cat-pill:hover { border-color: rgba(197,160,90,0.4); background: rgba(197,160,90,0.07); color: #c5a05a; }
        .p-card { background: #0e0c12; border: 0.5px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: border-color .2s, transform .15s; }
        .p-official { border-color: rgba(196,90,90,0.35); border-radius: 16px; box-shadow: 0 14px 40px rgba(0,0,0,0.45); }
        .p-official:hover { border-color: rgba(224,32,48,0.6); }
        .p-off-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
        .p-card:hover { border-color: rgba(197,160,90,0.18); transform: translateY(-2px); }
        .p-visit { display: inline-flex; align-items: center; gap: 4px; padding: 6px 13px; background: rgba(197,160,90,0.07); border: 0.5px solid rgba(197,160,90,0.25); border-radius: 7px; color: #c5a05a; font: 600 11px 'Poppins', sans-serif; text-decoration: none; transition: background .15s; white-space: nowrap; }
        .p-card:hover .p-visit, .p-visit:hover { background: rgba(197,160,90,0.14); border-color: rgba(197,160,90,0.45); }
        .p-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        .sec-label { font: 700 9px 'Poppins',sans-serif; letter-spacing: .16em; text-transform: uppercase; color: rgba(197,160,90,0.55); margin: 2.5rem 0 0.75rem; display: flex; align-items: center; gap: 8px; }
        .sec-label::after { content:''; flex:1; height:.5px; background:rgba(255,255,255,0.05); }
        .group-head { padding: 2rem 0 1.5rem; border-top: 0.5px solid rgba(255,255,255,0.05); margin-top: 2rem; }
        @media(max-width:640px){ .p-grid{grid-template-columns:1fr} .p-main{padding:2rem 1rem 5rem!important} .p-nav{padding:0 1rem!important} }
      `}</style>

      {/* Nav */}
      <nav className="p-nav" style={{ position:'sticky', top:0, zIndex:100, height:54, padding:'0 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,6,8,0.97)', borderBottom:'0.5px solid rgba(197,160,90,0.08)', backdropFilter:'blur(18px)' }}>
        <Link href="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:'#c5a05a', textDecoration:'none', fontStyle:'italic' }}>
          Secret<em style={{ fontStyle:'normal' }}>Xperience</em>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Link href="/regulations" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Regulations</Link>
          <Link href="/medical" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Medical</Link>
          <Link href="/advertise" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Advertise</Link>
          <Link href="/" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>← Home</Link>
        </div>
      </nav>

      <main className="p-main" style={{ maxWidth:1200, margin:'0 auto', padding:'3rem 1.5rem 6rem' }}>

        {/* Hero */}
        <div style={{ marginBottom:'2.5rem' }}>
          <p style={{ fontSize:9, letterSpacing:'.18em', color:'rgba(197,160,90,0.55)', textTransform:'uppercase', marginBottom:'0.875rem' }}>✦ SecretXperience.eu</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(32px,5vw,54px)', fontWeight:400, lineHeight:1.1, marginBottom:'1rem' }}>
            Partners &amp; <em style={{ color:'#c5a05a', fontStyle:'italic' }}>Links</em>
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', maxWidth:580, lineHeight:1.75, marginBottom:'1.5rem' }}>
            Carefully selected businesses for the adult services world — EU adult shops, webcam platforms, nightlife venues, lifestyle affiliates and industry tools. Want a listing? <a href="mailto:heyokanaga@gmail.com?subject=Link+listing+—+SecretXperience" style={{ color:'#c5a05a', textDecoration:'none' }}>Contact us →</a>
          </p>

          {/* Affiliate notice */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:10, color:'rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.05)', borderRadius:20, padding:'4px 12px' }}>
            <i className="ti ti-info-circle" style={{ fontSize:11 }} />
            Some links are affiliate links — we may earn a commission at no cost to you
          </div>
        </div>

        {/* ══ Official partners ══ */}
        {officials.length > 0 && (
          <section id="official" style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(224,144,144,0.75)', marginBottom: 8 }}>✦ Official partners</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, marginBottom: '1.25rem' }}>
              Our official partners
            </h2>
            <div className="p-off-grid">
              {officials.map(p => <OfficialCard key={p.name} p={p} />)}
            </div>
          </section>
        )}

        {/* Quick jump pills */}
        <div style={{ display:'flex', gap:5, overflowX:'auto', scrollbarWidth:'none', paddingBottom:4, marginBottom:'3rem', flexWrap:'wrap' }}>
          {SECTIONS.filter(hasRegular).map(s => (
            <a key={s.id} href={`#${s.id}`} className="cat-pill">
              <span style={{ fontSize:13 }}>{s.emoji}</span> {s.title}
            </a>
          ))}
        </div>

        {/* ══ Group 1: Adult Industry ══ */}
        <div className="group-head" id="adult-industry">
          <p style={{ fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(197,160,90,0.5)', marginBottom:8 }}>✦ Adult Industry</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,3vw,30px)', fontWeight:400 }}>
            EU Adult Businesses
          </h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6, maxWidth:520, lineHeight:1.7 }}>
            Sex shops, webcam platforms, nightlife venues, massage directories and industry services — real businesses serving the same audience as SecretXperience.eu.
          </p>
        </div>

        {SECTIONS.filter(s => industryIds.includes(s.id) && hasRegular(s)).map(section => (
          <section key={section.id} id={section.id}>
            <div className="sec-label">
              <span style={{ fontSize:14 }}>{section.emoji}</span>
              {section.title}
              <span style={{ color:'rgba(255,255,255,0.12)', fontWeight:400 }}>— {section.items.filter(p => p.badge !== OFFICIAL).length}</span>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginBottom:'0.875rem', lineHeight:1.65 }}>{section.description}</p>
            <div className="p-grid">
              {section.items.filter(p => p.badge !== OFFICIAL).map(p => <PartnerCard key={p.name} p={p} />)}
            </div>
          </section>
        ))}

        {/* ══ Group 2: Lifestyle Affiliates ══ */}
        <div className="group-head" id="lifestyle">
          <p style={{ fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(197,160,90,0.5)', marginBottom:8 }}>✦ Lifestyle</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,3vw,30px)', fontWeight:400 }}>
            Lifestyle &amp; Affiliate Partners
          </h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6, maxWidth:520, lineHeight:1.7 }}>
            Lingerie, beauty, privacy tools, creator gear, travel and finance — brands that serve our audience's lifestyle with competitive affiliate commissions.
          </p>
        </div>

        {SECTIONS.filter(s => lifestyleIds.includes(s.id) && hasRegular(s)).map(section => (
          <section key={section.id} id={section.id}>
            <div className="sec-label">
              <span style={{ fontSize:14 }}>{section.emoji}</span>
              {section.title}
              <span style={{ color:'rgba(255,255,255,0.12)', fontWeight:400 }}>— {section.items.filter(p => p.badge !== OFFICIAL).length}</span>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', marginBottom:'0.875rem', lineHeight:1.65 }}>{section.description}</p>
            <div className="p-grid">
              {section.items.filter(p => p.badge !== OFFICIAL).map(p => <PartnerCard key={p.name} p={p} />)}
            </div>
          </section>
        ))}

        {/* ══ List your business CTA ══ */}
        <div style={{ marginTop:'5rem', padding:'2.5rem 2rem', background:'linear-gradient(135deg,#0e0c12,#120e08)', border:'0.5px solid rgba(197,160,90,0.12)', borderRadius:18, display:'flex', flexWrap:'wrap', gap:'2rem', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(197,160,90,0.5)', marginBottom:8 }}>✦ Get listed</p>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,3vw,30px)', fontWeight:400, marginBottom:8 }}>
              Want your business here?
            </h3>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', maxWidth:420, lineHeight:1.75 }}>
              We accept link exchanges, paid listings and affiliate-based partnerships for businesses that serve the adult services lifestyle. EU businesses prioritised. Includes placement in our newsletter and footer.
            </p>
          </div>
          <a
            href="mailto:heyokanaga@gmail.com?subject=Partner+listing+enquiry+—+SecretXperience.eu"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 26px', background:'linear-gradient(135deg,#c5a05a,#a0803d)', borderRadius:10, color:'#080808', fontSize:13, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}
          >
            <i className="ti ti-mail" /> Contact us →
          </a>
        </div>

        {/* Disclosure */}
        <p style={{ marginTop:'3rem', fontSize:10, color:'rgba(255,255,255,0.13)', textAlign:'center', lineHeight:1.8, maxWidth:640, margin:'3rem auto 0' }}>
          <strong style={{ color:'rgba(255,255,255,0.22)' }}>Disclosure:</strong> SecretXperience.eu participates in affiliate programmes. When you click a partner link and make a purchase, we may earn a commission at no additional cost to you. Links showing a network name are affiliate links — replace the URL with your tracking link from that network once approved. Non-affiliate links are link exchanges or paid directory listings.
        </p>
      </main>
    </div>
  )
}
