import Link from 'next/link'
import { CURRENT_MODEL, MODELS, type ModelLink } from '../data/modelOfTheMonth'

const m = CURRENT_MODEL

export const metadata = {
  title: `${m.name} — ${m.headline} | SecretXperience`,
  description: m.intro,
  alternates: { canonical: 'https://www.secretxperience.eu/model-of-the-month' },
  openGraph: {
    title: `${m.name} — ${m.headline}`,
    description: m.intro,
    url: 'https://www.secretxperience.eu/model-of-the-month',
    type: 'article',
  },
}

const GOLD = '#c5a05a'
const ICON: Record<ModelLink['kind'], string> = {
  links: 'ti-link',
  onlyfans: 'ti-lock',
  instagram: 'ti-brand-instagram',
  x: 'ti-brand-x',
}

const CSS = `
  .mom a { text-decoration:none; }
  .mom-hero { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); gap:3rem; align-items:center; }
  .mom-cover { border-radius:18px; overflow:hidden; border:0.5px solid rgba(197,160,90,0.35); box-shadow:0 20px 60px rgba(0,0,0,0.55); aspect-ratio:4/3.6; }
  .mom-cover img, .mom-g img { width:100%; height:100%; object-fit:cover; display:block; }
  .mom-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 20px; border-radius:10px; font:600 13px var(--sans,'Poppins',sans-serif); letter-spacing:.03em; transition:transform .15s, border-color .15s, background .15s; }
  .mom-btn:hover { transform:translateY(-2px); }
  .mom-btn-gold { background:${GOLD}; color:#0a0a0a; }
  .mom-btn-ghost { border:0.5px solid rgba(197,160,90,0.45); color:${GOLD}; }
  .mom-btn-ghost:hover { border-color:${GOLD}; background:rgba(197,160,90,0.08); }
  .mom-gallery { display:grid; grid-template-columns:minmax(0,0.8fr) minmax(0,1.4fr); gap:14px; align-items:start; }
  .mom-g { border-radius:14px; overflow:hidden; border:0.5px solid rgba(255,255,255,0.08); }
  .mom-g-portrait { aspect-ratio:3/4; } .mom-g-landscape { aspect-ratio:4/3; } .mom-g-square { aspect-ratio:1; }
  .mom-story p { font-size:15px; line-height:1.85; color:rgba(255,255,255,0.68); margin:0 0 1.2rem; }
  @media(max-width:900px){ .mom-hero{grid-template-columns:1fr; gap:2rem} .mom-gallery{grid-template-columns:1fr} }
`

export default function ModelOfTheMonthPage() {
  const past = MODELS.slice(1)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${m.name} — ${m.headline}`,
    description: m.intro,
    image: `https://www.secretxperience.eu${m.cover}`,
    about: { '@type': 'Person', name: m.name, sameAs: m.links.map(l => l.url) },
    publisher: { '@type': 'Organization', name: 'SecretXperience', url: 'https://www.secretxperience.eu' },
  }

  return (
    <div className="mom" style={{ background: '#080608', minHeight: '100vh', color: '#ece8e1', fontFamily: "'Poppins', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="sx-subnav" style={{ position: 'sticky', top: 0, zIndex: 100, height: 54, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,6,8,0.97)', borderBottom: '0.5px solid rgba(197,160,90,0.08)', backdropFilter: 'blur(18px)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: GOLD, fontStyle: 'italic' }}>
          Secret<em style={{ fontStyle: 'normal' }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/creators" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Creators</Link>
          <Link href="/" className="sx-hide-sm" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>← Home</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <section className="mom-hero" style={{ marginBottom: '4rem' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.7)', margin: '0 0 14px' }}>
              ✦ Model of the Month · {m.month}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.avatar} alt="" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${GOLD}` }} />
              <div>
                <div translate="no" className="notranslate" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, lineHeight: 1 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>🇧🇪 {m.country} · Verified creator</div>
              </div>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 400, lineHeight: 1.06, margin: '0 0 1.1rem' }}>
              Belgian Adult Performance <em style={{ color: GOLD, fontStyle: 'italic' }}>Model of the Month</em>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 0 1.8rem' }}>{m.intro}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {m.links.map((l, i) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer nofollow" className={`mom-btn ${i === 0 ? 'mom-btn-gold' : 'mom-btn-ghost'}`}>
                  <i className={`ti ${ICON[l.kind]}`} aria-hidden="true" /> {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="mom-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.cover} alt={`${m.name}, ${m.headline}`} />
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', maxWidth: 720, margin: '0 auto 4rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.7)', margin: '0 0 10px' }}>The story</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 400, margin: '0 0 1.4rem' }}>
            Meet <em translate="no" className="notranslate" style={{ color: GOLD }}>{m.name}</em>
          </h2>
          <div className="mom-story">{m.story.map((p, i) => <p key={i}>{p}</p>)}</div>
          {m.quote && (
            <blockquote style={{ margin: '1rem 0 0', padding: '1.2rem 1.5rem', borderLeft: `2px solid ${GOLD}`, background: 'rgba(197,160,90,0.05)', borderRadius: '0 12px 12px 0', fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontStyle: 'italic', color: '#f1e6cf' }}>
              “{m.quote}” <span style={{ fontFamily: "'Poppins',sans-serif", fontStyle: 'normal', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>— {m.name}</span>
            </blockquote>
          )}
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.7)', margin: '0 0 14px' }}>Gallery</p>
          <div className="mom-gallery">
            {m.photos.filter(p => p.src !== m.cover).map(p => (
              <div key={p.src} className={`mom-g mom-g-${p.shape}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '2.6rem 1.5rem', borderRadius: 18, border: '0.5px solid rgba(197,160,90,0.3)', background: 'radial-gradient(ellipse at 50% 0%, rgba(197,160,90,0.12), transparent 70%)', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, margin: '0 0 .6rem' }}>
            Watch her <em style={{ color: GOLD }}>videos</em>
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 1.4rem', lineHeight: 1.7 }}>
            Her photos and videos live on her own channels. Subscribe directly — every subscription goes to her.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {m.links.map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer nofollow" className="mom-btn mom-btn-ghost">
                <i className={`ti ${ICON[l.kind]}`} aria-hidden="true" /> {l.label}
              </a>
            ))}
          </div>
        </section>

        {past.length > 0 && (
          <section>
            <p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.7)', margin: '0 0 14px' }}>Past spotlights</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {past.map(p => (
                <a key={p.slug} href={p.links[0]?.url} target="_blank" rel="noopener noreferrer nofollow" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px', borderRadius: 30, border: '0.5px solid rgba(197,160,90,0.3)', color: '#ece8e1', fontSize: 13 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                  <span translate="no" className="notranslate">{p.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>{p.month}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '3rem' }}>
          Are you a Belgian creator? <Link href="/advertise" style={{ color: GOLD }}>Get featured →</Link>
        </p>
      </main>
    </div>
  )
}
