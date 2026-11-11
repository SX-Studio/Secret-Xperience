/**
 * Canonical site URL for all user-facing links (emails, payment redirects).
 *
 * NEXT_PUBLIC_SITE_URL was at one point set to a *.vercel.app deployment URL
 * in Vercel; those URLs die when the deployment is replaced, which broke every
 * link in outbound emails (404 DEPLOYMENT_NOT_FOUND). Never trust a vercel.app
 * value for outbound links — always fall back to the production domain.
 *
 * This stays pinned to the .eu domain even when a request arrives on a mirror
 * (secretxperience.nl): Verotel, NOWPayments and Stripe all have fixed
 * success/decline/postback URLs registered on .eu in their vendor panels, and
 * Verotel's signature is computed over them. A host-relative value here would
 * break the return leg of every payment started on the mirror.
 */
const CANONICAL = 'https://www.secretxperience.eu'

export function siteUrl(): string {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '')
  if (!env || env.includes('vercel.app')) return CANONICAL
  return env
}
