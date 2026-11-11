#!/usr/bin/env node
/*
 * Redlights ad-freshness audit — REPORT ONLY. Makes ZERO changes to the database.
 *
 * Why this exists: the ~490 escort listings on SecretXperience were seeded from
 * redlights.be. Over time the source ads get removed or edited on redlights, so
 * ours drift out of date. This tool reconciles the two by phone number (the only
 * field both sides reliably share — our `title` is an ad headline, not the name)
 * and tells you which of our listings are still live on redlights and which have
 * likely disappeared. You decide what to do with the result; nothing is mutated.
 *
 * How it works
 *   1. Load our listings (from Supabase via env, or from a --listings JSON file).
 *   2. Pull redlights' public profile sitemap -> the set of currently-live profiles.
 *   3. Crawl each live profile's PUBLIC page and read the phone from its meta
 *      description (e.g. "Bel voor een afspraakje naar +32465755419."). Results are
 *      cached on disk so re-runs only fetch new/stale profiles. Politeness is built
 *      in (bounded concurrency + delay). No login and no age-gate bypass — every
 *      page fetched is the same public HTML anyone gets.
 *   4. Match our normalized phones against that index and classify each listing:
 *        PRESENT  – phone still found on a live redlights profile
 *        MISSING  – phone not found among live profiles (ad likely removed/expired)
 *        NO_PHONE – our listing has no phone, so it can't be matched
 *   5. Write redlights-audit-<date>.csv and .json and print a summary.
 *
 * Usage
 *   # via Supabase env (SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY):
 *   node scripts/redlights-audit.mjs
 *   # or feed listings from a file (array of {id,title,city,country,contact_phone,active}):
 *   node scripts/redlights-audit.mjs --listings ./listings.json
 *
 * Flags
 *   --listings <file>   Read listings from JSON instead of Supabase.
 *   --limit <n>         Only crawl the first n live profiles (sampling / dry runs).
 *   --concurrency <n>   Parallel profile fetches (default 4).
 *   --delay <ms>        Delay per request slot (default 250).
 *   --refresh-days <n>  Re-fetch cached profiles older than n days (default 7).
 *   --cache <file>      Cache path (default .redlights-cache.json).
 *   --out <dir>         Output directory (default cwd).
 *   --no-crawl          Use only what is already cached (no network to profiles).
 */

import fs from 'node:fs'
import path from 'node:path'

const SITEMAP = 'https://www.redlights.be/sitemap-profiles.xml'
const UA = 'Mozilla/5.0 (compatible; SecretXperience-audit/1.0; internal ad reconciliation)'

// ---- args ----
const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : def
}
const has = (name) => args.includes(name)
const LISTINGS_FILE = opt('--listings', null)
const LIMIT = parseInt(opt('--limit', '0'), 10) || 0
const CONCURRENCY = Math.max(1, parseInt(opt('--concurrency', '4'), 10))
const DELAY = Math.max(0, parseInt(opt('--delay', '250'), 10))
const REFRESH_DAYS = parseFloat(opt('--refresh-days', '7'))
const CACHE_FILE = opt('--cache', '.redlights-cache.json')
const OUT_DIR = opt('--out', process.cwd())
const NO_CRAWL = has('--no-crawl')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const normPhone = (s) => (s || '').replace(/\D/g, '').replace(/^00/, '')

// ---- load our listings ----
async function loadListings() {
  if (LISTINGS_FILE) {
    const arr = JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8'))
    return Array.isArray(arr) ? arr : arr.listings || []
  }
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('No --listings file and no Supabase env (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).')
    process.exit(1)
  }
  const res = await fetch(
    `${url}/rest/v1/listings?select=id,title,city,country,contact_phone,active,created_at&order=created_at.desc`,
    { headers: { apikey: key, authorization: `Bearer ${key}` } }
  )
  if (!res.ok) { console.error('Supabase fetch failed:', res.status, await res.text()); process.exit(1) }
  return res.json()
}

// ---- redlights profile index ----
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) } catch { return {} }
}
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache))
}

async function fetchProfileUrls() {
  const res = await fetch(SITEMAP, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`sitemap ${res.status}`)
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  // one entry per profile; drop sub-pages like /fotoalbums/
  return [...new Set(urls.filter((u) => /\/profiel\/[^/]+\/$/.test(u)))]
}

function parseProfile(html) {
  const title = (html.match(/<title>([^<|]+)/) || [])[1] || ''
  const desc = (html.match(/property="og:description" content="([^"]*)"/) || [])[1] || ''
  const metaPhone = (desc.match(/\+?\d[\d ]{7,}\d/) || [])[0] || ''
  // Collect every number the profile exposes — meta description first, then
  // tel: links, then any international-format number in the body — so a profile
  // that omits the phone from its meta tag still gets indexed (higher recall).
  const cand = []
  if (metaPhone) cand.push(metaPhone)
  for (const m of html.matchAll(/href="tel:([^"]+)"/g)) cand.push(m[1])
  for (const m of html.matchAll(/\+\d{9,14}/g)) cand.push(m[0])
  const phones = [...new Set(cand.map(normPhone).filter((p) => p.length >= 9 && p.length <= 14))]
  // photo filename carries an update timestamp: name-YYYYMMDDhhmmss.jpg
  const ts = [...html.matchAll(/-(\d{14})\.(?:jpg|jpeg|png|webp)/g)].map((m) => m[1]).sort().pop() || ''
  const name = title.replace(/\(.*$/, '').trim()
  const age = (title.match(/\((\d+)\s*jaar/) || [])[1] || ''
  return { name, age, phone: phones[0] || '', phones, photoTs: ts }
}

async function fetchProfile(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } })
    if (res.status === 404 || res.status === 410) return { gone: true }
    if (!res.ok) return { error: res.status }
    return parseProfile(await res.text())
  } catch (e) {
    return { error: String(e.message || e) }
  }
}

async function buildIndex() {
  const cache = loadCache()
  const now = Date.now()
  const fresh = (e) => e && e.fetchedAt && now - e.fetchedAt < REFRESH_DAYS * 864e5

  let urls = []
  try {
    urls = await fetchProfileUrls()
    console.error(`redlights sitemap: ${urls.length} live profiles`)
  } catch (e) {
    console.error('sitemap fetch failed, falling back to cache only:', e.message)
  }
  if (LIMIT) urls = urls.slice(0, LIMIT)

  const liveSet = new Set(urls)
  const toFetch = NO_CRAWL ? [] : urls.filter((u) => !fresh(cache[u]))
  console.error(`to fetch: ${toFetch.length} (cached fresh: ${urls.length - toFetch.length}, no-crawl: ${NO_CRAWL})`)

  let done = 0
  let cursor = 0
  async function worker() {
    while (cursor < toFetch.length) {
      const url = toFetch[cursor++]
      if (DELAY) await sleep(DELAY)
      const info = await fetchProfile(url)
      cache[url] = { ...info, fetchedAt: Date.now() }
      if (++done % 100 === 0) { console.error(`  ${done}/${toFetch.length}`); saveCache(cache) }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  saveCache(cache)

  // phone -> [{url,name,age,photoTs}] for profiles that are still live.
  // Index every number a profile exposes (older cache entries only have .phone).
  const byPhone = new Map()
  for (const [url, e] of Object.entries(cache)) {
    if (!liveSet.has(url) && urls.length) continue // only trust currently-live profiles
    if (!e) continue
    const nums = e.phones && e.phones.length ? e.phones : e.phone ? [e.phone] : []
    for (const p of nums) {
      if (!byPhone.has(p)) byPhone.set(p, [])
      byPhone.get(p).push({ url, name: e.name, age: e.age, photoTs: e.photoTs })
    }
  }
  return { byPhone, liveCount: liveSet.size, cachedCount: Object.keys(cache).length }
}

// ---- report ----
function csvCell(v) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function fmtPhotoTs(ts) {
  if (!ts || ts.length < 8) return ''
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`
}

async function main() {
  const listings = await loadListings()
  console.error(`our listings: ${listings.length}`)
  const { byPhone, liveCount, cachedCount } = await buildIndex()

  const rows = listings.map((l) => {
    const phone = normPhone(l.contact_phone)
    if (!phone) return { ...l, phone, status: 'NO_PHONE', rl_url: '', rl_name: '', rl_photo_date: '' }
    const hits = byPhone.get(phone) || []
    if (!hits.length) return { ...l, phone, status: 'MISSING', rl_url: '', rl_name: '', rl_photo_date: '' }
    const h = hits[0]
    return { ...l, phone, status: 'PRESENT', rl_url: h.url, rl_name: h.name, rl_photo_date: fmtPhotoTs(h.photoTs), rl_matches: hits.length }
  })

  const summary = rows.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {})
  const stamp = new Date().toISOString().slice(0, 10)
  const cols = ['id', 'title', 'city', 'country', 'contact_phone', 'active', 'status', 'rl_url', 'rl_name', 'rl_photo_date']
  const csv = [cols.join(',')]
    .concat(rows.map((r) => cols.map((c) => csvCell(r[c])).join(',')))
    .join('\n')
  const csvPath = path.join(OUT_DIR, `redlights-audit-${stamp}.csv`)
  const jsonPath = path.join(OUT_DIR, `redlights-audit-${stamp}.json`)
  fs.writeFileSync(csvPath, csv)
  fs.writeFileSync(jsonPath, JSON.stringify({ generated: new Date().toISOString(), summary, liveCount, cachedCount, rows }, null, 2))

  console.error('\n=== SUMMARY (no DB changes made) ===')
  console.error(`redlights live profiles indexed: ${liveCount} (cache holds ${cachedCount})`)
  for (const k of ['PRESENT', 'MISSING', 'NO_PHONE']) console.error(`  ${k}: ${summary[k] || 0}`)
  console.error(`\nreport: ${csvPath}`)
  console.error(`        ${jsonPath}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
