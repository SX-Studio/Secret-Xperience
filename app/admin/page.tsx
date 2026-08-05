'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase'
import { detectFocalPoint, imageFromUrl } from '../lib/imageFocus'

const TABS = ['Listings', 'Users', 'Verification', 'Reports', 'Bookings', 'Newsletter', 'Contacts', 'Acquisition', 'Keywords', 'Tools'] as const
type Tab = typeof TABS[number]

const TAB_ICONS: Record<Tab, string> = {
  Listings: 'layout-list',
  Users: 'users',
  Verification: 'shield-check',
  Reports: 'flag',
  Bookings: 'calendar-event',
  Newsletter: 'mail',
  Contacts: 'address-book',
  Acquisition: 'chart-arrows-vertical',
  Keywords: 'search',
  Tools: 'tool',
}

const LS_KEY = (t: Tab) => `sx_admin_seen_${t.toLowerCase()}`

// Categories an admin can reassign a listing to (value must match the live category routes).
const ADMIN_CATEGORIES = [
  'escorts', 'massage', 'companionship', 'domination', 'adult',
  'creators', 'nightlife', 'experiences', 'rentals', 'hotels', 'events', 'shop',
]

function exportCsv(rows: any[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = filename
  a.click()
}

function loadLastSeen(t: Tab): number {
  try { return parseInt(localStorage.getItem(LS_KEY(t)) || '0', 10) } catch { return 0 }
}
function saveLastSeen(t: Tab) {
  try { localStorage.setItem(LS_KEY(t), String(Date.now())) } catch { }
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('Listings')
  const [badges, setBadges] = useState<Record<Tab, number>>({ Listings: 0, Users: 0, Verification: 0, Reports: 0, Bookings: 0, Newsletter: 0, Contacts: 0, Acquisition: 0, Keywords: 0, Tools: 0 })
  const [reports, setReports] = useState<any[]>([])
  const [reportWorking, setReportWorking] = useState<string | null>(null)
  const currentTab = useRef<Tab>('Listings')
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [stats, setStats] = useState({ listings: 0, users: 0, bookings: 0, revenue: 0, advertisers: 0, pendingListings: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verifWorking, setVerifWorking] = useState<string | null>(null)
  const [verifMsg, setVerifMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null)
  const [optinContacts, setOptinContacts] = useState<any[]>([])
  const [leads, setLeads]                 = useState<any[]>([])
  const [contactFilter, setContactFilter] = useState({ country: '', category: '', status: '' })
  const [nlSubject, setNlSubject]     = useState('')
  const [nlBody, setNlBody]           = useState('')
  const [nlSending, setNlSending]     = useState(false)
  const [nlResult, setNlResult]       = useState<string | null>(null)
  const [nlSubCount, setNlSubCount]   = useState<number | null>(null)
  const [nlSubs, setNlSubs]           = useState<any[]>([])
  const [nlSubsLoading, setNlSubsLoading] = useState(true)
  const [acq, setAcq]                 = useState<any[]>([])
  const [acqTotal, setAcqTotal]       = useState<number>(0)
  const [acqLoading, setAcqLoading]   = useState(true)
  // Token grant tool
  const [grantEmail, setGrantEmail]   = useState('')
  const [grantAmount, setGrantAmount] = useState('500')
  const [grantNote, setGrantNote]     = useState('')
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantMsg, setGrantMsg]       = useState<{ ok: boolean; text: string } | null>(null)
  // inline per-user grant
  const [inlineGrant, setInlineGrant] = useState<{ userId: string; amount: string } | null>(null)
  const [inlineGrantMsg, setInlineGrantMsg] = useState<{ userId: string; ok: boolean; text: string } | null>(null)
  // Keywords (DataForSEO) tool
  const [kwInput, setKwInput]         = useState('')
  const [kwMarket, setKwMarket]       = useState('be')
  const [kwLang, setKwLang]           = useState('nl')
  const [kwMode, setKwMode]           = useState<'volume' | 'ideas'>('volume')
  const [kwResults, setKwResults]     = useState<any[]>([])
  const [kwLoading, setKwLoading]     = useState(false)
  const [kwError, setKwError]         = useState<string | null>(null)
  // Image focus backfill tool
  const [bfRunning, setBfRunning]     = useState(false)
  const [bfTotal, setBfTotal]         = useState(0)
  const [bfDone, setBfDone]           = useState(0)
  const [bfSkipped, setBfSkipped]     = useState(0)
  const [bfErrors, setBfErrors]       = useState(0)
  const [bfLog, setBfLog]             = useState<string[]>([])
  const bfAbort                       = useRef(false)

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') { window.location.href = '/'; return }
      setIsAdmin(true)
      const [lr, ur, br, vr, ocr, leadsr, wr, rr] = await Promise.all([
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, listings(title)').order('created_at', { ascending: false }),
        supabase.from('identity_verifications').select('*, profiles(full_name, username, email, role)').order('submitted_at', { ascending: false }),
        supabase.from('listings').select('id,title,category,city,country,contact_phone,created_at').eq('whatsapp_optin', true).order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('user_wallets').select('user_id,balance,total_purchased,total_spent'),
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
      ])
      setReports(rr.data || [])
      // newsletter_subscribers is service-role-only; fetch via server route
      fetch('/api/newsletter/list')
        .then(r => r.ok ? r.json() : { subscribers: [] })
        .then(j => { setNlSubs(j.subscribers || []); setNlSubCount((j.subscribers || []).length) })
        .catch(() => {})
        .finally(() => setNlSubsLoading(false))
      // signup_sources is service-role-only; fetch aggregated summary via server route
      fetch('/api/admin/acquisition')
        .then(r => r.ok ? r.json() : { summary: [], totalTracked: 0 })
        .then(j => { setAcq(j.summary || []); setAcqTotal(j.totalTracked || 0) })
        .catch(() => {})
        .finally(() => setAcqLoading(false))
      setOptinContacts(ocr.data || [])
      setLeads(leadsr.data || [])
      const ls = lr.data || [], bs = br.data || []
      // Attach wallet balances to profiles client-side
      const walletMap = Object.fromEntries((wr.data || []).map((w: any) => [w.user_id, w]))
      const us = (ur.data || []).map((u: any) => ({ ...u, wallet: walletMap[u.id] || null }))
      // Attach profile data to listings client-side (avoids PostgREST embedded join issues)
      const profileMap = Object.fromEntries(us.map((u: any) => [u.id, u]))
      const lsWithProfiles = ls.map((l: any) => ({ ...l, profiles: profileMap[l.profile_id] || null }))
      setVerifications(vr.data || [])
      const revenue = bs.filter((b: any) => b.status === 'confirmed').reduce((s: number, b: any) => s + (b.total_amount || 0), 0)
      setListings(lsWithProfiles); setUsers(us); setBookings(bs)
      const advertisers = us.filter((u: any) => ['provider','venue','creator'].includes(u.role)).length
      const pendingListings = lsWithProfiles.filter((l: any) => !l.active).length
      setStats({ listings: lsWithProfiles.length, users: us.length, bookings: bs.length, revenue, advertisers, pendingListings })

      // Calculate initial badges — count items newer than last time each tab was visited
      const seenListings = loadLastSeen('Listings')
      const seenUsers = loadLastSeen('Users')
      const seenVerification = loadLastSeen('Verification')
      const seenBookings = loadLastSeen('Bookings')
      const seenContacts = loadLastSeen('Contacts')
      const seenReports = loadLastSeen('Reports')
      setBadges({
        Listings:     lsWithProfiles.filter((l: any) => new Date(l.created_at).getTime() > seenListings).length,
        Users:        us.filter((u: any) => new Date(u.created_at).getTime() > seenUsers).length,
        Verification: (vr.data || []).filter((v: any) => new Date(v.submitted_at || v.created_at).getTime() > seenVerification).length,
        Reports:      (rr.data || []).filter((r: any) => r.status === 'open' && new Date(r.created_at).getTime() > seenReports).length,
        Bookings:     bs.filter((b: any) => new Date(b.created_at).getTime() > seenBookings).length,
        Newsletter:   0,
        Contacts:     (leadsr.data || []).filter((l: any) => new Date(l.created_at).getTime() > seenContacts).length,
        Acquisition:  0,
        Keywords:     0,
        Tools:        0,
      })
      // Mark the initial active tab as seen immediately
      saveLastSeen('Listings')
      setLoading(false)

      // Real-time: reflect new listings, profile changes, and new verifications
      channel = supabase
        .channel('admin-watch')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, payload => {
          setListings(prev => [payload.new, ...prev])
          setStats(s => ({ ...s, listings: s.listings + 1, pendingListings: s.pendingListings + (!payload.new.active ? 1 : 0) }))
          if (currentTab.current !== 'Listings') setBadges(b => ({ ...b, Listings: b.Listings + 1 }))
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listings' }, payload => {
          setListings(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l))
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
          setUsers(prev => prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u))
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, payload => {
          setUsers(prev => [payload.new, ...prev])
          if (currentTab.current !== 'Users') setBadges(b => ({ ...b, Users: b.Users + 1 }))
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'identity_verifications' }, payload => {
          setVerifications(prev => [payload.new, ...prev])
          if (currentTab.current !== 'Verification') setBadges(b => ({ ...b, Verification: b.Verification + 1 }))
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, payload => {
          setBookings(prev => [payload.new, ...prev])
          if (currentTab.current !== 'Bookings') setBadges(b => ({ ...b, Bookings: b.Bookings + 1 }))
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
          setLeads(prev => [payload.new, ...prev])
          if (currentTab.current !== 'Contacts') setBadges(b => ({ ...b, Contacts: b.Contacts + 1 }))
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, payload => {
          setReports(prev => [payload.new, ...prev])
          if (currentTab.current !== 'Reports') setBadges(b => ({ ...b, Reports: b.Reports + 1 }))
        })
        .subscribe()
    }
    init()
    return () => { channel?.unsubscribe() }
  }, [])

  async function toggleListing(id: string, field: string, current: boolean) {
    const supabase = createClient()
    const update: Record<string, unknown> = { [field]: !current }
    if (field === 'active') {
      update.status = !current ? 'approved' : 'pending'
      // When making active, clear stale tier_expires_at so cron can't re-hide it
      if (!current) update.tier_expires_at = null
    }
    await supabase.from('listings').update(update).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...update } : l))
    if (field === 'active') {
      fetch('/api/admin/listing-moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: id, action: current ? 'reject' : 'approve' }),
      }).catch(() => {})
    }
  }

  // Placements are multi-select: a listing can hold several at once (e.g.
  // Slider + Section + Homepage). `tier` is kept in sync as the primary
  // (highest-priority) placement for the badge and back-compat reads.
  async function toggleListingPlacement(id: string, placement: 'basic' | 'featured' | 'slider' | 'section' | 'premium' | 'homepage') {
    const supabase = createClient()
    const PLACEMENT_DAYS: Record<string, number> = { featured: 7, slider: 7, section: 7, premium: 30, homepage: 30 }
    // Priority high→low for choosing the representative `tier`.
    const PRIORITY = ['homepage', 'premium', 'section', 'slider', 'featured'] as const

    const cur = listings.find(l => l.id === id)
    const prevPlacements: string[] = Array.isArray((cur as any)?.placements)
      ? [...(cur as any).placements]
      : (cur?.tier && cur.tier !== 'basic' ? [cur.tier] : [])

    let next: string[]
    if (placement === 'basic') {
      next = [] // Basic clears every placement
    } else {
      next = prevPlacements.includes(placement)
        ? prevPlacements.filter(p => p !== placement)
        : [...prevPlacements, placement]
    }

    const now = new Date()
    const maxDays = next.reduce((m, p) => Math.max(m, PLACEMENT_DAYS[p] || 0), 0)
    const until = maxDays > 0 ? new Date(now.getTime() + maxDays * 86400000) : null
    const primaryTier = PRIORITY.find(p => next.includes(p)) || 'basic'
    const hasPremium = next.includes('premium') || next.includes('homepage')

    const update: Record<string, unknown> = {
      placements: next,
      tier: primaryTier,
      tier_expires_at: until?.toISOString() ?? null,
      featured_until: until?.toISOString() ?? null,
      premium: hasPremium,
      active: true,
      status: 'approved',
    }
    await supabase.from('listings').update(update).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...update } : l))
  }

  async function setListingCategory(id: string, category: string) {
    const supabase = createClient()
    await supabase.from('listings').update({ category }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, category } : l))
  }

  async function featureListing(id: string, days: number) {
    const supabase = createClient()
    const until = new Date()
    until.setDate(until.getDate() + days)
    await supabase.from('listings').update({ featured_until: until.toISOString(), premium: true, active: true, status: 'approved', tier_expires_at: until.toISOString() }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, featured_until: until.toISOString(), premium: true, active: true, status: 'approved' } : l))
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this advertisement? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function toggleUser(id: string, field: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('profiles').update({ [field]: !current }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: !current } : u))
  }

  async function setUserRole(id: string, role: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ role }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
  }

  async function approveVerification(verifId: string, userId: string) {
    setVerifWorking(verifId)
    setVerifMsg(null)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { error: e1 } = await supabase
      .from('identity_verifications')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewer_id: session?.user.id })
      .eq('id', verifId)
    if (e1) {
      setVerifMsg({ id: verifId, ok: false, text: `Failed to approve: ${e1.message}` })
      setVerifWorking(null)
      return
    }
    await supabase.from('profiles').update({ verified: true }).eq('id', userId)
    await supabase.from('notifications').insert({
      user_id: userId, type: 'verification',
      title: '✓ You are now verified!',
      body: 'Your identity has been verified. You can now publish advertisements on SecretXperience.',
      link: '/listings/create',
    })
    setVerifications(prev => prev.map(v => v.id === verifId ? { ...v, status: 'approved' } : v))
    setVerifMsg({ id: verifId, ok: true, text: 'Approved — advertiser can now publish listings.' })
    setVerifWorking(null)
  }

  async function rejectVerification(verifId: string, userId: string) {
    setVerifWorking(verifId)
    setVerifMsg(null)
    const supabase = createClient()
    const { error: e1 } = await supabase
      .from('identity_verifications')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', verifId)
    if (e1) {
      setVerifMsg({ id: verifId, ok: false, text: `Failed to reject: ${e1.message}` })
      setVerifWorking(null)
      return
    }
    await supabase.from('notifications').insert({
      user_id: userId, type: 'verification',
      title: 'Verification update',
      body: 'We were unable to verify your profile at this time. Please resubmit with clearer documents or contact support.',
      link: '/verify',
    })
    setVerifications(prev => prev.map(v => v.id === verifId ? { ...v, status: 'rejected' } : v))
    setVerifMsg({ id: verifId, ok: true, text: 'Rejected — advertiser notified.' })
    setVerifWorking(null)
  }

  async function grantTokens(email: string, amount: number, note?: string): Promise<{ ok: boolean; text: string }> {
    const res = await fetch('/api/admin/grant-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount, note }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, text: data.error || 'Grant failed' }
    return { ok: true, text: `Granted ${data.granted} tokens. New balance: ${data.newBalance}` }
  }

  async function runFocusBackfill() {
    setBfRunning(true); setBfDone(0); setBfSkipped(0); setBfErrors(0); setBfLog([])
    bfAbort.current = false
    const supabase = createClient()
    const log = (msg: string) => setBfLog(prev => [msg, ...prev].slice(0, 80))

    // Fetch all listings that have at least one image.
    const { data: all, error } = await supabase
      .from('listings').select('id, title, images, image_focus').not('images', 'is', null)
    if (error || !all) { log('❌ Failed to load listings: ' + (error?.message || 'unknown')); setBfRunning(false); return }
    setBfTotal(all.length)

    let done = 0, skipped = 0, errors = 0
    for (const listing of all) {
      if (bfAbort.current) { log('⏹ Stopped.'); break }
      const images: string[] = listing.images || []
      const existingFocus: Record<string, { x: number; y: number }> = listing.image_focus || {}
      const newFocus = { ...existingFocus }
      let changed = false

      for (const url of images) {
        if (!url) continue
        if (existingFocus[url]) continue  // already has manual/auto focus — skip
        try {
          const img = await imageFromUrl(url)
          const pt = await detectFocalPoint(img)
          newFocus[url] = pt
          changed = true
        } catch {
          errors++; log(`⚠ ${listing.title || listing.id}: could not load image`)
        }
      }

      if (changed) {
        const { error: upErr } = await supabase
          .from('listings').update({ image_focus: newFocus }).eq('id', listing.id)
        if (upErr) { errors++; log(`❌ ${listing.title || listing.id}: save failed`) }
        else { done++; log(`✓ ${listing.title || listing.id}`) }
      } else {
        skipped++
      }
      setBfDone(d => d + (changed && !errors ? 1 : 0))
      setBfSkipped(s => s + (changed ? 0 : 1))
      setBfErrors(errors)
    }

    log(`Done — ${done} updated, ${skipped} already complete, ${errors} errors.`)
    setBfRunning(false)
  }

  async function runKeywords() {
    const keywords = kwInput.split('\n').map(s => s.trim()).filter(Boolean)
    if (keywords.length === 0) { setKwError('Enter at least one keyword (one per line).'); return }
    setKwLoading(true); setKwError(null); setKwResults([])
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, market: kwMarket, language: kwLang, mode: kwMode }),
      })
      const data = await res.json()
      if (!res.ok) { setKwError(data.error || 'Request failed.'); setKwResults(data.results || []) }
      else { setKwResults(data.results || []); if (data.note) setKwError(data.note) }
    } catch {
      setKwError('Network error reaching the keyword API.')
    } finally {
      setKwLoading(false)
    }
  }

  const filteredListings = listings.filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredBookings = bookings.filter(b => !search ||
    b.listings?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.status?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredNlSubs = nlSubs.filter(s => !search || s.email?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '0.5px solid rgba(197,160,90,0.2)', borderTop: '0.5px solid var(--gold, #c5a05a)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--t3, #4c4a47)', fontSize: '13px', fontFamily: 'var(--sans)' }}>Loading admin panel…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!isAdmin) return null

  return (
    <div className="adm-shell" style={{ minHeight: '100vh', background: 'var(--bg, #050505)', color: 'var(--t, #ece8e1)', fontFamily: 'var(--sans)', display: 'flex' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--gbrd, rgba(197,160,90,0.2));border-radius:4px}
        .adm-tr:hover td { background: var(--bg2, rgba(255,255,255,0.02)); }
        .adm-action-btn { transition: opacity var(--t-fast, 0.15s); }
        .adm-action-btn:hover { opacity: 0.8; }
        .adm-tab-btn:hover { color: var(--gold, #c5a05a) !important; }
        .adm-hamburger { display: none; }
        .adm-nav-overlay { display: none; }
        @media (max-width: 768px) {
          /* Sidebar becomes an off-canvas slide-in/out drawer */
          .adm-sidebar {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 260px !important; max-width: 82vw !important; height: 100vh !important;
            z-index: 120 !important;
            transform: translateX(-100%); transition: transform 0.28s ease;
            border-right: 0.5px solid var(--b, rgba(255,255,255,0.06)) !important;
            box-shadow: 8px 0 40px rgba(0,0,0,0.55);
          }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-sidebar-brand { display: block !important; }
          .adm-sidebar nav { flex-direction: column !important; overflow-y: auto !important; padding: 0.5rem 0 !important; }
          .adm-tab-btn { border-left: 2px solid transparent !important; white-space: nowrap; }
          .adm-sidebar-footer { display: block !important; }

          /* Hamburger toggle + overlay */
          .adm-hamburger {
            display: inline-flex !important; align-items: center; justify-content: center;
            width: 40px; height: 40px; flex-shrink: 0;
            background: var(--bg2, rgba(255,255,255,0.05)); border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
            border-radius: 10px; color: var(--gold, #c5a05a); font-size: 20px; cursor: pointer;
          }
          .adm-nav-overlay.open {
            display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.55);
            z-index: 110; backdrop-filter: blur(2px);
          }

          .adm-main { overflow: visible !important; }
          .adm-main-header {
            flex-direction: row !important; align-items: center !important; gap: 10px !important;
            flex-wrap: wrap !important; padding: 1rem !important;
          }
          .adm-search-input { width: 100% !important; }
          .adm-content { padding: 1rem !important; }
          .adm-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
          .adm-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }

          /* Users table → stacked cards so every action button is reachable */
          .adm-users-table { min-width: 0 !important; }
          .adm-users-table thead { display: none !important; }
          .adm-users-table, .adm-users-table tbody, .adm-users-table tr, .adm-users-table td { display: block !important; width: 100% !important; }
          .adm-users-table tr { border: 0.5px solid var(--b, rgba(255,255,255,0.08)) !important; border-radius: 12px; margin: 0 0 12px; padding: 4px 4px; }
          .adm-users-table td { padding: 8px 12px !important; }
          .adm-users-table td:last-child { border-top: 0.5px solid var(--b, rgba(255,255,255,0.06)) !important; margin-top: 4px; }
          .adm-users-table td:last-child > div { flex-wrap: wrap !important; }
          .adm-users-table td:last-child .adm-action-icon-btn { flex: 1 1 auto; justify-content: center; min-width: 92px; }
        }
        .adm-search-input {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, #111);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
          border-radius: var(--r, 8px);
          color: var(--t, #ece8e1);
          font: 400 13px/1 var(--sans);
          width: 240px;
          outline: none;
          transition: border-color var(--t-fast, 0.15s), box-shadow var(--t-fast, 0.15s);
        }
        .adm-search-input:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }
        .adm-action-icon-btn {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          border-radius: var(--r, 8px);
          padding: 6px 10px;
          cursor: pointer;
          font-size: 13px;
          transition: opacity var(--t-fast, 0.15s), background var(--t-fast, 0.15s), border-color var(--t-fast, 0.15s);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .adm-action-icon-btn:hover { opacity: 0.85; }
      `}</style>

      {/* ── Mobile nav overlay (tap to close drawer) ── */}
      <div className={`adm-nav-overlay${navOpen ? ' open' : ''}`} onClick={() => setNavOpen(false)} aria-hidden={!navOpen} />

      {/* ── Sidebar ── */}
      <div className={`adm-sidebar${navOpen ? ' open' : ''}`} style={{ width: '220px', background: 'var(--bg1, #080808)', borderRight: '0.5px solid var(--b, rgba(255,255,255,0.06))', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div className="adm-sidebar-brand" style={{ padding: '1.5rem', borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.06))' }}>
          <div style={{ fontFamily: 'var(--serif)', color: 'var(--gold, #c5a05a)', fontSize: '18px', marginBottom: '6px' }}>SecretXperience</div>
          <div style={{ display: 'inline-block', background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', borderRadius: '20px', padding: '3px 10px', font: '600 10px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin</div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {TABS.map(t => (
            <button key={t} className="adm-tab-btn" onClick={() => {
              currentTab.current = t
              setTab(t)
              setBadges(b => ({ ...b, [t]: 0 }))
              saveLastSeen(t)
              setNavOpen(false)
            }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1.5rem', background: tab === t ? 'var(--gbg, rgba(197,160,90,0.08))' : 'transparent', border: 'none', borderLeft: tab === t ? '2px solid var(--gold, #c5a05a)' : '2px solid transparent', color: tab === t ? 'var(--gold, #c5a05a)' : 'var(--t2, #8c8880)', cursor: 'pointer', font: `${tab === t ? 600 : 400} 13px/1 var(--sans)`, textAlign: 'left', transition: 'all var(--t-fast, .15s) var(--ease-out)', position: 'relative' }}>
              <i className={`ti ti-${TAB_ICONS[t]}`} style={{ fontSize: '16px' }} aria-hidden="true" />
              <span style={{ flex: 1 }}>{t}</span>
              {badges[t] > 0 && (
                <span style={{ minWidth: '18px', height: '18px', borderRadius: '9px', background: '#e0607a', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', lineHeight: 1 }}>
                  {badges[t] > 99 ? '99+' : badges[t]}
                </span>
              )}
            </button>
          ))}
          <a href="/admin/community" className="adm-tab-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1.5rem', textDecoration: 'none', background: 'transparent', borderLeft: '2px solid transparent', color: 'var(--t2, #8c8880)', font: '400 13px/1 var(--sans)' }}>
            <i className="ti ti-building-community" style={{ fontSize: '16px' }} aria-hidden="true" />
            <span style={{ flex: 1 }}>Community</span>
            <i className="ti ti-external-link" style={{ fontSize: '13px', opacity: 0.6 }} aria-hidden="true" />
          </a>
        </nav>
        <div className="adm-sidebar-footer" style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))' }}>
          <button onClick={() => window.location.href = '/'} style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: 'var(--r, 8px)', color: 'var(--t3, #4c4a47)', cursor: 'pointer', font: '400 12px/1 var(--sans)' }}>← Back to site</button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="adm-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Page header ── */}
        <div className="adm-main-header" style={{ background: 'var(--bg1, #080808)', borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.06))', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button className="adm-hamburger" onClick={() => setNavOpen(true)} aria-label="Open menu"><i className="ti ti-menu-2" aria-hidden="true" /></button>
            <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: '36px', color: 'var(--t, #ece8e1)', margin: 0, lineHeight: 1.1 }}>{tab}</h1>
            <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)', marginTop: '4px', letterSpacing: '0.04em' }}>
              {tab === 'Listings' ? `${filteredListings.length} listings` : tab === 'Users' ? `${filteredUsers.length} users` : tab === 'Reports' ? `${reports.filter(r => r.status === 'open').length} open · ${reports.length} total` : tab === 'Newsletter' ? (search ? `${filteredNlSubs.length} of ${nlSubCount ?? '…'} subscribers` : `${nlSubCount ?? '…'} subscribers`) : tab === 'Contacts' ? `${optinContacts.length} opted-in · ${leads.length} leads` : tab === 'Acquisition' ? `${acqTotal} tracked signups · ${acq.length} sources` : tab === 'Keywords' ? `${kwResults.length ? `${kwResults.length} results` : 'SEO research'}` : tab === 'Tools' ? 'Admin tools' : `${filteredBookings.length} bookings`}
            </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', borderRadius: '20px', padding: '3px 10px', font: '600 10px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>ADMIN</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}…`}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-content" style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>

          {/* ── Stats row ── */}
          <div className="adm-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: 'ti-layout-list', label: 'Active Advertisements', value: stats.listings, sub: 'total advertisements' },
              { icon: 'ti-users',       label: 'Total Users',     value: stats.users,    sub: 'registered' },
              { icon: 'ti-calendar-event', label: 'Bookings',     value: stats.bookings, sub: 'all time' },
              { icon: 'ti-coin-euro',   label: 'Revenue',         value: `€${(stats.revenue / 100).toLocaleString()}`, sub: 'confirmed bookings' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ font: '600 9px/1 var(--sans)', color: 'var(--t3, #4c4a47)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <i className={`ti ${stat.icon}`} style={{ marginRight: '5px', fontSize: '10px' }} aria-hidden="true" />
                  {stat.label}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', fontWeight: 500, color: 'var(--gold, #c5a05a)', lineHeight: 1, letterSpacing: '-0.01em', marginBottom: '6px' }}>{stat.value}</div>
                <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)', letterSpacing: '0.04em' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Listings table ── */}
          {tab === 'Listings' && (
            <div className="adm-table-wrap" style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                    {['Title / Location', 'Category', 'Advertiser', 'Price', 'Status / Tier', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans)' }}>No advertisements found</td></tr>}
                  {filteredListings.map(l => (
                    <tr key={l.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))', color: 'var(--t, #ece8e1)', transition: 'background var(--t-fast, .1s)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <a href={`/listings/${l.id}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: l.active ? 'var(--t, #ece8e1)' : 'var(--t3, #4c4a47)', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold, #c5a05a)')} onMouseLeave={e => (e.currentTarget.style.color = l.active ? 'var(--t, #ece8e1)' : 'var(--t3, #4c4a47)')}>{l.title} ↗</a>
                        {l.city && <div style={{ font: '11px/1 var(--sans)', color: 'var(--t3, #4c4a47)', marginTop: '3px' }}><i className="ti ti-map-pin" style={{ fontSize: 10 }} /> {l.city}{l.country ? `, ${l.country}` : ''}</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={ADMIN_CATEGORIES.includes(l.category) ? l.category : ''}
                          onChange={e => setListingCategory(l.id, e.target.value)}
                          title="Change listing category"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--t2, #8c8880)', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: '20px', padding: '4px 10px', font: '500 11px/1 var(--sans)', letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'capitalize', outline: 'none' }}
                        >
                          {!ADMIN_CATEGORIES.includes(l.category) && <option value="" disabled>{l.category || '— none —'}</option>}
                          {ADMIN_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a1418', textTransform: 'capitalize' }}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{l.profiles?.full_name || l.profiles?.username || '—'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--gold, #c5a05a)', fontSize: '12px', fontWeight: 500 }}>{l.price_from ? `€${l.price_from}` : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <span style={{ background: l.active ? 'rgba(38,212,160,0.12)' : 'rgba(184,77,114,0.12)', color: l.active ? 'var(--verified, #1dc9a0)' : 'var(--wine, #b84d72)', padding: '2px 8px', borderRadius: '20px', font: '700 10px/1 var(--sans)', letterSpacing: '0.1em' }}>{l.active ? '● Live' : '● Hidden'}</span>
                            {l.verified && <span style={{ background: 'rgba(38,212,160,0.12)', color: 'var(--verified, #1dc9a0)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Verified</span>}
                            {!l.active && l.status && <span style={{ background: 'rgba(245,168,38,0.12)', color: '#f5a826', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>{l.status}</span>}
                          </div>
                          {/* Tier badge */}
                          {(() => {
                            const tierColors: Record<string, string> = { basic: 'rgba(236,232,225,0.4)', featured: '#c5a05a', slider: '#b0a0f8', section: '#5ec8c0', premium: '#f5a826', homepage: '#e8c97a' }
                            const tierBg: Record<string, string> = { basic: 'rgba(255,255,255,0.04)', featured: 'rgba(197,160,90,0.1)', slider: 'rgba(176,160,248,0.1)', section: 'rgba(94,200,192,0.1)', premium: 'rgba(245,168,38,0.1)', homepage: 'rgba(232,201,122,0.1)' }
                            const tier = l.tier || 'basic'
                            const exp = l.tier_expires_at ? new Date(l.tier_expires_at) : null
                            const expStr = exp && exp > new Date() ? ` · until ${exp.toLocaleDateString('en-GB', { day:'numeric', month:'short' })}` : ''
                            return <span style={{ background: tierBg[tier], color: tierColors[tier], padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.06em', width: 'fit-content' }}>{tier.charAt(0).toUpperCase() + tier.slice(1)}{expStr}</span>
                          })()}
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {/* Row 1: Verify + Show/Hide + Delete */}
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                              className="adm-action-icon-btn adm-action-btn"
                              onClick={() => toggleListing(l.id, 'verified', l.verified)}
                              style={{ color: l.verified ? 'var(--t2, #8c8880)' : 'var(--verified, #1dc9a0)', borderColor: l.verified ? 'var(--b2)' : 'rgba(38,212,160,0.3)' }}
                              title={l.verified ? 'Remove verification' : 'Verify advertisement'}
                            >
                              <i className={`ti ${l.verified ? 'ti-circle-x' : 'ti-circle-check'}`} aria-hidden="true" />
                              <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{l.verified ? 'Unverify' : 'Verify'}</span>
                            </button>
                            <button
                              className="adm-action-icon-btn adm-action-btn"
                              onClick={() => toggleListing(l.id, 'active', l.active)}
                              style={{ color: l.active ? 'var(--wine, #b84d72)' : 'var(--verified, #1dc9a0)', borderColor: l.active ? 'rgba(184,77,114,0.3)' : 'rgba(38,212,160,0.3)' }}
                              title={l.active ? 'Hide advertisement' : 'Show advertisement'}
                            >
                              <i className={`ti ${l.active ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true" />
                              <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{l.active ? 'Hide' : 'Show'}</span>
                            </button>
                            <button
                              className="adm-action-icon-btn adm-action-btn"
                              onClick={() => deleteListing(l.id)}
                              style={{ color: 'var(--danger, #e2536b)', borderColor: 'rgba(226,83,107,0.3)' }}
                              title="Delete advertisement permanently"
                            >
                              <i className="ti ti-trash" aria-hidden="true" />
                            </button>
                          </div>
                          {/* Row 2: Placements — multi-select. Basic clears all; others stack. */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ font: '500 9px/1 var(--sans)', color: 'var(--t3)', letterSpacing: '0.1em', marginRight: 2 }}>TIER:</span>
                            {(() => {
                              const placements: string[] = Array.isArray((l as any).placements)
                                ? (l as any).placements
                                : (l.tier && l.tier !== 'basic' ? [l.tier] : [])
                              return (['basic', 'featured', 'slider', 'section', 'premium', 'homepage'] as const).map(tier => {
                                const active = tier === 'basic' ? placements.length === 0 : placements.includes(tier)
                                const colors: Record<string, string> = { basic: 'rgba(236,232,225,0.5)', featured: '#c5a05a', slider: '#b0a0f8', section: '#5ec8c0', premium: '#f5a826', homepage: '#e8c97a' }
                                const labels: Record<string, string> = { basic: 'Basic', featured: 'Featured 7d', slider: 'Slider 7d', section: 'Section 7d', premium: 'Premium 30d', homepage: 'Homepage 30d' }
                                return (
                                  <button
                                    key={tier}
                                    className="adm-action-icon-btn adm-action-btn"
                                    onClick={() => toggleListingPlacement(l.id, tier)}
                                    style={{ color: active ? colors[tier] : 'var(--t3)', borderColor: active ? colors[tier] : 'var(--b2)', background: active ? `${colors[tier]}18` : 'transparent', opacity: active ? 1 : 0.7 }}
                                    title={tier === 'basic' ? 'Clear all placements' : `Toggle placement: ${labels[tier]}`}
                                  >
                                    <span style={{ font: `${active ? '700' : '500'} 10px/1 var(--sans)`, letterSpacing: '0.05em' }}>{active && tier !== 'basic' ? '✓ ' : ''}{labels[tier]}</span>
                                  </button>
                                )
                              })
                            })()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Users tab ── */}
          {tab === 'Users' && (
            <>
            {/* Grant tokens panel */}
            <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--gbrd, rgba(197,160,90,0.2))', borderRadius: 'var(--rl, 13px)', padding: '20px 24px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <i className="ti ti-coins" style={{ color: 'var(--gold)', fontSize: '16px' }} />
                <span style={{ font: '600 13px/1 var(--sans)', color: 'var(--gold)' }}>Grant Tokens to User</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 200px' }}>
                  <label style={{ font: '500 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>Email</label>
                  <input
                    value={grantEmail}
                    onChange={e => setGrantEmail(e.target.value)}
                    placeholder="user@email.com"
                    style={{ background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', padding: '8px 12px', font: '400 13px/1 var(--sans)', outline: 'none', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '0 0 120px' }}>
                  <label style={{ font: '500 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={grantAmount}
                    onChange={e => setGrantAmount(e.target.value)}
                    style={{ background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', padding: '8px 12px', font: '400 13px/1 var(--sans)', outline: 'none', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 150px' }}>
                  <label style={{ font: '500 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>Note (optional)</label>
                  <input
                    value={grantNote}
                    onChange={e => setGrantNote(e.target.value)}
                    placeholder="Dev account, promo, etc."
                    style={{ background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', padding: '8px 12px', font: '400 13px/1 var(--sans)', outline: 'none', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    disabled={grantLoading || !grantEmail || !grantAmount}
                    onClick={async () => {
                      setGrantLoading(true); setGrantMsg(null)
                      const r = await grantTokens(grantEmail, parseInt(grantAmount), grantNote || undefined)
                      setGrantMsg(r)
                      if (r.ok) { setGrantEmail(''); setGrantNote('') }
                      setGrantLoading(false)
                    }}
                    style={{ background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', borderRadius: 'var(--r)', color: 'var(--gold)', padding: '8px 16px', font: '600 12px/1 var(--sans)', cursor: 'pointer', opacity: grantLoading ? 0.6 : 1 }}
                  >
                    {grantLoading ? 'Granting…' : 'Grant'}
                  </button>
                  <button
                    disabled={grantLoading || !grantEmail}
                    onClick={async () => {
                      setGrantLoading(true); setGrantMsg(null)
                      const r = await grantTokens(grantEmail, 999999, 'Unlimited dev account')
                      setGrantMsg(r)
                      if (r.ok) { setGrantEmail(''); setGrantNote('') }
                      setGrantLoading(false)
                    }}
                    style={{ background: 'rgba(99,102,241,0.12)', border: '0.5px solid rgba(99,102,241,0.3)', borderRadius: 'var(--r)', color: '#818cf8', padding: '8px 16px', font: '600 12px/1 var(--sans)', cursor: 'pointer', opacity: grantLoading ? 0.6 : 1, whiteSpace: 'nowrap' }}
                  >
                    Unlimited (999k)
                  </button>
                </div>
              </div>
              {grantMsg && (
                <div style={{ marginTop: '10px', font: '500 12px/1.4 var(--sans)', color: grantMsg.ok ? '#26d4a0' : '#b84d72' }}>
                  {grantMsg.ok ? '✓ ' : '✕ '}{grantMsg.text}
                </div>
              )}
            </div>

          {/* ── Users table ── */}
            <div className="adm-table-wrap" style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
              <table className="adm-users-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '640px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                    {['User', 'Role', 'Joined', 'Tokens', 'Badges', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans)' }}>No users found</td></tr>}
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))', color: 'var(--t, #ece8e1)', transition: 'background var(--t-fast, .1s)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{u.full_name || u.username || 'Anonymous'}</div>
                        <div style={{ font: '400 10px/1 monospace', color: 'var(--t3, #4c4a47)', marginTop: '3px' }}>{u.email || u.id.slice(0, 12) + '…'}</div>
                        {(u.phone || u.whatsapp) && (
                          <div style={{ font: '400 10px/1 monospace', color: u.phone_verified ? '#4aa8ff' : 'var(--t3, #4c4a47)', marginTop: '2px' }}>
                            {u.phone || u.whatsapp}{u.phone_verified ? ' ✓' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(() => {
                            const role = u.role || 'user'
                            const roleStyles: Record<string, { bg: string; color: string }> = {
                              admin:    { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
                              provider: { bg: 'rgba(197,160,90,0.15)',  color: 'var(--gold, #c5a05a)' },
                              venue:    { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
                              creator:  { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
                              user:     { bg: 'rgba(255,255,255,0.06)', color: 'var(--t2, #8c8880)' },
                            }
                            const roleLabels: Record<string, string> = { provider: 'Advertiser', user: 'Member', venue: 'Venue', creator: 'Creator', admin: 'Admin' }
                            const s = roleStyles[role] || roleStyles.user
                            return <span style={{ display: 'inline-block', background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '20px', font: '600 10px/1.4 var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{roleLabels[role] || role}</span>
                          })()}
                          <select value={u.role || 'user'} onChange={e => setUserRole(u.id, e.target.value)} style={{ background: 'var(--bg2, #151515)', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: 'var(--r, 6px)', color: 'var(--t, #ece8e1)', padding: '5px 10px', font: '400 12px/1 var(--sans)', cursor: 'pointer', outline: 'none', width: '110px' }}>
                            <option value="user">Member</option>
                            <option value="provider">Advertiser</option>
                            <option value="venue">Venue</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {u.wallet ? (
                          <div>
                            <div style={{ font: '600 13px/1 var(--sans)', color: 'var(--gold)' }}>{u.wallet.balance.toLocaleString()}</div>
                            <div style={{ font: '400 10px/1 var(--sans)', color: 'var(--t3)', marginTop: '3px' }}>
                              {u.wallet.total_purchased > 0 ? `${u.wallet.total_purchased.toLocaleString()} bought` : 'no purchases'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--t3)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {u.verified && <span style={{ background: 'rgba(38,212,160,0.12)', color: 'var(--verified, #1dc9a0)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Verified</span>}
                          {u.premium && <span style={{ background: 'var(--gbg)', color: 'var(--gold)', padding: '2px 7px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.08em' }}>Premium</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleUser(u.id, 'verified', u.verified)}
                            style={{ color: u.verified ? 'var(--t2, #8c8880)' : 'var(--verified, #1dc9a0)', borderColor: u.verified ? 'var(--b2)' : 'rgba(38,212,160,0.3)' }}
                          >
                            <i className={`ti ${u.verified ? 'ti-x' : 'ti-circle-check'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{u.verified ? 'Unverify' : 'Verify'}</span>
                          </button>
                          <button
                            className="adm-action-icon-btn adm-action-btn"
                            onClick={() => toggleUser(u.id, 'premium', u.premium)}
                            style={{ color: u.premium ? 'var(--t2, #8c8880)' : 'var(--gold, #c5a05a)', borderColor: u.premium ? 'var(--b2)' : 'var(--gbrd)' }}
                          >
                            <i className={`ti ${u.premium ? 'ti-star-off' : 'ti-star'}`} aria-hidden="true" />
                            <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{u.premium ? 'Unpremium' : 'Premium'}</span>
                          </button>
                          {(u.phone || u.whatsapp) && (
                            <button
                              className="adm-action-icon-btn adm-action-btn"
                              title={u.phone || u.whatsapp}
                              onClick={() => toggleUser(u.id, 'phone_verified', u.phone_verified)}
                              style={{ color: u.phone_verified ? 'var(--t2, #8c8880)' : '#4aa8ff', borderColor: u.phone_verified ? 'var(--b2)' : 'rgba(74,168,255,0.3)' }}
                            >
                              <i className={`ti ${u.phone_verified ? 'ti-phone-off' : 'ti-phone-check'}`} aria-hidden="true" />
                              <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>{u.phone_verified ? 'Unverify #' : 'Verify #'}</span>
                            </button>
                          )}
                          {/* Inline token grant */}
                          {(() => {
                            const ig = inlineGrant
                            const igm = inlineGrantMsg
                            return ig !== null && ig.userId === u.id ? (
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <input
                                  type="number"
                                  min="1"
                                  value={ig.amount}
                                  onChange={e => setInlineGrant({ userId: u.id, amount: e.target.value })}
                                  style={{ width: '70px', background: 'var(--bg2)', border: '0.5px solid var(--gbrd)', borderRadius: 'var(--r)', color: 'var(--t)', padding: '5px 8px', font: '400 12px/1 var(--sans)', outline: 'none' }}
                                />
                                <button
                                  className="adm-action-icon-btn adm-action-btn"
                                  onClick={async () => {
                                    const r = await grantTokens(u.email, parseInt(ig.amount), 'Admin panel inline grant')
                                    setInlineGrantMsg({ userId: u.id, ...r })
                                    setInlineGrant(null)
                                  }}
                                  style={{ color: 'var(--gold)', borderColor: 'var(--gbrd)' }}
                                >
                                  <i className="ti ti-check" />
                                  <span style={{ font: '600 10px/1 var(--sans)' }}>Send</span>
                                </button>
                                <button
                                  className="adm-action-icon-btn adm-action-btn"
                                  onClick={() => setInlineGrant(null)}
                                  style={{ color: 'var(--t2)', borderColor: 'var(--b2)' }}
                                >
                                  <i className="ti ti-x" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="adm-action-icon-btn adm-action-btn"
                                  onClick={() => { setInlineGrant({ userId: u.id, amount: '500' }); setInlineGrantMsg(null) }}
                                  style={{ color: '#c084fc', borderColor: 'rgba(192,132,252,0.3)' }}
                                >
                                  <i className="ti ti-coins" aria-hidden="true" />
                                  <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>Tokens</span>
                                </button>
                                {igm !== null && igm.userId === u.id && (
                                  <span style={{ font: '500 10px/1 var(--sans)', color: igm.ok ? '#26d4a0' : '#b84d72' }}>
                                    {igm.ok ? '✓' : '✕'} {igm.text}
                                  </span>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}

          {/* ── Verification requests ── */}
          {tab === 'Verification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {verifications.length === 0 && (
                <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '3rem', textAlign: 'center', color: 'var(--t3)' }}>
                  No verification submissions yet
                </div>
              )}
              {verifications.map(v => {
                const profile = v.profiles || {}
                const statusColor = v.status === 'approved' ? '#26d4a0' : v.status === 'rejected' ? '#b84d72' : '#f5a826'
                const statusBg = v.status === 'approved' ? 'rgba(38,212,160,0.1)' : v.status === 'rejected' ? 'rgba(184,77,114,0.1)' : 'rgba(245,168,38,0.1)'
                return (
                  <div key={v.id} style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{profile.full_name || profile.username || 'Anonymous'}</div>
                        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{profile.email} · {profile.role || 'user'}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
                          Submitted: {v.submitted_at ? new Date(v.submitted_at).toLocaleString() : '—'}
                          {v.reviewed_at && ` · Reviewed: ${new Date(v.reviewed_at).toLocaleString()}`}
                        </div>
                        {v.consent_given && (
                          <div style={{ fontSize: 11, color: '#26d4a0', marginTop: 3 }}>
                            ✓ Consent given{v.consent_at ? ` · ${new Date(v.consent_at).toLocaleString()}` : ''}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: statusBg, color: statusColor }}>
                            {v.status}
                          </span>
                          {v.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveVerification(v.id, v.user_id)}
                                disabled={verifWorking === v.id}
                                style={{ padding: '6px 14px', background: 'rgba(38,212,160,0.1)', border: '0.5px solid rgba(38,212,160,0.3)', borderRadius: 6, color: '#26d4a0', cursor: verifWorking === v.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: verifWorking === v.id ? 0.5 : 1 }}
                              >
                                {verifWorking === v.id ? '…' : '✓ Approve'}
                              </button>
                              <button
                                onClick={() => rejectVerification(v.id, v.user_id)}
                                disabled={verifWorking === v.id}
                                style={{ padding: '6px 14px', background: 'rgba(184,77,114,0.1)', border: '0.5px solid rgba(184,77,114,0.3)', borderRadius: 6, color: '#b84d72', cursor: verifWorking === v.id ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: verifWorking === v.id ? 0.5 : 1 }}
                              >
                                {verifWorking === v.id ? '…' : '✗ Reject'}
                              </button>
                            </>
                          )}
                        </div>
                        {verifMsg !== null && verifMsg.id === v.id && (
                          <div style={{ fontSize: 11, color: verifMsg.ok ? '#26d4a0' : '#b84d72', fontWeight: 500 }}>
                            {verifMsg.text}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Document thumbnails */}
                    <div style={{ display: 'flex', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
                      {v.doc_front_url && (
                        <a href={v.doc_front_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none' }}>
                          <img src={v.doc_front_url} alt="ID Front" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--b2)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>ID Front ↗</span>
                        </a>
                      )}
                      {v.doc_back_url && (
                        <a href={v.doc_back_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none' }}>
                          <img src={v.doc_back_url} alt="ID Back" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--b2)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>ID Back ↗</span>
                        </a>
                      )}
                      {v.selfie_url && (
                        <a href={v.selfie_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none' }}>
                          <img src={v.selfie_url} alt="Selfie" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '0.5px solid var(--b2)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>Selfie ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Newsletter broadcast ── */}
          {tab === 'Newsletter' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--t2)' }}>
                  {nlSubCount !== null ? <><strong style={{ color: 'var(--gold)' }}>{nlSubCount}</strong> subscribers</> : 'Loading…'}
                </div>
              </div>

              {/* Broadcast form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 600 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6, fontFamily: 'var(--sans)' }}>Subject line</label>
                  <input
                    value={nlSubject}
                    onChange={e => setNlSubject(e.target.value)}
                    placeholder="e.g. New listings this week — exclusive access"
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 10, color: 'var(--t)', fontSize: 14, fontFamily: 'var(--sans)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6, fontFamily: 'var(--sans)' }}>Email body (HTML or plain text)</label>
                  <textarea
                    value={nlBody}
                    onChange={e => setNlBody(e.target.value)}
                    rows={10}
                    placeholder={`<h2>Hello from SecretXperience</h2>\n<p>This week we have...</p>`}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 10, color: 'var(--t)', fontSize: 13, fontFamily: 'var(--sans)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>
                <button
                  disabled={nlSending || !nlSubject.trim() || !nlBody.trim()}
                  onClick={async () => {
                    if (!confirm(`Send to ${nlSubCount} subscribers?`)) return
                    setNlSending(true); setNlResult(null)
                    const res = await fetch('/api/newsletter/broadcast', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subject: nlSubject, html: nlBody }),
                    })
                    const json = await res.json()
                    setNlResult(res.ok ? `✓ Sent to ${json.sent ?? nlSubCount} subscribers` : `✗ ${json.error || 'Failed'}`)
                    setNlSending(false)
                  }}
                  style={{ alignSelf: 'flex-start', padding: '10px 28px', background: nlSending ? 'var(--bg3)' : 'linear-gradient(135deg,#c5a05a,#a07840)', color: nlSending ? 'var(--t3)' : '#0a0808', border: 'none', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', cursor: nlSending ? 'default' : 'pointer' }}
                >
                  {nlSending ? 'Sending…' : 'Send broadcast'}
                </button>
                {nlResult && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: nlResult.startsWith('✓') ? 'rgba(62,207,142,0.08)' : 'rgba(212,95,114,0.08)', border: `0.5px solid ${nlResult.startsWith('✓') ? 'rgba(62,207,142,0.3)' : 'rgba(212,95,114,0.3)'}`, color: nlResult.startsWith('✓') ? '#3ecf8e' : '#d45f72', fontSize: 13, fontFamily: 'var(--sans)' }}>
                    {nlResult}
                  </div>
                )}
              </div>

              {/* Subscriber list */}
              <div style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ font: '600 11px/1 var(--sans)', color: 'var(--t2, #8c8880)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      <i className="ti ti-mail" style={{ marginRight: '6px', color: 'var(--gold)' }} />
                      Subscribers
                    </div>
                    <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)' }}>{filteredNlSubs.filter(s => s.active).length} active · {filteredNlSubs.length}{search ? ` of ${nlSubs.length}` : ''} total</div>
                  </div>
                  <button
                    onClick={() => exportCsv(filteredNlSubs.map(s => ({ email: s.email, status: s.active ? 'active' : 'unsubscribed', subscribed_at: s.subscribed_at, unsubscribed_at: s.unsubscribed_at || '' })), `sx-newsletter-${new Date().toISOString().slice(0,10)}.csv`)}
                    className="adm-action-icon-btn"
                    style={{ color: 'var(--gold)', borderColor: 'var(--gbrd)', gap: '6px' }}
                    disabled={filteredNlSubs.length === 0}
                  >
                    <i className="ti ti-download" />
                    <span style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.08em' }}>Export CSV</span>
                  </button>
                </div>
                <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                        {['Email', 'Status', 'Subscribed'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {nlSubsLoading && <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>Loading…</td></tr>}
                      {!nlSubsLoading && filteredNlSubs.length === 0 && <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>{search ? `No subscribers matching "${search}"` : 'No subscribers yet'}</td></tr>}
                      {filteredNlSubs.map(s => (
                        <tr key={s.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>{s.email}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, font: '600 10px/1.4 var(--sans)', letterSpacing: '0.04em', background: s.active ? 'rgba(62,207,142,0.1)' : 'rgba(212,95,114,0.1)', color: s.active ? '#3ecf8e' : '#d45f72' }}>
                              {s.active ? 'Active' : 'Unsubscribed'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--t3, #4c4a47)', fontSize: '11px' }}>{s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Contacts tab ── */}
          {tab === 'Contacts' && (() => {
            const filteredOptins = optinContacts.filter(c =>
              (!contactFilter.country || (c.country || '').toLowerCase().includes(contactFilter.country.toLowerCase())) &&
              (!contactFilter.category || c.category === contactFilter.category)
            )
            const filteredLeads = leads.filter(l =>
              (!contactFilter.country || (l.country || '').toLowerCase().includes(contactFilter.country.toLowerCase())) &&
              (!contactFilter.category || l.category === contactFilter.category) &&
              (!contactFilter.status || l.status === contactFilter.status) &&
              (!search || (l.contact_name || '').toLowerCase().includes(search.toLowerCase()) || (l.email || '').toLowerCase().includes(search.toLowerCase()) || (l.business_name || '').toLowerCase().includes(search.toLowerCase()))
            )

            const LEAD_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
              new:       { bg: 'rgba(197,160,90,0.12)',  color: '#c5a05a' },
              contacted: { bg: 'rgba(100,170,255,0.12)', color: '#64aaff' },
              converted: { bg: 'rgba(30,207,142,0.12)',  color: '#1ecf8e' },
              declined:  { bg: 'rgba(184,77,114,0.12)',  color: '#b84d72' },
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    placeholder="Country…"
                    value={contactFilter.country}
                    onChange={e => setContactFilter(f => ({ ...f, country: e.target.value }))}
                    className="adm-search-input"
                    style={{ width: '140px' }}
                  />
                  <select
                    value={contactFilter.category}
                    onChange={e => setContactFilter(f => ({ ...f, category: e.target.value }))}
                    style={{ height: '44px', padding: '0 10px', background: 'var(--bg3, #111)', border: '0.5px solid var(--b2, rgba(255,255,255,0.08))', borderRadius: 'var(--r, 8px)', color: 'var(--t, #ece8e1)', font: '400 13px/1 var(--sans)', outline: 'none' }}
                  >
                    <option value="">All categories</option>
                    <option value="escort_agency">Escort agency</option>
                    <option value="venue">Venue</option>
                    <option value="nightlife">Nightlife</option>
                    <option value="massage">Massage</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={contactFilter.status}
                    onChange={e => setContactFilter(f => ({ ...f, status: e.target.value }))}
                    style={{ height: '44px', padding: '0 10px', background: 'var(--bg3, #111)', border: '0.5px solid var(--b2, rgba(255,255,255,0.08))', borderRadius: 'var(--r, 8px)', color: 'var(--t, #ece8e1)', font: '400 13px/1 var(--sans)', outline: 'none' }}
                  >
                    <option value="">All statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="declined">Declined</option>
                  </select>
                  <button
                    onClick={() => setContactFilter({ country: '', category: '', status: '' })}
                    style={{ height: '44px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: 'var(--r, 8px)', color: 'var(--t3, #4c4a47)', cursor: 'pointer', font: '400 12px/1 var(--sans)' }}
                  >Clear</button>
                </div>

                {/* Section 1: Advertiser WhatsApp opt-ins */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ font: '600 11px/1 var(--sans)', color: 'var(--t2, #8c8880)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        <i className="ti ti-brand-whatsapp" style={{ marginRight: '6px', color: '#25d366' }} />
                        Advertiser WhatsApp Opt-ins
                      </div>
                      <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)' }}>{filteredOptins.length} advertisers with phone + consent</div>
                    </div>
                    <button
                      onClick={() => exportCsv(filteredOptins.map(c => ({ title: c.title, category: c.category, city: c.city, country: c.country, phone: c.contact_phone, optin_date: c.created_at })), `sx-whatsapp-optins-${new Date().toISOString().slice(0,10)}.csv`)}
                      className="adm-action-icon-btn"
                      style={{ color: 'var(--gold)', borderColor: 'var(--gbrd)', gap: '6px' }}
                    >
                      <i className="ti ti-download" />
                      <span style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.08em' }}>Export CSV</span>
                    </button>
                  </div>
                  <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                          {['Listing', 'Category', 'City', 'Country', 'Phone', 'Opted In'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOptins.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>No opted-in advertisers yet</td></tr>}
                        {filteredOptins.map(c => (
                          <tr key={c.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || '—'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{c.category || '—'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{c.city || '—'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{c.country || '—'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <a href={`https://wa.me/${(c.contact_phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <i className="ti ti-brand-whatsapp" style={{ fontSize: '14px' }} />
                                {c.contact_phone}
                              </a>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--t3, #4c4a47)', fontSize: '11px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 2: B2B Leads */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ font: '600 11px/1 var(--sans)', color: 'var(--t2, #8c8880)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        <i className="ti ti-building" style={{ marginRight: '6px', color: 'var(--gold)' }} />
                        B2B Leads
                      </div>
                      <div style={{ font: '300 11px/1 var(--sans)', color: 'var(--t3, #4c4a47)' }}>{filteredLeads.length} inbound inquiries via /advertise/agency</div>
                    </div>
                    <button
                      onClick={() => exportCsv(filteredLeads.map(l => ({ business: l.business_name, contact: l.contact_name, email: l.email, phone: l.phone, category: l.category, country: l.country, city: l.city, status: l.status, message: l.message, source: l.source, submitted: l.created_at })), `sx-leads-${new Date().toISOString().slice(0,10)}.csv`)}
                      className="adm-action-icon-btn"
                      style={{ color: 'var(--gold)', borderColor: 'var(--gbrd)', gap: '6px' }}
                    >
                      <i className="ti ti-download" />
                      <span style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.08em' }}>Export CSV</span>
                    </button>
                  </div>
                  <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                          {['Business', 'Contact', 'Email', 'Category', 'Location', 'Status', 'Submitted'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.length === 0 && <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>No leads yet</td></tr>}
                        {filteredLeads.map(l => (
                          <tr key={l.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{l.business_name || <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                            <td style={{ padding: '12px 16px' }}>{l.contact_name}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <a href={`mailto:${l.email}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{l.email}</a>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--t2)', fontSize: '12px' }}>{l.category || '—'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--t2)', fontSize: '12px' }}>{[l.city, l.country].filter(Boolean).join(', ') || '—'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', ...(LEAD_STATUS_COLORS[l.status] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--t2)' }) }}>{l.status}</span>
                                <select
                                  value={l.status}
                                  onChange={async e => {
                                    const newStatus = e.target.value
                                    const supabase = createClient()
                                    const upd: Record<string, unknown> = { status: newStatus }
                                    if (newStatus === 'contacted') upd.contacted_at = new Date().toISOString()
                                    await supabase.from('leads').update(upd).eq('id', l.id)
                                    setLeads(prev => prev.map(x => x.id === l.id ? { ...x, ...upd } : x))
                                  }}
                                  style={{ height: '28px', padding: '0 6px', background: 'var(--bg3, #111)', border: '0.5px solid var(--b2, rgba(255,255,255,0.08))', borderRadius: '6px', color: 'var(--t2)', font: '400 11px/1 var(--sans)', outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value="new">new</option>
                                  <option value="contacted">contacted</option>
                                  <option value="converted">converted</option>
                                  <option value="declined">declined</option>
                                </select>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '11px' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )
          })()}

          {/* ── Acquisition (signup attribution) ── */}
          {tab === 'Acquisition' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--t2)' }}>
                  Where your signups come from — <strong style={{ color: 'var(--gold)' }}>{acqTotal}</strong> tracked
                </div>
                <button
                  onClick={() => exportCsv(acq.map(a => ({ source: a.source, medium: a.medium, campaign: a.campaign, signups: a.signups, last_signup: a.last })), `sx-acquisition-${new Date().toISOString().slice(0,10)}.csv`)}
                  className="adm-action-icon-btn"
                  style={{ color: 'var(--gold)', borderColor: 'var(--gbrd)', gap: '6px' }}
                  disabled={acq.length === 0}
                >
                  <i className="ti ti-download" />
                  <span style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.08em' }}>Export CSV</span>
                </button>
              </div>
              <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                      {['Source', 'Medium', 'Campaign', 'Signups', 'Last signup'].map(h => (
                        <th key={h} style={{ textAlign: h === 'Signups' ? 'right' : 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {acqLoading && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>Loading…</td></tr>}
                    {!acqLoading && acq.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>No tracked signups yet — add UTM tags to your directory & ad links (see docs/marketing-rollout.md)</td></tr>}
                    {acq.map((a, i) => (
                      <tr key={i} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{a.source}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{a.medium}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{a.campaign}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>{a.signups}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--t3, #4c4a47)', fontSize: '11px' }}>{a.last ? new Date(a.last).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Keywords (DataForSEO) ── */}
          {tab === 'Keywords' && (
            <div>
              <div style={{ marginBottom: '1rem', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--t2)' }}>
                SEO keyword research — live volume, CPC & competition from <strong style={{ color: 'var(--gold)' }}>DataForSEO</strong>
              </div>
              <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                    Market
                    <select value={kwMarket} onChange={e => { const m = e.target.value; setKwMarket(m); setKwLang(({ be: 'nl', nl: 'nl', de: 'de', fr: 'fr', lu: 'fr', ch: 'de' } as any)[m] || 'en') }}
                      style={{ background: 'var(--bg2, #111)', color: 'var(--t)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '8px 10px', font: '400 13px var(--sans)' }}>
                      <option value="be">Belgium</option>
                      <option value="nl">Netherlands</option>
                      <option value="de">Germany</option>
                      <option value="fr">France</option>
                      <option value="lu">Luxembourg</option>
                      <option value="ch">Switzerland</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                    Language
                    <select value={kwLang} onChange={e => setKwLang(e.target.value)}
                      style={{ background: 'var(--bg2, #111)', color: 'var(--t)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '8px 10px', font: '400 13px var(--sans)' }}>
                      <option value="nl">Dutch</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="en">English</option>
                      <option value="it">Italian</option>
                      <option value="es">Spanish</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>
                    Mode
                    <select value={kwMode} onChange={e => setKwMode(e.target.value as 'volume' | 'ideas')}
                      style={{ background: 'var(--bg2, #111)', color: 'var(--t)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '8px 10px', font: '400 13px var(--sans)' }}>
                      <option value="volume">Exact volume (these terms)</option>
                      <option value="ideas">Keyword ideas (expand seeds)</option>
                    </select>
                  </label>
                </div>
                <textarea value={kwInput} onChange={e => setKwInput(e.target.value)} rows={5}
                  placeholder={'One keyword per line, e.g.\nescort brussels\nescort antwerpen\nprivé ontvangst brussel'}
                  style={{ width: '100%', background: 'var(--bg2, #111)', color: 'var(--t)', border: '0.5px solid var(--b)', borderRadius: '8px', padding: '10px 12px', font: '400 13px/1.6 var(--sans)', resize: 'vertical' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <button onClick={runKeywords} disabled={kwLoading}
                    style={{ background: 'var(--gold, #c5a05a)', color: '#0a0a0a', border: 'none', borderRadius: '8px', padding: '10px 20px', font: '600 13px var(--sans)', cursor: kwLoading ? 'wait' : 'pointer', opacity: kwLoading ? 0.6 : 1 }}>
                    {kwLoading ? 'Querying…' : 'Research'}
                  </button>
                  {kwResults.length > 0 && (
                    <button onClick={() => exportCsv(kwResults, `sx-keywords-${kwMarket}-${new Date().toISOString().slice(0,10)}.csv`)}
                      className="adm-action-icon-btn" style={{ color: 'var(--gold)', borderColor: 'var(--gbrd)', gap: '6px' }}>
                      <i className="ti ti-download" /><span style={{ font: '600 11px/1 var(--sans)', letterSpacing: '0.08em' }}>Export CSV</span>
                    </button>
                  )}
                  {kwError && <span style={{ color: '#e0607a', fontSize: '12px' }}>{kwError}</span>}
                </div>
              </div>

              {kwResults.length > 0 && (
                <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                        {['Keyword', 'Volume / mo', 'CPC', 'Competition', 'Difficulty'].map(h => (
                          <th key={h} style={{ textAlign: h === 'Keyword' ? 'left' : 'right', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {kwResults.map((r, i) => (
                        <tr key={i} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.keyword}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>{r.volume != null ? r.volume.toLocaleString() : '—'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--t2, #8c8880)' }}>{r.cpc != null ? `€${Number(r.cpc).toFixed(2)}` : '—'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--t2, #8c8880)', fontSize: '12px', textTransform: 'capitalize' }}>{r.competition || '—'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{r.difficulty != null ? r.difficulty : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Bookings table ── */}
          {tab === 'Reports' && (() => {
            const CRITICAL = new Set(['Underage content', 'Human trafficking', 'Non-consensual content'])
            const STATUS_COLOR: Record<string, string> = { open: '#e0a050', reviewing: '#5a9bd4', resolved: '#4caf7d', dismissed: '#7c7a77' }
            async function setReportStatus(id: string, status: string) {
              setReportWorking(id)
              const supabase = createClient()
              const { data: { session } } = await supabase.auth.getSession()
              const upd: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: session?.user?.id || null }
              const { error } = await supabase.from('reports').update(upd).eq('id', id)
              if (!error) setReports(prev => prev.map(r => r.id === id ? { ...r, ...upd } : r))
              setReportWorking(null)
            }
            const visible = reports.filter(r =>
              !search ||
              `${r.reason} ${r.detail} ${r.url} ${r.email || ''}`.toLowerCase().includes(search.toLowerCase())
            )
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visible.length === 0 && (
                  <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)' }}>
                    No reports {search ? 'match your search' : 'yet'}.
                  </div>
                )}
                {visible.map(r => {
                  const isCritical = CRITICAL.has(r.reason)
                  return (
                    <div key={r.id} style={{ background: 'var(--bg1, #0a0a0a)', border: `0.5px solid ${isCritical ? 'rgba(196,90,90,0.45)' : 'var(--b, rgba(255,255,255,0.06))'}`, borderRadius: 'var(--rl, 13px)', padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ background: isCritical ? 'rgba(196,90,90,0.15)' : 'var(--gbg, rgba(197,160,90,0.08))', color: isCritical ? '#e08080' : 'var(--gold, #c5a05a)', border: `0.5px solid ${isCritical ? 'rgba(196,90,90,0.4)' : 'var(--gbrd, rgba(197,160,90,0.2))'}`, borderRadius: '6px', padding: '4px 10px', font: '600 12px/1 var(--sans)' }}>
                            {isCritical && <i className="ti ti-alert-triangle" style={{ marginRight: 5 }} />}{r.reason}
                          </span>
                          <span style={{ color: STATUS_COLOR[r.status] || '#888', font: '600 10px/1 var(--sans)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.status}</span>
                        </div>
                        <span style={{ color: 'var(--t3, #4c4a47)', fontSize: '11px' }}>{new Date(r.created_at).toLocaleString('en-GB')}</span>
                      </div>
                      <p style={{ color: 'var(--t, #ece8e1)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{r.detail}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: 'var(--t2, #8c8880)', marginBottom: '14px' }}>
                        <span><i className="ti ti-link" style={{ marginRight: 5 }} /><a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold, #c5a05a)', textDecoration: 'none' }}>{r.url.length > 60 ? r.url.slice(0, 60) + '…' : r.url}</a></span>
                        {r.listing_id && <a href={`/listings/${r.listing_id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t2, #8c8880)', textDecoration: 'none' }}><i className="ti ti-eye" style={{ marginRight: 5 }} />View listing</a>}
                        {r.email && <span><i className="ti ti-mail" style={{ marginRight: 5 }} /><a href={`mailto:${r.email}`} style={{ color: 'var(--t2, #8c8880)', textDecoration: 'none' }}>{r.email}</a></span>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(['reviewing', 'resolved', 'dismissed'] as const).map(s => (
                          <button key={s} disabled={reportWorking === r.id || r.status === s}
                            onClick={() => setReportStatus(r.id, s)}
                            style={{ background: r.status === s ? 'var(--gbg, rgba(197,160,90,0.08))' : 'transparent', border: '0.5px solid var(--b2, rgba(255,255,255,0.1))', borderRadius: '8px', padding: '6px 14px', color: r.status === s ? 'var(--gold, #c5a05a)' : 'var(--t2, #8c8880)', font: '500 12px/1 var(--sans)', cursor: reportWorking === r.id || r.status === s ? 'default' : 'pointer', textTransform: 'capitalize', opacity: reportWorking === r.id ? 0.5 : 1 }}>
                            {s === 'reviewing' ? 'Mark reviewing' : s === 'resolved' ? 'Resolve' : 'Dismiss'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {tab === 'Bookings' && (
            <div style={{ background: 'var(--bg1, #0a0a0a)', border: '0.5px solid var(--b, rgba(255,255,255,0.06))', borderRadius: 'var(--rl, 13px)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2, rgba(255,255,255,0.02))' }}>
                    {['Listing', 'Client', 'Date', 'Duration', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', font: '600 9px/1 var(--sans)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3, #4c4a47)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--t3, #4c4a47)', fontFamily: 'var(--sans)' }}>No bookings yet</td></tr>}
                  {filteredBookings.map(b => (
                    <tr key={b.id} className="adm-tr" style={{ borderTop: '0.5px solid var(--b, rgba(255,255,255,0.04))', color: 'var(--t, #ece8e1)', transition: 'background var(--t-fast, .1s)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{b.listings?.title || '—'}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{b.profiles?.full_name || b.profiles?.username || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px' }}>{b.date}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--t2, #8c8880)', fontSize: '12px' }}>{b.duration_hours}h</td>
                      <td style={{ padding: '14px 16px', color: 'var(--gold, #c5a05a)', fontWeight: 600 }}>{b.total_amount ? `€${b.total_amount}` : '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', font: '600 10px/1 var(--sans)', letterSpacing: '0.1em', textTransform: 'uppercase', background: b.status === 'confirmed' ? 'rgba(38,212,160,0.12)' : b.status === 'cancelled' ? 'rgba(184,77,114,0.12)' : b.status === 'completed' ? 'var(--gbg)' : 'rgba(255,255,255,0.06)', color: b.status === 'confirmed' ? 'var(--verified, #1dc9a0)' : b.status === 'cancelled' ? 'var(--wine, #b84d72)' : b.status === 'completed' ? 'var(--gold, #c5a05a)' : 'var(--t2, #8c8880)' }}>{b.status}</span>
                          {b.status === 'pending' && (
                            <button
                              className="adm-action-icon-btn adm-action-btn"
                              onClick={async () => {
                                const supabase = createClient()
                                await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
                                setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x))
                              }}
                              style={{ color: 'var(--danger, #e2536b)', borderColor: 'rgba(226,83,107,0.3)' }}
                              title="Cancel booking"
                            >
                              <i className="ti ti-x" aria-hidden="true" />
                              <span style={{ font: '600 10px/1 var(--sans)', letterSpacing: '0.06em' }}>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'Tools' && (
            <div>
              {/* ── Image Focus Backfill ── */}
              <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ font: '600 14px/1 var(--sans)', color: 'var(--t)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="ti ti-focus-centered" style={{ color: 'var(--gold)' }} />
                      Image Focus Backfill
                    </div>
                    <div style={{ font: '400 12.5px/1.5 var(--sans)', color: 'var(--t2)', maxWidth: 480 }}>
                      Scans every existing listing&apos;s photos, detects where the person is using pixel analysis, and saves the focal point so thumbnails centre on them. Skips images that already have a manually or auto-set focal point.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {bfRunning && (
                      <button onClick={() => { bfAbort.current = true }} style={{ padding: '9px 16px', background: 'rgba(226,83,107,0.12)', border: '0.5px solid rgba(226,83,107,0.3)', borderRadius: 9, color: '#e2536b', font: '600 12px/1 var(--sans)', cursor: 'pointer' }}>
                        <i className="ti ti-player-stop" /> Stop
                      </button>
                    )}
                    <button
                      onClick={runFocusBackfill}
                      disabled={bfRunning}
                      style={{ padding: '9px 18px', background: bfRunning ? 'rgba(197,160,90,0.1)' : 'linear-gradient(90deg,#c5a05a,#e8c97a)', border: 'none', borderRadius: 9, color: bfRunning ? 'var(--gold)' : '#0a0a0a', font: '700 12px/1 var(--sans)', cursor: bfRunning ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: bfRunning ? 0.7 : 1 }}
                    >
                      {bfRunning ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(197,160,90,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'adm-spin 0.8s linear infinite' }} /> Running…</> : <><i className="ti ti-sparkles" /> Run Backfill</>}
                    </button>
                  </div>
                </div>

                {(bfTotal > 0 || bfRunning) && (
                  <>
                    {/* Progress bar */}
                    <div style={{ background: 'var(--bg2)', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: '0.75rem' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#c5a05a,#e8c97a)', borderRadius: 99, width: bfTotal > 0 ? `${Math.round(((bfDone + bfSkipped) / bfTotal) * 100)}%` : '0%', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 20, font: '600 11px/1 var(--sans)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '1rem' }}>
                      <span><span style={{ color: 'var(--t)', fontSize: 14 }}>{bfTotal}</span> total</span>
                      <span><span style={{ color: '#1dc9a0', fontSize: 14 }}>{bfDone}</span> updated</span>
                      <span><span style={{ color: 'var(--t2)', fontSize: 14 }}>{bfSkipped}</span> already set</span>
                      {bfErrors > 0 && <span><span style={{ color: '#e2536b', fontSize: 14 }}>{bfErrors}</span> errors</span>}
                    </div>

                    {/* Log */}
                    <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '0.75rem 1rem', maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, color: 'var(--t2)' }}>
                      {bfLog.length === 0 ? <span style={{ color: 'var(--t3)' }}>Starting…</span> : bfLog.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
