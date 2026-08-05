'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

const ACCENT = '#c5a05a'

type Dir = { id: string; name: string; category: string; city: string | null; country: string | null; website: string | null; contact_email: string | null; description: string | null; status: string; created_at: string }
type Job = { id: string; kind: string; title: string; category: string; city: string | null; country: string | null; compensation: string | null; contact_email: string | null; contact_phone: string | null; website: string | null; description: string | null; status: string; created_at: string }

export default function CommunityAdminPage() {
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dirs, setDirs] = useState<Dir[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')

  async function load() {
    const supabase = createClient()
    const [d, j] = await Promise.all([
      supabase.from('directory_listings').select('*').order('created_at', { ascending: false }),
      supabase.from('job_posts').select('*').order('created_at', { ascending: false }),
    ])
    setDirs((d.data as Dir[]) || [])
    setJobs((j.data as Job[]) || [])
  }

  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') { window.location.href = '/'; return }
      setOk(true)
      await load()
      setLoading(false)
    })()
  }, [])

  async function setStatus(table: 'directory_listings' | 'job_posts', id: string, status: string) {
    const supabase = createClient()
    await supabase.from(table).update({ status }).eq('id', id)
    if (table === 'directory_listings') setDirs(prev => prev.map(x => x.id === id ? { ...x, status } : x))
    else setJobs(prev => prev.map(x => x.id === id ? { ...x, status } : x))
  }

  async function toggleFeatured(table: 'directory_listings' | 'job_posts', id: string, cur: boolean) {
    const supabase = createClient()
    await supabase.from(table).update({ featured: !cur }).eq('id', id)
    load()
  }

  if (!ok) return <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{loading ? 'Loading…' : ''}</div>

  const fd = dirs.filter(x => filter === 'all' || x.status === filter)
  const fj = jobs.filter(x => filter === 'all' || x.status === filter)
  const pendCount = dirs.filter(x => x.status === 'pending').length + jobs.filter(x => x.status === 'pending').length

  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: ACCENT }}>Community moderation</div>
        <Link href="/admin" style={{ color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none' }}><i className="ti ti-arrow-left" /> Admin</Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {(['pending', 'approved', 'all'] as const).map(k => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer', textTransform: 'capitalize',
              border: `0.5px solid ${filter === k ? ACCENT : 'rgba(255,255,255,0.14)'}`,
              background: filter === k ? `${ACCENT}22` : 'transparent',
              color: filter === k ? ACCENT : 'rgba(236,232,225,0.6)', font: '600 13px/1 Poppins',
            }}>{k}{k === 'pending' && pendCount ? ` · ${pendCount}` : ''}</button>
          ))}
        </div>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: ACCENT, fontWeight: 500, margin: '0 0 12px' }}>Venue directory ({fd.length})</h2>
        <div style={{ display: 'grid', gap: 10, marginBottom: '2.5rem' }}>
          {fd.length ? fd.map(d => (
            <div key={d.id} style={row(d.status)}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, color: '#f2ede4' }}>{d.name} <span style={tag}>{d.category}</span> {statusPill(d.status)}</div>
                <div style={sub}>{[d.city, d.country].filter(Boolean).join(', ')}{d.website ? ` · ${d.website}` : ''}{d.contact_email ? ` · ${d.contact_email}` : ''}</div>
                {d.description && <div style={desc}>{d.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                {d.status !== 'approved' && <button onClick={() => setStatus('directory_listings', d.id, 'approved')} style={btn('#26d4a0')}>Approve</button>}
                {d.status !== 'rejected' && <button onClick={() => setStatus('directory_listings', d.id, 'rejected')} style={btn('#e0708a')}>Reject</button>}
                <button onClick={() => toggleFeatured('directory_listings', d.id, (d as any).featured)} style={btn(ACCENT)}>★</button>
              </div>
            </div>
          )) : <div style={sub}>Nothing here.</div>}
        </div>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: ACCENT, fontWeight: 500, margin: '0 0 12px' }}>Job posts ({fj.length})</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {fj.length ? fj.map(j => (
            <div key={j.id} style={row(j.status)}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, color: '#f2ede4' }}>{j.title} <span style={tag}>{j.kind}</span> <span style={tag}>{j.category}</span> {statusPill(j.status)}</div>
                <div style={sub}>{[j.city, j.country].filter(Boolean).join(', ')}{j.compensation ? ` · ${j.compensation}` : ''}{j.contact_email ? ` · ${j.contact_email}` : ''}{j.contact_phone ? ` · ${j.contact_phone}` : ''}</div>
                {j.description && <div style={desc}>{j.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                {j.status !== 'approved' && <button onClick={() => setStatus('job_posts', j.id, 'approved')} style={btn('#26d4a0')}>Approve</button>}
                {j.status !== 'rejected' && <button onClick={() => setStatus('job_posts', j.id, 'rejected')} style={btn('#e0708a')}>Reject</button>}
                <button onClick={() => toggleFeatured('job_posts', j.id, (j as any).featured)} style={btn(ACCENT)}>★</button>
              </div>
            </div>
          )) : <div style={sub}>Nothing here.</div>}
        </div>
      </div>
    </div>
  )
}

const row = (status: string): React.CSSProperties => ({
  display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start',
  border: `0.5px solid ${status === 'pending' ? ACCENT + '55' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 12, padding: '14px 16px', background: 'rgba(20,14,26,0.5)',
})
const sub: React.CSSProperties = { font: '300 12.5px/1.5 Poppins, sans-serif', color: 'rgba(236,232,225,0.55)', marginTop: 5 }
const desc: React.CSSProperties = { font: '300 13px/1.5 Poppins, sans-serif', color: 'rgba(236,232,225,0.7)', marginTop: 6 }
const tag: React.CSSProperties = { font: '600 10px/1 Poppins', letterSpacing: '.08em', textTransform: 'uppercase', color: ACCENT, border: `0.5px solid ${ACCENT}44`, borderRadius: 5, padding: '3px 6px', marginLeft: 4 }
const btn = (c: string): React.CSSProperties => ({ border: `0.5px solid ${c}88`, background: `${c}18`, color: c, borderRadius: 9, padding: '7px 12px', cursor: 'pointer', font: '600 12px/1 Poppins' })
function statusPill(s: string) {
  const c = s === 'approved' ? '#26d4a0' : s === 'rejected' ? '#e0708a' : ACCENT
  return <span style={{ font: '600 10px/1 Poppins', color: c, border: `0.5px solid ${c}55`, borderRadius: 5, padding: '3px 6px', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s}</span>
}
