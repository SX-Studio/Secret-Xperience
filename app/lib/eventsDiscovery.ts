/**
 * Events discovery agent.
 *
 * One call = one city: Claude searches the web for upcoming adult / lifestyle
 * events there and returns rows shaped exactly like public.events. Rows are
 * inserted as active=false, status='pending' so an admin approves them in
 * Admin → Events before they appear on /events. Slug (title+city+date) is the
 * dedupe key, so re-running a city never duplicates an event, and a rejected
 * event stays rejected because its slug already exists.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

export type DiscoveryTarget = { city: string; country: string; country_code: string }

// Same markets the events page filters on (Belgium, Netherlands, Germany, UK,
// Spain, Switzerland + France, which already has seeded events). Order is only
// the initial rotation; the cron picks whichever city was scanned least recently.
export const DISCOVERY_TARGETS: DiscoveryTarget[] = [
  { city: 'Brussels',   country: 'Belgium',        country_code: 'BE' },
  { city: 'Antwerp',    country: 'Belgium',        country_code: 'BE' },
  { city: 'Ghent',      country: 'Belgium',        country_code: 'BE' },
  { city: 'Amsterdam',  country: 'Netherlands',    country_code: 'NL' },
  { city: 'Rotterdam',  country: 'Netherlands',    country_code: 'NL' },
  { city: 'Berlin',     country: 'Germany',        country_code: 'DE' },
  { city: 'Cologne',    country: 'Germany',        country_code: 'DE' },
  { city: 'Hamburg',    country: 'Germany',        country_code: 'DE' },
  { city: 'Paris',      country: 'France',         country_code: 'FR' },
  { city: 'London',     country: 'United Kingdom', country_code: 'GB' },
  { city: 'Barcelona',  country: 'Spain',          country_code: 'ES' },
  { city: 'Zurich',     country: 'Switzerland',    country_code: 'CH' },
]

export const EVENT_CATEGORIES = ['fetish', 'nightlife', 'lifestyle', 'wellness', 'expo'] as const
const RECURRING = ['one-time', 'weekly', 'monthly', 'quarterly', 'yearly'] as const

export type DiscoveredEvent = {
  slug: string; title: string; description: string; category: string
  venue_name: string | null; address: string | null; city: string; country: string; country_code: string
  date_start: string; date_end: string | null; time_start: string | null
  price_from: number; price_currency: string; website: string | null; image_url: string | null
  recurring: string; tags: string[]; source: 'discovery'; source_url: string | null
  discovered_at: string; status: 'pending'; active: false; featured: false; verified: false
}

export function discoveryConfigured() {
  return !!process.env.ANTHROPIC_API_KEY
}

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

const SYSTEM = `You research upcoming adult, fetish, swinger/lifestyle, LGBTQ+ nightlife, erotic-fair and tantra/wellness events for SecretXperience.eu, a European adult-lifestyle events guide.

Rules:
- Only report events you actually found on the web with a date in the future. Never invent events, venues, dates or prices. If unsure about a field, use null.
- Prefer the organiser's or venue's own page (or the ticket shop) as "website" — that is the "Buy tickets" link. Use "source_url" for the page where you found the event.
- "price_from": the cheapest regular ticket in whole euros (0 = free entry). null if unknown.
- "category" must be one of: fetish, nightlife, lifestyle, wellness, expo. Swinger/couples/sex-positive club nights are "lifestyle"; BDSM/kink/fetish/leather are "fetish"; erotic fairs and trade shows are "expo"; tantra/sensual workshops are "wellness"; general adult club nights/strip/burlesque are "nightlife".
- "tags": short lowercase tags such as private-party, swingers, couples, bdsm, fetish, leather, lgbtq, tantra, burlesque, expo, festival, 18+.
- "recurring": one-time, weekly, monthly, quarterly or yearly.
- Dates as YYYY-MM-DD, time_start as HH:MM (24h) or null. Description: 1–2 factual English sentences.
- Respond with ONLY a JSON array (no prose, no markdown fences). Empty array if nothing qualifies.`

function userPrompt(t: DiscoveryTarget, today: string) {
  return `Today is ${today}. Find upcoming events in ${t.city}, ${t.country} in the next 90 days (fetish/BDSM parties, swinger & lifestyle club nights, erotic fairs/expos, LGBTQ+ adult nightlife, tantra/sensual-wellness evenings). Search a few sources (organiser sites, venue agendas, ticket shops, event listings). Return up to 15 events as a JSON array of objects with exactly these keys:
{"title","description","category","tags","venue_name","address","date_start","date_end","time_start","price_from","website","source_url","recurring","image_url"}
Set "city" implicitly to ${t.city}; do not include events in other cities.`
}

function textOf(content: any[]): string {
  return content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n')
}

function cleanUrl(u: unknown): string | null {
  if (typeof u !== 'string') return null
  const s = u.trim()
  return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s.slice(0, 500) : null
}

function cleanDate(d: unknown): string | null {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  return isNaN(Date.parse(d)) ? null : d
}

export function normalise(raw: any, t: DiscoveryTarget, today: string): DiscoveredEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, 140) : ''
  const date_start = cleanDate(raw.date_start)
  if (!title || !date_start || date_start < today) return null
  const date_end = cleanDate(raw.date_end)
  const category = EVENT_CATEGORIES.includes(raw.category) ? raw.category : 'nightlife'
  const recurring = RECURRING.includes(raw.recurring) ? raw.recurring : 'one-time'
  const price = raw.price_from == null ? 0 : Math.max(0, Math.round(Number(raw.price_from) || 0))
  const tags = Array.isArray(raw.tags) ? raw.tags.filter((x: unknown) => typeof x === 'string').map((x: string) => slugify(x)).filter(Boolean).slice(0, 8) : []
  return {
    slug: slugify(`${title}-${t.city}-${date_start}`),
    title,
    description: typeof raw.description === 'string' ? raw.description.trim().slice(0, 1000) : '',
    category,
    venue_name: typeof raw.venue_name === 'string' ? raw.venue_name.trim().slice(0, 140) || null : null,
    address: typeof raw.address === 'string' ? raw.address.trim().slice(0, 200) || null : null,
    city: t.city, country: t.country, country_code: t.country_code,
    date_start, date_end: date_end && date_end >= date_start ? date_end : null,
    time_start: typeof raw.time_start === 'string' && /^\d{1,2}:\d{2}$/.test(raw.time_start) ? raw.time_start : null,
    price_from: price, price_currency: 'EUR',
    website: cleanUrl(raw.website), image_url: cleanUrl(raw.image_url),
    recurring, tags, source: 'discovery', source_url: cleanUrl(raw.source_url),
    discovered_at: new Date().toISOString(), status: 'pending', active: false, featured: false, verified: false,
  }
}

export function parseArray(text: string): any[] {
  const start = text.indexOf('['), end = text.lastIndexOf(']')
  if (start < 0 || end <= start) return []
  try { const v = JSON.parse(text.slice(start, end + 1)); return Array.isArray(v) ? v : [] } catch { return [] }
}

export type DiscoveryResult = {
  found: number; inserted: number; skipped: number; error: string | null
  usage: { input: number; output: number; searches: number }
}

export async function discoverCity(admin: SupabaseClient, t: DiscoveryTarget): Promise<DiscoveryResult> {
  const today = new Date().toISOString().slice(0, 10)
  const result: DiscoveryResult = { found: 0, inserted: 0, skipped: 0, error: null, usage: { input: 0, output: 0, searches: 0 } }
  if (!discoveryConfigured()) { result.error = 'ANTHROPIC_API_KEY not set'; return result }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 50_000 })
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userPrompt(t, today) }]
  let text = ''
  try {
    // pause_turn: the server-tool turn ran long; push the partial turn back and continue (bounded).
    for (let i = 0; i < 3; i++) {
      const res = await client.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 6000,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium' },
        system: SYSTEM,
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 6 }],
        messages,
      } as any)
      result.usage.input += res.usage.input_tokens
      result.usage.output += res.usage.output_tokens
      result.usage.searches += (res.usage as any).server_tool_use?.web_search_requests ?? 0
      if (res.stop_reason === 'refusal') { result.error = 'Model declined the request'; return result }
      if (res.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: res.content as any }); continue }
      text = textOf(res.content)
      break
    }
  } catch (e: any) {
    result.error = e instanceof Anthropic.APIError ? `Anthropic ${e.status}: ${e.message}` : (e?.message || 'Discovery failed')
    return result
  }

  const rows = parseArray(text).map(r => normalise(r, t, today)).filter((r): r is DiscoveredEvent => !!r)
  result.found = rows.length
  if (!rows.length) return result

  // Dedupe inside the batch, then skip slugs already in the table (approved, pending or rejected).
  const bySlug = new Map(rows.map(r => [r.slug, r]))
  const { data: existing } = await admin.from('events').select('slug').in('slug', [...bySlug.keys()])
  for (const e of existing ?? []) bySlug.delete(e.slug)
  const fresh = [...bySlug.values()]
  result.skipped = result.found - fresh.length
  if (!fresh.length) return result

  const { error } = await admin.from('events').upsert(fresh, { onConflict: 'slug', ignoreDuplicates: true })
  if (error) { result.error = error.message; return result }
  result.inserted = fresh.length
  return result
}

/** The target scanned least recently (never-scanned cities first, in list order). */
export async function nextTarget(admin: SupabaseClient): Promise<DiscoveryTarget> {
  const { data } = await admin.from('event_discovery_runs').select('city, started_at').order('started_at', { ascending: false }).limit(500)
  const last = new Map<string, string>()
  for (const r of data ?? []) if (!last.has(r.city)) last.set(r.city, r.started_at)
  const never = DISCOVERY_TARGETS.find(t => !last.has(t.city))
  if (never) return never
  return [...DISCOVERY_TARGETS].sort((a, b) => (last.get(a.city)! < last.get(b.city)! ? -1 : 1))[0]
}

export async function runDiscovery(admin: SupabaseClient, t: DiscoveryTarget, trigger: 'cron' | 'manual') {
  const started = new Date().toISOString()
  const { data: run } = await admin.from('event_discovery_runs')
    .insert({ city: t.city, country: t.country, trigger, started_at: started }).select('id').single()
  const r = await discoverCity(admin, t)
  if (run?.id) {
    await admin.from('event_discovery_runs').update({
      finished_at: new Date().toISOString(), found: r.found, inserted: r.inserted, skipped: r.skipped, error: r.error, usage: r.usage,
    }).eq('id', run.id)
  }
  return r
}
