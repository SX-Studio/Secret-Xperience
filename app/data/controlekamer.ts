// Backend command-centre link registry for the Controlekamer.
// Every external service that runs SX.eu and Content24 is catalogued here so the whole
// operation can be driven from one screen. Edit links/labels here — the page renders from this.
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
  brand: 'sx' | 'c24' | 'core' | 'infra' | 'google' | 'pay'
  blurb: string
  links: CkLink[]
}

const SUPABASE_REF = 'duwuzaelmggldhkgoebn'
const SB = `https://supabase.com/dashboard/project/${SUPABASE_REF}`

export const CK_GROUPS: CkGroup[] = [
  {
    id: 'sx-admin',
    title: 'SX.eu — Admin',
    brand: 'sx',
    blurb: 'The live marketplace back office. Moderate ads, verify providers, manage members and payouts.',
    links: [
      { name: 'Admin dashboard', href: '/admin', desc: 'Listings · Users · Verification · Reports · Bookings · Payouts' },
      { name: 'Community moderation', href: '/admin/community', desc: 'Community posts & comments' },
      { name: 'Acquisition', href: '/admin?tab=Acquisition', desc: 'Signup attribution & channels' },
      { name: 'Keyword research', href: '/admin?tab=Keywords', desc: 'SEO volume & ideas (DataForSEO)' },
      { name: 'Admin tools', href: '/admin?tab=Tools', desc: 'Token grants · image-focus backfill' },
      { name: 'Architecture blueprint', href: '/architecture.html', desc: 'How every system links together' },
    ],
  },
  {
    id: 'content24',
    title: 'Content24 — C24',
    brand: 'c24',
    blurb: 'The content vault / “Drop Box” that shares one Front & Backend API with SX.eu.',
    links: [
      { name: 'Content24 admin', href: 'https://content24.eu', desc: 'Content vault back office', configure: true },
      { name: 'Content24 site', href: 'https://content24.eu', desc: 'Public content platform', configure: true },
    ],
  },
  {
    id: 'infra',
    title: 'Infrastructure',
    brand: 'infra',
    blurb: 'Hosting, database, deploys and source. The machinery under both products.',
    links: [
      { name: 'Hostinger hPanel', href: 'https://hpanel.hostinger.com/', desc: 'Domains, DNS & hosting' },
      { name: 'Supabase — Project', href: SB, desc: 'Auth · database · RLS · storage' },
      { name: 'Supabase — SQL editor', href: `${SB}/sql/new`, desc: 'Run migrations & queries' },
      { name: 'Supabase — Table editor', href: `${SB}/editor`, desc: 'Browse & edit rows' },
      { name: 'Supabase — Auth users', href: `${SB}/auth/users`, desc: 'Accounts & sessions' },
      { name: 'Supabase — Storage', href: `${SB}/storage/buckets`, desc: 'ID docs & listing photos' },
      { name: 'Supabase — Logs', href: `${SB}/logs/explorer`, desc: 'API / DB / auth logs' },
      { name: 'Vercel', href: 'https://vercel.com/dashboard', desc: 'Deployments & env vars (auto-deploys on push)' },
      { name: 'GitHub — Secret-Xperience', href: 'https://github.com/SX-Studio/Secret-Xperience', desc: 'Primary source repo' },
      { name: 'GitHub — SecretXperience', href: 'https://github.com/SX-Studio/SecretXperience', desc: 'Mirror / secondary repo' },
    ],
  },
  {
    id: 'google',
    title: 'Google',
    brand: 'google',
    blurb: 'Discovery, analytics and the Workspace that runs mail and identity.',
    links: [
      { name: 'Search Console', href: 'https://search.google.com/search-console?resource_id=sc-domain:secretxperience.eu', desc: 'Indexing & search performance' },
      { name: 'Analytics (GA4)', href: 'https://analytics.google.com/', desc: 'Traffic & behaviour' },
      { name: 'Workspace Admin', href: 'https://admin.google.com/', desc: 'Users, mail & domain identity', configure: true },
      { name: 'Business Profile', href: 'https://business.google.com/', desc: 'Google listing & reviews', configure: true },
      { name: 'Gmail', href: 'https://mail.google.com/', desc: 'heyokanaga@gmail.com' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Wallet',
    brand: 'pay',
    blurb: 'The token/wallet rail. Verotel is live in test mode; Stripe covers clean verticals only.',
    links: [
      { name: 'Verotel Control Center', href: 'https://controlcenter.verotel.com/', desc: 'FlexPay website #136440 (test mode)' },
      { name: 'Stripe Dashboard', href: 'https://dashboard.stripe.com/', desc: 'Rentals · hotels · events · shop only' },
      { name: 'NOWPayments', href: 'https://account.nowpayments.io/', desc: 'Crypto fallback rail', configure: true },
    ],
  },
  {
    id: 'comms',
    title: 'Email & Comms',
    brand: 'core',
    blurb: 'Transactional and marketing mail.',
    links: [
      { name: 'Resend', href: 'https://resend.com/overview', desc: 'Transactional email API' },
    ],
  },
]
