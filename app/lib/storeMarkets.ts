/**
 * Which partner shops lead the storefront for each launch market.
 *
 * SecretXperience starts in Belgium, the Netherlands and Luxembourg: Belgian
 * (and Luxembourg) visitors see Willie first, Dutch visitors see EasyToys
 * first, then every other shop in its usual order. Visitors from anywhere
 * else get the Belgian order, since Belgium is the home market.
 */
export type Market = 'BE' | 'NL' | 'LU'

const LEAD_SHOPS: Record<Market, string[]> = {
  BE: ['willie'],
  LU: ['willie'],
  NL: ['easytoys'],
}

const MARKETS: Market[] = ['BE', 'NL', 'LU']

/**
 * Vercel sets x-vercel-ip-country from the visitor's IP. Without it (local
 * runs, other hosts) fall back to the browser's language region (nl-NL → NL).
 */
export function detectMarket(headers: { get(name: string): string | null }): Market {
  const ip = (headers.get('x-vercel-ip-country') || '').toUpperCase()
  if ((MARKETS as string[]).includes(ip)) return ip as Market
  if (ip) return 'BE'
  const lang = headers.get('accept-language') || ''
  const region = lang.match(/^[a-z]{2,3}-([A-Za-z]{2})/)?.[1]?.toUpperCase()
  return region && (MARKETS as string[]).includes(region) ? (region as Market) : 'BE'
}

/** 0 for the market's lead shop(s), 1 for everyone else — use as the first sort key. */
export function shopRank(market: Market, slug: string | null | undefined): number {
  const lead = LEAD_SHOPS[market]
  const i = slug ? lead.indexOf(slug) : -1
  return i === -1 ? lead.length : i
}

/** Stable: lead shops first, everything else keeps its existing order. */
export function leadFirst<T>(market: Market, items: T[], slugOf: (t: T) => string | null | undefined): T[] {
  return items
    .map((t, i) => ({ t, i, r: shopRank(market, slugOf(t)) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(x => x.t)
}
