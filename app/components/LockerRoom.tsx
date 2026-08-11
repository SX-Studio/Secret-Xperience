'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { createClient } from '../lib/supabase'

type Post = { id: string; handle: string; body: string; vibe: string | null; created_at: string }

const SPECTRUM = 'linear-gradient(90deg,#e0507a,#b96bd8,#6b8be0,#3fd0c4,#e6c07a)'
const VIBES = ['🏳️‍🌈', '💅', '🔥', '✨', '🌙', '💜', '🫶', '😈', '🍑', '🌈']
// deterministic pastel tint + slight tilt per card, seeded by id
const TINTS = ['rgba(224,80,122,0.14)', 'rgba(185,107,216,0.14)', 'rgba(107,139,224,0.14)', 'rgba(63,208,196,0.13)', 'rgba(230,192,122,0.14)']
const seed = (s: string) => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function LockerRoom() {
  const rm = useReducedMotion()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [handle, setHandle] = useState('')
  const [body, setBody] = useState('')
  const [vibe, setVibe] = useState('🏳️‍🌈')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const cooldown = useRef(0)

  const load = () => {
    const supabase = createClient()
    supabase.from('locker_room_posts')
      .select('id,handle,body,vibe,created_at')
      .order('created_at', { ascending: false }).limit(48)
      .then(({ data }) => { setPosts((data as Post[]) || []); setLoading(false) })
  }
  useEffect(load, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    if (Date.now() < cooldown.current) { setMsg('Easy tiger — give it a few seconds 😉'); return }
    setSending(true); setMsg(null)
    const supabase = createClient()
    const row = { handle: handle.trim().slice(0, 40) || 'Anonymous', body: text.slice(0, 280), vibe }
    const { data, error } = await supabase.from('locker_room_posts').insert(row).select('id,handle,body,vibe,created_at').maybeSingle()
    setSending(false)
    if (error) { setMsg('Could not post right now — try again in a bit.'); return }
    if (data) setPosts((p) => [data as Post, ...p])
    setBody(''); setMsg('Posted to the wall 🎉'); cooldown.current = Date.now() + 8000
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <section style={{ marginTop: '3.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', background: SPECTRUM, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: 10 }}>
          The Locker Room
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, margin: '0 0 .5rem' }}>
          Scribble on the <em style={{ fontStyle: 'italic', background: SPECTRUM, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>wall.</em>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(236,232,225,0.6)', maxWidth: 520, margin: '0 auto' }}>
          Shout-outs, hot takes, meetups, or just say hi. No accounts, no drama — keep it kind. 🏳️‍🌈
        </p>
      </div>

      {/* compose */}
      <form onSubmit={submit} style={{ maxWidth: 640, margin: '0 auto 2rem', background: 'rgba(20,14,26,0.55)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Your handle (optional)" maxLength={40}
            style={{ flex: '1 1 180px', minWidth: 0, padding: '10px 12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.3)', color: '#ece8e1', font: '400 13.5px Poppins, sans-serif' }} />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {VIBES.map((v) => (
              <button type="button" key={v} onClick={() => setVibe(v)} title={`vibe ${v}`}
                style={{ width: 34, height: 34, borderRadius: 9, cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  border: vibe === v ? '1.5px solid #b96bd8' : '0.5px solid rgba(255,255,255,0.12)',
                  background: vibe === v ? 'rgba(185,107,216,0.2)' : 'rgba(0,0,0,0.25)' }}>{v}</button>
            ))}
          </div>
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Say something to the room…" maxLength={280} rows={3}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.3)', color: '#ece8e1', font: '400 14px/1.5 Poppins, sans-serif', resize: 'vertical' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 12 }}>
          <span style={{ fontSize: 12, color: msg ? '#e6c07a' : 'rgba(236,232,225,0.4)' }}>{msg || `${body.length}/280`}</span>
          <button type="submit" disabled={sending || !body.trim()}
            style={{ height: 40, padding: '0 22px', borderRadius: 10, border: 'none', cursor: sending || !body.trim() ? 'not-allowed' : 'pointer',
              background: SPECTRUM, color: '#0a0710', font: '700 13px Poppins, sans-serif', opacity: sending || !body.trim() ? 0.5 : 1 }}>
            {sending ? 'Posting…' : 'Post to wall'}
          </button>
        </div>
      </form>

      {/* wall */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.5)' }}>Loading the wall…</p>
      ) : posts.length ? (
        <div style={{ columns: '220px', columnGap: '14px', maxWidth: 1100, margin: '0 auto' }}>
          <AnimatePresence initial={false}>
          {posts.map((p, i) => {
            const n = seed(p.id)
            const tilt = (n % 5) - 2
            return (
              <motion.div key={p.id}
                initial={rm ? { opacity: 0 } : { opacity: 0, y: -26, rotate: tilt * 0.5 - 8, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, rotate: tilt * 0.5, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: Math.min(i, 10) * 0.03 }}
                whileHover={rm ? {} : { scale: 1.03, rotate: 0, zIndex: 2 }}
                style={{ breakInside: 'avoid', marginBottom: 14,
                background: `linear-gradient(160deg, ${TINTS[n % TINTS.length]}, rgba(20,14,26,0.6))`,
                border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '13px 15px', position: 'relative', cursor: 'default' }}>
                <span style={{ position: 'absolute', top: -1, left: 14, right: 14, height: 2, background: SPECTRUM, borderRadius: 2, opacity: .7 }} />
                <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 8 }}>{p.vibe || '🏳️‍🌈'}</div>
                <p style={{ margin: '0 0 10px', font: '400 14px/1.5 Poppins, sans-serif', color: '#efe9df', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{p.body}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, fontSize: 11.5 }}>
                  <span style={{ fontWeight: 600, color: '#c79bef' }}>{p.handle}</span>
                  <span style={{ color: 'rgba(236,232,225,0.4)' }}>{ago(p.created_at)}</span>
                </div>
              </motion.div>
            )
          })}
          </AnimatePresence>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.6)' }}>The wall’s empty — be the first to write something ✍️</p>
      )}
    </section>
  )
}
