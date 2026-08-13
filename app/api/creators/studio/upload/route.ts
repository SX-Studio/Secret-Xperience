/**
 * Creator Studio media upload.
 * POST multipart/form-data { file, target: 'avatar'|'cover'|'content' }
 *   → uploads to the public `listings` bucket, returns { url }.
 *   For avatar/cover, also writes the URL onto the profile.
 *
 * Size is capped at 4.5MB (Vercel body limit). Larger content media should use a
 * direct-to-storage flow; this route covers profile art and standard photos.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const MAX = 4.5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = session.user.id

  let form: FormData
  try { form = await req.formData() } catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }) }

  const file = form.get('file')
  const target = String(form.get('target') || 'content')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX) return NextResponse.json({ error: 'File is too large (max 4.5MB).' }, { status: 413 })

  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  if (!isImage && !isVideo) return NextResponse.json({ error: 'Only image or video files are allowed.' }, { status: 400 })
  if ((target === 'avatar' || target === 'cover') && !isImage) return NextResponse.json({ error: 'Profile art must be an image.' }, { status: 400 })

  const ext = (file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg'
  const safeTarget = ['avatar', 'cover', 'content'].includes(target) ? target : 'content'
  const path = `creator-studio/${uid}/${safeTarget}-${Date.now()}.${ext}`

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const buf = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await admin.storage.from('listings').upload(path, buf, { contentType: file.type, upsert: true })
  if (upErr) { console.error('[studio/upload]', upErr.message); return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 }) }

  const url = admin.storage.from('listings').getPublicUrl(path).data.publicUrl

  if (safeTarget === 'avatar') await admin.from('profiles').update({ avatar_url: url }).eq('id', uid)
  else if (safeTarget === 'cover') await admin.from('profiles').update({ cover_url: url }).eq('id', uid)

  return NextResponse.json({ ok: true, url, type: isVideo ? 'video' : 'image' })
}
