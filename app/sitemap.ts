import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const BASE = 'https://www.secretxperience.eu'

const CITIES = ['brussels', 'antwerp', 'ghent', 'grimbergen', 'leuven', 'mechelen', 'hasselt', 'namur', 'charleroi', 'kortrijk', 'ostend', 'amsterdam', 'rotterdam', 'berlin', 'hamburg', 'paris', 'lyon', 'luxembourg', 'liege', 'bruges', 'cologne', 'zurich', 'geneva', 'basel', 'bern', 'lausanne']
const COUNTRIES = ['belgium', 'netherlands', 'germany', 'france', 'luxembourg', 'switzerland']
const CITY_CATEGORIES = ['escorts', 'private-reception', 'nightlife', 'hotels', 'rentals']
const COUNTRY_CATEGORIES = ['escorts', 'private-reception']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static + city routes never depend on the DB — always emitted even if Supabase fails.
  const staticRoutes = ['/', '/events', '/advertise', '/search', '/discover', '/live', '/nightlife', '/venues', '/terms', '/privacy', '/login', '/partners', '/creator-platforms', '/regulations', '/medical', '/refer', '/creators', '/shop', '/how-it-works', '/why-secretxperience'].map(path => ({ url: BASE + path, lastModified: new Date(), changeFrequency: path === '/' ? 'daily' as const : 'weekly' as const, priority: path === '/' ? 1 : path === '/why-secretxperience' ? 0.95 : ['/search', '/discover', '/nightlife', '/events', '/advertise', '/regulations', '/medical'].includes(path) ? 0.8 : 0.7 }))
  const categoryRoutes = ['escorts', 'private-reception', 'companionship', 'nightlife', 'creators', 'rentals', 'hotels', 'shop', 'events'].map(cat => ({ url: `${BASE}/${cat}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 }))
  const cityRoutes = CITY_CATEGORIES.flatMap(cat => CITIES.map(city => ({ url: `${BASE}/${cat}/${city}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.85 })))
  const countryRoutes = COUNTRY_CATEGORIES.flatMap(cat => COUNTRIES.map(country => ({ url: `${BASE}/${cat}/${country}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 })))

  // DB-backed routes are best-effort — a Supabase error must never 500 the whole sitemap.
  let listingRoutes: MetadataRoute.Sitemap = []
  let profileRoutes: MetadataRoute.Sitemap = []
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const [{ data: listings }, { data: profiles }, { data: events }] = await Promise.all([
      supabase.from('listings').select('id, created_at').eq('active', true),
      supabase.from('profiles').select('id, created_at').neq('role', 'user'),
      supabase.from('events').select('slug, created_at').eq('active', true),
    ])
    listingRoutes = (listings || []).map(l => ({ url: `${BASE}/listings/${l.id}`, lastModified: new Date(l.created_at), changeFrequency: 'weekly' as const, priority: 0.8 }))
    profileRoutes = (profiles || []).map(p => ({ url: `${BASE}/profile/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: 'weekly' as const, priority: 0.7 }))
    eventRoutes = (events || []).map(e => ({ url: `${BASE}/events/${e.slug}`, lastModified: new Date(e.created_at), changeFrequency: 'weekly' as const, priority: 0.75 }))
  } catch {
    // Swallow — static/category/city routes still ship so Google always gets a valid sitemap.
  }

  return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...countryRoutes, ...listingRoutes, ...profileRoutes, ...eventRoutes]
}
