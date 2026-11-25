'use client'

import { BE_VENUES } from '../data/beNightlife'

// Editorial band under the Belgian venue directory: law in a nutshell, city
// guides with fun facts, first-visit tips and support links. Every fact links
// to where it comes from (researched 2026-11-25) — keep it that way when editing.

type Src = { label: string; url: string }

const LAW: { big: string; title: string; text: string; src: Src }[] = [
  { big: '2022', title: 'First in Europe', text: 'On 1 June 2022 Belgium removed sex work from the penal code, the first European country to decriminalise it.', src: { label: 'FPS Justice', url: 'https://www.justice.belgium.be/fr/themes/securite_et_criminalite/travail_du_sexe' } },
  { big: '2024', title: 'Employment contracts', text: 'Since 1 December 2024 sex workers can sign an employment contract, with social security, holidays and maternity leave: a world first.', src: { label: 'The Brussels Times', url: 'https://www.brusselstimes.com/belgium/1330298/sex-workers-protected-by-employment-contracts-from-december-tbtb/' } },
  { big: 'No', title: 'Always means no', text: 'The law also gives workers the right to refuse clients, choose their practices and stop at any time.', src: { label: 'WageIndicator', url: 'https://wageindicator.org/ai/work/collective-bargaining-agreement/updates/2024/belgium-sex-workers-gain-labour-rights-december-31-2024/' } },
  { big: '18+', title: 'Adults, by choice', text: 'Sex work is legal when both worker and client are over 18 and the worker acts freely; forced prostitution and trafficking are crimes.', src: { label: 'Zanzu', url: 'https://www.zanzu.be/en/prostitution-sex-work-0' } },
]

const CITIES: { city: string; filter: string; hue: string; icon: string; facts: { text: string; src: Src }[] }[] = [
  {
    city: 'Antwerp', filter: 'Antwerp', hue: '#e0577f', icon: 'ti-anchor',
    facts: [
      { text: 'Since 1 September 2019 the city has its own police regulation for sex businesses.', src: { label: 'City of Antwerp', url: 'https://antwerpen.be/assets-proxy/62258c29-6f8f-45eb-b786-2cdd54e8b9bc' } },
      { text: 'In 2024 Antwerp hosted Mystery Sensation, billed as Europe’s biggest swingers party: up to 10,000 guests, 4,000 m² and 25 themed rooms, location revealed 24 hours before.', src: { label: 'Belga', url: 'https://belganewsagency.eu/belgium-hosts-europes-biggest-swingers-party' } },
    ],
  },
  {
    city: 'Brussels', filter: 'Brussels', hue: '#c5a05a', icon: 'ti-building-arch',
    facts: [
      { text: 'UTSOPI, Belgium’s first organisation led by sex workers themselves, has been active since 2015 and is based in Schaerbeek.', src: { label: 'Cavaria', url: 'https://cavaria.be/verenigingen/utsopi' } },
      { text: 'The capital has the widest choice of saunas in the country, from a large sauna by Brussels-Midi to an old townhouse sauna near Madou.', src: { label: 'Petit Futé', url: 'https://www.petitfute.com/v69322-namur-5000/c9998-coquin' } },
    ],
  },
  {
    city: 'Ghent', filter: 'Ghent', hue: '#4fc3d9', icon: 'ti-spray',
    facts: [
      { text: 'The Werregarenstraatje, today the famous graffiti alley, was once a red-light street; artists have been spraying it daily since 1995.', src: { label: 'VRT NWS', url: 'https://www.vrt.be/vrtnws/nl/2024/07/09/giftshop-gent-brengt-oude-muren-van-graffitistraatje-weer-tot-le/' } },
      { text: 'A city walk tells the story of the "Roste Wasser", the woman who washed the lingerie of the ladies of the Glazen Straatje.', src: { label: 'VRT NWS', url: 'https://www.vrt.be/vrtnws/nl/2023/03/30/wandel-door-1-000-jaar-winkelgeschiedenis-in-gent-van-de-linger/' } },
    ],
  },
  {
    city: 'West Flanders', filter: 'Harelbeke', hue: '#b07cf0', icon: 'ti-confetti',
    facts: [
      { text: 'Acanthus in Harelbeke covers 2,500 m², one of the largest clubs in Europe, with two discos, an erotic cinema, a garden, saunas and eighteen themed rooms.', src: { label: 'VICE', url: 'https://www.vice.com/nl/article/een-blik-in-de-grootste-all-you-can-eat-parenclub-van-de-benelux-2/' } },
      { text: 'Its signature is the all-you-can-eat buffet, and its first house rule: touch no one without consent, no means no.', src: { label: 'VICE', url: 'https://www.vice.com/nl/article/een-blik-in-de-grootste-all-you-can-eat-parenclub-van-de-benelux-2/' } },
    ],
  },
  {
    city: 'Liège & Ardennes', filter: 'Liège', hue: '#e8684a', icon: 'ti-mountain',
    facts: [
      { text: 'Le Phénix in Barchon opened to bring back "a real libertine club" to the province after others closed during Covid.', src: { label: "L'Avenir", url: 'https://www.lavenir.net/regions/liege/blegny/2025/10/29/dans-les-coulisses-du-phenix-un-club-libertin-a-barchon-blegny-on-permet-a-des-gens-qui-se-sentent-tres-mal-dans-leur-corps-de-se-liberer-NPNFEXPXZRB63PPFY22PTC6VBU/' } },
      { text: 'In the Ardennes, Le Frisson turned a night into Versailles in April 2026 with a Philippe d’Orléans theme, couples €110 and no card payments.', src: { label: 'info.fr', url: 'https://info.fr/versailles-philippe-orleans-soiree-club-le-frisson-2026/' } },
    ],
  },
  {
    city: 'Kempen', filter: 'Balen', hue: '#5fc08a', icon: 'ti-door',
    facts: [
      { text: 'Eroxx in Balen once held an open day, clothes on, so the curious could see the disco and restaurant; one regular brought her mother.', src: { label: 'VRT NWS', url: 'https://www.vrt.be/vrtnws/nl/2025/08/24/eroxx-parenclub-balen-opendeurdag/' } },
    ],
  },
]

const TIPS: { icon: string; title: string; text: string; src?: Src }[] = [
  { icon: 'ti-hand-stop', title: 'Consent first', text: 'Nobody is entitled to anything, not even after paying the entrance. Ask, and take no for an answer.', src: { label: 'VICE', url: 'https://www.vice.com/en/article/sex-party-advice-tips-for-beginners/' } },
  { icon: 'ti-shirt', title: 'Check the dress code', text: 'Every club sets its own; fetish clubs are strict. Look at the website before you go.', src: { label: 'Dazed', url: 'https://www.dazeddigital.com/life-culture/article/39260/1/the-essential-guide-to-your-first-time-at-a-fetish-club' } },
  { icon: 'ti-device-mobile-off', title: 'Phone in the cloakroom', text: 'Discretion is the rule: no photos, no filming, phones stay in your locker.', src: { label: 'VICE', url: 'https://www.vice.com/en/article/the-etiquette-of-swingers-clubs/' } },
  { icon: 'ti-eye', title: 'Watching is fine', text: 'On a first visit just having a drink and looking around is perfectly normal. Go at your own pace.', src: { label: 'Rolling Out', url: 'https://rollingout.com/2024/12/25/how-to-join-swinger-club-married-couple' } },
  { icon: 'ti-users', title: 'Couples pay less', text: 'Single men usually pay the most and some nights are couples-only. Read the night’s rules first.', src: { label: 'Acanthus prices', url: 'https://www.acanthus.be/nl/events' } },
  { icon: 'ti-cash', title: 'Bring cash', text: 'Not every club takes cards; some themed nights are cash-only.', src: { label: 'info.fr', url: 'https://info.fr/versailles-philippe-orleans-soiree-club-le-frisson-2026/' } },
]

const LINKS: { name: string; text: string; url: string; icon: string }[] = [
  { name: 'UTSOPI', text: 'Belgian union of sex workers · Brussels, Liège, Ghent, Antwerp', url: 'https://www.facebook.com/utsopi', icon: 'ti-users-group' },
  { name: 'Violett', text: 'Medical and social support for sex workers in Flanders & Brussels', url: 'https://www.violett.be/en/about-violett/our-network/', icon: 'ti-heart-handshake' },
  { name: 'Espace P, Alias, Boysproject', text: 'Testing and support in Wallonia, Brussels and Antwerp · contacts on Zanzu', url: 'https://www.zanzu.be/en/prostitution-sex-work-0', icon: 'ti-stethoscope' },
  { name: 'FPS Justice: sex work', text: 'The official explainer on decriminalisation and your rights', url: 'https://www.justice.belgium.be/fr/themes/securite_et_criminalite/travail_du_sexe', icon: 'ti-scale' },
  { name: 'Medical information', text: 'STI testing, PrEP and anonymous health resources', url: '/medical', icon: 'ti-heart-rate-monitor' },
  { name: 'Regulation & rights', text: 'Sex work laws per country, taxes and support', url: '/regulations', icon: 'ti-gavel' },
]

const pick = (city: string) => {
  window.dispatchEvent(new CustomEvent('bev-city', { detail: city }))
  document.getElementById('bev-venues')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function BelgiumGuide() {
  const count = (c: string) => BE_VENUES.filter(v => v.city === c).length
  return (
    <section className="bg" aria-label="Belgium after dark guide">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <p className="bg-eyebrow">Guide · Belgium after dark</p>
      <h2 className="bg-h2">Good to <em>know</em></h2>

      <div className="bg-law">
        {LAW.map(l => (
          <div key={l.title} className="bg-law-card">
            <div className="bg-big">{l.big}</div>
            <div className="bg-law-title">{l.title}</div>
            <p>{l.text}</p>
            <a href={l.src.url} target="_blank" rel="noopener noreferrer nofollow" className="bg-src">{l.src.label} ↗</a>
          </div>
        ))}
      </div>

      <h3 className="bg-h3">City guide <span>· fun facts per region</span></h3>
      <div className="bg-cities">
        {CITIES.map(c => (
          <article key={c.city} className="bg-city" style={{ ['--hue' as string]: c.hue }}>
            <header>
              <span className="bg-city-ic"><i className={`ti ${c.icon}`} aria-hidden="true" /></span>
              <span className="bg-city-name">{c.city}</span>
              {count(c.filter) > 0 && (
                <button type="button" className="bg-city-btn" onClick={() => pick(c.filter)}>{count(c.filter)} {count(c.filter) === 1 ? 'venue' : 'venues'} →</button>
              )}
            </header>
            <ul>
              {c.facts.map((f, i) => (
                <li key={i}>{f.text} <a href={f.src.url} target="_blank" rel="noopener noreferrer nofollow" className="bg-src">{f.src.label}</a></li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3 className="bg-h3">First time? <span>· tips & tricks</span></h3>
      <div className="bg-tips">
        {TIPS.map(t => (
          <div key={t.title} className="bg-tip">
            <i className={`ti ${t.icon}`} aria-hidden="true" />
            <div>
              <div className="bg-tip-title">{t.title}</div>
              <p>{t.text} {t.src && <a href={t.src.url} target="_blank" rel="noopener noreferrer nofollow" className="bg-src">{t.src.label}</a>}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="bg-h3">Useful links <span>· support & information</span></h3>
      <div className="bg-links">
        {LINKS.map(l => (
          <a key={l.name} href={l.url} {...(l.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})} className="bg-link">
            <i className={`ti ${l.icon}`} aria-hidden="true" />
            <span><strong>{l.name}</strong><small>{l.text}</small></span>
            <i className="ti ti-arrow-up-right bg-link-arrow" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  )
}

const CSS = `
.bg{max-width:1200px;margin:0 auto;padding:1rem 1.5rem 4rem;color:#f1ece4;font-family:var(--sans,'Poppins',sans-serif)}
.bg-eyebrow{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(197,160,90,.8);margin:0 0 10px}
.bg-h2{font-family:var(--serif,'Cormorant Garamond',serif);font-weight:400;font-size:clamp(28px,4vw,42px);margin:0 0 1.4rem;line-height:1.05}
.bg-h2 em{color:#c5a05a}
.bg-h3{font-family:var(--serif,'Cormorant Garamond',serif);font-weight:400;font-size:clamp(22px,3vw,30px);margin:2.6rem 0 1rem}
.bg-h3 span{font-family:var(--sans,'Poppins',sans-serif);font-size:12px;letter-spacing:.08em;color:rgba(241,236,228,.45)}
.bg-src{font-size:10.5px;color:#c5a05a;text-decoration:none;white-space:nowrap;opacity:.85}
.bg-src:hover{opacity:1;text-decoration:underline}
.bg-law{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));gap:12px}
.bg-law-card{position:relative;overflow:hidden;padding:18px 18px 16px;border-radius:18px;background:linear-gradient(160deg,rgba(197,160,90,.14),rgba(17,13,19,.9) 60%);border:.5px solid rgba(197,160,90,.25)}
.bg-big{font-family:var(--serif,'Cormorant Garamond',serif);font-size:44px;line-height:1;color:#c5a05a}
.bg-law-title{font-weight:600;font-size:14px;margin:6px 0 4px}
.bg-law-card p{font-size:12.5px;line-height:1.6;color:rgba(241,236,228,.68);margin:0 0 8px}
.bg-cities{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:14px}
.bg-city{padding:16px 18px;border-radius:18px;background:#120e15;border:.5px solid rgba(255,255,255,.08);border-top:2px solid var(--hue)}
.bg-city header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.bg-city-ic{width:36px;height:36px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--hue) 18%,transparent);color:var(--hue);font-size:19px;flex-shrink:0}
.bg-city-name{font-family:var(--serif,'Cormorant Garamond',serif);font-size:22px;flex:1}
.bg-city-btn{padding:6px 12px;border-radius:20px;border:.5px solid var(--hue);background:transparent;color:var(--hue);font:600 11.5px var(--sans,'Poppins',sans-serif);cursor:pointer;white-space:nowrap}
.bg-city ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px}
.bg-city li{font-size:12.8px;line-height:1.65;color:rgba(241,236,228,.75);padding-left:16px;position:relative}
.bg-city li::before{content:'';position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:var(--hue)}
.bg-tips{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:12px}
.bg-tip{display:flex;gap:12px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.03);border:.5px solid rgba(255,255,255,.08)}
.bg-tip>i{font-size:22px;color:#e0577f;margin-top:2px}
.bg-tip-title{font-weight:600;font-size:13.5px;margin-bottom:3px}
.bg-tip p{margin:0;font-size:12.5px;line-height:1.6;color:rgba(241,236,228,.68)}
.bg-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:10px}
.bg-link{display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:14px;text-decoration:none;color:inherit;background:#120e15;border:.5px solid rgba(197,160,90,.2);transition:border-color .15s,transform .15s}
.bg-link:hover{border-color:#c5a05a;transform:translateY(-2px)}
.bg-link>i:first-child{font-size:22px;color:#c5a05a}
.bg-link span{flex:1;min-width:0;display:flex;flex-direction:column}
.bg-link strong{font-size:13.5px}
.bg-link small{font-size:11.5px;color:rgba(241,236,228,.55);line-height:1.45}
.bg-link-arrow{color:rgba(241,236,228,.35)}
@media(max-width:640px){.bg{padding:.5rem 1rem 3rem}.bg-big{font-size:36px}}
`
