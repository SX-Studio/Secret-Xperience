/**
 * The platform is served from more than one domain.
 *
 *   secretxperience.eu   canonical home of the marketplace
 *   secretxperience.nl   full mirror of the marketplace, canonicalised to .eu
 *   secretxperience.store standalone storefront + token wallet — the only place
 *                         a card or crypto payment is taken
 *   secretxperience.shop  legacy storefront domain, 308s to .store
 *
 * The .nl mirror and the .store storefront are NOT the same kind of thing and
 * must not be conflated:
 *
 * - A mirror serves byte-identical content and points every canonical at its
 *   .eu twin, so Google indexes one copy.
 * - The storefront serves ONLY the shop and the token wallet, owns the
 *   canonical for shop content, and deliberately carries no navigation into
 *   the escort directory. That separation is the point of the domain: a
 *   payment processor reviewing secretxperience.store must see a shop and a
 *   wallet, not one click of an escort directory. /shop and /tokens on the
 *   marketplace redirect here. Tokens bought here land in the same Supabase
 *   wallet the marketplace reads, so there is nothing to sync.
 *   See docs/data-handling-policy.md.
 */
export const CANONICAL_HOST = 'www.secretxperience.eu'
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`

/** Canonical origin for shop + wallet. www is primary in Vercel; the apex 308s to it. */
export const SHOP_HOST = 'www.secretxperience.store'
export const SHOP_ORIGIN = `https://${SHOP_HOST}`

/** Every hostname that serves this platform, in any of its forms. */
export const SITE_HOSTS = [
  'secretxperience.eu',
  'www.secretxperience.eu',
  'secretxperience.nl',
  'www.secretxperience.nl',
  'secretxperience.store',
  'www.secretxperience.store',
  'secretxperience.shop',
  'www.secretxperience.shop',
] as const

/** Registrable domains that mirror the marketplace and canonicalise to .eu. */
const MIRROR_DOMAINS = ['secretxperience.nl']

/** Registrable domains that serve the standalone storefront. */
const SHOP_DOMAINS = ['secretxperience.store']

/** The storefront's previous domain. Every path on it redirects to the same path on .store. */
const LEGACY_SHOP_DOMAINS = ['secretxperience.shop']

function bareHost(host: string): string {
  return host.split(':')[0].trim().toLowerCase().replace(/^www\./, '')
}

/**
 * True when a hostname belongs to this platform on any of its domains.
 * Used by the referrer/attribution logic so a visitor crossing between our own
 * domains is not booked as an external referral.
 */
export function isOwnHost(host: string | null | undefined): boolean {
  if (!host) return false
  const bare = bareHost(host)
  return SITE_HOSTS.some(h => h.replace(/^www\./, '') === bare)
}

/** True for a marketplace mirror — a host that should canonicalise to .eu. */
export function isMirrorHost(host: string | null | undefined): boolean {
  if (!host) return false
  return MIRROR_DOMAINS.includes(bareHost(host))
}

/** True for the standalone storefront domain. */
export function isShopHost(host: string | null | undefined): boolean {
  if (!host) return false
  return SHOP_DOMAINS.includes(bareHost(host))
}

/** True for the retired .shop domain, which only redirects to .store. */
export function isLegacyShopHost(host: string | null | undefined): boolean {
  if (!host) return false
  return LEGACY_SHOP_DOMAINS.includes(bareHost(host))
}

/**
 * Where a product lives, per host. On the storefront the shop IS the site, so
 * products sit at /p/<id>; on the marketplace they stay under /shop/<id>.
 */
export function productPath(id: string, onShopHost: boolean): string {
  return onShopHost ? `/p/${id}` : `/shop/${id}`
}

/** Absolute canonical URL for shop content, which always lives on the storefront. */
export function shopCanonical(path: '/' | `/p/${string}` | string = '/'): string {
  return `${SHOP_ORIGIN}${path === '/' ? '' : path}` || SHOP_ORIGIN
}
