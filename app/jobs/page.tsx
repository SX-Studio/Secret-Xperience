'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

type Job = {
  id: string
  kind: 'offered' | 'wanted'
  title: string
  category: string
  description: string | null
  city: string | null
  country: string | null
  compensation: string | null
  poster_type: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  featured: boolean
  created_at: string
}

const ACCENT = '#c5a05a'
const CAT_LABEL: Record<string, string> = {
  escort: 'Escort', dancer: 'Club dancer', 'cam-creator': 'Cam / content creator',
  massage: 'Erotic massage', hostess: 'Hostess / bar', 'domination-fetish': 'Domination / fetish',
  'agency-staff': 'Agency / support staff', other: 'Other',
}
const CAT_KEYS = Object.keys(CAT_LABEL)
const COUNTRIES = ['Belgium', 'Netherlands', 'Germany', 'France', 'Luxembourg', 'Spain', 'Italy', 'Austria', 'Switzerland', 'Czech Republic', 'Portugal', 'Poland', 'United Kingdom', 'Hungary', 'Greece', 'Other']

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [tab, setTab] = useState<'offered' | 'wanted'>('offered')
  const [country, setCountry] = useState('all')
  const [cat, setCat] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('job_posts')
      .select('id,kind,title,category,description,city,country,compensation,poster_type,contact_email,contact_phone,website,featured,created_at')
      .eq('status', 'approved').gt('expires_at', new Date().toISOString())
      .order('featured', { ascending: false }).order('created_at', { ascending: false })
      .then(({ data }) => { setJobs((data as Job[]) || []); setLoading(false) })
  }, [])

  const shown = useMemo(() => jobs.filter(j =>
    j.kind === tab &&
    (country === 'all' || j.country === country) &&
    (cat === 'all' || j.category === cat)
  ), [jobs, tab, country, cat])

  const count = (k: 'offered' | 'wanted') => jobs.filter(j => j.kind === k).length

  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: ACCENT, textDecoration: 'none' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <Link href="/" style={{ height: 36, padding: '0 14px', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(236,232,225,0.65)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-arrow-left" /> Home
        </Link>
      </nav>

      <section style={{ padding: '4.5rem 1.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${ACCENT}14 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', color: ACCENT, textTransform: 'uppercase', marginBottom: '1.25rem' }}>Adult industry jobs — across Europe</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>
            Vacancies &amp; <em style={{ fontStyle: 'italic', color: ACCENT }}>Work Wanted</em>
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(236,232,225,0.62)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 1.5rem' }}>
            Clubs, studios and agencies hiring — and independent workers offering their availability. Every post is reviewed before it goes live. Adults-only (18+); posts must comply with local law.
          </p>
          <a href="#post" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,#e7c87f,${ACCENT} 55%,#a0803d)`, color: '#1a1206', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 11 }}>
            <i className="ti ti-plus" /> Post a vacancy
          </a>
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '1.5rem' }}>
          {(['offered', 'wanted'] as const).map(k => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '11px 22px', borderRadius: 12, cursor: 'pointer',
              border: `0.5px solid ${tab === k ? ACCENT : 'rgba(255,255,255,0.14)'}`,
              background: tab === k ? `${ACCENT}22` : 'transparent',
              color: tab === k ? ACCENT : 'rgba(236,232,225,0.6)', font: '700 14px/1 Poppins, sans-serif',
            }}>
              {k === 'offered' ? '💼 Jobs offered' : '🙋 Work wanted'} · {count(k)}
            </button>
          ))}
        </div>

        {/* filters */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <select value={country} onChange={e => setCountry(e.target.value)} style={filt}>
            <option value="all">All countries</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={cat} onChange={e => setCat(e.target.value)} style={filt}>
            <option value="all">All categories</option>
            {CAT_KEYS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </select>
        </div>

        {/* list */}
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(236,232,225,0.5)' }}>Loading…</p>
        ) : shown.length ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {shown.map(j => (
              <div key={j.id} style={{ border: `0.5px solid ${j.featured ? ACCENT + '66' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: '1.25rem 1.4rem', background: 'rgba(20,14,26,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <div style={{ font: '400 21px/1.2 "Cormorant Garamond", Georgia, serif', color: '#f2ede4' }}>{j.title}</div>
                  <span style={{ font: '600 10px/1 Poppins', letterSpacing: '.1em', textTransform: 'uppercase', color: ACCENT, border: `0.5px solid ${ACCENT}55`, borderRadius: 6, padding: '4px 8px' }}>{CAT_LABEL[j.category] || j.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '8px 0 10px', font: '300 12.5px/1 Poppins, sans-serif', color: 'rgba(236,232,225,0.55)' }}>
                  {(j.city || j.country) && <span><i className="ti ti-map-pin" style={{ color: `${ACCENT}b3` }} /> {[j.city, j.country].filter(Boolean).join(', ')}</span>}
                  {j.compensation && <span><i className="ti ti-coin" style={{ color: `${ACCENT}b3` }} /> {j.compensation}</span>}
                  {j.poster_type && <span><i className="ti ti-user" style={{ color: `${ACCENT}b3` }} /> {j.poster_type}</span>}
                </div>
                {j.description && <p style={{ font: '300 14px/1.6 Poppins, sans-serif', color: 'rgba(236,232,225,0.72)', margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{j.description}</p>}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {j.contact_email && <a href={`mailto:${j.contact_email}`} style={contactBtn}><i className="ti ti-mail" /> Email</a>}
                  {j.contact_phone && <a href={`tel:${j.contact_phone}`} style={contactBtn}><i className="ti ti-phone" /> {j.contact_phone}</a>}
                  {j.website && <a href={j.website} target="_blank" rel="noopener noreferrer nofollow" style={contactBtn}><i className="ti ti-external-link" /> Website</a>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '0.5px dashed rgba(255,255,255,0.14)', borderRadius: 16 }}>
            <i className="ti ti-briefcase-off" style={{ fontSize: 34, color: 'rgba(236,232,225,0.4)' }} />
            <p style={{ color: 'rgba(236,232,225,0.6)', marginTop: 10 }}>No {tab === 'offered' ? 'vacancies' : 'availability posts'} here yet. Be the first to post below.</p>
          </div>
        )}

        <PostJobForm defaultKind={tab} />

        <p style={{ marginTop: '2.5rem', fontSize: 11.5, color: 'rgba(236,232,225,0.35)', textAlign: 'center', lineHeight: 1.6, maxWidth: 640, marginInline: 'auto' }}>
          SecretXperience only hosts these posts and reviews each one; we are not the employer and take no fee for placement. Posts must be lawful in the relevant country and are adults-only (18+). Never pay to get a job, and never hand over your ID or deposits to a stranger.
        </p>
      </div>
    </div>
  )
}

const filt: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.25)', color: '#ece8e1', font: '400 13.5px/1 Poppins, sans-serif',
}
const contactBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
  border: `0.5px solid ${ACCENT}55`, borderRadius: 9, padding: '8px 14px',
  color: ACCENT, font: '600 12.5px/1 Poppins, sans-serif',
}
const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 10,
  border: '0.5px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.25)',
  color: '#ece8e1', font: '400 14px/1.3 Poppins, sans-serif',
}

function PostJobForm({ defaultKind }: { defaultKind: 'offered' | 'wanted' }) {
  const [f, setF] = useState({
    kind: defaultKind, title: '', category: 'escort', city: '', country: '',
    compensation: '', poster_type: '', description: '', contact_email: '', contact_phone: '', website: '',
  })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.title.trim()) { setMsg('Please add a title'); return }
    if (!f.contact_email.trim() && !f.contact_phone.trim() && !f.website.trim()) { setMsg('Add at least one way to be contacted'); return }
    setState('sending'); setMsg('')
    try {
      const res = await fetch('/api/community', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'job', ...f }),
      })
      const j = await res.json()
      if (!res.ok) { setState('error'); setMsg(j.error || 'Could not submit'); return }
      setState('done')
    } catch { setState('error'); setMsg('Network error') }
  }

  if (state === 'done') {
    return (
      <div id="post" style={{ maxWidth: 640, margin: '3.5rem auto 0', textAlign: 'center', border: `0.5px solid ${ACCENT}44`, borderRadius: 16, padding: '2.5rem', background: 'rgba(20,14,26,0.5)' }}>
        <i className="ti ti-circle-check" style={{ fontSize: 40, color: '#26d4a0' }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, margin: '12px 0 8px' }}>Submitted for review</h3>
        <p style={{ color: 'rgba(236,232,225,0.6)', fontSize: 14 }}>We review every post before it appears. It’ll go live once approved.</p>
      </div>
    )
  }

  return (
    <form id="post" onSubmit={submit} style={{ maxWidth: 640, margin: '3.5rem auto 0', border: `0.5px solid ${ACCENT}44`, borderRadius: 16, padding: 'clamp(1.5rem,4vw,2.25rem)', background: 'rgba(20,14,26,0.5)' }}>
      <div style={{ font: '700 11px/1 Poppins', letterSpacing: '.2em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>Self-serve · reviewed before publishing</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, margin: '0 0 18px' }}>Post a vacancy or your availability</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['offered', 'wanted'] as const).map(k => (
          <button type="button" key={k} onClick={() => setF({ ...f, kind: k })} style={{
            flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
            border: `0.5px solid ${f.kind === k ? ACCENT : 'rgba(255,255,255,0.14)'}`,
            background: f.kind === k ? `${ACCENT}22` : 'transparent',
            color: f.kind === k ? ACCENT : 'rgba(236,232,225,0.6)', font: '600 13px/1 Poppins',
          }}>
            {k === 'offered' ? "I'm hiring (job offered)" : "I'm looking for work (wanted)"}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input required placeholder="Title * (e.g. Dancers wanted — weekends)" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} style={{ ...inp, gridColumn: '1 / -1' }} />
        <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} style={inp}>
          {CAT_KEYS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
        <select value={f.poster_type} onChange={e => setF({ ...f, poster_type: e.target.value })} style={inp}>
          <option value="">Posted as…</option>
          <option value="Club / venue">Club / venue</option>
          <option value="Agency">Agency</option>
          <option value="Studio">Studio</option>
          <option value="Independent">Independent</option>
        </select>
        <input placeholder="City" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} style={inp} />
        <select value={f.country} onChange={e => setF({ ...f, country: e.target.value })} style={inp}>
          <option value="">Country…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Pay / terms (e.g. 50/50, €X per day)" value={f.compensation} onChange={e => setF({ ...f, compensation: e.target.value })} style={{ ...inp, gridColumn: '1 / -1' }} />
        <textarea placeholder="Description — role, requirements, hours…" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} rows={4} style={{ ...inp, gridColumn: '1 / -1', resize: 'vertical' }} />
        <input type="email" placeholder="Contact email" value={f.contact_email} onChange={e => setF({ ...f, contact_email: e.target.value })} style={inp} />
        <input placeholder="Contact phone / WhatsApp" value={f.contact_phone} onChange={e => setF({ ...f, contact_phone: e.target.value })} style={inp} />
        <input placeholder="Website (optional)" value={f.website} onChange={e => setF({ ...f, website: e.target.value })} style={{ ...inp, gridColumn: '1 / -1' }} />
      </div>
      {msg && <div style={{ color: '#e0708a', fontSize: 13, marginTop: 10 }}>{msg}</div>}
      <button type="submit" disabled={state === 'sending'} style={{ marginTop: 16, width: '100%', padding: '13px', border: 'none', borderRadius: 11, cursor: 'pointer', background: `linear-gradient(135deg,#e7c87f,${ACCENT} 55%,#a0803d)`, color: '#1a1206', font: '700 14px/1 Poppins' }}>
        {state === 'sending' ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  )
}
