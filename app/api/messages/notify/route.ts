import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { siteUrl } from '../../../lib/site'
import { MAIL_FROM, MAIL_REPLY_TO } from '../../../lib/mail-from'

const SITE = siteUrl()

export async function POST(req: NextRequest) {
  const { receiver_id, sender_id, sender_name, listing_title, listing_id } = await req.json()
  if (!receiver_id) return NextResponse.json({ ok: false })

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ ok: false })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Fetch receiver email
  const { data: profile } = await admin.from('profiles').select('email, full_name').eq('id', receiver_id).single()
  if (!profile?.email) return NextResponse.json({ ok: false })

  // Throttle: only email once per conversation per 10 minutes
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const throttleQuery = admin.from('messages').select('id', { count: 'exact', head: true })
    .eq('receiver_id', receiver_id).gte('created_at', since)
  const { count } = sender_id
    ? await throttleQuery.eq('sender_id', sender_id)
    : await throttleQuery
  if ((count ?? 0) > 1) return NextResponse.json({ ok: false }) // already notified recently

  const subject = sender_name
    ? `New message from ${sender_name}`
    : 'You have a new message on SecretXperience'

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:0;background:#080808;font-family:'Poppins',Arial,sans-serif;color:#e8e0d0}
    .wrap{max-width:560px;margin:40px auto;padding:0 24px}
    .brand{font-size:20px;font-weight:600;color:#e8e0d0;letter-spacing:0.04em;margin-bottom:28px}
    .brand span{color:#c5a05a}
    h1{font-size:26px;font-weight:400;color:#e8e0d0;margin:0 0 14px;font-family:Georgia,serif}
    p{font-size:14px;line-height:1.7;color:#888;margin:0 0 18px}
    .btn{display:inline-block;background:linear-gradient(135deg,#c5a05a,#a07840);color:#000;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.06em}
    .footer{margin-top:40px;font-size:11px;color:#444;border-top:0.5px solid #1a1a1a;padding-top:16px}
  </style></head><body><div class="wrap">
    <div class="brand">Secret<span>Xperience</span></div>
    <h1>New message</h1>
    <p>Hi ${profile.full_name || 'there'},</p>
    <p>${sender_name ? `<strong style="color:#e8e0d0">${sender_name}</strong> sent you a message` : 'You have a new message'}${listing_title ? ` regarding <strong style="color:#e8e0d0">${listing_title}</strong>` : ''}.</p>
    <a href="${SITE}/messages" class="btn">Read message →</a>
    <div class="footer">SecretXperience · <a href="${SITE}/privacy" style="color:#555;text-decoration:none">Privacy</a></div>
  </div></body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: MAIL_FROM, reply_to: MAIL_REPLY_TO, to: [profile.email], subject, html }),
  })

  return NextResponse.json({ ok: true })
}
