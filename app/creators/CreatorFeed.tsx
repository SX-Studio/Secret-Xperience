'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

export interface Post {
  id: string
  caption: string | null
  media_url: string | null
  media_type: string
  created_at: string
  creator: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
    verified: boolean
    external_links: { label: string; url: string }[] | null
  } | null
}

type Creator = NonNullable<Post['creator']>
type Entry = { c: Creator; created_at: string; media: string }

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const TWO_HOURS = 2 * 60 * 60 * 1000
const BROWSE = [
  { key: 'all', label: 'All creators', icon: '✦' },
  { key: 'photo', label: 'Photos', icon: '▤' },
  { key: 'video', label: 'Video', icon: '▷' },
] as const

function Card({ e, i }: { e: Entry; i: number }) {
  const c = e.c
  const name = c.full_name || c.username || 'Creator'
  const href = c.username ? `/c/${c.username}` : `/profile/${c.id}`
  return (
    <Link href={href} className="cf-card" style={{ animationDelay: `${Math.min(i, 16) * 45}ms` }}>
      <span className="cf-tag">NEW</span>
      <span className="cf-fav">♡</span>
      <div className="cf-ph" style={c.avatar_url ? { backgroundImage: `url(${c.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {!c.avatar_url && name.slice(0, 1).toUpperCase()}
      </div>
      <div className="cf-ov" />
      <div className="cf-meta">
        <div className="cf-nm">{name} {c.verified && <i className="ti ti-rosette-discount-check-filled" style={{ fontSize: '13px', color: 'var(--goldd)' }} />}</div>
        <div className="cf-sub">Posted {timeAgo(e.created_at)}</div>
      </div>
    </Link>
  )
}

export default function CreatorFeed({ posts }: { posts: Post[] }) {
  const [allPosts, setAllPosts] = useState<Post[]>(posts)
  const [q, setQ] = useState('')
  const [browse, setBrowse] = useState<'all' | 'photo' | 'video'>('all')
  const [sort, setSort] = useState<'new' | 'az'>('new')
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    let alive = true
    const supabase = createClient()
    const load = async () => {
      try {
        const { data } = await supabase
          .from('creator_posts')
          .select('id, caption, media_url, media_type, created_at, creator:profiles!creator_id(id, full_name, username, avatar_url, verified, external_links)')
          .eq('active', true).order('created_at', { ascending: false }).limit(200)
        if (alive && Array.isArray(data) && data.length) setAllPosts(data as unknown as Post[])
      } catch { /* keep current */ }
    }
    load()
    const iv = setInterval(() => { setNow(Date.now()); load() }, 60000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  const creators = useMemo(() => {
    const map = new Map<string, Entry>()
    for (const p of allPosts) {
      if (!p.creator) continue
      if (!map.has(p.creator.id)) map.set(p.creator.id, { c: p.creator, created_at: p.created_at, media: p.media_type || 'image' })
    }
    return Array.from(map.values())
  }, [allPosts])

  const term = q.trim().toLowerCase()
  let shown = creators.filter(({ c, created_at, media }) => {
    if (browse === 'photo' && media === 'video') return false
    if (browse === 'video' && media !== 'video') return false
    if (term) return (c.username || '').toLowerCase().includes(term) || (c.full_name || '').toLowerCase().includes(term)
    return now - new Date(created_at).getTime() <= TWO_HOURS
  })
  shown = sort === 'az'
    ? [...shown].sort((a, b) => (a.c.full_name || a.c.username || '').localeCompare(b.c.full_name || b.c.username || ''))
    : [...shown].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

  return (
    <div className="cf">
      <style dangerouslySetInnerHTML={{ __html: `
        .cf-main{display:grid;grid-template-columns:210px 1fr;gap:22px}
        .cf-rail{position:sticky;top:78px;align-self:start;padding:16px;background:var(--bg2);border:.5px solid var(--b);border-radius:20px;backdrop-filter:blur(16px)}
        .cf-rail h4{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--t3);margin:0 0 10px}
        .cf-rail button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;border-radius:12px;color:var(--t2);font:500 13.5px var(--sans);background:none;border:.5px solid transparent;cursor:pointer;margin-bottom:3px;transition:.15s}
        .cf-rail button:hover{color:var(--t)}
        .cf-rail button.on{background:linear-gradient(135deg,rgba(139,108,240,.2),rgba(75,224,208,.14));color:var(--t);border-color:var(--gbrd)}
        .cf-rail .ic{width:16px;text-align:center}
        .cf-search{display:flex;align-items:center;gap:12px;height:52px;padding:0 18px;border-radius:16px;background:var(--bg2);border:.5px solid var(--b);backdrop-filter:blur(16px);margin-bottom:18px}
        .cf-search input{flex:1;background:none;border:none;outline:none;color:var(--t);font-size:15px;font-family:var(--sans)}
        .cf-search input::placeholder{color:var(--t3)}
        .cf-search .x{background:none;border:none;color:var(--t3);cursor:pointer;font-size:15px}
        .cf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
        .cf-card{position:relative;display:block;aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:.5px solid var(--b);
          background:linear-gradient(160deg,#211a3a,#0c0a1a);text-decoration:none;color:inherit;
          transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .28s;opacity:0;transform:translateX(-20px);animation:cfIn .5s cubic-bezier(.2,.7,.2,1) forwards}
        @keyframes cfIn{to{opacity:1;transform:none}}
        .cf-card:hover{transform:translateY(-8px);box-shadow:0 22px 54px -22px var(--gold),0 0 0 1px var(--goldd)}
        .cf-card::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);transform:translateX(-120%);transition:transform .6s ease;pointer-events:none}
        .cf-card:hover::after{transform:translateX(120%)}
        .cf-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:50px;color:rgba(139,108,240,.6)}
        .cf-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,6,16,.86),transparent 55%)}
        .cf-meta{position:absolute;left:0;right:0;bottom:0;padding:13px;z-index:2}
        .cf-nm{font-size:13.5px;font-weight:600;display:flex;align-items:center;gap:5px;color:#fff}
        .cf-sub{font-size:11px;color:var(--t2);margin-top:2px}
        .cf-tag{position:absolute;top:10px;left:10px;z-index:2;font-size:9px;font-weight:700;letter-spacing:.05em;padding:4px 9px;border-radius:999px;background:linear-gradient(120deg,var(--gold),var(--goldd));color:#0a0714;animation:cfPulse 1.8s ease-in-out infinite}
        @keyframes cfPulse{0%,100%{box-shadow:0 0 0 0 rgba(75,224,208,.5)}50%{box-shadow:0 0 12px 1px rgba(75,224,208,.5)}}
        .cf-fav{position:absolute;top:9px;right:9px;z-index:2;width:30px;height:30px;border-radius:50%;background:rgba(8,6,16,.5);backdrop-filter:blur(8px);border:.5px solid var(--b);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--t)}
        .cf-empty{text-align:center;padding:2.6rem 1.5rem;background:var(--bg2);border:.5px solid var(--b);border-radius:18px;backdrop-filter:blur(16px)}
        @media(max-width:860px){.cf-main{grid-template-columns:1fr}.cf-rail{position:static;display:flex;flex-wrap:wrap;gap:8px}.cf-rail h4{display:none}.cf-rail button{width:auto}}
        @media(prefers-reduced-motion:reduce){.cf-card{animation:none;opacity:1;transform:none}.cf-tag{animation:none}.cf-card::after{display:none}}
      ` }} />

      <div className="cf-main">
        <aside className="cf-rail">
          <h4>Browse</h4>
          {BROWSE.map(b => (
            <button key={b.key} className={browse === b.key ? 'on' : ''} onClick={() => setBrowse(b.key)}>
              <span className="ic">{b.icon}</span> {b.label}
            </button>
          ))}
          <h4 style={{ marginTop: '14px' }}>Sort</h4>
          <button className={sort === 'new' ? 'on' : ''} onClick={() => setSort('new')}><span className="ic">↳</span> Newest</button>
          <button className={sort === 'az' ? 'on' : ''} onClick={() => setSort('az')}><span className="ic">A</span> A–Z</button>
        </aside>

        <div>
          <div className="cf-search">
            <i className="ti ti-search" style={{ color: 'var(--t3)', fontSize: '16px' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search creators by username…" aria-label="Search creators by username" />
            {q && <button className="x" onClick={() => setQ('')} aria-label="Clear">✕</button>}
          </div>

          {shown.length === 0 ? (
            <div className="cf-empty">
              <div style={{ fontSize: '28px', marginBottom: '.5rem' }}>✦</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '.35rem' }}>{term ? 'No creator found' : 'No new creators right now'}</div>
              <p style={{ fontSize: '13.5px', color: 'var(--t3)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.6 }}>
                {term ? 'Try another username.' : 'Creators appear here for 2 hours after they post. Check back soon.'}
              </p>
            </div>
          ) : (
            <div className="cf-grid">
              {shown.map((e, i) => <Card key={e.c.id} e={e} i={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
