import 'server-only'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type PublicPost = {
  id: string; title: string | null; caption: string | null
  media_url: string | null; media_type: string | null
  visibility: string; blur: number; price: number; like_count: number | null; created_at: string
}

export type PublicCreator = {
  id: string; full_name: string; username: string
  avatar_url: string; cover_url: string; bio: string; headline: string
  verified: boolean; city: string; country: string
  external_links: { label: string; url: string }[]
  config: any
  posts: PublicPost[]
  followerCount: number
  giftTokens: number
}

// Load a creator's public profile by username (case-insensitive). Returns null when
// the username doesn't resolve to a profile. Uses the service role for a clean read;
// only public-safe fields are surfaced.
export async function getPublicCreator(username: string): Promise<PublicCreator | null> {
  const uname = (username || '').trim().toLowerCase()
  if (!uname || !/^[a-z0-9_]{2,40}$/.test(uname)) return null
  const db = admin()

  const { data: profile } = await db
    .from('profiles')
    .select('id, full_name, username, avatar_url, cover_url, bio, headline, verified, city, country, external_links, studio_config')
    .ilike('username', uname)
    .maybeSingle()
  if (!profile) return null

  const [postsRes, followRes, giftsRes] = await Promise.all([
    db.from('creator_posts').select('id, title, caption, media_url, media_type, visibility, blur, price, like_count, created_at').eq('creator_id', profile.id).eq('active', true).order('created_at', { ascending: false }).limit(60),
    db.from('creator_follows').select('creator_id', { count: 'exact', head: true }).eq('creator_id', profile.id),
    db.from('creator_gifts').select('amount_tokens').eq('creator_id', profile.id).limit(2000),
  ])

  const giftTokens = (giftsRes.data || []).reduce((a: number, g: any) => a + (g.amount_tokens || 0), 0)
  const links = Array.isArray(profile.external_links) ? profile.external_links : []

  return {
    id: profile.id,
    full_name: profile.full_name || profile.username || 'Creator',
    username: profile.username || uname,
    avatar_url: profile.avatar_url || '',
    cover_url: profile.cover_url || '',
    bio: profile.bio || '',
    headline: profile.headline || '',
    verified: !!profile.verified,
    city: profile.city || '',
    country: profile.country || '',
    external_links: links,
    config: profile.studio_config || {},
    posts: (postsRes.data || []) as PublicPost[],
    followerCount: followRes.count || 0,
    giftTokens,
  }
}
