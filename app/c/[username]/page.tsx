import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getPublicCreator } from './data'
import PublicProfile from './PublicProfile'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const c = await getPublicCreator(params.username)
  if (!c) return { title: 'Creator not found · SecretXperience' }
  const desc = c.headline || c.bio || `Follow ${c.full_name} on SecretXperience.`
  const title = `${c.full_name} (@${c.username}) · SecretXperience`
  return {
    title,
    description: desc.slice(0, 160),
    openGraph: { title, description: desc.slice(0, 160), images: c.cover_url || c.avatar_url ? [{ url: c.cover_url || c.avatar_url }] : undefined },
    twitter: { card: 'summary_large_image', title, description: desc.slice(0, 160) },
    alternates: { canonical: `https://www.secretxperience.eu/c/${c.username}` },
  }
}

export default async function CreatorPublicPage({ params }: { params: { username: string } }) {
  const creator = await getPublicCreator(params.username)
  if (!creator) notFound()

  // Viewer context — is this the creator themselves, are they logged in, following?
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()

  let isSelf = false, isFollowing = false, viewerBalance = 0
  let subscription: { tierName: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean } | null = null
  if (session) {
    isSelf = session.user.id === creator.id
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
    const [{ data: f }, { data: w }, { data: s }] = await Promise.all([
      admin.from('creator_follows').select('follower_id').eq('follower_id', session.user.id).eq('creator_id', creator.id).maybeSingle(),
      admin.from('user_wallets').select('balance').eq('user_id', session.user.id).maybeSingle(),
      admin.from('creator_subscriptions').select('tier_name, current_period_end, cancel_at_period_end').eq('subscriber_id', session.user.id).eq('creator_id', creator.id).eq('status', 'active').maybeSingle(),
    ])
    isFollowing = !!f
    viewerBalance = w?.balance ?? 0
    if (s) subscription = { tierName: s.tier_name, currentPeriodEnd: s.current_period_end, cancelAtPeriodEnd: s.cancel_at_period_end }
  }

  return (
    <PublicProfile
      creator={creator}
      viewer={{ loggedIn: !!session, isSelf, isFollowing, balance: viewerBalance, subscription }}
    />
  )
}
