import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { siteUrl as canonicalSiteUrl } from '../../lib/site'
import { MAIL_FROM, MAIL_REPLY_TO } from '../../lib/mail-from'

// Simple email notification via Supabase's built-in SMTP (or logs for now)
// Set RESEND_API_KEY env var to enable real email sending

export async function POST(req: NextRequest) {
  // Verify internal secret to prevent abuse
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.INTERNAL_SECRET || 'sx-internal'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, booking_id } = await req.json()
  if (!booking_id) return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, date, time, duration_hours, total_amount, status, notes,
      listings ( title, category, city ),
      client:profiles!bookings_client_id_fkey ( full_name, email ),
      advertiser:profiles!bookings_provider_id_fkey ( full_name, email )
    `)
    .eq('id', booking_id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const listing = (booking as any).listings
  const client  = (booking as any).client
  const advertiser = (booking as any).advertiser

  // If RESEND_API_KEY is set, send via Resend; otherwise log
  if (process.env.RESEND_API_KEY) {
    const siteUrl = canonicalSiteUrl()
    const emailStyle = `
      body{margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif}
      .wrap{max-width:560px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(197,160,90,0.15)}
      .header{background:linear-gradient(135deg,rgba(197,160,90,0.1),transparent);padding:32px 40px;border-bottom:1px solid rgba(197,160,90,0.1);text-align:center}
      .logo{font-size:22px;color:#c5a05a;letter-spacing:0.06em;font-weight:300}
      .logo em{font-style:italic}
      .body{padding:32px 40px}
      .title{font-size:22px;color:#ece8e1;font-weight:300;margin-bottom:8px;letter-spacing:-0.01em}
      .sub{font-size:14px;color:#8c8880;line-height:1.6;margin-bottom:24px}
      .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;margin-bottom:24px}
      .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
      .row:last-child{border-bottom:none}
      .lbl{font-size:12px;color:#4c4a47;text-transform:uppercase;letter-spacing:0.1em}
      .val{font-size:13px;color:#ece8e1;font-weight:500}
      .btn{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#c5a05a,#a0803d);border-radius:10px;color:#080808;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.04em}
      .footer{padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:11px;color:#4c4a47;line-height:1.6}
    `

    const bookingCard = `
      <div class="card">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:12px;color:#4c4a47;text-transform:uppercase;letter-spacing:0.1em">Service</span></td><td align="right" style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:13px;color:#ece8e1;font-weight:500">${listing?.title || '—'}</span></td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:12px;color:#4c4a47;text-transform:uppercase;letter-spacing:0.1em">Date</span></td><td align="right" style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:13px;color:#ece8e1;font-weight:500">${booking.date}${booking.time ? ' at ' + booking.time : ''}</span></td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:12px;color:#4c4a47;text-transform:uppercase;letter-spacing:0.1em">Duration</span></td><td align="right" style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:13px;color:#ece8e1;font-weight:500">${booking.duration_hours} hour${booking.duration_hours !== 1 ? 's' : ''}</span></td></tr>
          <tr><td style="padding:6px 0"><span style="font-size:12px;color:#4c4a47;text-transform:uppercase;letter-spacing:0.1em">Amount</span></td><td align="right" style="padding:6px 0"><span style="font-size:14px;color:#c5a05a;font-weight:600">€${booking.total_amount}</span></td></tr>
        </table>
      </div>
    `

    const emails = []

    if (type === 'booking_created' && advertiser?.email) {
      emails.push({
        from: MAIL_FROM, reply_to: MAIL_REPLY_TO,
        to: [advertiser.email],
        subject: `New booking request — ${listing?.title}`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyle}</style></head><body>
          <div class="wrap">
            <div class="header"><div class="logo">Secret<em>Xperience</em></div></div>
            <div class="body">
              <div class="title">New booking request</div>
              <div class="sub">Hi ${advertiser?.full_name || 'there'}, <strong style="color:#ece8e1">${client?.full_name || 'A client'}</strong> has requested a booking for your advertisement.</div>
              ${bookingCard}
              ${booking.notes ? `<div style="background:rgba(197,160,90,0.05);border:1px solid rgba(197,160,90,0.15);border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:#8c8880"><strong style="color:#c5a05a;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">Client notes</strong><br>${booking.notes}</div>` : ''}
              <div style="text-align:center"><a href="${siteUrl}/dashboard" class="btn">View in dashboard →</a></div>
            </div>
            <div class="footer">SecretXperience.eu · Adults only (18+)<br>You're receiving this because you have an active listing on SecretXperience.</div>
          </div>
        </body></html>`,
      })
    }

    if (type === 'booking_confirmed' && client?.email) {
      emails.push({
        from: MAIL_FROM, reply_to: MAIL_REPLY_TO,
        to: [client.email],
        subject: `Booking confirmed — ${listing?.title}`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyle}</style></head><body>
          <div class="wrap">
            <div class="header"><div class="logo">Secret<em>Xperience</em></div></div>
            <div class="body">
              <div class="title">Booking confirmed ✓</div>
              <div class="sub">Hi ${client?.full_name || 'there'}, your booking with <strong style="color:#ece8e1">${advertiser?.full_name || listing?.title || 'your advertiser'}</strong> has been confirmed. Payment received.</div>
              ${bookingCard}
              <div style="background:rgba(29,201,160,0.05);border:1px solid rgba(29,201,160,0.15);border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:#1dc9a0">
                ✓ Payment of €${booking.total_amount} received and processed securely.
              </div>
              <div style="text-align:center"><a href="${siteUrl}/dashboard" class="btn">View booking →</a></div>
            </div>
            <div class="footer">SecretXperience.eu · Adults only (18+)<br>All transactions are encrypted and discreet. Your bank statement will show a neutral descriptor.</div>
          </div>
        </body></html>`,
      })
    }

    if (type === 'listing_boosted') {
      // Fetch advertisement details for boost notification
      const { data: boostListing } = await supabase
        .from('listings')
        .select('id, title, featured_until, profile:profiles!profile_id(full_name, email)')
        .eq('id', booking_id)  // reusing booking_id param as listing_id for this type
        .single()
      const boostProfile = (boostListing as any)?.profile
      if (boostProfile?.email) {
        emails.push({
          from: MAIL_FROM, reply_to: MAIL_REPLY_TO,
          to: [boostProfile.email],
          subject: `✦ Your listing is now featured — ${boostListing?.title}`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${emailStyle}</style></head><body>
            <div class="wrap">
              <div class="header"><div class="logo">Secret<em>Xperience</em></div></div>
              <div class="body">
                <div class="title">✦ Listing boosted!</div>
                <div class="sub">Hi ${boostProfile?.full_name || 'there'}, your listing <strong style="color:#ece8e1">${boostListing?.title}</strong> is now featured at the top of search results.</div>
                <div class="card" style="text-align:center;padding:24px">
                  <div style="font-size:32px;margin-bottom:8px">✦</div>
                  <div style="font-size:14px;color:#c5a05a;font-weight:500">Featured until</div>
                  <div style="font-size:18px;color:#ece8e1;margin-top:4px">${boostListing?.featured_until ? new Date(boostListing.featured_until).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}) : '—'}</div>
                </div>
                <div style="text-align:center"><a href="${siteUrl}/dashboard" class="btn">View your advertisement →</a></div>
              </div>
              <div class="footer">SecretXperience.eu · Thank you for boosting your advertisement.</div>
            </div>
          </body></html>`,
        })
      }
    }

    for (const email of emails) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify(email),
      })
    }
  } else {
    // Email service not configured — skip silently (set RESEND_API_KEY to enable)
  }

  return NextResponse.json({ ok: true })
}
