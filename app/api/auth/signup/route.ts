import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '../../../lib/ratelimit'
import { siteUrl } from '../../../lib/site'
import { MAIL_FROM, MAIL_REPLY_TO } from '../../../lib/mail-from'

const SITE = siteUrl()

function advertiserWelcomeHtml(name: string) {
  const hi = name ? `Welcome, ${name} —` : 'Welcome —'
  return `
<div style="background:#080612;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#110d1c;border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;">
    <div style="height:3px;background:linear-gradient(90deg,transparent,#c5a05a,#e7c87f,#c5a05a,transparent);"></div>
    <div style="padding:34px 36px 8px;">
      <div style="font-size:24px;font-weight:600;letter-spacing:0.02em;color:#c5a05a;font-family:Georgia,'Cormorant Garamond',serif;">SecretXperience</div>
    </div>
    <div style="padding:14px 36px 8px;">
      <h1 style="font-size:23px;font-weight:400;color:#ece8e1;margin:0 0 14px;font-family:Georgia,serif;">${hi} let's get you seen.</h1>
      <p style="font-size:14px;line-height:1.7;color:rgba(236,232,225,0.65);margin:0 0 26px;">
        You're now part of a premium marketplace built for discretion, safety and reach across Belgium, the Netherlands, Germany, France &amp; Luxembourg. Three quick steps and you're live.
      </p>
    </div>
    <div style="padding:0 36px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td width="34" valign="top"><div style="width:26px;height:26px;border-radius:50%;background:#c5a05a;color:#080612;font-weight:700;font-size:13px;text-align:center;line-height:26px;">1</div></td>
          <td valign="top" style="padding-bottom:18px;">
            <div style="font-size:15px;color:#ece8e1;font-weight:600;margin-bottom:3px;">Create your advertisement — free, forever</div>
            <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.55);">A basic listing stays live permanently. No daily re-listing, no expiry.</div>
          </td>
        </tr>
        <tr>
          <td width="34" valign="top"><div style="width:26px;height:26px;border-radius:50%;background:#c5a05a;color:#080612;font-weight:700;font-size:13px;text-align:center;line-height:26px;">2</div></td>
          <td valign="top" style="padding-bottom:18px;">
            <div style="font-size:15px;color:#ece8e1;font-weight:600;margin-bottom:3px;">Verify your identity</div>
            <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.55);">Verified advertisers get a trust badge and noticeably more enquiries.</div>
          </td>
        </tr>
        <tr>
          <td width="34" valign="top"><div style="width:26px;height:26px;border-radius:50%;background:#c5a05a;color:#080612;font-weight:700;font-size:13px;text-align:center;line-height:26px;">3</div></td>
          <td valign="top" style="padding-bottom:6px;">
            <div style="font-size:15px;color:#ece8e1;font-weight:600;margin-bottom:3px;">Get to the top</div>
            <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.55);">Feature your advertisement for 7 or 30 days to lead the grid and homepage slider.</div>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding:18px 36px 8px;text-align:center;">
      <a href="${SITE}/listings/create" style="display:inline-block;background:linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d);color:#1a1206;text-decoration:none;font-weight:700;font-size:15px;padding:14px 34px;border-radius:10px;">Create my listing →</a>
    </div>
    <div style="margin:24px 36px;padding:18px 20px;background:rgba(197,160,90,0.07);border:1px solid rgba(197,160,90,0.2);border-radius:12px;">
      <div style="font-size:14px;color:#c5a05a;font-weight:600;margin-bottom:4px;">Invite advertisers, earn featured credit</div>
      <div style="font-size:13px;line-height:1.6;color:rgba(236,232,225,0.6);">Share your referral link — when someone you invite publishes their first listing, you're rewarded automatically. <a href="${SITE}/refer" style="color:#c5a05a;">Get your link →</a></div>
    </div>
    <div style="padding:8px 36px 34px;border-top:1px solid rgba(255,255,255,0.06);margin-top:8px;">
      <p style="font-size:12px;line-height:1.6;color:rgba(236,232,225,0.35);margin:18px 0 0;">
        Questions? Just reply to this email — we read every message.<br/>
        SecretXperience.eu · Adults only (18+) · You can unsubscribe anytime.
      </p>
    </div>
  </div>
</div>`
}

function memberWelcomeHtml(name: string) {
  const hi = name ? `Welcome in, ${name}.` : 'Welcome in.'
  return `
<div style="background:#050309;padding:36px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#0e0a17;border:1px solid rgba(197,160,90,0.18);border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
    <div style="height:3px;background:linear-gradient(90deg,transparent,#c5a05a,#e7c87f,#c5a05a,transparent);"></div>
    <div style="padding:40px 40px 0;text-align:center;">
      <div style="font-family:Georgia,'Cormorant Garamond',serif;font-size:27px;font-weight:600;letter-spacing:0.04em;color:#c5a05a;">SecretXperience</div>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:rgba(236,232,225,0.45);margin-top:8px;letter-spacing:0.02em;">An evening that ends behind a closed door.</div>
    </div>
    <div style="padding:30px 40px 6px;text-align:center;">
      <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:400;color:#f2ede4;margin:0 0 16px;line-height:1.2;">${hi}</h1>
      <p style="font-size:14.5px;line-height:1.75;color:rgba(236,232,225,0.7);margin:0 auto;max-width:400px;">
        You've stepped into a private world — a curated marketplace of remarkable companions and unforgettable evenings across Belgium, the Netherlands, Germany, France &amp; Luxembourg. We're genuinely glad you're here.
      </p>
    </div>
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
    <div style="padding:26px 40px 10px;text-align:center;">
      <a href="${SITE}/discover" style="display:inline-block;background:linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d);color:#1a1206;text-decoration:none;font-weight:700;font-size:15px;padding:15px 40px;border-radius:11px;letter-spacing:0.02em;">Begin exploring →</a>
      <div style="font-size:12px;color:rgba(236,232,225,0.4);margin-top:14px;">Browse verified advertisers, save your favourites, and book with confidence.</div>
    </div>
    <div style="padding:22px 40px 34px;margin-top:14px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="font-size:11.5px;line-height:1.7;color:rgba(236,232,225,0.32);margin:0;">
        Sent with discretion by SecretXperience · Adults only (18+)<br/>
        You're receiving this because you created an account. Reply STOP to unsubscribe anytime.
      </p>
    </div>
  </div>
</div>`
}

async function sendWelcomeEmail(email: string, name: string, role: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[welcome-email] RESEND_API_KEY not set — skipping welcome email for', email)
    return
  }
  const isAdvertiser = ['provider', 'venue', 'creator'].includes(role)
  const subject = isAdvertiser
    ? 'Welcome to SecretXperience — let\'s get your first listing live'
    : 'Welcome in — your invitation to SecretXperience'
  const html = isAdvertiser ? advertiserWelcomeHtml(name) : memberWelcomeHtml(name)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: MAIL_FROM, reply_to: MAIL_REPLY_TO, to: [email], subject, html }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[welcome-email] Resend returned ${res.status} for ${email}:`, body)
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = rateLimit(ip, 'signup', 5, 60_000)
  if (!allowed) return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 })
  try {
    const { email, password, fullName, role, newsletter, ref } = await request.json()

    const VALID_ROLES = ['client', 'provider', 'user', 'venue', 'creator']
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    if (typeof password === 'string' && password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: created, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName || '', role },
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const newUserId = created?.user?.id

    // Guarantee the profile row carries the chosen role — the auth trigger
    // creates the row but may not copy role from user_metadata.
    if (newUserId) {
      try {
        await supabase.from('profiles').upsert(
          { id: newUserId, email: email.toLowerCase().trim(), full_name: fullName || null, role },
          { onConflict: 'id' }
        )
      } catch { /* trigger-created row still exists; don't block signup */ }
    }

    // Referral attribution — record a pending conversion against the referrer.
    // The reward fires later via DB trigger when this user publishes a listing.
    if (ref && typeof ref === 'string' && newUserId) {
      try {
        const { data: rc } = await supabase
          .from('referral_codes')
          .select('user_id')
          .eq('code', ref.trim().toUpperCase())
          .maybeSingle()
        if (rc?.user_id && rc.user_id !== newUserId) {
          await supabase.from('referrals').insert({
            referrer_id: rc.user_id,
            referred_id: newUserId,
            referred_email: email.toLowerCase().trim(),
            status: 'pending',
          })
        }
      } catch { /* never block signup on referral attribution */ }
    }

    // Signup attribution — record which directory / ad network drove this signup.
    // First-touch UTM data is captured client-side into the sx_attribution cookie.
    if (newUserId) {
      try {
        const raw = request.cookies.get('sx_attribution')?.value
        if (raw) {
          const a = JSON.parse(decodeURIComponent(raw))
          await supabase.from('signup_sources').insert({
            user_id: newUserId,
            email: email.toLowerCase().trim(),
            utm_source: a.utm_source || null,
            utm_medium: a.utm_medium || null,
            utm_campaign: a.utm_campaign || null,
            utm_term: a.utm_term || null,
            utm_content: a.utm_content || null,
            landing_page: a.landing_page || null,
            referrer: a.referrer || null,
          })
        }
      } catch { /* never block signup on attribution */ }
    }

    // Newsletter opt-in
    if (newsletter) {
      supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.toLowerCase().trim(), subscribed_at: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true })
        .then(() => {}, () => {})
    }

    // Fire-and-forget — don't block signup on email delivery
    sendWelcomeEmail(email, fullName || '', role).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[signup] unexpected error:', err?.message)
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }
}
