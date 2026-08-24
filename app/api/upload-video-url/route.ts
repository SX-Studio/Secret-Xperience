import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/3gpp', 'video/3gpp2']
const MAX_BYTES = 30 * 1024 * 1024  // 30 MB

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, size, filename } = await req.json().catch(() => ({}))
  if (!contentType || !ALLOWED.includes(contentType))
    return NextResponse.json({ error: 'Unsupported video format (MP4, WebM, MOV).' }, { status: 400 })
  if (size && size > MAX_BYTES)
    return NextResponse.json({ error: 'File exceeds 30 MB limit.' }, { status: 400 })

  const ext = (filename as string | undefined)?.split('.').pop()?.toLowerCase() ?? 'mp4'
  // Use a dedicated 'videos' bucket (no MIME restrictions, 500 MB limit).
  // Path still starts with user id so RLS policy can scope to the owner.
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await admin.storage.from('videos').createSignedUploadUrl(path)
  if (error || !data)
    return NextResponse.json({ error: error?.message || 'Could not create upload URL' }, { status: 500 })

  const publicUrl = admin.storage.from('videos').getPublicUrl(path).data.publicUrl
  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl })
}
