/**
 * Creator Studio data API — everything the /creators/studio dashboard reads/writes.
 *
 * GET  → { profile, config, posts, wallet, ledger, gifts, stats, revenueByMonth, activity14 }
 * POST { action, ... } → mutate:
 *   - profile      { full_name?, username?, bio?, headline?, avatar_url?, cover_url? }
 *   - config       { config }                    (studio-only settings blob)
 *   - post_create  { title?, caption?, mediaUrl?, mediaType?, visibility?, blur?, price? }
 *   - post_update  { id, title?, visibility?, blur?, price? }
 *   - post_delete  { id }
 *
 * Every mutation is scoped to the authenticated session's user id.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

function sessionClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const VIS = new Set(['public', 'subscribers', 'ppv'])
const clampInt = (v: any, lo: number, hi: number, d = 0) => {
  const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d
}
const clampNum = (v: any, lo: number, hi: number, d = 0) => {
  const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d
}

export async function GET() {
  const supabase = sessionClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id
  const db = admin()

  const [profileRes, postsRes, walletRes, ledgerRes, giftsRes, subsRes, followRes] = await Promise.all([
    db.from('profiles').select('id, full_name, username, avatar_url, cover_url, bio, headline, verified, role, studio_config').eq('id', uid).maybeSingle(),
    db.from('creator_posts').select('id, title, caption, media_url, media_type, visibility, blur, price, like_count, created_at').eq('creator_id', uid).eq('active', true).order('created_at', { ascending: false }),
    db.from('user_wallets').select('balance, total_purchased, total_spent').eq('user_id', uid).maybeSingle(),
    db.from('token_ledger').select('created_at, type, description, amount, balance_after').eq('user_id', uid).order('created_at', { ascending: false }).limit(300),
    db.from('creator_gifts').select('id, amount_tokens, message, created_at, sender:sender_id(full_name, username)').eq('creator_id', uid).order('created_at', { ascending: false }).limit(50),
    db.from('creator_subscriptions').select('price_tokens').eq('creator_id', uid).eq('status', 'active'),
    db.from('creator_follows').select('creator_id', { count: 'exact', head: true }).eq('creator_id', uid),
  ])

  const profile = profileRes.data || { id: uid }
  const config = (profile as any).studio_config || {}
  const posts = postsRes.data || []
  const wallet = walletRes.data || { balance: 0, total_purchased: 0, total_spent: 0 }
  const ledger = ledgerRes.data || []
  const gifts = (giftsRes.data || []).map((g: any) => ({
    id: g.id, amount_tokens: g.amount_tokens, message: g.message, created_at: g.created_at,
    sender_name: g.sender?.full_name || g.sender?.username || 'Anonymous',
  }))

  // Revenue by month (last 6 months) — token inflow from purchases + gift credits.
  const now = new Date()
  const months: { key: string; label: string; tokens: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), tokens: 0 })
  }
  const monthIdx: Record<string, number> = {}
  months.forEach((m, i) => { monthIdx[m.key] = i })
  ledger.forEach((r: any) => {
    if ((r.amount || 0) <= 0) return
    const d = new Date(r.created_at)
    const k = `${d.getFullYear()}-${d.getMonth()}`
    if (k in monthIdx) months[monthIdx[k]].tokens += r.amount
  })

  // Activity — inflow token count per day, last 14 days (drives the traffic sparkline).
  const activity14: number[] = new Array(14).fill(0)
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  ledger.forEach((r: any) => {
    if ((r.amount || 0) <= 0) return
    const d = new Date(r.created_at)
    const diff = Math.floor((dayStart.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000)
    if (diff >= 0 && diff < 14) activity14[13 - diff] += r.amount
  })

  const giftTokens = gifts.reduce((a, g) => a + (g.amount_tokens || 0), 0)
  const activeSubs = subsRes.data || []
  const stats = {
    balance: wallet.balance || 0,
    tokensEarned: (wallet.total_purchased || 0) + giftTokens,
    giftsCount: gifts.length,
    giftTokens,
    posts: posts.length,
    likes: posts.reduce((a: number, p: any) => a + (p.like_count || 0), 0),
    subscribers: activeSubs.length,
    mrrTokens: activeSubs.reduce((a: number, s: any) => a + (s.price_tokens || 0), 0),
    followers: followRes.count || 0,
  }

  return NextResponse.json({
    profile: {
      id: profile.id, full_name: (profile as any).full_name || '', username: (profile as any).username || '',
      avatar_url: (profile as any).avatar_url || '', cover_url: (profile as any).cover_url || '',
      bio: (profile as any).bio || '', headline: (profile as any).headline || '',
      verified: !!(profile as any).verified, role: (profile as any).role || 'user',
    },
    config, posts, wallet, ledger: ledger.slice(0, 30), gifts, stats,
    revenueByMonth: months.map(m => ({ label: m.label, tokens: m.tokens })),
    activity14,
  })
}

export async function POST(req: NextRequest) {
  const supabase = sessionClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id
  const db = admin()

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const action = body?.action

  if (action === 'profile') {
    const patch: Record<string, any> = {}
    if (typeof body.full_name === 'string') patch.full_name = body.full_name.trim().slice(0, 80)
    if (typeof body.bio === 'string') patch.bio = body.bio.slice(0, 600)
    if (typeof body.headline === 'string') patch.headline = body.headline.slice(0, 140)
    if (typeof body.avatar_url === 'string' && /^https?:\/\//i.test(body.avatar_url)) patch.avatar_url = body.avatar_url
    if (typeof body.cover_url === 'string' && /^https?:\/\//i.test(body.cover_url)) patch.cover_url = body.cover_url
    if (typeof body.username === 'string') {
      const uname = body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30)
      if (uname.length >= 3) {
        const { data: taken } = await db.from('profiles').select('id').eq('username', uname).neq('id', uid).maybeSingle()
        if (taken) return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
        patch.username = uname
      } else if (body.username.trim()) {
        return NextResponse.json({ error: 'Username must be at least 3 characters (letters, numbers, underscore).' }, { status: 400 })
      }
    }
    if (!Object.keys(patch).length) return NextResponse.json({ ok: true })
    const { error } = await db.from('profiles').update(patch).eq('id', uid)
    if (error) { console.error('[studio] profile update:', error.message); return NextResponse.json({ error: 'Failed to save profile.' }, { status: 500 }) }
    return NextResponse.json({ ok: true, patch })
  }

  if (action === 'config') {
    const cfg = body.config
    if (cfg === null || typeof cfg !== 'object' || Array.isArray(cfg)) return NextResponse.json({ error: 'config must be an object' }, { status: 400 })
    // cap serialized size to keep the row sane
    if (JSON.stringify(cfg).length > 20000) return NextResponse.json({ error: 'Config too large.' }, { status: 400 })
    const { error } = await db.from('profiles').update({ studio_config: cfg }).eq('id', uid)
    if (error) { console.error('[studio] config update:', error.message); return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 }) }
    return NextResponse.json({ ok: true })
  }

  if (action === 'post_create') {
    const visibility = VIS.has(body.visibility) ? body.visibility : 'public'
    const row = {
      creator_id: uid,
      title: typeof body.title === 'string' ? body.title.slice(0, 120) : null,
      caption: typeof body.caption === 'string' ? body.caption.slice(0, 2000) : null,
      media_url: (typeof body.mediaUrl === 'string' && /^https?:\/\//i.test(body.mediaUrl)) ? body.mediaUrl : null,
      media_type: body.mediaType === 'video' ? 'video' : 'image',
      visibility,
      blur: clampInt(body.blur, 0, 20, 0),
      price: clampNum(body.price, 0, 9999, 0),
    }
    const { data, error } = await db.from('creator_posts').insert(row).select('id, title, caption, media_url, media_type, visibility, blur, price, like_count, created_at').single()
    if (error) { console.error('[studio] post_create:', error.message); return NextResponse.json({ error: 'Failed to add content.' }, { status: 500 }) }
    return NextResponse.json({ ok: true, post: data })
  }

  if (action === 'post_update') {
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const patch: Record<string, any> = {}
    if (typeof body.title === 'string') patch.title = body.title.slice(0, 120)
    if (VIS.has(body.visibility)) patch.visibility = body.visibility
    if (body.blur !== undefined) patch.blur = clampInt(body.blur, 0, 20, 0)
    if (body.price !== undefined) patch.price = clampNum(body.price, 0, 9999, 0)
    if (!Object.keys(patch).length) return NextResponse.json({ ok: true })
    const { error } = await db.from('creator_posts').update(patch).eq('id', body.id).eq('creator_id', uid)
    if (error) { console.error('[studio] post_update:', error.message); return NextResponse.json({ error: 'Failed to update content.' }, { status: 500 }) }
    return NextResponse.json({ ok: true })
  }

  if (action === 'post_delete') {
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await db.from('creator_posts').delete().eq('id', body.id).eq('creator_id', uid)
    if (error) { console.error('[studio] post_delete:', error.message); return NextResponse.json({ error: 'Failed to remove content.' }, { status: 500 }) }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
