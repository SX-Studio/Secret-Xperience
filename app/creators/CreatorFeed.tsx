'use client'
import { useEffect, useState } from 'react'
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

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const GIFT_AMOUNTS = [25, 50, 100, 200]

function GiftModal({ creator, senderBalance, onClose, onSent }: {
  creator: { id: string; full_name: string | null; username: string | null }
  senderBalance: number | null
  onClose: () => void
  onSent: (newBalance: number) => void
}) {
  const [amount, setAmount] = useState(50)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const name = creator.full_name || creator.username || 'Creator'

  async function send() {
    setSending(true); setErr('')
    try {
      const res = await fetch('/api/creators/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: creator.id, amountTokens: amount, message: message.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setErr(json.error || 'Failed to send gift'); setSending(false); return }
      onSent(json.newBalance)
    } catch { setErr('Failed to send gift'); setSending(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,3,10,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'var(--bg1)', border: '0.5px solid var(--gbrd)', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: '380px', boxShadow: '0 0 60px rgba(197,160,90,0.15)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>✦</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, margin: '0 0 6px' }}>Send a gift</h2>
          <p style={{ fontSize: '13px', color: 'var(--t3)', margin: 0 }}>Show {name} some appreciation</p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '10px' }}>Choose amount</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {GIFT_AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmount(a)} style={{ padding: '10px 4px', borderRadius: '10px', border: amount === a ? '1.5px solid var(--gold)' : '0.5px solid var(--b2)', background: amount === a ? 'var(--gbg)' : 'var(--bg2)', cursor: 'pointer', color: amount === a ? 'var(--gold)' : 'var(--t2)', fontWeight: 700, fontSize: '14px', transition: 'all .15s' }}>
                {a}
                <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--t3)', marginTop: '2px' }}>tokens</div>
              </button>
            ))}
          </div>
          {senderBalance !== null && (
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '8px', textAlign: 'right' }}>
              Your balance: <strong style={{ color: amount > senderBalance ? '#e0607a' : 'var(--gold)' }}>{senderBalance} tokens</strong>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '10px' }}>Message (optional)</div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 200))}
            placeholder="Leave a kind word…"
            rows={2}
            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', fontFamily: 'var(--sans)', resize: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--t3)', textAlign: 'right' }}>{message.length}/200</div>
        </div>

        {err && <div style={{ fontSize: '13px', color: '#e0607a', marginBottom: '12px', textAlign: 'center' }}>{err}</div>}

        <button onClick={send} disabled={sending || (senderBalance !== null && amount > senderBalance)} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', border: 'none', borderRadius: 'var(--r)', color: '#0a0a0a', fontWeight: 700, fontSize: '15px', cursor: sending ? 'default' : 'pointer', opacity: (senderBalance !== null && amount > senderBalance) ? 0.5 : 1 }}>
          {sending ? 'Sending…' : `Send ${amount} tokens ✦`}
        </button>
        {senderBalance !== null && amount > senderBalance && (
          <p style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', marginTop: '10px' }}>
            <Link href="/tokens" style={{ color: 'var(--gold)' }}>Get more tokens →</Link>
          </p>
        )}
      </div>
    </div>
  )
}

function GiftSuccess({ amount, onClose }: { amount: number; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}>
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--gbrd)', borderRadius: '16px', padding: '2rem 2.5rem', textAlign: 'center', boxShadow: '0 0 60px rgba(197,160,90,0.25)', pointerEvents: 'auto' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>✦</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, marginBottom: '6px' }}>Gift sent!</div>
        <div style={{ fontSize: '13px', color: 'var(--t3)' }}>{amount} tokens delivered with love</div>
      </div>
    </div>
  )
}

// The feed never shows post content — just a fixed 300×400 creator profile card
// that links to the creator's full profile. No media is rendered or loaded here.
function PostMedia({ post, name, avatarUrl, verified, creatorId, username }: { post: Post; name: string; avatarUrl?: string | null; verified?: boolean; creatorId: string; username?: string | null }) {
  const href = username ? `/c/${username}` : `/profile/${creatorId}`
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ position: 'relative', width: '300px', maxWidth: '100%', height: '400px', margin: '4px auto 12px', borderRadius: '12px', overflow: 'hidden', background: 'radial-gradient(120% 90% at 50% 15%, #241a34, #0b0812)', border: '0.5px solid var(--b)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', padding: '20px' }}>
          <div style={{ width: '86px', height: '86px', borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg,var(--gold),var(--goldd))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontWeight: 700, fontSize: '30px', border: '2px solid rgba(255,255,255,0.14)' }}>
            {!avatarUrl && name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--t)', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
              {name} {verified && <i className="ti ti-rosette-discount-check-filled" style={{ color: 'var(--gold)', fontSize: '15px' }} />}
            </div>
            {username && <div style={{ fontSize: '12.5px', color: 'var(--t3)', marginTop: '2px' }}>@{username}</div>}
            <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px' }}>Posted {timeAgo(post.created_at)}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', color: '#0a0a0a', fontSize: '12.5px', fontWeight: 700, marginTop: '4px' }}>
            View profile
          </div>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post, me, follows, balance, onFollow, onBalanceChange }: {
  post: Post; me: string | null; follows: Set<string>; balance: number | null
  onFollow: (id: string) => void
  onBalanceChange: (b: number) => void
}) {
  const c = post.creator
  if (!c) return null
  const name = c.full_name || c.username || 'Creator'
  const following = follows.has(c.id)
  const isSelf = me === c.id
  const links = Array.isArray(c.external_links) ? c.external_links : []
  const [giftOpen, setGiftOpen] = useState(false)
  const [gifted, setGifted] = useState<number | null>(null)

  return (
    <article style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '14px', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px' }}>
        <Link href={`/profile/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: c.avatar_url ? `url(${c.avatar_url}) center/cover` : 'linear-gradient(135deg,var(--gold),var(--goldd))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontWeight: 700, fontSize: '14px' }}>
            {!c.avatar_url && name.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {name} {c.verified && <i className="ti ti-rosette-discount-check-filled" style={{ color: 'var(--gold)', fontSize: '14px' }} />}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{timeAgo(post.created_at)}</div>
          </div>
        </Link>
        {!isSelf && me && (
          <button onClick={() => onFollow(c.id)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: following ? '0.5px solid var(--b2)' : 'none', background: following ? 'transparent' : 'linear-gradient(135deg,var(--gold),var(--goldd))', color: following ? 'var(--t2)' : '#0a0a0a' }}>
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* content is never shown in the feed — only a 300×400 creator profile card */}
      {post.media_url && <PostMedia post={post} name={name} avatarUrl={c.avatar_url} verified={!!c.verified} creatorId={c.id} username={c.username} />}

      {/* body */}
      <div style={{ padding: '12px 14px 14px' }}>
        {post.caption && <p style={{ fontSize: '14px', color: 'var(--t)', lineHeight: 1.6, margin: '0 0 10px' }}>{post.caption}</p>}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {me && !isSelf && (
            <Link href={`/messages?provider_id=${c.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: '0.5px solid var(--b2)', color: 'var(--t2)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <i className="ti ti-message-circle" /> Live chat
            </Link>
          )}
          {!isSelf && (
            <button
              onClick={() => { if (!me) { window.location.href = '/login?next=/creators'; return } setGiftOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px', border: '0.5px solid rgba(197,160,90,0.35)', background: 'var(--gbg)', color: 'var(--gold)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              ✦ Send a gift
            </button>
          )}
          {links.slice(0, 3).map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '20px', border: '0.5px solid rgba(197,160,90,0.3)', color: 'var(--gold)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <i className="ti ti-external-link" /> {l.label}
            </a>
          ))}
        </div>
      </div>

      {giftOpen && (
        <GiftModal
          creator={c}
          senderBalance={balance}
          onClose={() => setGiftOpen(false)}
          onSent={(newBal) => { onBalanceChange(newBal); setGifted(amount => { setGiftOpen(false); return null }); setGifted(50) }}
        />
      )}
      {gifted !== null && <GiftSuccess amount={gifted} onClose={() => setGifted(null)} />}
    </article>
  )
}

export default function CreatorFeed({ posts }: { posts: Post[] }) {
  const [me, setMe] = useState<string | null>(null)
  const [follows, setFollows] = useState<Set<string>>(new Set())
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        setMe(session.user.id)
        const [{ data: followData }, { data: wallet }] = await Promise.all([
          supabase.from('creator_follows').select('creator_id').eq('follower_id', session.user.id),
          supabase.from('user_wallets').select('balance').eq('user_id', session.user.id).maybeSingle(),
        ])
        setFollows(new Set((followData || []).map((r: any) => r.creator_id)))
        if (wallet) setBalance(wallet.balance)
      } catch { /* ignore */ }
    })()
  }, [])

  async function onFollow(creatorId: string) {
    if (!me) { window.location.href = '/login?next=/creators'; return }
    setFollows(prev => { const n = new Set(prev); n.has(creatorId) ? n.delete(creatorId) : n.add(creatorId); return n })
    try {
      const res = await fetch('/api/creators/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId }) })
      if (!res.ok) throw new Error()
    } catch {
      setFollows(prev => { const n = new Set(prev); n.has(creatorId) ? n.delete(creatorId) : n.add(creatorId); return n })
    }
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: '14px' }}>
        <div style={{ fontSize: '34px', marginBottom: '0.75rem' }}>✦</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '0.5rem' }}>No content yet</div>
        <p style={{ fontSize: '14px', color: 'var(--t3)', maxWidth: '360px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
          Be the first creator to publish. Share photos and videos, build followers, and link your other platforms.
        </p>
        <Link href="/creators/studio" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 26px', background: 'linear-gradient(135deg,var(--gold),var(--goldd))', borderRadius: 'var(--r)', color: '#0a0a0a', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
          Open Creator Studio →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '620px', margin: '0 auto' }}>
      {posts.map(p => (
        <PostCard
          key={p.id}
          post={p}
          me={me}
          follows={follows}
          balance={balance}
          onFollow={onFollow}
          onBalanceChange={setBalance}
        />
      ))}
    </div>
  )
}
