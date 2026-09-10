/**
 * The platform is served from more than one domain. `.eu` is the canonical one;
 * every other entry in SITE_HOSTS is a mirror serving byte-identical content
 * from the same Vercel deployment and the same Supabase project.
 *
 * Mirrors must never be indexed in their own right, or Google sees the whole
 * catalogue twice and splits the ranking signal between the two domains. The
 * middleware emits a `Link: rel="canonical"` header pointing at the .eu twin
 * on every mirror response, which is why mirrors stay crawlable rather than
 * being blocked in robots.txt — a blocked page can't be read, so its canonical
 * would never be seen either.
 */
export const CANONICAL_HOST = 'www.secretxperience.eu'
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`

/** Every hostname that serves this platform, canonical and mirrors alike. */
export const SITE_HOSTS = [
  'secretxperience.eu',
  'www.secretxperience.eu',
  'secretxperience.nl',
  'www.secretxperience.nl',
] as const

/** Registrable domains of the mirrors — everything that is not the .eu original. */
const MIRROR_DOMAINS = ['secretxperience.nl']

function bareHost(host: string): string {
  return host.split(':')[0].trim().toLowerCase().replace(/^www\./, '')
}

/**
 * True when a hostname belongs to this platform on any of its domains.
 * Used by the referrer/attribution logic so a visitor crossing from .nl to .eu
 * is not booked as an external referral.
 */
export function isOwnHost(host: string | null | undefined): boolean {
  if (!host) return false
  const bare = bareHost(host)
  return SITE_HOSTS.some(h => h.replace(/^www\./, '') === bare)
}

/** True for a mirror domain — i.e. a host that should canonicalise to .eu. */
export function isMirrorHost(host: string | null | undefined): boolean {
  if (!host) return false
  return MIRROR_DOMAINS.includes(bareHost(host))
}
