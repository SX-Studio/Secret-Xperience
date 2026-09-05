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

const SUPABASE_REF = 'duwuzaelmggldhkgoebn'
const SB = `https://supabase.com/dashboard/project/${SUPABASE_REF}`
const HPANEL = 'https://hpanel.hostinger.com'

export const CK_GROUPS: CkGroup[] = [
  {
    id: 'sx-admin',
    title: 'SX.eu — Admin',
    brand: 'sx',
    blurb: 'The live marketplace back office. Moderate ads, verify providers, manage members and payouts.',
    links: [
      { name: 'Admin dashboard', href: '/admin', desc: 'Listings · Users · Verification · Reports · Bookings · Payouts' },
      { name: 'Verification', href: '/admin?tab=Verification', desc: 'ID checks & provider approval' },
      { name: 'Content — listings', href: '/admin?tab=Listings', desc: 'Moderate & edit live ads' },
      { name: 'Community moderation', href: '/admin/community', desc: 'Community posts & comments' },
      { name: 'Messages', href: '/messages', desc: 'Support & member chat' },
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
      { name: 'Content control', href: 'https://content24.eu/admin', desc: 'Upload & manage the content vault', configure: true },
      { name: 'Content24 site', href: 'https://content24.eu', desc: 'Public content platform', configure: true },
    ],
  },
  {
    id: 'domains',
    title: 'Domeinen',
    brand: 'domain',
    blurb: 'Every domain that points at the platform. DNS & registration live in Hostinger.',
    links: [
      { name: 'Alle domeinen (hPanel)', href: `${HPANEL}/domains`, desc: 'Registrations, DNS & redirects' },
      { name: 'secretxperience.eu', href: 'https://secretxperience.eu', desc: 'Primary live domain' },
      { name: 'secretxperience.com', href: 'https://secretxperience.com', desc: 'Redirect / brand-protect', configure: true },
      { name: 'secretxperience.nl', href: 'https://secretxperience.nl', desc: 'NL market domain', configure: true },
      { name: 'secretxperience.space', href: 'https://secretxperience.space', desc: 'Secondary / campaign domain', configure: true },
    ],
  },
  {
    id: 'email',
    title: 'E-mail',
    brand: 'core',
    blurb: 'Domain mailboxes (Hostinger) and the transactional/marketing senders.',
    links: [
      { name: 'Webmail (Hostinger)', href: 'https://mail.hostinger.com/', desc: 'info@ · support@ · contact@secretxperience.eu' },
      { name: 'Mailboxes (hPanel)', href: `${HPANEL}/emails`, desc: 'Create & manage mailboxes' },
      { name: 'info@secretxperience.eu', href: 'https://mail.hostinger.com/', desc: 'General inbox', configure: true },
      { name: 'support@secretxperience.eu', href: 'https://mail.hostinger.com/', desc: 'Support inbox', configure: true },
      { name: 'contact@secretxperience.eu', href: 'https://mail.hostinger.com/', desc: 'Contact-form inbox', configure: true },
      { name: 'Resend', href: 'https://resend.com/overview', desc: 'Transactional email API (notifications)' },
    ],
  },
  {
    id: 'infra',
    title: 'Infrastructure',
    brand: 'infra',
    blurb: 'Hosting, database, deploys and source. The machinery under both products.',
    links: [
      { name: 'Hostinger hPanel', href: `${HPANEL}/`, desc: 'Hosting, DNS & domains' },
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
    blurb: 'Discovery, ads, analytics and the Workspace that runs mail and identity.',
    links: [
      { name: 'Search Console', href: 'https://search.google.com/search-console?resource_id=sc-domain:secretxperience.eu', desc: 'Indexing & search performance' },
      { name: 'Google Ads', href: 'https://ads.google.com/', desc: 'Search & display campaigns', configure: true },
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
    id: 'social',
    title: 'Social Media',
    brand: 'social',
    blurb: 'The public channels. Confirm each handle/URL, then schedule from one place.',
    links: [
      { name: 'Instagram', href: 'https://instagram.com/', desc: '@secretxperience', configure: true },
      { name: 'TikTok', href: 'https://tiktok.com/', desc: '@secretxperience', configure: true },
      { name: 'Snapchat', href: 'https://snapchat.com/', desc: 'secretxperience', configure: true },
      { name: 'Facebook', href: 'https://facebook.com/', desc: 'SecretXperience page', configure: true },
      { name: 'X (Twitter)', href: 'https://x.com/', desc: '@secretxperience', configure: true },
    ],
  },
]
