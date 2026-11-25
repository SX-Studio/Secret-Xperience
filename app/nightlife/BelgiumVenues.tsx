'use client'

import { useMemo, useState } from 'react'
import { BE_TYPES, BE_VENUES, type BeType, type BeVenue } from '../data/beNightlife'

export interface AgendaEvent {
  id: string
  title: string
  venue_name: string | null
  city: string | null
  date_start: string
  time_start: string | null
  website: string | null
  image_url: string | null
}

const TYPE_STYLE: Record<BeType, { icon: string; hue: string; short: string }> = {
  'Private bars & clubs': { icon: 'ti-glass-cocktail', hue: '#c5a05a', short: 'Private bar' },
  'Swingers clubs': { icon: 'ti-key', hue: '#e0577f', short: 'Swingers' },
  'Saunas & massage': { icon: 'ti-droplet', hue: '#4fc3d9', short: 'Sauna' },
  'Strip clubs': { icon: 'ti-sparkles', hue: '#b07cf0', short: 'Strip club' },
  Fetish: { icon: 'ti-lock', hue: '#e8684a', short: 'Fetish' },
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

interface AgendaItem { key: string; title: string; venue: string; city: string; time?: string; type?: BeType; url?: string; oneOff: boolean }

function buildAgenda(events: AgendaEvent[], days: number) {
  const out: { date: Date; items: AgendaItem[] }[] = []
  const start = new Date(); start.setHours(0, 0, 0, 0)
  for (let i = 0; i < days; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    const key = iso(d)
    const items: AgendaItem[] = []
    for (const e of events) {
      if (e.date_start === key) items.push({ key: e.id, title: e.title, venue: e.venue_name || '', city: e.city || '', time: e.time_start || undefined, url: e.website || undefined, oneOff: true })
    }
    for (const v of BE_VENUES) {
      for (const n of v.nights || []) {
        if (n.day === d.getDay()) items.push({ key: `${v.slug}-${key}-${n.title}`, title: n.title, venue: v.name, city: v.city, time: n.from ? `${n.from}${n.to ? `–${n.to}` : ''}` : undefined, type: v.type, url: v.website, oneOff: false })
      }
    }
    out.push({ date: d, items })
  }
  return out
}

function VenueCard({ v }: { v: BeVenue }) {
  const st = TYPE_STYLE[v.type]
  const [imgOk, setImgOk] = useState(!!v.image)
  const Tag = v.website ? 'a' : 'div'
  return (
    <Tag
      {...(v.website ? { href: v.website, target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
      className="bev-card"
      style={{ ['--hue' as string]: st.hue }}
    >
      <div className="bev-media">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.image} alt={v.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <div className="bev-ph"><i className={`ti ${st.icon}`} aria-hidden="true" /></div>
        )}
        <span className="bev-pill"><i className={`ti ${st.icon}`} aria-hidden="true" /> {v.label || st.short}</span>
        {!!v.nights?.length && <span className="bev-live">Regular nights</span>}
      </div>
      <div className="bev-body">
        <div className="bev-name" translate="no">{v.name}</div>
        <div className="bev-city"><i className="ti ti-map-pin" aria-hidden="true" /> {v.address || v.city}</div>
        {v.note && <p className="bev-note">{v.note}</p>}
        {v.hours && <div className="bev-hours"><i className="ti ti-clock" aria-hidden="true" /> {v.hours}</div>}
        {!!v.tags?.length && <div className="bev-tags">{v.tags.map(t => <span key={t}>{t}</span>)}</div>}
        <span className="bev-cta">{v.website ? <>Visit website <i className="ti ti-arrow-up-right" aria-hidden="true" /></> : 'Website coming soon'}</span>
      </div>
    </Tag>
  )
}

export default function BelgiumVenues({ events }: { events: AgendaEvent[] }) {
  const [type, setType] = useState<BeType | 'All'>('All')
  const [city, setCity] = useState<string>('All')
  const [showAll, setShowAll] = useState(false)

  const cities = useMemo(() => {
    const count: Record<string, number> = {}
    for (const v of BE_VENUES) count[v.city] = (count[v.city] || 0) + 1
    return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([c]) => c)
  }, [])

  const list = useMemo(() => BE_VENUES
    .filter(v => (type === 'All' || v.type === type) && (city === 'All' || v.city === city))
    .sort((a, b) => Number(!!b.image) - Number(!!a.image) || Number(!!b.nights?.length) - Number(!!a.nights?.length) || a.name.localeCompare(b.name)), [type, city])

  const agenda = useMemo(() => buildAgenda(events, 14), [events])
  const agendaDays = agenda.filter(d => d.items.length)
  const shown = showAll ? list : list.slice(0, 24)

  return (
    <section className="bev" aria-label="Belgian nightlife venues">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="bev-head">
        <p className="bev-eyebrow">🇧🇪 Belgium · {BE_VENUES.length} venues</p>
        <h2 className="bev-h2">Private bars, clubs, saunas <em>&amp; strip clubs</em></h2>
        <p className="bev-lead">Swingers clubs, private bars, saunas, strip and fetish clubs across Belgium, with their regular nights in one agenda. Each card links to the venue&apos;s own website.</p>
      </div>

      {/* ── Agenda ── */}
      <div className="bev-agenda">
        <div className="bev-agenda-head">
          <h3><i className="ti ti-calendar-event" aria-hidden="true" /> Agenda · next 14 days</h3>
          <span>Theme nights and regular club nights</span>
        </div>
        {agendaDays.length === 0 ? (
          <p className="bev-empty">No nights announced for the next two weeks yet.</p>
        ) : (
          <div className="bev-days">
            {agendaDays.map(d => (
              <div key={iso(d.date)} className="bev-day">
                <div className="bev-date">
                  <span className="bev-dow">{DAY[d.date.getDay()]}</span>
                  <span className="bev-dnum">{d.date.getDate()}</span>
                  <span className="bev-mon">{MONTH[d.date.getMonth()]}</span>
                </div>
                <div className="bev-items">
                  {d.items.map(it => {
                    const hue = it.type ? TYPE_STYLE[it.type].hue : '#c5a05a'
                    const body = (
                      <>
                        <span className="bev-dot" style={{ background: hue }} />
                        <span className="bev-it-main">
                          <span className="bev-it-title">{it.title}{it.oneOff && <em> · special</em>}</span>
                          <span className="bev-it-sub" translate="no">{it.venue}{it.city ? ` · ${it.city}` : ''}{it.time ? ` · ${it.time}` : ''}</span>
                        </span>
                      </>
                    )
                    return it.url
                      ? <a key={it.key} href={it.url} target="_blank" rel="noopener noreferrer nofollow" className="bev-it">{body}</a>
                      : <div key={it.key} className="bev-it">{body}</div>
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="bev-fine">Regular nights follow each venue&apos;s published weekly schedule; check the venue&apos;s site before you go. Running a venue? <a href="/contact">Send us your events →</a></p>
      </div>

      {/* ── Filters ── */}
      <div className="bev-filters">
        <div className="bev-chips" role="tablist" aria-label="Type">
          {(['All', ...BE_TYPES] as const).map(t => (
            <button key={t} type="button" className={`bev-chip${type === t ? ' on' : ''}`} onClick={() => { setType(t); setShowAll(false) }}>
              {t !== 'All' && <i className={`ti ${TYPE_STYLE[t].icon}`} aria-hidden="true" />} {t}
            </button>
          ))}
        </div>
        <div className="bev-chips bev-cities" aria-label="City">
          {['All', ...cities].map(c => (
            <button key={c} type="button" className={`bev-city-chip${city === c ? ' on' : ''}`} onClick={() => { setCity(c); setShowAll(false) }}>{c === 'All' ? 'All cities' : c}</button>
          ))}
        </div>
      </div>

      <div className="bev-count">{list.length} {list.length === 1 ? 'venue' : 'venues'}</div>
      <div className="bev-grid">
        {shown.map(v => <VenueCard key={v.slug} v={v} />)}
      </div>
      {list.length > shown.length && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button type="button" className="bev-more" onClick={() => setShowAll(true)}>Show all {list.length} venues</button>
        </div>
      )}
      <p className="bev-fine" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Independent venues, 18+ only. Details from public sources and the venues&apos; own sites. Owner of a venue? <a href="/contact">Update or remove your listing</a>.
      </p>
    </section>
  )
}

const CSS = `
.bev{max-width:1200px;margin:0 auto;padding:3rem 1.5rem 4rem;color:#f1ece4;font-family:var(--sans,'Poppins',sans-serif)}
.bev-eyebrow{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(197,160,90,.8);margin:0 0 10px}
.bev-h2{font-family:var(--serif,'Cormorant Garamond',serif);font-weight:400;font-size:clamp(28px,4.4vw,46px);line-height:1.05;margin:0 0 12px}
.bev-h2 em{color:#c5a05a;font-style:italic}
.bev-lead{font-size:14px;line-height:1.75;color:rgba(241,236,228,.6);max-width:640px;margin:0 0 2rem}
.bev-agenda{border-radius:20px;padding:1.4rem 1.4rem 1.1rem;margin-bottom:2.4rem;background:linear-gradient(135deg,rgba(224,87,127,.10),rgba(197,160,90,.06) 55%,rgba(79,195,217,.06));border:.5px solid rgba(255,255,255,.10)}
.bev-agenda-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 16px;margin-bottom:1rem}
.bev-agenda-head h3{margin:0;font:600 15px var(--sans,'Poppins',sans-serif);letter-spacing:.02em;display:flex;align-items:center;gap:8px}
.bev-agenda-head h3 i{color:#e0577f;font-size:18px}
.bev-agenda-head span{font-size:12px;color:rgba(241,236,228,.45)}
.bev-days{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;scrollbar-width:thin}
.bev-day{flex:0 0 min(260px,78%);scroll-snap-align:start;display:flex;gap:12px;padding:12px;border-radius:14px;background:rgba(8,6,10,.55);border:.5px solid rgba(255,255,255,.08)}
.bev-date{flex:0 0 48px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:2px}
.bev-dow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(241,236,228,.5)}
.bev-dnum{font-family:var(--serif,'Cormorant Garamond',serif);font-size:30px;line-height:1;color:#fff}
.bev-mon{font-size:10.5px;color:#c5a05a;letter-spacing:.08em;text-transform:uppercase}
.bev-items{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.bev-it{display:flex;gap:8px;align-items:flex-start;text-decoration:none;color:inherit;padding:6px 8px;border-radius:10px;transition:background .15s}
a.bev-it:hover{background:rgba(255,255,255,.06)}
.bev-dot{flex:0 0 8px;height:8px;border-radius:50%;margin-top:6px}
.bev-it-main{min-width:0;display:flex;flex-direction:column}
.bev-it-title{font-size:13px;font-weight:600;line-height:1.35}
.bev-it-title em{font-style:normal;color:#e0577f;font-weight:600}
.bev-it-sub{font-size:11.5px;color:rgba(241,236,228,.55);line-height:1.4;overflow:hidden;text-overflow:ellipsis}
.bev-empty{font-size:13px;color:rgba(241,236,228,.5);margin:.25rem 0 .5rem}
.bev-fine{font-size:11px;color:rgba(241,236,228,.38);margin:.9rem 0 0;line-height:1.6}
.bev-fine a{color:#c5a05a;text-decoration:none}
.bev-filters{display:flex;flex-direction:column;gap:10px;margin-bottom:1rem}
.bev-chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.bev-chips::-webkit-scrollbar{display:none}
.bev-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:30px;border:.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);color:rgba(241,236,228,.75);font:500 13px var(--sans,'Poppins',sans-serif);cursor:pointer;transition:all .15s}
.bev-chip.on{background:#f1ece4;color:#0b090c;border-color:#f1ece4}
.bev-city-chip{flex-shrink:0;padding:6px 12px;border-radius:20px;border:.5px solid rgba(197,160,90,.25);background:transparent;color:rgba(241,236,228,.6);font:500 12px var(--sans,'Poppins',sans-serif);cursor:pointer}
.bev-city-chip.on{border-color:#c5a05a;color:#c5a05a;background:rgba(197,160,90,.1)}
.bev-count{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(241,236,228,.4);margin:0 0 .8rem}
.bev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr));gap:16px}
.bev-card{display:flex;flex-direction:column;text-decoration:none;color:inherit;border-radius:18px;overflow:hidden;background:#110d13;border:.5px solid rgba(255,255,255,.08);transition:transform .18s,border-color .18s,box-shadow .18s}
.bev-card:hover{transform:translateY(-3px);border-color:var(--hue);box-shadow:0 14px 34px rgba(0,0,0,.45)}
.bev-media{position:relative;aspect-ratio:4/3;overflow:hidden;background:#1a141c}
.bev-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
.bev-card:hover .bev-media img{transform:scale(1.05)}
.bev-media::after{content:'';position:absolute;inset:auto 0 0 0;height:45%;background:linear-gradient(transparent,rgba(17,13,19,.85));pointer-events:none}
.bev-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 30% 25%,color-mix(in srgb,var(--hue) 45%,transparent),transparent 60%),radial-gradient(circle at 80% 85%,color-mix(in srgb,var(--hue) 22%,transparent),transparent 55%),#16111a}
.bev-ph i{font-size:54px;color:color-mix(in srgb,var(--hue) 85%,#fff);opacity:.85}
.bev-pill{position:absolute;top:12px;left:12px;z-index:1;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;background:rgba(10,8,12,.72);backdrop-filter:blur(8px);color:#fff;font:600 11px var(--sans,'Poppins',sans-serif);border:.5px solid color-mix(in srgb,var(--hue) 60%,transparent)}
.bev-pill i{color:var(--hue)}
.bev-live{position:absolute;top:12px;right:12px;z-index:1;padding:5px 10px;border-radius:20px;background:#e0577f;color:#fff;font:700 10px var(--sans,'Poppins',sans-serif);letter-spacing:.06em;text-transform:uppercase}
.bev-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.bev-name{font-family:var(--serif,'Cormorant Garamond',serif);font-size:22px;line-height:1.1;color:#fff}
.bev-city{font-size:12px;color:rgba(241,236,228,.55);display:flex;gap:5px;align-items:flex-start}
.bev-city i,.bev-hours i{color:var(--hue);margin-top:2px}
.bev-note{font-size:12.5px;line-height:1.6;color:rgba(241,236,228,.7);margin:2px 0 0}
.bev-hours{font-size:11.5px;color:rgba(241,236,228,.6);display:flex;gap:5px;align-items:flex-start}
.bev-tags{display:flex;flex-wrap:wrap;gap:5px}
.bev-tags span{font-size:10.5px;padding:3px 8px;border-radius:12px;background:rgba(255,255,255,.06);color:rgba(241,236,228,.7)}
.bev-cta{margin-top:auto;padding-top:8px;font:600 12px var(--sans,'Poppins',sans-serif);color:var(--hue);display:inline-flex;align-items:center;gap:4px}
.bev-more{padding:12px 26px;border-radius:12px;border:.5px solid rgba(197,160,90,.5);background:transparent;color:#c5a05a;font:600 13px var(--sans,'Poppins',sans-serif);cursor:pointer}
@media(max-width:640px){
  .bev{padding:2rem 1rem 3rem}
  .bev-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .bev-body{padding:10px 11px 12px}
  .bev-name{font-size:18px}
  .bev-note{display:none}
  .bev-pill{top:8px;left:8px;padding:4px 8px;font-size:10px}
  .bev-live{display:none}
  .bev-ph i{font-size:40px}
}
`
