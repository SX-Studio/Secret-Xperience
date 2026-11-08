/**
 * Outbound links from the storefront to brands.
 *
 * Every "visit the brand" / "shop this item" link points at /go/b/<slug> or
 * /go/p/<id> on our own domain. That route counts the click and then
 * redirects, so the raw affiliate URL is never the href a shopper sees and a
 * brand can be shown what we sent them.
 */

export type Brandish = {
  slug?: string | null
  affiliate_url?: string | null
  website_url?: string | null
}

/** http(s) only, ASCII hostname — anything else is treated as no link. */
export function safeOutboundUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    if (/[^\x00-\x7F]/.test(u.hostname)) return null
    return u.href
  } catch {
    return null
  }
}

/** Where a brand click lands: the affiliate link when we have one, else the plain site. */
export function brandDestination(b: Brandish | null | undefined): string | null {
  if (!b) return null
  return safeOutboundUrl(b.affiliate_url) || safeOutboundUrl(b.website_url)
}

/** A product's own deep link wins; otherwise the shopper goes to the brand. */
export function productDestination(externalUrl: string | null | undefined, brand: Brandish | null | undefined): string | null {
  return safeOutboundUrl(externalUrl) || brandDestination(brand)
}

export const CLICK_SOURCES = ['home', 'brand', 'product', 'brands'] as const
export type ClickSource = typeof CLICK_SOURCES[number]

export function goBrand(slug: string, source: ClickSource) {
  return `/go/b/${encodeURIComponent(slug)}?s=${source}`
}
export function goProduct(id: string, source: ClickSource) {
  return `/go/p/${encodeURIComponent(id)}?s=${source}`
}

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|curl|wget|python|node-fetch/i
export function looksLikeBot(ua: string | null | undefined): boolean {
  return !ua || BOT_UA.test(ua)
}
