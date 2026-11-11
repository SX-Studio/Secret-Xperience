// Backend command-centre link registry for the Controlekamer.
// Every external service that runs SX.eu and Content24 is catalogued here so the whole
// operation can be driven from one screen. Edit links/labels here — the page renders from this.
// Mirrors the SX × Content24 master architecture (domains → API/Hostinger → SX/C24 apps,
// admin backends, Google, payments, email, social).
//
// `configure: true` marks a link whose exact deep-URL isn't confirmed yet (owner should paste
// the real dashboard URL). It still renders, just flagged so nobody trusts a guessed URL.

export type CkLink = {
  name: string
  href: string
  desc: string
  configure?: boolean
}

export type CkGroup = {
  id: string
  title: string
  brand: 'sx' | 'c24' | 'core' | 'infra' | 'google' | 'pay' | 'domain' | 'social'
  blurb: string
  links: CkLink[]
}

const SB = 'https://supabase.com/dashboard/project/duwuzaelmggldhkgoebn'
const SB_C24 = 'https://supabase.com/dashboard/project/jpnnzxnvubrosjjcbkmn'
const HPANEL = 'https://hpanel.hostinger.com'
const C24 = 'https://content24market.space'

export const CK_GROUPS: CkGroup[] = [
  {
    id: 'sx-admin',
    title: 'SX.eu — Admin',
    brand: 'sx',
    blurb: 'The marketplace back office. Moderate ads, verify advertisers, manage members.',
    links: [
      { name: 'Admin dashboard', href: '/admin', desc: 'Listings · Users · Bookings · Payouts' },
      { name: 'Verification', href: '/admin?tab=Verification', desc: 'ID checks & advertiser approval' },
      { name: 'Reports', href: '/admin?tab=Reports', desc: 'Abuse reports to triage' },
      { name: 'Shop & brands', href: '/admin?tab=Shop', desc: 'Storefront items, brands, affiliate clicks' },
      { name: 'Events', href: '/admin?tab=Events', desc: 'Discovery queue & published events' },
      { name: 'SMS campaigns', href: '/admin?tab=Campaigns', desc: 'Bird consent campaign' },
      { name: 'Newsletter', href: '/admin?tab=Newsletter', desc: 'Subscribers & send' },
      { name: 'Contacts & leads', href: '/admin?tab=Contacts', desc: 'Opt-ins and B2B leads' },
      { name: 'Acquisition', href: '/admin?tab=Acquisition', desc: 'Signup attribution & channels' },
      { name: 'Keyword research', href: '/admin?tab=Keywords', desc: 'SEO volume & ideas' },
      { name: 'Admin tools', href: '/admin?tab=Tools', desc: 'Token grants · image-focus backfill' },
      { name: 'Community moderation', href: '/admin/community', desc: 'Community posts & comments' },
      { name: 'Messages', href: '/messages', desc: 'Support & member chat' },
      { name: 'Architecture blueprint', href: '/architecture.html', desc: 'How every system links together' },
    ],
  },
  {
    id: 'content24',
    title: 'Content24 — C24',
    brand: 'c24',
    blurb: 'The content marketplace. Its own site and database, run from the same control room.',
    links: [
      { name: 'Content24 admin', href: `${C24}/admin`, desc: 'Back office (sign in on Content24)' },
      { name: 'Content24 site', href: C24, desc: 'content24market.space' },
      { name: 'Supabase — Content24', href: SB_C24, desc: 'Database · auth · storage' },
      { name: 'Supabase — Content24 SQL', href: `${SB_C24}/sql/new`, desc: 'Run queries & migrations' },
      { name: 'Supabase — Content24 users', href: `${SB_C24}/auth/users`, desc: 'Accounts & sessions' },
    ],
  },
  {
    id: 'domains',
    title: 'Domains & sites',
    brand: 'domain',
    blurb: 'Every domain that serves the platform. DNS & registration live in Hostinger.',
    links: [
      { name: 'All domains (hPanel)', href: `${HPANEL}/domains`, desc: 'Registrations, DNS & redirects' },
      { name: 'secretxperience.eu', href: 'https://www.secretxperience.eu', desc: 'Marketplace — canonical' },
      { name: 'secretxperience.nl', href: 'https://www.secretxperience.nl', desc: 'Marketplace mirror (canonical → .eu)' },
      { name: 'secretxperience.store', href: 'https://www.secretxperience.store', desc: 'Storefront & token wallet' },
      { name: 'secretxperience.shop', href: 'https://www.secretxperience.shop', desc: 'Old storefront domain → redirects to .store' },
      { name: 'secretxperience.space', href: 'https://secretxperience.space', desc: 'Parked at Hostinger — not in use' },
      { name: 'content24market.space', href: C24, desc: 'Content24 marketplace' },
    ],
  },
  {
    id: 'email',
    title: 'Email',
    brand: 'core',
    blurb: 'Domain mailboxes (Hostinger) and the transactional sender (Resend).',
    links: [
      { name: 'Webmail (Hostinger)', href: 'https://mail.hostinger.com/', desc: 'info@ · support@ · contact@secretxperience.eu' },
      { name: 'Mailboxes (hPanel)', href: `${HPANEL}/emails`, desc: 'Create & manage mailboxes' },
      { name: 'Resend', href: 'https://resend.com/emails', desc: 'Sent mail log — no-reply@, replies → support@' },
      { name: 'Gmail', href: 'https://mail.google.com/', desc: 'Owner inbox' },
    ],
  },
  {
    id: 'infra',
    title: 'Infrastructure',
    brand: 'infra',
    blurb: 'Hosting, database, deploys and source for SX.',
    links: [
      { name: 'Vercel', href: 'https://vercel.com/dashboard', desc: 'Deployments, env vars, domains' },
      { name: 'Supabase — SX project', href: SB, desc: 'Auth · database · RLS · storage' },
      { name: 'Supabase — SQL editor', href: `${SB}/sql/new`, desc: 'Run migrations & queries' },
      { name: 'Supabase — Table editor', href: `${SB}/editor`, desc: 'Browse & edit rows' },
      { name: 'Supabase — Auth users', href: `${SB}/auth/users`, desc: 'Accounts & sessions' },
      { name: 'Supabase — Storage', href: `${SB}/storage/buckets`, desc: 'ID docs & listing photos' },
      { name: 'Supabase — Logs', href: `${SB}/logs/explorer`, desc: 'API / DB / auth logs' },
      { name: 'GitHub — SX-Studio', href: 'https://github.com/SX-Studio', desc: 'All repositories' },
      { name: 'GitHub — Secret-Xperience', href: 'https://github.com/SX-Studio/Secret-Xperience', desc: 'SX source & pull requests' },
      { name: 'Hostinger hPanel', href: `${HPANEL}/`, desc: 'Hosting, DNS & domains' },
    ],
  },
  {
    id: 'google',
    title: 'Google',
    brand: 'google',
    blurb: 'Search, ads and analytics.',
    links: [
      { name: 'Search Console', href: 'https://search.google.com/search-console', desc: 'Indexing & search performance' },
      { name: 'Analytics (GA4)', href: 'https://analytics.google.com/', desc: 'Traffic & behaviour' },
      { name: 'Google Ads', href: 'https://ads.google.com/', desc: 'Campaigns' },
      { name: 'Cloud Console — OAuth', href: 'https://console.cloud.google.com/apis/credentials', desc: 'Google sign-in client & redirect URLs' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & wallet',
    brand: 'pay',
    blurb: 'Tokens and shop payments are taken on secretxperience.store only.',
    links: [
      { name: 'NOWPayments', href: 'https://account.nowpayments.io/', desc: 'Crypto rail for tokens — live' },
      { name: 'Stripe Dashboard', href: 'https://dashboard.stripe.com/', desc: 'Shop, rentals, hotels, events' },
      { name: 'Token wallet (store)', href: 'https://www.secretxperience.store/tokens', desc: 'What a buyer sees' },
      { name: 'Verotel Control Center', href: 'https://controlcenter.verotel.com/', desc: 'SX account cancelled 2026-08 — new registration needed' },
    ],
  },
  {
    id: 'comms',
    title: 'Messaging & SMS',
    brand: 'core',
    blurb: 'Outbound SMS and verification.',
    links: [
      { name: 'Bird', href: 'https://app.bird.com/', desc: 'SMS consent campaign & webhooks' },
      { name: 'Twilio Console', href: 'https://console.twilio.com/', desc: 'Verify service for the control-room OTP' },
    ],
  },
  {
    id: 'social',
    title: 'Social media',
    brand: 'social',
    blurb: 'Public channels. Handles below are placeholders until confirmed.',
    links: [
      { name: 'Instagram', href: 'https://instagram.com/', desc: 'Profile link to confirm', configure: true },
      { name: 'TikTok', href: 'https://tiktok.com/', desc: 'Profile link to confirm', configure: true },
      { name: 'Snapchat', href: 'https://snapchat.com/', desc: 'Profile link to confirm', configure: true },
      { name: 'Facebook', href: 'https://facebook.com/', desc: 'Page link to confirm', configure: true },
      { name: 'X', href: 'https://x.com/', desc: 'Profile link to confirm', configure: true },
    ],
  },
]
