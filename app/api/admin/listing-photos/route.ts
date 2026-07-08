import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Admin-only: create signed upload URLs for listing photos, then attach the
// uploaded files to a listing's images array. Signed URLs let the browser
// upload straight to Supabase Storage (no Vercel 4.5MB body limit).
export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const body = await req.json()
  const action = body?.action as string
  const listingId = body?.listingId as string
  if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

  const { data: listing } = await admin.from('listings').select('id, title').eq('id', listingId).maybeSingle()
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  if (action === 'sign') {
    const files = (body?.files || []) as { name: string; type: string }[]
    if (!files.length || files.length > 10)
      return NextResponse.json({ error: '1-10 files required' }, { status: 400 })
    if (files.some(f => !f.type?.startsWith('image/')))
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })

    const ts = Date.now()
    const out = []
    for (let i = 0; i < files.length; i++) {
      const safe = files[i].name.replace(/[^a-zA-Z0-9._-]/g, '') || `photo-${i + 1}.jpg`
      const path = `admin-uploads/${listingId}/${ts}-${i + 1}-${safe}`
      const { data, error } = await admin.storage.from('listings').createSignedUploadUrl(path)
      if (error || !data)
        return NextResponse.json({ error: error?.message || 'Could not create upload URL' }, { status: 500 })
      const publicUrl = admin.storage.from('listings').getPublicUrl(path).data.publicUrl
      out.push({ path, token: data.token, publicUrl })
    }
    return NextResponse.json({ ok: true, uploads: out, listingTitle: listing.title })
  }

  if (action === 'attach') {
    const urls = (body?.urls || []) as string[]
    if (!urls.length || urls.length > 10)
      return NextResponse.json({ error: '1-10 urls required' }, { status: 400 })
    const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/`
    if (urls.some(u => !u.startsWith(storageBase)))
      return NextResponse.json({ error: 'urls must point to the listings storage bucket' }, { status: 400 })

    const { error } = await admin.from('listings').update({ images: urls }).eq('id', listingId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, listingId, images: urls, listingTitle: listing.title })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
