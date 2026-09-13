import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MAIL_FROM, MAIL_REPLY_TO } from '../../../lib/mail-from'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { subject, html } = await req.json()
  if (!subject || !html) return NextResponse.json({ error: 'Missing subject or html' }, { status: 400 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: subscribers } = await admin
    .from('newsletter_subscribers')
    .select('email')
    .limit(500)

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })

  // Resend batch endpoint (max 100 per call)
  const emails = subscribers.map((s: any) => s.email)
  const BATCH = 100
  let sent = 0

  for (let i = 0; i < emails.length; i += BATCH) {
    const chunk = emails.slice(i, i + BATCH)
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(
        chunk.map((to: string) => ({
          from: MAIL_FROM, reply_to: MAIL_REPLY_TO,
          to,
          subject,
          html,
        }))
      ),
    })
    if (res.ok) sent += chunk.length
  }

  return NextResponse.json({ sent })
}
