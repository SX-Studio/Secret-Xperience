import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../../lib/ratelimit'

// Service-role client — all community submissions are written here so status is
// always forced to 'pending' regardless of what the client sends.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const str = (v: unknown, max = 2000) =>
  typeof v === 'string' ? v.trim().slice(0, max) : null

const DIRECTORY_CATS = ['swingers', 'fetish', 'nightlife', 'massage', 'brothel', 'strip', 'rental', 'other']
const JOB_CATS = ['escort', 'dancer', 'cam-creator', 'massage', 'hostess', 'domination-fetish', 'agency-staff', 'other']

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = rateLimit(ip, 'community-submit', 6, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const type = body.type
  const email = str(body.contact_email, 200)

  if (type === 'venue') {
    const name = str(body.name, 160)
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    let category = str(body.category, 40) || 'other'
    if (!DIRECTORY_CATS.includes(category)) category = 'other'
    const { error } = await admin.from('directory_listings').insert({
      name,
      category,
      description: str(body.description, 1500),
      city: str(body.city, 80),
      country: str(body.country, 80),
      country_code: str(body.country_code, 4),
      website: str(body.website, 300),
      contact_email: email,
      image_url: str(body.image_url, 400),
      status: 'pending',
    })
    if (error) return NextResponse.json({ error: 'Could not submit right now' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (type === 'job') {
    const title = str(body.title, 160)
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    const kind = body.kind === 'wanted' ? 'wanted' : 'offered'
    let category = str(body.category, 40) || 'other'
    if (!JOB_CATS.includes(category)) category = 'other'
    if (!email && !str(body.contact_phone, 60) && !str(body.website, 300)) {
      return NextResponse.json({ error: 'Add at least one way to be contacted' }, { status: 400 })
    }
    const { error } = await admin.from('job_posts').insert({
      kind,
      title,
      category,
      description: str(body.description, 2000),
      city: str(body.city, 80),
      country: str(body.country, 80),
      country_code: str(body.country_code, 4),
      compensation: str(body.compensation, 160),
      poster_type: str(body.poster_type, 40),
      contact_email: email,
      contact_phone: str(body.contact_phone, 60),
      website: str(body.website, 300),
      status: 'pending',
    })
    if (error) return NextResponse.json({ error: 'Could not submit right now' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown submission type' }, { status: 400 })
}
