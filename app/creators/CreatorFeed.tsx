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

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const TWO_HOURS = 2 * 60 * 60 * 1000

function ProfileCard({ c, createdAt }: { c: Creator; createdAt: string }) {
  const name = c.full_name || c.username || 'Creator'
  const href = c.username ? `/c/${c.username}` : `/profile/${c.id}`
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{
        position: 'relative', aspectRatio: '4 / 5', borderRadius: '14px', overflow: 'hidden',
        background: c.avatar_url ? `url(${c.avatar_url}) center/cover` : 'radial-gradient(120% 90% at 50% 20%, #2a1e3f, #0d0913)',
        border: '0.5px solid var(--b)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px -18px rgba(0,0,0,0.7)',
      }}>
        {!c.avatar_url && (
          <span style={{ fontFamily: 'var(--serif)', fontSize: '40px', color: 'var(--gold)' }}>{name.slice(0, 1).toUpperCase()}</span>
        )}
        <span style={{ position: 'absolute', top: '8px', left: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', background: 'rgba(10,8,16,0.6)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '.04em' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3ad07a' }} /> NEW
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '15px', color: 'var(--t)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {name} {c.verified && <i className="ti ti-rosette-discount-check-filled" style={{ color: 'var(--gold)', fontSize: '13px' }} />}
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>{timeAgo(createdAt)}</div>
      </div>
    </Link>
  )
}

export default function CreatorFeed({ posts }: { posts: Post[] }) {
  const [allPosts, setAllPosts] = useState<Post[]>(posts)
  const [q, setQ] = useState('')
  const [now, setNow] = useState<number>(() => Date.now())

  // Keep the field fresh: re-fetch recent posts and tick the clock so cards drop
  // off after their 2-hour window and newer posters rotate in.
  useEffect(() => {
    let alive = true
    const supabase = createClient()
    const load = async () => {
      try {
        const { data } = await supabase
          .from('creator_posts')
          .select('id, caption, media_url, media_type, created_at, creator:profiles!creator_id(id, full_name, username, avatar_url, verified, external_links)')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(200)
        if (alive && Array.isArray(data) && data.length) setAllPosts(data as unknown as Post[])
      } catch { /* keep current */ }
    }
    load()
    const iv = setInterval(() => { setNow(Date.now()); load() }, 60000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  // One card per creator — their most recent post.
  const creators = useMemo(() => {
    const map = new Map<string, { c: Creator; created_at: string }>()
    for (const p of allPosts) {
      if (!p.creator) continue
      if (!map.has(p.creator.id)) map.set(p.creator.id, { c: p.creator, created_at: p.created_at })
    }
    return Array.from(map.values())
  }, [allPosts])

  const term = q.trim().toLowerCase()
  const shown = creators.filter(({ c, created_at }) => {
    if (term) return (c.username || '').toLowerCase().includes(term) || (c.full_name || '').toLowerCase().includes(term)
    return now - new Date(created_at).getTime() <= TWO_HOURS
  })

  return (
    <div>
      {/* search */}
      <div style={{ maxWidth: '440px', margin: '0 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg2,rgba(255,255,255,0.05))', border: '0.5px solid var(--b2)', borderRadius: '999px', padding: '0 14px' }}>
          <i className="ti ti-search" style={{ color: 'var(--t3)', fontSize: '15px' }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search creators by username…"
            aria-label="Search creators by username"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--t)', fontSize: '14px', padding: '11px 0', fontFamily: 'var(--sans)' }}
          />
          {q && <button onClick={() => setQ('')} aria-label="Clear" style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '15px' }}>✕</button>}
        </div>
      </div>

      {shown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '14px' }}>
          <div style={{ fontSize: '30px', marginBottom: '0.6rem' }}>✦</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '0.4rem' }}>
            {term ? 'No creator found' : 'No new creators right now'}
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--t3)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
            {term ? 'Try another username.' : 'Creators appear here for 2 hours after they post. Check back soon.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {shown.map(({ c, created_at }) => <ProfileCard key={c.id} c={c} createdAt={created_at} />)}
        </div>
      )}
    </div>
  )
}
