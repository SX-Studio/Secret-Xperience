import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '../../lib/ratelimit'
import { MAIL_FROM, MAIL_REPLY_TO } from '../../lib/mail-from'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const memberWelcomeHtml = `
<div style="background:#050309;padding:36px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#0e0a17;border:1px solid rgba(197,160,90,0.18);border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);">

    <!-- gold top accent -->
    <div style="height:3px;background:linear-gradient(90deg,transparent,#c5a05a,#e7c87f,#c5a05a,transparent);"></div>

    <!-- header / brand -->
    <div style="padding:40px 40px 0;text-align:center;">
      <div style="font-family:Georgia,'Cormorant Garamond',serif;font-size:27px;font-weight:600;letter-spacing:0.04em;color:#c5a05a;">SecretXperience</div>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:rgba(236,232,225,0.45);margin-top:8px;letter-spacing:0.02em;">An evening that ends behind a closed door.</div>
    </div>

    <!-- hero -->
    <div style="padding:30px 40px 6px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:400;color:#f2ede4;margin:0 0 16px;line-height:1.2;">Welcome in.</h1>
      <p style="font-size:14.5px;line-height:1.75;color:rgba(236,232,225,0.7);margin:0 auto;max-width:400px;">
        You've stepped into a private world — a curated marketplace of remarkable companions and unforgettable evenings across Belgium, the Netherlands, Germany, France &amp; Luxembourg. We're genuinely glad you're here.
      </p>
    </div>

    <!-- what awaits -->
    <div style="padding:26px 40px 4px;">
      <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c5a05a;text-align:center;margin-bottom:18px;">What awaits you</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td valign="top" style="padding:0 0 16px;">
          <span style="color:#c5a05a;font-size:15px;">✦</span>
          <span style="font-size:14px;color:#ece8e1;font-weight:600;margin-left:8px;">First looks at new arrivals</span>
          <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.55);margin:3px 0 0 23px;">Be the first to discover newly listed companions in your city.</div>
        </td></tr>
        <tr><td valign="top" style="padding:0 0 16px;">
          <span style="color:#c5a05a;font-size:15px;">✦</span>
          <span style="font-size:14px;color:#ece8e1;font-weight:600;margin-left:8px;">Invitations to private events</span>
          <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.55);margin:3px 0 0 23px;">Exclusive evenings and experiences, shared only with members.</div>
        </td></tr>
        <tr><td valign="top" style="padding:0 0 4px;">
          <span style="color:#c5a05a;font-size:15px;">✦</span>
          <span style="font-size:14px;color:#ece8e1;font-weight:600;margin-left:8px;">Quiet, discreet, always yours</span>
          <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.55);margin:3px 0 0 23px;">Delivered with discretion. Your privacy is the point.</div>
        </td></tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="padding:26px 40px 10px;text-align:center;">
      <a href="https://secretxperience.eu/discover" style="display:inline-block;background:linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d);color:#1a1206;text-decoration:none;font-weight:700;font-size:15px;padding:15px 40px;border-radius:11px;letter-spacing:0.02em;">Begin exploring →</a>
      <div style="font-size:12px;color:rgba(236,232,225,0.4);margin-top:14px;">No account needed to browse. When you're ready, we'll be here.</div>
    </div>

    <!-- footer -->
    <div style="padding:22px 40px 34px;margin-top:14px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="font-size:11.5px;line-height:1.7;color:rgba(236,232,225,0.32);margin:0;">
        Sent with discretion by SecretXperience · Adults only (18+)<br/>
        You're receiving this because you joined our list. Reply STOP to unsubscribe anytime.
      </p>
    </div>
  </div>
</div>
`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = rateLimit(ip, 'newsletter', 3, 3_600_000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { email } = await req.json()

  const normalised = typeof email === 'string' ? email.toLowerCase().trim() : ''
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalised)
  if (!normalised || !emailOk) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: normalised, subscribed_at: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    console.error('Newsletter upsert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Send welcome email via Resend if key is configured
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MAIL_FROM, reply_to: MAIL_REPLY_TO,
        to: normalised,
        subject: 'Welcome in — your invitation to SecretXperience',
        html: memberWelcomeHtml,
      }),
    }).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
