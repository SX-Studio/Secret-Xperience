/**
 * The platform is served from more than one domain.
 *
 *   secretxperience.eu   canonical home of the marketplace
 *   secretxperience.nl   full mirror of the marketplace, canonicalised to .eu
 *   secretxperience.shop standalone storefront — canonical home of shop content
 *
 * The .nl mirror and the .shop storefront are NOT the same kind of thing and
 * must not be conflated:
 *
 * - A mirror serves byte-identical content and points every canonical at its
 *   .eu twin, so Google indexes one copy.
 * - The storefront serves ONLY the shop, owns the canonical for shop content
 *   (so /shop on the marketplace points at it, not the other way round), and
 *   deliberately carries no navigation into the adult marketplace. That
 *   separation is the point of the domain: a payment processor reviewing
 *   secretxperience.shop must see an e-commerce site, not one click of an
 *   escort directory. See docs/data-handling-policy.md.
 */
export const CANONICAL_HOST = 'www.secretxperience.eu'
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`

/** Canonical origin for shop content. Apex, not www — set apex as the primary domain in Vercel. */
export const SHOP_HOST = 'secretxperience.shop'
export const SHOP_ORIGIN = `https://${SHOP_HOST}`

/** Every hostname that serves this platform, in any of its forms. */
export const SITE_HOSTS = [
  'secretxperience.eu',
  'www.secretxperience.eu',
  'secretxperience.nl',
  'www.secretxperience.nl',
  'secretxperience.shop',
  'www.secretxperience.shop',
] as const

/** Registrable domains that mirror the marketplace and canonicalise to .eu. */
const MIRROR_DOMAINS = ['secretxperience.nl']

/** Registrable domains that serve the standalone storefront. */
const SHOP_DOMAINS = ['secretxperience.shop']

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
