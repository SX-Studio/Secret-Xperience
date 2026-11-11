import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { siteUrl } from '../../../lib/site'
import { MAIL_FROM, MAIL_REPLY_TO } from '../../../lib/mail-from'

const SITE = siteUrl()

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verify caller is admin
  const { data: profile } = await admin.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { listing_id, action } = await req.json()
  if (!listing_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Fetch listing + owner email
  const { data: listing } = await admin
    .from('listings')
    .select('id, title, profile_id, profiles(full_name, email)')
    .eq('id', listing_id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  // Apply the moderation decision
  const { error: modErr } = await admin.from('listings').update({
    active: action === 'approve',
    status: action === 'approve' ? 'approved' : 'rejected',
  }).eq('id', listing_id)
  if (modErr) {
    console.error('[listing-moderation] update failed:', modErr.message)
    return NextResponse.json({ error: 'Failed to update listing status.' }, { status: 500 })
  }

  const ownerEmail = (listing as any).profiles?.email
  const ownerName  = (listing as any).profiles?.full_name || 'there'

  if (ownerEmail && process.env.RESEND_API_KEY) {
    const isApproved = action === 'approve'
    const subject = isApproved
      ? `✓ Your listing "${listing.title}" is now live`
      : `Update on your listing "${listing.title}"`
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{margin:0;padding:0;background:#080808;font-family:'Poppins',Arial,sans-serif;color:#e8e0d0}
      .wrap{max-width:560px;margin:40px auto;padding:0 24px}
      .brand{font-size:20px;font-weight:600;color:#e8e0d0;letter-spacing:0.04em;margin-bottom:28px}
      .brand span{color:#c5a05a}
      h1{font-size:26px;font-weight:400;color:${isApproved ? '#3ecf8e' : '#e07070'};margin:0 0 14px;font-family:Georgia,serif}
      p{font-size:14px;line-height:1.7;color:#888;margin:0 0 18px}
      .btn{display:inline-block;background:linear-gradient(135deg,#c5a05a,#a07840);color:#000;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.06em}
      .footer{margin-top:40px;font-size:11px;color:#444;border-top:0.5px solid #1a1a1a;padding-top:16px}
    </style></head><body><div class="wrap">
      <div class="brand">Secret<span>Xperience</span></div>
      <h1>${isApproved ? '✓ Your advertisement is live' : 'Listing update'}</h1>
      <p>Hi ${ownerName},</p>
      ${isApproved
        ? `<p>Your listing <strong style="color:#e8e0d0">"${listing.title}"</strong> has been reviewed and approved. It is now visible to members across the platform.</p>
           <a href="${SITE}/listings/${listing.id}" class="btn">View your listing →</a>`
        : `<p>Your listing <strong style="color:#e8e0d0">"${listing.title}"</strong> could not be approved at this time. Please review our <a href="${SITE}/terms" style="color:#c5a05a">listing guidelines</a> and resubmit.</p>
           <a href="${SITE}/dashboard" class="btn">Go to dashboard →</a>`
      }
      <div class="footer">SecretXperience · <a href="${SITE}/terms" style="color:#555;text-decoration:none">Terms</a></div>
    </div></body></html>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM, reply_to: MAIL_REPLY_TO, to: [ownerEmail], subject, html }),
    })
  }

  return NextResponse.json({ ok: true })
}
